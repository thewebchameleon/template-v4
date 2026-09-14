import { Directive } from '@angular/core';
import { BrnAlertDialogTitle } from '@spartan-ng/brain/alert-dialog';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/alert-dialog";
export class HlmAlertDialogTitle {
    constructor() {
        classes(() => 'text-lg font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2');
    }
    static ɵfac = function HlmAlertDialogTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogTitle, selectors: [["", "hlmAlertDialogTitle", ""]], hostAttrs: ["data-slot", "alert-dialog-title"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnAlertDialogTitle])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogTitle]',
                hostDirectives: [BrnAlertDialogTitle],
                host: { 'data-slot': 'alert-dialog-title' },
            }]
    }], () => [], null); })();
