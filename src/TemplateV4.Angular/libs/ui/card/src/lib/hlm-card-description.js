import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmCardDescription {
    constructor() {
        classes(() => 'text-sm text-muted-foreground/80');
    }
    static ɵfac = function HlmCardDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCardDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmCardDescription, selectors: [["", "hlmCardDescription", ""]], hostAttrs: ["data-slot", "card-description"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCardDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmCardDescription]',
                host: { 'data-slot': 'card-description' },
            }]
    }], () => [], null); })();
