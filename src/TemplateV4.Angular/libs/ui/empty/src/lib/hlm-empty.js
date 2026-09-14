import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
const emptyVariants = cva('flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center', {
    variants: {
        variant: {
            default: 'gap-4 rounded-lg border-dashed p-12 text-balance',
            compact: 'gap-0 p-0 text-nowrap',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
export class HlmEmpty {
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => emptyVariants({ variant: this.variant() }));
    }
    static ɵfac = function HlmEmpty_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmEmpty)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmEmpty, selectors: [["", "hlmEmpty", ""], ["hlm-empty"]], hostAttrs: ["data-slot", "empty"], inputs: { variant: [1, "variant"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmEmpty, [{
        type: Directive,
        args: [{
                selector: '[hlmEmpty],hlm-empty',
                host: { 'data-slot': 'empty' },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }] }); })();
