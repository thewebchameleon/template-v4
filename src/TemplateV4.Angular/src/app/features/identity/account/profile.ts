import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import * as QRCode from 'qrcode';
import { BrnInputOtp } from '@spartan-ng/brain/input-otp';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { Auth } from '@app/core/auth';
import { Passkeys } from '../../passkeys/passkeys';
import { Runtime } from '@app/core/runtime';
import { Translate } from '@app/core/i18n';
import { ProfileResponse } from '@app/api/models/profile-response';
import { MfaEnrollment } from '@app/api/models/mfa-enrollment';
import { protectUnload } from '@app/shared/confirmation';
import { Notifications } from '../../notifications/notifications';

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
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    BrnInputOtp,
    HlmInputOtpImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmAlertImports,
    HlmEmptyImports,
    HlmBadgeImports,
    HlmDialogImports,
    HlmSpinnerImports,
    HlmTabsImports,
    Translate,
  ],
  template: `@if (profile(); as user) {
      @if (auth.access()?.setupRequired) {
        <div hlmAlert role="status" class="my-4">
          <p hlmAlertDescription>
            {{ (user.passkeyRequired ? 'passkeySetupRequired' : 'setupRequired') | t }}
          </p>
        </div>
      }
      <div class="grid gap-6 lg:grid-cols-2">
        <section hlmCard class="min-w-0">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'preferredMfaMethod' | t }}</h2>
            <p hlmCardDescription>{{ 'preferredMfaHelp' | t }}</p>
          </div>
          <div hlmCardContent class="flex flex-col gap-5">
            <p class="flex flex-wrap gap-2">
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
                <legend hlmFieldLegend class="sr-only">{{ 'preferredMfaMethod' | t }}</legend>
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
            @if (codes().length && !setupDialogOpen()) {
              <div hlmAlert role="status">
                <h3 hlmAlertTitle>{{ 'saveRecovery' | t }}</h3>
                <p hlmAlertDescription>{{ 'recoveryHelp' | t }}</p>
                <ul class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  @for (item of codes(); track item) {
                    <li>
                      <code>{{ item }}</code>
                    </li>
                  }
                </ul>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button hlmBtn variant="outline" (click)="copyCodes()">
                    {{ 'copyRecoveryCodes' | t }}
                  </button>
                  <button hlmBtn variant="outline" (click)="codes.set([])">
                    {{ 'savedRecovery' | t }}
                  </button>
                </div>
              </div>
            }
          </div>
        </section>
        <section hlmCard class="min-w-0">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'passkeys' | t }}</h2>
            <p hlmCardDescription>{{ 'passkeysHelp' | t }}</p>
          </div>
          <div hlmCardContent class="flex flex-col gap-5">
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
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy() || currentDeviceRegistered(user)"
                (click)="chooseAction('register')"
              >
                {{ 'addPasskey' | t }}
              </button>
              @if (currentDeviceRegistered(user)) {
                <p class="text-sm text-muted-foreground">{{ 'passkeyDeviceAlreadyAdded' | t }}</p>
              }
            } @else {
              <div hlmAlert>
                <p hlmAlertDescription>{{ 'passkeysUnsupported' | t }}</p>
              </div>
            }
          </div>
        </section>
      </div>
      @if (action() && action() !== 'enroll' && action() !== 'register') {
        <section
          class="mt-6 grid max-w-(--form-content-width) gap-4 rounded-md border p-4"
          aria-labelledby="proof-title"
        >
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
      @if (isBootstrapAccount(user.email)) {
        <div hlmAlert class="mt-6">
          <p hlmAlertDescription>{{ 'bootstrapRecoveryHelp' | t }}</p>
        </div>
      }
    } @else if (loadState() === 'error') {
      <div hlmAlert variant="destructive" class="mt-6" role="alert">
        <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
        <button hlmBtn variant="outline" (click)="retry()">{{ 'retry' | t }}</button>
      </div>
    }

    <hlm-dialog
      [state]="action() === 'enroll' ? 'open' : 'closed'"
      [disableClose]="busy()"
      [closeOnOutsidePointerEvents]="false"
      (stateChanged)="$event === 'closed' && cancelAction()"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header>
          <h2 hlmDialogTitle>{{ 'enrollAuthenticator' | t }}</h2>
          <p hlmDialogDescription>{{ 'securityHelp' | t }}</p>
        </hlm-dialog-header>
        <form
          class="grid gap-5"
          #enrollmentProof="ngForm"
          (ngSubmit)="enrollmentProof.valid && enroll()"
        >
          <div hlmField>
            <label hlmFieldLabel for="enrollment-password">{{ 'password' | t }}</label>
            <input
              hlmInput
              id="enrollment-password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              [(ngModel)]="password"
            />
          </div>
          <hlm-dialog-footer>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="busy()"
              (click)="cancelAction()"
            >
              {{ 'cancel' | t }}
            </button>
            <button hlmBtn [disabled]="busy() || enrollmentProof.invalid">
              @if (busy()) {
                <hlm-spinner />
              }
              {{ 'enrollAuthenticator' | t }}
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>

    <hlm-dialog
      [state]="action() === 'register' ? 'open' : 'closed'"
      [disableClose]="busy()"
      [closeOnOutsidePointerEvents]="false"
      (stateChanged)="$event === 'closed' && cancelAction()"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header>
          <h2 hlmDialogTitle>{{ 'addPasskey' | t }}</h2>
          <p hlmDialogDescription>{{ 'securityHelp' | t }}</p>
        </hlm-dialog-header>
        <form
          class="grid gap-5"
          #passkeyProof="ngForm"
          (ngSubmit)="passkeyProof.valid && register()"
        >
          <div hlmField>
            <label hlmFieldLabel for="passkey-password">{{ 'password' | t }}</label>
            <input
              hlmInput
              id="passkey-password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              [(ngModel)]="password"
            />
          </div>
          @if (profile()?.mfaEnabled) {
            <div hlmField>
              <label hlmFieldLabel for="passkey-proof-code">{{ 'factorCode' | t }}</label>
              <input
                hlmInput
                id="passkey-proof-code"
                name="code"
                autocomplete="one-time-code"
                required
                [(ngModel)]="proofCode"
              />
              <label hlmFieldLabel for="passkey-proof-recovery" hlmField orientation="horizontal">
                <hlm-checkbox
                  inputId="passkey-proof-recovery"
                  name="recovery"
                  [(ngModel)]="recovery"
                />
                {{ 'useRecovery' | t }}
              </label>
            </div>
          }
          <hlm-dialog-footer>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="busy()"
              (click)="cancelAction()"
            >
              {{ 'cancel' | t }}
            </button>
            <button hlmBtn [disabled]="busy() || passkeyProof.invalid">
              @if (busy()) {
                <hlm-spinner />
              }
              {{ 'addPasskey' | t }}
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>

    <hlm-dialog
      [state]="setupDialogOpen() ? 'open' : 'closed'"
      autoFocus="#profile-enrollment-code"
      [disableClose]="busy() || codes().length > 0"
      [closeOnOutsidePointerEvents]="false"
      (stateChanged)="$event === 'closed' && closeSetupDialog()"
    >
      <hlm-dialog-content *hlmDialogPortal class="sm:max-w-lg" [showCloseButton]="!codes().length">
        @if (codes().length) {
          <hlm-dialog-header>
            <h2 hlmDialogTitle>{{ 'saveRecovery' | t }}</h2>
            <p hlmDialogDescription>{{ 'recoveryHelp' | t }}</p>
          </hlm-dialog-header>
          <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            @for (item of codes(); track item) {
              <li>
                <code>{{ item }}</code>
              </li>
            }
          </ul>
          <hlm-dialog-footer>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="busy()"
              (click)="copyCodes()"
            >
              {{ 'copyRecoveryCodes' | t }}
            </button>
            <button hlmBtn type="button" [disabled]="busy()" (click)="finishEnrollment()">
              {{ 'savedRecovery' | t }}
            </button>
          </hlm-dialog-footer>
        } @else if (enrollment(); as setup) {
          <hlm-dialog-header>
            <h2 hlmDialogTitle>{{ 'authenticatorSetupTitle' | t }}</h2>
            <p hlmDialogDescription>{{ 'authenticatorSetupHelp' | t }}</p>
          </hlm-dialog-header>
          <div class="flex flex-col items-center gap-0 text-center">
            <div class="auth-setup-switcher w-full">
              <div
                id="profile-authenticator-qr-setup"
                class="auth-setup-panel auth-setup-panel-qr flex justify-center"
                [attr.data-active]="!manualSetup()"
                [attr.aria-hidden]="manualSetup()"
                [attr.inert]="manualSetup() ? '' : null"
              >
                <div
                  class="size-56 overflow-hidden rounded-md bg-white p-2"
                  role="img"
                  [attr.aria-label]="'authenticatorQrLabel' | t"
                  [innerHTML]="qrSvg()"
                ></div>
              </div>
              <section
                id="profile-manual-setup-panel"
                class="auth-setup-panel auth-setup-panel-manual flex flex-col items-center gap-3 text-center"
                aria-labelledby="profile-manual-setup-title"
                [attr.data-active]="manualSetup()"
                [attr.aria-hidden]="!manualSetup()"
                [attr.inert]="manualSetup() ? null : ''"
              >
                <h3 id="profile-manual-setup-title" class="font-semibold">
                  {{ 'manualSetupTitle' | t }}
                </h3>
                <p class="text-sm text-muted-foreground">{{ 'manualSetupHelp' | t }}</p>
                <div hlmField class="items-center text-center [&>*]:w-auto">
                  <span hlmFieldLabel>{{ 'setupKey' | t }}</span>
                  <code class="max-w-full break-all select-all rounded-md border p-3">{{
                    setup.key
                  }}</code>
                </div>
              </section>
            </div>
            <button
              hlmBtn
              type="button"
              variant="link"
              size="sm"
              [attr.aria-controls]="
                manualSetup() ? 'profile-authenticator-qr-setup' : 'profile-manual-setup-panel'
              "
              [attr.aria-expanded]="manualSetup()"
              (click)="manualSetup.set(!manualSetup())"
            >
              {{ (manualSetup() ? 'showQrCode' : 'authenticatorNotWorking') | t }}
            </button>
          </div>
          <form
            class="flex flex-col items-center gap-4 text-center"
            (ngSubmit)="code.length === 6 && confirm()"
          >
            <div hlmField class="items-center text-center [&>*]:w-auto">
              <label hlmFieldLabel for="profile-enrollment-code">{{
                'authenticatorCode' | t
              }}</label>
              <brn-input-otp
                hlmInputOtp
                inputId="profile-enrollment-code"
                inputAutocomplete="one-time-code"
                inputMode="numeric"
                [length]="6"
                [disabled]="busy()"
                [(value)]="code"
              >
                <hlm-input-otp-group>
                  @for (slot of otpSlots; track slot) {
                    <hlm-input-otp-slot class="size-12 text-xl font-semibold" [index]="slot" />
                  }
                </hlm-input-otp-group>
              </brn-input-otp>
            </div>
            <button hlmBtn [disabled]="busy() || code.length !== 6">
              @if (busy()) {
                <hlm-spinner />
              }
              {{ 'confirmFactor' | t }}
            </button>
          </form>
        }
      </hlm-dialog-content>
    </hlm-dialog>`,
})
export class ProfilePage {
  readonly action = signal('');
  private actionId = '';
  chooseAction(action: string, id = '') {
    this.cancelAction();
    this.action.set(action);
    this.actionId = id;
    setTimeout(() =>
      document
        .getElementById(
          action === 'enroll'
            ? 'enrollment-password'
            : action === 'register'
              ? 'passkey-password'
              : 'proof-password',
        )
        ?.focus(),
    );
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
  private readonly sanitizer = inject(DomSanitizer);
  readonly profile = signal<MfaProfile | null>(null);
  readonly enrollment = signal<MfaEnrollment | null>(null);
  readonly qrSvg = signal<SafeHtml | null>(null);
  readonly manualSetup = signal(false);
  readonly setupDialogOpen = signal(false);
  readonly codes = signal<string[]>([]);
  readonly busy = signal(false);
  readonly loadState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly otpSlots = [0, 1, 2, 3, 4, 5];
  private readonly router = inject(Router);
  private readonly notifications = inject(Notifications);
  password = '';
  proofCode = '';
  recovery = false;
  code = '';
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
      ) {
        await this.redirectForReauthentication();
      }
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
      const enrollment = await this.auth.action<MfaEnrollment>('mfa/enroll', this.proof());
      const svg = await QRCode.toString(enrollment.uri, { type: 'svg', margin: 1, width: 208 });
      this.qrSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
      this.manualSetup.set(false);
      this.codes.set([]);
      this.enrollment.set(enrollment);
      this.cancelAction();
      this.setupDialogOpen.set(true);
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
  closeSetupDialog() {
    if (this.busy() || this.codes().length) return;
    this.setupDialogOpen.set(false);
    this.enrollment.set(null);
    this.qrSvg.set(null);
    this.manualSetup.set(false);
    this.code = '';
  }
  finishEnrollment() {
    this.codes.set([]);
    this.closeSetupDialog();
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
      await this.passkeys.register(this.proof());
      await this.changed();
    });
  }
  currentDeviceRegistered(user: MfaProfile) {
    return user.passkeys.some((passkey) => passkey.deviceId === this.passkeys.deviceId);
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
  private async redirectForReauthentication() {
    const returnUrl = this.router.url;
    this.cancelAction();
    this.enrollment.set(null);
    this.qrSvg.set(null);
    this.manualSetup.set(false);
    this.setupDialogOpen.set(false);
    this.codes.set([]);
    this.code = '';
    await this.auth.logout();
    await this.router.navigate(['/login'], { queryParams: { returnUrl } });
    this.notifications.info('reauthenticationRedirected');
  }
  retry() {
    return this.run(() => this.load());
  }
}
