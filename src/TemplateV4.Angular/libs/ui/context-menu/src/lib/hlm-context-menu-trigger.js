import { CdkContextMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, effect, forwardRef, inject, input, } from '@angular/core';
import { createMenuPosition, MENU_SIDE, } from '@spartan-ng/brain/core';
import { classes } from '@spartan-ng/helm/utils';
import { injectHlmContextMenuConfig } from './hlm-context-menu-token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/menu";
export class HlmContextMenuTrigger {
    _cdkTrigger = inject(CdkContextMenuTrigger, { host: true });
    _config = injectHlmContextMenuConfig();
    disabled = input(this._cdkTrigger.disabled, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    align = input(this._config.align, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "align" }] : /* istanbul ignore next */ []));
    side = input(this._config.side, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "side" }] : /* istanbul ignore next */ []));
    _menuPosition = computed(() => createMenuPosition(this.align(), this.side()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_menuPosition" }] : /* istanbul ignore next */ []));
    constructor() {
        // CDK sets transform-origin on the menu content (a shared hlm-dropdown-menu) from the resolved
        // position; the content reads it to animate from the anchored corner and to derive its data-side.
        // Cast tolerates @angular/cdk < 21.2 (we still support >=21.0), where the property is absent and
        // the assignment is a harmless no-op.
        this._cdkTrigger.transformOriginSelector =
            '[data-slot="dropdown-menu"]';
        effect(() => {
            this._cdkTrigger.menuPosition = this._menuPosition();
        });
        classes(() => 'select-none');
    }
    static ɵfac = function HlmContextMenuTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmContextMenuTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmContextMenuTrigger, selectors: [["", "hlmContextMenuTrigger", ""]], hostAttrs: ["data-slot", "context-menu-trigger"], hostVars: 1, hostBindings: function HlmContextMenuTrigger_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-disabled", ctx.disabled() ? "" : null);
        } }, inputs: { disabled: [1, "disabled"], align: [1, "align"], side: [1, "side"] }, features: [i0.ɵɵProvidersFeature([{ provide: MENU_SIDE, useExisting: forwardRef(() => HlmContextMenuTrigger) }]), i0.ɵɵHostDirectivesFeature([{ directive: i1.CdkContextMenuTrigger, inputs: ["cdkContextMenuTriggerFor", "hlmContextMenuTrigger", "cdkContextMenuTriggerData", "hlmContextMenuTriggerData", "cdkContextMenuDisabled", "disabled"], outputs: ["cdkContextMenuOpened", "hlmContextMenuOpened", "cdkContextMenuClosed", "hlmContextMenuClosed"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmContextMenuTrigger, [{
        type: Directive,
        args: [{
                selector: '[hlmContextMenuTrigger]',
                providers: [{ provide: MENU_SIDE, useExisting: forwardRef(() => HlmContextMenuTrigger) }],
                hostDirectives: [
                    {
                        directive: CdkContextMenuTrigger,
                        inputs: [
                            'cdkContextMenuTriggerFor: hlmContextMenuTrigger',
                            'cdkContextMenuTriggerData: hlmContextMenuTriggerData',
                            'cdkContextMenuDisabled: disabled',
                        ],
                        outputs: [
                            'cdkContextMenuOpened: hlmContextMenuOpened',
                            'cdkContextMenuClosed: hlmContextMenuClosed',
                        ],
                    },
                ],
                host: {
                    'data-slot': 'context-menu-trigger',
                    '[attr.data-disabled]': 'disabled() ? "" : null',
                },
            }]
    }], () => [], { disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }], side: [{ type: i0.Input, args: [{ isSignal: true, alias: "side", required: false }] }] }); })();
