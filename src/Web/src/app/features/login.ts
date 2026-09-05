import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { Auth } from '../core/auth';
import { Passkeys } from '../core/passkeys';
import { Translate } from '../core/i18n';
@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmFieldImports,
    HlmCardImports,
    Translate,
  ],
  template: ` <section hlmCard class="mx-auto mt-10 max-w-md">
    <div hlmCardHeader>
      <h1 hlmCardTitle>{{ 'welcome' | t }}</h1>
      <p hlmCardDescription>{{ 'loginHelp' | t }}</p>
    </div>
    <form
      hlmCardContent
      class="flex flex-col gap-5"
      #form="ngForm"
      (ngSubmit)="form.valid && submit()"
    >
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
          <label
            ><input type="checkbox" name="recovery" [(ngModel)]="recovery" />
            {{ 'useRecovery' | t }}</label
          >
        </div>
      }
      <button hlmBtn type="submit" [disabled]="busy() || form.invalid">
        {{ (busy() ? 'loading' : 'signIn') | t }}
      </button>
    </form>
    <div hlmCardFooter class="flex flex-col gap-3">
      @if (passkeys.supported) {
        <button hlmBtn variant="outline" [disabled]="busy()" (click)="passkey()">
          {{ 'signInPasskey' | t }}
        </button>
      }
      @if (auth.challenge()) {
        <button hlmBtn variant="link" (click)="auth.challenge.set(null)">
          {{ 'startAgain' | t }}
        </button>
      }
      <div hlmField>
        <label hlmFieldLabel for="recovery-email">{{ 'recoveryEmail' | t }}</label>
        <input
          hlmInput
          id="recovery-email"
          name="recoveryEmail"
          type="email"
          autocomplete="email"
          [(ngModel)]="recoveryEmail"
        />
        <p hlmFieldDescription>{{ 'recoveryEmailHelp' | t }}</p>
      </div>
      <button hlmBtn variant="link" [disabled]="busy() || !recoveryEmail" (click)="forgot()">
        {{ 'forgot' | t }}
      </button>
      @if (sent()) {
        <p role="status">{{ 'sent' | t }}</p>
      }
    </div>
  </section>`,
})
export class LoginPage {
  readonly auth = inject(Auth);
  readonly passkeys = inject(Passkeys);
  code = '';
  recovery = false;
  private readonly router = inject(Router);
  username = '';
  recoveryEmail = '';
  password = '';
  readonly busy = signal(false);
  readonly sent = signal(false);
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
      this.sent.set(true);
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
