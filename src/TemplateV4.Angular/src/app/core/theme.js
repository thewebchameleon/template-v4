import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import * as i0 from "@angular/core";
const storageKey = 'templatev4-theme';
const normalize = (value) => value === 'light' || value === 'dark' ? value : 'system';
export class Theme {
    root = inject(DOCUMENT).documentElement;
    media = window.matchMedia('(prefers-color-scheme: dark)');
    selected = signal(normalize(this.root.dataset['themePreference']), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
    preference = this.selected.asReadonly();
    constructor() {
        const onSystemChange = () => this.apply();
        const onStorageChange = (event) => {
            if (event.key !== storageKey && event.key !== null)
                return;
            if (event.storageArea !== window.localStorage)
                return;
            this.selected.set(normalize(event.newValue));
            this.apply();
        };
        this.media.addEventListener('change', onSystemChange);
        window.addEventListener('storage', onStorageChange);
        inject(DestroyRef).onDestroy(() => {
            this.media.removeEventListener('change', onSystemChange);
            window.removeEventListener('storage', onStorageChange);
        });
        this.apply();
    }
    set(value) {
        this.selected.set(normalize(value));
        this.apply();
        try {
            localStorage.setItem(storageKey, this.preference());
        }
        catch {
            // Keep the selected theme for this page even when storage is blocked.
        }
    }
    apply() {
        this.root.dataset['themePreference'] = this.preference();
        this.root.classList.toggle('dark', this.preference() === 'dark' || (this.preference() === 'system' && this.media.matches));
    }
    static ɵfac = function Theme_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Theme)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Theme, factory: Theme.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Theme, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
