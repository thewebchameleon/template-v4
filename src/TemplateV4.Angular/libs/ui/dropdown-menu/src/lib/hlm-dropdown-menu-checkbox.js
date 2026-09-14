import { CdkMenuItem, CdkMenuItemCheckbox, CdkMenuItemSelectable } from '@angular/cdk/menu';
import { Directive, booleanAttribute, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmDropdownMenuFocusOnHover } from './hlm-dropdown-menu-focus-on-hover';
import * as i0 from "@angular/core";
import * as i1 from "./hlm-dropdown-menu-focus-on-hover";
/** @internal. Use HlmDropdownMenuCheckbox instead. */
export class HlmDropdownMenuCheckboxCdk extends CdkMenuItemCheckbox {
    keepOpen = input(true, { ...(ngDevMode ? { debugName: "keepOpen" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    trigger(options) {
        super.trigger({ ...options, keepOpen: this.keepOpen() });
    }
    static ɵfac = /*@__PURE__*/ (() => { let ɵHlmDropdownMenuCheckboxCdk_BaseFactory; return function HlmDropdownMenuCheckboxCdk_Factory(__ngFactoryType__) { return (ɵHlmDropdownMenuCheckboxCdk_BaseFactory || (ɵHlmDropdownMenuCheckboxCdk_BaseFactory = i0.ɵɵgetInheritedFactory(HlmDropdownMenuCheckboxCdk)))(__ngFactoryType__ || HlmDropdownMenuCheckboxCdk); }; })();
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuCheckboxCdk, selectors: [["", "hlmDropdownMenuCheckboxCdk", ""]], inputs: { keepOpen: [1, "keepOpen"] }, features: [i0.ɵɵProvidersFeature([
                { provide: CdkMenuItemCheckbox, useExisting: HlmDropdownMenuCheckboxCdk },
                { provide: CdkMenuItemSelectable, useExisting: HlmDropdownMenuCheckboxCdk },
                { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
            ]), i0.ɵɵInheritDefinitionFeature] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuCheckboxCdk, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuCheckboxCdk]',
                providers: [
                    { provide: CdkMenuItemCheckbox, useExisting: HlmDropdownMenuCheckboxCdk },
                    { provide: CdkMenuItemSelectable, useExisting: HlmDropdownMenuCheckboxCdk },
                    { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                ],
            }]
    }], null, { keepOpen: [{ type: i0.Input, args: [{ isSignal: true, alias: "keepOpen", required: false }] }] }); })();
export class HlmDropdownMenuCheckbox {
    _cdkMenuItem = inject(HlmDropdownMenuCheckboxCdk);
    inset = input(false, { ...(ngDevMode ? { debugName: "inset" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => "hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm data-inset:ps-8 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] group/dropdown-menu-checkbox relative flex w-full items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0");
    }
    static ɵfac = function HlmDropdownMenuCheckbox_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuCheckbox)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuCheckbox, selectors: [["", "hlmDropdownMenuCheckbox", ""], ["", "hlmDropdownMenuCheckboxItem", ""]], hostAttrs: ["data-slot", "dropdown-menu-checkbox-item"], hostVars: 3, hostBindings: function HlmDropdownMenuCheckbox_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-disabled", ctx._cdkMenuItem.disabled ? "" : null)("data-checked", ctx._cdkMenuItem.checked ? "" : null)("data-inset", ctx.inset() ? "" : null);
        } }, inputs: { inset: [1, "inset"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: HlmDropdownMenuCheckboxCdk, inputs: ["cdkMenuItemDisabled", "disabled", "cdkMenuItemChecked", "checked", "keepOpen", "keepOpen"], outputs: ["cdkMenuItemTriggered", "triggered"] }, i1.HlmDropdownMenuFocusOnHover])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuCheckbox, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuCheckbox],[hlmDropdownMenuCheckboxItem]',
                hostDirectives: [
                    {
                        directive: HlmDropdownMenuCheckboxCdk,
                        inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked', 'keepOpen'],
                        outputs: ['cdkMenuItemTriggered: triggered'],
                    },
                    HlmDropdownMenuFocusOnHover,
                ],
                host: {
                    'data-slot': 'dropdown-menu-checkbox-item',
                    '[attr.data-disabled]': '_cdkMenuItem.disabled ? "" : null',
                    '[attr.data-checked]': '_cdkMenuItem.checked ? "" : null',
                    '[attr.data-inset]': 'inset() ? "" : null',
                },
            }]
    }], () => [], { inset: [{ type: i0.Input, args: [{ isSignal: true, alias: "inset", required: false }] }] }); })();
