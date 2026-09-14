import { Directive, input } from '@angular/core';
import { BrnToggle } from '@spartan-ng/brain/toggle';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/toggle";
export const toggleVariants = cva("hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 gap-1 rounded-md text-sm font-medium transition-[color,box-shadow] [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0", {
    variants: {
        variant: {
            default: 'bg-transparent',
            outline: 'border-input hover:bg-muted border bg-transparent shadow-xs',
            inset: 'border border-transparent bg-transparent shadow-none hover:bg-background/60',
        },
        size: {
            default: 'h-9 min-w-9 px-2.5',
            sm: 'h-8 min-w-8 px-2.5',
            lg: 'h-10 min-w-10 px-2.5',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
export class HlmToggle {
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => toggleVariants({
            variant: this.variant(),
            size: this.size(),
        }));
    }
    static ɵfac = function HlmToggle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmToggle)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmToggle, selectors: [["button", "hlmToggle", ""]], hostAttrs: ["data-slot", "toggle"], inputs: { variant: [1, "variant"], size: [1, "size"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnToggle, inputs: ["id", "id", "value", "value", "disabled", "disabled", "state", "state", "aria-label", "aria-label", "type", "type"], outputs: ["stateChange", "stateChange"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmToggle, [{
        type: Directive,
        args: [{
                selector: 'button[hlmToggle]',
                hostDirectives: [
                    {
                        directive: BrnToggle,
                        inputs: ['id', 'value', 'disabled', 'state', 'aria-label', 'type'],
                        outputs: ['stateChange'],
                    },
                ],
                host: {
                    'data-slot': 'toggle',
                },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] }); })();
