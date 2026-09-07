import { Router } from '@angular/router';

import { Component, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { HlmButtonImports } from '@spartan-ng/helm/button';

import { HlmCardImports } from '@spartan-ng/helm/card';

import { HlmEmptyImports } from '@spartan-ng/helm/empty';

import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { HlmAlertImports } from '@spartan-ng/helm/alert';

import { Auth } from '../core/auth';

import { Runtime } from '../core/runtime';

import { I18n, Translate } from '../core/i18n';

import { Confirmations } from '../shared/confirmation';

import { Notifications } from '../core/notifications';

interface Session {
  id: string;

  device: string;

  createdAt: string;

  current: boolean;

  expiresAt: string;
}

@Component({
  selector: 'app-sessions',

  imports: [
    HlmSpinnerImports,

    HlmBadgeImports,

    HlmEmptyImports,

    HlmCardImports,

    HlmButtonImports,

    HlmAlertImports,

    Translate,
  ],

  template: `<h1 class="page-title">{{ 'sessions' | t }}</h1>

    @if (loadState() === 'error') {
      <div hlmAlert variant="destructive" class="mt-6" role="alert">
        <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>

        <button hlmBtn variant="outline" (click)="load()">{{ 'retry' | t }}</button>
      </div>
    } @else {
      <ul class="mt-6 flex flex-col gap-4">
        @for (session of sessions(); track session.id) {
          <li hlmCard class="flex-row items-center justify-between flex-wrap">
            <div hlmCardHeader>
              <div>
                <h2 hlmCardTitle class="break-all">
                  {{ session.device }}

                  @if (session.current) {
                    <span hlmBadge variant="secondary">{{ 'currentSession' | t }}</span>
                  }
                </h2>

                <p hlmCardDescription>
                  {{ i18n.date(session.createdAt) }} · {{ 'expiresAt' | t }}
                  {{ i18n.date(session.expiresAt) }}
                </p>
              </div>
            </div>

            <div hlmCardFooter>
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy()"
                (click)="revoke(session.id, session.current)"
              >
                {{ (session.current ? 'signOutThisDevice' : 'signOutDevice') | t }}
              </button>
            </div>
          </li>
        } @empty {
          <li>
            <div hlmEmpty role="status">
              <div hlmEmptyHeader>
                @if (busy()) {
                  <hlm-spinner />
                }

                <p hlmEmptyTitle>{{ (busy() ? 'loading' : 'noSessions') | t }}</p>
              </div>
            </div>
          </li>
        }
      </ul>
    }`,
})
export class SessionsPage {
  private readonly router = inject(Router);

  private readonly confirm = inject(Confirmations);

  readonly busy = signal(false);

  readonly i18n = inject(I18n);

  private readonly auth = inject(Auth);

  private readonly http = inject(HttpClient);

  private readonly runtime = inject(Runtime);

  private readonly notifications = inject(Notifications);

  readonly sessions = signal<Session[]>([]);

  readonly loadState = signal<'loading' | 'ready' | 'error'>('loading');

  constructor() {
    void this.load();
  }

  async load() {
    this.busy.set(true);

    this.loadState.set('loading');

    try {
      this.sessions.set(
        await firstValueFrom(
          this.http.get<Session[]>(`${this.runtime.apiUrl}/api/v1/auth/sessions`),
        ),
      );

      this.loadState.set('ready');
    } catch {
      this.loadState.set('error');
    } finally {
      this.busy.set(false);
    }
  }

  async revoke(id: string, current: boolean) {
    if (this.busy()) return;

    if (current && !(await this.confirm.ask('signOutThisDevice', 'signOutDeviceHelp'))) return;

    this.busy.set(true);

    try {
      await this.auth.revoke(id);

      this.notifications.success('sessionRevoked');

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
