import { Location } from '@angular/common';
import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { NavigationEnd, NavigationStart, PRIMARY_OUTLET, Router, } from '@angular/router';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { classes } from '@spartan-ng/helm/utils';
import { I18n, Translate } from '../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/breadcrumb";
import * as i2 from "@spartan-ng/helm/button";
function AppBreadcrumbs_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "li", 6);
} }
function AppBreadcrumbs_For_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, item_r1.label));
} }
function AppBreadcrumbs_For_5_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 8);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("link", item_r1.link);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, item_r1.label));
} }
function AppBreadcrumbs_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AppBreadcrumbs_For_5_Conditional_0_Template, 1, 0, "li", 6);
    i0.ɵɵelementStart(1, "li", 4);
    i0.ɵɵconditionalCreate(2, AppBreadcrumbs_For_5_Conditional_2_Template, 3, 3, "span", 7)(3, AppBreadcrumbs_For_5_Conditional_3_Template, 3, 4, "a", 8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ɵ$index_8_r2 = ctx.$index;
    const ɵ$count_8_r3 = ctx.$count;
    i0.ɵɵconditional(!(ɵ$index_8_r2 === 0) ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ɵ$index_8_r2 === ɵ$count_8_r3 - 1 ? 2 : 3);
} }
function AppBreadcrumbs_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 4)(1, "a", 8);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(4, "li", 6);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("link", ctx_r3.breadcrumbs.items()[0].link);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, ctx_r3.breadcrumbs.items()[0].label), " ");
} }
function AppBreadcrumbs_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 4);
    i0.ɵɵelement(1, "hlm-breadcrumb-ellipsis", 9);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "li", 6);
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("srOnlyText", i0.ɵɵpipeBind1(2, 1, "moreBreadcrumbs"));
} }
function AppBreadcrumbs_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 4)(1, "span", 7);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, ctx.label));
} }
function AppBreadcrumbs_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 10);
    i0.ɵɵlistener("click", function AppBreadcrumbs_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.breadcrumbs.back()); });
    i0.ɵɵelement(1, "ng-icon", 11);
    i0.ɵɵelementStart(2, "span", 12);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", ctx_r3.backLabel());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(4, 3, "backTo"), " ", i0.ɵɵpipeBind1(5, 5, ctx.label));
} }
export class Breadcrumbs {
    router = inject(Router);
    location = inject(Location);
    customItems = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "customItems" }] : /* istanbul ignore next */ []));
    navigationVersion = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "navigationVersion" }] : /* istanbul ignore next */ []));
    history = [];
    historyIndex = -1;
    pendingNavigation = null;
    items = computed(() => {
        this.navigationVersion();
        return this.customItems() ?? this.routeItems(this.router.routerState.snapshot.root);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "items" }] : /* istanbul ignore next */ []));
    previous = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "previous" }] : /* istanbul ignore next */ []));
    constructor() {
        this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.customItems.set(null);
                this.pendingNavigation = event;
            }
            if (event instanceof NavigationEnd) {
                this.navigationVersion.update((value) => value + 1);
                this.recordNavigation(event);
            }
        });
    }
    /** Replaces the route-derived trail until the next navigation starts. */
    set(items) {
        this.customItems.set([...items]);
        this.updateCurrentHistoryPage();
    }
    /** Restores the active route's configured or automatically derived trail. */
    clear() {
        this.customItems.set(null);
        this.updateCurrentHistoryPage();
    }
    back() {
        this.location.back();
    }
    routeItems(root) {
        const items = [];
        const url = [];
        let route = root;
        while ((route = route.children.find((child) => child.outlet === PRIMARY_OUTLET))) {
            const segments = route.url.map((segment) => segment.path);
            url.push(...segments);
            const configured = route.data['breadcrumb'];
            if (configured === false)
                continue;
            const label = typeof configured === 'function'
                ? configured(route)
                : (configured ?? this.humanize(segments.at(-1)));
            if (label)
                items.push({ label, link: `/${url.join('/')}` });
        }
        return items;
    }
    humanize(segment) {
        if (!segment)
            return null;
        return decodeURIComponent(segment)
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, (character) => character.toUpperCase());
    }
    recordNavigation(event) {
        const page = this.items().at(-1);
        if (!page)
            return;
        const restoredId = this.pendingNavigation?.restoredState?.navigationId;
        const restoredIndex = this.pendingNavigation?.navigationTrigger === 'popstate' && restoredId !== undefined
            ? this.history.findIndex((entry) => entry.navigationId === restoredId)
            : -1;
        if (restoredIndex >= 0) {
            this.historyIndex = restoredIndex;
            this.history[this.historyIndex].page = { ...page, link: event.urlAfterRedirects };
        }
        else {
            this.history.splice(this.historyIndex + 1);
            this.history.push({
                navigationId: event.id,
                page: { ...page, link: event.urlAfterRedirects },
            });
            this.historyIndex = this.history.length - 1;
        }
        const previous = this.history[this.historyIndex - 1]?.page;
        this.previous.set(previous
            ? {
                ...previous,
                label: previous.link?.split(/[?#]/)[0] === event.urlAfterRedirects.split(/[?#]/)[0]
                    ? 'previousView'
                    : previous.label,
            }
            : null);
        this.pendingNavigation = null;
    }
    updateCurrentHistoryPage() {
        const page = this.items().at(-1);
        const current = this.history[this.historyIndex];
        if (page && current)
            current.page = { ...page, link: this.router.url };
    }
    static ɵfac = function Breadcrumbs_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Breadcrumbs)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Breadcrumbs, factory: Breadcrumbs.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Breadcrumbs, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
export class AppBreadcrumbs {
    breadcrumbs = inject(Breadcrumbs);
    i18n = inject(I18n);
    backLabel = computed(() => {
        const previous = this.breadcrumbs.previous();
        return previous
            ? `${this.i18n.text('backTo')} ${this.i18n.text(previous.label)}`
            : this.i18n.text('back');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "backLabel" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'min-w-0 flex-1');
    }
    static ɵfac = function AppBreadcrumbs_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppBreadcrumbs)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppBreadcrumbs, selectors: [["app-breadcrumbs"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideArrowLeft })])], decls: 11, vars: 7, consts: [[1, "flex", "min-w-0", "items-center", "justify-start", "gap-4"], ["hlmBreadcrumb", "", 1, "min-w-0"], ["hlmBreadcrumbList", "", 1, "hidden", "sm:flex"], ["hlmBreadcrumbList", "", 1, "flex", "sm:hidden"], ["hlmBreadcrumbItem", ""], ["hlmBtn", "", "variant", "link", "size", "sm", "type", "button", 1, "min-w-0", "shrink-0"], ["hlmBreadcrumbSeparator", ""], ["hlmBreadcrumbPage", ""], ["hlmBreadcrumbLink", "", 3, "link"], [3, "srOnlyText"], ["hlmBtn", "", "variant", "link", "size", "sm", "type", "button", 1, "min-w-0", "shrink-0", 3, "click"], ["name", "lucideArrowLeft", "size", "1rem"], [1, "max-w-48", "truncate"]], template: function AppBreadcrumbs_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "nav", 1);
            i0.ɵɵpipe(2, "t");
            i0.ɵɵelementStart(3, "ol", 2);
            i0.ɵɵrepeaterCreate(4, AppBreadcrumbs_For_5_Template, 4, 2, null, null, i0.ɵɵrepeaterTrackByIndex);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "ol", 3);
            i0.ɵɵconditionalCreate(7, AppBreadcrumbs_Conditional_7_Template, 5, 4);
            i0.ɵɵconditionalCreate(8, AppBreadcrumbs_Conditional_8_Template, 4, 3);
            i0.ɵɵconditionalCreate(9, AppBreadcrumbs_Conditional_9_Template, 4, 3, "li", 4);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(10, AppBreadcrumbs_Conditional_10_Template, 6, 7, "button", 5);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_4_0;
            let tmp_5_0;
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 5, "breadcrumb"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.breadcrumbs.items());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.breadcrumbs.items().length > 1 ? 7 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.breadcrumbs.items().length > 2 ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.breadcrumbs.items().at(-1)) ? 9 : -1, tmp_4_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_5_0 = ctx.breadcrumbs.previous()) ? 10 : -1, tmp_5_0);
        } }, dependencies: [i1.HlmBreadcrumb, i1.HlmBreadcrumbEllipsis, i1.HlmBreadcrumbSeparator, i1.HlmBreadcrumbItem, i1.HlmBreadcrumbLink, i1.HlmBreadcrumbPage, i1.HlmBreadcrumbList, i2.HlmButton, NgIcon, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppBreadcrumbs, [{
        type: Component,
        args: [{
                selector: 'app-breadcrumbs',
                imports: [HlmBreadcrumbImports, HlmButtonImports, NgIcon, Translate],
                providers: [provideIcons({ lucideArrowLeft })],
                template: `
    <div class="flex min-w-0 items-center justify-start gap-4">
      <nav hlmBreadcrumb [attr.aria-label]="'breadcrumb' | t" class="min-w-0">
        <ol hlmBreadcrumbList class="hidden sm:flex">
          @for (item of breadcrumbs.items(); track $index; let last = $last) {
            @if (!$first) {
              <li hlmBreadcrumbSeparator></li>
            }
            <li hlmBreadcrumbItem>
              @if (last) {
                <span hlmBreadcrumbPage>{{ item.label | t }}</span>
              } @else {
                <a hlmBreadcrumbLink [link]="item.link">{{ item.label | t }}</a>
              }
            </li>
          }
        </ol>

        <ol hlmBreadcrumbList class="flex sm:hidden">
          @if (breadcrumbs.items().length > 1) {
            <li hlmBreadcrumbItem>
              <a hlmBreadcrumbLink [link]="breadcrumbs.items()[0].link">
                {{ breadcrumbs.items()[0].label | t }}
              </a>
            </li>
            <li hlmBreadcrumbSeparator></li>
          }
          @if (breadcrumbs.items().length > 2) {
            <li hlmBreadcrumbItem>
              <hlm-breadcrumb-ellipsis [srOnlyText]="'moreBreadcrumbs' | t" />
            </li>
            <li hlmBreadcrumbSeparator></li>
          }
          @if (breadcrumbs.items().at(-1); as current) {
            <li hlmBreadcrumbItem>
              <span hlmBreadcrumbPage>{{ current.label | t }}</span>
            </li>
          }
        </ol>
      </nav>

      @if (breadcrumbs.previous(); as previous) {
        <button
          hlmBtn
          variant="link"
          size="sm"
          type="button"
          class="min-w-0 shrink-0"
          [attr.aria-label]="backLabel()"
          (click)="breadcrumbs.back()"
        >
          <ng-icon name="lucideArrowLeft" size="1rem" />
          <span class="max-w-48 truncate">{{ 'backTo' | t }} {{ previous.label | t }}</span>
        </button>
      }
    </div>
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AppBreadcrumbs, { className: "AppBreadcrumbs", filePath: "src/app/shared/breadcrumbs.ts", lineNumber: 214 }); })();
