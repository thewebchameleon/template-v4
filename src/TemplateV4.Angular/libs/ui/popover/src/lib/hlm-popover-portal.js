import { Directive } from '@angular/core';
import { BrnPopoverContent } from '@spartan-ng/brain/popover';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/popover";
export class HlmPopoverPortal {
    static ɵfac = function HlmPopoverPortal_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmPopoverPortal)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmPopoverPortal, selectors: [["", "hlmPopoverPortal", ""]], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnPopoverContent, inputs: ["context", "context", "class", "class"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmPopoverPortal, [{
        type: Directive,
        args: [{
                selector: '[hlmPopoverPortal]',
                hostDirectives: [{ directive: BrnPopoverContent, inputs: ['context', 'class'] }],
            }]
    }], null, null); })();
