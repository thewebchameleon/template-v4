import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarGroupContent {
    constructor() {
        classes(() => 'text-sm w-full');
    }
    static ɵfac = function HlmSidebarGroupContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarGroupContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarGroupContent, selectors: [["div", "hlmSidebarGroupContent", ""]], hostAttrs: ["data-slot", "sidebar-group-content", "data-sidebar", "group-content"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarGroupContent, [{
        type: Directive,
        args: [{
                selector: 'div[hlmSidebarGroupContent]',
                host: {
                    'data-slot': 'sidebar-group-content',
                    'data-sidebar': 'group-content',
                },
            }]
    }], () => [], null); })();
