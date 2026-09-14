import { CdkMenuItem, CdkMenuItemRadio, CdkMenuItemSelectable } from '@angular/cdk/menu';
import { Directive, booleanAttribute, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmDropdownMenuFocusOnHover } from './hlm-dropdown-menu-focus-on-hover';
import * as i0 from "@angular/core";
import * as i1 from "./hlm-dropdown-menu-focus-on-hover";
/** @internal. Use HlmDropdownMenuRadio instead. */
export class HlmDropdownMenuRadioCdk extends CdkMenuItemRadio {
    keepOpen = input(true, { ...(ngDevMode ? { debugName: "keepOpen" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    trigger(options) {
        super.trigger({ ...options, keepOpen: this.keepOpen() });
    }
    static ɵfac = /*@__PURE__*/ (() => { let ɵHlmDropdownMenuRadioCdk_BaseFactory; return function HlmDropdownMenuRadioCdk_Factory(__ngFactoryType__) { return (ɵHlmDropdownMenuRadioCdk_BaseFactory || (ɵHlmDropdownMenuRadioCdk_BaseFactory = i0.ɵɵgetInheritedFactory(HlmDropdownMenuRadioCdk)))(__ngFactoryType__ || HlmDropdownMenuRadioCdk); }; })();
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuRadioCdk, selectors: [["", "hlmDropdownMenuRadioCdk", ""]], inputs: { keepOpen: [1, "keepOpen"] }, features: [i0.ɵɵProvidersFeature([
                { provide: CdkMenuItemRadio, useExisting: HlmDropdownMenuRadioCdk },
                { provide: CdkMenuItemSelectable, useExisting: HlmDropdownMenuRadioCdk },
                { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
            ]), i0.ɵɵInheritDefinitionFeature] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuRadioCdk, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuRadioCdk]',
                providers: [
                    { provide: CdkMenuItemRadio, useExisting: HlmDropdownMenuRadioCdk },
                    { provide: CdkMenuItemSelectable, useExisting: HlmDropdownMenuRadioCdk },
                    { provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
                ],
            }]
    }], null, { keepOpen: [{ type: i0.Input, args: [{ isSignal: true, alias: "keepOpen", required: false }] }] }); })();
export class HlmDropdownMenuRadio {
    _cdkMenuItem = inject(HlmDropdownMenuRadioCdk);
    constructor() {
        classes(() => "hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm data-inset:ps-8 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] group/dropdown-menu-radio relative flex w-full items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0");
    }
    static ɵfac = function HlmDropdownMenuRadio_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuRadio)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuRadio, selectors: [["", "hlmDropdownMenuRadio", ""]], hostAttrs: ["data-slot", "dropdown-menu-radio-item"], hostVars: 2, hostBindings: function HlmDropdownMenuRadio_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-disabled", ctx._cdkMenuItem.disabled ? "" : null)("data-checked", ctx._cdkMenuItem.checked ? "" : null);
        } }, features: [i0.ɵɵHostDirectivesFeature([{ directive: HlmDropdownMenuRadioCdk, inputs: ["cdkMenuItemDisabled", "disabled", "cdkMenuItemChecked", "checked", "keepOpen", "keepOpen"], outputs: ["cdkMenuItemTriggered", "triggered"] }, i1.HlmDropdownMenuFocusOnHover])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuRadio, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuRadio]',
                hostDirectives: [
                    {
                        directive: HlmDropdownMenuRadioCdk,
                        inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked', 'keepOpen'],
                        outputs: ['cdkMenuItemTriggered: triggered'],
                    },
                    HlmDropdownMenuFocusOnHover,
                ],
                host: {
                    'data-slot': 'dropdown-menu-radio-item',
                    '[attr.data-disabled]': '_cdkMenuItem.disabled ? "" : null',
                    '[attr.data-checked]': '_cdkMenuItem.checked ? "" : null',
                },
            }]
    }], () => [], null); })();
