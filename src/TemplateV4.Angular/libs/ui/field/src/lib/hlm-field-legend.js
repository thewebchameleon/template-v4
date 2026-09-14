import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmFieldLegend {
    variant = input('legend', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base');
    }
    static ɵfac = function HlmFieldLegend_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldLegend)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmFieldLegend, selectors: [["legend", "hlmFieldLegend", ""]], hostAttrs: ["data-slot", "field-legend"], hostVars: 1, hostBindings: function HlmFieldLegend_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-variant", ctx.variant());
        } }, inputs: { variant: [1, "variant"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldLegend, [{
        type: Directive,
        args: [{
                selector: 'legend[hlmFieldLegend]',
                host: {
                    'data-slot': 'field-legend',
                    '[attr.data-variant]': 'variant()',
                },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }] }); })();
