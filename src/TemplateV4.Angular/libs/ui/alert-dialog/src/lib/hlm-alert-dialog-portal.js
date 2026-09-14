import { Directive } from '@angular/core';
import { BrnAlertDialogContent } from '@spartan-ng/brain/alert-dialog';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/alert-dialog";
export class HlmAlertDialogPortal {
    static ɵfac = function HlmAlertDialogPortal_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogPortal)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogPortal, selectors: [["", "hlmAlertDialogPortal", ""]], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnAlertDialogContent, inputs: ["context", "context", "class", "class"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogPortal, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogPortal]',
                hostDirectives: [{ directive: BrnAlertDialogContent, inputs: ['context', 'class'] }],
            }]
    }], null, null); })();
