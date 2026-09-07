import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrnInputOtp } from '@spartan-ng/brain/input-otp';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { AuthLayout } from './auth-layout';
import { Registration } from '../core/registration';
import { Auth } from '../core/auth';
import { Passkeys } from '../core/passkeys';
import { Translate } from '../core/i18n';
import { Notifications } from '../core/notifications';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    BrnInputOtp,
    HlmButtonImports,
    HlmInputImports,
    HlmInputOtpImports,
    HlmFieldImports,
    HlmCheckboxImports,
    HlmSpinnerImports,
    HlmDialogImports,
    HlmToggleGroupImports,
    AuthLayout,
    RouterLink,
    Translate,
  ],
  template: ` <app-auth-layout
    ><div hlmFieldGroup>
      <div class="auth-heading">
        <h1 class="auth-title">{{ (auth.challenge() ? 'verifyIdentity' : 'welcome') | t }}</h1>
        <p class="auth-description">
          {{ (auth.challenge() ? 'chooseMfaHelp' : 'loginHelp') | t }}
        </p>
      </div>
      @if (auth.challenge() && challengeStep() === 'choose') {
        <fieldset hlmFieldSet>
          <legend hlmFieldLegend>{{ 'authenticationMethod' | t }}</legend>
          <hlm-toggle-group
            type="single"
            orientation="vertical"
            variant="outline"
            [spacing]="2"
            [value]="selectedMethod()"
            (valueChange)="selectMethod($event)"
            class="w-full"
          >
            @for (method of auth.mfaMethods(); track method) {
              <button hlmToggleGroupItem type="button" [value]="method" class="w-full">
                {{ methodLabel(method) | t }}
              </button>
            }
          </hlm-toggle-group>
        </fieldset>
      }
      <form class="auth-fields" #form="ngForm" (ngSubmit)="form.valid && submit()">
        @if (!auth.challenge()) {
          <div hlmField>
            <label hlmFieldLabel for="username">{{ 'username' | t }}</label
            ><input
              hlmInput
              id="username"
              name="username"
              autocomplete="username"
              [(ngModel)]="username"
              required
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="password">{{ 'password' | t }}</label
            ><input
              hlmInput
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="password"
              required
            />
          </div>
        } @else if (challengeStep() === 'factor' && selectedMethod() === 'Email') {
          <div hlmField>
            <label hlmFieldLabel for="email-code">{{ 'emailCode' | t }}</label>
            <p hlmFieldDescription>{{ 'emailCodeHelp' | t }}</p>
            <brn-input-otp
              hlmInputOtp
              inputId="email-code"
              inputAutocomplete="one-time-code"
              inputMode="numeric"
              [length]="6"
              [disabled]="busy() || !auth.emailCodeSent()"
              [(value)]="code"
            >
              <hlm-input-otp-group>
                @for (slot of otpSlots; track slot) {
                  <hlm-input-otp-slot [index]="slot" />
                }
              </hlm-input-otp-group>
            </brn-input-otp>
          </div>
        } @else if (challengeStep() === 'factor' && selectedMethod() === 'Authenticator') {
          <div hlmField>
            <label hlmFieldLabel for="factor">{{ 'factorCode' | t }}</label>
            @if (recovery) {
              <input
                hlmInput
                id="factor"
                name="factor"
                autocomplete="one-time-code"
                [(ngModel)]="code"
                required
              />
            } @else {
              <brn-input-otp
                hlmInputOtp
                inputId="factor"
                inputAutocomplete="one-time-code"
                inputMode="numeric"
                [length]="6"
                [disabled]="busy()"
                [(value)]="code"
              >
                <hlm-input-otp-group>
                  @for (slot of otpSlots; track slot) {
                    <hlm-input-otp-slot [index]="slot" />
                  }
                </hlm-input-otp-group>
              </brn-input-otp>
            }
            <div hlmField orientation="horizontal">
              <hlm-checkbox inputId="recovery" name="recovery" [(ngModel)]="recovery" /><label
                hlmFieldLabel
                for="recovery"
                >{{ 'useRecovery' | t }}</label
              >
            </div>
          </div>
        }
        @if (
          !auth.challenge() || (challengeStep() === 'factor' && selectedMethod() !== 'Passkey')
        ) {
          <button
            hlmBtn
            type="submit"
            [disabled]="busy() || form.invalid || (auth.challenge() && code.length < 6)"
          >
            @if (busy()) {
              <hlm-spinner />
            }
            {{ (auth.challenge() ? 'verify' : 'signIn') | t }}
          </button>
        }
      </form>
      <div class="auth-footer">
        @if (auth.challenge() && challengeStep() === 'factor' && selectedMethod() === 'Email') {
          <button
            hlmBtn
            variant="outline"
            [disabled]="busy() || resendSeconds() > 0"
            (click)="sendEmailCode()"
          >
            {{
              resendSeconds() > 0
                ? ('resendIn' | t) + ' ' + resendSeconds() + 's'
                : ('resendCode' | t)
            }}
          </button>
        }
        @if (
          auth.challenge() &&
          challengeStep() === 'factor' &&
          selectedMethod() === 'Passkey' &&
          !passkeys.supported
        ) {
          <p hlmFieldDescription>{{ 'passkeysUnsupported' | t }}</p>
        } @else if (!auth.challenge() && passkeys.supported) {
          <hlm-field-separator>{{ 'orContinueWith' | t }}</hlm-field-separator>
          <button hlmBtn variant="outline" [disabled]="busy()" (click)="passkey()">
            {{ 'signInPasskey' | t }}
          </button>
        }
        @if (auth.challenge()) {
          @if (challengeStep() === 'factor') {
            <button hlmBtn variant="link" [disabled]="busy()" (click)="chooseAnotherMethod()">
              {{ 'chooseAnotherMethod' | t }}
            </button>
          }
          <button hlmBtn variant="link" (click)="resetChallenge()">
            {{ 'startAgain' | t }}
          </button>
        }
        <hlm-dialog [state]="forgotDialogState()" (stateChanged)="forgotDialogState.set($event)">
          <button hlmBtn variant="link" hlmDialogTrigger [disabled]="busy()">
            {{ 'forgot' | t }}
          </button>
          <hlm-dialog-content *hlmDialogPortal>
            <hlm-dialog-header>
              <h2 hlmDialogTitle>{{ 'forgotPasswordTitle' | t }}</h2>
              <p hlmDialogDescription>{{ 'recoveryEmailHelp' | t }}</p>
            </hlm-dialog-header>
            <form #recoveryForm="ngForm" class="flex flex-col gap-6" (ngSubmit)="forgot()">
              <div hlmField>
                <label hlmFieldLabel for="recovery-email">{{ 'recoveryEmail' | t }}</label>
                <input
                  hlmInput
                  id="recovery-email"
                  name="recoveryEmail"
                  type="email"
                  autocomplete="email"
                  [(ngModel)]="recoveryEmail"
                  required
                />
              </div>
              <hlm-dialog-footer>
                <button hlmBtn type="submit" [disabled]="busy() || recoveryForm.invalid">
                  @if (busy()) {
                    <hlm-spinner />
                  }
                  {{ 'sendResetLink' | t }}
                </button>
              </hlm-dialog-footer>
            </form>
          </hlm-dialog-content>
        </hlm-dialog>
      </div>
      @if (recoverySent()) {
        <p role="status" class="text-sm text-muted-foreground">{{ 'sent' | t }}</p>
      }
      @if (!auth.challenge() && registrationEnabled()) {
        <p hlmFieldDescription class="text-center">
          {{ 'noAccount' | t }} <a routerLink="/signup">{{ 'signUp' | t }}</a>
        </p>
      }
    </div></app-auth-layout
  >`,
})
export class LoginPage implements OnInit, OnDestroy {
  private readonly registration = inject(Registration);
  readonly registrationEnabled = signal(false);
  readonly auth = inject(Auth);
  readonly passkeys = inject(Passkeys);
  readonly selectedMethod = signal('Email');
  readonly challengeStep = signal<'choose' | 'factor'>('choose');
  readonly resendSeconds = signal(0);
  readonly otpSlots = [0, 1, 2, 3, 4, 5];
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private countdown?: ReturnType<typeof setInterval>;
  code = '';
  recovery = false;
  username = '';
  recoveryEmail = '';
  readonly recoverySent = signal(false);
  readonly forgotDialogState = signal<'closed' | 'open'>('closed');
  password = '';
  readonly busy = signal(false);
  private readonly notifications = inject(Notifications);

  async ngOnInit() {
    try {
      this.registrationEnabled.set((await this.registration.status()).enabled);
    } catch {
      /* Central Problem Details UI; do not offer unavailable registration. */
    }
  }
  ngOnDestroy() {
    if (this.countdown) clearInterval(this.countdown);
  }
  methodLabel(method: string) {
    return method === 'Passkey'
      ? 'passkeyMethod'
      : method === 'Authenticator'
        ? 'authenticatorMethod'
        : 'emailMethod';
  }
  async selectMethod(value: string | string[] | null | undefined) {
    if (typeof value !== 'string' || !value || this.busy()) return;
    this.selectedMethod.set(value);
    this.code = '';
    this.recovery = false;
    if (value === 'Passkey') {
      if (this.passkeys.supported) await this.passkey();
      else this.challengeStep.set('factor');
      return;
    }
    this.challengeStep.set('factor');
    if (value === 'Email' && !this.auth.emailCodeSent() && this.resendSeconds() === 0)
      await this.sendEmailCode();
  }
  async submit() {
    this.busy.set(true);
    try {
      if (this.auth.challenge()) {
        await this.auth.completeMfa(this.selectedMethod(), this.code, this.recovery);
      } else {
        await this.auth.login(this.username, this.password);
        this.password = '';
        if (this.auth.challenge()) {
          this.selectedMethod.set(this.auth.preferredMfaMethod());
          this.challengeStep.set(
            this.auth.preferredMfaMethod() === 'Passkey' ? 'choose' : 'factor',
          );
          this.startCountdown();
        }
      }
      if (this.auth.access()) await this.navigateAfterAuthentication();
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async sendEmailCode() {
    if (this.busy() || this.resendSeconds() > 0) return;
    this.busy.set(true);
    try {
      await this.auth.sendEmailCode();
      this.code = '';
      this.startCountdown();
      this.notifications.success('emailCodeSent');
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async passkey() {
    this.busy.set(true);
    try {
      const challenge = this.auth.challenge();
      if (challenge) await this.passkeys.completeMfa(challenge);
      else await this.passkeys.login();
      await this.navigateAfterAuthentication();
    } catch {
      /* Error UI. */
    } finally {
      this.busy.set(false);
    }
  }
  resetChallenge() {
    this.auth.resetChallenge();
    this.selectedMethod.set('Email');
    this.challengeStep.set('choose');
    this.code = '';
    this.recovery = false;
    this.resendSeconds.set(0);
    if (this.countdown) clearInterval(this.countdown);
  }
  chooseAnotherMethod() {
    this.challengeStep.set('choose');
    this.code = '';
    this.recovery = false;
  }
  private startCountdown() {
    if (this.countdown) clearInterval(this.countdown);
    const update = () => {
      const resendAt = this.auth.emailResendAt();
      this.resendSeconds.set(
        resendAt ? Math.max(0, Math.ceil((Date.parse(resendAt) - Date.now()) / 1000)) : 0,
      );
    };
    update();
    if (this.resendSeconds() > 0)
      this.countdown = setInterval(() => {
        update();
        if (this.resendSeconds() === 0 && this.countdown) clearInterval(this.countdown);
      }, 1000);
  }
  private async navigateAfterAuthentication() {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    const safe =
      requested?.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/login')
        ? requested
        : this.auth.landing();
    await this.router.navigateByUrl(this.auth.access()?.setupRequired ? '/security' : safe);
  }
  async forgot() {
    if (!this.recoveryEmail) return;
    this.busy.set(true);
    try {
      await this.auth.action('forgot-password', { email: this.recoveryEmail });
      this.notifications.success('sent');
      this.recoverySent.set(true);
      this.recoveryEmail = '';
      this.forgotDialogState.set('closed');
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
