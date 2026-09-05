import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthLayout } from './auth-layout';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { Bootstrap } from '../core/bootstrap';
import { Translate } from '../core/i18n';
import { Errors } from '../core/interceptors';

@Component({
  selector: 'app-bootstrap',
  imports: [
    FormsModule,
    RouterLink,
    HlmAlertImports,
    HlmButtonImports,
    AuthLayout,
    HlmSpinnerImports,
    HlmFieldImports,
    HlmInputImports,
    Translate,
  ],
  template: `
    <app-auth-layout
      ><div hlmFieldGroup>
        <div class="auth-heading">
          <h1 class="auth-title">{{ 'bootstrapTitle' | t }}</h1>
          <p class="auth-description">{{ 'bootstrapHelp' | t }}</p>
        </div>

        @if (checking()) {
          <div hlmFieldGroup>
            <p role="status" class="flex items-center gap-2">
              <hlm-spinner />{{ 'checkingBootstrap' | t }}
            </p>
          </div>
        } @else if (available()) {
          <form
            hlmFieldGroup
            class="auth-fields"
            #form="ngForm"
            (ngSubmit)="form.valid && submit()"
          >
            @if (rejected()) {
              <div hlmAlert variant="destructive" role="alert">
                <h2 hlmAlertTitle>{{ 'bootstrapRejected' | t }}</h2>
                <p hlmAlertDescription>{{ 'bootstrapRejectedHelp' | t }}</p>
              </div>
            }

            <div hlmField>
              <label hlmFieldLabel for="bootstrap-username">{{ 'username' | t }}</label>
              <input
                hlmInput
                id="bootstrap-username"
                name="username"
                autocomplete="username"
                [(ngModel)]="username"
                #usernameControl="ngModel"
                required
                maxlength="256"
              />
              @if (usernameControl.invalid && usernameControl.touched) {
                <hlm-field-error>{{ 'usernameRequired' | t }}</hlm-field-error>
              }
              @if (fieldError('username'); as error) {
                <hlm-field-error>{{ error | t }}</hlm-field-error>
              }
            </div>

            <div hlmField>
              <label hlmFieldLabel for="bootstrap-password">{{ 'password' | t }}</label>
              <input
                hlmInput
                id="bootstrap-password"
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
              @if (fieldError('password'); as error) {
                <hlm-field-error>{{ error | t }}</hlm-field-error>
              }
            </div>

            <div hlmField>
              <label hlmFieldLabel for="bootstrap-token">{{ 'bootstrapToken' | t }}</label>
              <input
                hlmInput
                id="bootstrap-token"
                name="token"
                type="password"
                autocomplete="off"
                autocapitalize="none"
                spellcheck="false"
                [(ngModel)]="token"
                #tokenControl="ngModel"
                required
                maxlength="4096"
              />
              <p hlmFieldDescription>{{ 'bootstrapTokenHelp' | t }}</p>
              @if (tokenControl.invalid && tokenControl.touched) {
                <hlm-field-error>{{ 'bootstrapTokenRequired' | t }}</hlm-field-error>
              }
              @if (fieldError('token'); as error) {
                <hlm-field-error>{{ error | t }}</hlm-field-error>
              }
            </div>

            <button hlmBtn type="submit" [disabled]="busy() || form.invalid">
              {{ (busy() ? 'loading' : 'createAdministrator') | t }}
            </button>
          </form>
        } @else {
          <div hlmFieldGroup>
            <div hlmAlert role="status">
              <h2 hlmAlertTitle>{{ 'bootstrapUnavailable' | t }}</h2>
              <p hlmAlertDescription>{{ 'bootstrapUnavailableHelp' | t }}</p>
            </div>
          </div>
          <div class="auth-footer">
            <a hlmBtn routerLink="/login">{{ 'signIn' | t }}</a>
          </div>
        }
      </div></app-auth-layout
    >
  `,
})
export class BootstrapPage implements OnInit {
  private readonly bootstrap = inject(Bootstrap);
  private readonly errors = inject(Errors);
  private readonly router = inject(Router);

  readonly checking = signal(true);
  readonly available = signal(false);
  readonly busy = signal(false);
  readonly rejected = signal(false);
  readonly fieldErrors = signal<Record<string, string>>({});
  username = '';
  password = '';
  token = '';

  async ngOnInit() {
    try {
      this.available.set((await this.bootstrap.available()).available);
      if (!this.available()) await this.router.navigateByUrl('/login');
    } catch {
      this.errors.problem.set(null);
      await this.router.navigateByUrl('/login');
    } finally {
      this.checking.set(false);
    }
  }

  fieldError(field: string) {
    return this.fieldErrors()[field.toLowerCase()];
  }

  async submit() {
    this.busy.set(true);
    this.rejected.set(false);
    this.fieldErrors.set({});
    try {
      await this.bootstrap.create({
        token: this.token,
        username: this.username.trim(),
        password: this.password,
      });
      this.token = '';
      this.password = '';
      await this.router.navigateByUrl('/login');
    } catch (error) {
      this.errors.problem.set(null);
      if (error instanceof HttpErrorResponse && [404, 409, 410].includes(error.status)) {
        await this.router.navigateByUrl('/login');
        return;
      }
      if (error instanceof HttpErrorResponse && error.status === 400) {
        const serverErrors = error.error?.errors as Record<string, string[]> | undefined;
        if (serverErrors) {
          this.fieldErrors.set(
            Object.fromEntries(
              Object.entries(serverErrors)
                .filter(
                  ([key, messages]) =>
                    ['token', 'username', 'password'].includes(key.toLowerCase()) &&
                    messages.length,
                )
                .map(([key]) => [key.toLowerCase(), `${key.toLowerCase()}Invalid`]),
            ),
          );
        }
      }
      this.token = '';
      this.rejected.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
