import { Directive } from '@angular/core';
import { BrnSheetTitle } from '@spartan-ng/brain/sheet';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/sheet";
export class HlmSheetTitle {
    constructor() {
        classes(() => 'text-foreground font-medium');
    }
    static ɵfac = function HlmSheetTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSheetTitle, selectors: [["", "hlmSheetTitle", ""]], hostAttrs: ["data-slot", "sheet-title"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnSheetTitle])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmSheetTitle]',
                hostDirectives: [BrnSheetTitle],
                host: { 'data-slot': 'sheet-title' },
            }]
    }], () => [], null); })();
