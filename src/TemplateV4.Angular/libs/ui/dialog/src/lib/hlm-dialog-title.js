import { Directive } from '@angular/core';
import { BrnDialogTitle } from '@spartan-ng/brain/dialog';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/dialog";
export class HlmDialogTitle {
    constructor() {
        classes(() => 'leading-none font-medium');
    }
    static ɵfac = function HlmDialogTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogTitle, selectors: [["", "hlmDialogTitle", ""]], hostAttrs: ["data-slot", "dialog-title"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnDialogTitle])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmDialogTitle]',
                hostDirectives: [BrnDialogTitle],
                host: { 'data-slot': 'dialog-title' },
            }]
    }], () => [], null); })();
