import { Directive } from '@angular/core';
import { BrnAlertDialogDescription } from '@spartan-ng/brain/alert-dialog';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/alert-dialog";
export class HlmAlertDialogDescription {
    constructor() {
        classes(() => 'text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3');
    }
    static ɵfac = function HlmAlertDialogDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogDescription, selectors: [["", "hlmAlertDialogDescription", ""]], hostAttrs: ["data-slot", "alert-dialog-description"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnAlertDialogDescription])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogDescription]',
                hostDirectives: [BrnAlertDialogDescription],
                host: { 'data-slot': 'alert-dialog-description' },
            }]
    }], () => [], null); })();
