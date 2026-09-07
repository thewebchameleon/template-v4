import { Injectable, computed, effect, inject, signal, DestroyRef, untracked } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
  private revision = 0;
  private pending = false;
  private failures = 0;
  private nextAt = 0;
  private readonly actor = computed(() =>
    this.auth.access()?.setupRequired ? null : this.auth.access()?.userId,
  );
  constructor() {
    effect(() => {
      this.actor();
      this.set(0);
      this.nextAt = 0;
      untracked(() => void this.refresh());
    });
    const timer = setInterval(() => void this.refresh(), 60000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  set(count: number) {
    this.revision++;
    this.count.set(Math.max(0, count));
  }
  async refresh() {
    const actor = this.actor();
    if (
      !actor ||
      this.pending ||
      document.visibilityState !== 'visible' ||
      Date.now() < this.nextAt
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
    }
  }
}
