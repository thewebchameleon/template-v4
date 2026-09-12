import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Auth } from './auth';
import { HttpClient } from '@angular/common/http';
import { Runtime } from './runtime';
import { ProfileResponse } from '../api/models';

@Injectable({ providedIn: 'root' })
export class CurrentProfile {
  readonly value = signal<ProfileResponse | null>(null);
  constructor() {
    const auth = inject(Auth);
    const http = inject(HttpClient);
    const runtime = inject(Runtime);
    const actor = computed(() => auth.access()?.userId);
    effect((cleanup) => {
      const userId = actor();
      this.value.set(null);
      if (!userId) return;
      const subscription = http
        .get<ProfileResponse>(`${runtime.apiUrl}/api/v1/auth/profile`)
        .subscribe({
          next: (profile) => this.value.update((current) => current ?? profile),
          error: () => {
            /* Keep the fallback icon when the photo cannot load. */
          },
        });
      cleanup(() => subscription.unsubscribe());
    });
  }
}
