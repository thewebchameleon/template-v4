import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
const alertVariants = cva("grid gap-0.5 rounded-lg border px-4 py-3 text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>ng-icon]:grid-cols-[auto_1fr] has-[>ng-icon]:gap-x-2.5 *:[ng-icon]:row-span-2 *:[ng-icon]:translate-y-0.5 *:[ng-icon]:text-current *:[ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] group/alert relative w-full", {
    variants: {
        variant: {
            default: 'bg-card text-card-foreground',
            destructive: 'text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[ng-icon]:text-current',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
export class HlmAlert {
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => alertVariants({ variant: this.variant() }));
    }
    static ɵfac = function HlmAlert_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlert)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlert, selectors: [["hlm-alert"], ["", "hlmAlert", ""]], hostAttrs: ["data-slot", "alert", "role", "alert"], inputs: { variant: [1, "variant"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlert, [{
        type: Directive,
        args: [{
                selector: 'hlm-alert,[hlmAlert]',
                host: {
                    'data-slot': 'alert',
                    role: 'alert',
                },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }] }); })();
