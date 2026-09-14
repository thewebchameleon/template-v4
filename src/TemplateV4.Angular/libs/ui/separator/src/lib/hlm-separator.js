import { Directive } from '@angular/core';
import { BrnSeparator } from '@spartan-ng/brain/separator';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/separator";
export const hlmSeparatorClass = 'inline-flex shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch';
export class HlmSeparator {
    constructor() {
        classes(() => hlmSeparatorClass);
    }
    static ɵfac = function HlmSeparator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSeparator)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSeparator, selectors: [["", "hlmSeparator", ""], ["hlm-separator"]], hostAttrs: ["data-slot", "separator"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSeparator, inputs: ["orientation", "orientation", "decorative", "decorative"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSeparator, [{
        type: Directive,
        args: [{
                selector: '[hlmSeparator],hlm-separator',
                hostDirectives: [{ directive: BrnSeparator, inputs: ['orientation', 'decorative'] }],
                host: {
                    'data-slot': 'separator',
                },
            }]
    }], () => [], null); })();
