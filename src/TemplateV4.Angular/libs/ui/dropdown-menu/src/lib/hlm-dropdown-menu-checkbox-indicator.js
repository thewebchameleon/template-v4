import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDropdownMenuCheckboxIndicator {
    constructor() {
        classes(() => 'absolute end-2 flex items-center justify-center [&_ng-icon]:text-[length:--spacing(4)] pointer-events-none opacity-0 group-data-checked/dropdown-menu-checkbox:opacity-100');
    }
    static ɵfac = function HlmDropdownMenuCheckboxIndicator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuCheckboxIndicator)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDropdownMenuCheckboxIndicator, selectors: [["hlm-dropdown-menu-checkbox-indicator"]], hostAttrs: ["data-slot", "dropdown-menu-checkbox-item-indicator"], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideCheck })])], decls: 1, vars: 0, consts: [["name", "lucideCheck"]], template: function HlmDropdownMenuCheckboxIndicator_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuCheckboxIndicator, [{
        type: Component,
        args: [{
                selector: 'hlm-dropdown-menu-checkbox-indicator',
                imports: [NgIcon],
                providers: [provideIcons({ lucideCheck })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: { 'data-slot': 'dropdown-menu-checkbox-item-indicator' },
                template: ` <ng-icon name="lucideCheck" /> `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDropdownMenuCheckboxIndicator, { className: "HlmDropdownMenuCheckboxIndicator", filePath: "libs/ui/dropdown-menu/src/lib/hlm-dropdown-menu-checkbox-indicator.ts", lineNumber: 14 }); })();
