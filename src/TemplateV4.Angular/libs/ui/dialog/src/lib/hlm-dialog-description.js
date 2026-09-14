import { Directive } from '@angular/core';
import { BrnDialogDescription } from '@spartan-ng/brain/dialog';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/dialog";
export class HlmDialogDescription {
    constructor() {
        classes(() => 'text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3');
    }
    static ɵfac = function HlmDialogDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogDescription, selectors: [["", "hlmDialogDescription", ""]], hostAttrs: ["data-slot", "dialog-description"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnDialogDescription])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmDialogDescription]',
                hostDirectives: [BrnDialogDescription],
                host: { 'data-slot': 'dialog-description' },
            }]
    }], () => [], null); })();
