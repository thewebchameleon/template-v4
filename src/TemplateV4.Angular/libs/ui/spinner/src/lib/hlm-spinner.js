import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2 } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSpinner {
    /**
     * The name of the icon to be used as the spinner.
     * Use provideIcons({ ... }) to register custom icons.
     */
    icon = input('lucideLoader2', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "icon" }] : /* istanbul ignore next */ []));
    /** Aria label for the spinner for accessibility. */
    ariaLabel = input('Loading', { ...(ngDevMode ? { debugName: "ariaLabel" } : /* istanbul ignore next */ {}), alias: 'aria-label' });
    constructor() {
        classes(() => 'inline-flex text-[length:--spacing(4)] motion-safe:animate-spin');
    }
    static ɵfac = function HlmSpinner_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSpinner)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSpinner, selectors: [["hlm-spinner"]], hostAttrs: ["data-slot", "spinner", "role", "status"], hostVars: 1, hostBindings: function HlmSpinner_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.ariaLabel());
        } }, inputs: { icon: [1, "icon"], ariaLabel: [1, "aria-label", "ariaLabel"] }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideLoader2 })])], decls: 1, vars: 1, consts: [[3, "name"]], template: function HlmSpinner_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
        } if (rf & 2) {
            i0.ɵɵproperty("name", ctx.icon());
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSpinner, [{
        type: Component,
        args: [{
                selector: 'hlm-spinner',
                imports: [NgIcon],
                providers: [provideIcons({ lucideLoader2 })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'spinner',
                    role: 'status',
                    '[attr.aria-label]': 'ariaLabel()',
                },
                template: ` <ng-icon [name]="icon()" /> `,
            }]
    }], () => [], { icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSpinner, { className: "HlmSpinner", filePath: "libs/ui/spinner/src/lib/hlm-spinner.ts", lineNumber: 18 }); })();
