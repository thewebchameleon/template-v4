import { Directive } from '@angular/core';
import { BrnDrawerClose } from '@spartan-ng/brain/drawer';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/drawer";
export class HlmDrawerClose {
    static ɵfac = function HlmDrawerClose_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerClose)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerClose, selectors: [["button", "hlmDrawerClose", ""]], hostAttrs: ["data-slot", "drawer-close"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnDrawerClose])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerClose, [{
        type: Directive,
        args: [{
                selector: 'button[hlmDrawerClose]',
                hostDirectives: [BrnDrawerClose],
                host: { 'data-slot': 'drawer-close' },
            }]
    }], null, null); })();
