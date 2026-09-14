import { Component, inject, output, signal, viewChild } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, Resource, protectUnload, workspaceIcons } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { IDEMPOTENCY_KEY } from '../core/interceptors';
import { createUser } from '../api/fn/framework/create-user';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/field";
import * as i5 from "@spartan-ng/helm/input";
import * as i6 from "@spartan-ng/helm/checkbox";
import * as i7 from "@spartan-ng/helm/spinner";
import * as i8 from "@spartan-ng/helm/drawer";
import * as i9 from "@spartan-ng/helm/select";
import * as i10 from "../core/i18n";
import * as i11 from "@ng-icons/core";
const _c0 = () => [];
const _forTrack0 = ($index, $item) => $item.id;
function InvitationEditor_hlm_select_content_24_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const supportedCulture_r3 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", supportedCulture_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.cultureLabel(supportedCulture_r3), " ");
} }
function InvitationEditor_hlm_select_content_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 20);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, InvitationEditor_hlm_select_content_24_For_3_Template, 2, 2, "hlm-select-item", 21, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "culture"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.runtime.supportedCultures);
} }
function InvitationEditor_For_34_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 18)(1, "div", 22)(2, "hlm-checkbox", 23);
    i0.ɵɵlistener("checkedChange", function InvitationEditor_For_34_Template_hlm_checkbox_checkedChange_2_listener($event) { const role_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.toggle(role_r6.name, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 24)(4, "span", 25);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 16);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const role_r6 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("for", "invite-role-" + role_r6.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", "invite-role-" + role_r6.id)("checked", ctx_r3.roles.includes(role_r6.name))("disabled", !ctx_r3.canAssign(role_r6.permissions) || ctx_r3.busy());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(role_r6.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r3.roleDescription(role_r6));
} }
function InvitationEditor_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function InvitationDrawer_hlm_drawer_content_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-drawer-content", 4);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-drawer-header")(3, "h2", 5);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 6);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "app-invitation-editor", 7);
    i0.ɵɵlistener("invited", function InvitationDrawer_hlm_drawer_content_5_Template_app_invitation_editor_invited_9_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.complete()); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "invite"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "invite"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "inviteHelp"));
} }
export class InvitationEditor {
    api = inject(WorkspaceApi);
    auth = inject(Auth);
    catalog = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    invited = output();
    runtime = inject(Runtime);
    i18n = inject(I18n);
    http = inject(HttpClient);
    toast = inject(Notifications);
    name = '';
    email = '';
    roles = ['Reader'];
    culture = this.i18n.culture();
    key = crypto.randomUUID();
    fingerprint = '';
    cultureLabel = (culture) => (culture === 'af-ZA' ? 'Afrikaans' : 'English');
    constructor() {
        void this.load();
    }
    load() {
        return this.catalog.load((signal) => this.api.get('/roles', { pageSize: 100 }, signal));
    }
    canAssign(permissions) {
        return permissions.every((p) => this.auth.has(p));
    }
    roleDescription(role) {
        if (role.description.trim())
            return role.description;
        if (role.name === 'Administrator')
            return this.i18n.text('administratorRoleHelp');
        if (role.name === 'Reader')
            return this.i18n.text('readerRoleHelp');
        return this.i18n.text('customRoleAssignmentHelp');
    }
    toggle(role, on) {
        this.roles = on ? [...this.roles, role] : this.roles.filter((r) => r !== role);
    }
    hasUnsavedChanges() {
        return !!(this.name || this.email || this.roles.join() !== 'Reader');
    }
    async invite() {
        if (this.busy())
            return;
        this.busy.set(true);
        const fingerprint = JSON.stringify([this.name, this.email, this.roles, this.culture]);
        if (fingerprint !== this.fingerprint) {
            this.key = crypto.randomUUID();
            this.fingerprint = fingerprint;
        }
        try {
            await firstValueFrom(createUser(this.http, this.runtime.apiUrl, {
                body: {
                    displayName: this.name.trim(),
                    email: this.email.trim(),
                    roles: this.roles,
                    culture: this.culture,
                },
            }, new HttpContext().set(IDEMPOTENCY_KEY, this.key)));
            this.name = '';
            this.email = '';
            this.roles = ['Reader'];
            this.toast.success('invitationSent');
            this.invited.emit();
        }
        catch {
            /* retain draft and retry key */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function InvitationEditor_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InvitationEditor)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InvitationEditor, selectors: [["app-invitation-editor"]], outputs: { invited: "invited" }, decls: 40, vars: 32, consts: [["form", "ngForm"], [1, "flex", "min-h-0", "flex-1", "flex-col", 3, "ngSubmit"], ["hlmDrawerBody", "", 1, "min-h-0", "flex-1", "overflow-y-auto"], [3, "retry", "state"], [1, "grid", "gap-5"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "invite-name"], ["hlmInput", "", "id", "invite-name", "name", "name", "required", "", "maxlength", "120", 3, "ngModelChange", "ngModel", "placeholder"], ["hlmFieldLabel", "", "for", "invite-email"], ["hlmInput", "", "id", "invite-email", "name", "email", "type", "email", "email", "", "required", "", "maxlength", "254", 3, "ngModelChange", "ngModel", "placeholder"], ["hlmFieldLabel", "", "for", "invite-language"], ["name", "culture", 3, "valueChange", "value", "itemToString"], ["buttonId", "invite-language", 1, "w-full"], [3, "ariaLabel", 4, "hlmSelectPortal"], ["hlmFieldSet", "", 1, "mt-2"], ["hlmFieldLegend", ""], ["hlmFieldDescription", ""], ["hlmFieldGroup", "", "data-slot", "checkbox-group"], ["hlmFieldLabel", "", 3, "for"], ["hlmBtn", "", 3, "disabled"], [3, "ariaLabel"], [3, "value"], ["hlmField", "", "orientation", "horizontal", 2, "align-items", "center"], [1, "disabled:cursor-default", 2, "margin-top", "0", 3, "checkedChange", "inputId", "checked", "disabled"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""]], template: function InvitationEditor_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "form", 1, 0);
            i0.ɵɵlistener("ngSubmit", function InvitationEditor_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r1); const form_r2 = i0.ɵɵreference(1); return i0.ɵɵresetView(form_r2.valid && ctx.invite()); });
            i0.ɵɵelementStart(2, "div", 2)(3, "app-page-state", 3);
            i0.ɵɵlistener("retry", function InvitationEditor_Template_app_page_state_retry_3_listener() { return ctx.load(); });
            i0.ɵɵelementStart(4, "div", 4)(5, "div", 5)(6, "label", 6);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "input", 7);
            i0.ɵɵpipe(10, "t");
            i0.ɵɵtwoWayListener("ngModelChange", function InvitationEditor_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.name, $event) || (ctx.name = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "div", 5)(12, "label", 8);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "input", 9);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵtwoWayListener("ngModelChange", function InvitationEditor_Template_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.email, $event) || (ctx.email = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "div", 5)(18, "label", 10);
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "hlm-select", 11);
            i0.ɵɵlistener("valueChange", function InvitationEditor_Template_hlm_select_valueChange_21_listener($event) { return ctx.culture = $event ?? ctx.culture; });
            i0.ɵɵelementStart(22, "hlm-select-trigger", 12);
            i0.ɵɵelement(23, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(24, InvitationEditor_hlm_select_content_24_Template, 4, 3, "hlm-select-content", 13);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "fieldset", 14)(26, "legend", 15);
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "p", 16);
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "div", 17);
            i0.ɵɵrepeaterCreate(33, InvitationEditor_For_34_Template, 8, 6, "label", 18, _forTrack0);
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(35, "hlm-drawer-footer")(36, "button", 19);
            i0.ɵɵconditionalCreate(37, InvitationEditor_Conditional_37_Template, 1, 0, "hlm-spinner");
            i0.ɵɵtext(38);
            i0.ɵɵpipe(39, "t");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            const form_r2 = i0.ɵɵreference(1);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("state", ctx.catalog.state());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 15, "name"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.name);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 17, "name"));
            i0.ɵɵcontrol();
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 19, "email"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.email);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(16, 21, "email"));
            i0.ɵɵcontrol();
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 23, "culture"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.culture)("itemToString", ctx.cultureLabel);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 25, "roles"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 27, "assignmentHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.catalog.value()?.roles.items ?? i0.ɵɵpureFunction0(31, _c0));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy() || form_r2.invalid || ctx.catalog.state() !== "ready");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.busy() ? 37 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(39, 29, "invite"), " ");
        } }, dependencies: [i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.EmailValidator, i2.NgModel, i2.NgForm, i3.HlmButton, i4.HlmField, i4.HlmFieldContent, i4.HlmFieldDescription, i4.HlmFieldGroup, i4.HlmFieldLabel, i4.HlmFieldLegend, i4.HlmFieldSet, i4.HlmFieldTitle, i5.HlmInput, i6.HlmCheckbox, i7.HlmSpinner, i8.HlmDrawerBody, i8.HlmDrawerFooter, i9.HlmSelect, i9.HlmSelectContent, i9.HlmSelectItem, i9.HlmSelectPortal, i9.HlmSelectTrigger, i9.HlmSelectValue, i10.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InvitationEditor, [{
        type: Component,
        args: [{
                selector: 'app-invitation-editor',
                imports: [WorkspaceUi, HlmCheckboxImports, HlmDrawerImports, HlmSelectImports],
                template: `
    <form class="flex min-h-0 flex-1 flex-col" #form="ngForm" (ngSubmit)="form.valid && invite()">
      <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
        <app-page-state [state]="catalog.state()" (retry)="load()">
          <div class="grid gap-5">
            <div hlmField>
              <label hlmFieldLabel for="invite-name">{{ 'name' | t }}</label
              ><input
                hlmInput
                id="invite-name"
                name="name"
                [(ngModel)]="name"
                [placeholder]="'name' | t"
                required
                maxlength="120"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="invite-email">{{ 'email' | t }}</label
              ><input
                hlmInput
                id="invite-email"
                name="email"
                type="email"
                email
                [(ngModel)]="email"
                [placeholder]="'email' | t"
                required
                maxlength="254"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="invite-language">{{ 'culture' | t }}</label>
              <hlm-select
                name="culture"
                [value]="culture"
                [itemToString]="cultureLabel"
                (valueChange)="culture = $event ?? culture"
              >
                <hlm-select-trigger buttonId="invite-language" class="w-full">
                  <hlm-select-value />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
                  @for (supportedCulture of runtime.supportedCultures; track supportedCulture) {
                    <hlm-select-item [value]="supportedCulture">
                      {{ cultureLabel(supportedCulture) }}
                    </hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
            <fieldset hlmFieldSet class="mt-2">
              <legend hlmFieldLegend>{{ 'roles' | t }}</legend>
              <p hlmFieldDescription>{{ 'assignmentHelp' | t }}</p>
              <div hlmFieldGroup data-slot="checkbox-group">
                @for (role of catalog.value()?.roles.items ?? []; track role.id) {
                  <label hlmFieldLabel [for]="'invite-role-' + role.id">
                    <div hlmField orientation="horizontal" style="align-items: center">
                      <hlm-checkbox
                        class="disabled:cursor-default"
                        style="margin-top: 0"
                        [inputId]="'invite-role-' + role.id"
                        [checked]="roles.includes(role.name)"
                        [disabled]="!canAssign(role.permissions) || busy()"
                        (checkedChange)="toggle(role.name, $event)"
                      />
                      <div hlmFieldContent>
                        <span hlmFieldTitle>{{ role.name }}</span>
                        <p hlmFieldDescription>{{ roleDescription(role) }}</p>
                      </div>
                    </div>
                  </label>
                }
              </div>
            </fieldset>
          </div>
        </app-page-state>
      </div>
      <hlm-drawer-footer>
        <button hlmBtn [disabled]="busy() || form.invalid || catalog.state() !== 'ready'">
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'invite' | t }}
        </button>
      </hlm-drawer-footer>
    </form>
  `,
            }]
    }], () => [], { invited: [{ type: i0.Output, args: ["invited"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InvitationEditor, { className: "InvitationEditor", filePath: "src/app/features/invite-user.ts", lineNumber: 108 }); })();
export class InvitationDrawer {
    invited = output();
    open = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "open" }] : /* istanbul ignore next */ []));
    editor = viewChild(InvitationEditor, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editor" }] : /* istanbul ignore next */ []));
    hasUnsavedChanges() {
        return this.open() && (this.editor()?.hasUnsavedChanges() ?? false);
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    complete() {
        this.open.set(false);
        this.invited.emit();
    }
    static ɵfac = function InvitationDrawer_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InvitationDrawer)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InvitationDrawer, selectors: [["app-invitation-drawer"]], viewQuery: function InvitationDrawer_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.editor, InvitationEditor, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostBindings: function InvitationDrawer_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function InvitationDrawer_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, outputs: { invited: "invited" }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 6, vars: 4, consts: [["direction", "right", 3, "stateChanged", "state"], ["hlmBtn", "", "hlmDrawerTrigger", ""], ["name", "lucidePlus"], ["class", "overflow-hidden sm:max-w-lg", 4, "hlmDrawerPortal"], [1, "overflow-hidden", "sm:max-w-lg"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], [1, "flex", "min-h-0", "flex-1", "flex-col", 3, "invited"]], template: function InvitationDrawer_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "hlm-drawer", 0);
            i0.ɵɵlistener("stateChanged", function InvitationDrawer_Template_hlm_drawer_stateChanged_0_listener($event) { return ctx.open.set($event === "open"); });
            i0.ɵɵelementStart(1, "button", 1);
            i0.ɵɵelement(2, "ng-icon", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(5, InvitationDrawer_hlm_drawer_content_5_Template, 10, 9, "hlm-drawer-content", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("state", ctx.open() ? "open" : "closed");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "invite"));
        } }, dependencies: [i2.FormsModule, i11.NgIcon, i3.HlmButton, i8.HlmDrawer, i8.HlmDrawerContent, i8.HlmDrawerDescription, i8.HlmDrawerHeader, i8.HlmDrawerPortal, i8.HlmDrawerTitle, i8.HlmDrawerTrigger, InvitationEditor, i10.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InvitationDrawer, [{
        type: Component,
        args: [{
                selector: 'app-invitation-drawer',
                imports: [WorkspaceUi, HlmDrawerImports, InvitationEditor],
                providers: [workspaceIcons],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: `
    <hlm-drawer
      direction="right"
      [state]="open() ? 'open' : 'closed'"
      (stateChanged)="open.set($event === 'open')"
    >
      <button hlmBtn hlmDrawerTrigger><ng-icon name="lucidePlus" />{{ 'invite' | t }}</button>
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden sm:max-w-lg"
        [attr.aria-label]="'invite' | t"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'invite' | t }}</h2>
          <p hlmDrawerDescription>{{ 'inviteHelp' | t }}</p>
        </hlm-drawer-header>
        <app-invitation-editor class="flex min-h-0 flex-1 flex-col" (invited)="complete()" />
      </hlm-drawer-content>
    </hlm-drawer>
  `,
            }]
    }], null, { invited: [{ type: i0.Output, args: ["invited"] }], editor: [{ type: i0.ViewChild, args: [i0.forwardRef(() => InvitationEditor), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InvitationDrawer, { className: "InvitationDrawer", filePath: "src/app/features/invite-user.ts", lineNumber: 209 }); })();
