import { Directive } from '@angular/core';
import { BrnPopover, provideBrnPopoverConfig, provideBrnPopoverDefaultOptions, } from '@spartan-ng/brain/popover';
import { BrnSelectMultiple } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
import * as i2 from "@spartan-ng/brain/popover";
export class HlmSelectMultiple {
    constructor() {
        classes(() => 'block');
    }
    static ɵfac = function HlmSelectMultiple_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectMultiple)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectMultiple, selectors: [["", "hlmSelectMultiple", ""], ["hlm-select-multiple"]], hostAttrs: ["data-slot", "select"], features: [i0.ɵɵProvidersFeature([
                provideBrnPopoverConfig({
                    align: 'start',
                    sideOffset: 6,
                }),
                provideBrnPopoverDefaultOptions({ role: null }),
            ]), i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSelectMultiple, inputs: ["disabled", "disabled", "value", "value", "isItemEqualToValue", "isItemEqualToValue", "itemToString", "itemToString"], outputs: ["valueChange", "valueChange"] }, { directive: i2.BrnPopover, inputs: ["align", "align", "closeOnOutsidePointerEvents", "closeOnOutsidePointerEvents", "sideOffset", "sideOffset", "state", "state", "offsetX", "offsetX", "scrollStrategy", "scrollStrategy"], outputs: ["stateChanged", "stateChanged", "closed", "closed"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectMultiple, [{
        type: Directive,
        args: [{
                selector: '[hlmSelectMultiple],hlm-select-multiple',
                providers: [
                    provideBrnPopoverConfig({
                        align: 'start',
                        sideOffset: 6,
                    }),
                    provideBrnPopoverDefaultOptions({ role: null }),
                ],
                hostDirectives: [
                    {
                        directive: BrnSelectMultiple,
                        inputs: ['disabled', 'value', 'isItemEqualToValue', 'itemToString'],
                        outputs: ['valueChange'],
                    },
                    {
                        directive: BrnPopover,
                        inputs: [
                            'align',
                            'closeOnOutsidePointerEvents',
                            'sideOffset',
                            'state',
                            'offsetX',
                            'scrollStrategy',
                        ],
                        outputs: ['stateChanged', 'closed'],
                    },
                ],
                host: { 'data-slot': 'select' },
            }]
    }], () => [], null); })();
