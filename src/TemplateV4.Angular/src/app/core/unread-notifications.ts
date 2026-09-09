import { Injectable, computed, effect, inject, signal, DestroyRef, untracked } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import type { HubConnection } from '@microsoft/signalr';
import { firstValueFrom, Subject } from 'rxjs';
import { Auth } from './auth';
import { Runtime } from './runtime';
import { QUIET_REQUEST } from './interceptors';
import { NotificationSummary } from '../api/models';
@Injectable({ providedIn: 'root' })
export class UnreadNotifications {
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly count = signal(0);
  readonly changes = new Subject<void>();
  private revision = 0;
  private pending = false;
  private failures = 0;
  private nextAt = 0;
  private refreshRequested = false;
  private connection: HubConnection | null = null;
  private connectionGeneration = 0;
  private readonly actor = computed(() =>
    this.auth.access()?.setupRequired ? null : this.auth.access()?.userId,
  );
  constructor() {
    effect(() => {
      const actor = this.actor();
      this.set(0);
      this.nextAt = 0;
      untracked(() => {
        void this.refresh();
        void this.connect(actor);
      });
    });
    const timer = setInterval(() => void this.refresh(), 60000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.connectionGeneration++;
      void this.connection?.stop();
    });
  }
  set(count: number) {
    this.revision++;
    this.count.set(Math.max(0, count));
  }
  private invalidate() {
    this.revision++;
    if (this.pending) this.refreshRequested = true;
    else void this.refresh(true);
  }
  private async connect(actor: string | null | undefined) {
    const generation = ++this.connectionGeneration;
    const previous = this.connection;
    this.connection = null;
    if (previous) await previous.stop();
    if (!actor || generation !== this.connectionGeneration) return;

    const { connectNotifications } = await import('./notification-connection');
    if (generation !== this.connectionGeneration || actor !== this.actor()) return;
    const active = () => generation === this.connectionGeneration && actor === this.actor();
    const connection = await connectNotifications({
      actor,
      url: `${this.runtime.apiUrl}/api/v1/auth/notifications/stream`,
      access: () => this.auth.access(),
      refresh: () => this.auth.refresh(),
      active,
      changed: () => {
        this.invalidate();
        this.changes.next();
      },
    });
    if (active()) this.connection = connection;
    else await connection.stop();
  }
  async refresh(force = false) {
    const actor = this.actor();
    if (
      !actor ||
      this.pending ||
      document.visibilityState !== 'visible' ||
      (!force && Date.now() < this.nextAt)
    )
      return;
    this.pending = true;
    const revision = this.revision;
    try {
      const value = await firstValueFrom(
        this.http.get<NotificationSummary>(
          this.runtime.apiUrl + '/api/v1/auth/notifications/summary',
          { context: new HttpContext().set(QUIET_REQUEST, true) },
        ),
      );
      if (actor === this.actor() && revision === this.revision) this.count.set(value.unread);
      this.failures = 0;
    } catch {
      this.failures = Math.min(this.failures + 1, 4);
    } finally {
      this.pending = false;
      this.nextAt = Date.now() + 60000 * 2 ** this.failures;
      if (this.refreshRequested) {
        this.refreshRequested = false;
        queueMicrotask(() => void this.refresh(true));
      }
    }
  }
}
