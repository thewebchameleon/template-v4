import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
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
    HlmButtonImports,
    HlmInputImports,
    HlmFieldImports,
    HlmCheckboxImports,
    HlmSpinnerImports,
    HlmDialogImports,
    AuthLayout,
    RouterLink,
    Translate,
  ],
  template: ` <app-auth-layout
    ><div hlmFieldGroup>
      <div class="auth-heading">
        <h1 class="auth-title">{{ 'welcome' | t }}</h1>
        <p class="auth-description">{{ 'loginHelp' | t }}</p>
      </div>
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
        } @else {
          <div hlmField>
            <label hlmFieldLabel for="factor">{{ 'factorCode' | t }}</label>
            <input
              hlmInput
              id="factor"
              name="factor"
              autocomplete="one-time-code"
              [(ngModel)]="code"
              required
            />
            <div hlmField orientation="horizontal">
              <hlm-checkbox inputId="recovery" name="recovery" [(ngModel)]="recovery" /><label
                hlmFieldLabel
                for="recovery"
                >{{ 'useRecovery' | t }}</label
              >
            </div>
          </div>
        }
        <button hlmBtn type="submit" [disabled]="busy() || form.invalid">
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'signIn' | t }}
        </button>
      </form>
      <div class="auth-footer">
        @if (passkeys.supported) {
          <hlm-field-separator>{{ 'orContinueWith' | t }}</hlm-field-separator>
          <button hlmBtn variant="outline" [disabled]="busy()" (click)="passkey()">
            {{ 'signInPasskey' | t }}
          </button>
        }
        @if (auth.challenge()) {
          <button hlmBtn variant="link" (click)="auth.challenge.set(null)">
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
      @if (registrationEnabled()) {
        <p hlmFieldDescription class="text-center">
          {{ 'noAccount' | t }} <a routerLink="/signup">{{ 'signUp' | t }}</a>
        </p>
      }
    </div></app-auth-layout
  >`,
})
export class LoginPage implements OnInit {
  private readonly registration = inject(Registration);
  readonly registrationEnabled = signal(false);
  async ngOnInit() {
    try {
      this.registrationEnabled.set((await this.registration.status()).enabled);
    } catch {
      /* Central Problem Details UI; do not offer unavailable registration. */
    }
  }
  readonly auth = inject(Auth);
  readonly passkeys = inject(Passkeys);
  code = '';
  recovery = false;
  private readonly router = inject(Router);
  username = '';
  recoveryEmail = '';
  readonly forgotDialogState = signal<'closed' | 'open'>('closed');
  password = '';
  readonly busy = signal(false);
  private readonly notifications = inject(Notifications);
  async submit() {
    this.busy.set(true);
    try {
      if (this.auth.challenge()) await this.auth.completeMfa(this.code, this.recovery);
      else await this.auth.login(this.username, this.password);
      this.password = '';
      if (this.auth.access()) await this.router.navigateByUrl('/profile');
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async passkey() {
    this.busy.set(true);
    try {
      await this.passkeys.login();
      await this.router.navigateByUrl('/profile');
    } catch {
      /* Error UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async forgot() {
    if (!this.recoveryEmail) return;
    this.busy.set(true);
    try {
      await this.auth.action('forgot-password', { email: this.recoveryEmail });
      this.notifications.success('sent');
      this.recoveryEmail = '';
      this.forgotDialogState.set('closed');
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
