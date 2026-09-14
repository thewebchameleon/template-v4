import { Component, computed, inject, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, Confirmations, DEFAULT_PAGE_SIZE, } from '../shared/workspace';
import { DataTable } from '../shared/data-table';
import { RecordIdentity, RowActions } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { Auth } from '../core/auth';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@ng-icons/core";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/alert";
import * as i7 from "../core/i18n";
const _c0 = () => [];
const column = createColumnHelper();
export class PrivacyRequestsPage {
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    auth = inject(Auth);
    data = new Resource();
    query = new ListQuery();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    columns = computed(() => {
        this.i18n.culture();
        const busy = this.busy();
        return column.columns([
            column.accessor('displayName', {
                header: this.i18n.text('person'),
                cell: ({ row }) => flexRenderComponent(RecordIdentity, {
                    inputs: {
                        label: row.original.displayName ?? this.i18n.text('deletedAccount'),
                        link: '/audit',
                        params: { subjectId: row.original.userId },
                    },
                }),
            }),
            column.accessor('requestedAt', {
                header: this.i18n.text('requestedAt'),
                cell: (c) => this.i18n.date(c.getValue()),
            }),
            column.display({
                id: 'actions',
                enableSorting: false,
                header: this.i18n.text('actions'),
                cell: ({ row }) => flexRenderComponent(RowActions, {
                    inputs: {
                        actions: [
                            {
                                label: 'decline',
                                disabled: busy || row.original.userId === this.auth.access()?.userId,
                                run: () => void this.review(row.original, false),
                            },
                            {
                                label: 'approveDeletion',
                                disabled: busy || row.original.userId === this.auth.access()?.userId,
                                destructive: true,
                                run: () => void this.review(row.original, true),
                            },
                        ],
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        this.query.connect(() => void this.load());
    }
    async load() {
        const loaded = await this.data.load((signal) => this.api.get('privacy/requests', {
            pageNumber: this.query.page,
            pageSize: DEFAULT_PAGE_SIZE,
            sort: this.query.text('sort', 'requestedAt'),
            direction: this.query.direction('asc'),
        }, signal));
        if (loaded)
            this.query.clamp(this.data.value()?.total);
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    async review(item, approve) {
        if (this.busy() ||
            !(await this.confirm.ask(approve ? 'approveDeletion' : 'declineRequest', approve ? 'approveDeletionHelp' : 'declineRequestHelp', item.displayName ?? '', approve)))
            return;
        this.busy.set(true);
        try {
            await this.api.post('privacy/review', { id: item.id, approve });
            this.toast.success('requestReviewed');
            await this.load();
        }
        catch {
            /* Central error UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function PrivacyRequestsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PrivacyRequestsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PrivacyRequestsPage, selectors: [["app-privacy-requests"]], features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 26, vars: 32, consts: [[1, "mb-6", "flex", "justify-end"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["name", "lucideRefreshCw"], ["hlmAlert", "", 1, "mb-6"], ["hlmAlertTitle", ""], ["hlmAlertDescription", ""], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [3, "retry", "state", "refreshError"], [3, "sortChange", "columns", "data", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "pageChange", "total", "page"]], template: function PrivacyRequestsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "button", 1);
            i0.ɵɵlistener("click", function PrivacyRequestsPage_Template_button_click_1_listener() { return ctx.load(); });
            i0.ɵɵelement(2, "ng-icon", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "div", 3)(6, "h2", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "p", 5);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "section", 6)(13, "div", 7)(14, "h2", 8);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "p", 9);
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(20, "div", 10)(21, "app-page-state", 11);
            i0.ɵɵlistener("retry", function PrivacyRequestsPage_Template_app_page_state_retry_21_listener() { return ctx.load(); });
            i0.ɵɵelementStart(22, "app-data-table", 12);
            i0.ɵɵpipe(23, "t");
            i0.ɵɵpipe(24, "t");
            i0.ɵɵlistener("sortChange", function PrivacyRequestsPage_Template_app_data_table_sortChange_22_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "app-list-pager", 13);
            i0.ɵɵlistener("pageChange", function PrivacyRequestsPage_Template_app_list_pager_pageChange_25_listener($event) { return ctx.query.set({ page: $event }); });
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.data.state() === "loading");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(4, 17, "refresh"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 19, "reviewBeforeApproval"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 21, "reviewBeforeApprovalHelp"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 23, "pendingRequests"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 25, "pendingRequestsHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("data", ctx.data.value()?.items ?? i0.ɵɵpureFunction0(31, _c0))("loading", ctx.data.state() === "loading" || ctx.data.refreshing())("loadingText", i0.ɵɵpipeBind1(23, 27, "loading"))("emptyText", i0.ɵɵpipeBind1(24, 29, "privacyRequestsEmpty"))("sortColumn", ctx.query.text("sort", "requestedAt"))("sortDirection", ctx.query.direction("asc"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("total", ctx.data.value()?.total ?? 0)("page", ctx.query.page);
        } }, dependencies: [i1.PageState, i1.ListPager, i2.FormsModule, i3.NgIcon, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmAlert, i6.HlmAlertDescription, i6.HlmAlertTitle, DataTable, i7.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PrivacyRequestsPage, [{
        type: Component,
        args: [{
                selector: 'app-privacy-requests',
                imports: [WorkspaceUi, DataTable],
                providers: [workspaceIcons],
                template: ` <div class="mb-6 flex justify-end">
      <button hlmBtn variant="outline" (click)="load()" [disabled]="data.state() === 'loading'">
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button>
    </div>
    <div hlmAlert class="mb-6">
      <h2 hlmAlertTitle>{{ 'reviewBeforeApproval' | t }}</h2>
      <p hlmAlertDescription>{{ 'reviewBeforeApprovalHelp' | t }}</p>
    </div>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'pendingRequests' | t }}</h2>
        <p hlmCardDescription>{{ 'pendingRequestsHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="'privacyRequestsEmpty' | t"
            [sortColumn]="query.text('sort', 'requestedAt')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)" /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PrivacyRequestsPage, { className: "PrivacyRequestsPage", filePath: "src/app/features/privacy-requests.ts", lineNumber: 55 }); })();
