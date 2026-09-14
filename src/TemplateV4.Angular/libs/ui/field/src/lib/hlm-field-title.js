import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmFieldTitle {
    constructor() {
        classes(() => 'gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50 flex w-fit items-center');
    }
    static ɵfac = function HlmFieldTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmFieldTitle, selectors: [["", "hlmFieldTitle", ""], ["hlm-field-title"]], hostAttrs: ["data-slot", "field-label"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmFieldTitle],hlm-field-title',
                host: { 'data-slot': 'field-label' },
            }]
    }], () => [], null); })();
