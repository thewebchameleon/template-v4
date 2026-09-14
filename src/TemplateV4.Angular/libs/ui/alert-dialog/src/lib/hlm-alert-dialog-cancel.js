import { Directive, input } from '@angular/core';
import { BrnDialogClose } from '@spartan-ng/brain/dialog';
import { HlmButton, provideBrnButtonConfig } from '@spartan-ng/helm/button';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/dialog";
import * as i2 from "@spartan-ng/helm/button";
export class HlmAlertDialogCancel {
    type = input('button', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "type" }] : /* istanbul ignore next */ []));
    static ɵfac = function HlmAlertDialogCancel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogCancel)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogCancel, selectors: [["button", "hlmAlertDialogCancel", ""]], hostAttrs: ["data-slot", "alert-dialog-cancel"], hostVars: 1, hostBindings: function HlmAlertDialogCancel_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵdomProperty("type", ctx.type());
        } }, inputs: { type: [1, "type"] }, features: [i0.ɵɵProvidersFeature([provideBrnButtonConfig({ variant: 'outline' })]), i0.ɵɵHostDirectivesFeature([i1.BrnDialogClose, { directive: i2.HlmButton, inputs: ["variant", "variant", "size", "size"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogCancel, [{
        type: Directive,
        args: [{
                selector: 'button[hlmAlertDialogCancel]',
                providers: [provideBrnButtonConfig({ variant: 'outline' })],
                hostDirectives: [BrnDialogClose, { directive: HlmButton, inputs: ['variant', 'size'] }],
                host: { 'data-slot': 'alert-dialog-cancel', '[type]': 'type()' },
            }]
    }], null, { type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: false }] }] }); })();
