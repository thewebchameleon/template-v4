import { Router } from '@angular/router';
import { Auth } from './auth';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Runtime } from './runtime';
import * as i0 from "@angular/core";
export class Features {
    http = inject(HttpClient);
    runtime = inject(Runtime);
    capabilities = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "capabilities" }] : /* istanbul ignore next */ []));
    generation = 0;
    pending;
    load() {
        if (this.pending)
            return this.pending;
        const generation = this.generation;
        const pending = this.fetch(generation)
            .catch(() => {
            if (generation === this.generation) {
                this.capabilities.set({});
            }
        })
            // A sign-in reset can supersede a route guard's in-flight fetch. Wait for
            // the current actor's modules before the guard decides whether to redirect.
            .then(() => (generation === this.generation ? undefined : this.load()))
            .finally(() => {
            if (this.pending === pending)
                this.pending = undefined;
        });
        return (this.pending = pending);
    }
    reset() {
        this.generation++;
        this.pending = undefined;
        this.capabilities.set({});
    }
    async fetch(generation) {
        const capabilities = await firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/capabilities`));
        if (generation !== this.generation)
            return;
        this.capabilities.set(capabilities);
    }
    enabled(name) {
        return this.capabilities()[name] === true;
    }
    static ɵfac = function Features_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Features)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Features, factory: Features.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Features, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
export const capabilityGuard = (name) => async () => {
    const auth = inject(Auth);
    const features = inject(Features);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh()))
        return router.createUrlTree(['/login']);
    await features.load();
    return features.enabled(name) || router.createUrlTree(['/me']);
};
