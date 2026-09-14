import { booleanAttribute, ChangeDetectionStrategy, Component, input, numberAttribute, } from '@angular/core';
import { BrnInputOtpSlot } from '@spartan-ng/brain/input-otp';
import { classes } from '@spartan-ng/helm/utils';
import { HlmInputOtpFakeCaret } from './hlm-input-otp-fake-caret';
import * as i0 from "@angular/core";
export class HlmInputOtpSlot {
    /** The index of the slot to render the char or a fake caret */
    index = input.required({ ...(ngDevMode ? { debugName: "index" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    /** Whether to force the input into an invalid state. */
    forceInvalid = input(false, { ...(ngDevMode ? { debugName: "forceInvalid" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => 'dark:bg-input/30 border-input has-[brn-input-otp-slot[data-active="true"]]:border-ring has-[brn-input-otp-slot[data-active="true"]]:ring-ring/50 has-[brn-input-otp-slot[data-active="true"]]:has-data-[matches-spartan-invalid=true]:ring-destructive/20 dark:has-[brn-input-otp-slot[data-active="true"]]:has-data-[matches-spartan-invalid=true]:ring-destructive/40 has-data-[matches-spartan-invalid=true]:border-destructive has-[brn-input-otp-slot[data-active="true"]]:has-data-[matches-spartan-invalid=true]:border-destructive size-9 border-y border-e text-sm shadow-xs transition-all outline-none first:rounded-s-md first:border-s last:rounded-e-md has-[brn-input-otp-slot[data-active="true"]]:ring-3 relative flex items-center justify-center has-[brn-input-otp-slot[data-active="true"]]:z-10');
    }
    static ɵfac = function HlmInputOtpSlot_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputOtpSlot)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmInputOtpSlot, selectors: [["hlm-input-otp-slot"]], hostAttrs: ["data-slot", "input-otp-slot"], inputs: { index: [1, "index"], forceInvalid: [1, "forceInvalid"] }, decls: 2, vars: 2, consts: [[3, "index", "forceInvalid"]], template: function HlmInputOtpSlot_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "brn-input-otp-slot", 0);
            i0.ɵɵelement(1, "hlm-input-otp-fake-caret");
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("index", ctx.index())("forceInvalid", ctx.forceInvalid());
        } }, dependencies: [BrnInputOtpSlot, HlmInputOtpFakeCaret], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputOtpSlot, [{
        type: Component,
        args: [{
                selector: 'hlm-input-otp-slot',
                imports: [BrnInputOtpSlot, HlmInputOtpFakeCaret],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: { 'data-slot': 'input-otp-slot' },
                template: `
    <brn-input-otp-slot [index]="index()" [forceInvalid]="forceInvalid()">
      <hlm-input-otp-fake-caret />
    </brn-input-otp-slot>
  `,
            }]
    }], () => [], { index: [{ type: i0.Input, args: [{ isSignal: true, alias: "index", required: true }] }], forceInvalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "forceInvalid", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmInputOtpSlot, { className: "HlmInputOtpSlot", filePath: "libs/ui/input-otp/src/lib/hlm-input-otp-slot.ts", lineNumber: 24 }); })();
