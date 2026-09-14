import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDialogFooter {
    constructor() {
        classes(() => 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end');
    }
    static ɵfac = function HlmDialogFooter_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogFooter)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogFooter, selectors: [["", "hlmDialogFooter", ""], ["hlm-dialog-footer"]], hostAttrs: ["data-slot", "dialog-footer"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogFooter, [{
        type: Directive,
        args: [{
                selector: '[hlmDialogFooter],hlm-dialog-footer',
                host: { 'data-slot': 'dialog-footer' },
            }]
    }], () => [], null); })();
