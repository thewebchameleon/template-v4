import { Directive } from '@angular/core';
import { BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/popover";
export class HlmPopoverTrigger {
    static ɵfac = function HlmPopoverTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmPopoverTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmPopoverTrigger, selectors: [["button", "hlmPopoverTrigger", ""], ["button", "hlmPopoverTriggerFor", ""]], hostAttrs: ["data-slot", "popover-trigger"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnPopoverTrigger, inputs: ["id", "id", "brnPopoverTriggerFor", "hlmPopoverTriggerFor", "type", "type"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmPopoverTrigger, [{
        type: Directive,
        args: [{
                selector: 'button[hlmPopoverTrigger],button[hlmPopoverTriggerFor]',
                hostDirectives: [
                    {
                        directive: BrnPopoverTrigger,
                        inputs: ['id', 'brnPopoverTriggerFor: hlmPopoverTriggerFor', 'type'],
                    },
                ],
                host: { 'data-slot': 'popover-trigger' },
            }]
    }], null, null); })();
