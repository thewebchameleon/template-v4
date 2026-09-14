import { Directive } from '@angular/core';
import { BrnDialogTrigger } from '@spartan-ng/brain/dialog';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/dialog";
export class HlmDialogTrigger {
    static ɵfac = function HlmDialogTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogTrigger, selectors: [["button", "hlmDialogTrigger", ""], ["button", "hlmDialogTriggerFor", ""]], hostAttrs: ["data-slot", "dialog-trigger"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnDialogTrigger, inputs: ["id", "id", "brnDialogTriggerFor", "hlmDialogTriggerFor", "type", "type"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogTrigger, [{
        type: Directive,
        args: [{
                selector: 'button[hlmDialogTrigger],button[hlmDialogTriggerFor]',
                hostDirectives: [
                    {
                        directive: BrnDialogTrigger,
                        inputs: ['id', 'brnDialogTriggerFor: hlmDialogTriggerFor', 'type'],
                    },
                ],
                host: { 'data-slot': 'dialog-trigger' },
            }]
    }], null, null); })();
