import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAlertDescription {
    constructor() {
        classes(() => 'text-muted-foreground text-sm text-balance md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3');
    }
    static ɵfac = function HlmAlertDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDescription, selectors: [["", "hlmAlertDescription", ""]], hostAttrs: ["data-slot", "alert-description"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDescription]',
                host: {
                    'data-slot': 'alert-description',
                },
            }]
    }], () => [], null); })();
