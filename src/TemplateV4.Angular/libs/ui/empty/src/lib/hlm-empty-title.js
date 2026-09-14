import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
const emptyTitleVariants = cva('font-medium tracking-tight', {
    variants: {
        variant: {
            default: 'text-lg',
            compact: 'text-sm whitespace-nowrap',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
export class HlmEmptyTitle {
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => emptyTitleVariants({ variant: this.variant() }));
    }
    static ɵfac = function HlmEmptyTitle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmEmptyTitle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmEmptyTitle, selectors: [["", "hlmEmptyTitle", ""]], hostAttrs: ["data-slot", "empty-title"], inputs: { variant: [1, "variant"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmEmptyTitle, [{
        type: Directive,
        args: [{
                selector: '[hlmEmptyTitle]',
                host: { 'data-slot': 'empty-title' },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }] }); })();
