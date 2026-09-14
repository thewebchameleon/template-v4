import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Auth } from './auth';
import { Runtime } from './runtime';
import * as i0 from "@angular/core";
export class Registration {
    http = inject(HttpClient);
    runtime = inject(Runtime);
    auth = inject(Auth);
    status() {
        return firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/auth/registration`));
    }
    register(request) {
        return this.auth.action('register', request);
    }
    static ɵfac = function Registration_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Registration)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Registration, factory: Registration.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Registration, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
