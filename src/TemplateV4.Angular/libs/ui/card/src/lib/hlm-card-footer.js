import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmCardFooter {
    constructor() {
        classes(() => 'flex items-center rounded-(--panel-content-radius) bg-card px-(--card-spacing) pb-(--card-spacing) pt-4 shadow-xs ring-1 ring-foreground/10 group-has-[>_[data-slot=card-content]]/card:-mt-px group-has-[>_[data-slot=card-content]]/card:rounded-t-none');
    }
    static ɵfac = function HlmCardFooter_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCardFooter)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmCardFooter, selectors: [["", "hlmCardFooter", ""], ["hlm-card-footer"]], hostAttrs: ["data-slot", "card-footer"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCardFooter, [{
        type: Directive,
        args: [{
                selector: '[hlmCardFooter],hlm-card-footer',
                host: { 'data-slot': 'card-footer' },
            }]
    }], () => [], null); })();
