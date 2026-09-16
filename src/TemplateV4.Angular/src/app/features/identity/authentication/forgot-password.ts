import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { Auth } from '../../../core/auth';
import { Translate } from '../../../core/i18n';
import { AuthLayout } from './auth-layout';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule,
    RouterLink,
    HlmAlertImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinnerImports,
    Translate,
    AuthLayout,
  ],
  template: `
    <app-auth-layout>
      <div hlmFieldGroup>
        <div class="auth-heading">
          <h1 class="auth-title">{{ 'forgotPasswordTitle' | t }}</h1>
          <p class="auth-description">{{ 'recoveryEmailHelp' | t }}</p>
        </div>
        @if (sent()) {
          <div hlmAlert role="status">
            <h2 hlmAlertTitle>{{ 'checkEmail' | t }}</h2>
            <p hlmAlertDescription>{{ 'recoveryEmailSent' | t }}</p>
          </div>
        } @else {
          <form class="auth-fields" #form="ngForm" (ngSubmit)="form.valid && submit()">
            <div hlmField>
              <label hlmFieldLabel for="recovery-email">{{ 'recoveryEmail' | t }}</label>
              <input
                hlmInput
                id="recovery-email"
                name="recoveryEmail"
                type="email"
                autocomplete="email"
                [(ngModel)]="email"
                required
                email
                maxlength="254"
              />
            </div>
            <button hlmBtn type="submit" [disabled]="busy() || form.invalid">
              @if (busy()) {
                <hlm-spinner />
              }
              {{ 'sendResetLink' | t }}
            </button>
          </form>
        }
        <div class="auth-footer">
          <a hlmBtn variant="link" routerLink="/login">{{ 'backToSignIn' | t }}</a>
        </div>
      </div>
    </app-auth-layout>
  `,
})
export class ForgotPasswordPage {
  private readonly auth = inject(Auth);
  readonly busy = signal(false);
  readonly sent = signal(false);
  email = '';

  async submit() {
    if (this.busy() || !this.email) return;
    this.busy.set(true);
    try {
      await this.auth.action('forgot-password', { email: this.email });
      this.email = '';
      this.sent.set(true);
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
