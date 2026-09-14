import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSheetFooter {
    constructor() {
        classes(() => 'gap-2 p-4 mt-auto flex flex-col');
    }
    static ɵfac = function HlmSheetFooter_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetFooter)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSheetFooter, selectors: [["", "hlmSheetFooter", ""], ["hlm-sheet-footer"]], hostAttrs: ["data-slot", "sheet-footer"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetFooter, [{
        type: Directive,
        args: [{
                selector: '[hlmSheetFooter],hlm-sheet-footer',
                host: { 'data-slot': 'sheet-footer' },
            }]
    }], () => [], null); })();
