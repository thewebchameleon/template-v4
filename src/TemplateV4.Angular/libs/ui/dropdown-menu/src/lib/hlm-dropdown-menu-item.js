import { CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, Directive, HOST_TAG_NAME, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmDropdownMenuFocusOnHover } from './hlm-dropdown-menu-focus-on-hover';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/menu";
import * as i2 from "./hlm-dropdown-menu-focus-on-hover";
export class HlmDropdownMenuItem {
    _isButton = inject(HOST_TAG_NAME) === 'button';
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    inset = input(false, { ...(ngDevMode ? { debugName: "inset" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => "hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/20 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:hover:text-destructive data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[ng-icon]:text-destructive not-data-[variant=destructive]:hover:**:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-sm px-2 py-1.5 text-sm data-inset:ps-8 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] group/dropdown-menu-item relative flex w-full items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0");
    }
    static ɵfac = function HlmDropdownMenuItem_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuItem)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuItem, selectors: [["", "hlmDropdownMenuItem", ""], ["hlm-dropdown-menu-item"]], hostAttrs: ["data-slot", "dropdown-menu-item"], hostVars: 4, hostBindings: function HlmDropdownMenuItem_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("disabled", ctx._isButton && ctx.disabled() ? "" : null)("data-disabled", ctx.disabled() ? "" : null)("data-variant", ctx.variant())("data-inset", ctx.inset() ? "" : null);
        } }, inputs: { disabled: [1, "disabled"], variant: [1, "variant"], inset: [1, "inset"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.CdkMenuItem, inputs: ["cdkMenuItemDisabled", "disabled"], outputs: ["cdkMenuItemTriggered", "triggered"] }, i2.HlmDropdownMenuFocusOnHover])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuItem, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuItem],hlm-dropdown-menu-item',
                hostDirectives: [
                    {
                        directive: CdkMenuItem,
                        inputs: ['cdkMenuItemDisabled: disabled'],
                        outputs: ['cdkMenuItemTriggered: triggered'],
                    },
                    HlmDropdownMenuFocusOnHover,
                ],
                host: {
                    'data-slot': 'dropdown-menu-item',
                    '[attr.disabled]': '_isButton && disabled() ? "" : null',
                    '[attr.data-disabled]': 'disabled() ? "" : null',
                    '[attr.data-variant]': 'variant()',
                    '[attr.data-inset]': 'inset() ? "" : null',
                },
            }]
    }], () => [], { disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], inset: [{ type: i0.Input, args: [{ isSignal: true, alias: "inset", required: false }] }] }); })();
