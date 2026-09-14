import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAlertDialogFooter {
    constructor() {
        classes(() => 'flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end');
    }
    static ɵfac = function HlmAlertDialogFooter_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogFooter)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogFooter, selectors: [["", "hlmAlertDialogFooter", ""], ["hlm-alert-dialog-footer"]], hostAttrs: ["data-slot", "alert-dialog-footer"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogFooter, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogFooter],hlm-alert-dialog-footer',
                host: { 'data-slot': 'alert-dialog-footer' },
            }]
    }], () => [], null); })();
