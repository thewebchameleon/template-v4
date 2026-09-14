import { booleanAttribute, Directive, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmSidebarService } from './hlm-sidebar.service';
import { injectHlmSidebarConfig } from './hlm-sidebar.token';
import * as i0 from "@angular/core";
export class HlmSidebarMenuSubButton {
    _sidebarService = inject(HlmSidebarService);
    _config = injectHlmSidebarConfig();
    closeMobileSidebarOnClick = input(this._config.closeMobileSidebarOnMenuButtonClick, { ...(ngDevMode ? { debugName: "closeMobileSidebarOnClick" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    isActive = input(false, { ...(ngDevMode ? { debugName: "isActive" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => 'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground h-7 gap-2 rounded-md px-2 focus-visible:ring-2 data-[size=md]:text-sm data-[size=sm]:text-xs [&>ng-icon]:text-[length:--spacing(4)] flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>ng-icon]:shrink-0 [&>span:last-child]:truncate');
    }
    onClick() {
        if (this.closeMobileSidebarOnClick()) {
            this._sidebarService.setOpenMobile(false);
        }
    }
    static ɵfac = function HlmSidebarMenuSubButton_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuSubButton)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenuSubButton, selectors: [["a", "hlmSidebarMenuSubButton", ""], ["button", "hlmSidebarMenuSubButton", ""]], hostAttrs: ["data-slot", "sidebar-menu-sub-button", "data-sidebar", "menu-sub-button"], hostVars: 2, hostBindings: function HlmSidebarMenuSubButton_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function HlmSidebarMenuSubButton_click_HostBindingHandler() { return ctx.onClick(); });
        } if (rf & 2) {
            i0.ɵɵattribute("data-active", ctx.isActive())("data-size", ctx.size());
        } }, inputs: { closeMobileSidebarOnClick: [1, "closeMobileSidebarOnClick"], size: [1, "size"], isActive: [1, "isActive"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuSubButton, [{
        type: Directive,
        args: [{
                selector: 'a[hlmSidebarMenuSubButton], button[hlmSidebarMenuSubButton]',
                host: {
                    'data-slot': 'sidebar-menu-sub-button',
                    'data-sidebar': 'menu-sub-button',
                    '[attr.data-active]': 'isActive()',
                    '[attr.data-size]': 'size()',
                    '(click)': 'onClick()',
                },
            }]
    }], () => [], { closeMobileSidebarOnClick: [{ type: i0.Input, args: [{ isSignal: true, alias: "closeMobileSidebarOnClick", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], isActive: [{ type: i0.Input, args: [{ isSignal: true, alias: "isActive", required: false }] }] }); })();
