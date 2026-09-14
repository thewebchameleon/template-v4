import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmFieldContent {
    constructor() {
        classes(() => 'gap-1 group/field-content flex flex-1 flex-col leading-snug');
    }
    static ɵfac = function HlmFieldContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmFieldContent, selectors: [["", "hlmFieldContent", ""], ["hlm-field-content"]], hostAttrs: ["data-slot", "field-content"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldContent, [{
        type: Directive,
        args: [{
                selector: '[hlmFieldContent],hlm-field-content',
                host: { 'data-slot': 'field-content' },
            }]
    }], () => [], null); })();
