import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDropdownMenuItemSubIndicator {
    constructor() {
        classes(() => 'ms-auto flex items-center justify-center');
    }
    static ɵfac = function HlmDropdownMenuItemSubIndicator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuItemSubIndicator)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDropdownMenuItemSubIndicator, selectors: [["hlm-dropdown-menu-item-sub-indicator"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronRight })])], decls: 1, vars: 0, consts: [["name", "lucideChevronRight", 1, "text-[length:--spacing(4)]", "rtl:rotate-180"]], template: function HlmDropdownMenuItemSubIndicator_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuItemSubIndicator, [{
        type: Component,
        args: [{
                selector: 'hlm-dropdown-menu-item-sub-indicator',
                imports: [NgIcon],
                providers: [provideIcons({ lucideChevronRight })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <ng-icon name="lucideChevronRight" class="text-[length:--spacing(4)] rtl:rotate-180" />
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDropdownMenuItemSubIndicator, { className: "HlmDropdownMenuItemSubIndicator", filePath: "libs/ui/dropdown-menu/src/lib/hlm-dropdown-menu-item-sub-indicator.ts", lineNumber: 15 }); })();
