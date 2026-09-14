import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDialogHeader {
    constructor() {
        classes(() => 'gap-2 flex flex-col');
    }
    static ɵfac = function HlmDialogHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogHeader, selectors: [["", "hlmDialogHeader", ""], ["hlm-dialog-header"]], hostAttrs: ["data-slot", "dialog-header"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmDialogHeader],hlm-dialog-header',
                host: { 'data-slot': 'dialog-header' },
            }]
    }], () => [], null); })();
