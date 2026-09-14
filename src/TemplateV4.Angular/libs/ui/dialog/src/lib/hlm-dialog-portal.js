import { Directive } from '@angular/core';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/dialog";
export class HlmDialogPortal {
    static ɵfac = function HlmDialogPortal_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogPortal)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogPortal, selectors: [["", "hlmDialogPortal", ""]], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnDialogContent, inputs: ["context", "context", "class", "class"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogPortal, [{
        type: Directive,
        args: [{
                selector: '[hlmDialogPortal]',
                hostDirectives: [{ directive: BrnDialogContent, inputs: ['context', 'class'] }],
            }]
    }], null, null); })();
