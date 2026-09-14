import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Runtime } from './runtime';
import { brandPalette, validPrimaryColor, DEFAULT_PRIMARY_COLOR } from './brand-palette';
import { DEFAULT_LOGIN_BACKGROUND, loginBackground } from './login-backgrounds';
import * as i0 from "@angular/core";
export class PlatformAppearanceTheme {
    primaryColor = signal(DEFAULT_PRIMARY_COLOR, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "primaryColor" }] : /* istanbul ignore next */ []));
    loginBackground = signal(DEFAULT_LOGIN_BACKGROUND, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loginBackground" }] : /* istanbul ignore next */ []));
    runtime = inject(Runtime);
    root = inject(DOCUMENT).documentElement;
    async load() {
        try {
            const response = await fetch(`${this.runtime.apiUrl}/api/v1/auth/appearance`, {
                cache: 'no-store',
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok)
                return;
            const value = await response.json();
            if (!value ||
                typeof value !== 'object' ||
                !('primaryColor' in value) ||
                typeof value.primaryColor !== 'string' ||
                !validPrimaryColor(value.primaryColor))
                return;
            this.apply(value.primaryColor);
            this.loginBackground.set(loginBackground('loginBackground' in value ? value.loginBackground : undefined).id);
        }
        catch {
            // Keep the bundled brand when offline or when configuration is unavailable.
        }
    }
    apply(primaryColor) {
        if (!validPrimaryColor(primaryColor))
            return;
        this.primaryColor.set(primaryColor);
        for (const [shade, color] of Object.entries(brandPalette(primaryColor)))
            this.root.style.setProperty(`--brand-primary-${shade}`, color);
    }
    static ɵfac = function PlatformAppearanceTheme_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PlatformAppearanceTheme)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PlatformAppearanceTheme, factory: PlatformAppearanceTheme.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PlatformAppearanceTheme, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
