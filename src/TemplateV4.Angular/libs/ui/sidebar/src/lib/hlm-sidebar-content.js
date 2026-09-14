import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarContent {
    constructor() {
        classes(() => 'no-scrollbar gap-2 flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden');
    }
    static ɵfac = function HlmSidebarContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarContent, selectors: [["", "hlmSidebarContent", ""], ["hlm-sidebar-content"]], hostAttrs: ["data-slot", "sidebar-content", "data-sidebar", "content"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarContent, [{
        type: Directive,
        args: [{
                selector: '[hlmSidebarContent],hlm-sidebar-content',
                host: {
                    'data-slot': 'sidebar-content',
                    'data-sidebar': 'content',
                },
            }]
    }], () => [], null); })();
