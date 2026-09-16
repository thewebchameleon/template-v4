import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as QRCode from 'qrcode';
import { BrnInputOtp } from '@spartan-ng/brain/input-otp';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { AuthLayout } from './auth-layout';
import { Auth } from '../../../core/auth';
import { Translate } from '../../../core/i18n';
import { Passkeys } from '../../passkeys/passkeys';
import { MfaEnrollment } from '../../../api/models/mfa-enrollment';
import { protectUnload } from '../../../shared/confirmation';

@Component({
  selector: 'app-mfa-setup',
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  imports: [
    FormsModule,
    BrnInputOtp,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputOtpImports,
    HlmAlertImports,
    HlmSpinnerImports,
    AuthLayout,
    Translate,
  ],
  template: `<app-auth-layout>
    <div hlmFieldGroup [attr.aria-busy]="busy()">
      @if (!enrollment() && !configured()) {
        <div class="auth-heading">
          <h1 class="auth-title">{{ 'mfaSetupTitle' | t }}</h1>
          <p class="auth-description">
            {{ (auth.access()?.passkeyRequired ? 'passkeySetupRequired' : 'setupRequired') | t }}
          </p>
        </div>
      }
      @if (codes().length) {
        <div hlmAlert role="status">
          <h2 hlmAlertTitle>{{ 'saveRecovery' | t }}</h2>
          <p hlmAlertDescription>{{ 'recoveryHelp' | t }}</p>
          <ul class="my-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            @for (item of codes(); track item) {
              <li>
                <code>{{ item }}</code>
              </li>
            }
          </ul>
          <button hlmBtn variant="outline" [disabled]="busy()" (click)="copyCodes()">
            {{ 'copyRecoveryCodes' | t }}
          </button>
        </div>
        <button hlmBtn [disabled]="busy()" (click)="finish()">{{ 'savedRecovery' | t }}</button>
      } @else if (configured()) {
        <div class="auth-heading" role="status">
          <svg
            class="auth-success-mark mx-auto mb-4 size-20 text-primary"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle class="auth-success-ring" cx="40" cy="40" r="34" pathLength="1" />
            <path class="auth-success-tick" d="m24 40 11 11 22-22" pathLength="1" />
          </svg>
          <h1 class="auth-title">{{ 'mfaSetupSuccessTitle' | t }}</h1>
          <p class="auth-description">{{ 'mfaSetupComplete' | t }}</p>
        </div>
        <button hlmBtn [disabled]="busy()" (click)="finish()">{{ 'mfaSetupContinue' | t }}</button>
      } @else if (enrollment(); as setup) {
        <div class="auth-heading">
          <h2 class="auth-title">{{ 'authenticatorSetupTitle' | t }}</h2>
          <p class="auth-description">{{ 'authenticatorSetupHelp' | t }}</p>
        </div>
        <div class="flex flex-col items-center gap-0 text-center">
          <div class="auth-setup-switcher w-full">
            <div
              id="authenticator-qr-setup"
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
              id="manual-setup-panel"
              class="auth-setup-panel auth-setup-panel-manual flex flex-col items-center gap-3 text-center"
              aria-labelledby="manual-setup-title"
              [attr.data-active]="manualSetup()"
              [attr.aria-hidden]="!manualSetup()"
              [attr.inert]="manualSetup() ? null : ''"
            >
              <h3 id="manual-setup-title" class="font-semibold">{{ 'manualSetupTitle' | t }}</h3>
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
            [attr.aria-controls]="manualSetup() ? 'authenticator-qr-setup' : 'manual-setup-panel'"
            [attr.aria-expanded]="manualSetup()"
            (click)="manualSetup.set(!manualSetup())"
          >
            {{ (manualSetup() ? 'showQrCode' : 'authenticatorNotWorking') | t }}
          </button>
        </div>
        <form
          class="auth-fields items-center text-center"
          (ngSubmit)="code.length === 6 && confirm()"
        >
          <div hlmField class="items-center text-center [&>*]:w-auto">
            <label hlmFieldLabel for="enrollment-code">{{ 'authenticatorCode' | t }}</label>
            <brn-input-otp
              hlmInputOtp
              inputId="enrollment-code"
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
            {{ 'confirmFactor' | t }}
          </button>
        </form>
      } @else {
        <button hlmBtn [disabled]="busy()" (click)="enroll()">
          {{ 'enrollAuthenticator' | t }}
        </button>
        <hlm-field-separator>{{ 'or' | t }}</hlm-field-separator>
        <button
          hlmBtn
          variant="outline"
          [disabled]="busy() || !passkeys.supported"
          [attr.aria-busy]="passkeyBusy()"
          (click)="register()"
        >
          @if (passkeyBusy()) {
            <hlm-spinner />
          }
          {{ 'setupPasskey' | t }}
        </button>
        @if (!passkeys.supported) {
          <p hlmFieldDescription>{{ 'passkeysUnsupported' | t }}</p>
        }
      }
      @if (reauthenticationRequired()) {
        <div hlmAlert variant="destructive" role="alert">
          <p hlmAlertDescription>{{ 'reauthenticationRequired' | t }}</p>
        </div>
      }
      @if (busy() && !passkeyBusy() && !backToSignInBusy()) {
        <div role="status" class="flex items-center gap-2"><hlm-spinner />{{ 'loading' | t }}</div>
      }
      <button
        hlmBtn
        variant="link"
        [disabled]="busy()"
        [attr.aria-busy]="backToSignInBusy()"
        (click)="signInAgain()"
      >
        @if (backToSignInBusy()) {
          <hlm-spinner />
        }
        {{ 'backToSignIn' | t }}
      </button>
    </div>
  </app-auth-layout>`,
})
export class MfaSetupPage {
  readonly auth = inject(Auth);
  readonly passkeys = inject(Passkeys);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  readonly enrollment = signal<MfaEnrollment | null>(null);
  readonly qrSvg = signal<SafeHtml | null>(null);
  readonly manualSetup = signal(false);
  readonly codes = signal<string[]>([]);
  readonly configured = signal(false);
  readonly busy = signal(false);
  readonly passkeyBusy = signal(false);
  readonly backToSignInBusy = signal(false);
  readonly reauthenticationRequired = signal(false);
  readonly otpSlots = [0, 1, 2, 3, 4, 5];
  code = '';

  hasUnsavedChanges() {
    return !!this.enrollment() || this.codes().length > 0;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  private async run(work: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await work();
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.error?.code === 'auth.reauthentication_required'
      )
        this.reauthenticationRequired.set(true);
      // HTTP and passkey failures are displayed by their existing error handlers.
    } finally {
      this.busy.set(false);
    }
  }
  enroll() {
    return this.run(async () => {
      const enrollment = await this.auth.action<MfaEnrollment>('mfa/enroll', { password: '' });
      const svg = await QRCode.toString(enrollment.uri, { type: 'svg', margin: 1, width: 208 });
      this.qrSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
      this.manualSetup.set(false);
      this.enrollment.set(enrollment);
    });
  }
  confirm() {
    return this.run(async () => {
      this.codes.set(await this.auth.action<string[]>('mfa/confirm', { code: this.code }));
      this.enrollment.set(null);
      this.qrSvg.set(null);
      this.code = '';
      this.configured.set(true);
    });
  }
  async register() {
    this.passkeyBusy.set(true);
    try {
      await this.run(async () => {
        await this.passkeys.register({ password: '' }, this.generatedPasskeyName());
        this.configured.set(true);
      });
    } finally {
      this.passkeyBusy.set(false);
    }
  }
  private generatedPasskeyName() {
    const platform = typeof navigator === 'undefined' ? '' : navigator.platform;
    return platform ? `Browser (${platform})` : 'Browser';
  }
  async copyCodes() {
    await navigator.clipboard.writeText(this.codes().join('\n'));
  }
  finish() {
    if (!this.configured()) return;
    return this.run(async () => {
      if (!(await this.auth.refresh())) return;
      if (this.auth.access()?.setupRequired) {
        this.codes.set([]);
        this.configured.set(false);
        return;
      }
      this.codes.set([]);
      const requested = this.route.snapshot.queryParamMap.get('returnUrl');
      const target =
        requested?.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/login')
          ? requested
          : this.auth.landing();
      await this.router.navigateByUrl(target);
    });
  }
  async signInAgain() {
    this.backToSignInBusy.set(true);
    try {
      await this.run(async () => {
        await this.auth.logout();
        this.enrollment.set(null);
        this.codes.set([]);
        await this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.route.snapshot.queryParamMap.get('returnUrl') },
        });
      });
    } finally {
      this.backToSignInBusy.set(false);
    }
  }
}
