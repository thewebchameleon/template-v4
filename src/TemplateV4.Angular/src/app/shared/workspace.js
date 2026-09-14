import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowDownToLine, lucideArrowLeft, lucideArrowUpFromLine, lucideBell, lucideCheck, lucideClock3, lucideFile, lucideFolderOpen, lucideFunnel, lucideFunnelX, lucideHistory, lucideInbox, lucideMail, lucidePlus, lucideRefreshCw, lucideSearch, lucideShieldCheck, lucideActivity, lucideTrash2, lucideArrowUpRight, lucideTriangleAlert, } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { I18n, Translate } from '../core/i18n';
import { ViewModeToggle } from './view-mode-toggle';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/skeleton";
import * as i2 from "@spartan-ng/helm/button";
import * as i3 from "@spartan-ng/helm/empty";
import * as i4 from "@spartan-ng/helm/alert";
import * as i5 from "@spartan-ng/helm/select";
const _c0 = ["*"];
function PageState_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 0)(1, "span", 3);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "div", 4)(5, "div", 5)(6, "div", 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "loading"));
} }
function PageState_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "div", 7)(2, "h2", 8);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 9);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "a", 10);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, "accessRestricted"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "accessRestrictedHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 7, "account"));
} }
function PageState_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "h2", 11);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 12);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 13);
    i0.ɵɵlistener("click", function PageState_Conditional_2_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.retry.emit()); });
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "loadFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 5, "loadFailedHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 7, "retry"), " ");
} }
function PageState_Conditional_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "refreshing"));
} }
function PageState_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "p", 12);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 16);
    i0.ɵɵlistener("click", function PageState_Conditional_3_Conditional_1_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.retry.emit()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "refreshFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "retry"));
} }
function PageState_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, PageState_Conditional_3_Conditional_0_Template, 3, 3, "p", 14);
    i0.ɵɵconditionalCreate(1, PageState_Conditional_3_Conditional_1_Template, 7, 6, "div", 15);
    i0.ɵɵprojection(2);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.refreshing() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.refreshError() ? 1 : -1);
} }
function ListPager_Conditional_3_hlm_select_content_7_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", option_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.i18n.number(option_r3));
} }
function ListPager_Conditional_3_hlm_select_content_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 9);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, ListPager_Conditional_3_hlm_select_content_7_For_3_Template, 2, 2, "hlm-select-item", 10, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "rowsPerPage"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.sizeOptions());
} }
function ListPager_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 2)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "hlm-select", 6);
    i0.ɵɵlistener("valueChange", function ListPager_Conditional_3_Template_hlm_select_valueChange_4_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.changeSize($event)); });
    i0.ɵɵelementStart(5, "hlm-select-trigger", 7);
    i0.ɵɵelement(6, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, ListPager_Conditional_3_hlm_select_content_7_Template, 4, 3, "hlm-select-content", 8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "rowsPerPage"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.size())("itemToString", ctx_r1.sizeLabel);
} }
function ListPager_For_12_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵlistener("click", function ListPager_For_12_Template_button_click_0_listener() { const value_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.pageChange.emit(value_r5)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const value_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("variant", value_r5 === ctx_r1.page() ? "secondary" : "ghost")("disabled", ctx_r1.busy());
    i0.ɵɵattribute("aria-current", value_r5 === ctx_r1.page() ? "page" : null)("aria-label", ctx_r1.pageLabel(value_r5));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.i18n.number(value_r5), " ");
} }
export const workspaceIcons = provideIcons({
    lucideArrowDownToLine,
    lucideArrowLeft,
    lucideArrowUpFromLine,
    lucideBell,
    lucideCheck,
    lucideClock3,
    lucideFile,
    lucideFolderOpen,
    lucideFunnel,
    lucideFunnelX,
    lucideHistory,
    lucideInbox,
    lucideMail,
    lucidePlus,
    lucideRefreshCw,
    lucideSearch,
    lucideShieldCheck,
    lucideActivity,
    lucideTrash2,
    lucideArrowUpRight,
    lucideTriangleAlert,
});
export class Resource {
    value = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    state = signal('loading', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    refreshing = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "refreshing" }] : /* istanbul ignore next */ []));
    refreshError = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "refreshError" }] : /* istanbul ignore next */ []));
    controller;
    constructor() {
        inject(DestroyRef).onDestroy(() => this.controller?.abort());
    }
    async load(fetch) {
        this.controller?.abort();
        const controller = (this.controller = new AbortController());
        this.refreshError.set(false);
        this.refreshing.set(this.value() !== null);
        if (this.value() === null)
            this.state.set('loading');
        try {
            const value = await fetch(controller.signal);
            if (!controller.signal.aborted) {
                this.value.set(value);
                this.state.set('ready');
                return true;
            }
        }
        catch (error) {
            if (!controller.signal.aborted) {
                if (error instanceof HttpErrorResponse && error.status === 403) {
                    this.value.set(null);
                    this.state.set('forbidden');
                }
                else if (this.value() !== null) {
                    this.refreshError.set(true);
                    this.state.set('ready');
                }
                else
                    this.state.set('error');
            }
        }
        finally {
            if (!controller.signal.aborted)
                this.refreshing.set(false);
        }
        return false;
    }
}
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
export class ListQuery {
    namespace;
    preserveFragment;
    route = inject(ActivatedRoute);
    router = inject(Router);
    params = toSignal(this.route.queryParamMap, { requireSync: true });
    changes = this.route.queryParamMap.pipe(takeUntilDestroyed());
    constructor(namespace = '', preserveFragment = false) {
        this.namespace = namespace;
        this.preserveFragment = preserveFragment;
    }
    key(key) {
        return this.namespace ? this.namespace + key.charAt(0).toUpperCase() + key.slice(1) : key;
    }
    connect(load, keys) {
        let previous;
        this.changes.subscribe((params) => {
            if (!keys?.length) {
                load();
                return;
            }
            const current = JSON.stringify(keys.map((key) => params.get(this.key(key))));
            if (current === previous)
                return;
            previous = current;
            load();
        });
    }
    text(key, fallback = '') {
        return this.params().get(this.key(key)) ?? fallback;
    }
    get page() {
        const n = Number(this.text('page', '1'));
        return Number.isInteger(n) && n > 0 && n <= 10000 ? n : 1;
    }
    direction(fallback) {
        const value = this.text('direction', fallback);
        return value === 'asc' || value === 'desc' ? value : fallback;
    }
    clamp(total, size = DEFAULT_PAGE_SIZE) {
        if (total === undefined)
            return;
        const page = Math.max(1, Math.ceil(total / size));
        if (this.page > page)
            void this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { [this.key('page')]: page },
                queryParamsHandling: 'merge',
                replaceUrl: true,
                preserveFragment: this.preserveFragment,
            });
    }
    set(values) {
        const queryParams = Object.fromEntries(Object.entries(values).map(([key, value]) => [this.key(key), value]));
        return this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: 'merge',
            preserveFragment: this.preserveFragment,
        });
    }
}
export const DATA_TABLE_SEARCH_DEBOUNCE_MS = 300;
export class DebouncedSearch {
    query;
    key;
    value = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    changes = new Subject();
    constructor(query, key = 'search') {
        this.query = query;
        this.key = key;
        this.changes
            .pipe(debounceTime(DATA_TABLE_SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((value) => {
            if (this.query.text(this.key) !== value)
                void this.query.set({ [this.key]: value || null, page: 1 });
        });
    }
    update(value) {
        this.value.set(value);
        this.changes.next(value);
    }
    sync(value) {
        this.update(value);
    }
}
export class PageHeader {
    eyebrow = input('workspace', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "eyebrow" }] : /* istanbul ignore next */ []));
    title = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "title" }] : /* istanbul ignore next */ []));
    description = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "description" }] : /* istanbul ignore next */ []));
    static ɵfac = function PageHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PageHeader)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PageHeader, selectors: [["app-page-header"]], inputs: { eyebrow: [1, "eyebrow"], title: [1, "title"], description: [1, "description"] }, ngContentSelectors: _c0, decls: 13, vars: 9, consts: [[1, "workspace-heading"], [1, "min-w-0"], [1, "workspace-eyebrow"], [1, "page-title"], [1, "workspace-description"], [1, "workspace-heading-actions"]], template: function PageHeader_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵdomElementStart(0, "header", 0)(1, "div", 1)(2, "p", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(5, "h1", 3);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "t");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(8, "p", 4);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "t");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(11, "div", 5);
            i0.ɵɵprojection(12);
            i0.ɵɵdomElementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, ctx.eyebrow()));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, ctx.title()));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 7, ctx.description()));
        } }, dependencies: [Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PageHeader, [{
        type: Component,
        args: [{
                selector: 'app-page-header',
                imports: [Translate],
                template: ` <header class="workspace-heading">
    <div class="min-w-0">
      <p class="workspace-eyebrow">{{ eyebrow() | t }}</p>
      <h1 class="page-title">{{ title() | t }}</h1>
      <p class="workspace-description">{{ description() | t }}</p>
    </div>
    <div class="workspace-heading-actions"><ng-content /></div>
  </header>`,
            }]
    }], null, { eyebrow: [{ type: i0.Input, args: [{ isSignal: true, alias: "eyebrow", required: false }] }], title: [{ type: i0.Input, args: [{ isSignal: true, alias: "title", required: true }] }], description: [{ type: i0.Input, args: [{ isSignal: true, alias: "description", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PageHeader, { className: "PageHeader", filePath: "src/app/shared/workspace.ts", lineNumber: 217 }); })();
export class PageState {
    refreshing = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "refreshing" }] : /* istanbul ignore next */ []));
    refreshError = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "refreshError" }] : /* istanbul ignore next */ []));
    showInitialSkeleton = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "showInitialSkeleton" }] : /* istanbul ignore next */ []));
    state = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    retry = output();
    static ɵfac = function PageState_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PageState)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PageState, selectors: [["app-page-state"]], inputs: { refreshing: [1, "refreshing"], refreshError: [1, "refreshError"], showInitialSkeleton: [1, "showInitialSkeleton"], state: [1, "state"] }, outputs: { retry: "retry" }, ngContentSelectors: _c0, decls: 4, vars: 1, consts: [["role", "status", "aria-live", "polite", 1, "workspace-skeleton"], ["hlmEmpty", ""], ["hlmAlert", "", "variant", "destructive"], [1, "sr-only"], ["hlmSkeleton", "", 1, "h-12", "w-2/3"], ["hlmSkeleton", "", 1, "h-48", "w-full"], ["hlmSkeleton", "", 1, "h-20", "w-full"], ["hlmEmptyHeader", ""], ["hlmEmptyTitle", ""], ["hlmEmptyDescription", ""], ["hlmBtn", "", "variant", "outline", "routerLink", "/me"], ["hlmAlertTitle", ""], ["hlmAlertDescription", ""], ["hlmBtn", "", "variant", "outline", 1, "mt-4", 3, "click"], ["role", "status", 1, "workspace-meta", "mb-3"], ["hlmAlert", "", "role", "alert", 1, "mb-4"], ["hlmBtn", "", "variant", "outline", 3, "click"]], template: function PageState_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵconditionalCreate(0, PageState_Conditional_0_Template, 7, 3, "div", 0)(1, PageState_Conditional_1_Template, 11, 9, "div", 1)(2, PageState_Conditional_2_Template, 10, 9, "div", 2)(3, PageState_Conditional_3_Template, 3, 2);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.state() === "loading" && ctx.showInitialSkeleton() ? 0 : ctx.state() === "forbidden" ? 1 : ctx.state() === "error" ? 2 : 3);
        } }, dependencies: [RouterLink, i1.HlmSkeleton, i2.HlmButton, i3.HlmEmpty, i3.HlmEmptyDescription, i3.HlmEmptyHeader, i3.HlmEmptyTitle, i4.HlmAlert, i4.HlmAlertDescription, i4.HlmAlertTitle, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PageState, [{
        type: Component,
        args: [{
                selector: 'app-page-state',
                imports: [
                    Translate,
                    RouterLink,
                    HlmSkeletonImports,
                    HlmButtonImports,
                    HlmEmptyImports,
                    HlmAlertImports,
                ],
                template: ` @if (state() === 'loading' && showInitialSkeleton()) {
      <div class="workspace-skeleton" role="status" aria-live="polite">
        <span class="sr-only">{{ 'loading' | t }}</span>
        <div hlmSkeleton class="h-12 w-2/3"></div>
        <div hlmSkeleton class="h-48 w-full"></div>
        <div hlmSkeleton class="h-20 w-full"></div>
      </div>
    } @else if (state() === 'forbidden') {
      <div hlmEmpty>
        <div hlmEmptyHeader>
          <h2 hlmEmptyTitle>{{ 'accessRestricted' | t }}</h2>
          <p hlmEmptyDescription>{{ 'accessRestrictedHelp' | t }}</p>
        </div>
        <a hlmBtn variant="outline" routerLink="/me">{{ 'account' | t }}</a>
      </div>
    } @else if (state() === 'error') {
      <div hlmAlert variant="destructive">
        <h2 hlmAlertTitle>{{ 'loadFailed' | t }}</h2>
        <p hlmAlertDescription>{{ 'loadFailedHelp' | t }}</p>
        <button hlmBtn variant="outline" class="mt-4" (click)="retry.emit()">
          {{ 'retry' | t }}
        </button>
      </div>
    } @else {
      @if (refreshing()) {
        <p class="workspace-meta mb-3" role="status">{{ 'refreshing' | t }}</p>
      }
      @if (refreshError()) {
        <div hlmAlert role="alert" class="mb-4">
          <p hlmAlertDescription>{{ 'refreshFailed' | t }}</p>
          <button hlmBtn variant="outline" (click)="retry.emit()">{{ 'retry' | t }}</button>
        </div>
      }
      <ng-content />
    }`,
            }]
    }], null, { refreshing: [{ type: i0.Input, args: [{ isSignal: true, alias: "refreshing", required: false }] }], refreshError: [{ type: i0.Input, args: [{ isSignal: true, alias: "refreshError", required: false }] }], showInitialSkeleton: [{ type: i0.Input, args: [{ isSignal: true, alias: "showInitialSkeleton", required: false }] }], state: [{ type: i0.Input, args: [{ isSignal: true, alias: "state", required: true }] }], retry: [{ type: i0.Output, args: ["retry"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PageState, { className: "PageState", filePath: "src/app/shared/workspace.ts", lineNumber: 269 }); })();
export class ListPager {
    i18n = inject(I18n);
    total = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "total" }] : /* istanbul ignore next */ []));
    page = input(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "page" }] : /* istanbul ignore next */ []));
    size = input(DEFAULT_PAGE_SIZE, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    showSizePicker = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "showSizePicker" }] : /* istanbul ignore next */ []));
    sizeOptions = input(PAGE_SIZE_OPTIONS, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sizeOptions" }] : /* istanbul ignore next */ []));
    busy = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    pageChange = output();
    sizeChange = output();
    sizeLabel = (size) => this.i18n.number(size);
    pages() {
        return Math.max(1, Math.ceil(this.total() / this.size()));
    }
    firstResult() {
        return this.total() === 0 ? 0 : (this.page() - 1) * this.size() + 1;
    }
    lastResult() {
        return Math.min(this.total(), this.page() * this.size());
    }
    visiblePages() {
        const count = Math.min(5, this.pages());
        const start = Math.max(1, Math.min(this.page() - Math.floor(count / 2), this.pages() - count + 1));
        return Array.from({ length: count }, (_, index) => start + index);
    }
    pageLabel(page) {
        return `${this.i18n.text('page')} ${this.i18n.number(page)}`;
    }
    changeSize(value) {
        const size = Number(value);
        if (this.sizeOptions().includes(size) && size !== this.size())
            this.sizeChange.emit(size);
    }
    static ɵfac = function ListPager_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ListPager)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ListPager, selectors: [["app-list-pager"]], inputs: { total: [1, "total"], page: [1, "page"], size: [1, "size"], showSizePicker: [1, "showSizePicker"], sizeOptions: [1, "sizeOptions"], busy: [1, "busy"] }, outputs: { pageChange: "pageChange", sizeChange: "sizeChange" }, decls: 16, vars: 18, consts: [[1, "workspace-pager"], [1, "workspace-pager-summary"], ["for", "rows-per-page", 1, "flex", "items-center", "gap-2"], [1, "workspace-pager-pages"], ["hlmBtn", "", "variant", "ghost", "size", "sm", 3, "click", "disabled"], ["hlmBtn", "", "type", "button", "size", "icon-sm", 3, "variant", "disabled"], [3, "valueChange", "value", "itemToString"], ["buttonId", "rows-per-page", "size", "sm", 1, "w-20"], [3, "ariaLabel", 4, "hlmSelectPortal"], [3, "ariaLabel"], [3, "value"], ["hlmBtn", "", "type", "button", "size", "icon-sm", 3, "click", "variant", "disabled"]], template: function ListPager_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "nav", 0);
            i0.ɵɵpipe(1, "t");
            i0.ɵɵelementStart(2, "div", 1);
            i0.ɵɵconditionalCreate(3, ListPager_Conditional_3_Template, 8, 5, "label", 2);
            i0.ɵɵelementStart(4, "span");
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "div", 3)(8, "button", 4);
            i0.ɵɵlistener("click", function ListPager_Template_button_click_8_listener() { return ctx.pageChange.emit(ctx.page() - 1); });
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(11, ListPager_For_12_Template, 2, 5, "button", 5, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementStart(13, "button", 4);
            i0.ɵɵlistener("click", function ListPager_Template_button_click_13_listener() { return ctx.pageChange.emit(ctx.page() + 1); });
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "t");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 10, "pagination"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.showSizePicker() ? 3 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate4("", ctx.i18n.number(ctx.firstResult()), "\u2013", ctx.i18n.number(ctx.lastResult()), " ", i0.ɵɵpipeBind1(6, 12, "of"), " ", ctx.i18n.number(ctx.total()));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.page() <= 1 || ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 14, "previous"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.visiblePages());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.page() >= ctx.pages() || ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 16, "next"), " ");
        } }, dependencies: [i2.HlmButton, i5.HlmSelect, i5.HlmSelectContent, i5.HlmSelectItem, i5.HlmSelectPortal, i5.HlmSelectTrigger, i5.HlmSelectValue, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ListPager, [{
        type: Component,
        args: [{
                selector: 'app-list-pager',
                imports: [Translate, HlmButtonImports, HlmSelectImports],
                template: ` <nav class="workspace-pager" [attr.aria-label]="'pagination' | t">
    <div class="workspace-pager-summary">
      @if (showSizePicker()) {
        <label class="flex items-center gap-2" for="rows-per-page">
          <span>{{ 'rowsPerPage' | t }}</span>
          <hlm-select
            [value]="size()"
            [itemToString]="sizeLabel"
            (valueChange)="changeSize($event)"
          >
            <hlm-select-trigger buttonId="rows-per-page" size="sm" class="w-20">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal [ariaLabel]="'rowsPerPage' | t">
              @for (option of sizeOptions(); track option) {
                <hlm-select-item [value]="option">{{ i18n.number(option) }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </label>
      }
      <span
        >{{ i18n.number(firstResult()) }}–{{ i18n.number(lastResult()) }} {{ 'of' | t }}
        {{ i18n.number(total()) }}</span
      >
    </div>
    <div class="workspace-pager-pages">
      <button
        hlmBtn
        variant="ghost"
        size="sm"
        [disabled]="page() <= 1 || busy()"
        (click)="pageChange.emit(page() - 1)"
      >
        {{ 'previous' | t }}
      </button>
      @for (value of visiblePages(); track value) {
        <button
          hlmBtn
          type="button"
          [variant]="value === page() ? 'secondary' : 'ghost'"
          size="icon-sm"
          [disabled]="busy()"
          [attr.aria-current]="value === page() ? 'page' : null"
          [attr.aria-label]="pageLabel(value)"
          (click)="pageChange.emit(value)"
        >
          {{ i18n.number(value) }}
        </button>
      }
      <button
        hlmBtn
        variant="ghost"
        size="sm"
        [disabled]="page() >= pages() || busy()"
        (click)="pageChange.emit(page() + 1)"
      >
        {{ 'next' | t }}
      </button>
    </div>
  </nav>`,
            }]
    }], null, { total: [{ type: i0.Input, args: [{ isSignal: true, alias: "total", required: false }] }], page: [{ type: i0.Input, args: [{ isSignal: true, alias: "page", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], showSizePicker: [{ type: i0.Input, args: [{ isSignal: true, alias: "showSizePicker", required: false }] }], sizeOptions: [{ type: i0.Input, args: [{ isSignal: true, alias: "sizeOptions", required: false }] }], busy: [{ type: i0.Input, args: [{ isSignal: true, alias: "busy", required: false }] }], pageChange: [{ type: i0.Output, args: ["pageChange"] }], sizeChange: [{ type: i0.Output, args: ["sizeChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ListPager, { className: "ListPager", filePath: "src/app/shared/workspace.ts", lineNumber: 342 }); })();
export { Confirmation, Confirmations, unsavedGuard, protectUnload } from './confirmation';
export const WorkspaceUi = [
    PageHeader,
    PageState,
    ListPager,
    ViewModeToggle,
    Translate,
    FormsModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmFieldImports,
    HlmInputImports,
    HlmEmptyImports,
    HlmAlertImports,
    HlmCheckboxImports,
    HlmSpinnerImports,
    HlmTabsImports,
    HlmSwitchImports,
];
