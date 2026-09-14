import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Runtime } from './runtime';
import { I18n } from './i18n';
import * as i0 from "@angular/core";
export class Auth {
    http = inject(HttpClient);
    router = inject(Router);
    runtime = inject(Runtime);
    i18n = inject(I18n);
    access = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "access" }] : /* istanbul ignore next */ []));
    challenge = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "challenge" }] : /* istanbul ignore next */ []));
    mfaMethods = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mfaMethods" }] : /* istanbul ignore next */ []));
    preferredMfaMethod = signal('Email', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "preferredMfaMethod" }] : /* istanbul ignore next */ []));
    emailCodeSent = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emailCodeSent" }] : /* istanbul ignore next */ []));
    emailResendAt = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emailResendAt" }] : /* istanbul ignore next */ []));
    channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('templatev4-auth');
    generation = 0;
    constructor() {
        this.channel?.addEventListener('message', () => {
            this.generation++;
            this.access.set(null);
            this.csrf = '';
            this.resetChallenge();
            // Discard all identity-bound page and service state, including pending drafts.
            location.assign('/login');
        });
    }
    async serial(work) {
        return navigator.locks ? navigator.locks.request('templatev4-auth', work) : work();
    }
    csrf = '';
    pending = null;
    landing() {
        return this.access()?.setupRequired ? '/security' : '/dashboard';
    }
    has(permission) {
        return this.access()?.permissions.includes(permission) ?? false;
    }
    async csrfToken() {
        if (!this.csrf)
            this.csrf = (await firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/auth/csrf`, {
                withCredentials: true,
            }))).token;
        return this.csrf;
    }
    async action(path, body = {}) {
        const token = await this.csrfToken();
        return firstValueFrom(this.http.post(`${this.runtime.apiUrl}/api/v1/auth/${path}`, body, {
            withCredentials: true,
            headers: { 'X-CSRF-TOKEN': token },
        }));
    }
    async browserHeaders() {
        return { 'X-CSRF-TOKEN': await this.csrfToken() };
    }
    async login(username, password) {
        return this.serial(async () => {
            const value = await this.action('login', {
                username,
                password,
                device: 'Browser',
            });
            this.challenge.set(value.challengeId ?? null);
            this.mfaMethods.set(value.mfaMethods ?? []);
            this.preferredMfaMethod.set(value.preferredMfaMethod ?? 'Email');
            this.emailCodeSent.set(value.emailCodeSent ?? false);
            this.emailResendAt.set(value.emailResendAt ?? null);
            if (!value.challengeId)
                this.accept(value);
        });
    }
    async completeMfa(method, code, recoveryCode) {
        await this.serial(async () => {
            try {
                this.accept(await this.action('mfa/login', {
                    challengeId: this.challenge(),
                    code,
                    recoveryCode,
                    method,
                }));
            }
            finally {
                if (this.access())
                    this.resetChallenge();
            }
        });
    }
    async sendEmailCode() {
        const value = await this.action('mfa/email', {
            challengeId: this.challenge(),
        });
        this.emailCodeSent.set(true);
        this.emailResendAt.set(value.resendAt);
    }
    async passkeyLogin(work) {
        await this.serial(async () => {
            this.accept(await work());
            this.resetChallenge();
        });
    }
    accept(value, broadcast = true) {
        this.access.set(value);
        this.csrf = '';
        this.i18n.set(value.culture);
        this.i18n.timeZone.set(value.timeZone ?? 'UTC');
        if (broadcast)
            this.channel?.postMessage('login');
    }
    refresh() {
        if (this.pending)
            return this.pending;
        const generation = this.generation;
        const actor = this.access()?.userId;
        const execute = async () => {
            try {
                this.csrf = '';
                const value = await this.action('refresh');
                if (generation !== this.generation)
                    return false;
                if (actor && actor !== value.userId) {
                    this.generation++;
                    this.access.set(null);
                    location.assign('/login');
                    return false;
                }
                this.accept(value, false);
                return true;
            }
            catch (error) {
                if (!(error instanceof HttpErrorResponse) || error.status !== 401)
                    throw error;
                this.access.set(null);
                this.csrf = '';
                return false;
            }
        };
        this.pending = this.serial(execute).finally(() => (this.pending = null));
        return this.pending;
    }
    async logout() {
        this.generation++;
        await this.serial(async () => {
            await this.action('logout');
            this.access.set(null);
            this.csrf = '';
            this.resetChallenge();
            this.channel?.postMessage('logout');
        });
    }
    async revoke(id) {
        const token = await this.csrfToken();
        await firstValueFrom(this.http.delete(`${this.runtime.apiUrl}/api/v1/auth/sessions/${id}`, {
            withCredentials: true,
            headers: { 'X-CSRF-TOKEN': token },
        }));
    }
    resetChallenge() {
        this.challenge.set(null);
        this.mfaMethods.set([]);
        this.preferredMfaMethod.set('Email');
        this.emailCodeSent.set(false);
        this.emailResendAt.set(null);
    }
    static ɵfac = function Auth_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Auth)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Auth, factory: Auth.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Auth, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
export const authGuard = async (_route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh()))
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    if (auth.access()?.setupRequired && state.url.split('?')[0] !== '/security')
        return router.createUrlTree(['/security']);
    return true;
};
export const adminGuard = async () => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (!auth.access())
        await auth.refresh();
    return auth.has('users.manage') ? true : router.createUrlTree(['/security']);
};
export const administratorRoleGuard = () => {
    const auth = inject(Auth);
    const router = inject(Router);
    return auth.access()?.isAdministrator && !auth.access()?.setupRequired
        ? true
        : router.createUrlTree(['/forbidden']);
};
export const permissionGuard = async (route) => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh()))
        return router.createUrlTree(['/login']);
    return (route.data['permissions']?.some((p) => auth.has(p)) ||
        auth.has(route.data['permission']) ||
        router.createUrlTree(['/forbidden']));
};
