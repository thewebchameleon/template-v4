import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmPopoverDescription {
    constructor() {
        classes(() => 'text-muted-foreground');
    }
    static ɵfac = function HlmPopoverDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmPopoverDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmPopoverDescription, selectors: [["", "hlmPopoverDescription", ""]], hostAttrs: ["data-slot", "popover-description"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmPopoverDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmPopoverDescription]',
                host: { 'data-slot': 'popover-description' },
            }]
    }], () => [], null); })();
