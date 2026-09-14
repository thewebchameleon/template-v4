import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmPopoverTitle {
    constructor() {
        classes(() => 'font-medium');
    }
    static ɵfac = function HlmPopoverTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmPopoverTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmPopoverTitle, selectors: [["", "hlmPopoverTitle", ""]], hostAttrs: ["data-slot", "popover-title"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmPopoverTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmPopoverTitle]',
                host: { 'data-slot': 'popover-title' },
            }]
    }], () => [], null); })();
