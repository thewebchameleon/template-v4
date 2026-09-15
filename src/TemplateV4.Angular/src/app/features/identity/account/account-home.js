import { Component, inject, signal, viewChild } from '@angular/core';
import { ProfileEditor } from './profile-editor';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { WorkspaceUi, workspaceIcons, Resource, protectUnload } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Notifications } from '../../notifications/notifications';
import * as i0 from "@angular/core";
import * as i1 from "../../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@ng-icons/core";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/field";
import * as i8 from "@spartan-ng/helm/input";
import * as i9 from "@spartan-ng/helm/alert";
import * as i10 from "@spartan-ng/helm/checkbox";
import * as i11 from "@spartan-ng/helm/spinner";
import * as i12 from "../../../core/i18n";
function AccountHomePage_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 16);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "emailInvalid"));
} }
function AccountHomePage_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 13)(1, "label", 23);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 24);
    i0.ɵɵtwoWayListener("ngModelChange", function AccountHomePage_Conditional_37_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.code, $event) || (ctx_r3.code = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 25)(6, "hlm-checkbox", 26);
    i0.ɵɵtwoWayListener("ngModelChange", function AccountHomePage_Conditional_37_Template_hlm_checkbox_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.recovery, $event) || (ctx_r3.recovery = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(7, "label", 27);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "authenticatorCodeOptional"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.code);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.recovery);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 6, "useRecovery"));
} }
function AccountHomePage_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function AccountHomePage_Conditional_46_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22)(1, "h3", 28);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 29);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "emailChangeSent"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "emailChangeSentHelp"));
} }
export class AccountHomePage {
    editor = viewChild(ProfileEditor, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editor" }] : /* istanbul ignore next */ []));
    api = inject(WorkspaceApi);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    emailSent = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emailSent" }] : /* istanbul ignore next */ []));
    toast = inject(Notifications);
    email = '';
    password = '';
    code = '';
    recovery = false;
    constructor() {
        void this.load();
    }
    load() {
        return this.data.load((signal) => this.api.get('profile', {}, signal));
    }
    hasUnsavedChanges() {
        return !!(this.email || this.password || this.code || this.editor()?.hasUnsavedChanges());
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    async changeEmail() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post('privacy/email', {
                email: this.email.trim(),
                proof: { password: this.password, code: this.code, recoveryCode: this.recovery },
            });
            this.email = '';
            this.password = '';
            this.code = '';
            this.emailSent.set(true);
            this.toast.success('emailChangeSent');
        }
        catch {
            /* retain draft */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function AccountHomePage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AccountHomePage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AccountHomePage, selectors: [["app-account-home"]], viewQuery: function AccountHomePage_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.editor, ProfileEditor, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostBindings: function AccountHomePage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function AccountHomePage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 47, vars: 32, consts: [["emailForm", "ngForm"], ["emailControl", "ngModel"], ["title", "account", "description", "accountIntro"], ["hlmBtn", "", "variant", "outline", "routerLink", "/security"], ["name", "lucideShieldCheck"], [3, "retry", "state"], [1, "max-w-(--form-content-width)", "grid", "gap-6"], [3, "saved", "profile"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "grid", "gap-5", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "new-email"], ["hlmInput", "", "id", "new-email", "name", "email", "type", "email", "autocomplete", "email", "email", "", "required", "", "maxlength", "254", 3, "ngModelChange", "ngModel"], ["forceShow", ""], [1, "grid", "gap-5", "sm:grid-cols-2"], ["hlmFieldLabel", "", "for", "email-password"], ["hlmInput", "", "id", "email-password", "name", "password", "type", "password", "autocomplete", "current-password", "required", "", "maxlength", "1024", 3, "ngModelChange", "ngModel"], [1, "workspace-meta"], ["hlmBtn", "", 3, "disabled"], ["hlmAlert", "", "role", "status"], ["hlmFieldLabel", "", "for", "email-code"], ["hlmInput", "", "id", "email-code", "name", "code", "autocomplete", "one-time-code", "inputmode", "numeric", "maxlength", "64", 3, "ngModelChange", "ngModel"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "email-recovery", "name", "recovery", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "email-recovery"], ["hlmAlertTitle", ""], ["hlmAlertDescription", ""]], template: function AccountHomePage_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "app-page-header", 2)(1, "a", 3);
            i0.ɵɵelement(2, "ng-icon", 4);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "app-page-state", 5);
            i0.ɵɵlistener("retry", function AccountHomePage_Template_app_page_state_retry_5_listener() { return ctx.load(); });
            i0.ɵɵelementStart(6, "div", 6)(7, "app-profile-editor", 7);
            i0.ɵɵlistener("saved", function AccountHomePage_Template_app_profile_editor_saved_7_listener($event) { return ctx.data.value.set($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "section", 8)(9, "div", 9)(10, "h2", 10);
            i0.ɵɵtext(11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "p", 11);
            i0.ɵɵtext(13);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(14, "section", 8)(15, "div", 9)(16, "h2", 10);
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "p", 11);
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "form", 12, 0);
            i0.ɵɵlistener("ngSubmit", function AccountHomePage_Template_form_ngSubmit_22_listener() { i0.ɵɵrestoreView(_r1); const emailForm_r2 = i0.ɵɵreference(23); return i0.ɵɵresetView(emailForm_r2.valid && ctx.changeEmail()); });
            i0.ɵɵelementStart(24, "div", 13)(25, "label", 14);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "input", 15, 1);
            i0.ɵɵtwoWayListener("ngModelChange", function AccountHomePage_Template_input_ngModelChange_28_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.email, $event) || (ctx.email = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(30, AccountHomePage_Conditional_30_Template, 3, 3, "hlm-field-error", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(31, "div", 17)(32, "div", 13)(33, "label", 18);
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "input", 19);
            i0.ɵɵtwoWayListener("ngModelChange", function AccountHomePage_Template_input_ngModelChange_36_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.password, $event) || (ctx.password = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(37, AccountHomePage_Conditional_37_Template, 10, 8);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(38, "p", 20);
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "div")(42, "button", 21);
            i0.ɵɵconditionalCreate(43, AccountHomePage_Conditional_43_Template, 1, 0, "hlm-spinner");
            i0.ɵɵtext(44);
            i0.ɵɵpipe(45, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(46, AccountHomePage_Conditional_46_Template, 7, 6, "div", 22);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            const emailForm_r2 = i0.ɵɵreference(23);
            const emailControl_r5 = i0.ɵɵreference(29);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 18, "security"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("profile", ctx.data.value());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.data.value()?.displayName);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.data.value()?.email);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 20, "changeEmail"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 22, "changeEmailHelp"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 24, "newEmail"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.email);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(emailControl_r5.invalid && emailControl_r5.touched ? 30 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 26, "currentPassword"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.password);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.data.value()?.mfaEnabled ? 37 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 28, "emailProofHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy() || emailForm_r2.invalid);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.busy() ? 43 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(45, 30, "sendVerification"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.emailSent() ? 46 : -1);
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.EmailValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.NgIcon, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmField, i7.HlmFieldError, i7.HlmFieldLabel, i8.HlmInput, i9.HlmAlert, i9.HlmAlertDescription, i9.HlmAlertTitle, i10.HlmCheckbox, i11.HlmSpinner, ProfileEditor, i12.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AccountHomePage, [{
        type: Component,
        args: [{
                selector: 'app-account-home',
                imports: [WorkspaceUi, HlmCheckboxImports, ProfileEditor],
                providers: [workspaceIcons],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: ` <app-page-header title="account" description="accountIntro"
      ><a hlmBtn variant="outline" routerLink="/security"
        ><ng-icon name="lucideShieldCheck" />{{ 'security' | t }}</a
      ></app-page-header
    >
    <app-page-state [state]="data.state()" (retry)="load()"
      ><div class="max-w-(--form-content-width) grid gap-6">
        <app-profile-editor [profile]="data.value()" (saved)="data.value.set($event)" />
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ data.value()?.displayName }}</h2>
            <p hlmCardDescription>{{ data.value()?.email }}</p>
          </div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'changeEmail' | t }}</h2>
            <p hlmCardDescription>{{ 'changeEmailHelp' | t }}</p>
          </div>
          <form
            hlmCardContent
            class="grid gap-5"
            #emailForm="ngForm"
            (ngSubmit)="emailForm.valid && changeEmail()"
          >
            <div hlmField>
              <label hlmFieldLabel for="new-email">{{ 'newEmail' | t }}</label
              ><input
                hlmInput
                id="new-email"
                name="email"
                type="email"
                autocomplete="email"
                email
                required
                maxlength="254"
                [(ngModel)]="email"
                #emailControl="ngModel"
              />
              @if (emailControl.invalid && emailControl.touched) {
                <hlm-field-error forceShow>{{ 'emailInvalid' | t }}</hlm-field-error>
              }
            </div>
            <div class="grid gap-5 sm:grid-cols-2">
              <div hlmField>
                <label hlmFieldLabel for="email-password">{{ 'currentPassword' | t }}</label
                ><input
                  hlmInput
                  id="email-password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  maxlength="1024"
                  [(ngModel)]="password"
                />
              </div>
              @if (data.value()?.mfaEnabled) {
                <div hlmField>
                  <label hlmFieldLabel for="email-code">{{ 'authenticatorCodeOptional' | t }}</label
                  ><input
                    hlmInput
                    id="email-code"
                    name="code"
                    autocomplete="one-time-code"
                    inputmode="numeric"
                    maxlength="64"
                    [(ngModel)]="code"
                  />
                </div>
                <div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="email-recovery"
                    name="recovery"
                    [(ngModel)]="recovery"
                  /><label hlmFieldLabel for="email-recovery">{{ 'useRecovery' | t }}</label>
                </div>
              }
            </div>
            <p class="workspace-meta">{{ 'emailProofHelp' | t }}</p>
            <div>
              <button hlmBtn [disabled]="busy() || emailForm.invalid">
                @if (busy()) {
                  <hlm-spinner />
                }
                {{ 'sendVerification' | t }}
              </button>
            </div>
            @if (emailSent()) {
              <div hlmAlert role="status">
                <h3 hlmAlertTitle>{{ 'emailChangeSent' | t }}</h3>
                <p hlmAlertDescription>{{ 'emailChangeSentHelp' | t }}</p>
              </div>
            }
          </form>
        </section>
      </div></app-page-state
    >`,
            }]
    }], () => [], { editor: [{ type: i0.ViewChild, args: [i0.forwardRef(() => ProfileEditor), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AccountHomePage, { className: "AccountHomePage", filePath: "src/app/features/account-home.ts", lineNumber: 112 }); })();
