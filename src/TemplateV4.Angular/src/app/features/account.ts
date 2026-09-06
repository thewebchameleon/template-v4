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
        <h1 class="auth-title">{{ 'account' | t }}</h1>
      </div>
      <form class="auth-fields" #form="ngForm" (ngSubmit)="form.valid && submit()">
        @if (kind !== 'Verification') {
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
        <button hlmBtn [disabled]="busy() || form.invalid || done()">
          @if (busy()) {
            <hlm-spinner />
          }
          {{ (kind === 'Verification' ? 'confirm' : 'newPassword') | t }}
        </button>
        @if (done()) {
          <div hlmAlert role="status">
            <p hlmAlertDescription>
              {{ (kind === 'Verification' ? 'emailVerified' : 'passwordSaved') | t }}
            </p>
          </div>
          <a hlmBtn routerLink="/login">{{ 'signIn' | t }}</a>
        }
      </form>
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
  password = '';
  readonly busy = signal(false);
  readonly done = signal(false);
  readonly passwordErrors = signal<string[]>([]);

  async submit() {
    this.busy.set(true);
    this.passwordErrors.set([]);
    try {
      await this.auth.action(this.kind === 'Verification' ? 'confirm-email' : 'reset-password', {
        userId: this.parts[1],
        token: this.parts[2],
        password: this.password,
      });
      history.replaceState(null, '', location.pathname);
      this.password = '';
      this.done.set(true);
    } catch (error) {
      if (error instanceof HttpErrorResponse)
        this.passwordErrors.set(error.error?.errors?.password ?? []);
      document.getElementById('password')?.focus();
    } finally {
      this.busy.set(false);
    }
  }
}
