import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { I18n, Translate } from '../core/i18n';
import { Registration } from '../core/registration';
import { AuthLayout } from './auth-layout';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/alert";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/field";
import * as i5 from "@spartan-ng/helm/input";
import * as i6 from "@spartan-ng/helm/spinner";
function SignupPage_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵelement(1, "hlm-spinner");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 1, "loading"), " ");
} }
function SignupPage_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 10)(1, "p", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 15);
    i0.ɵɵlistener("click", function SignupPage_Conditional_10_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.ngOnInit()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "loadFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "retry"));
} }
function SignupPage_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11)(1, "h2", 16);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 14);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "registrationUnavailable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "registrationUnavailableHelp"));
} }
function SignupPage_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11)(1, "h2", 16);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 14);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "checkEmail"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "registrationSent"));
} }
function SignupPage_Conditional_13_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "nameRequired"));
} }
function SignupPage_Conditional_13_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "emailInvalid"));
} }
function SignupPage_Conditional_13_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "passwordInvalid"));
} }
function SignupPage_Conditional_13_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 26);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.passwordErrors().join(" "));
} }
function SignupPage_Conditional_13_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 29);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "passwordMismatch"));
} }
function SignupPage_Conditional_13_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function SignupPage_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 17, 0);
    i0.ɵɵlistener("ngSubmit", function SignupPage_Conditional_13_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r3); const form_r4 = i0.ɵɵreference(1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(form_r4.valid && ctx_r1.password === ctx_r1.confirmation && ctx_r1.submit()); });
    i0.ɵɵelementStart(2, "div", 5)(3, "div", 18)(4, "label", 19);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "input", 20, 1);
    i0.ɵɵtwoWayListener("ngModelChange", function SignupPage_Conditional_13_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.displayName, $event) || (ctx_r1.displayName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(9, SignupPage_Conditional_13_Conditional_9_Template, 3, 3, "hlm-field-error");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 18)(11, "label", 21);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "input", 22, 2);
    i0.ɵɵtwoWayListener("ngModelChange", function SignupPage_Conditional_13_Template_input_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.email, $event) || (ctx_r1.email = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(16, "p", 23);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(19, SignupPage_Conditional_13_Conditional_19_Template, 3, 3, "hlm-field-error");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div", 18)(21, "label", 24);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "input", 25, 3);
    i0.ɵɵtwoWayListener("ngModelChange", function SignupPage_Conditional_13_Template_input_ngModelChange_24_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.password, $event) || (ctx_r1.password = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(26, "p", 23);
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(29, SignupPage_Conditional_13_Conditional_29_Template, 3, 3, "hlm-field-error");
    i0.ɵɵconditionalCreate(30, SignupPage_Conditional_13_Conditional_30_Template, 2, 1, "hlm-field-error", 26);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div", 18)(32, "label", 27);
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "input", 28, 4);
    i0.ɵɵtwoWayListener("ngModelChange", function SignupPage_Conditional_13_Template_input_ngModelChange_35_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.confirmation, $event) || (ctx_r1.confirmation = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(37, SignupPage_Conditional_13_Conditional_37_Template, 3, 3, "hlm-field-error", 29);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "button", 30);
    i0.ɵɵconditionalCreate(39, SignupPage_Conditional_13_Conditional_39_Template, 1, 0, "hlm-spinner");
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const form_r4 = i0.ɵɵreference(1);
    const nameControl_r5 = i0.ɵɵreference(8);
    const emailControl_r6 = i0.ɵɵreference(15);
    const passwordControl_r7 = i0.ɵɵreference(25);
    const confirmationControl_r8 = i0.ɵɵreference(36);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 19, "name"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.displayName);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(nameControl_r5.invalid && nameControl_r5.touched ? 9 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 21, "email"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.email);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 23, "signupEmailHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(emailControl_r6.invalid && emailControl_r6.touched ? 19 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 25, "password"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.password);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 27, "passwordHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(passwordControl_r7.invalid && passwordControl_r7.touched ? 29 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.passwordErrors().length ? 30 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 29, "confirmPassword"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("forceInvalid", confirmationControl_r8.touched && ctx_r1.password !== ctx_r1.confirmation);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.confirmation);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(confirmationControl_r8.touched && ctx_r1.password !== ctx_r1.confirmation ? 37 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r4.invalid || ctx_r1.password !== ctx_r1.confirmation);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.busy() ? 39 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(41, 31, "createAccount"), " ");
} }
export class SignupPage {
    registration = inject(Registration);
    i18n = inject(I18n);
    checking = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checking" }] : /* istanbul ignore next */ []));
    checkFailed = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checkFailed" }] : /* istanbul ignore next */ []));
    enabled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enabled" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    done = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "done" }] : /* istanbul ignore next */ []));
    passwordErrors = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "passwordErrors" }] : /* istanbul ignore next */ []));
    displayName = '';
    email = '';
    password = '';
    confirmation = '';
    async ngOnInit() {
        this.checking.set(true);
        this.checkFailed.set(false);
        try {
            this.enabled.set((await this.registration.status()).enabled);
        }
        catch {
            this.checkFailed.set(true);
        }
        finally {
            this.checking.set(false);
        }
    }
    async submit() {
        if (this.busy() || !this.enabled() || this.password !== this.confirmation)
            return;
        this.busy.set(true);
        this.passwordErrors.set([]);
        try {
            await this.registration.register({
                email: this.email.trim(),
                displayName: this.displayName.trim(),
                password: this.password,
                culture: this.i18n.culture(),
            });
            this.password = '';
            this.confirmation = '';
            this.done.set(true);
        }
        catch (error) {
            if (error instanceof HttpErrorResponse && error.error?.code === 'auth.registration_disabled')
                this.enabled.set(false);
            if (error instanceof HttpErrorResponse)
                this.passwordErrors.set(error.error?.errors?.password ?? []);
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function SignupPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SignupPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SignupPage, selectors: [["app-signup"]], decls: 20, vars: 13, consts: [["form", "ngForm"], ["nameControl", "ngModel"], ["emailControl", "ngModel"], ["passwordControl", "ngModel"], ["confirmationControl", "ngModel"], ["hlmFieldGroup", ""], [1, "auth-heading"], [1, "auth-title"], [1, "auth-description"], ["role", "status", 1, "flex", "items-center", "gap-2"], ["hlmAlert", "", "role", "alert"], ["hlmAlert", "", "role", "status"], ["hlmFieldDescription", "", 1, "text-center"], ["routerLink", "/login"], ["hlmAlertDescription", ""], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmAlertTitle", ""], [3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "signup-name"], ["hlmInput", "", "id", "signup-name", "name", "displayName", "autocomplete", "name", "required", "", "maxlength", "120", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "signup-email"], ["hlmInput", "", "id", "signup-email", "name", "email", "type", "email", "autocomplete", "email", "required", "", "email", "", "maxlength", "254", 3, "ngModelChange", "ngModel"], ["hlmFieldDescription", ""], ["hlmFieldLabel", "", "for", "signup-password"], ["hlmInput", "", "id", "signup-password", "name", "password", "type", "password", "autocomplete", "new-password", "required", "", "minlength", "8", "maxlength", "1024", 3, "ngModelChange", "ngModel"], ["forceShow", ""], ["hlmFieldLabel", "", "for", "signup-confirmation"], ["hlmInput", "", "id", "signup-confirmation", "name", "confirmation", "aria-describedby", "confirmation-error", "type", "password", "autocomplete", "new-password", "required", "", "maxlength", "1024", 3, "ngModelChange", "forceInvalid", "ngModel"], ["forceShow", "", "id", "confirmation-error"], ["hlmBtn", "", "type", "submit", 3, "disabled"]], template: function SignupPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-auth-layout")(1, "div", 5)(2, "div", 6)(3, "h1", 7);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 8);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, SignupPage_Conditional_9_Template, 4, 3, "div", 9)(10, SignupPage_Conditional_10_Template, 7, 6, "div", 10)(11, SignupPage_Conditional_11_Template, 7, 6, "div", 11)(12, SignupPage_Conditional_12_Template, 7, 6, "div", 11)(13, SignupPage_Conditional_13_Template, 42, 33, "form");
            i0.ɵɵelementStart(14, "p", 12);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementStart(17, "a", 13);
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "t");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "signupTitle"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "signupHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.checking() ? 9 : ctx.checkFailed() ? 10 : !ctx.enabled() ? 11 : ctx.done() ? 12 : 13);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 9, "alreadyAccount"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 11, "signIn"));
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MinLengthValidator, i1.MaxLengthValidator, i1.EmailValidator, i1.NgModel, i1.NgForm, RouterLink, i2.HlmAlert, i2.HlmAlertDescription, i2.HlmAlertTitle, i3.HlmButton, i4.HlmField, i4.HlmFieldDescription, i4.HlmFieldError, i4.HlmFieldGroup, i4.HlmFieldLabel, i5.HlmInput, i6.HlmSpinner, AuthLayout,
            Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SignupPage, [{
        type: Component,
        args: [{
                selector: 'app-signup',
                imports: [
                    FormsModule,
                    RouterLink,
                    HlmAlertImports,
                    HlmButtonImports,
                    HlmFieldImports,
                    HlmInputImports,
                    HlmSpinnerImports,
                    Translate,
                    AuthLayout,
                ],
                template: `
    <app-auth-layout>
      <div hlmFieldGroup>
        <div class="auth-heading">
          <h1 class="auth-title">{{ 'signupTitle' | t }}</h1>
          <p class="auth-description">{{ 'signupHelp' | t }}</p>
        </div>
        @if (checking()) {
          <div role="status" class="flex items-center gap-2">
            <hlm-spinner />{{ 'loading' | t }}
          </div>
        } @else if (checkFailed()) {
          <div hlmAlert role="alert">
            <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
            <button hlmBtn variant="outline" (click)="ngOnInit()">{{ 'retry' | t }}</button>
          </div>
        } @else if (!enabled()) {
          <div hlmAlert role="status">
            <h2 hlmAlertTitle>{{ 'registrationUnavailable' | t }}</h2>
            <p hlmAlertDescription>{{ 'registrationUnavailableHelp' | t }}</p>
          </div>
        } @else if (done()) {
          <div hlmAlert role="status">
            <h2 hlmAlertTitle>{{ 'checkEmail' | t }}</h2>
            <p hlmAlertDescription>{{ 'registrationSent' | t }}</p>
          </div>
        } @else {
          <form #form="ngForm" (ngSubmit)="form.valid && password === confirmation && submit()">
            <div hlmFieldGroup>
              <div hlmField>
                <label hlmFieldLabel for="signup-name">{{ 'name' | t }}</label>
                <input
                  hlmInput
                  id="signup-name"
                  name="displayName"
                  autocomplete="name"
                  [(ngModel)]="displayName"
                  #nameControl="ngModel"
                  required
                  maxlength="120"
                />
                @if (nameControl.invalid && nameControl.touched) {
                  <hlm-field-error>{{ 'nameRequired' | t }}</hlm-field-error>
                }
              </div>
              <div hlmField>
                <label hlmFieldLabel for="signup-email">{{ 'email' | t }}</label>
                <input
                  hlmInput
                  id="signup-email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  [(ngModel)]="email"
                  #emailControl="ngModel"
                  required
                  email
                  maxlength="254"
                />
                <p hlmFieldDescription>{{ 'signupEmailHelp' | t }}</p>
                @if (emailControl.invalid && emailControl.touched) {
                  <hlm-field-error>{{ 'emailInvalid' | t }}</hlm-field-error>
                }
              </div>
              <div hlmField>
                <label hlmFieldLabel for="signup-password">{{ 'password' | t }}</label>
                <input
                  hlmInput
                  id="signup-password"
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
                @if (passwordErrors().length) {
                  <hlm-field-error forceShow>{{ passwordErrors().join(' ') }}</hlm-field-error>
                }
              </div>
              <div hlmField>
                <label hlmFieldLabel for="signup-confirmation">{{ 'confirmPassword' | t }}</label>
                <input
                  hlmInput
                  id="signup-confirmation"
                  name="confirmation"
                  [forceInvalid]="confirmationControl.touched && password !== confirmation"
                  aria-describedby="confirmation-error"
                  type="password"
                  autocomplete="new-password"
                  [(ngModel)]="confirmation"
                  #confirmationControl="ngModel"
                  required
                  maxlength="1024"
                />
                @if (confirmationControl.touched && password !== confirmation) {
                  <hlm-field-error forceShow id="confirmation-error">{{
                    'passwordMismatch' | t
                  }}</hlm-field-error>
                }
              </div>
              <button
                hlmBtn
                type="submit"
                [disabled]="busy() || form.invalid || password !== confirmation"
              >
                @if (busy()) {
                  <hlm-spinner />
                }
                {{ 'createAccount' | t }}
              </button>
            </div>
          </form>
        }
        <p hlmFieldDescription class="text-center">
          {{ 'alreadyAccount' | t }} <a routerLink="/login">{{ 'signIn' | t }}</a>
        </p>
      </div>
    </app-auth-layout>
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SignupPage, { className: "SignupPage", filePath: "src/app/features/signup.ts", lineNumber: 154 }); })();
