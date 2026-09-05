import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { Auth } from '../core/auth';
import { Passkeys } from '../core/passkeys';
import { Runtime } from '../core/runtime';
import { Translate } from '../core/i18n';
import { ProfileResponse } from '../api/models/profile-response';
import { MfaEnrollment } from '../api/models/mfa-enrollment';
import { Notifications } from '../core/notifications';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmAlertImports,
    HlmEmptyImports,
    HlmBadgeImports,
    HlmSpinnerImports,
    HlmSeparatorImports,
    Translate,
  ],
  template: `<h1 class="page-title">{{ 'profile' | t }}</h1>
    @if (profile(); as user) {
      <p class="mt-3 break-words">{{ user.displayName }} · {{ user.email }}</p>
      @if (auth.access()?.setupRequired) {
        <div hlmAlert role="status" class="my-4">
          <p hlmAlertDescription>{{ 'setupRequired' | t }}</p>
        </div>
      }
      <section hlmCard class="mt-6 max-w-(--form-content-width)">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'security' | t }}</h2>
          <p hlmCardDescription>{{ 'securityHelp' | t }}</p>
        </div>
        <div hlmCardContent class="flex flex-col gap-5">
          <p>
            <span hlmBadge variant="secondary">{{
              (user.mfaRequired ? 'mfaRequired' : 'mfaOptional') | t
            }}</span>
            <span hlmBadge variant="outline">{{
              (user.mfaEnabled ? 'authenticatorEnabled' : 'authenticatorDisabled') | t
            }}</span>
          </p>
          <div hlmField>
            <label hlmFieldLabel for="proof-password">{{ 'password' | t }}</label
            ><input
              hlmInput
              id="proof-password"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="password"
            />
          </div>
          @if (user.mfaEnabled) {
            <div hlmField>
              <label hlmFieldLabel for="proof-code">{{ 'factorCode' | t }}</label
              ><input
                hlmInput
                id="proof-code"
                autocomplete="one-time-code"
                [(ngModel)]="proofCode"
              />
              <div hlmField orientation="horizontal">
                <hlm-checkbox inputId="proof-recovery" [(ngModel)]="recovery" />
                <label hlmFieldLabel for="proof-recovery">{{ 'useRecovery' | t }}</label>
              </div>
            </div>
          }
          <div class="flex flex-wrap gap-3">
            @if (!user.mfaEnabled) {
              <button hlmBtn [disabled]="busy() || !password" (click)="enroll()">
                {{ 'enrollAuthenticator' | t }}
              </button>
            } @else {
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy() || !password || !proofCode"
                (click)="manage(false)"
              >
                {{ 'rotateRecovery' | t }}
              </button>
              @if (!user.mfaRequired || user.passkeys.length > 0) {
                <button
                  hlmBtn
                  variant="destructive"
                  [disabled]="busy() || !password || !proofCode"
                  (click)="manage(true)"
                >
                  {{ 'disableMfa' | t }}
                </button>
              }
            }
          </div>
          @if (enrollment(); as setup) {
            <p>{{ 'authenticatorSetupHelp' | t }}</p>
            <code class="break-all select-all">{{ setup.key }}</code>
            <form
              #confirmation="ngForm"
              (ngSubmit)="confirmation.valid && confirm()"
              class="flex flex-col gap-3"
            >
              <div hlmField>
                <label hlmFieldLabel for="enrollment-code">{{ 'factorCode' | t }}</label
                ><input
                  hlmInput
                  id="enrollment-code"
                  name="code"
                  [(ngModel)]="code"
                  autocomplete="one-time-code"
                  inputmode="numeric"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              <button hlmBtn [disabled]="busy() || confirmation.invalid">
                {{ 'confirmFactor' | t }}
              </button>
            </form>
          }
          @if (codes().length) {
            <div hlmAlert role="status">
              <h3 hlmAlertTitle>{{ 'saveRecovery' | t }}</h3>
              <p hlmAlertDescription>{{ 'recoveryHelp' | t }}</p>
              <ul class="grid grid-cols-2 gap-2 mt-3">
                @for (item of codes(); track item) {
                  <li>
                    <code>{{ item }}</code>
                  </li>
                }
              </ul>
              <button hlmBtn variant="outline" class="mt-3" (click)="codes.set([])">
                {{ 'savedRecovery' | t }}
              </button>
            </div>
          }
          <hlm-separator />
          <h3 class="text-xl font-semibold">{{ 'passkeys' | t }}</h3>
          <p>{{ 'passkeysHelp' | t }}</p>
          <ul class="flex flex-col gap-3">
            @for (key of user.passkeys; track key.id) {
              <li class="flex flex-wrap items-center gap-3">
                <span class="break-all">{{ key.name }}</span
                ><button
                  hlmBtn
                  variant="outline"
                  [disabled]="busy() || !password"
                  (click)="remove(key.id)"
                >
                  {{ 'remove' | t }}
                </button>
              </li>
            } @empty {
              <li>
                <div hlmEmpty>
                  <div hlmEmptyHeader>
                    <p hlmEmptyTitle>{{ 'noPasskeys' | t }}</p>
                  </div>
                </div>
              </li>
            }
          </ul>
          @if (passkeys.supported) {
            <div hlmField>
              <label hlmFieldLabel for="passkey-name">{{ 'passkeyName' | t }}</label
              ><input hlmInput id="passkey-name" [(ngModel)]="keyName" maxlength="80" />
            </div>
            <button
              hlmBtn
              variant="outline"
              [disabled]="busy() || !password || !keyName"
              (click)="register()"
            >
              {{ 'addPasskey' | t }}
            </button>
          } @else {
            <div hlmAlert>
              <p hlmAlertDescription>{{ 'passkeysUnsupported' | t }}</p>
            </div>
          }
        </div>
      </section>
    } @else {
      <div class="flex items-center gap-2 mt-6" role="status">
        <hlm-spinner />{{ 'loading' | t }}
      </div>
    }`,
})
export class ProfilePage {
  readonly auth = inject(Auth);
  readonly passkeys = inject(Passkeys);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly profile = signal<ProfileResponse | null>(null);
  readonly enrollment = signal<MfaEnrollment | null>(null);
  readonly codes = signal<string[]>([]);
  readonly busy = signal(false);
  private readonly notifications = inject(Notifications);
  password = '';
  proofCode = '';
  recovery = false;
  code = '';
  keyName = '';
  constructor() {
    void this.run(() => this.load());
  }
  private proof() {
    return { password: this.password, code: this.proofCode, recoveryCode: this.recovery };
  }
  private async load() {
    this.profile.set(
      await firstValueFrom(
        this.http.get<ProfileResponse>(`${this.runtime.apiUrl}/api/v1/auth/profile`),
      ),
    );
  }
  private async run(action: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await action();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
  private async changed() {
    this.password = '';
    this.proofCode = '';
    await this.auth.refresh();
    await this.load();
    this.notifications.success('securitySaved');
  }
  enroll() {
    return this.run(async () => {
      this.enrollment.set(await this.auth.action<MfaEnrollment>('mfa/enroll', this.proof()));
      this.password = '';
    });
  }
  confirm() {
    return this.run(async () => {
      this.codes.set(await this.auth.action<string[]>('mfa/confirm', { code: this.code }));
      this.enrollment.set(null);
      this.code = '';
      await this.changed();
    });
  }
  manage(disable: boolean) {
    return this.run(async () => {
      this.codes.set(
        await this.auth.action<string[]>(disable ? 'mfa/disable' : 'mfa/recovery', this.proof()),
      );
      await this.changed();
    });
  }
  register() {
    return this.run(async () => {
      await this.passkeys.register(this.proof(), this.keyName);
      this.keyName = '';
      await this.changed();
    });
  }
  remove(id: string) {
    return this.run(async () => {
      await this.auth.action('passkeys/remove', { id, proof: this.proof() });
      await this.changed();
    });
  }
}
