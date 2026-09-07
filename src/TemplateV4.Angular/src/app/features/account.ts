import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { AuthLayout } from './auth-layout';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { Errors } from '../core/interceptors';
import { Auth } from '../core/auth';
import { Translate } from '../core/i18n';
@Component({
  selector: 'app-account',
  imports: [
    AuthLayout,
    HlmAlertImports,
    HlmSpinnerImports,
    RouterLink,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmFieldImports,
    Translate,
  ],
  template: `<app-auth-layout
    ><div hlmFieldGroup>
      <div class="auth-heading">
        <h1 class="auth-title">
          {{
            (kind === 'Verification'
              ? 'verifyEmailTitle'
              : kind === 'EmailChange'
                ? 'changeEmail'
                : 'newPassword'
            ) | t
          }}
        </h1>
      </div>
      @if (invalid()) {
        <div hlmAlert role="alert">
          <h2 hlmAlertTitle>{{ 'invalidLink' | t }}</h2>
          <p hlmAlertDescription>{{ 'invalidLinkHelp' | t }}</p>
          <a hlmBtn variant="outline" routerLink="/login">{{ 'signIn' | t }}</a>
        </div>
      } @else {
        <form class="auth-fields" #form="ngForm" (ngSubmit)="form.valid && submit()">
          @if (!done() && kind !== 'Verification' && kind !== 'EmailChange') {
            <div hlmField>
              <label hlmFieldLabel for="password">{{ 'password' | t }}</label
              ><input
                hlmInput
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                minlength="8"
                aria-describedby="password-help password-errors"
                [(ngModel)]="password"
                required
              />
              <p hlmFieldDescription id="password-help">{{ 'passwordHelp' | t }}</p>
              @if (passwordErrors().length) {
                <hlm-field-error forceShow id="password-errors">{{
                  passwordErrors().join(' ')
                }}</hlm-field-error>
              }
            </div>
          }
          @if (!done()) {
            <button hlmBtn [disabled]="busy() || form.invalid">
              @if (busy()) {
                <hlm-spinner />
              }
              {{
                (kind === 'Verification' || kind === 'EmailChange' ? 'confirm' : 'newPassword') | t
              }}
            </button>
          }
          @if (done()) {
            <div hlmAlert role="status">
              <p hlmAlertDescription>
                {{
                  (kind === 'EmailChange'
                    ? 'emailChanged'
                    : kind === 'Verification'
                      ? 'emailVerified'
                      : 'passwordSaved'
                  ) | t
                }}
              </p>
            </div>
            <a hlmBtn routerLink="/login">{{ 'signIn' | t }}</a>
          }
        </form>
      }
    </div></app-auth-layout
  >`,
})
export class AccountPage {
  private readonly auth = inject(Auth);
  readonly errors = inject(Errors);
  private readonly parts = this.parseAction();
  private parseAction() {
    try {
      return location.hash.slice(1).split('/').map(decodeURIComponent);
    } catch {
      return [];
    }
  }
  readonly kind = this.parts[0];
  readonly invalid = signal(
    !(
      (['Verification', 'PasswordReset'].includes(this.kind) &&
        this.parts.length === 3 &&
        !!this.parts[1] &&
        !!this.parts[2]) ||
      (this.kind === 'EmailChange' && this.parts.length === 2 && !!this.parts[1])
    ),
  );
  password = '';
  readonly busy = signal(false);
  readonly done = signal(false);
  readonly passwordErrors = signal<string[]>([]);

  async submit() {
    if (this.busy() || this.invalid() || this.done()) return;
    this.busy.set(true);
    this.passwordErrors.set([]);
    try {
      if (this.kind === 'EmailChange') {
        await this.auth.action('privacy/confirm-email', { challenge: this.parts[1] });
        this.auth.access.set(null);
      } else {
        await this.auth.action(this.kind === 'Verification' ? 'confirm-email' : 'reset-password', {
          userId: this.parts[1],
          token: this.parts[2],
          password: this.password,
        });
      }
      history.replaceState(null, '', location.pathname);
      this.password = '';
      this.done.set(true);
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        ['auth.action_invalid', 'auth.challenge_expired'].includes(error.error?.code)
      )
        this.invalid.set(true);
      if (error instanceof HttpErrorResponse)
        this.passwordErrors.set(error.error?.errors?.password ?? []);
      document.getElementById('password')?.focus();
    } finally {
      this.busy.set(false);
    }
  }
}
