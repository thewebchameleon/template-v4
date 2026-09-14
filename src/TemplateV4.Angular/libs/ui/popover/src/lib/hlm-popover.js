import { Directive } from '@angular/core';
import { BrnPopover } from '@spartan-ng/brain/popover';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/popover";
export class HlmPopover {
    static ɵfac = function HlmPopover_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmPopover)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmPopover, selectors: [["", "hlmPopover", ""], ["hlm-popover"]], hostAttrs: ["data-slot", "popover"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnPopover, inputs: ["align", "align", "attachTo", "attachTo", "autoFocus", "autoFocus", "closeOnOutsidePointerEvents", "closeOnOutsidePointerEvents", "offsetX", "offsetX", "scrollStrategy", "scrollStrategy", "sideOffset", "sideOffset", "state", "state"], outputs: ["stateChanged", "stateChanged", "closed", "closed"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmPopover, [{
        type: Directive,
        args: [{
                selector: '[hlmPopover],hlm-popover',
                hostDirectives: [
                    {
                        directive: BrnPopover,
                        inputs: [
                            'align',
                            'attachTo',
                            'autoFocus',
                            'closeOnOutsidePointerEvents',
                            'offsetX',
                            'scrollStrategy',
                            'sideOffset',
                            'state',
                        ],
                        outputs: ['stateChanged', 'closed'],
                    },
                ],
                host: { 'data-slot': 'popover' },
            }]
    }], null, null); })();
