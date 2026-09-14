import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
const emptyMediaVariants = cva('mb-2 flex shrink-0 items-center justify-center [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0', {
    variants: {
        variant: {
            default: 'bg-transparent',
            icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(6)]",
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
export class HlmEmptyMedia {
    variant = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "variant" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => emptyMediaVariants({ variant: this.variant() }));
    }
    static ɵfac = function HlmEmptyMedia_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmEmptyMedia)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmEmptyMedia, selectors: [["", "hlmEmptyMedia", ""], ["hlm-empty-media"]], hostAttrs: ["data-slot", "empty-media"], hostVars: 1, hostBindings: function HlmEmptyMedia_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-variant", ctx.variant());
        } }, inputs: { variant: [1, "variant"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmEmptyMedia, [{
        type: Directive,
        args: [{
                selector: '[hlmEmptyMedia],hlm-empty-media',
                host: {
                    'data-slot': 'empty-media',
                    '[attr.data-variant]': 'variant()',
                },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }] }); })();
