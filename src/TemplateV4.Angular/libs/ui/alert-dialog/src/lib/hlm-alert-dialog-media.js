import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAlertDialogMedia {
    constructor() {
        classes(() => "bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[ng-icon:not([class*='text-'])]:text-[length:--spacing(8)]");
    }
    static ɵfac = function HlmAlertDialogMedia_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogMedia)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogMedia, selectors: [["", "hlmAlertDialogMedia", ""], ["hlm-alert-dialog-media"]], hostAttrs: ["data-slot", "alert-dialog-media"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogMedia, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogMedia],hlm-alert-dialog-media',
                host: { 'data-slot': 'alert-dialog-media' },
            }]
    }], () => [], null); })();
