import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmInputOtpGroup {
    constructor() {
        classes(() => 'has-data-[matches-spartan-invalid=true]:ring-destructive/20 dark:has-data-[matches-spartan-invalid=true]:ring-destructive/40 has-data-[matches-spartan-invalid=true]:border-destructive rounded-md has-data-[matches-spartan-invalid=true]:ring-3 flex items-center');
    }
    static ɵfac = function HlmInputOtpGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputOtpGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInputOtpGroup, selectors: [["", "hlmInputOtpGroup", ""], ["hlm-input-otp-group"]], hostAttrs: ["data-slot", "input-otp-group"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputOtpGroup, [{
        type: Directive,
        args: [{
                selector: '[hlmInputOtpGroup],hlm-input-otp-group',
                host: { 'data-slot': 'input-otp-group' },
            }]
    }], () => [], null); })();
