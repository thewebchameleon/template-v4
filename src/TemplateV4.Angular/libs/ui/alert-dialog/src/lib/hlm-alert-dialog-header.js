import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAlertDialogHeader {
    constructor() {
        classes(() => 'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-start sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]');
    }
    static ɵfac = function HlmAlertDialogHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogHeader, selectors: [["", "hlmAlertDialogHeader", ""], ["hlm-alert-dialog-header"]], hostAttrs: ["data-slot", "alert-dialog-header"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogHeader],hlm-alert-dialog-header',
                host: { 'data-slot': 'alert-dialog-header' },
            }]
    }], () => [], null); })();
