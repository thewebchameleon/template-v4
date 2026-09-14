import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarMenu {
    constructor() {
        classes(() => 'gap-1 flex w-full min-w-0 flex-col');
    }
    static ɵfac = function HlmSidebarMenu_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenu)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenu, selectors: [["ul", "hlmSidebarMenu", ""]], hostAttrs: ["data-slot", "sidebar-menu", "data-sidebar", "menu"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenu, [{
        type: Directive,
        args: [{
                selector: 'ul[hlmSidebarMenu]',
                host: {
                    'data-slot': 'sidebar-menu',
                    'data-sidebar': 'menu',
                },
            }]
    }], () => [], null); })();
