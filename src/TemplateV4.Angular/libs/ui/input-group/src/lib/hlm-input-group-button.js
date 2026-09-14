import { Directive, input } from '@angular/core';
import { HlmButton, provideBrnButtonConfig } from '@spartan-ng/helm/button';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
const inputGroupAddonVariants = cva('gap-2 text-sm flex items-center shadow-none', {
    variants: {
        size: {
            xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-1.5 [&>ng-icon:not([class*='text-'])]:text-[length:--spacing(3.5)]",
            sm: '',
            'icon-xs': 'size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>ng-icon]:p-0',
            'icon-sm': 'size-8 p-0 has-[>ng-icon]:p-0',
        },
    },
    defaultVariants: {
        size: 'xs',
    },
});
export class HlmInputGroupButton {
    size = input('xs', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    type = input('button', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "type" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => inputGroupAddonVariants({ size: this.size() }));
    }
    static ɵfac = function HlmInputGroupButton_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputGroupButton)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInputGroupButton, selectors: [["button", "hlmInputGroupButton", ""]], hostVars: 2, hostBindings: function HlmInputGroupButton_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵdomProperty("type", ctx.type());
            i0.ɵɵattribute("data-size", ctx.size());
        } }, inputs: { size: [1, "size"], type: [1, "type"] }, features: [i0.ɵɵProvidersFeature([
                provideBrnButtonConfig({
                    variant: 'ghost',
                }),
            ]), i0.ɵɵHostDirectivesFeature([{ directive: i1.HlmButton, inputs: ["variant", "variant"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputGroupButton, [{
        type: Directive,
        args: [{
                selector: 'button[hlmInputGroupButton]',
                providers: [
                    provideBrnButtonConfig({
                        variant: 'ghost',
                    }),
                ],
                hostDirectives: [
                    {
                        directive: HlmButton,
                        inputs: ['variant'],
                    },
                ],
                host: {
                    '[attr.data-size]': 'size()',
                    '[type]': 'type()',
                },
            }]
    }], () => [], { size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: false }] }] }); })();
