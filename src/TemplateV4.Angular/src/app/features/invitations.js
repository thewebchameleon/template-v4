import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, DebouncedSearch, Confirmations, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, } from '../shared/workspace';
import { DataTable } from '../shared/data-table';
import { RecordIdentity, RecordStatus, RowActions } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { InvitationDrawer } from './invite-user';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/card";
import * as i5 from "@spartan-ng/helm/badge";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/tabs";
import * as i9 from "../core/i18n";
const _c0 = () => [];
function InvitationsPanel_For_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementStart(3, "span", 18);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const state_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("hlmTabsTrigger", state_r1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, state_r1), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.number(ctx_r1.stateCount(state_r1)));
} }
function InvitationsPanel_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵlistener("click", function InvitationsPanel_Conditional_24_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.search.update("")); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "clear"), " ");
} }
const column = createColumnHelper();
export class InvitationsPanel {
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    data = new Resource();
    query = new ListQuery('invitation');
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    now = signal(Date.now(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "now" }] : /* istanbul ignore next */ []));
    search = new DebouncedSearch(this.query);
    invitationDrawer = viewChild(InvitationDrawer, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "invitationDrawer" }] : /* istanbul ignore next */ []));
    states = ['all', 'Pending', 'Expired', 'Accepted', 'Revoked'];
    steps = ['onboardingInvited', 'onboardingVerified', 'onboardingReady'];
    stateCount(state) {
        const value = this.data.value();
        if (!value)
            return 0;
        const pending = value.pending ?? 0;
        const expired = value.expired ?? 0;
        const accepted = value.accepted ?? 0;
        const revoked = value.revoked ?? 0;
        if (state === 'Pending')
            return pending;
        if (state === 'Expired')
            return expired;
        if (state === 'Accepted')
            return accepted;
        if (state === 'Revoked')
            return revoked;
        return pending + expired + accepted + revoked;
    }
    columns = computed(() => {
        this.i18n.culture();
        const busy = this.busy();
        const now = this.now();
        return column.columns([
            column.accessor('displayName', {
                header: this.i18n.text('person'),
                cell: ({ row }) => flexRenderComponent(RecordIdentity, {
                    inputs: {
                        label: row.original.displayName,
                        description: row.original.email,
                        link: '/administration/users/' + row.original.id,
                    },
                }),
            }),
            column.accessor('state', {
                header: this.i18n.text('status'),
                cell: ({ row }) => flexRenderComponent(RecordStatus, {
                    inputs: { value: row.original.state, danger: row.original.state === 'Expired' },
                }),
            }),
            column.accessor('expiresAt', {
                header: this.i18n.text('expiresAt'),
                cell: (c) => (c.getValue() ? this.i18n.date(c.getValue()) : '—'),
            }),
            column.accessor('sentAt', {
                header: this.i18n.text('lastSent'),
                cell: (c) => (c.getValue() ? this.i18n.date(c.getValue()) : this.i18n.text('notRecorded')),
            }),
            column.display({
                id: 'actions',
                enableSorting: false,
                header: this.i18n.text('actions'),
                cell: ({ row }) => flexRenderComponent(RowActions, {
                    inputs: {
                        actions: ['Pending', 'Expired'].includes(row.original.state)
                            ? [
                                {
                                    label: row.original.resendAt && Date.parse(row.original.resendAt) > now
                                        ? 'resendCooldown'
                                        : 'resendInvitation',
                                    disabled: busy ||
                                        (!!row.original.resendAt && Date.parse(row.original.resendAt) > now),
                                    run: () => void this.act(row.original, false),
                                },
                                {
                                    label: 'revoke',
                                    disabled: busy,
                                    destructive: true,
                                    run: () => void this.act(row.original, true),
                                },
                            ]
                            : [],
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        this.query.connect(() => {
            this.search.sync(this.query.text('search'));
            void this.load();
        }, ['search', 'page', 'size', 'state', 'sort', 'direction']);
        effect((onCleanup) => {
            const dates = (this.data.value()?.items ?? [])
                .map((i) => Date.parse(i.resendAt ?? ''))
                .filter((t) => t > this.now());
            if (!dates.length)
                return;
            const timer = setTimeout(() => this.now.set(Date.now()), Math.max(0, Math.min(...dates) - Date.now() + 50));
            onCleanup(() => clearTimeout(timer));
        });
    }
    async load() {
        const loaded = await this.data.load((signal) => this.api.get('invitations', {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            search: this.query.text('search'),
            state: this.query.text('state', 'all'),
            sort: this.query.text('sort', 'sentAt'),
            direction: this.query.direction('desc'),
        }, signal));
        if (loaded)
            this.query.clamp(this.data.value()?.total, this.pageSize());
    }
    filter(value) {
        if (typeof value === 'string' && this.states.includes(value))
            void this.query.set({ state: value, page: 1 });
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    pageSize() {
        const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
        return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
    }
    setPageSize(size) {
        void this.query.set({ size, page: 1 });
    }
    hasUnsavedChanges() {
        return this.invitationDrawer()?.hasUnsavedChanges() ?? false;
    }
    async act(item, cancel) {
        if (this.busy() ||
            (cancel &&
                !(await this.confirm.ask('revokeInvitationTitle', 'revokeInvitationHelp', item.email, true))))
            return;
        this.busy.set(true);
        try {
            await this.api.post('invitations', { userId: item.id, cancel });
            this.toast.success(cancel ? 'invitationCancelled' : 'invitationSent');
            await this.load();
        }
        catch {
            /* Central notification preserves server feedback. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function InvitationsPanel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InvitationsPanel)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InvitationsPanel, selectors: [["app-invitations-panel"]], viewQuery: function InvitationsPanel_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.invitationDrawer, InvitationDrawer, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 30, vars: 38, consts: [["hlmCard", "", 1, "workspace-directory-panel", "min-w-0"], ["hlmCardHeader", "", 1, "flex", "flex-col", "gap-4", "sm:flex-row", "sm:items-start", "sm:justify-between"], ["hlmCardTitle", ""], ["hlmCardDescription", ""], [3, "invited"], ["hlmCardContent", ""], [1, "workspace-directory-controls"], [1, "workspace-directory-tabs", 3, "tabActivated", "tab"], [1, "flex-wrap"], [3, "hlmTabsTrigger"], [1, "workspace-directory-toolbar"], ["hlmField", "", 1, "min-w-0", "flex-1", "sm:max-w-sm"], ["hlmFieldLabel", "", "for", "invitation-search", 1, "sr-only"], ["hlmInput", "", "id", "invitation-search", "maxlength", "120", 3, "ngModelChange", "ngModel", "placeholder"], ["hlmBtn", "", "type", "button", "variant", "ghost"], [3, "retry", "state", "refreshError", "showInitialSkeleton"], [3, "sortChange", "columns", "data", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "total", "page", "size", "showSizePicker", "busy"], ["hlmBadge", "", "variant", "secondary"], ["hlmBtn", "", "type", "button", "variant", "ghost", 3, "click"]], template: function InvitationsPanel_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div")(3, "h2", 2);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 3);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "app-invitation-drawer", 4);
            i0.ɵɵlistener("invited", function InvitationsPanel_Template_app_invitation_drawer_invited_9_listener() { return ctx.load(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "div", 5)(11, "div", 6)(12, "hlm-tabs", 7);
            i0.ɵɵlistener("tabActivated", function InvitationsPanel_Template_hlm_tabs_tabActivated_12_listener($event) { return ctx.filter($event); });
            i0.ɵɵelementStart(13, "hlm-tabs-list", 8);
            i0.ɵɵpipe(14, "t");
            i0.ɵɵrepeaterCreate(15, InvitationsPanel_For_16_Template, 5, 5, "button", 9, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div", 10)(18, "div", 11)(19, "label", 12);
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "input", 13);
            i0.ɵɵpipe(23, "t");
            i0.ɵɵlistener("ngModelChange", function InvitationsPanel_Template_input_ngModelChange_22_listener($event) { return ctx.search.update($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(24, InvitationsPanel_Conditional_24_Template, 3, 3, "button", 14);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "app-page-state", 15);
            i0.ɵɵlistener("retry", function InvitationsPanel_Template_app_page_state_retry_25_listener() { return ctx.load(); });
            i0.ɵɵelementStart(26, "app-data-table", 16);
            i0.ɵɵpipe(27, "t");
            i0.ɵɵpipe(28, "t");
            i0.ɵɵlistener("sortChange", function InvitationsPanel_Template_app_data_table_sortChange_26_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "app-list-pager", 17);
            i0.ɵɵlistener("pageChange", function InvitationsPanel_Template_app_list_pager_pageChange_29_listener($event) { return ctx.query.set({ page: $event }); })("sizeChange", function InvitationsPanel_Template_app_list_pager_sizeChange_29_listener($event) { return ctx.setPageSize($event); });
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 23, "invitationLifecycle"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 25, "invitationLifecycleHelp"));
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("tab", ctx.query.text("state", "all"));
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 27, "status"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.states);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 29, "search"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.search.value())("placeholder", i0.ɵɵpipeBind1(23, 31, "peopleSearch"));
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.search.value() ? 24 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError())("showInitialSkeleton", false);
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("data", ctx.data.value()?.items ?? i0.ɵɵpureFunction0(37, _c0))("loading", ctx.data.state() === "loading" || ctx.data.refreshing())("loadingText", i0.ɵɵpipeBind1(27, 33, "loading"))("emptyText", i0.ɵɵpipeBind1(28, 35, "invitationsEmpty"))("sortColumn", ctx.query.text("sort", "sentAt"))("sortDirection", ctx.query.direction("desc"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("total", ctx.data.value()?.total ?? 0)("page", ctx.query.page)("size", ctx.pageSize())("showSizePicker", true)("busy", ctx.data.refreshing());
        } }, dependencies: [i1.PageState, i1.ListPager, i2.FormsModule, i2.DefaultValueAccessor, i2.NgControlStatus, i2.MaxLengthValidator, i2.NgModel, i3.HlmButton, i4.HlmCard, i4.HlmCardContent, i4.HlmCardDescription, i4.HlmCardHeader, i4.HlmCardTitle, i5.HlmBadge, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.HlmTabs, i8.HlmTabsList, i8.HlmTabsTrigger, DataTable, InvitationDrawer, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InvitationsPanel, [{
        type: Component,
        args: [{
                selector: 'app-invitations-panel',
                imports: [WorkspaceUi, DataTable, InvitationDrawer],
                providers: [workspaceIcons],
                template: ` <section hlmCard class="workspace-directory-panel min-w-0">
    <div hlmCardHeader class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 hlmCardTitle>{{ 'invitationLifecycle' | t }}</h2>
        <p hlmCardDescription>{{ 'invitationLifecycleHelp' | t }}</p>
      </div>
      <app-invitation-drawer (invited)="load()" />
    </div>

    <div hlmCardContent>
      <div class="workspace-directory-controls">
        <hlm-tabs
          [tab]="query.text('state', 'all')"
          (tabActivated)="filter($event)"
          class="workspace-directory-tabs"
        >
          <hlm-tabs-list [attr.aria-label]="'status' | t" class="flex-wrap">
            @for (state of states; track state) {
              <button [hlmTabsTrigger]="state">
                {{ state | t }}
                <span hlmBadge variant="secondary">{{ i18n.number(stateCount(state)) }}</span>
              </button>
            }
          </hlm-tabs-list>
        </hlm-tabs>
        <div class="workspace-directory-toolbar">
          <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
            <label hlmFieldLabel class="sr-only" for="invitation-search">{{ 'search' | t }}</label>
            <input
              hlmInput
              id="invitation-search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
              maxlength="120"
              [placeholder]="'peopleSearch' | t"
            />
          </div>
          @if (search.value()) {
            <button hlmBtn type="button" variant="ghost" (click)="search.update('')">
              {{ 'clear' | t }}
            </button>
          }
        </div>
      </div>

      <app-page-state
        [state]="data.state()"
        [refreshError]="data.refreshError()"
        [showInitialSkeleton]="false"
        (retry)="load()"
        ><app-data-table
          [columns]="columns()"
          [data]="data.value()?.items ?? []"
          [loading]="data.state() === 'loading' || data.refreshing()"
          [loadingText]="'loading' | t"
          [emptyText]="'invitationsEmpty' | t"
          [sortColumn]="query.text('sort', 'sentAt')"
          [sortDirection]="query.direction('desc')"
          (sortChange)="sort($event)" /><app-list-pager
          [total]="data.value()?.total ?? 0"
          [page]="query.page"
          [size]="pageSize()"
          [showSizePicker]="true"
          [busy]="data.refreshing()"
          (pageChange)="query.set({ page: $event })"
          (sizeChange)="setPageSize($event)"
      /></app-page-state>
    </div>
  </section>`,
            }]
    }], () => [], { invitationDrawer: [{ type: i0.ViewChild, args: [i0.forwardRef(() => InvitationDrawer), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InvitationsPanel, { className: "InvitationsPanel", filePath: "src/app/features/invitations.ts", lineNumber: 108 }); })();
