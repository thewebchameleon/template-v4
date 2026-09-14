import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmCardAction {
    constructor() {
        classes(() => 'col-start-2 row-span-2 row-start-1 self-start justify-self-end');
    }
    static ɵfac = function HlmCardAction_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCardAction)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmCardAction, selectors: [["", "hlmCardAction", ""]], hostAttrs: ["data-slot", "card-action"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCardAction, [{
        type: Directive,
        args: [{
                selector: '[hlmCardAction]',
                host: { 'data-slot': 'card-action' },
            }]
    }], () => [], null); })();
