import { Directive } from '@angular/core';
import { BrnDrawerTrigger } from '@spartan-ng/brain/drawer';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/drawer";
export class HlmDrawerTrigger {
    static ɵfac = function HlmDrawerTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerTrigger, selectors: [["button", "hlmDrawerTrigger", ""]], hostAttrs: ["data-slot", "drawer-trigger"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnDrawerTrigger, inputs: ["id", "id", "direction", "direction", "type", "type"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerTrigger, [{
        type: Directive,
        args: [{
                selector: 'button[hlmDrawerTrigger]',
                hostDirectives: [{ directive: BrnDrawerTrigger, inputs: ['id', 'direction', 'type'] }],
                host: { 'data-slot': 'drawer-trigger' },
            }]
    }], null, null); })();
