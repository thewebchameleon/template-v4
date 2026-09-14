import { Directive, input } from '@angular/core';
import { BrnField } from '@spartan-ng/brain/field';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/field";
const fieldVariants = cva('data-[matches-spartan-invalid=true]:text-destructive gap-3 group/field flex w-full', {
    variants: {
        orientation: {
            vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
            horizontal: [
                'flex-row items-center',
                '*:data-[slot=field-label]:flex-auto',
                'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
            ],
            responsive: [
                'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto [&>.sr-only]:w-auto',
                '@md/field-group:*:data-[slot=field-label]:flex-auto',
                '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
            ],
        },
    },
    defaultVariants: {
        orientation: 'vertical',
    },
});
export class HlmField {
    orientation = input('vertical', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "orientation" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => fieldVariants({ orientation: this.orientation() }));
    }
    static ɵfac = function HlmField_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmField)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmField, selectors: [["", "hlmField", ""], ["hlm-field"]], hostAttrs: ["role", "group", "data-slot", "field"], hostVars: 1, hostBindings: function HlmField_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-orientation", ctx.orientation());
        } }, inputs: { orientation: [1, "orientation"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnField, inputs: ["data-invalid", "data-invalid", "forceInvalid", "forceInvalid"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmField, [{
        type: Directive,
        args: [{
                selector: '[hlmField],hlm-field',
                hostDirectives: [{ directive: BrnField, inputs: ['data-invalid', 'forceInvalid'] }],
                host: {
                    role: 'group',
                    'data-slot': 'field',
                    '[attr.data-orientation]': 'orientation()',
                },
            }]
    }], () => [], { orientation: [{ type: i0.Input, args: [{ isSignal: true, alias: "orientation", required: false }] }] }); })();
