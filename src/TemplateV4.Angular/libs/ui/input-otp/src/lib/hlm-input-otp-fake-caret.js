import { ChangeDetectionStrategy, Component } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmInputOtpFakeCaret {
    constructor() {
        classes(() => 'pointer-events-none absolute inset-0 flex items-center justify-center');
    }
    static ɵfac = function HlmInputOtpFakeCaret_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputOtpFakeCaret)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmInputOtpFakeCaret, selectors: [["hlm-input-otp-fake-caret"]], decls: 1, vars: 0, consts: [[1, "animate-caret-blink", "bg-foreground", "h-4", "w-px", "duration-1000"]], template: function HlmInputOtpFakeCaret_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElement(0, "div", 0);
        } }, encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputOtpFakeCaret, [{
        type: Component,
        args: [{
                selector: 'hlm-input-otp-fake-caret',
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: ` <div class="animate-caret-blink bg-foreground h-4 w-px duration-1000"></div> `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmInputOtpFakeCaret, { className: "HlmInputOtpFakeCaret", filePath: "libs/ui/input-otp/src/lib/hlm-input-otp-fake-caret.ts", lineNumber: 9 }); })();
