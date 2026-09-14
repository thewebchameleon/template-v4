import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import * as i0 from "@angular/core";
const storageKey = 'templatev4-ui-preferences';
const defaults = {
    textSize: 'default',
    contrast: 'standard',
    motion: 'system',
    density: 'comfortable',
};
const normalize = (value) => ({
    textSize: value?.textSize === 'large' || value?.textSize === 'extra-large' ? value.textSize : 'default',
    contrast: value?.contrast === 'high' ? 'high' : 'standard',
    motion: value?.motion === 'reduced' ? 'reduced' : 'system',
    density: value?.density === 'compact' ? 'compact' : 'comfortable',
});
const parse = (value) => {
    if (!value)
        return defaults;
    try {
        return normalize(JSON.parse(value));
    }
    catch {
        return defaults;
    }
};
export class UiPreferences {
    root = inject(DOCUMENT).documentElement;
    state = signal(normalize({
        textSize: this.root.dataset['textSize'],
        contrast: this.root.dataset['contrast'],
        motion: this.root.dataset['motion'],
        density: this.root.dataset['density'],
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    textSize = () => this.state().textSize;
    contrast = () => this.state().contrast;
    motion = () => this.state().motion;
    density = () => this.state().density;
    constructor() {
        const onStorageChange = (event) => {
            if (event.key !== storageKey && event.key !== null)
                return;
            if (event.storageArea !== window.localStorage)
                return;
            this.state.set(parse(event.newValue));
            this.apply();
        };
        window.addEventListener('storage', onStorageChange);
        inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorageChange));
        this.apply();
    }
    setTextSize(value) {
        if (value !== 'default' && value !== 'large' && value !== 'extra-large')
            return;
        this.update({ textSize: value });
    }
    setContrast(value) {
        if (value !== 'standard' && value !== 'high')
            return;
        this.update({ contrast: value });
    }
    setMotion(value) {
        if (value !== 'system' && value !== 'reduced')
            return;
        this.update({ motion: value });
    }
    setDensity(value) {
        if (value !== 'comfortable' && value !== 'compact')
            return;
        this.update({ density: value });
    }
    reset() {
        this.state.set(defaults);
        this.apply();
        try {
            localStorage.removeItem(storageKey);
        }
        catch {
            // Keep the defaults active for this page when storage is unavailable.
        }
    }
    update(change) {
        this.state.update((current) => ({ ...current, ...change }));
        this.apply();
        try {
            localStorage.setItem(storageKey, JSON.stringify(this.state()));
        }
        catch {
            // Keep preferences active for this page when storage is unavailable.
        }
    }
    apply() {
        const state = this.state();
        this.root.dataset['textSize'] = state.textSize;
        this.root.dataset['contrast'] = state.contrast;
        this.root.dataset['motion'] = state.motion;
        this.root.dataset['density'] = state.density;
    }
    static ɵfac = function UiPreferences_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UiPreferences)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UiPreferences, factory: UiPreferences.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UiPreferences, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
