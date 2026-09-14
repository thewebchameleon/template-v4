import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmCardTitle {
    constructor() {
        classes(() => 'text-sm font-medium uppercase leading-normal tracking-wide text-muted-foreground group-data-[size=sm]/card:text-xs');
    }
    static ɵfac = function HlmCardTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCardTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmCardTitle, selectors: [["", "hlmCardTitle", ""]], hostAttrs: ["data-slot", "card-title"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCardTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmCardTitle]',
                host: { 'data-slot': 'card-title' },
            }]
    }], () => [], null); })();
