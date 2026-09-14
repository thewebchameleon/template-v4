import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSelectValuesContent {
    constructor() {
        classes(() => 'gap-2 flex');
    }
    static ɵfac = function HlmSelectValuesContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectValuesContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectValuesContent, selectors: [["", "hlmSelectValuesContent", ""], ["hlm-select-values-content"]] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectValuesContent, [{
        type: Directive,
        args: [{ selector: '[hlmSelectValuesContent],hlm-select-values-content' }]
    }], () => [], null); })();
