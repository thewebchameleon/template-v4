import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmPopoverHeader {
    constructor() {
        classes(() => 'flex flex-col gap-1 text-sm');
    }
    static ɵfac = function HlmPopoverHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmPopoverHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmPopoverHeader, selectors: [["", "hlmPopoverHeader", ""], ["hlm-popover-header"]], hostAttrs: ["data-slot", "popover-header"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmPopoverHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmPopoverHeader],hlm-popover-header',
                host: { 'data-slot': 'popover-header' },
            }]
    }], () => [], null); })();
