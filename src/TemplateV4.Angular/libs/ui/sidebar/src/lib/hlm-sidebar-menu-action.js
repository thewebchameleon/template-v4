import { booleanAttribute, Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarMenuAction {
    showOnHover = input(false, { ...(ngDevMode ? { debugName: "showOnHover" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => [
            'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute end-1 top-1.5 aspect-square w-5 rounded-md p-0 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 focus-visible:ring-2 [&>ng-icon]:text-[length:--spacing(4)] flex items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>ng-icon]:shrink-0',
            this.showOnHover() &&
                'peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 md:opacity-0',
        ]);
    }
    static ɵfac = function HlmSidebarMenuAction_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuAction)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenuAction, selectors: [["button", "hlmSidebarMenuAction", ""]], hostAttrs: ["data-slot", "sidebar-menu-action", "data-sidebar", "menu-action"], inputs: { showOnHover: [1, "showOnHover"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuAction, [{
        type: Directive,
        args: [{
                selector: 'button[hlmSidebarMenuAction]',
                host: {
                    'data-slot': 'sidebar-menu-action',
                    'data-sidebar': 'menu-action',
                },
            }]
    }], () => [], { showOnHover: [{ type: i0.Input, args: [{ isSignal: true, alias: "showOnHover", required: false }] }] }); })();
