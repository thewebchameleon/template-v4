import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
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
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { Auth } from '../core/auth';
import { Passkeys } from '../core/passkeys';
import { Runtime } from '../core/runtime';
import { Translate } from '../core/i18n';
import { ProfileResponse } from '../api/models/profile-response';
import { MfaEnrollment } from '../api/models/mfa-enrollment';
import { protectUnload } from '../shared/confirmation';
import { Notifications } from '../core/notifications';

type MfaProfile = ProfileResponse & {
  emailMfaEnabled?: boolean;
  mfaMethods?: string[];
  preferredMfaMethod?: string;
};

@Component({
  selector: 'app-profile',
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  imports: [
    FormsModule,
    RouterLink,
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
    HlmTabsImports,
    Translate,
  ],
  template: `<h1 class="page-title">{{ 'security' | t }}</h1>
    <nav class="my-4 flex gap-3">
      <a hlmBtn variant="outline" routerLink="/me">{{ 'account' | t }}</a>
      @if (!auth.access()?.setupRequired) {
        <a hlmBtn variant="outline" routerLink="/security/sessions">{{ 'sessions' | t }}</a>
      }
    </nav>
    @if (profile(); as user) {
      <p class="mt-3 break-words">{{ user.displayName }} · {{ user.email }}</p>
      @if (auth.access()?.setupRequired) {
        <div hlmAlert role="status" class="my-4">
          <p hlmAlertDescription>
            {{ (user.passkeyRequired ? 'passkeySetupRequired' : 'setupRequired') | t }}
          </p>
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
              (user.mfaRequired || user.mfaMethods.length ? 'mfaRequired' : 'mfaOptional') | t
            }}</span>
            <span hlmBadge variant="outline">{{
              (user.mfaEnabled ? 'authenticatorEnabled' : 'authenticatorDisabled') | t
            }}</span>
            @if (user.emailMfaEnabled) {
              <span hlmBadge variant="outline">{{ 'emailMfaEnabled' | t }}</span>
            }
          </p>
          @if (user.mfaMethods.length) {
            <fieldset hlmFieldSet>
              <legend hlmFieldLegend>{{ 'preferredMfaMethod' | t }}</legend>
              <p hlmFieldDescription>{{ 'preferredMfaHelp' | t }}</p>
              <hlm-tabs
                orientation="vertical"
                [tab]="preferredMethod"
                (tabActivated)="selectPreferred($event)"
              >
                <hlm-tabs-list class="w-full gap-2" [attr.aria-label]="'preferredMfaMethod' | t">
                  @for (method of user.mfaMethods; track method) {
                    <button [hlmTabsTrigger]="method" class="w-full">
                      {{ methodLabel(method) | t }}
                    </button>
                  }
                </hlm-tabs-list>
              </hlm-tabs>
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy() || preferredMethod === user.preferredMfaMethod"
                (click)="savePreference()"
              >
                {{ 'savePreference' | t }}
              </button>
            </fieldset>
          }
          <div class="flex flex-wrap gap-3">
            @if (!user.mfaEnabled) {
              <button hlmBtn [disabled]="busy()" (click)="chooseAction('enroll')">
                {{ 'enrollAuthenticator' | t }}
              </button>
            } @else {
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy()"
                (click)="chooseAction('recovery')"
              >
                {{ 'rotateRecovery' | t }}
              </button>
              @if (!user.mfaRequired || user.passkeys.length > 0 || user.emailMfaEnabled) {
                <button
                  hlmBtn
                  variant="destructive"
                  [disabled]="busy()"
                  (click)="chooseAction('disable')"
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
              <button hlmBtn variant="outline" class="mt-3 mr-2" (click)="copyCodes()">
                {{ 'copyRecoveryCodes' | t }}</button
              ><button hlmBtn variant="outline" class="mt-3" (click)="codes.set([])">
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
                  [disabled]="busy()"
                  [attr.aria-label]="('remove' | t) + ': ' + key.name"
                  (click)="chooseAction('remove', key.id)"
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
              [disabled]="busy() || !keyName"
              (click)="chooseAction('register')"
            >
              {{ 'addPasskey' | t }}
            </button>
          } @else {
            <div hlmAlert>
              <p hlmAlertDescription>{{ 'passkeysUnsupported' | t }}</p>
            </div>
          }
          @if (action()) {
            <section class="grid gap-4 rounded-md border p-4" aria-labelledby="proof-title">
              <h3 id="proof-title" class="font-semibold">{{ actionLabel() | t }}</h3>
              <p class="text-sm text-muted-foreground">{{ 'emailProofHelp' | t }}</p>
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
              <div class="flex gap-2">
                <button
                  hlmBtn
                  [disabled]="busy() || !password || (user.mfaEnabled && !proofCode)"
                  (click)="executeAction()"
                >
                  {{ actionLabel() | t }}</button
                ><button hlmBtn variant="outline" (click)="cancelAction()">
                  {{ 'cancel' | t }}
                </button>
              </div>
            </section>
          }
        </div>
      </section>
      @if (isBootstrapAccount(user.email)) {
        <div hlmAlert class="mt-6">
          <p hlmAlertDescription>{{ 'bootstrapRecoveryHelp' | t }}</p>
        </div>
      }
      @if (reauthenticationRequired()) {
        <div hlmAlert variant="destructive" class="mt-6" role="alert">
          <p hlmAlertDescription>{{ 'reauthenticationRequired' | t }}</p>
          <button hlmBtn variant="outline" (click)="signInAgain()">{{ 'signInAgain' | t }}</button>
        </div>
      }
    } @else if (loadState() === 'error') {
      <div hlmAlert variant="destructive" class="mt-6" role="alert">
        <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
        <button hlmBtn variant="outline" (click)="retry()">{{ 'retry' | t }}</button>
      </div>
    } @else {
      <div class="flex items-center gap-2 mt-6" role="status">
        <hlm-spinner />{{ 'loading' | t }}
      </div>
    }`,
})
export class ProfilePage {
  readonly action = signal('');
  private actionId = '';
  chooseAction(action: string, id = '') {
    this.cancelAction();
    this.action.set(action);
    this.actionId = id;
    setTimeout(() => document.getElementById('proof-password')?.focus());
  }
  actionLabel() {
    return (
      (
        {
          enroll: 'enrollAuthenticator',
          recovery: 'rotateRecovery',
          disable: 'disableMfa',
          register: 'addPasskey',
          remove: 'remove',
        } as Record<string, string>
      )[this.action()] ?? 'confirm'
    );
  }
  cancelAction() {
    this.action.set('');
    this.password = '';
    this.proofCode = '';
    this.recovery = false;
  }
  async executeAction() {
    const action = this.action();
    if (action === 'enroll') await this.enroll();
    else if (action === 'recovery' || action === 'disable') await this.manage(action === 'disable');
    else if (action === 'register') await this.register();
    else if (action === 'remove') await this.remove(this.actionId);
  }
  hasUnsavedChanges() {
    return this.codes().length > 0 || !!this.enrollment() || !!this.password || !!this.proofCode;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async copyCodes() {
    await navigator.clipboard.writeText(this.codes().join('\n'));
  }

  readonly auth = inject(Auth);
  readonly passkeys = inject(Passkeys);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly profile = signal<MfaProfile | null>(null);
  readonly enrollment = signal<MfaEnrollment | null>(null);
  readonly codes = signal<string[]>([]);
  readonly busy = signal(false);
  readonly loadState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly reauthenticationRequired = signal(false);
  private readonly router = inject(Router);
  private readonly notifications = inject(Notifications);
  password = '';
  proofCode = '';
  recovery = false;
  code = '';
  keyName = '';
  preferredMethod = 'Email';
  constructor() {
    void this.run(() => this.load());
  }
  private proof() {
    return { password: this.password, code: this.proofCode, recoveryCode: this.recovery };
  }
  protected async load() {
    this.loadState.set('loading');
    try {
      const profile = await firstValueFrom(
        this.http.get<ProfileResponse>(`${this.runtime.apiUrl}/api/v1/auth/profile`),
      );
      this.profile.set(profile);
      this.preferredMethod = (profile as MfaProfile).preferredMfaMethod ?? 'Email';
      this.loadState.set('ready');
    } catch (error) {
      this.loadState.set('error');
      throw error;
    }
  }
  protected async run(action: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.error?.code === 'auth.reauthentication_required'
      )
        this.reauthenticationRequired.set(true);
    } finally {
      this.busy.set(false);
    }
  }
  private async changed() {
    this.action.set('');
    this.password = '';
    this.proofCode = '';
    await this.auth.refresh();
    await this.load();
    this.notifications.success('securitySaved');
  }
  enroll() {
    return this.run(async () => {
      this.enrollment.set(await this.auth.action<MfaEnrollment>('mfa/enroll', this.proof()));
      this.cancelAction();
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
  methodLabel(method: string) {
    return method === 'Passkey'
      ? 'passkeyMethod'
      : method === 'Authenticator'
        ? 'authenticatorMethod'
        : 'emailMethod';
  }
  selectPreferred(value: string | string[] | null | undefined) {
    if (typeof value === 'string' && value) this.preferredMethod = value;
  }
  savePreference() {
    return this.run(async () => {
      await this.auth.action('mfa/preference', { method: this.preferredMethod });
      await this.load();
      this.notifications.success('securitySaved');
    });
  }
  isBootstrapAccount(email: string) {
    return email.toLowerCase().endsWith('@example.invalid');
  }
  async signInAgain() {
    await this.auth.logout();
    await this.router.navigate(['/login'], { queryParams: { returnUrl: '/security' } });
  }
  retry() {
    return this.run(() => this.load());
  }
}
