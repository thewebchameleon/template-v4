import { CdkMenuTrigger } from '@angular/cdk/menu';
import { computed, Directive, effect, forwardRef, inject, input } from '@angular/core';
import { createMenuPosition, MENU_SIDE, } from '@spartan-ng/brain/core';
import { injectHlmDropdownMenuConfig } from './hlm-dropdown-menu-token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/menu";
export class HlmDropdownMenuTrigger {
    _cdkTrigger = inject(CdkMenuTrigger, { host: true });
    _config = injectHlmDropdownMenuConfig();
    align = input(this._config.align, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "align" }] : /* istanbul ignore next */ []));
    side = input(this._config.side, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "side" }] : /* istanbul ignore next */ []));
    _menuPosition = computed(() => createMenuPosition(this.align(), this.side()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_menuPosition" }] : /* istanbul ignore next */ []));
    constructor() {
        // CDK sets transform-origin on the menu content from the resolved position; the content reads it to
        // animate from the anchored corner and to derive its data-side. Cast tolerates @angular/cdk < 21.2
        // (we still support >=21.0), where the property is absent and the assignment is a harmless no-op.
        this._cdkTrigger.transformOriginSelector =
            '[data-slot="dropdown-menu"]';
        effect(() => {
            this._cdkTrigger.menuPosition = this._menuPosition();
        });
    }
    static ɵfac = function HlmDropdownMenuTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuTrigger, selectors: [["", "hlmDropdownMenuTrigger", ""]], hostAttrs: ["data-slot", "dropdown-menu-trigger"], inputs: { align: [1, "align"], side: [1, "side"] }, features: [i0.ɵɵProvidersFeature([{ provide: MENU_SIDE, useExisting: forwardRef(() => HlmDropdownMenuTrigger) }]), i0.ɵɵHostDirectivesFeature([{ directive: i1.CdkMenuTrigger, inputs: ["cdkMenuTriggerFor", "hlmDropdownMenuTrigger", "cdkMenuTriggerData", "hlmDropdownMenuTriggerData"], outputs: ["cdkMenuOpened", "hlmDropdownMenuOpened", "cdkMenuClosed", "hlmDropdownMenuClosed"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuTrigger, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuTrigger]',
                providers: [{ provide: MENU_SIDE, useExisting: forwardRef(() => HlmDropdownMenuTrigger) }],
                hostDirectives: [
                    {
                        directive: CdkMenuTrigger,
                        inputs: [
                            'cdkMenuTriggerFor: hlmDropdownMenuTrigger',
                            'cdkMenuTriggerData: hlmDropdownMenuTriggerData',
                        ],
                        outputs: ['cdkMenuOpened: hlmDropdownMenuOpened', 'cdkMenuClosed: hlmDropdownMenuClosed'],
                    },
                ],
                host: { 'data-slot': 'dropdown-menu-trigger' },
            }]
    }], () => [], { align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }], side: [{ type: i0.Input, args: [{ isSignal: true, alias: "side", required: false }] }] }); })();
