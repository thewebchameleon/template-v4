import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmInputOtp {
    constructor() {
        classes(() => 'gap-2 flex items-center has-disabled:opacity-50');
    }
    static ɵfac = function HlmInputOtp_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputOtp)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInputOtp, selectors: [["brn-input-otp", "hlmInputOtp", ""], ["brn-input-otp", "hlm", ""]], hostAttrs: ["data-slot", "input-otp"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputOtp, [{
        type: Directive,
        args: [{
                selector: 'brn-input-otp[hlmInputOtp], brn-input-otp[hlm]',
                host: { 'data-slot': 'input-otp' },
            }]
    }], () => [], null); })();
