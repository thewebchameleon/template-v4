import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAlertAction {
    constructor() {
        classes(() => 'absolute end-3 top-2.5');
    }
    static ɵfac = function HlmAlertAction_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertAction)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertAction, selectors: [["", "hlmAlertAction", ""]], hostAttrs: ["data-slot", "alert-action"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertAction, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertAction]',
                host: {
                    'data-slot': 'alert-action',
                },
            }]
    }], () => [], null); })();
