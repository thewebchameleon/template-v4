import { inject, Injectable, signal } from '@angular/core';
import { HttpContextToken } from '@angular/common/http';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { Auth } from './auth';
import { Runtime } from './runtime';
import { I18n } from './i18n';
import { Notifications } from './notifications';
import * as i0 from "@angular/core";
export class Errors {
    problem = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "problem" }] : /* istanbul ignore next */ []));
    static ɵfac = function Errors_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Errors)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Errors, factory: Errors.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Errors, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
export const IDEMPOTENCY_KEY = new HttpContextToken(() => '');
export const QUIET_REQUEST = new HttpContextToken(() => false);
export const authInterceptor = (request, next) => {
    const auth = inject(Auth);
    const runtime = inject(Runtime);
    const i18n = inject(I18n);
    const target = new URL(request.url, location.origin);
    const api = new URL(runtime.apiUrl || location.origin, location.origin);
    if (target.origin !== api.origin || !target.pathname.startsWith('/api/'))
        return next(request);
    const headers = { 'Accept-Language': i18n.culture() };
    const key = request.context.get(IDEMPOTENCY_KEY);
    if (key)
        headers['Idempotency-Key'] = key;
    const access = auth.access();
    if (access)
        headers['Authorization'] = `Bearer ${access.accessToken}`;
    return next(request.clone({ setHeaders: headers })).pipe(catchError((error) => {
        if (error.status !== 401 ||
            (error.error?.code && error.error.code !== 'http.401') ||
            target.pathname.startsWith('/api/v1/bootstrap') ||
            [
                '/login',
                '/refresh',
                '/csrf',
                '/logout',
                '/mfa/login',
                '/mfa/email',
                '/passkeys/login',
                '/passkeys/options',
                '/passkeys/mfa-options',
                '/passkeys/mfa',
            ].some((path) => target.pathname === '/api/v1/auth' + path))
            return throwError(() => error);
        return from(auth.refresh()).pipe(switchMap((ok) => ok && access != null && auth.access()?.userId === access.userId
            ? next(request.clone({
                setHeaders: { ...headers, Authorization: `Bearer ${auth.access().accessToken}` },
            }))
            : throwError(() => error)));
    }));
};
export const errorInterceptor = (request, next) => {
    const errors = inject(Errors);
    const notifications = inject(Notifications);
    return next(request).pipe(catchError((error) => {
        if (!request.context.get(QUIET_REQUEST) &&
            !request.url.endsWith('/auth/refresh') &&
            error.error?.code !== 'auth.mfa_setup_required') {
            const problem = {
                code: error.error?.code ?? 'network.failed',
                traceId: error.error?.traceId,
                title: error.error?.title,
                errors: error.error?.errors,
            };
            errors.problem.set(problem);
            notifications.error(problem);
        }
        return throwError(() => error);
    }));
};
