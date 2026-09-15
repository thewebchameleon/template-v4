import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { WorkspaceUi, workspaceIcons, Resource, Confirmations, protectUnload, } from '../../shared/workspace';
import { Breadcrumbs } from '../../shared/breadcrumbs';
import { WorkspaceApi } from '../../core/workspace-api';
import { Runtime } from '../../core/runtime';
import { Features } from '../../core/features';
import { Auth } from '../../core/auth';
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
import * as i10 from "@spartan-ng/helm/switch";
import * as i11 from "../../core/i18n";
const _c0 = () => [];
const _c1 = a0 => ["/administration/users", a0, "my-files"];
const _c2 = (a0, a1) => ({ subjectId: a0, subjectName: a1 });
const _forTrack0 = ($index, $item) => $item.id;
function UserDetailPage_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "app-page-header", 0)(1, "a", 3);
    i0.ɵɵelement(2, "ng-icon", 4);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "users"));
} }
function UserDetailPage_Conditional_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(4, _c1, detail_r2.user.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "manageUserFiles"));
} }
function UserDetailPage_Conditional_2_For_17_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 14)(1, "hlm-checkbox", 25);
    i0.ɵɵlistener("checkedChange", function UserDetailPage_Conditional_2_For_17_Template_hlm_checkbox_checkedChange_1_listener($event) { const role_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.toggle(role_r5.name, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "label", 26);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const role_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("inputId", "role-" + role_r5.id)("checked", ctx_r2.roles().includes(role_r5.name))("disabled", !ctx_r2.editable() || !ctx_r2.canAssign(role_r5.permissions) || ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", "role-" + role_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(role_r5.name);
} }
function UserDetailPage_Conditional_2_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "p", 27);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 28);
    i0.ɵɵlistener("click", function UserDetailPage_Conditional_2_Conditional_18_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.load()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "loadFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "retry"), " ");
} }
function UserDetailPage_Conditional_2_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 18);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "accessReadOnly"));
} }
function UserDetailPage_Conditional_2_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 19)(1, "p", 27);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 28);
    i0.ɵɵlistener("click", function UserDetailPage_Conditional_2_Conditional_25_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.reloadDraft()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "draftConflict"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "discardDraft"), " ");
} }
function UserDetailPage_Conditional_2_For_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "p", 29);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 18);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const permission_r8 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "permission." + permission_r8));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.sources(permission_r8));
} }
function UserDetailPage_Conditional_2_ForEmpty_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 18);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "noAdministrativePermissions"));
} }
function UserDetailPage_Conditional_2_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24)(1, "a", 30);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const detail_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction2(4, _c2, detail_r2.user.id, detail_r2.user.displayName));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "viewAudit"));
} }
function UserDetailPage_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "section", 5)(2, "div", 6)(3, "h2", 7);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 8);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, UserDetailPage_Conditional_2_Conditional_7_Template, 3, 6, "a", 9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "form", 10);
    i0.ɵɵlistener("ngSubmit", function UserDetailPage_Conditional_2_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.save()); });
    i0.ɵɵelementStart(9, "fieldset", 11)(10, "legend", 12);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "p", 13);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(16, UserDetailPage_Conditional_2_For_17_Template, 4, 5, "div", 14, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, UserDetailPage_Conditional_2_Conditional_18_Template, 7, 6, "div", 15);
    i0.ɵɵelementStart(19, "div", 14)(20, "hlm-switch", 16);
    i0.ɵɵlistener("checkedChange", function UserDetailPage_Conditional_2_Template_hlm_switch_checkedChange_20_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.disabled.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "label", 17);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(24, UserDetailPage_Conditional_2_Conditional_24_Template, 3, 3, "p", 18);
    i0.ɵɵconditionalCreate(25, UserDetailPage_Conditional_2_Conditional_25_Template, 7, 6, "div", 19);
    i0.ɵɵelementStart(26, "div")(27, "button", 20);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(30, "section", 5)(31, "div", 6)(32, "h2", 21);
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "p", 22);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(38, "div", 23);
    i0.ɵɵrepeaterCreate(39, UserDetailPage_Conditional_2_For_40_Template, 6, 4, "div", null, i0.ɵɵrepeaterTrackByIdentity, false, UserDetailPage_Conditional_2_ForEmpty_41_Template, 3, 3, "p", 18);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(42, UserDetailPage_Conditional_2_Conditional_42_Template, 4, 7, "div", 24);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const detail_r2 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassMap(ctx_r2.embedded() ? "grid min-w-0 grid-cols-1 gap-4" : "workspace-columns");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(detail_r2.user.displayName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(detail_r2.user.email);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.auth.has("settings.manage") && ctx_r2.features.enabled("my-files") ? 7 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 19, "roles"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 21, "assignmentHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.catalog.value()?.roles.items ?? i0.ɵɵpureFunction0(31, _c0));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.catalog.state() === "error" ? 18 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r2.disabled())("disabled", !ctx_r2.editable() || ctx_r2.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 23, "disabled"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r2.editable() ? 24 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.conflict() ? 25 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy() || !ctx_r2.editable() || !ctx_r2.hasUnsavedChanges() || ctx_r2.conflict());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(29, 25, "saveAccess"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 27, "effectivePermissions"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 29, "effectivePermissionsHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(detail_r2.effectivePermissions);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.auth.has("settings.manage") ? 42 : -1);
} }
export class UserDetailPage {
    userId = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "userId" }] : /* istanbul ignore next */ []));
    embedded = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "embedded" }] : /* istanbul ignore next */ []));
    saved = output();
    api = inject(WorkspaceApi);
    auth = inject(Auth);
    features = inject(Features);
    data = new Resource();
    catalog = new Resource();
    roles = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "roles" }] : /* istanbul ignore next */ []));
    disabled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    conflict = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conflict" }] : /* istanbul ignore next */ []));
    route = inject(ActivatedRoute);
    id = computed(() => this.userId() ?? this.route.snapshot.paramMap.get('id'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "id" }] : /* istanbul ignore next */ []));
    http = inject(HttpClient);
    runtime = inject(Runtime);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    breadcrumbs = inject(Breadcrumbs);
    editable = computed(() => this.auth.has('users.manage') &&
        this.auth.access()?.userId !== this.id() &&
        this.catalog.state() === 'ready' &&
        (this.data.value()?.effectivePermissions.every((p) => this.auth.has(p)) ?? false), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editable" }] : /* istanbul ignore next */ []));
    ngOnInit() {
        void this.load();
    }
    async load() {
        const [loaded] = await Promise.all([
            this.data.load((signal) => this.api.get('/users/' + this.id(), {}, signal)),
            this.catalog.load((signal) => this.api.get('/roles', { pageSize: 100 }, signal)),
        ]);
        const value = this.data.value();
        if (value && loaded) {
            this.roles.set([...value.user.roles]);
            this.disabled.set(value.user.disabled);
            this.conflict.set(false);
            if (!this.embedded())
                this.breadcrumbs.set([
                    { label: 'administration', link: '/administration' },
                    { label: 'userManagement', link: '/administration/users' },
                    { label: value.user.displayName },
                ]);
        }
    }
    sources(permission) {
        return (this.data
            .value()
            ?.roles.filter((r) => r.permissions.includes(permission))
            .map((r) => r.name)
            .join(', ') ?? '');
    }
    canAssign(permissions) {
        return permissions.every((p) => this.auth.has(p));
    }
    toggle(role, on) {
        this.roles.update((roles) => (on ? [...roles, role] : roles.filter((r) => r !== role)));
    }
    hasUnsavedChanges() {
        const user = this.data.value()?.user;
        return (!!user &&
            (this.disabled() !== user.disabled ||
                [...this.roles()].sort().join() !== [...user.roles].sort().join()));
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    async reloadDraft() {
        if (await this.confirm.ask('unsavedTitle', 'unsavedHelp'))
            await this.load();
    }
    async save() {
        const user = this.data.value()?.user;
        if (!user || this.busy() || !this.editable() || !this.hasUnsavedChanges())
            return;
        if (!(await this.confirm.ask('saveAccess', 'accessChangeConsequence', user.displayName, this.disabled())))
            return;
        this.busy.set(true);
        try {
            await firstValueFrom(this.http.put(this.runtime.apiUrl + '/api/v1/users/' + this.id(), {
                id: this.id(),
                version: user.version,
                roles: this.roles(),
                disabled: this.disabled(),
            }));
            this.toast.success('rolesSaved');
            await this.load();
            this.saved.emit();
        }
        catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 409)
                this.conflict.set(true);
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function UserDetailPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UserDetailPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: UserDetailPage, selectors: [["app-user-detail"]], hostBindings: function UserDetailPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function UserDetailPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, inputs: { userId: [1, "userId"], embedded: [1, "embedded"] }, outputs: { saved: "saved" }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 3, vars: 5, consts: [["title", "personDetails", "description", "personDetailsHelp", "eyebrow", "administration"], [3, "retry", "state", "refreshing", "refreshError"], [3, "class"], ["hlmBtn", "", "variant", "outline", "routerLink", "/administration/users"], ["name", "lucideArrowLeft"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", "", 1, "break-words"], ["hlmCardDescription", "", 1, "break-words"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], ["hlmCardContent", "", 1, "grid", "gap-5", 3, "ngSubmit"], ["hlmFieldSet", ""], ["hlmFieldLegend", ""], ["hlmFieldDescription", ""], ["hlmField", "", "orientation", "horizontal"], ["hlmAlert", ""], ["inputId", "disabled-user", 3, "checkedChange", "checked", "disabled"], ["hlmFieldLabel", "", "for", "disabled-user"], [1, "workspace-meta"], ["hlmAlert", "", "role", "alert"], ["hlmBtn", "", 3, "disabled"], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "grid", "gap-4"], ["hlmCardFooter", ""], [3, "checkedChange", "inputId", "checked", "disabled"], ["hlmFieldLabel", "", 3, "for"], ["hlmAlertDescription", ""], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click"], [1, "font-medium"], ["hlmBtn", "", "variant", "outline", "routerLink", "/administration/audit-history", 3, "queryParams"]], template: function UserDetailPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, UserDetailPage_Conditional_0_Template, 5, 3, "app-page-header", 0);
            i0.ɵɵelementStart(1, "app-page-state", 1);
            i0.ɵɵlistener("retry", function UserDetailPage_Template_app_page_state_retry_1_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(2, UserDetailPage_Conditional_2_Template, 43, 32, "div", 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_4_0;
            i0.ɵɵconditional(!ctx.embedded() ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshing", ctx.data.refreshing())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.data.value()) ? 2 : -1, tmp_4_0);
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.NgControlStatusGroup, i2.NgForm, i3.RouterLink, i4.NgIcon, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardFooter, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmField, i7.HlmFieldDescription, i7.HlmFieldLabel, i7.HlmFieldLegend, i7.HlmFieldSet, i8.HlmAlert, i8.HlmAlertDescription, i9.HlmCheckbox, i10.HlmSwitch, i11.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UserDetailPage, [{
        type: Component,
        args: [{
                selector: 'app-user-detail',
                imports: [WorkspaceUi, HlmCheckboxImports],
                providers: [workspaceIcons],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: ` @if (!embedded()) {
      <app-page-header
        title="personDetails"
        description="personDetailsHelp"
        eyebrow="administration"
        ><a hlmBtn variant="outline" routerLink="/administration/users"
          ><ng-icon name="lucideArrowLeft" />{{ 'users' | t }}</a
        ></app-page-header
      >
    }
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
    >
      @if (data.value(); as detail) {
        <div [class]="embedded() ? 'grid min-w-0 grid-cols-1 gap-4' : 'workspace-columns'">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle class="break-words">{{ detail.user.displayName }}</h2>
              <p hlmCardDescription class="break-words">{{ detail.user.email }}</p>
              @if (auth.has('settings.manage') && features.enabled('my-files')) {
                <a
                  hlmBtn
                  variant="outline"
                  [routerLink]="['/administration/users', detail.user.id, 'my-files']"
                  >{{ 'manageUserFiles' | t }}</a
                >
              }
            </div>
            <form hlmCardContent class="grid gap-5" (ngSubmit)="save()">
              <fieldset hlmFieldSet>
                <legend hlmFieldLegend>{{ 'roles' | t }}</legend>
                <p hlmFieldDescription>{{ 'assignmentHelp' | t }}</p>
                @for (role of catalog.value()?.roles.items ?? []; track role.id) {
                  <div hlmField orientation="horizontal">
                    <hlm-checkbox
                      [inputId]="'role-' + role.id"
                      [checked]="roles().includes(role.name)"
                      [disabled]="!editable() || !canAssign(role.permissions) || busy()"
                      (checkedChange)="toggle(role.name, $event)"
                    /><label hlmFieldLabel [for]="'role-' + role.id">{{ role.name }}</label>
                  </div>
                }
              </fieldset>
              @if (catalog.state() === 'error') {
                <div hlmAlert>
                  <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
                  <button hlmBtn type="button" variant="outline" (click)="load()">
                    {{ 'retry' | t }}
                  </button>
                </div>
              }
              <div hlmField orientation="horizontal">
                <hlm-switch
                  inputId="disabled-user"
                  [checked]="disabled()"
                  [disabled]="!editable() || busy()"
                  (checkedChange)="disabled.set($event)"
                /><label hlmFieldLabel for="disabled-user">{{ 'disabled' | t }}</label>
              </div>
              @if (!editable()) {
                <p class="workspace-meta">{{ 'accessReadOnly' | t }}</p>
              }
              @if (conflict()) {
                <div hlmAlert role="alert">
                  <p hlmAlertDescription>{{ 'draftConflict' | t }}</p>
                  <button hlmBtn type="button" variant="outline" (click)="reloadDraft()">
                    {{ 'discardDraft' | t }}
                  </button>
                </div>
              }
              <div>
                <button
                  hlmBtn
                  [disabled]="busy() || !editable() || !hasUnsavedChanges() || conflict()"
                >
                  {{ 'saveAccess' | t }}
                </button>
              </div>
            </form>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'effectivePermissions' | t }}</h2>
              <p hlmCardDescription>{{ 'effectivePermissionsHelp' | t }}</p>
            </div>
            <div hlmCardContent class="grid gap-4">
              @for (permission of detail.effectivePermissions; track permission) {
                <div>
                  <p class="font-medium">{{ 'permission.' + permission | t }}</p>
                  <p class="workspace-meta">{{ sources(permission) }}</p>
                </div>
              } @empty {
                <p class="workspace-meta">{{ 'noAdministrativePermissions' | t }}</p>
              }
            </div>
            @if (auth.has('settings.manage')) {
              <div hlmCardFooter>
                <a
                  hlmBtn
                  variant="outline"
                  routerLink="/administration/audit-history"
                  [queryParams]="{
                    subjectId: detail.user.id,
                    subjectName: detail.user.displayName,
                  }"
                  >{{ 'viewAudit' | t }}</a
                >
              </div>
            }
          </section>
        </div>
      }
    </app-page-state>`,
            }]
    }], null, { userId: [{ type: i0.Input, args: [{ isSignal: true, alias: "userId", required: false }] }], embedded: [{ type: i0.Input, args: [{ isSignal: true, alias: "embedded", required: false }] }], saved: [{ type: i0.Output, args: ["saved"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(UserDetailPage, { className: "UserDetailPage", filePath: "src/app/features/user-detail.ts", lineNumber: 142 }); })();
