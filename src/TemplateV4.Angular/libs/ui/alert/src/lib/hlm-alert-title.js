import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAlertTitle {
    constructor() {
        classes(() => 'font-medium group-has-[>ng-icon]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3');
    }
    static ɵfac = function HlmAlertTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertTitle, selectors: [["", "hlmAlertTitle", ""]], hostAttrs: ["data-slot", "alert-title"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertTitle]',
                host: {
                    'data-slot': 'alert-title',
                },
            }]
    }], () => [], null); })();
