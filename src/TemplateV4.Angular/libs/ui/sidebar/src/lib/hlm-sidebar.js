import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { classes, hlm } from '@spartan-ng/helm/utils';
import { HlmSidebarService } from './hlm-sidebar.service';
import { injectHlmSidebarConfig } from './hlm-sidebar.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/sheet";
const _c0 = ["*"];
function HlmSidebar_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵprojection(0);
} }
function HlmSidebar_Conditional_2_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function HlmSidebar_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, HlmSidebar_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 2);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const contentContainer_r1 = i0.ɵɵreference(1);
    i0.ɵɵproperty("ngTemplateOutlet", contentContainer_r1);
} }
function HlmSidebar_Conditional_3_hlm_sheet_content_1_ng_container_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function HlmSidebar_Conditional_3_hlm_sheet_content_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-sheet-content", 5)(1, "h2", 6);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 7);
    i0.ɵɵtemplate(4, HlmSidebar_Conditional_3_hlm_sheet_content_1_ng_container_4_Template, 1, 0, "ng-container", 2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    const contentContainer_r1 = i0.ɵɵreference(1);
    i0.ɵɵstyleProp("--%NS%sidebar-width", ctx_r2.sidebarWidthMobile());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.mobileTitle());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngTemplateOutlet", contentContainer_r1);
} }
function HlmSidebar_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-sheet", 3);
    i0.ɵɵlistener("stateChanged", function HlmSidebar_Conditional_3_Template_hlm_sheet_stateChanged_0_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2._sidebarService.setOpenMobile($event === "open")); });
    i0.ɵɵtemplate(1, HlmSidebar_Conditional_3_hlm_sheet_content_1_Template, 5, 4, "hlm-sheet-content", 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("side", ctx_r2.side())("state", ctx_r2._sidebarService.openMobile() ? "open" : "closed");
} }
function HlmSidebar_Conditional_4_ng_container_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function HlmSidebar_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 8);
    i0.ɵɵelementStart(1, "div", 9)(2, "div", 10);
    i0.ɵɵtemplate(3, HlmSidebar_Conditional_4_ng_container_3_Template, 1, 0, "ng-container", 2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    const contentContainer_r1 = i0.ɵɵreference(1);
    i0.ɵɵclassMap(ctx_r2._sidebarGapComputedClass());
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx_r2._sidebarContainerComputedClass());
    i0.ɵɵstyleProp("left", ctx_r2.collapsible() === "panel" ? "auto" : null)("right", ctx_r2.collapsible() === "panel" ? "auto" : null)("inset-inline-start", ctx_r2.collapsible() === "panel" ? "0" : null);
    i0.ɵɵattribute("data-side", ctx_r2._dataSide());
    i0.ɵɵadvance();
    i0.ɵɵclassProp("flex-row", ctx_r2.collapsible() === "panel")("flex-col", ctx_r2.collapsible() !== "panel");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", contentContainer_r1);
} }
export class HlmSidebar {
    _sidebarService = inject(HlmSidebarService);
    _config = injectHlmSidebarConfig();
    mobileTitle = input('Navigation', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mobileTitle" }] : /* istanbul ignore next */ []));
    sidebarWidthMobile = input(this._config.sidebarWidthMobile, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sidebarWidthMobile" }] : /* istanbul ignore next */ []));
    side = input('left', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "side" }] : /* istanbul ignore next */ []));
    variant = input(this._sidebarService.variant(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    collapsible = input('offcanvas', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "collapsible" }] : /* istanbul ignore next */ []));
    _sidebarGapComputedClass = computed(() => hlm('transition-[width] duration-200 ease-linear group-data-[resizing=true]/sidebar-wrapper:transition-none relative w-(--sidebar-width) bg-transparent', 'group-data-[collapsible=offcanvas]:w-0', 'group-data-[side=right]:rotate-180', this.variant() === 'floating' || this.variant() === 'inset'
        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_sidebarGapComputedClass" }] : /* istanbul ignore next */ []));
    sidebarContainerClass = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sidebarContainerClass" }] : /* istanbul ignore next */ []));
    _sidebarContainerComputedClass = computed(() => hlm('fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear group-data-[resizing=true]/sidebar-wrapper:transition-none data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex', this.collapsible() === 'panel'
        ? 'p-0'
        : this.variant() === 'floating' || this.variant() === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l', this.sidebarContainerClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_sidebarContainerComputedClass" }] : /* istanbul ignore next */ []));
    _dataSlot = computed(() => {
        return !this._sidebarService.isMobile() ? 'sidebar' : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_dataSlot" }] : /* istanbul ignore next */ []));
    _collapsibleAndNonMobile = computed(() => {
        return this.collapsible() !== 'none' && !this._sidebarService.isMobile();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_collapsibleAndNonMobile" }] : /* istanbul ignore next */ []));
    _dataState = computed(() => {
        return this._collapsibleAndNonMobile() ? this._sidebarService.state() : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_dataState" }] : /* istanbul ignore next */ []));
    _dataCollapsible = computed(() => {
        if (this._collapsibleAndNonMobile()) {
            return this._sidebarService.state() === 'collapsed' ? this.collapsible() : '';
        }
        return undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_dataCollapsible" }] : /* istanbul ignore next */ []));
    _dataVariant = computed(() => {
        return this._collapsibleAndNonMobile() ? this.variant() : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_dataVariant" }] : /* istanbul ignore next */ []));
    _dataSide = computed(() => {
        return this._collapsibleAndNonMobile() ? this.side() : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_dataSide" }] : /* istanbul ignore next */ []));
    constructor() {
        // Sync variant input with service
        effect(() => {
            this._sidebarService.setVariant(this.variant());
        });
        classes(() => {
            if (this.collapsible() === 'none') {
                return hlm('bg-sidebar text-sidebar-foreground flex h-svh w-(--sidebar-width) flex-col');
            }
            else if (this._sidebarService.isMobile()) {
                return '';
            }
            else {
                return hlm('group peer text-sidebar-foreground hidden md:block');
            }
        });
    }
    static ɵfac = function HlmSidebar_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebar)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSidebar, selectors: [["hlm-sidebar"]], hostVars: 6, hostBindings: function HlmSidebar_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-slot", ctx._dataSlot())("data-state", ctx._dataState())("data-collapsible", ctx._dataCollapsible())("data-variant", ctx._dataVariant())("data-side", ctx._dataSide())("data-layout", ctx.collapsible() === "panel" ? "rail-panel" : null);
        } }, inputs: { mobileTitle: [1, "mobileTitle"], sidebarWidthMobile: [1, "sidebarWidthMobile"], side: [1, "side"], variant: [1, "variant"], collapsible: [1, "collapsible"], sidebarContainerClass: [1, "sidebarContainerClass"] }, ngContentSelectors: _c0, decls: 5, vars: 1, consts: [["contentContainer", ""], [3, "side", "state"], [4, "ngTemplateOutlet"], [3, "stateChanged", "side", "state"], ["data-slot", "sidebar", "data-sidebar", "sidebar", "data-mobile", "true", "class", "bg-sidebar text-sidebar-foreground h-svh w-(--sidebar-width) p-0 [&>button]:hidden", 3, "--%NS%sidebar-width", 4, "hlmSheetPortal"], ["data-slot", "sidebar", "data-sidebar", "sidebar", "data-mobile", "true", 1, "bg-sidebar", "text-sidebar-foreground", "h-svh", "w-(--sidebar-width)", "p-0", "[&>button]:hidden"], ["hlmSheetTitle", "", 1, "sr-only"], [1, "flex", "h-full", "w-full", "flex-col"], ["data-slot", "sidebar-gap"], ["data-slot", "sidebar-container"], ["data-sidebar", "sidebar", "data-slot", "sidebar-inner", 1, "bg-sidebar", "group-data-[variant=floating]:ring-sidebar-border", "group-data-[variant=floating]:rounded-lg", "group-data-[variant=floating]:shadow-sm", "group-data-[variant=floating]:ring-1", "flex", "size-full"]], template: function HlmSidebar_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵtemplate(0, HlmSidebar_ng_template_0_Template, 1, 0, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵconditionalCreate(2, HlmSidebar_Conditional_2_Template, 1, 1, "ng-container")(3, HlmSidebar_Conditional_3_Template, 2, 2, "hlm-sheet", 1)(4, HlmSidebar_Conditional_4_Template, 4, 16);
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.collapsible() === "none" ? 2 : ctx._sidebarService.isMobile() ? 3 : 4);
        } }, dependencies: [NgTemplateOutlet, i1.HlmSheet, i1.HlmSheetContent, i1.HlmSheetPortal, i1.HlmSheetTitle], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebar, [{
        type: Component,
        args: [{
                selector: 'hlm-sidebar',
                imports: [NgTemplateOutlet, HlmSheetImports],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    '[attr.data-slot]': '_dataSlot()',
                    '[attr.data-state]': '_dataState()',
                    '[attr.data-collapsible]': '_dataCollapsible()',
                    '[attr.data-variant]': '_dataVariant()',
                    '[attr.data-side]': '_dataSide()',
                    '[attr.data-layout]': 'collapsible() === "panel" ? "rail-panel" : null',
                },
                template: `
    <ng-template #contentContainer>
      <ng-content />
    </ng-template>

    @if (collapsible() === 'none') {
      <ng-container *ngTemplateOutlet="contentContainer"></ng-container>
    } @else if (_sidebarService.isMobile()) {
      <hlm-sheet
        [side]="side()"
        [state]="_sidebarService.openMobile() ? 'open' : 'closed'"
        (stateChanged)="_sidebarService.setOpenMobile($event === 'open')"
      >
        <hlm-sheet-content
          *hlmSheetPortal="let ctx"
          data-slot="sidebar"
          data-sidebar="sidebar"
          data-mobile="true"
          class="bg-sidebar text-sidebar-foreground h-svh w-(--sidebar-width) p-0 [&>button]:hidden"
          [style.--sidebar-width]="sidebarWidthMobile()"
        >
          <h2 hlmSheetTitle class="sr-only">{{ mobileTitle() }}</h2>
          <div class="flex h-full w-full flex-col">
            <ng-container *ngTemplateOutlet="contentContainer" />
          </div>
        </hlm-sheet-content>
      </hlm-sheet>
    } @else {
      <!-- Sidebar gap on desktop -->
      <div data-slot="sidebar-gap" [class]="_sidebarGapComputedClass()"></div>
      <div
        data-slot="sidebar-container"
        [attr.data-side]="_dataSide()"
        [class]="_sidebarContainerComputedClass()"
        [style.left]="collapsible() === 'panel' ? 'auto' : null"
        [style.right]="collapsible() === 'panel' ? 'auto' : null"
        [style.inset-inline-start]="collapsible() === 'panel' ? '0' : null"
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          class="bg-sidebar group-data-[variant=floating]:ring-sidebar-border group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 flex size-full"
          [class.flex-row]="collapsible() === 'panel'"
          [class.flex-col]="collapsible() !== 'panel'"
        >
          <ng-container *ngTemplateOutlet="contentContainer" />
        </div>
      </div>
    }
  `,
            }]
    }], () => [], { mobileTitle: [{ type: i0.Input, args: [{ isSignal: true, alias: "mobileTitle", required: false }] }], sidebarWidthMobile: [{ type: i0.Input, args: [{ isSignal: true, alias: "sidebarWidthMobile", required: false }] }], side: [{ type: i0.Input, args: [{ isSignal: true, alias: "side", required: false }] }], variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], collapsible: [{ type: i0.Input, args: [{ isSignal: true, alias: "collapsible", required: false }] }], sidebarContainerClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "sidebarContainerClass", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSidebar, { className: "HlmSidebar", filePath: "libs/ui/sidebar/src/lib/hlm-sidebar.ts", lineNumber: 72 }); })();
