import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, DEFAULT_PAGE_SIZE, } from '../../shared/workspace';
import { DataTable } from '../../shared/data-table';
import { Auth } from '../../core/auth';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { UnreadNotifications } from './unread-notifications';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@ng-icons/core";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "../../core/i18n";
import * as i5 from "../../shared/workspace";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/badge";
import * as i8 from "@spartan-ng/helm/tabs";
function NotificationRow_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 5);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "unread"));
} }
const _c0 = () => [];
const column = createColumnHelper();
export class NotificationRow {
    i18n = inject(I18n);
    item = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "item" }] : /* istanbul ignore next */ []));
    busy = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    open = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "open" }] : /* istanbul ignore next */ []));
    toggle = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "toggle" }] : /* istanbul ignore next */ []));
    static ɵfac = function NotificationRow_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationRow)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationRow, selectors: [["app-notification-row"]], inputs: { item: [1, "item"], busy: [1, "busy"], open: [1, "open"], toggle: [1, "toggle"] }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 18, vars: 14, consts: [[1, "flex", "min-w-0", "flex-wrap", "items-center", "gap-3", "sm:flex-nowrap"], ["aria-hidden", "true", 1, "workspace-icon", "size-9", "rounded-md"], [3, "name"], [1, "min-w-0", "flex-1"], [1, "truncate", "font-medium"], [1, "workspace-unread-dot"], [1, "workspace-meta"], [1, "ml-auto", "flex", "w-full", "shrink-0", "justify-end", "gap-1", "sm:w-auto"], ["hlmBtn", "", "variant", "ghost", "size", "sm", 3, "click", "disabled"], ["hlmBtn", "", "variant", "outline", "size", "sm", 3, "click", "disabled"], ["name", "lucideArrowUpRight"]], template: function NotificationRow_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "span", 1);
            i0.ɵɵelement(2, "ng-icon", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "div", 3)(4, "p", 4);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵconditionalCreate(7, NotificationRow_Conditional_7_Template, 2, 3, "span", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p", 6);
            i0.ɵɵtext(9);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "div", 7)(11, "button", 8);
            i0.ɵɵlistener("click", function NotificationRow_Template_button_click_11_listener() { return ctx.toggle()(); });
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "button", 9);
            i0.ɵɵlistener("click", function NotificationRow_Template_button_click_14_listener() { return ctx.open()(); });
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelement(17, "ng-icon", 10);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("name", ctx.item().kind === "notificationSecurity" ? "lucideShieldCheck" : "lucideBell");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 8, ctx.item().kind), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.item().readAt ? 7 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.i18n.date(ctx.item().createdAt));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 10, ctx.item().readAt ? "markUnread" : "markRead"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 12, "viewDetails"));
        } }, dependencies: [i1.FormsModule, i2.NgIcon, i3.HlmButton, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationRow, [{
        type: Component,
        args: [{
                selector: 'app-notification-row',
                imports: [WorkspaceUi],
                providers: [workspaceIcons],
                template: `
    <div class="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap">
      <span class="workspace-icon size-9 rounded-md" aria-hidden="true">
        <ng-icon
          [name]="item().kind === 'notificationSecurity' ? 'lucideShieldCheck' : 'lucideBell'"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium">
          {{ item().kind | t }}
          @if (!item().readAt) {
            <span class="workspace-unread-dot" [attr.aria-label]="'unread' | t"></span>
          }
        </p>
        <p class="workspace-meta">{{ i18n.date(item().createdAt) }}</p>
      </div>
      <div class="ml-auto flex w-full shrink-0 justify-end gap-1 sm:w-auto">
        <button hlmBtn variant="ghost" size="sm" [disabled]="busy()" (click)="toggle()()">
          {{ (item().readAt ? 'markUnread' : 'markRead') | t }}
        </button>
        <button hlmBtn variant="outline" size="sm" [disabled]="busy()" (click)="open()()">
          {{ 'viewDetails' | t }}<ng-icon name="lucideArrowUpRight" />
        </button>
      </div>
    </div>
  `,
            }]
    }], null, { item: [{ type: i0.Input, args: [{ isSignal: true, alias: "item", required: true }] }], busy: [{ type: i0.Input, args: [{ isSignal: true, alias: "busy", required: false }] }], open: [{ type: i0.Input, args: [{ isSignal: true, alias: "open", required: true }] }], toggle: [{ type: i0.Input, args: [{ isSignal: true, alias: "toggle", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationRow, { className: "NotificationRow", filePath: "src/app/features/inbox.ts", lineNumber: 52 }); })();
export class InboxPage {
    auth = inject(Auth);
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    unread = inject(UnreadNotifications);
    router = inject(Router);
    data = new Resource();
    query = new ListQuery();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    columns = computed(() => {
        this.i18n.culture();
        const busy = this.busy();
        return column.columns([
            column.accessor('createdAt', {
                header: this.i18n.text('yourInbox'),
                cell: ({ row }) => flexRenderComponent(NotificationRow, {
                    inputs: {
                        item: row.original,
                        busy,
                        open: () => void this.open(row.original),
                        toggle: () => void this.toggleRead(row.original),
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        this.query.connect(() => void this.load());
        this.unread.changes.pipe(takeUntilDestroyed()).subscribe(() => void this.load());
    }
    async load() {
        const loaded = await this.data.load((signal) => this.api.get('notifications', {
            pageNumber: this.query.page,
            pageSize: DEFAULT_PAGE_SIZE,
            unreadOnly: this.query.text('filter') === 'unread',
            sort: this.query.text('sort', 'createdAt'),
            direction: this.query.direction('desc'),
        }, signal));
        if (loaded)
            this.unread.set(this.data.value().unread);
        if (loaded)
            this.query.clamp(this.data.value()?.page.total);
    }
    filter(value) {
        if (value === 'all' || value === 'unread')
            void this.query.set({ filter: value, page: 1 });
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    loading() {
        return this.data.state() === 'loading' || this.data.refreshing();
    }
    applyRead(id, read = true) {
        this.data.value.update((value) => {
            if (!value)
                return value;
            const changed = id
                ? value.page.items.filter((i) => i.id === id && Boolean(i.readAt) !== read).length
                : read
                    ? value.unread
                    : 0;
            let items = value.page.items.map((item) => !id || item.id === id
                ? { ...item, readAt: read ? (item.readAt ?? new Date().toISOString()) : null }
                : item);
            const filtered = this.query.text('filter') === 'unread';
            if (filtered && read)
                items = items.filter((i) => !i.readAt);
            const unread = Math.max(0, value.unread + (read ? -changed : changed));
            this.unread.set(unread);
            return {
                ...value,
                unread,
                page: {
                    ...value.page,
                    items,
                    total: filtered && read ? Math.max(0, value.page.total - changed) : value.page.total,
                },
            };
        });
    }
    async toggleRead(item) {
        if (this.busy())
            return;
        const read = !item.readAt;
        this.busy.set(true);
        try {
            await this.api.post('notifications/read?id=' + encodeURIComponent(item.id) + '&read=' + read);
            this.applyRead(item.id, read);
            if (read && this.query.text('filter') === 'unread')
                await this.load();
        }
        catch {
            /* central feedback */
        }
        finally {
            this.busy.set(false);
        }
    }
    async readAll() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post('notifications/read');
            this.applyRead(undefined, true);
            this.query.clamp(this.data.value()?.page.total);
        }
        catch {
            /* central feedback */
        }
        finally {
            this.busy.set(false);
        }
    }
    async open(item) {
        if (![
            '/profile',
            '/security',
            '/privacy',
            '/operations',
            '/administration/system-health',
            '/me',
        ].includes(item.link))
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
        await this.router.navigateByUrl(item.link === '/profile'
            ? '/security'
            : item.link === '/operations'
                ? '/administration/system-health'
                : item.link);
    }
    static ɵfac = function InboxPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InboxPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InboxPage, selectors: [["app-inbox"]], features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 33, vars: 44, consts: [["hlmCard", ""], ["hlmCardHeader", ""], [1, "flex", "flex-wrap", "items-start", "justify-between", "gap-3"], ["hlmCardTitle", ""], ["hlmBadge", "", "variant", "secondary"], ["hlmCardDescription", ""], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["name", "lucideCheck"], ["hlmCardContent", ""], [1, "mb-5", 3, "tabActivated", "tab"], ["hlmTabsTrigger", "all"], ["hlmTabsTrigger", "unread"], [3, "retry", "state", "refreshError"], ["fillColumn", "createdAt", 3, "sortChange", "columns", "data", "loading", "loadingText", "emptyText", "ariaLabel", "sortColumn", "sortDirection"], [3, "pageChange", "total", "page", "busy"]], template: function InboxPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div")(4, "h2", 3);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementStart(7, "span", 4);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "p", 5);
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "button", 6);
            i0.ɵɵlistener("click", function InboxPage_Template_button_click_13_listener() { return ctx.readAll(); });
            i0.ɵɵelement(14, "ng-icon", 7);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(17, "div", 8)(18, "hlm-tabs", 9);
            i0.ɵɵlistener("tabActivated", function InboxPage_Template_hlm_tabs_tabActivated_18_listener($event) { return ctx.filter($event); });
            i0.ɵɵelementStart(19, "hlm-tabs-list");
            i0.ɵɵpipe(20, "t");
            i0.ɵɵelementStart(21, "button", 10);
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "button", 11);
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(27, "app-page-state", 12);
            i0.ɵɵlistener("retry", function InboxPage_Template_app_page_state_retry_27_listener() { return ctx.load(); });
            i0.ɵɵelementStart(28, "app-data-table", 13);
            i0.ɵɵpipe(29, "t");
            i0.ɵɵpipe(30, "t");
            i0.ɵɵpipe(31, "t");
            i0.ɵɵlistener("sortChange", function InboxPage_Template_app_data_table_sortChange_28_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "app-list-pager", 14);
            i0.ɵɵlistener("pageChange", function InboxPage_Template_app_list_pager_pageChange_32_listener($event) { return ctx.query.set({ page: $event }); });
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 23, "yourInbox"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate2("", ctx.data.value()?.unread ?? 0, " ", i0.ɵɵpipeBind1(9, 25, "unread"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 27, "yourInboxHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || !ctx.data.value()?.unread);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(16, 29, "markAllRead"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("tab", ctx.query.text("filter", "all"));
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(20, 31, "notificationFilter"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 33, "all"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 35, "unread"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state() === "loading" ? "ready" : ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("data", ctx.data.value()?.page?.items ?? i0.ɵɵpureFunction0(43, _c0))("loading", ctx.loading())("loadingText", i0.ɵɵpipeBind1(29, 37, "loading"))("emptyText", i0.ɵɵpipeBind1(30, 39, "inboxEmpty"))("ariaLabel", i0.ɵɵpipeBind1(31, 41, "yourInbox"))("sortColumn", ctx.query.text("sort", "createdAt"))("sortDirection", ctx.query.direction("desc"));
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("total", ctx.data.value()?.page?.total ?? 0)("page", ctx.query.page)("busy", ctx.loading());
        } }, dependencies: [i5.PageState, i5.ListPager, i1.FormsModule, i2.NgIcon, i3.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmBadge, i8.HlmTabs, i8.HlmTabsList, i8.HlmTabsTrigger, DataTable, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InboxPage, [{
        type: Component,
        args: [{
                selector: 'app-inbox',
                imports: [WorkspaceUi, DataTable],
                providers: [workspaceIcons],
                template: ` <section hlmCard>
    <div hlmCardHeader>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 hlmCardTitle>
            {{ 'yourInbox' | t }}
            <span hlmBadge variant="secondary"
              >{{ data.value()?.unread ?? 0 }} {{ 'unread' | t }}</span
            >
          </h2>
          <p hlmCardDescription>{{ 'yourInboxHelp' | t }}</p>
        </div>
        <button
          hlmBtn
          variant="outline"
          [disabled]="busy() || !data.value()?.unread"
          (click)="readAll()"
        >
          <ng-icon name="lucideCheck" />{{ 'markAllRead' | t }}
        </button>
      </div>
    </div>
    <div hlmCardContent>
      <hlm-tabs [tab]="query.text('filter', 'all')" (tabActivated)="filter($event)" class="mb-5">
        <hlm-tabs-list [attr.aria-label]="'notificationFilter' | t">
          <button hlmTabsTrigger="all">{{ 'all' | t }}</button>
          <button hlmTabsTrigger="unread">{{ 'unread' | t }}</button>
        </hlm-tabs-list>
      </hlm-tabs>
      <app-page-state
        [state]="data.state() === 'loading' ? 'ready' : data.state()"
        [refreshError]="data.refreshError()"
        (retry)="load()"
      >
        <app-data-table
          [columns]="columns()"
          [data]="data.value()?.page?.items ?? []"
          [loading]="loading()"
          [loadingText]="'loading' | t"
          [emptyText]="'inboxEmpty' | t"
          [ariaLabel]="'yourInbox' | t"
          [sortColumn]="query.text('sort', 'createdAt')"
          [sortDirection]="query.direction('desc')"
          (sortChange)="sort($event)"
          fillColumn="createdAt"
        />
        <app-list-pager
          [total]="data.value()?.page?.total ?? 0"
          [page]="query.page"
          [busy]="loading()"
          (pageChange)="query.set({ page: $event })"
        />
      </app-page-state>
    </div>
  </section>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InboxPage, { className: "InboxPage", filePath: "src/app/features/inbox.ts", lineNumber: 120 }); })();
