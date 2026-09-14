import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarMenuBadge {
    constructor() {
        classes(() => 'text-sidebar-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground pointer-events-none absolute end-1 h-5 min-w-5 rounded-md px-1 text-xs font-medium peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 flex items-center justify-center tabular-nums select-none group-data-[collapsible=icon]:hidden');
    }
    static ɵfac = function HlmSidebarMenuBadge_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuBadge)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenuBadge, selectors: [["", "hlmSidebarMenuBadge", ""], ["hlm-sidebar-menu-badge"]], hostAttrs: ["data-slot", "sidebar-menu-badge", "data-sidebar", "menu-badge"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuBadge, [{
        type: Directive,
        args: [{
                selector: '[hlmSidebarMenuBadge],hlm-sidebar-menu-badge',
                host: {
                    'data-slot': 'sidebar-menu-badge',
                    'data-sidebar': 'menu-badge',
                },
            }]
    }], () => [], null); })();
