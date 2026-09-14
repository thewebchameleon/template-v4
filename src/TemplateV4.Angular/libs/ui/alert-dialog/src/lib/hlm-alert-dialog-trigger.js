import { Directive } from '@angular/core';
import { BrnAlertDialogTrigger } from '@spartan-ng/brain/alert-dialog';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/alert-dialog";
export class HlmAlertDialogTrigger {
    static ɵfac = function HlmAlertDialogTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogTrigger, selectors: [["button", "hlmAlertDialogTrigger", ""], ["button", "hlmAlertDialogTriggerFor", ""]], hostAttrs: ["data-slot", "alert-dialog-trigger"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnAlertDialogTrigger, inputs: ["id", "id", "brnAlertDialogTriggerFor", "hlmAlertDialogTriggerFor", "type", "type"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogTrigger, [{
        type: Directive,
        args: [{
                selector: 'button[hlmAlertDialogTrigger],button[hlmAlertDialogTriggerFor]',
                hostDirectives: [
                    {
                        directive: BrnAlertDialogTrigger,
                        inputs: ['id', 'brnAlertDialogTriggerFor: hlmAlertDialogTriggerFor', 'type'],
                    },
                ],
                host: { 'data-slot': 'alert-dialog-trigger' },
            }]
    }], null, null); })();
