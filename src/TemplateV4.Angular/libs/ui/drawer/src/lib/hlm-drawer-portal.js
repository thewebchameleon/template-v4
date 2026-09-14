import { Directive } from '@angular/core';
import { BrnDrawerContent } from '@spartan-ng/brain/drawer';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/drawer";
export class HlmDrawerPortal {
    static ɵfac = function HlmDrawerPortal_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerPortal)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerPortal, selectors: [["", "hlmDrawerPortal", ""]], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnDrawerContent, inputs: ["context", "context", "class", "class"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerPortal, [{
        type: Directive,
        args: [{
                selector: '[hlmDrawerPortal]',
                hostDirectives: [{ directive: BrnDrawerContent, inputs: ['context', 'class'] }],
            }]
    }], null, null); })();
