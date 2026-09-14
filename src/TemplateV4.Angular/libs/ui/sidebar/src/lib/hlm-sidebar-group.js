import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarGroup {
    constructor() {
        classes(() => 'p-2 relative flex w-full min-w-0 flex-col');
    }
    static ɵfac = function HlmSidebarGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarGroup, selectors: [["", "hlmSidebarGroup", ""], ["hlm-sidebar-group"]], hostAttrs: ["data-slot", "sidebar-group", "data-sidebar", "group"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarGroup, [{
        type: Directive,
        args: [{
                selector: '[hlmSidebarGroup],hlm-sidebar-group',
                host: {
                    'data-slot': 'sidebar-group',
                    'data-sidebar': 'group',
                },
            }]
    }], () => [], null); })();
