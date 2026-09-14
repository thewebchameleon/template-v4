import { Directive } from '@angular/core';
import { BrnSheetTrigger } from '@spartan-ng/brain/sheet';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/sheet";
export class HlmSheetTrigger {
    static ɵfac = function HlmSheetTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSheetTrigger, selectors: [["button", "hlmSheetTrigger", ""]], hostAttrs: ["data-slot", "sheet-trigger"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSheetTrigger, inputs: ["id", "id", "side", "side", "type", "type"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetTrigger, [{
        type: Directive,
        args: [{
                selector: 'button[hlmSheetTrigger]',
                hostDirectives: [{ directive: BrnSheetTrigger, inputs: ['id', 'side', 'type'] }],
                host: { 'data-slot': 'sheet-trigger' },
            }]
    }], null, null); })();
