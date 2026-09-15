import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthLayout } from './auth-layout';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { Bootstrap } from '../../../core/bootstrap';
import { Translate } from '../../../core/i18n';
import { Errors } from '../../../core/interceptors';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/alert";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/spinner";
import * as i5 from "@spartan-ng/helm/field";
import * as i6 from "@spartan-ng/helm/input";
function BootstrapPage_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "p", 10);
    i0.ɵɵelement(2, "hlm-spinner");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(4, 1, "checkingBootstrap"), " ");
} }
function BootstrapPage_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 8)(1, "p", 11);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 12);
    i0.ɵɵlistener("click", function BootstrapPage_Conditional_10_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.ngOnInit()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "loadFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "retry"));
} }
function BootstrapPage_Conditional_11_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14)(1, "h2", 24);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 11);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "bootstrapRejected"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "bootstrapRejectedHelp"));
} }
function BootstrapPage_Conditional_11_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "usernameRequired"));
} }
function BootstrapPage_Conditional_11_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx));
} }
function BootstrapPage_Conditional_11_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "passwordInvalid"));
} }
function BootstrapPage_Conditional_11_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx));
} }
function BootstrapPage_Conditional_11_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "bootstrapTokenRequired"));
} }
function BootstrapPage_Conditional_11_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx));
} }
function BootstrapPage_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 13, 0);
    i0.ɵɵlistener("ngSubmit", function BootstrapPage_Conditional_11_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r3); const form_r4 = i0.ɵɵreference(1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(form_r4.valid && ctx_r1.submit()); });
    i0.ɵɵconditionalCreate(2, BootstrapPage_Conditional_11_Conditional_2_Template, 7, 6, "div", 14);
    i0.ɵɵelementStart(3, "div", 15)(4, "label", 16);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "input", 17, 1);
    i0.ɵɵtwoWayListener("ngModelChange", function BootstrapPage_Conditional_11_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.username, $event) || (ctx_r1.username = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(9, BootstrapPage_Conditional_11_Conditional_9_Template, 3, 3, "hlm-field-error");
    i0.ɵɵconditionalCreate(10, BootstrapPage_Conditional_11_Conditional_10_Template, 3, 3, "hlm-field-error");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 15)(12, "label", 18);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "input", 19, 2);
    i0.ɵɵtwoWayListener("ngModelChange", function BootstrapPage_Conditional_11_Template_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.password, $event) || (ctx_r1.password = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(17, "p", 20);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, BootstrapPage_Conditional_11_Conditional_20_Template, 3, 3, "hlm-field-error");
    i0.ɵɵconditionalCreate(21, BootstrapPage_Conditional_11_Conditional_21_Template, 3, 3, "hlm-field-error");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "div", 15)(23, "label", 21);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "input", 22, 3);
    i0.ɵɵtwoWayListener("ngModelChange", function BootstrapPage_Conditional_11_Template_input_ngModelChange_26_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.token, $event) || (ctx_r1.token = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(28, "p", 20);
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(31, BootstrapPage_Conditional_11_Conditional_31_Template, 3, 3, "hlm-field-error");
    i0.ɵɵconditionalCreate(32, BootstrapPage_Conditional_11_Conditional_32_Template, 3, 3, "hlm-field-error");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "button", 23);
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_10_0;
    let tmp_16_0;
    let tmp_22_0;
    const form_r4 = i0.ɵɵreference(1);
    const usernameControl_r5 = i0.ɵɵreference(8);
    const passwordControl_r6 = i0.ɵɵreference(16);
    const tokenControl_r7 = i0.ɵɵreference(27);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.rejected() ? 2 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 17, "username"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.username);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(usernameControl_r5.invalid && usernameControl_r5.touched ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_10_0 = ctx_r1.fieldError("username")) ? 10 : -1, tmp_10_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 19, "password"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.password);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 21, "passwordHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(passwordControl_r6.invalid && passwordControl_r6.touched ? 20 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_16_0 = ctx_r1.fieldError("password")) ? 21 : -1, tmp_16_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 23, "bootstrapToken"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.token);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 25, "bootstrapTokenHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(tokenControl_r7.invalid && tokenControl_r7.touched ? 31 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_22_0 = ctx_r1.fieldError("token")) ? 32 : -1, tmp_22_0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r4.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(35, 27, ctx_r1.busy() ? "loading" : "createAdministrator"), " ");
} }
function BootstrapPage_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "div", 25)(2, "h2", 24);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 11);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 26)(9, "a", 27);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, "bootstrapUnavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "bootstrapUnavailableHelp"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 7, "signIn"));
} }
export class BootstrapPage {
    bootstrap = inject(Bootstrap);
    errors = inject(Errors);
    router = inject(Router);
    checking = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checking" }] : /* istanbul ignore next */ []));
    checkFailed = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checkFailed" }] : /* istanbul ignore next */ []));
    available = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "available" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    rejected = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rejected" }] : /* istanbul ignore next */ []));
    fieldErrors = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fieldErrors" }] : /* istanbul ignore next */ []));
    username = '';
    password = '';
    token = '';
    async ngOnInit() {
        this.checking.set(true);
        this.checkFailed.set(false);
        try {
            this.available.set((await this.bootstrap.available()).available);
            if (!this.available())
                await this.router.navigateByUrl('/login');
        }
        catch {
            this.errors.problem.set(null);
            this.checkFailed.set(true);
        }
        finally {
            this.checking.set(false);
        }
    }
    fieldError(field) {
        return this.fieldErrors()[field.toLowerCase()];
    }
    async submit() {
        this.busy.set(true);
        this.rejected.set(false);
        this.fieldErrors.set({});
        try {
            await this.bootstrap.create({
                token: this.token,
                username: this.username.trim(),
                password: this.password,
            });
            this.token = '';
            this.password = '';
            await this.router.navigateByUrl('/login');
        }
        catch (error) {
            this.errors.problem.set(null);
            if (error instanceof HttpErrorResponse && [404, 409, 410].includes(error.status)) {
                await this.router.navigateByUrl('/login');
                return;
            }
            if (error instanceof HttpErrorResponse && error.status === 400) {
                const serverErrors = error.error?.errors;
                if (serverErrors) {
                    this.fieldErrors.set(Object.fromEntries(Object.entries(serverErrors)
                        .filter(([key, messages]) => ['token', 'username', 'password'].includes(key.toLowerCase()) &&
                        messages.length)
                        .map(([key]) => [key.toLowerCase(), `${key.toLowerCase()}Invalid`])));
                }
            }
            this.token = '';
            this.rejected.set(true);
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function BootstrapPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BootstrapPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BootstrapPage, selectors: [["app-bootstrap"]], decls: 13, vars: 7, consts: [["form", "ngForm"], ["usernameControl", "ngModel"], ["passwordControl", "ngModel"], ["tokenControl", "ngModel"], ["hlmFieldGroup", ""], [1, "auth-heading"], [1, "auth-title"], [1, "auth-description"], ["hlmAlert", "", "role", "alert"], ["hlmFieldGroup", "", 1, "auth-fields"], ["role", "status", 1, "flex", "items-center", "gap-2"], ["hlmAlertDescription", ""], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmFieldGroup", "", 1, "auth-fields", 3, "ngSubmit"], ["hlmAlert", "", "variant", "destructive", "role", "alert"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "bootstrap-username"], ["hlmInput", "", "id", "bootstrap-username", "name", "username", "autocomplete", "username", "required", "", "maxlength", "256", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "bootstrap-password"], ["hlmInput", "", "id", "bootstrap-password", "name", "password", "type", "password", "autocomplete", "new-password", "required", "", "minlength", "8", "maxlength", "1024", 3, "ngModelChange", "ngModel"], ["hlmFieldDescription", ""], ["hlmFieldLabel", "", "for", "bootstrap-token"], ["hlmInput", "", "id", "bootstrap-token", "name", "token", "type", "password", "autocomplete", "off", "autocapitalize", "none", "spellcheck", "false", "required", "", "maxlength", "4096", 3, "ngModelChange", "ngModel"], ["hlmBtn", "", "type", "submit", 3, "disabled"], ["hlmAlertTitle", ""], ["hlmAlert", "", "role", "status"], [1, "auth-footer"], ["hlmBtn", "", "routerLink", "/login"]], template: function BootstrapPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-auth-layout")(1, "div", 4)(2, "div", 5)(3, "h1", 6);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 7);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, BootstrapPage_Conditional_9_Template, 5, 3, "div", 4)(10, BootstrapPage_Conditional_10_Template, 7, 6, "div", 8)(11, BootstrapPage_Conditional_11_Template, 36, 29, "form", 9)(12, BootstrapPage_Conditional_12_Template, 12, 9);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "bootstrapTitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "bootstrapHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.checking() ? 9 : ctx.checkFailed() ? 10 : ctx.available() ? 11 : 12);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MinLengthValidator, i1.MaxLengthValidator, i1.NgModel, i1.NgForm, RouterLink, i2.HlmAlert, i2.HlmAlertDescription, i2.HlmAlertTitle, i3.HlmButton, AuthLayout, i4.HlmSpinner, i5.HlmField, i5.HlmFieldDescription, i5.HlmFieldError, i5.HlmFieldGroup, i5.HlmFieldLabel, i6.HlmInput, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BootstrapPage, [{
        type: Component,
        args: [{
                selector: 'app-bootstrap',
                imports: [
                    FormsModule,
                    RouterLink,
                    HlmAlertImports,
                    HlmButtonImports,
                    AuthLayout,
                    HlmSpinnerImports,
                    HlmFieldImports,
                    HlmInputImports,
                    Translate,
                ],
                template: `
    <app-auth-layout
      ><div hlmFieldGroup>
        <div class="auth-heading">
          <h1 class="auth-title">{{ 'bootstrapTitle' | t }}</h1>
          <p class="auth-description">{{ 'bootstrapHelp' | t }}</p>
        </div>

        @if (checking()) {
          <div hlmFieldGroup>
            <p role="status" class="flex items-center gap-2">
              <hlm-spinner />{{ 'checkingBootstrap' | t }}
            </p>
          </div>
        } @else if (checkFailed()) {
          <div hlmAlert role="alert">
            <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
            <button hlmBtn variant="outline" (click)="ngOnInit()">{{ 'retry' | t }}</button>
          </div>
        } @else if (available()) {
          <form
            hlmFieldGroup
            class="auth-fields"
            #form="ngForm"
            (ngSubmit)="form.valid && submit()"
          >
            @if (rejected()) {
              <div hlmAlert variant="destructive" role="alert">
                <h2 hlmAlertTitle>{{ 'bootstrapRejected' | t }}</h2>
                <p hlmAlertDescription>{{ 'bootstrapRejectedHelp' | t }}</p>
              </div>
            }

            <div hlmField>
              <label hlmFieldLabel for="bootstrap-username">{{ 'username' | t }}</label>
              <input
                hlmInput
                id="bootstrap-username"
                name="username"
                autocomplete="username"
                [(ngModel)]="username"
                #usernameControl="ngModel"
                required
                maxlength="256"
              />
              @if (usernameControl.invalid && usernameControl.touched) {
                <hlm-field-error>{{ 'usernameRequired' | t }}</hlm-field-error>
              }
              @if (fieldError('username'); as error) {
                <hlm-field-error>{{ error | t }}</hlm-field-error>
              }
            </div>

            <div hlmField>
              <label hlmFieldLabel for="bootstrap-password">{{ 'password' | t }}</label>
              <input
                hlmInput
                id="bootstrap-password"
                name="password"
                type="password"
                autocomplete="new-password"
                [(ngModel)]="password"
                #passwordControl="ngModel"
                required
                minlength="8"
                maxlength="1024"
              />
              <p hlmFieldDescription>{{ 'passwordHelp' | t }}</p>
              @if (passwordControl.invalid && passwordControl.touched) {
                <hlm-field-error>{{ 'passwordInvalid' | t }}</hlm-field-error>
              }
              @if (fieldError('password'); as error) {
                <hlm-field-error>{{ error | t }}</hlm-field-error>
              }
            </div>

            <div hlmField>
              <label hlmFieldLabel for="bootstrap-token">{{ 'bootstrapToken' | t }}</label>
              <input
                hlmInput
                id="bootstrap-token"
                name="token"
                type="password"
                autocomplete="off"
                autocapitalize="none"
                spellcheck="false"
                [(ngModel)]="token"
                #tokenControl="ngModel"
                required
                maxlength="4096"
              />
              <p hlmFieldDescription>{{ 'bootstrapTokenHelp' | t }}</p>
              @if (tokenControl.invalid && tokenControl.touched) {
                <hlm-field-error>{{ 'bootstrapTokenRequired' | t }}</hlm-field-error>
              }
              @if (fieldError('token'); as error) {
                <hlm-field-error>{{ error | t }}</hlm-field-error>
              }
            </div>

            <button hlmBtn type="submit" [disabled]="busy() || form.invalid">
              {{ (busy() ? 'loading' : 'createAdministrator') | t }}
            </button>
          </form>
        } @else {
          <div hlmFieldGroup>
            <div hlmAlert role="status">
              <h2 hlmAlertTitle>{{ 'bootstrapUnavailable' | t }}</h2>
              <p hlmAlertDescription>{{ 'bootstrapUnavailableHelp' | t }}</p>
            </div>
          </div>
          <div class="auth-footer">
            <a hlmBtn routerLink="/login">{{ 'signIn' | t }}</a>
          </div>
        }
      </div></app-auth-layout
    >
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BootstrapPage, { className: "BootstrapPage", filePath: "src/app/features/bootstrap.ts", lineNumber: 147 }); })();
