import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmInputOtpSeparator {
    constructor() {
        classes(() => "[&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] flex items-center");
    }
    static ɵfac = function HlmInputOtpSeparator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputOtpSeparator)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmInputOtpSeparator, selectors: [["hlm-input-otp-separator"]], hostAttrs: ["role", "separator", "data-slot", "input-otp-separator"], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideMinus })])], decls: 1, vars: 0, consts: [["name", "lucideMinus"]], template: function HlmInputOtpSeparator_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputOtpSeparator, [{
        type: Component,
        args: [{
                selector: 'hlm-input-otp-separator',
                imports: [NgIcon],
                providers: [provideIcons({ lucideMinus })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    role: 'separator',
                    'data-slot': 'input-otp-separator',
                },
                template: ` <ng-icon name="lucideMinus" /> `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmInputOtpSeparator, { className: "HlmInputOtpSeparator", filePath: "libs/ui/input-otp/src/lib/hlm-input-otp-separator.ts", lineNumber: 17 }); })();
