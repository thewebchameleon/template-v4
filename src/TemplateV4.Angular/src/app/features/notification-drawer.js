import { Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HlmDrawer, HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import { UnreadNotifications } from '../core/unread-notifications';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi, workspaceIcons } from '../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@ng-icons/core";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/badge";
import * as i7 from "@spartan-ng/helm/empty";
import * as i8 from "@spartan-ng/helm/drawer";
import * as i9 from "../core/i18n";
const _c0 = () => [];
const _forTrack0 = ($index, $item) => $item.id;
function NotificationDrawer_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.unread.count() > 99 ? "99+" : ctx_r0.unread.count(), " ");
} }
function NotificationDrawer_hlm_drawer_content_8_For_16_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 14)(1, "div", 19)(2, "a", 20);
    i0.ɵɵlistener("click", function NotificationDrawer_hlm_drawer_content_8_For_16_Template_a_click_2_listener() { const item_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.open(item_r4)); });
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(6, "ng-icon", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 22);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 23)(11, "p", 24);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 25);
    i0.ɵɵlistener("click", function NotificationDrawer_hlm_drawer_content_8_For_16_Template_button_click_13_listener($event) { const item_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.read(item_r4, $event)); });
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", ctx_r0.detailsRoute(item_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, item_r4.kind));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 8, item_r4.kind + "Help"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.i18n.date(item_r4.createdAt));
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 10, "markRead"), " ");
} }
function NotificationDrawer_hlm_drawer_content_8_ForEmpty_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "div", 26)(2, "div", 27);
    i0.ɵɵelement(3, "ng-icon", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "h3", 29);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 30);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 2, "inboxEmpty"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 4, "inboxEmptyHelp"));
} }
function NotificationDrawer_hlm_drawer_content_8_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-drawer-content", 6)(1, "hlm-drawer-header")(2, "div", 7)(3, "h2", 8);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 9);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "p", 10);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 11)(13, "app-page-state", 12);
    i0.ɵɵlistener("retry", function NotificationDrawer_hlm_drawer_content_8_Template_app_page_state_retry_13_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.load()); });
    i0.ɵɵelementStart(14, "ul", 13);
    i0.ɵɵrepeaterCreate(15, NotificationDrawer_hlm_drawer_content_8_For_16_Template, 16, 12, "li", 14, _forTrack0, false, NotificationDrawer_hlm_drawer_content_8_ForEmpty_17_Template, 10, 6, "div", 15);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(18, "hlm-drawer-footer")(19, "button", 16);
    i0.ɵɵlistener("click", function NotificationDrawer_hlm_drawer_content_8_Template_button_click_19_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.readAll()); });
    i0.ɵɵelement(20, "ng-icon", 17);
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "button", 18);
    i0.ɵɵlistener("click", function NotificationDrawer_hlm_drawer_content_8_Template_button_click_23_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.viewAll()); });
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 11, "notificationCentre"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", ctx_r0.data.value()?.unread ?? ctx_r0.unread.count(), " ", i0.ɵɵpipeBind1(8, 13, "unread"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 15, "yourInboxHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("state", ctx_r0.data.state())("refreshing", ctx_r0.data.refreshing())("refreshError", ctx_r0.data.refreshError());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.data.value()?.page?.items ?? i0.ɵɵpureFunction0(21, _c0));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r0.busy() || !ctx_r0.data.value()?.unread);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(22, 17, "markAllRead"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(25, 19, "viewAllNotifications"), " ");
} }
export class NotificationDrawer {
    api = inject(WorkspaceApi);
    auth = inject(Auth);
    i18n = inject(I18n);
    unread = inject(UnreadNotifications);
    router = inject(Router);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    drawer = viewChild.required(HlmDrawer, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "drawer" }] : /* istanbul ignore next */ []));
    loaded = false;
    constructor() {
        this.unread.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            if (this.loaded && !this.busy())
                void this.load();
        });
    }
    async load() {
        this.loaded = true;
        const loaded = await this.data.load((signal) => this.api.get('notifications', { pageNumber: 1, unreadOnly: true }, signal));
        if (loaded)
            this.unread.set(this.data.value().unread);
    }
    applyRead(id) {
        this.data.value.update((value) => {
            if (!value)
                return value;
            const changed = id
                ? value.page.items.filter((item) => item.id === id && !item.readAt).length
                : value.unread;
            const unread = Math.max(0, value.unread - changed);
            this.unread.set(unread);
            return {
                ...value,
                unread,
                page: {
                    ...value.page,
                    total: id ? Math.max(0, value.page.total - changed) : 0,
                    items: id ? value.page.items.filter((item) => item.id !== id) : [],
                },
            };
        });
    }
    async read(item, event) {
        if (this.busy() || item.readAt)
            return;
        const element = event.currentTarget.closest('li');
        this.busy.set(true);
        try {
            await this.api.post('notifications/read?id=' + encodeURIComponent(item.id));
            await this.animateDismiss(element);
            this.applyRead(item.id);
        }
        catch {
            /* Request errors are already reported centrally. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async animateDismiss(element) {
        if (!element ||
            document.documentElement.dataset['motion'] === 'reduced' ||
            matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        const height = element.getBoundingClientRect().height;
        const exitFinished = this.waitForTransition(element, 'transform');
        element.classList.add('notification-dismiss');
        await exitFinished;
        element.style.height = `${height}px`;
        element.style.overflow = 'hidden';
        element.style.boxSizing = 'border-box';
        void element.offsetHeight;
        const collapseFinished = this.waitForTransition(element, 'height');
        element.classList.add('notification-collapse');
        await collapseFinished;
    }
    waitForTransition(element, propertyName) {
        return new Promise((resolve) => {
            const finish = () => {
                window.clearTimeout(timeout);
                element.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            };
            const onTransitionEnd = (event) => {
                if (event.target === element && event.propertyName === propertyName)
                    finish();
            };
            const timeout = window.setTimeout(finish, 280);
            element.addEventListener('transitionend', onTransitionEnd);
        });
    }
    async readAll() {
        if (this.busy() || !this.data.value()?.unread)
            return;
        this.busy.set(true);
        try {
            await this.api.post('notifications/read');
            this.applyRead();
        }
        catch {
            /* Request errors are already reported centrally. */
        }
        finally {
            this.busy.set(false);
        }
    }
    detailsRoute(item) {
        if (![
            '/profile',
            '/security',
            '/privacy',
            '/operations',
            '/administration/system-health',
            '/me',
        ].includes(item.link))
            return null;
        return item.link === '/profile'
            ? '/security'
            : item.link === '/operations'
                ? '/administration/system-health'
                : item.link;
    }
    open(item) {
        if (!this.detailsRoute(item))
            return;
        const actor = this.auth.access()?.userId;
        if (!item.readAt) {
            void this.api
                .post('notifications/read?id=' + encodeURIComponent(item.id))
                .then(() => {
                if (actor === this.auth.access()?.userId)
                    this.applyRead(item.id);
            })
                .catch(() => {
                /* Request errors are already reported centrally. */
            });
        }
        this.drawer().close();
    }
    async viewAll() {
        this.drawer().close();
        await this.router.navigateByUrl('/notifications');
    }
    static ɵfac = function NotificationDrawer_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationDrawer)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationDrawer, selectors: [["app-notification-drawer"]], viewQuery: function NotificationDrawer_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.drawer, HlmDrawer, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 9, vars: 9, consts: [["drawer", "hlmDrawer"], ["direction", "right"], ["hlmBtn", "", "hlmDrawerTrigger", "", "size", "icon", "variant", "ghost", "position", "bottom", 1, "relative", 3, "click", "hlmTooltip"], ["name", "lucideBell"], ["hlmBadge", "", "variant", "notification", 1, "absolute", "-right-2", "-top-2"], ["class", "overflow-hidden sm:max-w-md", 4, "hlmDrawerPortal"], [1, "overflow-hidden", "sm:max-w-md"], [1, "flex", "items-center", "gap-2"], ["hlmDrawerTitle", ""], ["hlmBadge", "", "variant", "secondary"], ["hlmDrawerDescription", ""], ["hlmDrawerBody", "", 1, "notification-drawer-scroll", "min-h-0", "flex-1", "overflow-x-hidden", "overflow-y-auto", "group-data-[vaul-drawer-direction=right]/drawer-content:px-(--card-spacing)", "group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-inset)"], [3, "retry", "state", "refreshing", "refreshError"], ["aria-live", "polite", 1, "-mx-(--card-spacing)"], ["data-notification-item", "", 1, "workspace-notice", "px-(--panel-header-padding-inline)"], ["hlmEmpty", ""], ["hlmBtn", "", 3, "click", "disabled"], ["name", "lucideCheck"], ["hlmBtn", "", "variant", "outline", 3, "click"], [1, "min-w-0", "flex-1"], [1, "inline-flex", "items-center", "gap-1", "font-medium", "underline-offset-4", "hover:underline", "focus-visible:underline", 3, "click", "routerLink"], ["name", "lucideArrowUpRight"], [1, "workspace-meta", "mt-1"], [1, "mt-2", "flex", "items-start", "gap-3"], [1, "workspace-meta"], ["hlmBtn", "", "type", "button", "variant", "link", "size", "text", 1, "shrink-0", 3, "click", "disabled"], ["hlmEmptyHeader", ""], ["hlmEmptyMedia", "", "variant", "icon"], ["name", "lucideInbox"], ["hlmEmptyTitle", ""], ["hlmEmptyDescription", ""]], template: function NotificationDrawer_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "hlm-drawer", 1, 0)(2, "button", 2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵpipe(4, "t");
            i0.ɵɵpipe(5, "t");
            i0.ɵɵlistener("click", function NotificationDrawer_Template_button_click_2_listener() { return ctx.load(); });
            i0.ɵɵelement(6, "ng-icon", 3);
            i0.ɵɵconditionalCreate(7, NotificationDrawer_Conditional_7_Template, 2, 1, "span", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(8, NotificationDrawer_hlm_drawer_content_8_Template, 26, 22, "hlm-drawer-content", 5);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("hlmTooltip", i0.ɵɵpipeBind1(3, 3, "notificationCentre"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 5, "notificationCentre") + ": " + ctx.unread.count() + " " + i0.ɵɵpipeBind1(5, 7, "unread"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.unread.count() ? 7 : -1);
        } }, dependencies: [i1.PageState, i2.FormsModule, i3.RouterLink, i4.NgIcon, i5.HlmButton, i6.HlmBadge, i7.HlmEmpty, i7.HlmEmptyDescription, i7.HlmEmptyHeader, i7.HlmEmptyTitle, i7.HlmEmptyMedia, i8.HlmDrawer, i8.HlmDrawerBody, i8.HlmDrawerContent, i8.HlmDrawerDescription, i8.HlmDrawerFooter, i8.HlmDrawerHeader, i8.HlmDrawerPortal, i8.HlmDrawerTitle, i8.HlmDrawerTrigger, HlmTooltip, i9.Translate], styles: [".notification-drawer-scroll[_ngcontent-%COMP%] {\n      scrollbar-color: color-mix(in srgb, var(--%NS%muted-foreground) 45%, transparent) transparent;\n      scrollbar-width: thin;\n    }\n\n    .notification-drawer-scroll[_ngcontent-%COMP%]::-webkit-scrollbar {\n      width: 0.375rem;\n    }\n\n    .notification-drawer-scroll[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n      background: transparent;\n    }\n\n    .notification-drawer-scroll[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n      background: color-mix(in srgb, var(--%NS%muted-foreground) 45%, transparent);\n      border-radius: 9999px;\n    }\n\n    .notification-drawer-scroll[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n      background: color-mix(in srgb, var(--%NS%muted-foreground) 65%, transparent);\n    }\n\n    [data-notification-item][_ngcontent-%COMP%] {\n      transition:\n        opacity 180ms cubic-bezier(0.4, 0, 1, 1),\n        transform 180ms cubic-bezier(0.4, 0, 1, 1);\n    }\n\n    [data-notification-item].notification-dismiss[_ngcontent-%COMP%] {\n      opacity: 0;\n      transform: translateX(100%);\n    }\n\n    [data-notification-item].notification-collapse[_ngcontent-%COMP%] {\n      height: 0 !important;\n      padding-block: 0 !important;\n      border-bottom-width: 0 !important;\n      transition:\n        height 180ms cubic-bezier(0, 0, 0.2, 1),\n        padding-block 180ms cubic-bezier(0, 0, 0.2, 1),\n        border-bottom-width 180ms cubic-bezier(0, 0, 0.2, 1);\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationDrawer, [{
        type: Component,
        args: [{ selector: 'app-notification-drawer', imports: [WorkspaceUi, HlmDrawerImports, HlmTooltip], providers: [workspaceIcons], template: `
    <hlm-drawer #drawer="hlmDrawer" direction="right">
      <button
        hlmBtn
        hlmDrawerTrigger
        size="icon"
        variant="ghost"
        class="relative"
        [attr.aria-label]="
          ('notificationCentre' | t) + ': ' + unread.count() + ' ' + ('unread' | t)
        "
        [hlmTooltip]="'notificationCentre' | t"
        position="bottom"
        (click)="load()"
      >
        <ng-icon name="lucideBell" />
        @if (unread.count()) {
          <span hlmBadge variant="notification" class="absolute -right-2 -top-2">
            {{ unread.count() > 99 ? '99+' : unread.count() }}
          </span>
        }
      </button>
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
        <hlm-drawer-header>
          <div class="flex items-center gap-2">
            <h2 hlmDrawerTitle>{{ 'notificationCentre' | t }}</h2>
            <span hlmBadge variant="secondary">
              {{ data.value()?.unread ?? unread.count() }} {{ 'unread' | t }}
            </span>
          </div>
          <p hlmDrawerDescription>{{ 'yourInboxHelp' | t }}</p>
        </hlm-drawer-header>

        <div
          hlmDrawerBody
          class="notification-drawer-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto group-data-[vaul-drawer-direction=right]/drawer-content:px-(--card-spacing) group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-inset)"
        >
          <app-page-state
            [state]="data.state()"
            [refreshing]="data.refreshing()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
          >
            <ul aria-live="polite" class="-mx-(--card-spacing)">
              @for (item of data.value()?.page?.items ?? []; track item.id) {
                <li
                  class="workspace-notice px-(--panel-header-padding-inline)"
                  data-notification-item
                >
                  <div class="min-w-0 flex-1">
                    <a
                      class="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline focus-visible:underline"
                      [routerLink]="detailsRoute(item)"
                      (click)="open(item)"
                    >
                      <span>{{ item.kind | t }}</span>
                      <ng-icon name="lucideArrowUpRight" />
                    </a>
                    <p class="workspace-meta mt-1">{{ item.kind + 'Help' | t }}</p>
                    <div class="mt-2 flex items-start gap-3">
                      <p class="workspace-meta">{{ i18n.date(item.createdAt) }}</p>
                      <button
                        hlmBtn
                        type="button"
                        variant="link"
                        size="text"
                        class="shrink-0"
                        [disabled]="busy()"
                        (click)="read(item, $event)"
                      >
                        {{ 'markRead' | t }}
                      </button>
                    </div>
                  </div>
                </li>
              } @empty {
                <div hlmEmpty>
                  <div hlmEmptyHeader>
                    <div hlmEmptyMedia variant="icon"><ng-icon name="lucideInbox" /></div>
                    <h3 hlmEmptyTitle>{{ 'inboxEmpty' | t }}</h3>
                    <p hlmEmptyDescription>{{ 'inboxEmptyHelp' | t }}</p>
                  </div>
                </div>
              }
            </ul>
          </app-page-state>
        </div>

        <hlm-drawer-footer>
          <button hlmBtn [disabled]="busy() || !data.value()?.unread" (click)="readAll()">
            <ng-icon name="lucideCheck" />{{ 'markAllRead' | t }}
          </button>
          <button hlmBtn variant="outline" (click)="viewAll()">
            {{ 'viewAllNotifications' | t }}
          </button>
        </hlm-drawer-footer>
      </hlm-drawer-content>
    </hlm-drawer>
  `, styles: ["\n    .notification-drawer-scroll {\n      scrollbar-color: color-mix(in srgb, var(--muted-foreground) 45%, transparent) transparent;\n      scrollbar-width: thin;\n    }\n\n    .notification-drawer-scroll::-webkit-scrollbar {\n      width: 0.375rem;\n    }\n\n    .notification-drawer-scroll::-webkit-scrollbar-track {\n      background: transparent;\n    }\n\n    .notification-drawer-scroll::-webkit-scrollbar-thumb {\n      background: color-mix(in srgb, var(--muted-foreground) 45%, transparent);\n      border-radius: 9999px;\n    }\n\n    .notification-drawer-scroll::-webkit-scrollbar-thumb:hover {\n      background: color-mix(in srgb, var(--muted-foreground) 65%, transparent);\n    }\n\n    [data-notification-item] {\n      transition:\n        opacity 180ms cubic-bezier(0.4, 0, 1, 1),\n        transform 180ms cubic-bezier(0.4, 0, 1, 1);\n    }\n\n    [data-notification-item].notification-dismiss {\n      opacity: 0;\n      transform: translateX(100%);\n    }\n\n    [data-notification-item].notification-collapse {\n      height: 0 !important;\n      padding-block: 0 !important;\n      border-bottom-width: 0 !important;\n      transition:\n        height 180ms cubic-bezier(0, 0, 0.2, 1),\n        padding-block 180ms cubic-bezier(0, 0, 0.2, 1),\n        border-bottom-width 180ms cubic-bezier(0, 0, 0.2, 1);\n    }\n  "] }]
    }], () => [], { drawer: [{ type: i0.ViewChild, args: [i0.forwardRef(() => HlmDrawer), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationDrawer, { className: "NotificationDrawer", filePath: "src/app/features/notification-drawer.ts", lineNumber: 161 }); })();
