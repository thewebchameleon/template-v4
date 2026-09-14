import { CdkMenuTrigger } from '@angular/cdk/menu';
import { computed, Directive, effect, forwardRef, inject, input } from '@angular/core';
import { createMenuPosition, MENU_SIDE, } from '@spartan-ng/brain/core';
import { classes } from '@spartan-ng/helm/utils';
import { injectHlmDropdownMenuConfig } from './hlm-dropdown-menu-token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/menu";
export class HlmDropdownMenuSubTrigger {
    _cdkTrigger = inject(CdkMenuTrigger, { host: true });
    _config = injectHlmDropdownMenuConfig();
    align = input(this._config.align, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "align" }] : /* istanbul ignore next */ []));
    side = input(this._config.side, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "side" }] : /* istanbul ignore next */ []));
    _menuPosition = computed(() => createMenuPosition(this.align(), this.side()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_menuPosition" }] : /* istanbul ignore next */ []));
    constructor() {
        // CDK sets transform-origin on the submenu content from the resolved position; the content reads it
        // to animate from the anchored corner and to derive its data-side. Cast tolerates @angular/cdk < 21.2
        // (we still support >=21.0), where the property is absent and the assignment is a harmless no-op.
        this._cdkTrigger.transformOriginSelector =
            '[data-slot="dropdown-menu-sub"]';
        effect(() => {
            this._cdkTrigger.menuPosition = this._menuPosition();
        });
        classes(() => 'aria-expanded:bg-accent aria-expanded:text-accent-foreground');
    }
    static ɵfac = function HlmDropdownMenuSubTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuSubTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuSubTrigger, selectors: [["", "hlmDropdownMenuSubTrigger", ""]], hostAttrs: ["data-slot", "dropdown-menu-sub-trigger"], inputs: { align: [1, "align"], side: [1, "side"] }, features: [i0.ɵɵProvidersFeature([{ provide: MENU_SIDE, useExisting: forwardRef(() => HlmDropdownMenuSubTrigger) }]), i0.ɵɵHostDirectivesFeature([{ directive: i1.CdkMenuTrigger, inputs: ["cdkMenuTriggerFor", "hlmDropdownMenuSubTrigger", "cdkMenuTriggerData", "hlmDropdownMenuTriggerData"], outputs: ["cdkMenuOpened", "hlmDropdownMenuSubOpened", "cdkMenuClosed", "hlmDropdownMenuSubClosed"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuSubTrigger, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuSubTrigger]',
                providers: [{ provide: MENU_SIDE, useExisting: forwardRef(() => HlmDropdownMenuSubTrigger) }],
                hostDirectives: [
                    {
                        directive: CdkMenuTrigger,
                        inputs: [
                            'cdkMenuTriggerFor: hlmDropdownMenuSubTrigger',
                            'cdkMenuTriggerData: hlmDropdownMenuTriggerData',
                        ],
                        outputs: [
                            'cdkMenuOpened: hlmDropdownMenuSubOpened',
                            'cdkMenuClosed: hlmDropdownMenuSubClosed',
                        ],
                    },
                ],
                host: { 'data-slot': 'dropdown-menu-sub-trigger' },
            }]
    }], () => [], { align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }], side: [{ type: i0.Input, args: [{ isSignal: true, alias: "side", required: false }] }] }); })();
