import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmNativeSelectOption {
    constructor() {
        classes(() => 'bg-[Canvas] text-[CanvasText]');
    }
    static ɵfac = function HlmNativeSelectOption_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmNativeSelectOption)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmNativeSelectOption, selectors: [["option", "hlmNativeSelectOption", ""]], hostAttrs: ["data-slot", "native-select-option"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmNativeSelectOption, [{
        type: Directive,
        args: [{
                selector: 'option[hlmNativeSelectOption]',
                host: { 'data-slot': 'native-select-option' },
            }]
    }], () => [], null); })();
