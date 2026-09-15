import { Component, computed, inject, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, Confirmations, DEFAULT_PAGE_SIZE, } from '../../shared/workspace';
import { DataTable } from '../../shared/data-table';
import { RecordStatus, RowActions } from '../../shared/workspace-cells';
import { Auth } from '../../core/auth';
import { Features } from '../../core/features';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Runtime } from '../../core/runtime';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import * as i0 from "@angular/core";
import * as i1 from "../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@ng-icons/core";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/field";
import * as i8 from "@spartan-ng/helm/alert";
import * as i9 from "@spartan-ng/helm/checkbox";
import * as i10 from "@spartan-ng/helm/tabs";
import * as i11 from "../../core/i18n";
const _c0 = () => [];
const _c1 = () => ({ action: "operations" });
const _forTrack0 = ($index, $item) => $item.label;
function OperationsPage_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 1);
    i0.ɵɵlistener("click", function OperationsPage_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.maintenance()); });
    i0.ɵɵelement(1, "ng-icon", 4);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 2, "maintenance"), " ");
} }
function OperationsPage_Conditional_6_Conditional_1_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 27)(1, "div", 8)(2, "p", 29);
    i0.ɵɵelement(3, "ng-icon", 30);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "div", 11)(8, "button", 31);
    i0.ɵɵlistener("click", function OperationsPage_Conditional_6_Conditional_1_For_2_Template_button_click_8_listener() { const stat_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.showQueue(stat_r5.label)); });
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p", 32);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const stat_r5 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵclassMap(stat_r5.iconClass);
    i0.ɵɵproperty("name", stat_r5.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, stat_r5.label));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", stat_r5.value, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, stat_r5.note));
} }
function OperationsPage_Conditional_6_Conditional_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 28)(1, "h2", 33);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 34);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 35)(8, "button", 36);
    i0.ɵɵlistener("click", function OperationsPage_Conditional_6_Conditional_1_Conditional_3_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.query.set({ kind: "message", failed: "true", page: 1 })); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 36);
    i0.ɵɵlistener("click", function OperationsPage_Conditional_6_Conditional_1_Conditional_3_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.query.set({ kind: "job", failed: "true", page: 1 })); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const value_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, "operationsNeedsAttention"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "operationsNeedsAttentionHelp"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(10, 10, "messages"), " (", value_r7.failedMessages, ")");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(13, 12, "jobs"), " (", value_r7.failedJobs, ") ");
} }
function OperationsPage_Conditional_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26);
    i0.ɵɵrepeaterCreate(1, OperationsPage_Conditional_6_Conditional_1_For_2_Template, 13, 10, "section", 27, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, OperationsPage_Conditional_6_Conditional_1_Conditional_3_Template, 14, 14, "div", 28);
} if (rf & 2) {
    const value_r7 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.stats());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(value_r7.failedMessages || value_r7.failedJobs || value_r7.oldestMessageSeconds > value_r7.backlogWarningSeconds ? 3 : -1);
} }
function OperationsPage_Conditional_6_Conditional_38_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41)(1, "a", 42);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelement(4, "ng-icon", 43);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(4, _c1));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "viewAudit"));
} }
function OperationsPage_Conditional_6_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 37)(1, "div", 8)(2, "h2", 9);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 10);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 11)(9, "dl", 38)(10, "div")(11, "dt");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "dd", 39);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div")(17, "dt");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "dd");
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div")(24, "dt");
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "dd");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(29, "section", 37)(30, "div", 8)(31, "h2", 9);
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "p", 10);
    i0.ɵɵtext(35);
    i0.ɵɵpipe(36, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div", 11)(38, "ol", 40)(39, "li");
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "li");
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "li");
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(48, OperationsPage_Conditional_6_Conditional_38_Conditional_48_Template, 5, 5, "div", 41);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const value_r8 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 14, "systemDetails"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 16, "systemDetailsHelp"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 18, "deploymentVersion"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(value_r8.version);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 20, "lastMaintenance"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", value_r8.lastMaintenanceAt ? ctx_r1.i18n.date(value_r8.lastMaintenanceAt) : i0.ɵɵpipeBind1(22, 22, "notRecorded"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 24, "checkedAt"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.date(value_r8.checkedAt));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 26, "recoveryGuidance"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 28, "recoveryGuidanceHelp"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 30, "recoveryStepOne"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 32, "recoveryStepTwo"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 34, "recoveryStepThree"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.features.enabled("audit-history") ? 48 : -1);
} }
function OperationsPage_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-page-state", 5);
    i0.ɵɵlistener("retry", function OperationsPage_Conditional_6_Template_app_page_state_retry_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.refresh()); });
    i0.ɵɵconditionalCreate(1, OperationsPage_Conditional_6_Conditional_1_Template, 4, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 6)(3, "section", 7)(4, "div", 8)(5, "h2", 9);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 10);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 11)(12, "div", 12)(13, "hlm-tabs", 13);
    i0.ɵɵlistener("tabActivated", function OperationsPage_Conditional_6_Template_hlm_tabs_tabActivated_13_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.kind($event)); });
    i0.ɵɵelementStart(14, "hlm-tabs-list");
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementStart(16, "button", 14);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "button", 15);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(22, "label", 16)(23, "div", 17)(24, "hlm-checkbox", 18);
    i0.ɵɵlistener("checkedChange", function OperationsPage_Conditional_6_Template_hlm_checkbox_checkedChange_24_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.query.set({ failed: $event ? "true" : null, page: 1 })); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 19)(26, "span", 20);
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "p", 21);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "t");
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(32, "app-page-state", 22);
    i0.ɵɵlistener("retry", function OperationsPage_Conditional_6_Template_app_page_state_retry_32_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵelementStart(33, "app-data-table", 23);
    i0.ɵɵpipe(34, "t");
    i0.ɵɵpipe(35, "t");
    i0.ɵɵlistener("sortChange", function OperationsPage_Conditional_6_Template_app_data_table_sortChange_33_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.sort($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "app-list-pager", 24);
    i0.ɵɵlistener("pageChange", function OperationsPage_Conditional_6_Template_app_list_pager_pageChange_36_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.query.set({ page: $event })); });
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(37, "aside", 25);
    i0.ɵɵconditionalCreate(38, OperationsPage_Conditional_6_Conditional_38_Template, 49, 36);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_4_0;
    let tmp_25_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("state", ctx_r1.overview.state())("refreshing", ctx_r1.overview.refreshing())("refreshError", ctx_r1.overview.refreshError());
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_4_0 = ctx_r1.overview.value()) ? 1 : -1, tmp_4_0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 25, "deliveryQueue"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 27, "deliveryQueueHelp"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("tab", ctx_r1.query.text("kind", "message"));
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(15, 29, "deliveryType"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 31, "messages"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 33, "jobs"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("checked", ctx_r1.query.text("failed") === "true");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 35, "failedOnly"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 37, "failedOnlyHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("state", ctx_r1.data.state())("refreshError", ctx_r1.data.refreshError());
    i0.ɵɵadvance();
    i0.ɵɵproperty("columns", ctx_r1.columns())("data", ctx_r1.data.value()?.items ?? i0.ɵɵpureFunction0(43, _c0))("loading", ctx_r1.data.state() === "loading" || ctx_r1.data.refreshing())("loadingText", i0.ɵɵpipeBind1(34, 39, "loading"))("emptyText", i0.ɵɵpipeBind1(35, 41, "queueEmpty"))("sortColumn", ctx_r1.query.text("sort", "availableAt"))("sortDirection", ctx_r1.query.direction("asc"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("total", ctx_r1.data.value()?.total ?? 0)("page", ctx_r1.query.page);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_25_0 = ctx_r1.overview.value()) ? 38 : -1, tmp_25_0);
} }
const column = createColumnHelper();
export class OperationsPage {
    auth = inject(Auth);
    features = inject(Features);
    http = inject(HttpClient);
    runtime = inject(Runtime);
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    overview = new Resource();
    data = new Resource();
    query = new ListQuery();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    stats = computed(() => {
        const v = this.overview.value();
        return [
            {
                label: 'pendingMessages',
                icon: 'lucideMail',
                iconClass: 'text-chart-1',
                value: this.i18n.number(v?.pendingMessages ?? 0),
                note: 'pendingMessagesHelp',
            },
            {
                label: 'failedDeliveries',
                icon: 'lucideTriangleAlert',
                iconClass: 'text-chart-5',
                value: this.i18n.number((v?.failedMessages ?? 0) + (v?.failedJobs ?? 0)),
                note: 'failedDeliveriesHelp',
            },
            {
                label: 'activeJobs',
                icon: 'lucideActivity',
                iconClass: 'text-chart-2',
                value: this.i18n.number(v?.activeJobs ?? 0),
                note: 'activeJobsHelp',
            },
            {
                label: 'oldestPending',
                icon: 'lucideClock3',
                iconClass: 'text-chart-3',
                value: this.i18n.number(Math.ceil((v?.oldestMessageSeconds ?? 0) / 60)) +
                    ' ' +
                    this.i18n.text('minutesShort'),
                note: 'oldestPendingHelp',
            },
        ];
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stats" }] : /* istanbul ignore next */ []));
    columns = computed(() => {
        this.i18n.culture();
        const busy = this.busy();
        return column.columns([
            column.accessor('type', {
                header: this.i18n.text('deliveryType'),
                cell: (c) => this.i18n.text(c.getValue() === 'job'
                    ? 'maintenance'
                    : c.getValue() === 'email.requested.v1'
                        ? 'emailDelivery'
                        : 'backgroundDelivery'),
            }),
            column.accessor('state', {
                header: this.i18n.text('status'),
                cell: ({ row }) => flexRenderComponent(RecordStatus, {
                    inputs: { value: row.original.state, danger: row.original.state === 'Failed' },
                }),
            }),
            column.accessor('errorCode', {
                header: this.i18n.text('failureReason'),
                cell: ({ row }) => row.original.state === 'Failed' ? this.failureHelp(row.original.errorCode) : '—',
            }),
            column.accessor('attempts', { header: this.i18n.text('attempts') }),
            column.accessor('availableAt', {
                header: this.i18n.text('availableAt'),
                cell: (c) => this.i18n.date(c.getValue()),
            }),
            column.display({
                id: 'actions',
                enableSorting: false,
                header: this.i18n.text('actions'),
                cell: ({ row }) => flexRenderComponent(RowActions, {
                    inputs: {
                        actions: row.original.state === 'Failed'
                            ? [{ label: 'replay', disabled: busy, run: () => void this.replay(row.original) }]
                            : [],
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        if (this.auth.has('settings.manage'))
            this.query.connect(() => void this.load());
        if (this.auth.has('settings.manage'))
            void this.overview.load((signal) => this.api.get('operations/overview', {}, signal));
    }
    async refresh() {
        if (!this.auth.has('settings.manage'))
            return;
        await Promise.all([
            this.overview.load((signal) => this.api.get('operations/overview', {}, signal)),
            this.load(),
        ]);
    }
    async load() {
        const loaded = await this.data.load((signal) => this.api.get('operations', {
            kind: this.query.text('kind', 'message'),
            pageNumber: this.query.page,
            pageSize: DEFAULT_PAGE_SIZE,
            failedOnly: this.query.text('failed') === 'true',
            sort: this.query.text('sort', 'availableAt'),
            direction: this.query.direction('asc'),
        }, signal));
        if (loaded)
            this.query.clamp(this.data.value()?.total);
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    failureHelp(code) {
        const key = code === 'SmtpException'
            ? 'deliveryMailFailure'
            : code === 'TimeoutException' || code === 'TaskCanceledException'
                ? 'deliveryTimeout'
                : code === 'job.recovery_exhausted'
                    ? 'deliveryRetriesExhausted'
                    : 'deliveryFailureHelp';
        return this.i18n.text(key);
    }
    showQueue(label) {
        void this.query.set({
            kind: label === 'activeJobs' ? 'job' : 'message',
            failed: label === 'failedDeliveries' ? 'true' : null,
            page: 1,
        });
    }
    async maintenance() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await firstValueFrom(this.http.post(this.runtime.apiUrl + '/api/v1/jobs/maintenance', {}, { headers: { 'Idempotency-Key': crypto.randomUUID() } }));
            this.toast.success('requested');
            await this.refresh();
        }
        catch {
            /* central feedback */
        }
        finally {
            this.busy.set(false);
        }
    }
    kind(value) {
        if (value === 'message' || value === 'job')
            void this.query.set({ kind: value, page: 1 });
    }
    async replay(item) {
        if (this.busy() ||
            !(await this.confirm.ask('replayTitle', 'replayHelp', this.i18n.text(item.type === 'job' ? 'maintenance' : 'backgroundDelivery') +
                ' · ' +
                this.i18n.date(item.availableAt))))
            return;
        this.busy.set(true);
        try {
            await this.api.post('operations/replay', {
                id: item.id,
                kind: this.query.text('kind', 'message'),
            });
            this.toast.success('replayQueued');
            await this.refresh();
        }
        catch {
            /* Central error notification. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function OperationsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OperationsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: OperationsPage, selectors: [["app-operations"]], features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 7, vars: 6, consts: [["eyebrow", "administration", "title", "systemHealth", "description", "operationsIntro"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["name", "lucideRefreshCw"], ["hlmBtn", "", "variant", "outline", 3, "disabled"], ["name", "lucideActivity"], [3, "retry", "state", "refreshing", "refreshError"], [1, "workspace-columns"], ["hlmCard", "", 1, "min-w-0"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [1, "workspace-toolbar"], [3, "tabActivated", "tab"], ["hlmTabsTrigger", "message"], ["hlmTabsTrigger", "job"], ["hlmFieldLabel", "", "for", "failed-only", 1, "cursor-pointer"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "failed-only", 3, "checkedChange", "checked"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""], ["hlmFieldDescription", ""], [3, "retry", "state", "refreshError"], [3, "sortChange", "columns", "data", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "pageChange", "total", "page"], [1, "workspace-stack"], [1, "workspace-stats"], ["hlmCard", "", 1, "operations-stat-card"], ["hlmAlert", "", "variant", "destructive", 1, "mb-6"], ["hlmCardDescription", "", 1, "-ms-4", "flex", "items-center", "gap-1"], ["size", "20", "aria-hidden", "true", 3, "name"], [1, "workspace-stat-value", "underline-offset-4", "hover:underline", 3, "click"], [1, "workspace-stat-note"], ["hlmAlertTitle", ""], ["hlmAlertDescription", ""], [1, "mt-3", "flex", "gap-2"], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmCard", ""], [1, "workspace-detail-list"], [1, "break-all"], [1, "list-decimal", "pl-5", "text-sm", "text-muted-foreground", "flex", "flex-col", "gap-3"], ["hlmCardFooter", ""], ["hlmBtn", "", "variant", "outline", "routerLink", "/administration/audit-history", 3, "queryParams"], ["name", "lucideArrowUpRight"]], template: function OperationsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "button", 1);
            i0.ɵɵlistener("click", function OperationsPage_Template_button_click_1_listener() { return ctx.refresh(); });
            i0.ɵɵelement(2, "ng-icon", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, OperationsPage_Conditional_5_Template, 4, 4, "button", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, OperationsPage_Conditional_6_Template, 39, 44);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", !ctx.auth.has("settings.manage") || ctx.overview.state() === "loading" || ctx.overview.refreshing());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(4, 4, "refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.auth.has("jobs.trigger") && ctx.features.enabled("maintenance") ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.auth.has("settings.manage") ? 6 : -1);
        } }, dependencies: [i1.PageHeader, i1.PageState, i1.ListPager, i2.FormsModule, i3.RouterLink, i4.NgIcon, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardFooter, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmField, i7.HlmFieldContent, i7.HlmFieldDescription, i7.HlmFieldLabel, i7.HlmFieldTitle, i8.HlmAlert, i8.HlmAlertDescription, i8.HlmAlertTitle, i9.HlmCheckbox, i10.HlmTabs, i10.HlmTabsList, i10.HlmTabsTrigger, DataTable, i11.Translate], styles: [".operations-stat-card[_ngcontent-%COMP%] {\n      --%NS%panel-header-padding-block: calc(var(--%NS%spacing) * 2);\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OperationsPage, [{
        type: Component,
        args: [{ selector: 'app-operations', imports: [WorkspaceUi, DataTable], providers: [workspaceIcons], template: ` <app-page-header
      eyebrow="administration"
      title="systemHealth"
      description="operationsIntro"
      ><button
        hlmBtn
        variant="outline"
        [disabled]="
          !auth.has('settings.manage') || overview.state() === 'loading' || overview.refreshing()
        "
        (click)="refresh()"
      >
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button>
      @if (auth.has('jobs.trigger') && features.enabled('maintenance')) {
        <button hlmBtn variant="outline" [disabled]="busy()" (click)="maintenance()">
          <ng-icon name="lucideActivity" />{{ 'maintenance' | t }}
        </button>
      }
    </app-page-header>

    @if (auth.has('settings.manage')) {
      <app-page-state
        [state]="overview.state()"
        [refreshing]="overview.refreshing()"
        [refreshError]="overview.refreshError()"
        (retry)="refresh()"
      >
        @if (overview.value(); as value) {
          <div class="workspace-stats">
            @for (stat of stats(); track stat.label) {
              <section hlmCard class="operations-stat-card">
                <div hlmCardHeader>
                  <p hlmCardDescription class="-ms-4 flex items-center gap-1">
                    <ng-icon
                      [name]="stat.icon"
                      size="20"
                      [class]="stat.iconClass"
                      aria-hidden="true"
                    />
                    <span>{{ stat.label | t }}</span>
                  </p>
                </div>

                <div hlmCardContent>
                  <button
                    class="workspace-stat-value underline-offset-4 hover:underline"
                    (click)="showQueue(stat.label)"
                  >
                    {{ stat.value }}
                  </button>

                  <p class="workspace-stat-note">{{ stat.note | t }}</p>
                </div>
              </section>
            }
          </div>

          @if (
            value.failedMessages ||
            value.failedJobs ||
            value.oldestMessageSeconds > value.backlogWarningSeconds
          ) {
            <div hlmAlert variant="destructive" class="mb-6">
              <h2 hlmAlertTitle>{{ 'operationsNeedsAttention' | t }}</h2>

              <p hlmAlertDescription>{{ 'operationsNeedsAttentionHelp' | t }}</p>
              <div class="mt-3 flex gap-2">
                <button
                  hlmBtn
                  variant="outline"
                  (click)="query.set({ kind: 'message', failed: 'true', page: 1 })"
                >
                  {{ 'messages' | t }} ({{ value.failedMessages }})</button
                ><button
                  hlmBtn
                  variant="outline"
                  (click)="query.set({ kind: 'job', failed: 'true', page: 1 })"
                >
                  {{ 'jobs' | t }} ({{ value.failedJobs }})
                </button>
              </div>
            </div>
          }
        }
      </app-page-state>

      <div class="workspace-columns">
        <section hlmCard class="min-w-0">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'deliveryQueue' | t }}</h2>

            <p hlmCardDescription>{{ 'deliveryQueueHelp' | t }}</p>
          </div>

          <div hlmCardContent>
            <div class="workspace-toolbar">
              <hlm-tabs [tab]="query.text('kind', 'message')" (tabActivated)="kind($event)">
                <hlm-tabs-list [attr.aria-label]="'deliveryType' | t">
                  <button hlmTabsTrigger="message">{{ 'messages' | t }}</button>
                  <button hlmTabsTrigger="job">{{ 'jobs' | t }}</button>
                </hlm-tabs-list>
              </hlm-tabs>

              <label hlmFieldLabel for="failed-only" class="cursor-pointer">
                <div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="failed-only"
                    [checked]="query.text('failed') === 'true'"
                    (checkedChange)="query.set({ failed: $event ? 'true' : null, page: 1 })"
                  />
                  <div hlmFieldContent>
                    <span hlmFieldTitle>{{ 'failedOnly' | t }}</span>
                    <p hlmFieldDescription>{{ 'failedOnlyHelp' | t }}</p>
                  </div>
                </div>
              </label>
            </div>

            <app-page-state
              [state]="data.state()"
              [refreshError]="data.refreshError()"
              (retry)="load()"
              ><app-data-table
                [columns]="columns()"
                [data]="data.value()?.items ?? []"
                [loading]="data.state() === 'loading' || data.refreshing()"
                [loadingText]="'loading' | t"
                [emptyText]="'queueEmpty' | t"
                [sortColumn]="query.text('sort', 'availableAt')"
                [sortDirection]="query.direction('asc')"
                (sortChange)="sort($event)" /><app-list-pager
                [total]="data.value()?.total ?? 0"
                [page]="query.page"
                (pageChange)="query.set({ page: $event })"
            /></app-page-state>
          </div>
        </section>

        <aside class="workspace-stack">
          @if (overview.value(); as value) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'systemDetails' | t }}</h2>

                <p hlmCardDescription>{{ 'systemDetailsHelp' | t }}</p>
              </div>

              <div hlmCardContent>
                <dl class="workspace-detail-list">
                  <div>
                    <dt>{{ 'deploymentVersion' | t }}</dt>

                    <dd class="break-all">{{ value.version }}</dd>
                  </div>

                  <div>
                    <dt>{{ 'lastMaintenance' | t }}</dt>

                    <dd>
                      {{
                        value.lastMaintenanceAt
                          ? i18n.date(value.lastMaintenanceAt)
                          : ('notRecorded' | t)
                      }}
                    </dd>
                  </div>

                  <div>
                    <dt>{{ 'checkedAt' | t }}</dt>

                    <dd>{{ i18n.date(value.checkedAt) }}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'recoveryGuidance' | t }}</h2>

                <p hlmCardDescription>{{ 'recoveryGuidanceHelp' | t }}</p>
              </div>

              <div hlmCardContent>
                <ol class="list-decimal pl-5 text-sm text-muted-foreground flex flex-col gap-3">
                  <li>{{ 'recoveryStepOne' | t }}</li>

                  <li>{{ 'recoveryStepTwo' | t }}</li>

                  <li>{{ 'recoveryStepThree' | t }}</li>
                </ol>
              </div>

              @if (features.enabled('audit-history')) {
                <div hlmCardFooter>
                  <a
                    hlmBtn
                    variant="outline"
                    routerLink="/administration/audit-history"
                    [queryParams]="{ action: 'operations' }"
                    >{{ 'viewAudit' | t }}<ng-icon name="lucideArrowUpRight"
                  /></a>
                </div>
              }
            </section>
          }
        </aside>
      </div>
    }`, styles: ["\n    .operations-stat-card {\n      --panel-header-padding-block: calc(var(--spacing) * 2);\n    }\n  "] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(OperationsPage, { className: "OperationsPage", filePath: "src/app/features/operations.ts", lineNumber: 262 }); })();
