import { Directive } from '@angular/core';
import { BrnDrawerTitle } from '@spartan-ng/brain/drawer';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/drawer";
export class HlmDrawerTitle {
    constructor() {
        classes(() => 'text-foreground font-medium');
    }
    static ɵfac = function HlmDrawerTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerTitle, selectors: [["", "hlmDrawerTitle", ""]], hostAttrs: ["data-slot", "drawer-title"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnDrawerTitle])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmDrawerTitle]',
                hostDirectives: [BrnDrawerTitle],
                host: { 'data-slot': 'drawer-title' },
            }]
    }], () => [], null); })();
