import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { Auth } from '../core/auth';
import { Passkeys } from '../core/passkeys';
import { Runtime } from '../core/runtime';
import { Translate } from '../core/i18n';
import { ProfileResponse } from '../api/models/profile-response';
import { MfaEnrollment } from '../api/models/mfa-enrollment';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmCardImports,
    Translate,
  ],
  template: `<h1 class="text-3xl font-semibold">{{ 'profile' | t }}</h1>
    @if (profile(); as user) {
      <p class="mt-3 break-words">{{ user.displayName }} · {{ user.email }}</p>
      @if (auth.access()?.setupRequired) {
        <p role="status" class="my-4">{{ 'setupRequired' | t }}</p>
      }
      <section hlmCard class="mt-6 max-w-2xl">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'security' | t }}</h2>
          <p hlmCardDescription>{{ 'securityHelp' | t }}</p>
        </div>
        <div hlmCardContent class="flex flex-col gap-5">
          <p>
            {{ (user.mfaRequired ? 'mfaRequired' : 'mfaOptional') | t }} ·
            {{ (user.mfaEnabled ? 'authenticatorEnabled' : 'authenticatorDisabled') | t }}
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
              /><label
                ><input type="checkbox" [(ngModel)]="recovery" /> {{ 'useRecovery' | t }}</label
              >
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
            <div role="status">
              <h3>{{ 'saveRecovery' | t }}</h3>
              <p>{{ 'recoveryHelp' | t }}</p>
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
              <li>{{ 'noPasskeys' | t }}</li>
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
            <p>{{ 'passkeysUnsupported' | t }}</p>
          }
        </div>
        <div hlmCardFooter>
          <p role="status">{{ message() | t }}</p>
        </div>
      </section>
    } @else {
      <p role="status">{{ 'loading' | t }}</p>
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
  readonly message = signal('');
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
    this.message.set('');
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
    this.message.set('securitySaved');
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
