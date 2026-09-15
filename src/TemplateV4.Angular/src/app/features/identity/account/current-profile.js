import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Auth } from '../../../core/auth';
import { HttpClient } from '@angular/common/http';
import { Runtime } from '../../../core/runtime';
import * as i0 from "@angular/core";
export class CurrentProfile {
    value = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    constructor() {
        const auth = inject(Auth);
        const http = inject(HttpClient);
        const runtime = inject(Runtime);
        const actor = computed(() => auth.access()?.userId, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "actor" }] : /* istanbul ignore next */ []));
        effect((cleanup) => {
            const userId = actor();
            this.value.set(null);
            if (!userId)
                return;
            const subscription = http
                .get(`${runtime.apiUrl}/api/v1/auth/profile`)
                .subscribe({
                next: (profile) => this.value.update((current) => current ?? profile),
                error: () => {
                    /* Keep the fallback icon when the photo cannot load. */
                },
            });
            cleanup(() => subscription.unsubscribe());
        });
    }
    static ɵfac = function CurrentProfile_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CurrentProfile)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: CurrentProfile, factory: CurrentProfile.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CurrentProfile, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
