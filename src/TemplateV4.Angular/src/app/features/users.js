import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, DebouncedSearch, protectUnload, Confirmations, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, } from '../shared/workspace';
import { DataTable } from '../shared/data-table';
import { RecordStatus, RecordUserIdentity } from '../shared/workspace-cells';
import { UserDetailPage } from './user-detail';
import { PeopleNav } from '../shared/people-nav';
import { InvitationDrawer } from './invite-user';
import { InvitationsPanel } from './invitations';
import { RolesPanel } from './roles';
import { AccountSecurityPanel } from './account-security';
import { PrivacyRequestsPage } from './privacy-requests';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@ng-icons/core";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/badge";
import * as i7 from "@spartan-ng/helm/field";
import * as i8 from "@spartan-ng/helm/input";
import * as i9 from "@spartan-ng/helm/tabs";
import * as i10 from "@spartan-ng/helm/drawer";
import * as i11 from "@spartan-ng/helm/select";
import * as i12 from "../core/i18n";
const _c0 = () => [];
function UsersPage_Conditional_2_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-invitation-drawer", 29);
    i0.ɵɵlistener("invited", function UsersPage_Conditional_2_Conditional_12_Template_app_invitation_drawer_invited_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.load()); });
    i0.ɵɵelementEnd();
} }
function UsersPage_Conditional_2_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 22);
    i0.ɵɵtext(1, "1");
    i0.ɵɵelementEnd();
} }
function UsersPage_Conditional_2_hlm_drawer_content_51_hlm_select_content_16_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 45);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const role_r5 = ctx.$implicit;
    i0.ɵɵproperty("value", role_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(role_r5);
} }
function UsersPage_Conditional_2_hlm_drawer_content_51_hlm_select_content_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 43);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 44);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(5, UsersPage_Conditional_2_hlm_drawer_content_51_hlm_select_content_16_For_6_Template, 2, 2, "hlm-select-item", 45, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 2, "role"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "allRoles"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.data.value()?.roles ?? i0.ɵɵpureFunction0(6, _c0));
} }
function UsersPage_Conditional_2_hlm_drawer_content_51_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-drawer-content", 30)(1, "hlm-drawer-header")(2, "h2", 31);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 32);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 33)(9, "div", 34)(10, "label", 35);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "hlm-select", 36);
    i0.ɵɵlistener("valueChange", function UsersPage_Conditional_2_hlm_drawer_content_51_Template_hlm_select_valueChange_13_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.roleDraft.set($event ?? "all")); });
    i0.ɵɵelementStart(14, "hlm-select-trigger", 37);
    i0.ɵɵelement(15, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(16, UsersPage_Conditional_2_hlm_drawer_content_51_hlm_select_content_16_Template, 7, 7, "hlm-select-content", 38);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p", 39);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(20, "hlm-drawer-footer")(21, "button", 40);
    i0.ɵɵlistener("click", function UsersPage_Conditional_2_hlm_drawer_content_51_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.applyFilters()); });
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "button", 41);
    i0.ɵɵlistener("click", function UsersPage_Conditional_2_hlm_drawer_content_51_Template_button_click_24_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.clearFilters()); });
    i0.ɵɵelement(25, "ng-icon", 42);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 10, "filters"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 12, "roleFilterHelp"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 14, "role"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r2.roleDraft())("itemToString", ctx_r2.roleLabel);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 16, "roleFilterHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", !ctx_r2.filtersChanged());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(23, 18, "applyFilters"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r2.hasFilters());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 20, "clearFilters"), " ");
} }
function UsersPage_Conditional_2_hlm_drawer_content_57_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-user-detail", 48);
    i0.ɵɵlistener("saved", function UsersPage_Conditional_2_hlm_drawer_content_57_Conditional_9_Template_app_user_detail_saved_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.load()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("userId", ctx.id)("embedded", true);
} }
function UsersPage_Conditional_2_hlm_drawer_content_57_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-drawer-content", 46)(1, "hlm-drawer-header")(2, "h2", 31);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 32);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 33);
    i0.ɵɵconditionalCreate(9, UsersPage_Conditional_2_hlm_drawer_content_57_Conditional_9_Template, 1, 2, "app-user-detail", 47);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "hlm-drawer-footer")(11, "button", 41);
    i0.ɵɵlistener("click", function UsersPage_Conditional_2_hlm_drawer_content_57_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeDetails()); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "personDetails"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 7, "personDetailsHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_4_0 = ctx_r2.selectedUser()) ? 9 : -1, tmp_4_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.detailsBusy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 9, "close"), " ");
} }
function UsersPage_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 2)(1, "div", 3)(2, "div")(3, "h2", 4);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 5);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵpipe(9, "t");
    i0.ɵɵpipe(10, "t");
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(12, UsersPage_Conditional_2_Conditional_12_Template, 1, 0, "app-invitation-drawer");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 6)(14, "div", 7)(15, "hlm-tabs", 8);
    i0.ɵɵlistener("tabActivated", function UsersPage_Conditional_2_Template_hlm_tabs_tabActivated_15_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setStatus($event)); });
    i0.ɵɵelementStart(16, "hlm-tabs-list", 9);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵelementStart(18, "button", 10);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "t");
    i0.ɵɵelementStart(21, "span", 11);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "button", 12);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "t");
    i0.ɵɵelementStart(26, "span", 11);
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "button", 13);
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "t");
    i0.ɵɵelementStart(31, "span", 11);
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "button", 14);
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "t");
    i0.ɵɵelementStart(36, "span", 11);
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(38, "div", 15)(39, "div", 16)(40, "label", 17);
    i0.ɵɵtext(41);
    i0.ɵɵpipe(42, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "input", 18);
    i0.ɵɵpipe(44, "t");
    i0.ɵɵlistener("ngModelChange", function UsersPage_Conditional_2_Template_input_ngModelChange_43_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.search.update($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "hlm-drawer", 19);
    i0.ɵɵlistener("stateChanged", function UsersPage_Conditional_2_Template_hlm_drawer_stateChanged_45_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setFiltersOpen($event === "open")); });
    i0.ɵɵelementStart(46, "button", 20);
    i0.ɵɵelement(47, "ng-icon", 21);
    i0.ɵɵtext(48);
    i0.ɵɵpipe(49, "t");
    i0.ɵɵconditionalCreate(50, UsersPage_Conditional_2_Conditional_50_Template, 2, 0, "span", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(51, UsersPage_Conditional_2_hlm_drawer_content_51_Template, 28, 22, "hlm-drawer-content", 23);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(52, "app-page-state", 24);
    i0.ɵɵlistener("retry", function UsersPage_Conditional_2_Template_app_page_state_retry_52_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.load()); });
    i0.ɵɵelementStart(53, "app-data-table", 25);
    i0.ɵɵpipe(54, "t");
    i0.ɵɵlistener("rowAction", function UsersPage_Conditional_2_Template_app_data_table_rowAction_53_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openDetails($event)); })("sortChange", function UsersPage_Conditional_2_Template_app_data_table_sortChange_53_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.sort($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(55, "app-list-pager", 26);
    i0.ɵɵlistener("pageChange", function UsersPage_Conditional_2_Template_app_list_pager_pageChange_55_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.query.set({ page: $event })); })("sizeChange", function UsersPage_Conditional_2_Template_app_list_pager_sizeChange_55_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.setPageSize($event)); });
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(56, "hlm-drawer", 27);
    i0.ɵɵlistener("stateChanged", function UsersPage_Conditional_2_Template_hlm_drawer_stateChanged_56_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView($event === "closed" && ctx_r2.closeDetails()); });
    i0.ɵɵtemplate(57, UsersPage_Conditional_2_hlm_drawer_content_57_Template, 14, 11, "hlm-drawer-content", 28);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 43, "directory"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate8(" ", ctx_r2.i18n.number(ctx_r2.directoryTotal()), " ", i0.ɵɵpipeBind1(8, 45, "users"), " \u00B7 ", ctx_r2.i18n.number(ctx_r2.data.value()?.active ?? 0), " ", i0.ɵɵpipeBind1(9, 47, "active"), " \u00B7 ", ctx_r2.i18n.number(ctx_r2.data.value()?.invited ?? 0), " ", i0.ɵɵpipeBind1(10, 49, "invited"), " \u00B7 ", ctx_r2.i18n.number(ctx_r2.data.value()?.disabled ?? 0), " ", i0.ɵɵpipeBind1(11, 51, "disabled"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r2.auth.has("users.manage") ? 12 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("tab", ctx_r2.statusFilter());
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(17, 53, "userStatusFilter"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 55, "all"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.i18n.number(ctx_r2.directoryTotal()));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(25, 57, "active"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.i18n.number(ctx_r2.data.value()?.active ?? 0));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(30, 59, "invited"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.i18n.number(ctx_r2.data.value()?.invited ?? 0));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(35, 61, "disabled"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.i18n.number(ctx_r2.data.value()?.disabled ?? 0));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(42, 63, "search"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r2.search.value())("placeholder", i0.ɵɵpipeBind1(44, 65, "peopleSearch"));
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("state", ctx_r2.filtersOpen() ? "open" : "closed");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(49, 67, "filters"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.roleFilter() ? 50 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("state", ctx_r2.data.state())("refreshError", ctx_r2.data.refreshError());
    i0.ɵɵadvance();
    i0.ɵɵproperty("columns", ctx_r2.columns())("rowActionLabel", ctx_r2.detailsLabel)("data", ctx_r2.data.value()?.items ?? i0.ɵɵpureFunction0(71, _c0))("loading", ctx_r2.data.state() === "loading" || ctx_r2.data.refreshing())("loadingText", i0.ɵɵpipeBind1(54, 69, "loading"))("emptyText", ctx_r2.emptyText())("sortColumn", ctx_r2.query.text("sort", "username"))("sortDirection", ctx_r2.query.direction("asc"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("page", ctx_r2.query.page)("total", ctx_r2.data.value()?.total ?? 0)("size", ctx_r2.pageSize())("showSizePicker", true)("busy", ctx_r2.data.refreshing());
    i0.ɵɵadvance();
    i0.ɵɵproperty("state", ctx_r2.selectedUser() ? "open" : "closed")("disableClose", ctx_r2.detailsBusy() || (ctx_r2.detailEditor()?.hasUnsavedChanges() ?? false));
} }
function UsersPage_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-invitations-panel");
} }
function UsersPage_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-account-security-panel");
} }
function UsersPage_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-privacy-requests");
} }
function UsersPage_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-roles-panel");
} }
const column = createColumnHelper();
export class UsersPage {
    auth = inject(Auth);
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    data = new Resource();
    query = new ListQuery();
    search = new DebouncedSearch(this.query);
    filtersOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtersOpen" }] : /* istanbul ignore next */ []));
    roleDraft = signal('all', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "roleDraft" }] : /* istanbul ignore next */ []));
    selectedUser = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedUser" }] : /* istanbul ignore next */ []));
    detailEditor = viewChild(UserDetailPage, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "detailEditor" }] : /* istanbul ignore next */ []));
    detailsBusy = computed(() => this.detailEditor()?.busy() ?? false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "detailsBusy" }] : /* istanbul ignore next */ []));
    confirm = inject(Confirmations);
    route = inject(ActivatedRoute);
    router = inject(Router);
    detailsLabel = (user) => `${this.i18n.text('personDetails')}: ${user.username || user.displayName}`;
    roleLabel = (role) => (role === 'all' ? this.i18n.text('allRoles') : role);
    emptyText = computed(() => this.hasFilters() ? this.i18n.text('peopleFilteredEmpty') : this.i18n.text('peopleEmpty'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyText" }] : /* istanbul ignore next */ []));
    invitationDrawer = viewChild(InvitationDrawer, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "invitationDrawer" }] : /* istanbul ignore next */ []));
    invitationsPanel = viewChild(InvitationsPanel, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "invitationsPanel" }] : /* istanbul ignore next */ []));
    rolesPanel = viewChild(RolesPanel, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rolesPanel" }] : /* istanbul ignore next */ []));
    securityPanel = viewChild(AccountSecurityPanel, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "securityPanel" }] : /* istanbul ignore next */ []));
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor('username', {
                header: this.i18n.text('user'),
                cell: ({ row }) => flexRenderComponent(RecordUserIdentity, {
                    inputs: {
                        username: row.original.username || row.original.email,
                        displayName: row.original.displayName,
                    },
                }),
            }),
            column.accessor('email', { header: this.i18n.text('email') }),
            column.accessor('roles', {
                header: this.i18n.text('roles'),
                cell: (c) => c.getValue().join(', ') || '—',
            }),
            column.accessor('status', {
                header: this.i18n.text('status'),
                cell: ({ row }) => flexRenderComponent(RecordStatus, {
                    inputs: { value: row.original.status ?? 'Active', danger: row.original.disabled },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        if (this.section() === 'users')
            this.query.connect(() => {
                this.search.sync(this.query.text('search'));
                void this.load();
            }, ['search', 'page', 'size', 'status', 'role', 'sort', 'direction']);
    }
    section() {
        return this.route.snapshot.data['section'];
    }
    async setSection(section) {
        const paths = {
            users: '/administration/users',
            invitations: '/administration/users/invitations',
            roles: '/administration/users/roles',
            security: '/administration/users/account-security',
            privacy: '/administration/users/privacy-requests',
        };
        const path = paths[section];
        if (!path || section === this.section())
            return;
        await this.router.navigate([path], {
            queryParams: { section: null },
            queryParamsHandling: 'merge',
        });
    }
    async load() {
        const params = {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            search: this.query.text('search'),
            status: this.statusFilter(),
            sort: this.query.text('sort', 'username'),
            direction: this.query.direction('asc'),
        };
        const role = this.roleFilter();
        if (role)
            params['role'] = role;
        const loaded = await this.data.load((signal) => this.api.get('/users', params, signal));
        if (loaded)
            this.query.clamp(this.data.value()?.total, this.pageSize());
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    directoryTotal() {
        const value = this.data.value();
        return value ? (value.active ?? 0) + (value.invited ?? 0) + (value.disabled ?? 0) : 0;
    }
    statusFilter() {
        const status = this.query.text('status', 'all');
        return ['all', 'Active', 'Invited', 'Disabled'].includes(status) ? status : 'all';
    }
    roleFilter() {
        return this.query.text('role');
    }
    pageSize() {
        const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
        return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
    }
    hasFilters() {
        return !!this.search.value() || this.statusFilter() !== 'all' || !!this.roleFilter();
    }
    setStatus(status) {
        void this.query.set({ status: status === 'all' ? null : status, page: 1 });
    }
    setRole(role) {
        void this.query.set({ role: !role || role === 'all' ? null : role, page: 1 });
    }
    setFiltersOpen(open) {
        if (open)
            this.roleDraft.set(this.roleFilter() || 'all');
        this.filtersOpen.set(open);
    }
    filtersChanged() {
        return this.roleDraft() !== (this.roleFilter() || 'all');
    }
    applyFilters() {
        this.filtersOpen.set(false);
        this.setRole(this.roleDraft());
    }
    setPageSize(size) {
        void this.query.set({ size, page: 1 });
    }
    clearFilters() {
        this.roleDraft.set('all');
        this.search.update('');
        void this.query.set({ search: null, status: null, role: null, page: 1 });
    }
    hasUnsavedChanges() {
        return ((this.invitationDrawer()?.hasUnsavedChanges() ?? false) ||
            (this.detailEditor()?.hasUnsavedChanges() ?? false) ||
            this.detailsBusy() ||
            (this.invitationsPanel()?.hasUnsavedChanges() ?? false) ||
            (this.rolesPanel()?.hasUnsavedChanges() ?? false) ||
            (this.securityPanel()?.hasUnsavedChanges() ?? false) ||
            (this.securityPanel()?.busy() ?? false));
    }
    openDetails(user) {
        this.selectedUser.set(user);
    }
    async closeDetails() {
        if (this.detailsBusy())
            return;
        if (this.detailEditor()?.hasUnsavedChanges() &&
            !(await this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges')))
            return;
        this.selectedUser.set(null);
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    static ɵfac = function UsersPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UsersPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: UsersPage, selectors: [["app-users"]], viewQuery: function UsersPage_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.detailEditor, UserDetailPage, 5)(ctx.invitationDrawer, InvitationDrawer, 5)(ctx.invitationsPanel, InvitationsPanel, 5)(ctx.rolesPanel, RolesPanel, 5)(ctx.securityPanel, AccountSecurityPanel, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(5);
        } }, hostBindings: function UsersPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function UsersPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 7, vars: 3, consts: [["title", "userManagement", "eyebrow", "administration", 3, "description"], [3, "sectionChange", "section"], ["hlmCard", "", 1, "workspace-directory-panel"], ["hlmCardHeader", "", 1, "flex", "flex-col", "gap-4", "sm:flex-row", "sm:items-start", "sm:justify-between"], ["hlmCardTitle", ""], ["hlmCardDescription", "", "aria-live", "polite"], ["hlmCardContent", ""], [1, "workspace-directory-controls"], [1, "workspace-directory-tabs", 3, "tabActivated", "tab"], [1, "flex-wrap"], ["hlmTabsTrigger", "all"], ["hlmBadge", "", "variant", "secondary"], ["hlmTabsTrigger", "Active"], ["hlmTabsTrigger", "Invited"], ["hlmTabsTrigger", "Disabled"], [1, "workspace-directory-toolbar"], ["hlmField", "", 1, "min-w-0", "flex-1", "sm:max-w-sm"], ["hlmFieldLabel", "", "for", "user-search", 1, "sr-only"], ["hlmInput", "", "id", "user-search", "maxlength", "120", 3, "ngModelChange", "ngModel", "placeholder"], ["direction", "right", 3, "stateChanged", "state"], ["hlmBtn", "", "hlmDrawerTrigger", "", "type", "button", "variant", "outline"], ["name", "lucideFunnel", "aria-hidden", "true"], ["hlmBadge", "", "variant", "counter"], ["class", "overflow-hidden sm:max-w-md", 4, "hlmDrawerPortal"], [3, "retry", "state", "refreshError"], [3, "rowAction", "sortChange", "columns", "rowActionLabel", "data", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "page", "total", "size", "showSizePicker", "busy"], ["direction", "right", 3, "stateChanged", "state", "disableClose"], ["class", "overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl", 4, "hlmDrawerPortal"], [3, "invited"], [1, "overflow-hidden", "sm:max-w-md"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], ["hlmDrawerBody", "", 1, "min-h-0", "flex-1", "overflow-y-auto"], ["hlmField", "", 1, "w-full"], ["hlmFieldLabel", "", "for", "user-role-filter"], [1, "w-full", 3, "valueChange", "value", "itemToString"], ["buttonId", "user-role-filter", 1, "w-full"], [3, "ariaLabel", 4, "hlmSelectPortal"], ["hlmFieldDescription", ""], ["hlmBtn", "", "type", "button", 3, "click", "disabled"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click", "disabled"], ["name", "lucideFunnelX", "aria-hidden", "true"], [3, "ariaLabel"], ["value", "all"], [3, "value"], [1, "overflow-hidden", "data-[vaul-drawer-direction=right]:w-full", "data-[vaul-drawer-direction=right]:sm:max-w-2xl"], [3, "userId", "embedded"], [3, "saved", "userId", "embedded"]], template: function UsersPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 0);
            i0.ɵɵelementStart(1, "app-people-nav", 1);
            i0.ɵɵlistener("sectionChange", function UsersPage_Template_app_people_nav_sectionChange_1_listener($event) { return ctx.setSection($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(2, UsersPage_Conditional_2_Template, 58, 72)(3, UsersPage_Conditional_3_Template, 1, 0, "app-invitations-panel")(4, UsersPage_Conditional_4_Template, 1, 0, "app-account-security-panel")(5, UsersPage_Conditional_5_Template, 1, 0, "app-privacy-requests")(6, UsersPage_Conditional_6_Template, 1, 0, "app-roles-panel");
        } if (rf & 2) {
            i0.ɵɵproperty("description", ctx.section() === "privacy" ? "privacyRequestsIntro" : "peopleIntro");
            i0.ɵɵadvance();
            i0.ɵɵproperty("section", ctx.section());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.section() === "users" ? 2 : ctx.section() === "invitations" ? 3 : ctx.section() === "security" ? 4 : ctx.section() === "privacy" ? 5 : 6);
        } }, dependencies: [i1.PageHeader, i1.PageState, i1.ListPager, i2.FormsModule, i2.DefaultValueAccessor, i2.NgControlStatus, i2.MaxLengthValidator, i2.NgModel, i3.NgIcon, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmBadge, i7.HlmField, i7.HlmFieldDescription, i7.HlmFieldLabel, i8.HlmInput, i9.HlmTabs, i9.HlmTabsList, i9.HlmTabsTrigger, DataTable,
            PeopleNav, i10.HlmDrawer, i10.HlmDrawerBody, i10.HlmDrawerContent, i10.HlmDrawerDescription, i10.HlmDrawerFooter, i10.HlmDrawerHeader, i10.HlmDrawerPortal, i10.HlmDrawerTitle, i10.HlmDrawerTrigger, i11.HlmSelect, i11.HlmSelectContent, i11.HlmSelectItem, i11.HlmSelectPortal, i11.HlmSelectTrigger, i11.HlmSelectValue, InvitationDrawer,
            InvitationsPanel,
            RolesPanel,
            AccountSecurityPanel,
            PrivacyRequestsPage,
            UserDetailPage, i12.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UsersPage, [{
        type: Component,
        args: [{
                selector: 'app-users',
                imports: [
                    WorkspaceUi,
                    DataTable,
                    PeopleNav,
                    HlmDrawerImports,
                    HlmSelectImports,
                    InvitationDrawer,
                    InvitationsPanel,
                    RolesPanel,
                    AccountSecurityPanel,
                    PrivacyRequestsPage,
                    UserDetailPage,
                ],
                providers: [workspaceIcons],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: ` <app-page-header
      title="userManagement"
      [description]="section() === 'privacy' ? 'privacyRequestsIntro' : 'peopleIntro'"
      eyebrow="administration"
    />
    <app-people-nav [section]="section()" (sectionChange)="setSection($event)" />
    @if (section() === 'users') {
      <section hlmCard class="workspace-directory-panel">
        <div
          hlmCardHeader
          class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h2 hlmCardTitle>{{ 'directory' | t }}</h2>
            <p hlmCardDescription aria-live="polite">
              {{ i18n.number(directoryTotal()) }} {{ 'users' | t }} ·
              {{ i18n.number(data.value()?.active ?? 0) }} {{ 'active' | t }} ·
              {{ i18n.number(data.value()?.invited ?? 0) }} {{ 'invited' | t }} ·
              {{ i18n.number(data.value()?.disabled ?? 0) }} {{ 'disabled' | t }}
            </p>
          </div>
          @if (auth.has('users.manage')) {
            <app-invitation-drawer (invited)="load()" />
          }
        </div>
        <div hlmCardContent>
          <div class="workspace-directory-controls">
            <hlm-tabs
              [tab]="statusFilter()"
              (tabActivated)="setStatus($event)"
              class="workspace-directory-tabs"
            >
              <hlm-tabs-list [attr.aria-label]="'userStatusFilter' | t" class="flex-wrap">
                <button hlmTabsTrigger="all">
                  {{ 'all' | t }}
                  <span hlmBadge variant="secondary">{{ i18n.number(directoryTotal()) }}</span>
                </button>
                <button hlmTabsTrigger="Active">
                  {{ 'active' | t }}
                  <span hlmBadge variant="secondary">{{
                    i18n.number(data.value()?.active ?? 0)
                  }}</span>
                </button>
                <button hlmTabsTrigger="Invited">
                  {{ 'invited' | t }}
                  <span hlmBadge variant="secondary">{{
                    i18n.number(data.value()?.invited ?? 0)
                  }}</span>
                </button>
                <button hlmTabsTrigger="Disabled">
                  {{ 'disabled' | t }}
                  <span hlmBadge variant="secondary">{{
                    i18n.number(data.value()?.disabled ?? 0)
                  }}</span>
                </button>
              </hlm-tabs-list>
            </hlm-tabs>
            <div class="workspace-directory-toolbar">
              <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
                <label hlmFieldLabel class="sr-only" for="user-search">{{ 'search' | t }}</label>
                <input
                  hlmInput
                  id="user-search"
                  [ngModel]="search.value()"
                  (ngModelChange)="search.update($event)"
                  maxlength="120"
                  [placeholder]="'peopleSearch' | t"
                />
              </div>
              <hlm-drawer
                direction="right"
                [state]="filtersOpen() ? 'open' : 'closed'"
                (stateChanged)="setFiltersOpen($event === 'open')"
              >
                <button hlmBtn hlmDrawerTrigger type="button" variant="outline">
                  <ng-icon name="lucideFunnel" aria-hidden="true" />
                  {{ 'filters' | t }}
                  @if (roleFilter()) {
                    <span hlmBadge variant="counter">1</span>
                  }
                </button>
                <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                  <hlm-drawer-header>
                    <h2 hlmDrawerTitle>{{ 'filters' | t }}</h2>
                    <p hlmDrawerDescription>{{ 'roleFilterHelp' | t }}</p>
                  </hlm-drawer-header>
                  <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                    <div hlmField class="w-full">
                      <label hlmFieldLabel for="user-role-filter">{{ 'role' | t }}</label>
                      <hlm-select
                        class="w-full"
                        [value]="roleDraft()"
                        [itemToString]="roleLabel"
                        (valueChange)="roleDraft.set($event ?? 'all')"
                      >
                        <hlm-select-trigger buttonId="user-role-filter" class="w-full">
                          <hlm-select-value />
                        </hlm-select-trigger>
                        <hlm-select-content *hlmSelectPortal [ariaLabel]="'role' | t">
                          <hlm-select-item value="all">{{ 'allRoles' | t }}</hlm-select-item>
                          @for (role of data.value()?.roles ?? []; track role) {
                            <hlm-select-item [value]="role">{{ role }}</hlm-select-item>
                          }
                        </hlm-select-content>
                      </hlm-select>
                      <p hlmFieldDescription>{{ 'roleFilterHelp' | t }}</p>
                    </div>
                  </div>
                  <hlm-drawer-footer>
                    <button
                      hlmBtn
                      type="button"
                      [disabled]="!filtersChanged()"
                      (click)="applyFilters()"
                    >
                      {{ 'applyFilters' | t }}
                    </button>
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      [disabled]="!hasFilters()"
                      (click)="clearFilters()"
                    >
                      <ng-icon name="lucideFunnelX" aria-hidden="true" />
                      {{ 'clearFilters' | t }}
                    </button>
                  </hlm-drawer-footer>
                </hlm-drawer-content>
              </hlm-drawer>
            </div>
          </div>
          <app-page-state
            [state]="data.state()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
            ><app-data-table
              [columns]="columns()"
              [rowActionLabel]="detailsLabel"
              (rowAction)="openDetails($event)"
              [data]="data.value()?.items ?? []"
              [loading]="data.state() === 'loading' || data.refreshing()"
              [loadingText]="'loading' | t"
              [emptyText]="emptyText()"
              [sortColumn]="query.text('sort', 'username')"
              [sortDirection]="query.direction('asc')"
              (sortChange)="sort($event)" /><app-list-pager
              [page]="query.page"
              [total]="data.value()?.total ?? 0"
              [size]="pageSize()"
              [showSizePicker]="true"
              [busy]="data.refreshing()"
              (pageChange)="query.set({ page: $event })"
              (sizeChange)="setPageSize($event)"
          /></app-page-state>
        </div>
      </section>
      <hlm-drawer
        direction="right"
        [state]="selectedUser() ? 'open' : 'closed'"
        [disableClose]="detailsBusy() || (detailEditor()?.hasUnsavedChanges() ?? false)"
        (stateChanged)="$event === 'closed' && closeDetails()"
      >
        <hlm-drawer-content
          *hlmDrawerPortal
          class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl"
        >
          <hlm-drawer-header>
            <h2 hlmDrawerTitle>{{ 'personDetails' | t }}</h2>
            <p hlmDrawerDescription>{{ 'personDetailsHelp' | t }}</p>
          </hlm-drawer-header>
          <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
            @if (selectedUser(); as user) {
              <app-user-detail [userId]="user.id" [embedded]="true" (saved)="load()" />
            }
          </div>
          <hlm-drawer-footer>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="detailsBusy()"
              (click)="closeDetails()"
            >
              {{ 'close' | t }}
            </button>
          </hlm-drawer-footer>
        </hlm-drawer-content>
      </hlm-drawer>
    } @else if (section() === 'invitations') {
      <app-invitations-panel />
    } @else if (section() === 'security') {
      <app-account-security-panel />
    } @else if (section() === 'privacy') {
      <app-privacy-requests />
    } @else {
      <app-roles-panel />
    }`,
            }]
    }], () => [], { detailEditor: [{ type: i0.ViewChild, args: [i0.forwardRef(() => UserDetailPage), { isSignal: true }] }], invitationDrawer: [{ type: i0.ViewChild, args: [i0.forwardRef(() => InvitationDrawer), { isSignal: true }] }], invitationsPanel: [{ type: i0.ViewChild, args: [i0.forwardRef(() => InvitationsPanel), { isSignal: true }] }], rolesPanel: [{ type: i0.ViewChild, args: [i0.forwardRef(() => RolesPanel), { isSignal: true }] }], securityPanel: [{ type: i0.ViewChild, args: [i0.forwardRef(() => AccountSecurityPanel), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(UsersPage, { className: "UsersPage", filePath: "src/app/features/users.ts", lineNumber: 247 }); })();
