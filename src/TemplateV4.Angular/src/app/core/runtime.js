import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class Runtime {
    apiUrl = '';
    defaultCulture = 'en-ZA';
    supportedCultures = ['en-ZA', 'af-ZA'];
    async load() {
        const response = await fetch('/runtime-config.json', { cache: 'no-store' });
        if (!response.ok)
            throw new Error('Runtime configuration unavailable');
        const value = await response.json();
        if (typeof value.apiUrl !== 'string' || !Array.isArray(value.supportedCultures))
            throw new Error('Invalid runtime configuration');
        this.apiUrl = value.apiUrl.replace(/\/$/, '');
        this.defaultCulture = value.defaultCulture;
        this.supportedCultures = value.supportedCultures;
        if (!this.supportedCultures.includes(this.defaultCulture))
            throw new Error('Default culture is not supported');
    }
    static ɵfac = function Runtime_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Runtime)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Runtime, factory: Runtime.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Runtime, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
