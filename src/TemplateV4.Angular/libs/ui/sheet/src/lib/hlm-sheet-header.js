import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSheetHeader {
    constructor() {
        classes(() => 'gap-1.5 p-4 flex flex-col');
    }
    static ɵfac = function HlmSheetHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSheetHeader, selectors: [["", "hlmSheetHeader", ""], ["hlm-sheet-header"]], hostAttrs: ["data-slot", "sheet-header"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmSheetHeader],hlm-sheet-header',
                host: { 'data-slot': 'sheet-header' },
            }]
    }], () => [], null); })();
