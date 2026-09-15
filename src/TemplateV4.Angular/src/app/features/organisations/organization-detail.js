import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Features } from '../../core/features';
import { FOUNDATION_FEATURES } from '../../core/feature-extensions';
import { Component, computed, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../../shared/confirmation';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { Auth } from '../../core/auth';
import { Notifications } from '../notifications/notifications';
import { Resource, WorkspaceUi, ListQuery, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, Confirmations, } from '../../shared/workspace';
import { DataTable } from '../../shared/data-table';
import { RowActions } from '../../shared/workspace-cells';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/select";
import * as i2 from "../../shared/workspace";
import * as i3 from "@angular/forms";
import * as i4 from "@angular/router";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/field";
import * as i8 from "@spartan-ng/helm/input";
import * as i9 from "@spartan-ng/helm/alert";
import * as i10 from "../../core/i18n";
const _c0 = a0 => ["/organizations", a0, "files"];
const _c1 = a0 => ["/organizations", a0, "billing"];
const _c2 = a0 => ["/organizations", a0, "invoicing"];
const _c3 = a0 => ["/organizations", a0, "crm"];
const _c4 = (a0, a1) => ["/organizations", a0, a1];
const _c5 = () => [];
const _forTrack0 = ($index, $item) => $item.segment;
function OrganizationDetailPage_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 4);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(4, _c3, ctx_r0.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "crm"));
} }
function OrganizationDetailPage_For_15_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 4);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const link_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction2(4, _c4, ctx_r0.id, link_r2.segment));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, link_r2.label));
} }
function OrganizationDetailPage_For_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, OrganizationDetailPage_For_15_Conditional_0_Template, 3, 7, "a", 4);
} if (rf & 2) {
    const link_r2 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.features.enabled(link_r2.capability) ? 0 : -1);
} }
function OrganizationDetailPage_Conditional_17_Conditional_20_hlm_select_content_22_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "customer.Admin"));
} }
function OrganizationDetailPage_Conditional_17_Conditional_20_hlm_select_content_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content")(1, "hlm-select-item", 29);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, OrganizationDetailPage_Conditional_17_Conditional_20_hlm_select_content_22_Conditional_4_Template, 3, 3, "hlm-select-item", 30);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const account_r5 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "customer.Member"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(account_r5.role === "Owner" ? 4 : -1);
} }
function OrganizationDetailPage_Conditional_17_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 10)(1, "div", 11)(2, "h2", 12);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 13);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "form", 17, 0);
    i0.ɵɵlistener("ngSubmit", function OrganizationDetailPage_Conditional_17_Conditional_20_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.invite()); });
    i0.ɵɵelementStart(10, "div", 18)(11, "label", 19);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "input", 20);
    i0.ɵɵtwoWayListener("ngModelChange", function OrganizationDetailPage_Conditional_17_Conditional_20_Template_input_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r0.email, $event) || (ctx_r0.email = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "div", 18)(16, "label", 21);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "hlm-select", 22);
    i0.ɵɵtwoWayListener("ngModelChange", function OrganizationDetailPage_Conditional_17_Conditional_20_Template_hlm_select_ngModelChange_19_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r0.role, $event) || (ctx_r0.role = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(20, "hlm-select-trigger", 23);
    i0.ɵɵelement(21, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(22, OrganizationDetailPage_Conditional_17_Conditional_20_hlm_select_content_22_Template, 5, 4, "hlm-select-content", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "button", 25);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "section", 26)(27, "div", 11)(28, "h2", 12);
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(31, "form", 17, 1);
    i0.ɵɵlistener("ngSubmit", function OrganizationDetailPage_Conditional_17_Conditional_20_Template_form_ngSubmit_31_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.rename()); });
    i0.ɵɵelementStart(33, "div", 18)(34, "label", 27);
    i0.ɵɵtext(35);
    i0.ɵɵpipe(36, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "input", 28);
    i0.ɵɵtwoWayListener("ngModelChange", function OrganizationDetailPage_Conditional_17_Conditional_20_Template_input_ngModelChange_37_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r0.name, $event) || (ctx_r0.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "button", 25);
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const inviteForm_r6 = i0.ɵɵreference(9);
    const renameForm_r7 = i0.ɵɵreference(32);
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 13, "inviteMember"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 15, "inviteMemberHelp"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 17, "email"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.email);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 19, "role"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.role);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r0.busy() || inviteForm_r6.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(25, 21, "inviteMember"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 23, "organizationName"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 25, "organizationName"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.name);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.busy() || renameForm_r7.invalid || !ctx_r0.name.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(40, 27, "save"), " ");
} }
function OrganizationDetailPage_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "h2", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 8)(3, "button", 9);
    i0.ɵɵlistener("click", function OrganizationDetailPage_Conditional_17_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.leaveOrClose()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "section", 10)(7, "div", 11)(8, "h2", 12);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 13);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 14)(15, "app-page-state", 5);
    i0.ɵɵlistener("retry", function OrganizationDetailPage_Conditional_17_Template_app_page_state_retry_15_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.loadMembers()); });
    i0.ɵɵelementStart(16, "app-data-table", 15);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵpipe(18, "t");
    i0.ɵɵlistener("sortChange", function OrganizationDetailPage_Conditional_17_Template_app_data_table_sortChange_16_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.sort($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "app-list-pager", 16);
    i0.ɵɵlistener("pageChange", function OrganizationDetailPage_Conditional_17_Template_app_list_pager_pageChange_19_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.query.set({ page: $event })); })("sizeChange", function OrganizationDetailPage_Conditional_17_Template_app_list_pager_sizeChange_19_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.query.set({ size: $event, page: 1 })); });
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(20, OrganizationDetailPage_Conditional_17_Conditional_20_Template, 41, 29);
} if (rf & 2) {
    const account_r5 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(account_r5.name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 19, account_r5.role === "Owner" ? "closeOrganization" : "leaveOrganization"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 21, "organizationMembers"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 23, "customer." + account_r5.role));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("state", ctx_r0.members.state())("refreshError", ctx_r0.members.refreshError());
    i0.ɵɵadvance();
    i0.ɵɵproperty("columns", ctx_r0.columns())("data", ctx_r0.members.value()?.items ?? i0.ɵɵpureFunction0(29, _c5))("loading", ctx_r0.members.refreshing())("emptyText", i0.ɵɵpipeBind1(17, 25, "noResults"))("loadingText", i0.ɵɵpipeBind1(18, 27, "loading"))("sortColumn", ctx_r0.query.text("sort", "name"))("sortDirection", ctx_r0.query.direction("asc"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("total", ctx_r0.members.value()?.total ?? 0)("page", ctx_r0.query.page)("size", ctx_r0.pageSize())("showSizePicker", true);
    i0.ɵɵadvance();
    i0.ɵɵconditional(account_r5.role !== "Member" ? 20 : -1);
} }
function OrganizationDetailPage_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "p", 31);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "customers.not_found"));
} }
const column = createColumnHelper();
export class OrganizationDetailPage {
    features = inject(Features);
    businessLinks = inject(FOUNDATION_FEATURES).flatMap((feature) => feature.organizationLinks ?? []);
    id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    auth = inject(Auth);
    router = inject(Router);
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    home = new Resource();
    members = new Resource();
    query = new ListQuery();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    account = computed(() => this.home.value()?.accounts.find((a) => a.id === this.id), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "account" }] : /* istanbul ignore next */ []));
    email = '';
    role = 'Member';
    name = '';
    columns = computed(() => {
        this.i18n.culture();
        const owner = this.account()?.role === 'Owner';
        const manager = owner || this.account()?.role === 'Admin';
        return column.columns([
            column.accessor('name', { header: this.i18n.text('name') }),
            column.accessor('email', { header: this.i18n.text('email') }),
            column.accessor('role', {
                header: this.i18n.text('role'),
                cell: (c) => this.i18n.text('customer.' + c.getValue()),
            }),
            column.display({
                id: 'actions',
                enableSorting: false,
                cell: ({ row }) => flexRenderComponent(RowActions, {
                    inputs: {
                        actions: row.original.role === 'Owner'
                            ? []
                            : [
                                ...(owner
                                    ? [
                                        {
                                            label: row.original.role === 'Admin' ? 'makeMember' : 'makeAdmin',
                                            run: () => void this.change(row.original, 'role'),
                                        },
                                        {
                                            label: 'transferOwnership',
                                            run: () => void this.change(row.original, 'transfer'),
                                        },
                                    ]
                                    : []),
                                ...(manager && (owner || row.original.role === 'Member')
                                    ? [
                                        {
                                            label: 'remove',
                                            destructive: true,
                                            run: () => void this.change(row.original, 'remove'),
                                        },
                                    ]
                                    : []),
                            ].map((a) => ({ ...a, disabled: this.busy() })),
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    hasUnsavedChanges() {
        return (this.busy() ||
            !!this.email.trim() ||
            (this.account() != null && this.name !== this.account().name));
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    constructor() {
        void this.reload();
        this.query.connect(() => void this.loadMembers());
    }
    async reload(preserveDraft = true) {
        const dirty = this.account() != null && this.name !== this.account().name;
        if (await this.home.load((signal) => this.api.get('customers/', {}, signal)))
            if (!preserveDraft || !dirty)
                this.name = this.account()?.name ?? '';
    }
    pageSize() {
        const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
        return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
    }
    async loadMembers() {
        if (await this.members.load((signal) => this.api.get(`customers/${this.id}/members`, {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            sort: this.query.text('sort', 'name'),
            direction: this.query.direction('asc'),
        }, signal)))
            this.query.clamp(this.members.value()?.total, this.pageSize());
    }
    sort(s) {
        void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
    }
    async run(path, body) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`customers/${this.id}/${path}`, body);
            if (path === 'invite') {
                this.email = '';
                this.role = 'Member';
            }
            await this.reload(path !== 'rename');
            await this.loadMembers();
            this.toast.success('customerSaved');
        }
        finally {
            this.busy.set(false);
        }
    }
    async leaveOrClose() {
        const account = this.account();
        if (!account || this.busy())
            return;
        const close = account.role === 'Owner';
        if (!(await this.confirm.ask(close ? 'closeOrganization' : 'leaveOrganization', close ? 'closeOrganizationHelp' : 'leaveOrganizationHelp', account.name, true)))
            return;
        this.busy.set(true);
        try {
            if (close)
                await this.api.post(`customers/${this.id}/close`, { version: account.version });
            else
                await this.api.post(`customers/${this.id}/members/remove`, {
                    userId: this.auth.access().userId,
                    version: account.version,
                });
            this.email = '';
            this.name = account.name;
            this.busy.set(false);
            await this.router.navigateByUrl('/organizations');
        }
        finally {
            this.busy.set(false);
        }
    }
    async invite() {
        await this.run('invite', { email: this.email, role: this.role });
    }
    async rename() {
        await this.run('rename', { name: this.name, version: this.account()?.version });
    }
    async change(member, action) {
        if (!(await this.confirm.ask('confirmCustomerChange', 'confirmCustomerChangeHelp', member.name, action === 'remove')))
            return;
        await this.run(action === 'transfer' ? 'transfer' : `members/${action}`, {
            userId: member.userId,
            version: this.account()?.version,
            role: member.role === 'Admin' ? 'Member' : 'Admin',
        });
    }
    static ɵfac = function OrganizationDetailPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OrganizationDetailPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: OrganizationDetailPage, selectors: [["app-organization-detail"]], hostBindings: function OrganizationDetailPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function OrganizationDetailPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 19, vars: 25, consts: [["inviteForm", "ngForm"], ["renameForm", "ngForm"], ["title", "organizationWorkspace", "description", "organizationWorkspaceHelp"], ["hlmBtn", "", "variant", "outline", "routerLink", "/organizations"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], [3, "retry", "state", "refreshError"], ["hlmAlert", ""], [1, "page-title", "mb-6"], [1, "flex", "flex-wrap", "gap-2", "mb-6"], ["hlmBtn", "", "variant", "destructive", 3, "click", "disabled"], ["hlmCard", "", 1, "mb-6"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [3, "sortChange", "columns", "data", "loading", "emptyText", "loadingText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "total", "page", "size", "showSizePicker"], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "member-email"], ["hlmInput", "", "type", "email", "email", "", "id", "member-email", "name", "email", "required", "", "maxlength", "256", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "member-role"], ["name", "role", 3, "ngModelChange", "ngModel"], ["buttonId", "member-role"], [4, "hlmSelectPortal"], ["hlmBtn", "", 3, "disabled"], ["hlmCard", ""], ["hlmFieldLabel", "", "for", "rename-organization"], ["hlmInput", "", "id", "rename-organization", "name", "name", "required", "", "maxlength", "120", 3, "ngModelChange", "ngModel"], ["value", "Member"], ["value", "Admin"], ["hlmAlertDescription", ""]], template: function OrganizationDetailPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 2)(1, "a", 3);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "a", 4);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "a", 4);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(10, OrganizationDetailPage_Conditional_10_Template, 3, 6, "a", 4);
            i0.ɵɵelementStart(11, "a", 4);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(14, OrganizationDetailPage_For_15_Template, 1, 1, null, null, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "app-page-state", 5);
            i0.ɵɵlistener("retry", function OrganizationDetailPage_Template_app_page_state_retry_16_listener() { return ctx.reload(); });
            i0.ɵɵconditionalCreate(17, OrganizationDetailPage_Conditional_17_Template, 21, 30)(18, OrganizationDetailPage_Conditional_18_Template, 4, 3, "div", 6);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_11_0;
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 11, "switchAccount"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(19, _c0, ctx.id));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 13, "files"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(21, _c1, ctx.id));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 15, "billing"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.features.enabled("crm") ? 10 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(23, _c2, ctx.id));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 17, "invoicing"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.businessLinks);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.home.state())("refreshError", ctx.home.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_11_0 = ctx.account()) ? 17 : 18, tmp_11_0);
        } }, dependencies: [i1.HlmSelect, i1.HlmSelectContent, i1.HlmSelectItem, i1.HlmSelectPortal, i1.HlmSelectTrigger, i1.HlmSelectValue, i2.PageHeader, i2.PageState, i2.ListPager, i3.FormsModule, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.MaxLengthValidator, i3.EmailValidator, i3.NgModel, i3.NgForm, i4.RouterLink, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmField, i7.HlmFieldLabel, i8.HlmInput, i9.HlmAlert, i9.HlmAlertDescription, DataTable, i10.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OrganizationDetailPage, [{
        type: Component,
        args: [{
                selector: 'app-organization-detail',
                imports: [HlmSelectImports, WorkspaceUi, RouterLink, DataTable],
                template: `<app-page-header title="organizationWorkspace" description="organizationWorkspaceHelp"
      ><a hlmBtn variant="outline" routerLink="/organizations">{{ 'switchAccount' | t }}</a
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', id, 'files']">{{
        'files' | t
      }}</a
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', id, 'billing']">{{
        'billing' | t
      }}</a>
      @if (features.enabled('crm')) {
        <a hlmBtn variant="outline" [routerLink]="['/organizations', id, 'crm']">{{ 'crm' | t }}</a>
      }
      <a hlmBtn variant="outline" [routerLink]="['/organizations', id, 'invoicing']">{{
        'invoicing' | t
      }}</a>
      @for (link of businessLinks; track link.segment) {
        @if (features.enabled(link.capability)) {
          <a hlmBtn variant="outline" [routerLink]="['/organizations', id, link.segment]">{{
            link.label | t
          }}</a>
        }
      }
    </app-page-header>
    <app-page-state [state]="home.state()" [refreshError]="home.refreshError()" (retry)="reload()">
      @if (account(); as account) {
        <h2 class="page-title mb-6">{{ account.name }}</h2>
        <div class="flex flex-wrap gap-2 mb-6">
          <button hlmBtn variant="destructive" [disabled]="busy()" (click)="leaveOrClose()">
            {{ (account.role === 'Owner' ? 'closeOrganization' : 'leaveOrganization') | t }}
          </button>
        </div>
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'organizationMembers' | t }}</h2>
            <p hlmCardDescription>{{ 'customer.' + account.role | t }}</p>
          </div>
          <div hlmCardContent>
            <app-page-state
              [state]="members.state()"
              [refreshError]="members.refreshError()"
              (retry)="loadMembers()"
            >
              <app-data-table
                [columns]="columns()"
                [data]="members.value()?.items ?? []"
                [loading]="members.refreshing()"
                [emptyText]="'noResults' | t"
                [loadingText]="'loading' | t"
                [sortColumn]="query.text('sort', 'name')"
                [sortDirection]="query.direction('asc')"
                (sortChange)="sort($event)"
              />
              <app-list-pager
                [total]="members.value()?.total ?? 0"
                [page]="query.page"
                [size]="pageSize()"
                [showSizePicker]="true"
                (pageChange)="query.set({ page: $event })"
                (sizeChange)="query.set({ size: $event, page: 1 })"
              />
            </app-page-state>
          </div>
        </section>
        @if (account.role !== 'Member') {
          <section hlmCard class="mb-6">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'inviteMember' | t }}</h2>
              <p hlmCardDescription>{{ 'inviteMemberHelp' | t }}</p>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="invite()" #inviteForm="ngForm">
              <div hlmField>
                <label hlmFieldLabel for="member-email">{{ 'email' | t }}</label
                ><input
                  hlmInput
                  type="email"
                  email
                  id="member-email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  maxlength="256"
                />
              </div>
              <div hlmField>
                <label hlmFieldLabel for="member-role">{{ 'role' | t }}</label
                ><hlm-select name="role" [(ngModel)]="role"
                  ><hlm-select-trigger buttonId="member-role"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal
                    ><hlm-select-item value="Member">{{ 'customer.Member' | t }}</hlm-select-item>
                    @if (account.role === 'Owner') {
                      <hlm-select-item value="Admin">{{ 'customer.Admin' | t }}</hlm-select-item>
                    }
                  </hlm-select-content></hlm-select
                >
              </div>
              <button hlmBtn [disabled]="busy() || inviteForm.invalid">
                {{ 'inviteMember' | t }}
              </button>
            </form>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'organizationName' | t }}</h2>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="rename()" #renameForm="ngForm">
              <div hlmField>
                <label hlmFieldLabel for="rename-organization">{{ 'organizationName' | t }}</label
                ><input
                  hlmInput
                  id="rename-organization"
                  name="name"
                  [(ngModel)]="name"
                  required
                  maxlength="120"
                />
              </div>
              <button hlmBtn [disabled]="busy() || renameForm.invalid || !name.trim()">
                {{ 'save' | t }}
              </button>
            </form>
          </section>
        }
      } @else {
        <div hlmAlert>
          <p hlmAlertDescription>{{ 'customers.not_found' | t }}</p>
        </div>
      }
    </app-page-state>`,
            }]
    }], () => [], { beforeUnload: [{
            type: HostListener,
            args: ['window:beforeunload', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(OrganizationDetailPage, { className: "OrganizationDetailPage", filePath: "src/app/features/organization-detail.ts", lineNumber: 158 }); })();
