import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from './auth';
import { Errors } from './interceptors';
import { AccessResponse } from '../api/models/access-response';
import { SecurityProof } from '../api/models/security-proof';
import { Notifications } from './notifications';
import { I18n } from './i18n';

@Injectable({ providedIn: 'root' })
export class Passkeys {
  private readonly auth = inject(Auth);
  private readonly errors = inject(Errors);
  private readonly notifications = inject(Notifications);
  private readonly i18n = inject(I18n);
  readonly supported =
    typeof PublicKeyCredential !== 'undefined' &&
    typeof PublicKeyCredential.parseCreationOptionsFromJSON === 'function';
  async login() {
    try {
      await this.auth.passkeyLogin(async () => {
        const result = await this.auth.action<{
          challengeId: string;
          options: PublicKeyCredentialRequestOptionsJSON;
        }>('passkeys/options');
        const credential = (await navigator.credentials.get({
          publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(result.options),
        })) as PublicKeyCredential | null;
        if (!credential) throw new Error('Passkey cancelled');
        return await this.auth.action<AccessResponse>('passkeys/login', {
          challengeId: result.challengeId,
          credential: credential.toJSON(),
        });
      });
    } catch (error) {
      const problem = {
        code: 'auth.passkey_failed',
        title: this.i18n.text('passkeyLoginFailed'),
      };
      this.errors.problem.set(problem);
      if (!(error instanceof HttpErrorResponse)) this.notifications.error(problem);
      throw error;
    }
  }
  async completeMfa(passwordChallengeId: string) {
    try {
      await this.auth.passkeyLogin(async () => {
        const result = await this.auth.action<{
          challengeId: string;
          options: PublicKeyCredentialRequestOptionsJSON;
        }>('passkeys/mfa-options', { challengeId: passwordChallengeId });
        const credential = (await navigator.credentials.get({
          publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(result.options),
        })) as PublicKeyCredential | null;
        if (!credential) throw new Error('Passkey cancelled');
        return await this.auth.action<AccessResponse>('passkeys/mfa', {
          challengeId: result.challengeId,
          credential: credential.toJSON(),
        });
      });
    } catch (error) {
      const problem = {
        code: 'auth.passkey_failed',
        title: this.i18n.text('passkeyVerificationFailed'),
      };
      this.errors.problem.set(problem);
      if (!(error instanceof HttpErrorResponse)) this.notifications.error(problem);
      throw error;
    }
  }
  async register(proof: SecurityProof, name: string) {
    try {
      const result = await this.auth.action<{
        challengeId: string;
        options: PublicKeyCredentialCreationOptionsJSON;
      }>('passkeys/register-options', proof);
      const credential = (await navigator.credentials.create({
        publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(result.options),
      })) as PublicKeyCredential | null;
      if (!credential) throw new Error('Passkey cancelled');
      await this.auth.action('passkeys/register', {
        challengeId: result.challengeId,
        credential: credential.toJSON(),
        name,
      });
    } catch (error) {
      const problem = {
        code: 'auth.passkey_failed',
        title: this.i18n.text('passkeyRegistrationFailed'),
      };
      this.errors.problem.set(problem);
      if (!(error instanceof HttpErrorResponse)) this.notifications.error(problem);
      throw error;
    }
  }
}
