import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { getAnalyser, play, set, unlock } from '@foleyjs/core';
import * as i0 from "@angular/core";
const storageKey = 'templatev4-sound-muted';
export class UiSounds {
    document = inject(DOCUMENT);
    selected = signal(this.readMuted(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
    muted = this.selected.asReadonly();
    constructor() {
        set({ theme: 'soft', volume: 0.35, muted: this.muted(), hover: false });
        // Programmatic cues only: unlock on a real gesture without binding global UI sounds.
        const activate = (event) => {
            if (!event.isTrusted || this.muted())
                return;
            try {
                unlock();
            }
            catch {
                // Audio is optional; unsupported browsers still complete the interaction.
            }
        };
        const synchronize = (event) => {
            if (event.key !== storageKey && event.key !== null)
                return;
            try {
                if (event.storageArea !== window.localStorage)
                    return;
                this.apply(event.newValue === 'true');
            }
            catch {
                // Keep this page's preference when storage is unavailable.
            }
        };
        this.document.addEventListener('pointerdown', activate, true);
        this.document.addEventListener('keydown', activate, true);
        window.addEventListener('storage', synchronize);
        inject(DestroyRef).onDestroy(() => {
            this.document.removeEventListener('pointerdown', activate, true);
            this.document.removeEventListener('keydown', activate, true);
            window.removeEventListener('storage', synchronize);
        });
    }
    play(cue) {
        // Do not queue old feedback for the next gesture or announce background refreshes.
        if (this.muted() || this.document.visibilityState !== 'visible')
            return;
        try {
            if (getAnalyser()?.context.state === 'running')
                play(cue);
        }
        catch {
            // A failed sound must never turn a successful operation into an error.
        }
    }
    setMuted(muted) {
        this.apply(muted);
        try {
            localStorage.setItem(storageKey, String(muted));
        }
        catch {
            // Keep the preference active for this page when storage is blocked.
        }
    }
    reset() {
        this.apply(false);
        try {
            localStorage.removeItem(storageKey);
        }
        catch {
            // Keep the default active for this page when storage is blocked.
        }
    }
    apply(muted) {
        this.selected.set(muted);
        set({ muted });
    }
    readMuted() {
        try {
            return localStorage.getItem(storageKey) === 'true';
        }
        catch {
            return false;
        }
    }
    static ɵfac = function UiSounds_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UiSounds)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UiSounds, factory: UiSounds.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UiSounds, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
