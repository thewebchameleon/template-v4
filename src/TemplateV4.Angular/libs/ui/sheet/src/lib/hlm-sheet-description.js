import { Directive } from '@angular/core';
import { BrnSheetDescription } from '@spartan-ng/brain/sheet';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/sheet";
export class HlmSheetDescription {
    constructor() {
        classes(() => 'text-muted-foreground text-sm');
    }
    static ɵfac = function HlmSheetDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSheetDescription, selectors: [["", "hlmSheetDescription", ""]], hostAttrs: ["data-slot", "sheet-description"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnSheetDescription])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmSheetDescription]',
                hostDirectives: [BrnSheetDescription],
                host: { 'data-slot': 'sheet-description' },
            }]
    }], () => [], null); })();
