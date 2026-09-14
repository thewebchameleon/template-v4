import { Runtime } from './runtime';
import { DestroyRef, Injectable, Pipe, inject, signal } from '@angular/core';
import { dictionary } from './translations';
import * as i0 from "@angular/core";
const storageKey = 'templatev4-culture';
export class I18n {
    timeZone = signal('UTC', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "timeZone" }] : /* istanbul ignore next */ []));
    runtime = inject(Runtime);
    culture = signal(this.runtime.supportedCultures.includes(document.documentElement.lang)
        ? document.documentElement.lang
        : (this.runtime.supportedCultures.find((c) => c.toLowerCase() === navigator.language.toLowerCase()) ?? this.runtime.defaultCulture), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "culture" }] : /* istanbul ignore next */ []));
    constructor() {
        document.documentElement.lang = this.culture();
        const onStorageChange = (event) => {
            if (event.key !== storageKey && event.key !== null)
                return;
            if (event.storageArea !== window.localStorage)
                return;
            this.apply(event.newValue ?? this.runtime.defaultCulture, false);
        };
        window.addEventListener('storage', onStorageChange);
        inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorageChange));
    }
    text(key) {
        return dictionary[key]?.[this.culture() === 'af-ZA' ? 1 : 0] ?? key;
    }
    set(culture) {
        this.apply(culture, true);
    }
    apply(culture, persist) {
        this.culture.set(this.runtime.supportedCultures.includes(culture) ? culture : this.runtime.defaultCulture);
        document.documentElement.lang = this.culture();
        if (!persist)
            return;
        try {
            localStorage.setItem(storageKey, this.culture());
        }
        catch {
            // Keep the selected language for this page when storage is unavailable.
        }
    }
    dates = new Map();
    numbers = new Map();
    date(value) {
        const culture = this.culture();
        const timeZone = this.timeZone();
        const key = `${culture}:${timeZone}`;
        if (!this.dates.has(key))
            this.dates.set(key, new Intl.DateTimeFormat(culture, { dateStyle: 'medium', timeStyle: 'short', timeZone }));
        return this.dates.get(key).format(new Date(value));
    }
    number(value) {
        const culture = this.culture();
        if (!this.numbers.has(culture))
            this.numbers.set(culture, new Intl.NumberFormat(culture));
        return this.numbers.get(culture).format(value);
    }
    currency(value, currency = 'ZAR') {
        return new Intl.NumberFormat(this.culture(), { style: 'currency', currency }).format(value);
    }
    static ɵfac = function I18n_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || I18n)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: I18n, factory: I18n.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(I18n, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
export class Translate {
    i18n = inject(I18n);
    transform(key) {
        return this.i18n.text(key);
    }
    static ɵfac = function Translate_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Translate)(); };
    static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "t", type: Translate, pure: false });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Translate, [{
        type: Pipe,
        args: [{ name: 't', pure: false }]
    }], null, null); })();
