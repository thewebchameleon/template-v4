import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Runtime } from './runtime';
import { Errors } from './interceptors';
import { Auth } from './auth';
import * as i0 from "@angular/core";
export class Bootstrap {
    http = inject(HttpClient);
    runtime = inject(Runtime);
    csrf = '';
    status;
    available() {
        if (this.status && Date.now() - this.status.at < 10000)
            return this.status.value;
        const value = this.fetchAvailable().catch((error) => {
            this.status = undefined;
            throw error;
        });
        this.status = { at: Date.now(), value };
        return value;
    }
    fetchAvailable() {
        return firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/bootstrap/status`));
    }
    create(request) {
        this.status = undefined;
        return this.createWithAntiforgery(request).finally(() => {
            this.status = undefined;
        });
    }
    async createWithAntiforgery(request) {
        if (!this.csrf) {
            this.csrf = (await firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/auth/csrf`, {
                withCredentials: true,
            }))).token;
        }
        await firstValueFrom(this.http.post(`${this.runtime.apiUrl}/api/v1/bootstrap`, request, {
            withCredentials: true,
            headers: { 'X-CSRF-TOKEN': this.csrf },
        }));
        this.csrf = '';
    }
    static ɵfac = function Bootstrap_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Bootstrap)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Bootstrap, factory: Bootstrap.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Bootstrap, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
export const bootstrapLandingGuard = async () => {
    const bootstrap = inject(Bootstrap);
    const errors = inject(Errors);
    const auth = inject(Auth);
    const router = inject(Router);
    try {
        if ((await bootstrap.available()).available)
            return router.createUrlTree(['/bootstrap']);
        if (!auth.access() && !(await auth.refresh()))
            return router.createUrlTree(['/login']);
        return router.createUrlTree([auth.landing()]);
    }
    catch {
        errors.problem.set(null);
        return router.createUrlTree(['/login']);
    }
};
export const bootstrapLoginGuard = async () => {
    const bootstrap = inject(Bootstrap);
    const errors = inject(Errors);
    const auth = inject(Auth);
    const router = inject(Router);
    try {
        if (auth.access() || (await auth.refresh()))
            return router.createUrlTree([auth.landing()]);
        return (await bootstrap.available()).available ? router.createUrlTree(['/bootstrap']) : true;
    }
    catch {
        errors.problem.set(null);
        return true;
    }
};
