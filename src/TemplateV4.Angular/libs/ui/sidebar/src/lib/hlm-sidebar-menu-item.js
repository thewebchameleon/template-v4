import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarMenuItem {
    constructor() {
        classes(() => 'group/menu-item relative');
    }
    static ɵfac = function HlmSidebarMenuItem_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuItem)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenuItem, selectors: [["li", "hlmSidebarMenuItem", ""]], hostAttrs: ["data-slot", "sidebar-menu-item", "data-sidebar", "menu-item"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuItem, [{
        type: Directive,
        args: [{
                selector: 'li[hlmSidebarMenuItem]',
                host: {
                    'data-slot': 'sidebar-menu-item',
                    'data-sidebar': 'menu-item',
                },
            }]
    }], () => [], null); })();
