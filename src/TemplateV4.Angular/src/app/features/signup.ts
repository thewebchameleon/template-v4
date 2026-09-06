import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { I18n, Translate } from '../core/i18n';
import { Registration } from '../core/registration';
import { AuthLayout } from './auth-layout';

@Component({
  selector: 'app-signup',
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
          <h1 class="auth-title">{{ 'signupTitle' | t }}</h1>
          <p class="auth-description">{{ 'signupHelp' | t }}</p>
        </div>
        @if (checking()) {
          <div role="status" class="flex items-center gap-2">
            <hlm-spinner />{{ 'loading' | t }}
          </div>
        } @else if (!enabled()) {
          <div hlmAlert role="status">
            <h2 hlmAlertTitle>{{ 'registrationUnavailable' | t }}</h2>
            <p hlmAlertDescription>{{ 'registrationUnavailableHelp' | t }}</p>
          </div>
        } @else if (done()) {
          <div hlmAlert role="status">
            <h2 hlmAlertTitle>{{ 'checkEmail' | t }}</h2>
            <p hlmAlertDescription>{{ 'registrationSent' | t }}</p>
          </div>
        } @else {
          <form #form="ngForm" (ngSubmit)="form.valid && password === confirmation && submit()">
            <div hlmFieldGroup>
              <div hlmField>
                <label hlmFieldLabel for="signup-name">{{ 'name' | t }}</label>
                <input
                  hlmInput
                  id="signup-name"
                  name="displayName"
                  autocomplete="name"
                  [(ngModel)]="displayName"
                  #nameControl="ngModel"
                  required
                  maxlength="120"
                />
                @if (nameControl.invalid && nameControl.touched) {
                  <hlm-field-error>{{ 'nameRequired' | t }}</hlm-field-error>
                }
              </div>
              <div hlmField>
                <label hlmFieldLabel for="signup-email">{{ 'email' | t }}</label>
                <input
                  hlmInput
                  id="signup-email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  [(ngModel)]="email"
                  #emailControl="ngModel"
                  required
                  email
                  maxlength="254"
                />
                <p hlmFieldDescription>{{ 'signupEmailHelp' | t }}</p>
                @if (emailControl.invalid && emailControl.touched) {
                  <hlm-field-error>{{ 'emailInvalid' | t }}</hlm-field-error>
                }
              </div>
              <div hlmField>
                <label hlmFieldLabel for="signup-password">{{ 'password' | t }}</label>
                <input
                  hlmInput
                  id="signup-password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  [(ngModel)]="password"
                  #passwordControl="ngModel"
                  required
                  minlength="8"
                  maxlength="1024"
                />
                <p hlmFieldDescription>{{ 'passwordHelp' | t }}</p>
                @if (passwordControl.invalid && passwordControl.touched) {
                  <hlm-field-error>{{ 'passwordInvalid' | t }}</hlm-field-error>
                }
                @if (passwordErrors().length) {
                  <hlm-field-error forceShow>{{ passwordErrors().join(' ') }}</hlm-field-error>
                }
              </div>
              <div hlmField>
                <label hlmFieldLabel for="signup-confirmation">{{ 'confirmPassword' | t }}</label>
                <input
                  hlmInput
                  id="signup-confirmation"
                  name="confirmation"
                  [forceInvalid]="confirmationControl.touched && password !== confirmation"
                  aria-describedby="confirmation-error"
                  type="password"
                  autocomplete="new-password"
                  [(ngModel)]="confirmation"
                  #confirmationControl="ngModel"
                  required
                  maxlength="1024"
                />
                @if (confirmationControl.touched && password !== confirmation) {
                  <hlm-field-error forceShow id="confirmation-error">{{
                    'passwordMismatch' | t
                  }}</hlm-field-error>
                }
              </div>
              <button
                hlmBtn
                type="submit"
                [disabled]="busy() || form.invalid || password !== confirmation"
              >
                @if (busy()) {
                  <hlm-spinner />
                }
                {{ 'createAccount' | t }}
              </button>
            </div>
          </form>
        }
        <p hlmFieldDescription class="text-center">
          {{ 'alreadyAccount' | t }} <a routerLink="/login">{{ 'signIn' | t }}</a>
        </p>
      </div>
    </app-auth-layout>
  `,
})
export class SignupPage implements OnInit {
  private readonly registration = inject(Registration);
  private readonly i18n = inject(I18n);
  readonly checking = signal(true);
  readonly enabled = signal(false);
  readonly busy = signal(false);
  readonly done = signal(false);
  readonly passwordErrors = signal<string[]>([]);
  displayName = '';
  email = '';
  password = '';
  confirmation = '';

  async ngOnInit() {
    try {
      this.enabled.set((await this.registration.status()).enabled);
    } catch {
      /* Central Problem Details UI; availability fails closed. */
    } finally {
      this.checking.set(false);
    }
  }

  async submit() {
    if (this.busy() || !this.enabled() || this.password !== this.confirmation) return;
    this.busy.set(true);
    this.passwordErrors.set([]);
    try {
      await this.registration.register({
        email: this.email.trim(),
        displayName: this.displayName.trim(),
        password: this.password,
        culture: this.i18n.culture(),
      });
      this.password = '';
      this.confirmation = '';
      this.done.set(true);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error?.code === 'auth.registration_disabled')
        this.enabled.set(false);
      if (error instanceof HttpErrorResponse)
        this.passwordErrors.set(error.error?.errors?.password ?? []);
    } finally {
      this.busy.set(false);
    }
  }
}
