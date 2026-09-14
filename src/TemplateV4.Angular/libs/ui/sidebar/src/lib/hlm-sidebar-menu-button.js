import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { BrnTooltip, provideBrnTooltipDefaultOptions, } from '@spartan-ng/brain/tooltip';
import { DEFAULT_TOOLTIP_CONTENT_CLASSES, DEFAULT_TOOLTIP_SVG_CLASS, tooltipPositionVariants, } from '@spartan-ng/helm/tooltip';
import { classes, hlm } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import { HlmSidebarService } from './hlm-sidebar.service';
import { injectHlmSidebarConfig } from './hlm-sidebar.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/tooltip";
const sidebarMenuButtonVariants = cva('ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-md p-2 text-start text-sm transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_ng-icon]:shrink-0 [&_ng-icon]:text-[length:--spacing(4)] [&>span:last-child]:truncate', {
    variants: {
        variant: {
            default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            outline: 'bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_var(--sidebar-border)] hover:shadow-[0_0_0_1px_var(--sidebar-accent)]',
        },
        size: {
            default: 'h-8 text-sm',
            sm: 'h-7 text-xs',
            lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
export class HlmSidebarMenuButton {
    _config = injectHlmSidebarConfig();
    _sidebarService = inject(HlmSidebarService);
    _brnTooltip = inject(BrnTooltip);
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    isActive = input(false, { ...(ngDevMode ? { debugName: "isActive" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    closeMobileSidebarOnClick = input(this._config.closeMobileSidebarOnMenuButtonClick, { ...(ngDevMode ? { debugName: "closeMobileSidebarOnClick" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    _isTooltipHidden = computed(() => this._sidebarService.state() !== 'collapsed' || this._sidebarService.isMobile(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_isTooltipHidden" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => sidebarMenuButtonVariants({ variant: this.variant(), size: this.size() }));
        effect(() => this._brnTooltip.mutableTooltipDisabled.set(this._isTooltipHidden()));
    }
    onClick() {
        if (this.closeMobileSidebarOnClick()) {
            this._sidebarService.setOpenMobile(false);
        }
    }
    static ɵfac = function HlmSidebarMenuButton_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuButton)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarMenuButton, selectors: [["button", "hlmSidebarMenuButton", ""], ["a", "hlmSidebarMenuButton", ""]], hostAttrs: ["data-slot", "sidebar-menu-button", "data-sidebar", "menu-button"], hostVars: 2, hostBindings: function HlmSidebarMenuButton_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function HlmSidebarMenuButton_click_HostBindingHandler() { return ctx.onClick(); });
        } if (rf & 2) {
            i0.ɵɵattribute("data-size", ctx.size())("data-active", ctx.isActive());
        } }, inputs: { variant: [1, "variant"], size: [1, "size"], isActive: [1, "isActive"], closeMobileSidebarOnClick: [1, "closeMobileSidebarOnClick"] }, features: [i0.ɵɵProvidersFeature([
                provideBrnTooltipDefaultOptions({
                    showDelay: 150,
                    hideDelay: 0,
                    tooltipContentClasses: DEFAULT_TOOLTIP_CONTENT_CLASSES,
                    svgClasses: DEFAULT_TOOLTIP_SVG_CLASS,
                    arrowClasses: (position) => hlm(tooltipPositionVariants({ position })),
                    position: 'right',
                }),
            ]), i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnTooltip, inputs: ["brnTooltip", "tooltip"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuButton, [{
        type: Directive,
        args: [{
                selector: 'button[hlmSidebarMenuButton], a[hlmSidebarMenuButton]',
                providers: [
                    provideBrnTooltipDefaultOptions({
                        showDelay: 150,
                        hideDelay: 0,
                        tooltipContentClasses: DEFAULT_TOOLTIP_CONTENT_CLASSES,
                        svgClasses: DEFAULT_TOOLTIP_SVG_CLASS,
                        arrowClasses: (position) => hlm(tooltipPositionVariants({ position })),
                        position: 'right',
                    }),
                ],
                hostDirectives: [
                    {
                        directive: BrnTooltip,
                        inputs: ['brnTooltip: tooltip'],
                    },
                ],
                host: {
                    'data-slot': 'sidebar-menu-button',
                    'data-sidebar': 'menu-button',
                    '[attr.data-size]': 'size()',
                    '[attr.data-active]': 'isActive()',
                    '(click)': 'onClick()',
                },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], isActive: [{ type: i0.Input, args: [{ isSignal: true, alias: "isActive", required: false }] }], closeMobileSidebarOnClick: [{ type: i0.Input, args: [{ isSignal: true, alias: "closeMobileSidebarOnClick", required: false }] }] }); })();
