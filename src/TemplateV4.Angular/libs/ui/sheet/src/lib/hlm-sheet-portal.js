import { Directive } from '@angular/core';
import { BrnSheetContent } from '@spartan-ng/brain/sheet';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/sheet";
export class HlmSheetPortal {
    static ɵfac = function HlmSheetPortal_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetPortal)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSheetPortal, selectors: [["", "hlmSheetPortal", ""]], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSheetContent, inputs: ["context", "context", "class", "class"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetPortal, [{
        type: Directive,
        args: [{
                selector: '[hlmSheetPortal]',
                hostDirectives: [{ directive: BrnSheetContent, inputs: ['context', 'class'] }],
            }]
    }], null, null); })();
