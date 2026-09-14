import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
const emptyHeaderVariants = cva('flex flex-col items-center', {
    variants: {
        variant: {
            default: 'gap-2 max-w-sm',
            compact: 'gap-0 max-w-none',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
export class HlmEmptyHeader {
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => emptyHeaderVariants({ variant: this.variant() }));
    }
    static ɵfac = function HlmEmptyHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmEmptyHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmEmptyHeader, selectors: [["", "hlmEmptyHeader", ""], ["hlm-empty-header"]], hostAttrs: ["data-slot", "empty-header"], inputs: { variant: [1, "variant"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmEmptyHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmEmptyHeader],hlm-empty-header',
                host: { 'data-slot': 'empty-header' },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }] }); })();
