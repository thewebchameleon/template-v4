import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../core/auth';
import { Errors } from '../../core/interceptors';
import { AccessResponse } from '../../api/models/access-response';
import { SecurityProof } from '../../api/models/security-proof';
import { Notifications } from '../notifications/notifications';
import { I18n } from '../../core/i18n';

@Injectable({ providedIn: 'root' })
export class Passkeys {
  private static readonly deviceStorageKey = 'templatev4-passkey-device-id';
  private readonly auth = inject(Auth);
  private readonly errors = inject(Errors);
  private readonly notifications = inject(Notifications);
  private readonly i18n = inject(I18n);
  readonly supported =
    typeof PublicKeyCredential !== 'undefined' &&
    typeof PublicKeyCredential.parseCreationOptionsFromJSON === 'function';
  readonly deviceId = this.loadDeviceId();
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
  async register(proof: SecurityProof) {
    try {
      const result = await this.auth.action<{
        challengeId: string;
        options: PublicKeyCredentialCreationOptionsJSON;
      }>('passkeys/register-options', { proof, deviceId: this.deviceId });
      const credential = (await navigator.credentials.create({
        publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(result.options),
      })) as PublicKeyCredential | null;
      if (!credential) throw new Error('Passkey cancelled');
      await this.auth.action('passkeys/register', {
        challengeId: result.challengeId,
        credential: credential.toJSON(),
        name: this.generatedName(),
        deviceId: this.deviceId,
      });
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.error?.code === 'auth.reauthentication_required'
      )
        throw error;
      const problem = {
        code: 'auth.passkey_failed',
        title: this.i18n.text('passkeyRegistrationFailed'),
      };
      this.errors.problem.set(problem);
      if (!(error instanceof HttpErrorResponse)) this.notifications.error(problem);
      throw error;
    }
  }
  private generatedName() {
    const platform = typeof navigator === 'undefined' ? '' : navigator.platform;
    return platform ? `Browser (${platform})` : 'Browser';
  }
  private loadDeviceId() {
    const stored = localStorage.getItem(Passkeys.deviceStorageKey);
    if (stored) return stored;
    const deviceId = crypto.randomUUID();
    localStorage.setItem(Passkeys.deviceStorageKey, deviceId);
    return deviceId;
  }
}
