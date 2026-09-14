import { Directive } from '@angular/core';
import { BrnPopover, provideBrnPopoverConfig, provideBrnPopoverDefaultOptions, } from '@spartan-ng/brain/popover';
import { BrnSelect } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
import * as i2 from "@spartan-ng/brain/popover";
export class HlmSelect {
    constructor() {
        classes(() => 'block');
    }
    static ɵfac = function HlmSelect_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelect)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelect, selectors: [["", "hlmSelect", ""], ["hlm-select"]], hostAttrs: ["data-slot", "select"], features: [i0.ɵɵProvidersFeature([
                provideBrnPopoverConfig({
                    align: 'start',
                    sideOffset: 6,
                }),
                provideBrnPopoverDefaultOptions({ role: null }),
            ]), i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSelect, inputs: ["disabled", "disabled", "value", "value", "isItemEqualToValue", "isItemEqualToValue", "itemToString", "itemToString"], outputs: ["valueChange", "valueChange"] }, { directive: i2.BrnPopover, inputs: ["align", "align", "closeOnOutsidePointerEvents", "closeOnOutsidePointerEvents", "sideOffset", "sideOffset", "state", "state", "offsetX", "offsetX", "scrollStrategy", "scrollStrategy"], outputs: ["stateChanged", "stateChanged", "closed", "closed"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelect, [{
        type: Directive,
        args: [{
                selector: '[hlmSelect],hlm-select',
                providers: [
                    provideBrnPopoverConfig({
                        align: 'start',
                        sideOffset: 6,
                    }),
                    provideBrnPopoverDefaultOptions({ role: null }),
                ],
                hostDirectives: [
                    {
                        directive: BrnSelect,
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
