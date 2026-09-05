import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { Errors } from '../core/interceptors';
import { Auth } from '../core/auth';
import { Translate } from '../core/i18n';
@Component({
  selector: 'app-account',
  imports: [RouterLink, FormsModule, HlmButtonImports, HlmInputImports, HlmFieldImports, Translate],
  template: `<h1>{{ 'account' | t }}</h1>
    <form
      class="mt-6 flex max-w-md flex-col gap-4"
      #form="ngForm"
      (ngSubmit)="form.valid && submit()"
    >
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
          <hlm-field-error id="password-errors">{{
            errors.problem()?.errors?.['password']?.join(' ')
          }}</hlm-field-error>
        </div>
      }
      <button hlmBtn [disabled]="busy() || form.invalid || done()">
        {{ (kind === 'Verification' ? 'confirm' : 'newPassword') | t }}
      </button>
      @if (done()) {
        <p role="status">{{ (kind === 'Verification' ? 'sent' : 'passwordSaved') | t }}</p>
        <a hlmBtn routerLink="/login">{{ 'signIn' | t }}</a>
      }
    </form>`,
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

  async submit() {
    this.busy.set(true);
    try {
      await this.auth.action(this.kind === 'Verification' ? 'confirm-email' : 'reset-password', {
        userId: this.parts[1],
        token: this.parts[2],
        password: this.password,
      });
      history.replaceState(null, '', location.pathname);
      this.password = '';
      this.done.set(true);
    } catch {
      document.getElementById('password')?.focus();
    } finally {
      this.busy.set(false);
    }
  }
}
