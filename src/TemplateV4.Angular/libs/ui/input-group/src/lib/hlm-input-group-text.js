import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmInputGroupText {
    constructor() {
        classes(() => "text-muted-foreground gap-2 text-sm [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] flex items-center [&_ng-icon]:pointer-events-none");
    }
    static ɵfac = function HlmInputGroupText_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputGroupText)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInputGroupText, selectors: [["", "hlmInputGroupText", ""], ["hlm-input-group-text"]] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputGroupText, [{
        type: Directive,
        args: [{
                selector: '[hlmInputGroupText],hlm-input-group-text',
            }]
    }], () => [], null); })();
