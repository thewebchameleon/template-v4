import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { SupportNewPage } from './create/support-new';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, DebouncedSearch, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { DataTable } from '../../../../../src/TemplateV4.Angular/src/app/shared/data-table';
import { RecordIdentity } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace-cells';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/select";
import * as i2 from "@spartan-ng/helm/drawer";
import * as i3 from "../../../../../src/TemplateV4.Angular/src/app/shared/workspace";
import * as i4 from "@angular/forms";
import * as i5 from "@angular/router";
import * as i6 from "@spartan-ng/helm/button";
import * as i7 from "@spartan-ng/helm/card";
import * as i8 from "@spartan-ng/helm/field";
import * as i9 from "@spartan-ng/helm/input";
import * as i10 from "@spartan-ng/helm/tabs";
import * as i11 from "../../../../../src/TemplateV4.Angular/src/app/core/i18n";
const _c0 = () => [];
const _forTrack0 = ($index, $item) => $item.id;
function SupportPage_hlm_drawer_content_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-drawer-content", 29);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-drawer-header")(3, "h2", 30);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 31);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(9, "app-support-new", 32);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 4, "supportTicketDetails"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "supportTicketDetails"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 8, "supportNewHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("embedded", true);
} }
function SupportPage_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 4);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "supportCategories"));
} }
function SupportPage_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-tabs", 33);
    i0.ɵɵlistener("tabActivated", function SupportPage_Conditional_8_Template_hlm_tabs_tabActivated_0_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.query.set({ queue: $event, page: 1 })); });
    i0.ɵɵelementStart(1, "hlm-tabs-list");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementStart(3, "button", 34);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 35);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("tab", ctx_r1.query.text("queue", "false"));
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "supportView"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "supportMine"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 8, "supportQueue"));
} }
function SupportPage_hlm_select_content_31_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 38);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const s_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", s_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "ticket." + s_r3));
} }
function SupportPage_hlm_select_content_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 36);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 37);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(5, SupportPage_hlm_select_content_31_For_6_Template, 3, 4, "hlm-select-item", 38, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 2, "status"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "supportAll"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.states);
} }
function SupportPage_hlm_select_content_39_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 38);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const s_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", s_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "ticket." + s_r4));
} }
function SupportPage_hlm_select_content_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 36);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 37);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(5, SupportPage_hlm_select_content_39_For_6_Template, 3, 4, "hlm-select-item", 38, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 2, "supportPriority"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "supportAll"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.priorities);
} }
function SupportPage_hlm_select_content_47_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 38);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r5 = ctx.$implicit;
    i0.ɵɵproperty("value", c_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r5.name);
} }
function SupportPage_hlm_select_content_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 36);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 37);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(5, SupportPage_hlm_select_content_47_For_6_Template, 2, 2, "hlm-select-item", 38, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 2, "supportCategory"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "supportAll"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.options.value()?.categories ?? i0.ɵɵpureFunction0(6, _c0));
} }
function SupportPage_Conditional_48_hlm_select_content_7_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 38);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const a_r7 = ctx.$implicit;
    i0.ɵɵproperty("value", a_r7.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(a_r7.name);
} }
function SupportPage_Conditional_48_hlm_select_content_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 36);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 37);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "hlm-select-item", 41);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(8, SupportPage_Conditional_48_hlm_select_content_7_For_9_Template, 2, 2, "hlm-select-item", 38, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 3, "supportAssignee"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "supportAll"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 7, "supportUnassigned"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.options.value()?.agents ?? i0.ɵɵpureFunction0(9, _c0));
} }
function SupportPage_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 13)(1, "label", 39);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "hlm-select", 17);
    i0.ɵɵlistener("valueChange", function SupportPage_Conditional_48_Template_hlm_select_valueChange_4_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.query.set({ assignee: $event ?? "", page: 1 })); });
    i0.ɵɵelementStart(5, "hlm-select-trigger", 40);
    i0.ɵɵelement(6, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, SupportPage_Conditional_48_hlm_select_content_7_Template, 10, 10, "hlm-select-content", 19);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "supportAssignee"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.query.text("assignee"))("itemToString", ctx_r1.assigneeLabel);
} }
export const ticketStates = ['Open', 'InProgress', 'WaitingOnRequester', 'Resolved', 'Closed'];
export const ticketPriorities = ['Low', 'Normal', 'High', 'Urgent'];
const column = createColumnHelper();
export class SupportPage {
    newTicketOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "newTicketOpen" }] : /* istanbul ignore next */ []));
    ticketEditor = viewChild(SupportNewPage, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ticketEditor" }] : /* istanbul ignore next */ []));
    hasUnsavedChanges() {
        return this.newTicketOpen() && (this.ticketEditor()?.hasUnsavedChanges() ?? false);
    }
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    options = new Resource();
    data = new Resource();
    query = new ListQuery();
    search = new DebouncedSearch(this.query);
    states = ticketStates;
    priorities = ticketPriorities;
    ticketLabel = (value) => this.i18n.text(value ? 'ticket.' + value : 'supportAll');
    categoryLabel = (id) => id
        ? (this.options.value()?.categories.find((category) => category.id === id)?.name ?? id)
        : this.i18n.text('supportAll');
    assigneeLabel = (id) => !id
        ? this.i18n.text('supportAll')
        : id === 'unassigned'
            ? this.i18n.text('supportUnassigned')
            : (this.options.value()?.agents.find((agent) => agent.id === id)?.name ?? id);
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor('subject', {
                header: this.i18n.text('supportSubject'),
                cell: ({ row }) => flexRenderComponent(RecordIdentity, {
                    inputs: { label: row.original.subject, link: '/support/' + row.original.id },
                }),
            }),
            column.accessor('requester', { header: this.i18n.text('supportRequester') }),
            column.accessor('category', { header: this.i18n.text('supportCategory') }),
            column.accessor('status', {
                header: this.i18n.text('status'),
                cell: (c) => this.i18n.text('ticket.' + c.getValue()),
            }),
            column.accessor('priority', {
                header: this.i18n.text('supportPriority'),
                cell: (c) => this.i18n.text('ticket.' + c.getValue()),
            }),
            column.accessor('assignee', {
                header: this.i18n.text('supportAssignee'),
                cell: (c) => c.getValue() || this.i18n.text('supportUnassigned'),
            }),
            column.accessor('updatedAt', {
                header: this.i18n.text('supportUpdated'),
                cell: (c) => this.i18n.date(c.getValue()),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        void this.loadOptions();
        this.query.connect(() => {
            this.search.sync(this.query.text('search'));
            void this.load();
        });
    }
    loadOptions() {
        return this.options.load((signal) => this.api.get('support/options', {}, signal));
    }
    pageSize() {
        const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
        return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
    }
    async load() {
        if (await this.data.load((signal) => this.api.get('support/', {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            search: this.query.text('search'),
            status: this.query.text('status'),
            priority: this.query.text('priority'),
            category: this.query.text('category'),
            assignee: this.query.text('assignee'),
            queue: this.query.text('queue') === 'true',
            sort: this.query.text('sort', 'updatedAt'),
            direction: this.query.direction('desc'),
        }, signal)))
            this.query.clamp(this.data.value()?.total, this.pageSize());
    }
    sort(s) {
        void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
    }
    static ɵfac = function SupportPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SupportPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SupportPage, selectors: [["app-support"]], viewQuery: function SupportPage_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.ticketEditor, SupportNewPage, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 60, vars: 58, consts: [["title", "support", "description", "supportIntro"], ["direction", "right", 3, "stateChanged", "state"], ["hlmBtn", "", "hlmDrawerTrigger", ""], ["class", "overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg", 4, "hlmDrawerPortal"], ["hlmBtn", "", "variant", "outline", "routerLink", "/support/categories"], [3, "retry", "state"], [1, "mb-6", 3, "tab"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [1, "mb-4", "grid", "gap-4", "sm:grid-cols-2", "lg:grid-cols-4"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "ticket-search"], ["hlmInput", "", "id", "ticket-search", "maxlength", "200", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "ticket-status"], [3, "valueChange", "value", "itemToString"], ["buttonId", "ticket-status", 1, "w-full"], [3, "ariaLabel", 4, "hlmSelectPortal"], ["hlmFieldLabel", "", "for", "ticket-priority"], ["buttonId", "ticket-priority", 1, "w-full"], ["hlmFieldLabel", "", "for", "ticket-category"], ["buttonId", "ticket-category", 1, "w-full"], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], [3, "retry", "state", "refreshError"], [3, "sortChange", "columns", "data", "loading", "emptyText", "loadingText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "total", "page", "size", "showSizePicker"], [1, "overflow-hidden", "data-[vaul-drawer-direction=right]:w-full", "data-[vaul-drawer-direction=right]:sm:max-w-lg"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], [1, "flex", "min-h-0", "flex-1", "flex-col", 3, "embedded"], [1, "mb-6", 3, "tabActivated", "tab"], ["hlmTabsTrigger", "false"], ["hlmTabsTrigger", "true"], [3, "ariaLabel"], ["value", ""], [3, "value"], ["hlmFieldLabel", "", "for", "ticket-agent"], ["buttonId", "ticket-agent", 1, "w-full"], ["value", "unassigned"]], template: function SupportPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "hlm-drawer", 1);
            i0.ɵɵlistener("stateChanged", function SupportPage_Template_hlm_drawer_stateChanged_1_listener($event) { return ctx.newTicketOpen.set($event === "open"); });
            i0.ɵɵelementStart(2, "button", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(5, SupportPage_hlm_drawer_content_5_Template, 10, 10, "hlm-drawer-content", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, SupportPage_Conditional_6_Template, 3, 3, "a", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "app-page-state", 5);
            i0.ɵɵlistener("retry", function SupportPage_Template_app_page_state_retry_7_listener() { return ctx.loadOptions(); });
            i0.ɵɵconditionalCreate(8, SupportPage_Conditional_8_Template, 9, 10, "hlm-tabs", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "section", 7)(10, "div", 8)(11, "h2", 9);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "p", 10);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div", 11)(18, "div", 12)(19, "div", 13)(20, "label", 14);
            i0.ɵɵtext(21);
            i0.ɵɵpipe(22, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "input", 15);
            i0.ɵɵlistener("ngModelChange", function SupportPage_Template_input_ngModelChange_23_listener($event) { return ctx.search.update($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "div", 13)(25, "label", 16);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "hlm-select", 17);
            i0.ɵɵlistener("valueChange", function SupportPage_Template_hlm_select_valueChange_28_listener($event) { return ctx.query.set({ status: $event ?? "", page: 1 }); });
            i0.ɵɵelementStart(29, "hlm-select-trigger", 18);
            i0.ɵɵelement(30, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(31, SupportPage_hlm_select_content_31_Template, 7, 6, "hlm-select-content", 19);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(32, "div", 13)(33, "label", 20);
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "hlm-select", 17);
            i0.ɵɵlistener("valueChange", function SupportPage_Template_hlm_select_valueChange_36_listener($event) { return ctx.query.set({ priority: $event ?? "", page: 1 }); });
            i0.ɵɵelementStart(37, "hlm-select-trigger", 21);
            i0.ɵɵelement(38, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(39, SupportPage_hlm_select_content_39_Template, 7, 6, "hlm-select-content", 19);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(40, "div", 13)(41, "label", 22);
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(44, "hlm-select", 17);
            i0.ɵɵlistener("valueChange", function SupportPage_Template_hlm_select_valueChange_44_listener($event) { return ctx.query.set({ category: $event ?? "", page: 1 }); });
            i0.ɵɵelementStart(45, "hlm-select-trigger", 23);
            i0.ɵɵelement(46, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(47, SupportPage_hlm_select_content_47_Template, 7, 7, "hlm-select-content", 19);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(48, SupportPage_Conditional_48_Template, 8, 5, "div", 13);
            i0.ɵɵelementStart(49, "button", 24);
            i0.ɵɵlistener("click", function SupportPage_Template_button_click_49_listener() { return ctx.query.set({ search: null, status: null, priority: null, category: null, assignee: null, page: 1 }); });
            i0.ɵɵtext(50);
            i0.ɵɵpipe(51, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "button", 25);
            i0.ɵɵlistener("click", function SupportPage_Template_button_click_52_listener() { return ctx.load(); });
            i0.ɵɵtext(53);
            i0.ɵɵpipe(54, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(55, "app-page-state", 26);
            i0.ɵɵlistener("retry", function SupportPage_Template_app_page_state_retry_55_listener() { return ctx.load(); });
            i0.ɵɵelementStart(56, "app-data-table", 27);
            i0.ɵɵpipe(57, "t");
            i0.ɵɵpipe(58, "t");
            i0.ɵɵlistener("sortChange", function SupportPage_Template_app_data_table_sortChange_56_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "app-list-pager", 28);
            i0.ɵɵlistener("pageChange", function SupportPage_Template_app_list_pager_pageChange_59_listener($event) { return ctx.query.set({ page: $event }); })("sizeChange", function SupportPage_Template_app_list_pager_sizeChange_59_listener($event) { return ctx.query.set({ size: $event, page: 1 }); });
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.newTicketOpen() ? "open" : "closed");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 35, "supportNew"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.options.value()?.administrator ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.options.state());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.options.value()?.agent ? 8 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 37, ctx.query.text("queue") === "true" ? "supportQueue" : "supportMine"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 39, "supportListHelp"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 41, "search"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.search.value());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 43, "status"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.query.text("status"))("itemToString", ctx.ticketLabel);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 45, "supportPriority"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.query.text("priority"))("itemToString", ctx.ticketLabel);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 47, "supportCategory"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.query.text("category"))("itemToString", ctx.categoryLabel);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.options.value()?.agent ? 48 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(51, 49, "clearFilters"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.data.refreshing());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(54, 51, "refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("data", ctx.data.value()?.items ?? i0.ɵɵpureFunction0(57, _c0))("loading", ctx.data.refreshing())("emptyText", i0.ɵɵpipeBind1(57, 53, "supportEmpty"))("loadingText", i0.ɵɵpipeBind1(58, 55, "loading"))("sortColumn", ctx.query.text("sort", "updatedAt"))("sortDirection", ctx.query.direction("desc"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("total", ctx.data.value()?.total ?? 0)("page", ctx.query.page)("size", ctx.pageSize())("showSizePicker", true);
        } }, dependencies: [i1.HlmSelect, i1.HlmSelectContent, i1.HlmSelectItem, i1.HlmSelectPortal, i1.HlmSelectTrigger, i1.HlmSelectValue, i2.HlmDrawer, i2.HlmDrawerContent, i2.HlmDrawerDescription, i2.HlmDrawerHeader, i2.HlmDrawerPortal, i2.HlmDrawerTitle, i2.HlmDrawerTrigger, i3.PageHeader, i3.PageState, i3.ListPager, i4.FormsModule, i4.DefaultValueAccessor, i4.NgControlStatus, i4.MaxLengthValidator, i4.NgModel, i5.RouterLink, i6.HlmButton, i7.HlmCard, i7.HlmCardContent, i7.HlmCardDescription, i7.HlmCardHeader, i7.HlmCardTitle, i8.HlmField, i8.HlmFieldLabel, i9.HlmInput, i10.HlmTabs, i10.HlmTabsList, i10.HlmTabsTrigger, DataTable, SupportNewPage, i11.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SupportPage, [{
        type: Component,
        args: [{
                selector: 'app-support',
                imports: [HlmSelectImports, HlmDrawerImports, WorkspaceUi, DataTable, SupportNewPage],
                providers: [workspaceIcons],
                template: `<app-page-header title="support" description="supportIntro">
      <hlm-drawer
        direction="right"
        [state]="newTicketOpen() ? 'open' : 'closed'"
        (stateChanged)="newTicketOpen.set($event === 'open')"
      >
        <button hlmBtn hlmDrawerTrigger>{{ 'supportNew' | t }}</button>
        <hlm-drawer-content
          *hlmDrawerPortal
          class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg"
          [attr.aria-label]="'supportTicketDetails' | t"
        >
          <hlm-drawer-header>
            <h2 hlmDrawerTitle>{{ 'supportTicketDetails' | t }}</h2>
            <p hlmDrawerDescription>{{ 'supportNewHelp' | t }}</p>
          </hlm-drawer-header>
          <app-support-new class="flex min-h-0 flex-1 flex-col" [embedded]="true" />
        </hlm-drawer-content>
      </hlm-drawer>
      @if (options.value()?.administrator) {
        <a hlmBtn variant="outline" routerLink="/support/categories">{{
          'supportCategories' | t
        }}</a>
      }
    </app-page-header>
    <app-page-state [state]="options.state()" (retry)="loadOptions()">
      @if (options.value()?.agent) {
        <hlm-tabs
          class="mb-6"
          [tab]="query.text('queue', 'false')"
          (tabActivated)="query.set({ queue: $event, page: 1 })"
        >
          <hlm-tabs-list [attr.aria-label]="'supportView' | t">
            <button hlmTabsTrigger="false">{{ 'supportMine' | t }}</button>
            <button hlmTabsTrigger="true">{{ 'supportQueue' | t }}</button>
          </hlm-tabs-list>
        </hlm-tabs>
      }
    </app-page-state>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>
          {{ (query.text('queue') === 'true' ? 'supportQueue' : 'supportMine') | t }}
        </h2>
        <p hlmCardDescription>{{ 'supportListHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div hlmField>
            <label hlmFieldLabel for="ticket-search">{{ 'search' | t }}</label
            ><input
              hlmInput
              id="ticket-search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
              maxlength="200"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="ticket-status">{{ 'status' | t }}</label
            ><hlm-select
              [value]="query.text('status')"
              [itemToString]="ticketLabel"
              (valueChange)="query.set({ status: $event ?? '', page: 1 })"
            >
              <hlm-select-trigger buttonId="ticket-status" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t"
                ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                @for (s of states; track s) {
                  <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="ticket-priority">{{ 'supportPriority' | t }}</label
            ><hlm-select
              [value]="query.text('priority')"
              [itemToString]="ticketLabel"
              (valueChange)="query.set({ priority: $event ?? '', page: 1 })"
            >
              <hlm-select-trigger buttonId="ticket-priority" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportPriority' | t"
                ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                @for (s of priorities; track s) {
                  <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="ticket-category">{{ 'supportCategory' | t }}</label
            ><hlm-select
              [value]="query.text('category')"
              [itemToString]="categoryLabel"
              (valueChange)="query.set({ category: $event ?? '', page: 1 })"
            >
              <hlm-select-trigger buttonId="ticket-category" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t"
                ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                @for (c of options.value()?.categories ?? []; track c.id) {
                  <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          @if (options.value()?.agent) {
            <div hlmField>
              <label hlmFieldLabel for="ticket-agent">{{ 'supportAssignee' | t }}</label
              ><hlm-select
                [value]="query.text('assignee')"
                [itemToString]="assigneeLabel"
                (valueChange)="query.set({ assignee: $event ?? '', page: 1 })"
              >
                <hlm-select-trigger buttonId="ticket-agent" class="w-full"
                  ><hlm-select-value
                /></hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportAssignee' | t"
                  ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                  <hlm-select-item value="unassigned">{{
                    'supportUnassigned' | t
                  }}</hlm-select-item>
                  @for (a of options.value()?.agents ?? []; track a.id) {
                    <hlm-select-item [value]="a.id">{{ a.name }}</hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
          }
          <button
            hlmBtn
            variant="outline"
            (click)="
              query.set({
                search: null,
                status: null,
                priority: null,
                category: null,
                assignee: null,
                page: 1,
              })
            "
          >
            {{ 'clearFilters' | t }}
          </button>
          <button hlmBtn variant="outline" (click)="load()" [disabled]="data.refreshing()">
            {{ 'refresh' | t }}
          </button>
        </div>
        <app-page-state
          [state]="data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
        >
          <app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'supportEmpty' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'updatedAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
          />
        </app-page-state>
      </div>
    </section>`,
            }]
    }], () => [], { ticketEditor: [{ type: i0.ViewChild, args: [i0.forwardRef(() => SupportNewPage), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SupportPage, { className: "SupportPage", filePath: "src/app/features/support.ts", lineNumber: 210 }); })();
