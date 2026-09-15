import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { WorkspaceUi, workspaceIcons, Resource, Confirmations, DebouncedSearch, ListQuery, protectUnload, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, } from '../../shared/workspace';
import { DataTable } from '../../shared/data-table';
import { RecordIdentity, RecordStatus } from '../../shared/workspace-cells';
import { WorkspaceApi } from '../../core/workspace-api';
import { Auth } from '../../core/auth';
import { Runtime } from '../../core/runtime';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import * as i0 from "@angular/core";
import * as i1 from "../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@ng-icons/core";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/alert";
import * as i9 from "@spartan-ng/helm/checkbox";
import * as i10 from "@spartan-ng/helm/drawer";
import * as i11 from "../../core/i18n";
const _c0 = () => [];
const _forTrack0 = ($index, $item) => $item.key;
function RolesPanel_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵlistener("click", function RolesPanel_Conditional_22_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.search.update("")); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "clear"), " ");
} }
function RolesPanel_hlm_drawer_content_28_For_27_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 37)(1, "div", 38)(2, "hlm-checkbox", 39);
    i0.ɵɵlistener("checkedChange", function RolesPanel_hlm_drawer_content_28_For_27_For_5_Template_hlm_checkbox_checkedChange_2_listener($event) { const permission_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggle(permission_r6.key, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 40)(4, "span", 41);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 42);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const permission_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("for", "permission-" + permission_r6.key);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", "permission-" + permission_r6.key)("checked", ctx_r1.permissions().includes(permission_r6.key))("disabled", ctx_r1.selected()?.builtIn || !ctx_r1.auth.has(permission_r6.key) || ctx_r1.busy());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "permission." + permission_r6.key));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 8, "permissionHelp." + permission_r6.key));
} }
function RolesPanel_hlm_drawer_content_28_For_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "fieldset", 32)(1, "legend", 36);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(4, RolesPanel_hlm_drawer_content_28_For_27_For_5_Template, 10, 10, "label", 37, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "permissionGroup." + group_r7));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.groupPermissions(group_r7));
} }
function RolesPanel_hlm_drawer_content_28_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 33)(1, "p", 43);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 44);
    i0.ɵɵlistener("click", function RolesPanel_hlm_drawer_content_28_Conditional_28_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.discard()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "draftConflict"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "discardDraft"), " ");
} }
function RolesPanel_hlm_drawer_content_28_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 34);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const form_r4 = i0.ɵɵreference(9);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", form_r4.invalid || ctx_r1.busy() || ctx_r1.conflict() || !ctx_r1.hasUnsavedChanges());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "saveRole"), " ");
} }
function RolesPanel_hlm_drawer_content_28_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-drawer-content", 20)(1, "hlm-drawer-header")(2, "h2", 21);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 22);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "form", 23, 0);
    i0.ɵɵlistener("ngSubmit", function RolesPanel_hlm_drawer_content_28_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r3); const form_r4 = i0.ɵɵreference(9); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(form_r4.valid && ctx_r1.save()); });
    i0.ɵɵelementStart(10, "div", 24)(11, "div", 25)(12, "label", 26);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "input", 27);
    i0.ɵɵtwoWayListener("ngModelChange", function RolesPanel_hlm_drawer_content_28_Template_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.name, $event) || (ctx_r1.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "div", 25)(17, "label", 28);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "input", 29);
    i0.ɵɵtwoWayListener("ngModelChange", function RolesPanel_hlm_drawer_content_28_Template_input_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.description, $event) || (ctx_r1.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 25)(22, "label", 30);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "input", 31);
    i0.ɵɵtwoWayListener("ngModelChange", function RolesPanel_hlm_drawer_content_28_Template_input_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.permissionSearch, $event) || (ctx_r1.permissionSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(26, RolesPanel_hlm_drawer_content_28_For_27_Template, 6, 3, "fieldset", 32, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵconditionalCreate(28, RolesPanel_hlm_drawer_content_28_Conditional_28_Template, 7, 6, "div", 33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "hlm-drawer-footer");
    i0.ɵɵconditionalCreate(30, RolesPanel_hlm_drawer_content_28_Conditional_30_Template, 3, 4, "button", 34);
    i0.ɵɵelementStart(31, "button", 35);
    i0.ɵɵlistener("click", function RolesPanel_hlm_drawer_content_28_Template_button_click_31_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.close()); });
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 13, ctx_r1.selected()?.builtIn ? "viewRole" : ctx_r1.selected() ? "editRole" : "createRole"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 15, ctx_r1.selected()?.builtIn ? "builtInRoleHelp" : "delegationHelp"), " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 17, "roleName"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.name);
    i0.ɵɵproperty("disabled", ctx_r1.selected()?.builtIn || ctx_r1.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 19, "description"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.description);
    i0.ɵɵproperty("disabled", ctx_r1.selected()?.builtIn || ctx_r1.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 21, "findPermission"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.permissionSearch);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.groups());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.conflict() ? 28 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.selected()?.builtIn ? 30 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(33, 23, "close"), " ");
} }
const column = createColumnHelper();
export class RolesPanel {
    api = inject(WorkspaceApi);
    auth = inject(Auth);
    i18n = inject(I18n);
    data = new Resource();
    selected = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
    editorOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editorOpen" }] : /* istanbul ignore next */ []));
    permissions = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "permissions" }] : /* istanbul ignore next */ []));
    query = new ListQuery('role');
    search = new DebouncedSearch(this.query);
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    conflict = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conflict" }] : /* istanbul ignore next */ []));
    http = inject(HttpClient);
    runtime = inject(Runtime);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    name = '';
    description = '';
    permissionSearch = '';
    emptyText = computed(() => this.query.text('search') ? this.i18n.text('roleSearchEmpty') : this.i18n.text('rolesEmpty'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyText" }] : /* istanbul ignore next */ []));
    roleDetailsLabel = (role) => `${this.i18n.text(role.builtIn ? 'viewRole' : 'editRole')}: ${role.name}`;
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor('name', {
                header: this.i18n.text('roleName'),
                cell: ({ row }) => flexRenderComponent(RecordIdentity, {
                    inputs: {
                        label: row.original.name,
                        description: row.original.description ||
                            (row.original.builtIn ? this.i18n.text('builtInRoleHelp') : ''),
                        constrainWidth: false,
                    },
                }),
            }),
            column.accessor('members', {
                header: this.i18n.text('roleMembers'),
                cell: (cell) => this.i18n.number(cell.getValue()),
            }),
            column.accessor('builtIn', {
                header: this.i18n.text('roleType'),
                cell: ({ row }) => flexRenderComponent(RecordStatus, {
                    inputs: { value: row.original.builtIn ? 'builtIn' : 'customRole' },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    groups = computed(() => [
        ...new Set(this.data.value()?.permissions.map((p) => p.group) ?? []),
    ], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "groups" }] : /* istanbul ignore next */ []));
    constructor() {
        this.query.connect(() => {
            const search = this.query.text('search');
            this.search.sync(search);
            void this.load();
        }, ['search', 'page', 'size', 'sort', 'direction']);
    }
    async load() {
        const loaded = await this.data.load((signal) => this.api.get('/roles', {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            search: this.query.text('search'),
            sort: this.query.text('sort', 'name'),
            direction: this.query.direction('asc'),
        }, signal));
        if (loaded)
            this.query.clamp(this.data.value()?.roles.total, this.pageSize());
        return loaded;
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
    groupPermissions(group) {
        return (this.data.value()?.permissions.filter((p) => p.group === group &&
            this.i18n
                .text('permission.' + p.key)
                .toLowerCase()
                .includes(this.permissionSearch.toLowerCase())) ?? []);
    }
    toggle(key, on) {
        this.permissions.update((p) => (on ? [...p, key] : p.filter((x) => x !== key)));
        if (key === 'users.manage' && on && !this.permissions().includes('users.read'))
            this.permissions.update((p) => [...p, 'users.read']);
        if (key === 'users.read' && !on)
            this.permissions.update((p) => p.filter((x) => x !== 'users.manage'));
    }
    hasUnsavedChanges() {
        const role = this.selected();
        return (this.editorOpen() &&
            !role?.builtIn &&
            (this.name !== (role?.name ?? '') ||
                this.description !== (role?.description ?? '') ||
                [...this.permissions()].sort().join() !== [...(role?.permissions ?? [])].sort().join()));
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    async select(role) {
        if (this.hasUnsavedChanges() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            return;
        this.apply(role);
    }
    apply(role) {
        this.selected.set(role);
        this.name = role?.name ?? '';
        this.description = role?.description ?? '';
        this.permissions.set([...(role?.permissions ?? [])]);
        this.permissionSearch = '';
        this.conflict.set(false);
        this.editorOpen.set(true);
    }
    async close() {
        if (this.hasUnsavedChanges() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            return;
        this.editorOpen.set(false);
    }
    drawerStateChanged(state) {
        if (state === 'closed' && !this.hasUnsavedChanges())
            this.editorOpen.set(false);
    }
    async discard() {
        if (!(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            return;
        if (!(await this.load()))
            return;
        this.apply(this.data.value()?.roles.items.find((r) => r.id === this.selected()?.id) ?? null);
    }
    async save() {
        if (this.busy() || this.selected()?.builtIn || this.conflict())
            return;
        if (!(await this.confirm.ask('saveRole', 'roleChangeConsequence', this.name)))
            return;
        this.busy.set(true);
        try {
            const role = this.selected();
            const body = {
                name: this.name.trim(),
                description: this.description.trim(),
                permissions: this.permissions(),
                version: role?.version,
            };
            const url = this.runtime.apiUrl + '/api/v1/roles';
            const value = await firstValueFrom(role
                ? this.http.put(url + '/' + role.id, body)
                : this.http.post(url, body));
            this.apply(value);
            this.toast.success('roleSaved');
            await this.load();
        }
        catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 409)
                this.conflict.set(true);
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function RolesPanel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RolesPanel)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RolesPanel, selectors: [["app-roles-panel"]], hostBindings: function RolesPanel_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function RolesPanel_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 29, vars: 38, consts: [["form", "ngForm"], ["hlmCard", "", 1, "workspace-directory-panel"], ["hlmCardHeader", "", 1, "flex", "flex-col", "gap-4", "sm:flex-row", "sm:items-start", "sm:justify-between"], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmBtn", "", "type", "button", 3, "click"], ["name", "lucidePlus"], ["hlmCardContent", ""], [1, "workspace-directory-controls"], [1, "workspace-directory-toolbar"], ["hlmField", "", 1, "min-w-0", "flex-1", "sm:max-w-sm"], ["hlmFieldLabel", "", "for", "role-search", 1, "sr-only"], ["hlmInput", "", "id", "role-search", "maxlength", "120", 3, "ngModelChange", "ngModel", "placeholder"], ["hlmBtn", "", "type", "button", "variant", "ghost"], [3, "retry", "state", "refreshError", "showInitialSkeleton"], ["fillColumn", "name", 3, "rowAction", "sortChange", "columns", "rowActionLabel", "data", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "total", "page", "size", "showSizePicker", "busy"], ["direction", "right", 3, "stateChanged", "state", "disableClose"], ["class", "overflow-hidden sm:max-w-xl", 4, "hlmDrawerPortal"], ["hlmBtn", "", "type", "button", "variant", "ghost", 3, "click"], [1, "overflow-hidden", "sm:max-w-xl"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], [1, "flex", "min-h-0", "flex-1", "flex-col", 3, "ngSubmit"], ["hlmDrawerBody", "", 1, "grid", "min-h-0", "flex-1", "gap-5", "overflow-y-auto"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "role-name"], ["hlmInput", "", "id", "role-name", "name", "name", "required", "", "minlength", "2", "maxlength", "80", "pattern", "[A-Za-z0-9 -]+", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldLabel", "", "for", "role-description"], ["hlmInput", "", "id", "role-description", "name", "description", "maxlength", "240", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldLabel", "", "for", "permission-search"], ["hlmInput", "", "id", "permission-search", "name", "permissionSearch", 3, "ngModelChange", "ngModel"], ["hlmFieldSet", ""], ["hlmAlert", "", "role", "alert"], ["hlmBtn", "", 3, "disabled"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click"], ["hlmFieldLegend", ""], ["hlmFieldLabel", "", 1, "cursor-pointer", "has-[[data-disabled]]:cursor-not-allowed", 3, "for"], ["hlmField", "", "orientation", "horizontal"], [3, "checkedChange", "inputId", "checked", "disabled"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""], ["hlmFieldDescription", ""], ["hlmAlertDescription", ""], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click"]], template: function RolesPanel_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 1)(1, "div", 2)(2, "div")(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "button", 5);
            i0.ɵɵlistener("click", function RolesPanel_Template_button_click_9_listener() { return ctx.select(null); });
            i0.ɵɵelement(10, "ng-icon", 6);
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "div", 7)(14, "div", 8)(15, "div", 9)(16, "div", 10)(17, "label", 11);
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "input", 12);
            i0.ɵɵpipe(21, "t");
            i0.ɵɵlistener("ngModelChange", function RolesPanel_Template_input_ngModelChange_20_listener($event) { return ctx.search.update($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(22, RolesPanel_Conditional_22_Template, 3, 3, "button", 13);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "app-page-state", 14);
            i0.ɵɵlistener("retry", function RolesPanel_Template_app_page_state_retry_23_listener() { return ctx.load(); });
            i0.ɵɵelementStart(24, "app-data-table", 15);
            i0.ɵɵpipe(25, "t");
            i0.ɵɵlistener("rowAction", function RolesPanel_Template_app_data_table_rowAction_24_listener($event) { return ctx.select($event); })("sortChange", function RolesPanel_Template_app_data_table_sortChange_24_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "app-list-pager", 16);
            i0.ɵɵlistener("pageChange", function RolesPanel_Template_app_list_pager_pageChange_26_listener($event) { return ctx.query.set({ page: $event }); })("sizeChange", function RolesPanel_Template_app_list_pager_sizeChange_26_listener($event) { return ctx.setPageSize($event); });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(27, "hlm-drawer", 17);
            i0.ɵɵlistener("stateChanged", function RolesPanel_Template_hlm_drawer_stateChanged_27_listener($event) { return ctx.drawerStateChanged($event); });
            i0.ɵɵtemplate(28, RolesPanel_hlm_drawer_content_28_Template, 34, 25, "hlm-drawer-content", 18);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 25, "roles"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 27, "rolesSelectionHelp"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(12, 29, "createRole"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 31, "search"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.search.value())("placeholder", i0.ɵɵpipeBind1(21, 33, "roleSearch"));
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.search.value() ? 22 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError())("showInitialSkeleton", false);
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("rowActionLabel", ctx.roleDetailsLabel)("data", ctx.data.value()?.roles.items ?? i0.ɵɵpureFunction0(37, _c0))("loading", ctx.data.state() === "loading" || ctx.data.refreshing())("loadingText", i0.ɵɵpipeBind1(25, 35, "loading"))("emptyText", ctx.emptyText())("sortColumn", ctx.query.text("sort", "name"))("sortDirection", ctx.query.direction("asc"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("total", ctx.data.value()?.roles.total ?? 0)("page", ctx.query.page)("size", ctx.pageSize())("showSizePicker", true)("busy", ctx.data.refreshing());
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.editorOpen() ? "open" : "closed")("disableClose", ctx.hasUnsavedChanges());
        } }, dependencies: [i1.PageState, i1.ListPager, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MinLengthValidator, i2.MaxLengthValidator, i2.PatternValidator, i2.NgModel, i2.NgForm, i3.NgIcon, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldContent, i6.HlmFieldDescription, i6.HlmFieldLabel, i6.HlmFieldLegend, i6.HlmFieldSet, i6.HlmFieldTitle, i7.HlmInput, i8.HlmAlert, i8.HlmAlertDescription, i9.HlmCheckbox, DataTable, i10.HlmDrawer, i10.HlmDrawerBody, i10.HlmDrawerContent, i10.HlmDrawerDescription, i10.HlmDrawerFooter, i10.HlmDrawerHeader, i10.HlmDrawerPortal, i10.HlmDrawerTitle, i11.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RolesPanel, [{
        type: Component,
        args: [{
                selector: 'app-roles-panel',
                imports: [WorkspaceUi, DataTable, HlmCheckboxImports, HlmDrawerImports],
                providers: [workspaceIcons],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: `
    <section hlmCard class="workspace-directory-panel">
      <div hlmCardHeader class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 hlmCardTitle>{{ 'roles' | t }}</h2>
          <p hlmCardDescription>{{ 'rolesSelectionHelp' | t }}</p>
        </div>
        <button hlmBtn type="button" (click)="select(null)">
          <ng-icon name="lucidePlus" />{{ 'createRole' | t }}
        </button>
      </div>
      <div hlmCardContent>
        <div class="workspace-directory-controls">
          <div class="workspace-directory-toolbar">
            <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
              <label hlmFieldLabel class="sr-only" for="role-search">{{ 'search' | t }}</label>
              <input
                hlmInput
                id="role-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="120"
                [placeholder]="'roleSearch' | t"
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
        >
          <app-data-table
            [columns]="columns()"
            fillColumn="name"
            [rowActionLabel]="roleDetailsLabel"
            (rowAction)="select($event)"
            [data]="data.value()?.roles.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="emptyText()"
            [sortColumn]="query.text('sort', 'name')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.roles.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            [busy]="data.refreshing()"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="setPageSize($event)"
          />
        </app-page-state>
      </div>
    </section>
    <hlm-drawer
      direction="right"
      [state]="editorOpen() ? 'open' : 'closed'"
      [disableClose]="hasUnsavedChanges()"
      (stateChanged)="drawerStateChanged($event)"
    >
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-xl">
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>
            {{ (selected()?.builtIn ? 'viewRole' : selected() ? 'editRole' : 'createRole') | t }}
          </h2>
          <p hlmDrawerDescription>
            {{ (selected()?.builtIn ? 'builtInRoleHelp' : 'delegationHelp') | t }}
          </p>
        </hlm-drawer-header>
        <form class="flex min-h-0 flex-1 flex-col" #form="ngForm" (ngSubmit)="form.valid && save()">
          <div hlmDrawerBody class="grid min-h-0 flex-1 gap-5 overflow-y-auto">
            <div hlmField>
              <label hlmFieldLabel for="role-name">{{ 'roleName' | t }}</label
              ><input
                hlmInput
                id="role-name"
                name="name"
                [(ngModel)]="name"
                required
                minlength="2"
                maxlength="80"
                pattern="[A-Za-z0-9 -]+"
                [disabled]="selected()?.builtIn || busy()"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="role-description">{{ 'description' | t }}</label
              ><input
                hlmInput
                id="role-description"
                name="description"
                [(ngModel)]="description"
                maxlength="240"
                [disabled]="selected()?.builtIn || busy()"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="permission-search">{{ 'findPermission' | t }}</label
              ><input
                hlmInput
                id="permission-search"
                name="permissionSearch"
                [(ngModel)]="permissionSearch"
              />
            </div>
            @for (group of groups(); track group) {
              <fieldset hlmFieldSet>
                <legend hlmFieldLegend>{{ 'permissionGroup.' + group | t }}</legend>
                @for (permission of groupPermissions(group); track permission.key) {
                  <label
                    hlmFieldLabel
                    [for]="'permission-' + permission.key"
                    class="cursor-pointer has-[[data-disabled]]:cursor-not-allowed"
                  >
                    <div hlmField orientation="horizontal">
                      <hlm-checkbox
                        [inputId]="'permission-' + permission.key"
                        [checked]="permissions().includes(permission.key)"
                        [disabled]="selected()?.builtIn || !auth.has(permission.key) || busy()"
                        (checkedChange)="toggle(permission.key, $event)"
                      />
                      <div hlmFieldContent>
                        <span hlmFieldTitle>{{ 'permission.' + permission.key | t }}</span>
                        <p hlmFieldDescription>{{ 'permissionHelp.' + permission.key | t }}</p>
                      </div>
                    </div>
                  </label>
                }
              </fieldset>
            }
            @if (conflict()) {
              <div hlmAlert role="alert">
                <p hlmAlertDescription>{{ 'draftConflict' | t }}</p>
                <button hlmBtn variant="outline" type="button" (click)="discard()">
                  {{ 'discardDraft' | t }}
                </button>
              </div>
            }
          </div>
          <hlm-drawer-footer>
            @if (!selected()?.builtIn) {
              <button
                hlmBtn
                [disabled]="form.invalid || busy() || conflict() || !hasUnsavedChanges()"
              >
                {{ 'saveRole' | t }}
              </button>
            }
            <button hlmBtn type="button" variant="outline" (click)="close()">
              {{ 'close' | t }}
            </button>
          </hlm-drawer-footer>
        </form>
      </hlm-drawer-content>
    </hlm-drawer>
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RolesPanel, { className: "RolesPanel", filePath: "src/app/features/roles.ts", lineNumber: 198 }); })();
