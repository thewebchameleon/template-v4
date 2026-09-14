import { Directive, input } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
export class HlmAlertDialogAction {
    type = input('button', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "type" }] : /* istanbul ignore next */ []));
    static ɵfac = function HlmAlertDialogAction_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogAction)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogAction, selectors: [["button", "hlmAlertDialogAction", ""]], hostAttrs: ["data-slot", "alert-dialog-action"], hostVars: 1, hostBindings: function HlmAlertDialogAction_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵdomProperty("type", ctx.type());
        } }, inputs: { type: [1, "type"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.HlmButton, inputs: ["variant", "variant", "size", "size"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogAction, [{
        type: Directive,
        args: [{
                selector: 'button[hlmAlertDialogAction]',
                hostDirectives: [{ directive: HlmButton, inputs: ['variant', 'size'] }],
                host: { 'data-slot': 'alert-dialog-action', '[type]': 'type()' },
            }]
    }], null, { type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: false }] }] }); })();
