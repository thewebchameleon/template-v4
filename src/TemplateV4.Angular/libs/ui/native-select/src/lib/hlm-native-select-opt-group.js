import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmNativeSelectOptGroup {
    constructor() {
        classes(() => 'bg-[Canvas] text-[CanvasText]');
    }
    static ɵfac = function HlmNativeSelectOptGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmNativeSelectOptGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmNativeSelectOptGroup, selectors: [["optgroup", "hlmNativeSelectOptGroup", ""]], hostAttrs: ["data-slot", "native-select-optgroup"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmNativeSelectOptGroup, [{
        type: Directive,
        args: [{
                selector: 'optgroup[hlmNativeSelectOptGroup]',
                host: { 'data-slot': 'native-select-optgroup' },
            }]
    }], () => [], null); })();
