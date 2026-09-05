import { Router } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n, Translate } from '../core/i18n';
interface Session {
  id: string;
  device: string;
  createdAt: string;
  current: boolean;
}
@Component({
  selector: 'app-sessions',
  imports: [HlmButtonImports, Translate],
  template: `<h1 class="text-3xl font-semibold">{{ 'sessions' | t }}</h1>
    <ul class="mt-6 flex flex-col gap-4">
      @for (session of sessions(); track session.id) {
        <li
          class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-5"
        >
          <div>
            <p class="break-all">
              {{ session.device }}
              @if (session.current) {
                <strong>{{ 'currentSession' | t }}</strong>
              }
            </p>
            <p class="text-muted-foreground">{{ i18n.date(session.createdAt) }}</p>
          </div>
          <button
            hlmBtn
            variant="outline"
            [disabled]="busy()"
            (click)="revoke(session.id, session.current)"
          >
            {{ 'revoke' | t }}
          </button>
        </li>
      } @empty {
        <li role="status">{{ (busy() ? 'loading' : 'noSessions') | t }}</li>
      }
    </ul>`,
})
export class SessionsPage {
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly i18n = inject(I18n);
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly sessions = signal<Session[]>([]);
  constructor() {
    void this.load();
  }
  async load() {
    this.busy.set(true);
    try {
      this.sessions.set(
        await firstValueFrom(
          this.http.get<Session[]>(`${this.runtime.apiUrl}/api/v1/auth/sessions`),
        ),
      );
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async revoke(id: string, current: boolean) {
    this.busy.set(true);
    try {
      await this.auth.revoke(id);
      if (current) {
        this.auth.access.set(null);
        await this.router.navigateByUrl('/login');
      } else await this.load();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
