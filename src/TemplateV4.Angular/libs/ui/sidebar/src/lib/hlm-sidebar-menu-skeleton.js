import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/skeleton";
function HlmSidebarMenuSkeleton_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-skeleton", 0);
} }
function HlmSidebarMenuSkeleton_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-skeleton", 2);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("--%NS%skeleton-width", ctx_r0._width);
} }
export class HlmSidebarMenuSkeleton {
    showIcon = input(false, { ...(ngDevMode ? { debugName: "showIcon" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    _width = `${Math.floor(Math.random() * 40) + 50}%`;
    constructor() {
        classes(() => 'h-8 gap-2 rounded-md px-2 flex items-center');
    }
    static ɵfac = function HlmSidebarMenuSkeleton_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarMenuSkeleton)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSidebarMenuSkeleton, selectors: [["hlm-sidebar-menu-skeleton"], ["div", "hlmSidebarMenuSkeleton", ""]], hostAttrs: ["data-slot", "sidebar-menu-skeleton", "data-sidebar", "menu-skeleton"], inputs: { showIcon: [1, "showIcon"] }, decls: 2, vars: 1, consts: [["data-sidebar", "menu-skeleton-icon", 1, "size-4", "rounded-md"], ["data-sidebar", "menu-skeleton-text", 1, "h-4", "max-w-(--skeleton-width)", "flex-1", 3, "--%NS%skeleton-width"], ["data-sidebar", "menu-skeleton-text", 1, "h-4", "max-w-(--skeleton-width)", "flex-1"]], template: function HlmSidebarMenuSkeleton_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, HlmSidebarMenuSkeleton_Conditional_0_Template, 1, 0, "hlm-skeleton", 0)(1, HlmSidebarMenuSkeleton_Conditional_1_Template, 1, 2, "hlm-skeleton", 1);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.showIcon() ? 0 : 1);
        } }, dependencies: [i1.HlmSkeleton], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarMenuSkeleton, [{
        type: Component,
        args: [{
                selector: 'hlm-sidebar-menu-skeleton,div[hlmSidebarMenuSkeleton]',
                imports: [HlmSkeletonImports],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'sidebar-menu-skeleton',
                    'data-sidebar': 'menu-skeleton',
                },
                template: `
    @if (showIcon()) {
      <hlm-skeleton data-sidebar="menu-skeleton-icon" class="size-4 rounded-md" />
    } @else {
      <hlm-skeleton
        data-sidebar="menu-skeleton-text"
        class="h-4 max-w-(--skeleton-width) flex-1"
        [style.--skeleton-width]="_width"
      />
    }
  `,
            }]
    }], () => [], { showIcon: [{ type: i0.Input, args: [{ isSignal: true, alias: "showIcon", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSidebarMenuSkeleton, { className: "HlmSidebarMenuSkeleton", filePath: "libs/ui/sidebar/src/lib/hlm-sidebar-menu-skeleton.ts", lineNumber: 26 }); })();
