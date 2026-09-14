import { Directive } from '@angular/core';
import { BrnDrawerDescription } from '@spartan-ng/brain/drawer';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/drawer";
export class HlmDrawerDescription {
    constructor() {
        classes(() => 'text-foreground/80 text-sm');
    }
    static ɵfac = function HlmDrawerDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerDescription, selectors: [["", "hlmDrawerDescription", ""]], hostAttrs: ["data-slot", "drawer-description"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnDrawerDescription])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmDrawerDescription]',
                hostDirectives: [BrnDrawerDescription],
                host: { 'data-slot': 'drawer-description' },
            }]
    }], () => [], null); })();
