import { Injectable, inject } from '@angular/core';
import { Auth } from './auth';
import { Errors } from './interceptors';
import { AccessResponse } from '../api/models/access-response';
import { SecurityProof } from '../api/models/security-proof';

@Injectable({ providedIn: 'root' })
export class Passkeys {
  private readonly auth = inject(Auth);
  private readonly errors = inject(Errors);
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
      this.errors.problem.set({
        code: 'auth.passkey_failed',
        title: 'Passkey sign-in was cancelled or unsuccessful. Try again or use your password.',
      });
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
      this.errors.problem.set({
        code: 'auth.passkey_failed',
        title: 'Passkey registration was cancelled or unsuccessful. Try again.',
      });
      throw error;
    }
  }
}
