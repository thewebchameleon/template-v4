import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from './auth';
import { Errors } from './interceptors';
import { Notifications } from './notifications';
import { I18n } from './i18n';
import * as i0 from "@angular/core";
export class Passkeys {
    auth = inject(Auth);
    errors = inject(Errors);
    notifications = inject(Notifications);
    i18n = inject(I18n);
    supported = typeof PublicKeyCredential !== 'undefined' &&
        typeof PublicKeyCredential.parseCreationOptionsFromJSON === 'function';
    async login() {
        try {
            await this.auth.passkeyLogin(async () => {
                const result = await this.auth.action('passkeys/options');
                const credential = (await navigator.credentials.get({
                    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(result.options),
                }));
                if (!credential)
                    throw new Error('Passkey cancelled');
                return await this.auth.action('passkeys/login', {
                    challengeId: result.challengeId,
                    credential: credential.toJSON(),
                });
            });
        }
        catch (error) {
            const problem = {
                code: 'auth.passkey_failed',
                title: this.i18n.text('passkeyLoginFailed'),
            };
            this.errors.problem.set(problem);
            if (!(error instanceof HttpErrorResponse))
                this.notifications.error(problem);
            throw error;
        }
    }
    async completeMfa(passwordChallengeId) {
        try {
            await this.auth.passkeyLogin(async () => {
                const result = await this.auth.action('passkeys/mfa-options', { challengeId: passwordChallengeId });
                const credential = (await navigator.credentials.get({
                    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(result.options),
                }));
                if (!credential)
                    throw new Error('Passkey cancelled');
                return await this.auth.action('passkeys/mfa', {
                    challengeId: result.challengeId,
                    credential: credential.toJSON(),
                });
            });
        }
        catch (error) {
            const problem = {
                code: 'auth.passkey_failed',
                title: this.i18n.text('passkeyVerificationFailed'),
            };
            this.errors.problem.set(problem);
            if (!(error instanceof HttpErrorResponse))
                this.notifications.error(problem);
            throw error;
        }
    }
    async register(proof, name) {
        try {
            const result = await this.auth.action('passkeys/register-options', proof);
            const credential = (await navigator.credentials.create({
                publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(result.options),
            }));
            if (!credential)
                throw new Error('Passkey cancelled');
            await this.auth.action('passkeys/register', {
                challengeId: result.challengeId,
                credential: credential.toJSON(),
                name,
            });
        }
        catch (error) {
            const problem = {
                code: 'auth.passkey_failed',
                title: this.i18n.text('passkeyRegistrationFailed'),
            };
            this.errors.problem.set(problem);
            if (!(error instanceof HttpErrorResponse))
                this.notifications.error(problem);
            throw error;
        }
    }
    static ɵfac = function Passkeys_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Passkeys)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Passkeys, factory: Passkeys.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Passkeys, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
