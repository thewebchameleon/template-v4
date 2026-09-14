import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarFooter {
    constructor() {
        classes(() => 'gap-2 p-2 flex flex-col');
    }
    static ɵfac = function HlmSidebarFooter_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarFooter)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarFooter, selectors: [["", "hlmSidebarFooter", ""], ["hlm-sidebar-footer"]], hostAttrs: ["data-slot", "sidebar-footer", "data-sidebar", "footer"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarFooter, [{
        type: Directive,
        args: [{
                selector: '[hlmSidebarFooter],hlm-sidebar-footer',
                host: {
                    'data-slot': 'sidebar-footer',
                    'data-sidebar': 'footer',
                },
            }]
    }], () => [], null); })();
