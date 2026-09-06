import { Injectable, computed, effect, inject, signal, DestroyRef } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth } from './auth';
import { Runtime } from './runtime';
import { QUIET_REQUEST } from './interceptors';
import { NotificationPage } from '../api/models';
@Injectable({ providedIn: 'root' })
export class UnreadNotifications {
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly count = signal(0);
  private readonly actor = computed(() =>
    this.auth.access()?.setupRequired ? null : this.auth.access()?.userId,
  );
  constructor() {
    effect(() => {
      const actor = this.actor();
      this.count.set(0);
      if (actor) void this.refresh(actor);
    });
    const timer = setInterval(() => {
      const actor = this.actor();
      if (actor && document.visibilityState === 'visible') void this.refresh(actor);
    }, 60000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  private async refresh(actor: string) {
    try {
      const value = await firstValueFrom(
        this.http.get<NotificationPage>(`${this.runtime.apiUrl}/api/v1/auth/notifications`, {
          params: { unreadOnly: true },
          context: new HttpContext().set(QUIET_REQUEST, true),
        }),
      );
      if (this.actor() === actor) this.count.set(value.unread);
    } catch {
      /* A background badge never interrupts the current task. The inbox reports failures. */
    }
  }
}
