import { Directive } from '@angular/core';
import { BrnSheetClose } from '@spartan-ng/brain/sheet';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/sheet";
export class HlmSheetClose {
    static ɵfac = function HlmSheetClose_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetClose)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSheetClose, selectors: [["button", "hlmSheetClose", ""]], hostAttrs: ["data-slot", "sheet-close"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnSheetClose])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetClose, [{
        type: Directive,
        args: [{
                selector: 'button[hlmSheetClose]',
                hostDirectives: [BrnSheetClose],
                host: { 'data-slot': 'sheet-close' },
            }]
    }], null, null); })();
