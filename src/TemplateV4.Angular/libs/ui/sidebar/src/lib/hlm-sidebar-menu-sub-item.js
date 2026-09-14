import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarMenuSubItem {
    constructor() {
        classes(() => 'group/menu-sub-item relative');
    }
    static ɵfac = function HlmSidebarMenuSubItem_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuSubItem)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenuSubItem, selectors: [["li", "hlmSidebarMenuSubItem", ""]], hostAttrs: ["data-slot", "sidebar-menu-sub-item", "data-sidebar", "menu-sub-item"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuSubItem, [{
        type: Directive,
        args: [{
                selector: 'li[hlmSidebarMenuSubItem]',
                host: {
                    'data-slot': 'sidebar-menu-sub-item',
                    'data-sidebar': 'menu-sub-item',
                },
            }]
    }], () => [], null); })();
