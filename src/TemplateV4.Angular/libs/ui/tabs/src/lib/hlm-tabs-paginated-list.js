import { CdkObserveContent } from '@angular/cdk/observers';
import { ChangeDetectionStrategy, Component, computed, contentChildren, input, viewChild, } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { BrnTabsPaginatedList, BrnTabsTrigger, } from '@spartan-ng/brain/tabs';
import { buttonVariants } from '@spartan-ng/helm/button';
import { classes, hlm } from '@spartan-ng/helm/utils';
import { listVariants } from './hlm-tabs-list';
import * as i0 from "@angular/core";
const _c0 = ["tabListContainer"];
const _c1 = ["tabList"];
const _c2 = ["tabListInner"];
const _c3 = ["nextPaginator"];
const _c4 = ["previousPaginator"];
const _c5 = ["*"];
export class HlmTabsPaginatedList extends BrnTabsPaginatedList {
    constructor() {
        super();
        classes(() => 'relative flex flex-shrink-0 items-center gap-1 overflow-hidden');
    }
    items = contentChildren(BrnTabsTrigger, { ...(ngDevMode ? { debugName: "items" } : /* istanbul ignore next */ {}), descendants: false });
    /** Explicitly annotating type to avoid non-portable inferred type */
    itemsChanges = toObservable(this.items);
    tabListContainer = viewChild.required('tabListContainer', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tabListContainer" }] : /* istanbul ignore next */ []));
    tabList = viewChild.required('tabList', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tabList" }] : /* istanbul ignore next */ []));
    tabListInner = viewChild.required('tabListInner', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tabListInner" }] : /* istanbul ignore next */ []));
    nextPaginator = viewChild.required('nextPaginator', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nextPaginator" }] : /* istanbul ignore next */ []));
    previousPaginator = viewChild.required('previousPaginator', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "previousPaginator" }] : /* istanbul ignore next */ []));
    tabListClass = input('', { ...(ngDevMode ? { debugName: "tabListClass" } : /* istanbul ignore next */ {}), alias: 'tabListClass' });
    _tabListClass = computed(() => hlm(listVariants(), this.tabListClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_tabListClass" }] : /* istanbul ignore next */ []));
    paginationButtonClass = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginationButtonClass" }] : /* istanbul ignore next */ []));
    _paginationButtonClass = computed(() => hlm('relative z-[2] select-none disabled:cursor-default', buttonVariants({ variant: 'ghost', size: 'icon-sm' }), this.paginationButtonClass(), this.showPaginationControls() ? 'inline-flex' : 'hidden'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_paginationButtonClass" }] : /* istanbul ignore next */ []));
    _itemSelected(event) {
        event.preventDefault();
    }
    static ɵfac = function HlmTabsPaginatedList_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTabsPaginatedList)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmTabsPaginatedList, selectors: [["hlm-paginated-tabs-list"]], contentQueries: function HlmTabsPaginatedList_ContentQueries(rf, ctx, dirIndex) { if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.items, BrnTabsTrigger, 4);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, viewQuery: function HlmTabsPaginatedList_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.tabListContainer, _c0, 5)(ctx.tabList, _c1, 5)(ctx.tabListInner, _c2, 5)(ctx.nextPaginator, _c3, 5)(ctx.previousPaginator, _c4, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(5);
        } }, hostAttrs: ["data-slot", "tabs-paginated-list"], inputs: { tabListClass: [1, "tabListClass"], paginationButtonClass: [1, "paginationButtonClass"] }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronRight, lucideChevronLeft })]), i0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c5, decls: 13, vars: 8, consts: [["previousPaginator", ""], ["tabListContainer", ""], ["tabList", ""], ["tabListInner", ""], ["nextPaginator", ""], ["data-pagination", "previous", "type", "button", "aria-hidden", "true", "tabindex", "-1", 3, "click", "mousedown", "touchend", "disabled"], ["name", "lucideChevronLeft"], [1, "z-[1]", "flex", "grow", "overflow-hidden", 3, "keydown"], ["role", "tablist", 1, "relative", "grow", "transition-transform", 3, "cdkObserveContent"], ["data-pagination", "next", "type", "button", "aria-hidden", "true", "tabindex", "-1", 3, "click", "mousedown", "touchend", "disabled"], ["name", "lucideChevronRight"]], template: function HlmTabsPaginatedList_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "button", 5, 0);
            i0.ɵɵlistener("click", function HlmTabsPaginatedList_Template_button_click_0_listener() { return ctx._handlePaginatorClick("before"); })("mousedown", function HlmTabsPaginatedList_Template_button_mousedown_0_listener($event) { return ctx._handlePaginatorPress("before", $event); })("touchend", function HlmTabsPaginatedList_Template_button_touchend_0_listener() { return ctx._stopInterval(); });
            i0.ɵɵelement(2, "ng-icon", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "div", 7, 1);
            i0.ɵɵlistener("keydown", function HlmTabsPaginatedList_Template_div_keydown_3_listener($event) { return ctx._handleKeydown($event); });
            i0.ɵɵelementStart(5, "div", 8, 2);
            i0.ɵɵlistener("cdkObserveContent", function HlmTabsPaginatedList_Template_div_cdkObserveContent_5_listener() { return ctx._onContentChanges(); });
            i0.ɵɵelementStart(7, "div", null, 3);
            i0.ɵɵprojection(9);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(10, "button", 9, 4);
            i0.ɵɵlistener("click", function HlmTabsPaginatedList_Template_button_click_10_listener() { return ctx._handlePaginatorClick("after"); })("mousedown", function HlmTabsPaginatedList_Template_button_mousedown_10_listener($event) { return ctx._handlePaginatorPress("after", $event); })("touchend", function HlmTabsPaginatedList_Template_button_touchend_10_listener() { return ctx._stopInterval(); });
            i0.ɵɵelement(12, "ng-icon", 10);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassMap(ctx._paginationButtonClass());
            i0.ɵɵproperty("disabled", ctx.disableScrollBefore || null);
            i0.ɵɵadvance(7);
            i0.ɵɵclassMap(ctx._tabListClass());
            i0.ɵɵadvance(3);
            i0.ɵɵclassMap(ctx._paginationButtonClass());
            i0.ɵɵproperty("disabled", ctx.disableScrollAfter || null);
        } }, dependencies: [CdkObserveContent, NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTabsPaginatedList, [{
        type: Component,
        args: [{
                selector: 'hlm-paginated-tabs-list',
                imports: [CdkObserveContent, NgIcon],
                providers: [provideIcons({ lucideChevronRight, lucideChevronLeft })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'tabs-paginated-list',
                },
                template: `
    <button
      #previousPaginator
      data-pagination="previous"
      type="button"
      aria-hidden="true"
      tabindex="-1"
      [class]="_paginationButtonClass()"
      [disabled]="disableScrollBefore || null"
      (click)="_handlePaginatorClick('before')"
      (mousedown)="_handlePaginatorPress('before', $event)"
      (touchend)="_stopInterval()"
    >
      <ng-icon name="lucideChevronLeft" />
    </button>

    <div
      #tabListContainer
      class="z-[1] flex grow overflow-hidden"
      (keydown)="_handleKeydown($event)"
    >
      <div
        class="relative grow transition-transform"
        #tabList
        role="tablist"
        (cdkObserveContent)="_onContentChanges()"
      >
        <div #tabListInner [class]="_tabListClass()">
          <ng-content />
        </div>
      </div>
    </div>

    <button
      #nextPaginator
      data-pagination="next"
      type="button"
      aria-hidden="true"
      tabindex="-1"
      [class]="_paginationButtonClass()"
      [disabled]="disableScrollAfter || null"
      (click)="_handlePaginatorClick('after')"
      (mousedown)="_handlePaginatorPress('after', $event)"
      (touchend)="_stopInterval()"
    >
      <ng-icon name="lucideChevronRight" />
    </button>
  `,
            }]
    }], () => [], { items: [{ type: i0.ContentChildren, args: [i0.forwardRef(() => BrnTabsTrigger), { ...{ descendants: false }, isSignal: true }] }], tabListContainer: [{ type: i0.ViewChild, args: ['tabListContainer', { isSignal: true }] }], tabList: [{ type: i0.ViewChild, args: ['tabList', { isSignal: true }] }], tabListInner: [{ type: i0.ViewChild, args: ['tabListInner', { isSignal: true }] }], nextPaginator: [{ type: i0.ViewChild, args: ['nextPaginator', { isSignal: true }] }], previousPaginator: [{ type: i0.ViewChild, args: ['previousPaginator', { isSignal: true }] }], tabListClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabListClass", required: false }] }], paginationButtonClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "paginationButtonClass", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmTabsPaginatedList, { className: "HlmTabsPaginatedList", filePath: "libs/ui/tabs/src/lib/hlm-tabs-paginated-list.ts", lineNumber: 82 }); })();
