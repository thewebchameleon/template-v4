import { Directive } from '@angular/core';
import { BrnDialogClose } from '@spartan-ng/brain/dialog';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/dialog";
export class HlmDialogClose {
    static ɵfac = function HlmDialogClose_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogClose)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogClose, selectors: [["button", "hlmDialogClose", ""]], hostAttrs: ["data-slot", "dialog-close"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnDialogClose])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogClose, [{
        type: Directive,
        args: [{
                selector: 'button[hlmDialogClose]',
                hostDirectives: [BrnDialogClose],
                host: { 'data-slot': 'dialog-close' },
            }]
    }], null, null); })();
