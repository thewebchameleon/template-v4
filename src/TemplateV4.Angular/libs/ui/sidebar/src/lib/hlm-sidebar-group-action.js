import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarGroupAction {
    constructor() {
        classes(() => 'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute end-3 top-3.5 w-5 rounded-md p-0 focus-visible:ring-2 [&>ng-icon]:text-[length:--spacing(4)] flex aspect-square items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>ng-icon]:shrink-0');
    }
    static ɵfac = function HlmSidebarGroupAction_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarGroupAction)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarGroupAction, selectors: [["button", "hlmSidebarGroupAction", ""]], hostAttrs: ["data-slot", "sidebar-group-action", "data-sidebar", "group-action"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarGroupAction, [{
        type: Directive,
        args: [{
                selector: 'button[hlmSidebarGroupAction]',
                host: {
                    'data-slot': 'sidebar-group-action',
                    'data-sidebar': 'group-action',
                },
            }]
    }], () => [], null); })();
