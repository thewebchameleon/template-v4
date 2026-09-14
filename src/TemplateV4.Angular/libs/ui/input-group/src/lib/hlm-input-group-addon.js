import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
const inputGroupAddonVariants = cva("text-muted-foreground h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] flex cursor-text items-center justify-center select-none", {
    variants: {
        align: {
            'inline-start': 'ps-2 has-[>button]:-ms-1 has-[>kbd]:ms-[-0.15rem] order-first',
            'inline-end': 'pe-2 has-[>button]:-me-1 has-[>kbd]:me-[-0.15rem] order-last',
            'block-start': 'px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start',
            'block-end': 'px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start',
        },
    },
    defaultVariants: {
        align: 'inline-start',
    },
});
export class HlmInputGroupAddon {
    align = input('inline-start', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "align" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => inputGroupAddonVariants({ align: this.align() }));
    }
    static ɵfac = function HlmInputGroupAddon_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputGroupAddon)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInputGroupAddon, selectors: [["", "hlmInputGroupAddon", ""], ["hlm-input-group-addon"]], hostAttrs: ["role", "group", "data-slot", "input-group-addon"], hostVars: 1, hostBindings: function HlmInputGroupAddon_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-align", ctx.align());
        } }, inputs: { align: [1, "align"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputGroupAddon, [{
        type: Directive,
        args: [{
                selector: '[hlmInputGroupAddon],hlm-input-group-addon',
                host: {
                    role: 'group',
                    'data-slot': 'input-group-addon',
                    '[attr.data-align]': 'align()',
                },
            }]
    }], () => [], { align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }] }); })();
