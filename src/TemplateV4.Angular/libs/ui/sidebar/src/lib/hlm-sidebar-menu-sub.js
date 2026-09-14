import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarMenuSub {
    constructor() {
        classes(() => 'border-sidebar-border mx-3.5 translate-x-px gap-1 border-s px-2.5 py-0.5 group-data-[collapsible=icon]:hidden rtl:-translate-x-px flex min-w-0 flex-col');
    }
    static ɵfac = function HlmSidebarMenuSub_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuSub)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenuSub, selectors: [["ul", "hlmSidebarMenuSub", ""]], hostAttrs: ["data-slot", "sidebar-menu-sub", "data-sidebar", "menu-sub"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuSub, [{
        type: Directive,
        args: [{
                selector: 'ul[hlmSidebarMenuSub]',
                host: {
                    'data-slot': 'sidebar-menu-sub',
                    'data-sidebar': 'menu-sub',
                },
            }]
    }], () => [], null); })();
