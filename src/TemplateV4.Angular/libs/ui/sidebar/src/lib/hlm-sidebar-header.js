import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarHeader {
    constructor() {
        classes(() => 'gap-2 p-2 flex flex-col');
    }
    static ɵfac = function HlmSidebarHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarHeader, selectors: [["", "hlmSidebarHeader", ""], ["hlm-sidebar-header"]], hostAttrs: ["data-slot", "sidebar-header", "data-sidebar", "header"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmSidebarHeader],hlm-sidebar-header',
                host: {
                    'data-slot': 'sidebar-header',
                    'data-sidebar': 'header',
                },
            }]
    }], () => [], null); })();
