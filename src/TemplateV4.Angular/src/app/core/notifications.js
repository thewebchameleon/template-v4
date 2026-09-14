import { Injectable, inject } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { I18n } from './i18n';
import { UiSounds } from './ui-sounds';
import * as i0 from "@angular/core";
export class Notifications {
    i18n = inject(I18n);
    sounds = inject(UiSounds);
    success(key) {
        toast.success(this.i18n.text(key));
        this.sounds.play('success');
    }
    error(problem) {
        toast.error(problem.title?.trim() || this.i18n.text('error'), { important: true });
        this.sounds.play('error');
    }
    static ɵfac = function Notifications_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Notifications)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Notifications, factory: Notifications.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Notifications, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
