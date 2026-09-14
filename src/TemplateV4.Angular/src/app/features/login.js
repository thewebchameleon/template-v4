import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucideKeyRound, lucideMail, lucideSmartphone } from '@ng-icons/lucide';
import { BrnInputOtp } from '@spartan-ng/brain/input-otp';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { AuthLayout } from './auth-layout';
import { Registration } from '../core/registration';
import { Auth } from '../core/auth';
import { Passkeys } from '../core/passkeys';
import { Translate } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { UiSounds } from '../core/ui-sounds';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/button";
import * as i3 from "@spartan-ng/helm/input";
import * as i4 from "@spartan-ng/helm/input-otp";
import * as i5 from "@spartan-ng/helm/field";
import * as i6 from "@spartan-ng/helm/checkbox";
import * as i7 from "@spartan-ng/helm/spinner";
import * as i8 from "@spartan-ng/helm/dialog";
function LoginPage_Conditional_9_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 21);
    i0.ɵɵlistener("click", function LoginPage_Conditional_9_For_6_Template_button_click_0_listener() { const method_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.selectMethod(method_r3)); });
    i0.ɵɵelement(1, "ng-icon", 22);
    i0.ɵɵelementStart(2, "span", 23)(3, "span", 24);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 25);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(9, "ng-icon", 26);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const method_r3 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r3.busy());
    i0.ɵɵattribute("aria-labelledby", "method-label-" + method_r3)("aria-describedby", "method-description-" + method_r3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("name", ctx_r3.methodIcon(method_r3));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "method-label-" + method_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 8, ctx_r3.methodLabel(method_r3)));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "method-description-" + method_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 10, ctx_r3.methodDescription(method_r3)), " ");
} }
function LoginPage_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "fieldset", 6)(1, "legend", 18);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 19);
    i0.ɵɵrepeaterCreate(5, LoginPage_Conditional_9_For_6_Template, 10, 12, "button", 20, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "authenticationMethod"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r3.auth.mfaMethods());
} }
function LoginPage_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 8)(1, "label", 27);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 28);
    i0.ɵɵtwoWayListener("ngModelChange", function LoginPage_Conditional_12_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.username, $event) || (ctx_r3.username = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 8)(6, "label", 29);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "input", 30);
    i0.ɵɵtwoWayListener("ngModelChange", function LoginPage_Conditional_12_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.password, $event) || (ctx_r3.password = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "username"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.username);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 6, "password"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.password);
    i0.ɵɵcontrol();
} }
function LoginPage_Conditional_13_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-input-otp-slot", 33);
} if (rf & 2) {
    const slot_r8 = ctx.$implicit;
    i0.ɵɵproperty("index", slot_r8);
} }
function LoginPage_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 8)(1, "label", 31);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 12);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "brn-input-otp", 32);
    i0.ɵɵtwoWayListener("valueChange", function LoginPage_Conditional_13_Template_brn_input_otp_valueChange_7_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.code, $event) || (ctx_r3.code = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(8, "hlm-input-otp-group");
    i0.ɵɵrepeaterCreate(9, LoginPage_Conditional_13_For_10_Template, 1, 1, "hlm-input-otp-slot", 33, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "emailCode"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 7, "emailCodeHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("length", 6)("disabled", ctx_r3.busy() || !ctx_r3.auth.emailCodeSent());
    i0.ɵɵtwoWayProperty("value", ctx_r3.code);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.otpSlots);
} }
function LoginPage_Conditional_14_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 40);
    i0.ɵɵtwoWayListener("ngModelChange", function LoginPage_Conditional_14_Conditional_4_Template_input_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.code, $event) || (ctx_r3.code = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.code);
    i0.ɵɵcontrol();
} }
function LoginPage_Conditional_14_Conditional_5_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-input-otp-slot", 33);
} if (rf & 2) {
    const slot_r12 = ctx.$implicit;
    i0.ɵɵproperty("index", slot_r12);
} }
function LoginPage_Conditional_14_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "brn-input-otp", 41);
    i0.ɵɵtwoWayListener("valueChange", function LoginPage_Conditional_14_Conditional_5_Template_brn_input_otp_valueChange_0_listener($event) { i0.ɵɵrestoreView(_r11); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.code, $event) || (ctx_r3.code = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(1, "hlm-input-otp-group");
    i0.ɵɵrepeaterCreate(2, LoginPage_Conditional_14_Conditional_5_For_3_Template, 1, 1, "hlm-input-otp-slot", 33, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("length", 6)("disabled", ctx_r3.busy());
    i0.ɵɵtwoWayProperty("value", ctx_r3.code);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.otpSlots);
} }
function LoginPage_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 8)(1, "label", 34);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, LoginPage_Conditional_14_Conditional_4_Template, 1, 1, "input", 35)(5, LoginPage_Conditional_14_Conditional_5_Template, 4, 3, "brn-input-otp", 36);
    i0.ɵɵelementStart(6, "div", 37)(7, "hlm-checkbox", 38);
    i0.ɵɵtwoWayListener("ngModelChange", function LoginPage_Conditional_14_Template_hlm_checkbox_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.recovery, $event) || (ctx_r3.recovery = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(8, "label", 39);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "factorCode"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.recovery ? 4 : 5);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.recovery);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 6, "useRecovery"));
} }
function LoginPage_Conditional_15_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function LoginPage_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 9);
    i0.ɵɵconditionalCreate(1, LoginPage_Conditional_15_Conditional_1_Template, 1, 0, "hlm-spinner");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    const form_r5 = i0.ɵɵreference(11);
    i0.ɵɵproperty("disabled", ctx_r3.busy() || form_r5.invalid || ctx_r3.auth.challenge() && ctx_r3.code.length < 6);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.busy() ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 3, ctx_r3.auth.challenge() ? "verify" : "signIn"), " ");
} }
function LoginPage_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 42);
    i0.ɵɵlistener("click", function LoginPage_Conditional_17_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.sendEmailCode()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r3.busy() || ctx_r3.resendSeconds() > 0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.resendSeconds() > 0 ? i0.ɵɵpipeBind1(2, 2, "resendIn") + " " + ctx_r3.resendSeconds() + "s" : i0.ɵɵpipeBind1(3, 4, "resendCode"), " ");
} }
function LoginPage_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "passkeysUnsupported"));
} }
function LoginPage_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-field-separator");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 42);
    i0.ɵɵlistener("click", function LoginPage_Conditional_19_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r14); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.passkey()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "orContinueWith"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 5, "signInPasskey"), " ");
} }
function LoginPage_Conditional_20_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 45);
    i0.ɵɵlistener("click", function LoginPage_Conditional_20_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r16); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.chooseAnotherMethod()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r3.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "chooseAnotherMethod"), " ");
} }
function LoginPage_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, LoginPage_Conditional_20_Conditional_0_Template, 3, 4, "button", 43);
    i0.ɵɵelementStart(1, "button", 44);
    i0.ɵɵlistener("click", function LoginPage_Conditional_20_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r15); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.resetChallenge()); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r3.challengeStep() === "factor" ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "startAgain"), " ");
} }
function LoginPage_hlm_dialog_content_25_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function LoginPage_hlm_dialog_content_25_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-dialog-content")(1, "hlm-dialog-header")(2, "h2", 46);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 47);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "form", 48, 1);
    i0.ɵɵlistener("ngSubmit", function LoginPage_hlm_dialog_content_25_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r17); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.forgot()); });
    i0.ɵɵelementStart(10, "div", 8)(11, "label", 49);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "input", 50);
    i0.ɵɵtwoWayListener("ngModelChange", function LoginPage_hlm_dialog_content_25_Template_input_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r17); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.recoveryEmail, $event) || (ctx_r3.recoveryEmail = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "hlm-dialog-footer")(16, "button", 9);
    i0.ɵɵconditionalCreate(17, LoginPage_hlm_dialog_content_25_Conditional_17_Template, 1, 0, "hlm-spinner");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const recoveryForm_r18 = i0.ɵɵreference(9);
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, "forgotPasswordTitle"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 9, "recoveryEmailHelp"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 11, "recoveryEmail"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.recoveryEmail);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.busy() || recoveryForm_r18.invalid);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.busy() ? 17 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 13, "sendResetLink"), " ");
} }
function LoginPage_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "sent"));
} }
function LoginPage_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 17);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementStart(3, "a", 51);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "noAccount"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "signUp"));
} }
export class LoginPage {
    registration = inject(Registration);
    registrationEnabled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "registrationEnabled" }] : /* istanbul ignore next */ []));
    auth = inject(Auth);
    passkeys = inject(Passkeys);
    selectedMethod = signal('Email', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedMethod" }] : /* istanbul ignore next */ []));
    challengeStep = signal('choose', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "challengeStep" }] : /* istanbul ignore next */ []));
    resendSeconds = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resendSeconds" }] : /* istanbul ignore next */ []));
    otpSlots = [0, 1, 2, 3, 4, 5];
    router = inject(Router);
    route = inject(ActivatedRoute);
    countdown;
    code = '';
    recovery = false;
    username = '';
    recoveryEmail = '';
    recoverySent = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "recoverySent" }] : /* istanbul ignore next */ []));
    forgotDialogState = signal('closed', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "forgotDialogState" }] : /* istanbul ignore next */ []));
    password = '';
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    notifications = inject(Notifications);
    sounds = inject(UiSounds);
    async ngOnInit() {
        try {
            this.registrationEnabled.set((await this.registration.status()).enabled);
        }
        catch {
            /* Central Problem Details UI; do not offer unavailable registration. */
        }
    }
    ngOnDestroy() {
        if (this.countdown)
            clearInterval(this.countdown);
    }
    methodLabel(method) {
        return method === 'Passkey'
            ? 'passkeyMethod'
            : method === 'Authenticator'
                ? 'authenticatorMethod'
                : 'emailMethod';
    }
    methodIcon(method) {
        return method === 'Passkey'
            ? 'lucideKeyRound'
            : method === 'Authenticator'
                ? 'lucideSmartphone'
                : 'lucideMail';
    }
    methodDescription(method) {
        return method === 'Passkey'
            ? 'passkeyMethodDescription'
            : method === 'Authenticator'
                ? 'authenticatorMethodDescription'
                : 'emailMethodDescription';
    }
    async selectMethod(value) {
        if (typeof value !== 'string' || !value || this.busy())
            return;
        this.selectedMethod.set(value);
        this.code = '';
        this.recovery = false;
        if (value === 'Passkey') {
            if (this.passkeys.supported)
                await this.passkey();
            else
                this.challengeStep.set('factor');
            return;
        }
        this.challengeStep.set('factor');
        if (value === 'Email' && !this.auth.emailCodeSent() && this.resendSeconds() === 0)
            await this.sendEmailCode();
    }
    async submit() {
        this.busy.set(true);
        try {
            if (this.auth.challenge()) {
                await this.auth.completeMfa(this.selectedMethod(), this.code, this.recovery);
            }
            else {
                await this.auth.login(this.username, this.password);
                this.password = '';
                if (this.auth.challenge()) {
                    this.selectedMethod.set(this.auth.preferredMfaMethod());
                    this.challengeStep.set(this.auth.preferredMfaMethod() === 'Passkey' ? 'choose' : 'factor');
                    this.startCountdown();
                }
            }
            if (this.auth.access())
                await this.navigateAfterAuthentication();
        }
        catch {
            /* Central Problem Details UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async sendEmailCode() {
        if (this.busy() || this.resendSeconds() > 0)
            return;
        this.busy.set(true);
        try {
            await this.auth.sendEmailCode();
            this.code = '';
            this.startCountdown();
            this.notifications.success('emailCodeSent');
        }
        catch {
            /* Central Problem Details UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async passkey() {
        this.busy.set(true);
        try {
            const challenge = this.auth.challenge();
            if (challenge)
                await this.passkeys.completeMfa(challenge);
            else
                await this.passkeys.login();
            await this.navigateAfterAuthentication();
        }
        catch {
            /* Error UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    resetChallenge() {
        this.auth.resetChallenge();
        this.selectedMethod.set('Email');
        this.challengeStep.set('choose');
        this.code = '';
        this.recovery = false;
        this.resendSeconds.set(0);
        if (this.countdown)
            clearInterval(this.countdown);
    }
    chooseAnotherMethod() {
        this.challengeStep.set('choose');
        this.code = '';
        this.recovery = false;
    }
    startCountdown() {
        if (this.countdown)
            clearInterval(this.countdown);
        const update = () => {
            const resendAt = this.auth.emailResendAt();
            this.resendSeconds.set(resendAt ? Math.max(0, Math.ceil((Date.parse(resendAt) - Date.now()) / 1000)) : 0);
        };
        update();
        if (this.resendSeconds() > 0)
            this.countdown = setInterval(() => {
                update();
                if (this.resendSeconds() === 0 && this.countdown)
                    clearInterval(this.countdown);
            }, 1000);
    }
    async navigateAfterAuthentication() {
        if (!this.auth.access())
            return;
        this.sounds.play('success');
        const requested = this.route.snapshot.queryParamMap.get('returnUrl');
        const safe = requested?.startsWith('/') && !requested.startsWith('//') && !requested.startsWith('/login')
            ? requested
            : this.auth.landing();
        await this.router.navigateByUrl(this.auth.access()?.setupRequired ? '/security' : safe);
    }
    async forgot() {
        if (!this.recoveryEmail)
            return;
        this.busy.set(true);
        try {
            await this.auth.action('forgot-password', { email: this.recoveryEmail });
            this.notifications.success('sent');
            this.recoverySent.set(true);
            this.recoveryEmail = '';
            this.forgotDialogState.set('closed');
        }
        catch {
            /* Central Problem Details UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function LoginPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LoginPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LoginPage, selectors: [["app-login"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronRight, lucideKeyRound, lucideMail, lucideSmartphone })])], decls: 28, vars: 19, consts: [["form", "ngForm"], ["recoveryForm", "ngForm"], ["hlmFieldGroup", ""], [1, "auth-heading"], [1, "auth-title"], [1, "auth-description"], ["hlmFieldSet", ""], [1, "auth-fields", 3, "ngSubmit"], ["hlmField", ""], ["hlmBtn", "", "type", "submit", 3, "disabled"], [1, "auth-footer"], ["hlmBtn", "", "variant", "outline", 3, "disabled"], ["hlmFieldDescription", ""], [3, "stateChanged", "state"], ["hlmBtn", "", "variant", "link", "hlmDialogTrigger", "", 3, "disabled"], [4, "hlmDialogPortal"], ["role", "status", 1, "text-sm", "text-muted-foreground"], ["hlmFieldDescription", "", 1, "text-center"], ["hlmFieldLegend", ""], [1, "flex", "flex-col", "gap-2"], ["hlmBtn", "", "variant", "outline", "type", "button", 1, "h-auto", "w-full", "justify-start", "gap-3", "py-3", "text-left", "whitespace-normal", 3, "disabled"], ["hlmBtn", "", "variant", "outline", "type", "button", 1, "h-auto", "w-full", "justify-start", "gap-3", "py-3", "text-left", "whitespace-normal", 3, "click", "disabled"], ["size", "1.5rem", "aria-hidden", "true", 3, "name"], [1, "flex", "min-w-0", "flex-1", "flex-col", "gap-1"], [3, "id"], [1, "text-sm", "font-normal", "text-muted-foreground", 3, "id"], ["name", "lucideChevronRight", "aria-hidden", "true"], ["hlmFieldLabel", "", "for", "username"], ["hlmInput", "", "id", "username", "name", "username", "autocomplete", "username", "required", "", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "password"], ["hlmInput", "", "id", "password", "name", "password", "type", "password", "autocomplete", "current-password", "required", "", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "email-code"], ["hlmInputOtp", "", "inputId", "email-code", "inputAutocomplete", "one-time-code", "inputMode", "numeric", 3, "valueChange", "length", "disabled", "value"], [3, "index"], ["hlmFieldLabel", "", "for", "factor"], ["hlmInput", "", "id", "factor", "name", "factor", "autocomplete", "one-time-code", "required", "", 3, "ngModel"], ["hlmInputOtp", "", "inputId", "factor", "inputAutocomplete", "one-time-code", "inputMode", "numeric", 3, "length", "disabled", "value"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "recovery", "name", "recovery", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "recovery"], ["hlmInput", "", "id", "factor", "name", "factor", "autocomplete", "one-time-code", "required", "", 3, "ngModelChange", "ngModel"], ["hlmInputOtp", "", "inputId", "factor", "inputAutocomplete", "one-time-code", "inputMode", "numeric", 3, "valueChange", "length", "disabled", "value"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["hlmBtn", "", "variant", "link", 3, "disabled"], ["hlmBtn", "", "variant", "link", 3, "click"], ["hlmBtn", "", "variant", "link", 3, "click", "disabled"], ["hlmDialogTitle", ""], ["hlmDialogDescription", ""], [1, "flex", "flex-col", "gap-6", 3, "ngSubmit"], ["hlmFieldLabel", "", "for", "recovery-email"], ["hlmInput", "", "id", "recovery-email", "name", "recoveryEmail", "type", "email", "autocomplete", "email", "required", "", 3, "ngModelChange", "ngModel"], ["routerLink", "/signup"]], template: function LoginPage_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "app-auth-layout")(1, "div", 2)(2, "div", 3)(3, "h1", 4);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 5);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, LoginPage_Conditional_9_Template, 7, 3, "fieldset", 6);
            i0.ɵɵelementStart(10, "form", 7, 0);
            i0.ɵɵlistener("ngSubmit", function LoginPage_Template_form_ngSubmit_10_listener() { i0.ɵɵrestoreView(_r1); const form_r5 = i0.ɵɵreference(11); return i0.ɵɵresetView(form_r5.valid && ctx.submit()); });
            i0.ɵɵconditionalCreate(12, LoginPage_Conditional_12_Template, 10, 8)(13, LoginPage_Conditional_13_Template, 11, 9, "div", 8)(14, LoginPage_Conditional_14_Template, 11, 8, "div", 8);
            i0.ɵɵconditionalCreate(15, LoginPage_Conditional_15_Template, 4, 5, "button", 9);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "div", 10);
            i0.ɵɵconditionalCreate(17, LoginPage_Conditional_17_Template, 4, 6, "button", 11);
            i0.ɵɵconditionalCreate(18, LoginPage_Conditional_18_Template, 3, 3, "p", 12)(19, LoginPage_Conditional_19_Template, 6, 7);
            i0.ɵɵconditionalCreate(20, LoginPage_Conditional_20_Template, 4, 4);
            i0.ɵɵelementStart(21, "hlm-dialog", 13);
            i0.ɵɵlistener("stateChanged", function LoginPage_Template_hlm_dialog_stateChanged_21_listener($event) { return ctx.forgotDialogState.set($event); });
            i0.ɵɵelementStart(22, "button", 14);
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(25, LoginPage_hlm_dialog_content_25_Template, 20, 15, "hlm-dialog-content", 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(26, LoginPage_Conditional_26_Template, 3, 3, "p", 16);
            i0.ɵɵconditionalCreate(27, LoginPage_Conditional_27_Template, 6, 6, "p", 17);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 13, ctx.auth.challenge() ? "verifyIdentity" : "welcome"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 15, ctx.auth.challenge() ? "chooseMfaHelp" : "loginHelp"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.auth.challenge() && ctx.challengeStep() === "choose" ? 9 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.auth.challenge() ? 12 : ctx.challengeStep() === "factor" && ctx.selectedMethod() === "Email" ? 13 : ctx.challengeStep() === "factor" && ctx.selectedMethod() === "Authenticator" ? 14 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.auth.challenge() || ctx.challengeStep() === "factor" && ctx.selectedMethod() !== "Passkey" ? 15 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.auth.challenge() && ctx.challengeStep() === "factor" && ctx.selectedMethod() === "Email" ? 17 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.auth.challenge() && ctx.challengeStep() === "factor" && ctx.selectedMethod() === "Passkey" && !ctx.passkeys.supported ? 18 : !ctx.auth.challenge() && ctx.passkeys.supported ? 19 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.auth.challenge() ? 20 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.forgotDialogState());
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(24, 17, "forgot"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.recoverySent() ? 26 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.auth.challenge() && ctx.registrationEnabled() ? 27 : -1);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.NgModel, i1.NgForm, BrnInputOtp, i2.HlmButton, i3.HlmInput, i4.HlmInputOtp, i4.HlmInputOtpGroup, i4.HlmInputOtpSlot, i5.HlmField, i5.HlmFieldDescription, i5.HlmFieldGroup, i5.HlmFieldLabel, i5.HlmFieldLegend, i5.HlmFieldSeparator, i5.HlmFieldSet, i6.HlmCheckbox, i7.HlmSpinner, i8.HlmDialog, i8.HlmDialogContent, i8.HlmDialogDescription, i8.HlmDialogFooter, i8.HlmDialogHeader, i8.HlmDialogPortal, i8.HlmDialogTitle, i8.HlmDialogTrigger, NgIcon,
            AuthLayout,
            RouterLink,
            Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LoginPage, [{
        type: Component,
        args: [{
                selector: 'app-login',
                providers: [provideIcons({ lucideChevronRight, lucideKeyRound, lucideMail, lucideSmartphone })],
                imports: [
                    FormsModule,
                    BrnInputOtp,
                    HlmButtonImports,
                    HlmInputImports,
                    HlmInputOtpImports,
                    HlmFieldImports,
                    HlmCheckboxImports,
                    HlmSpinnerImports,
                    HlmDialogImports,
                    NgIcon,
                    AuthLayout,
                    RouterLink,
                    Translate,
                ],
                template: ` <app-auth-layout
    ><div hlmFieldGroup>
      <div class="auth-heading">
        <h1 class="auth-title">{{ (auth.challenge() ? 'verifyIdentity' : 'welcome') | t }}</h1>
        <p class="auth-description">
          {{ (auth.challenge() ? 'chooseMfaHelp' : 'loginHelp') | t }}
        </p>
      </div>
      @if (auth.challenge() && challengeStep() === 'choose') {
        <fieldset hlmFieldSet>
          <legend hlmFieldLegend>{{ 'authenticationMethod' | t }}</legend>
          <div class="flex flex-col gap-2">
            @for (method of auth.mfaMethods(); track method) {
              <button
                hlmBtn
                variant="outline"
                type="button"
                class="h-auto w-full justify-start gap-3 py-3 text-left whitespace-normal"
                [disabled]="busy()"
                (click)="selectMethod(method)"
                [attr.aria-labelledby]="'method-label-' + method"
                [attr.aria-describedby]="'method-description-' + method"
              >
                <ng-icon [name]="methodIcon(method)" size="1.5rem" aria-hidden="true" />
                <span class="flex min-w-0 flex-1 flex-col gap-1">
                  <span [id]="'method-label-' + method">{{ methodLabel(method) | t }}</span>
                  <span
                    class="text-sm font-normal text-muted-foreground"
                    [id]="'method-description-' + method"
                  >
                    {{ methodDescription(method) | t }}
                  </span>
                </span>
                <ng-icon name="lucideChevronRight" aria-hidden="true" />
              </button>
            }
          </div>
        </fieldset>
      }
      <form class="auth-fields" #form="ngForm" (ngSubmit)="form.valid && submit()">
        @if (!auth.challenge()) {
          <div hlmField>
            <label hlmFieldLabel for="username">{{ 'username' | t }}</label
            ><input
              hlmInput
              id="username"
              name="username"
              autocomplete="username"
              [(ngModel)]="username"
              required
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="password">{{ 'password' | t }}</label
            ><input
              hlmInput
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="password"
              required
            />
          </div>
        } @else if (challengeStep() === 'factor' && selectedMethod() === 'Email') {
          <div hlmField>
            <label hlmFieldLabel for="email-code">{{ 'emailCode' | t }}</label>
            <p hlmFieldDescription>{{ 'emailCodeHelp' | t }}</p>
            <brn-input-otp
              hlmInputOtp
              inputId="email-code"
              inputAutocomplete="one-time-code"
              inputMode="numeric"
              [length]="6"
              [disabled]="busy() || !auth.emailCodeSent()"
              [(value)]="code"
            >
              <hlm-input-otp-group>
                @for (slot of otpSlots; track slot) {
                  <hlm-input-otp-slot [index]="slot" />
                }
              </hlm-input-otp-group>
            </brn-input-otp>
          </div>
        } @else if (challengeStep() === 'factor' && selectedMethod() === 'Authenticator') {
          <div hlmField>
            <label hlmFieldLabel for="factor">{{ 'factorCode' | t }}</label>
            @if (recovery) {
              <input
                hlmInput
                id="factor"
                name="factor"
                autocomplete="one-time-code"
                [(ngModel)]="code"
                required
              />
            } @else {
              <brn-input-otp
                hlmInputOtp
                inputId="factor"
                inputAutocomplete="one-time-code"
                inputMode="numeric"
                [length]="6"
                [disabled]="busy()"
                [(value)]="code"
              >
                <hlm-input-otp-group>
                  @for (slot of otpSlots; track slot) {
                    <hlm-input-otp-slot [index]="slot" />
                  }
                </hlm-input-otp-group>
              </brn-input-otp>
            }
            <div hlmField orientation="horizontal">
              <hlm-checkbox inputId="recovery" name="recovery" [(ngModel)]="recovery" /><label
                hlmFieldLabel
                for="recovery"
                >{{ 'useRecovery' | t }}</label
              >
            </div>
          </div>
        }
        @if (
          !auth.challenge() || (challengeStep() === 'factor' && selectedMethod() !== 'Passkey')
        ) {
          <button
            hlmBtn
            type="submit"
            [disabled]="busy() || form.invalid || (auth.challenge() && code.length < 6)"
          >
            @if (busy()) {
              <hlm-spinner />
            }
            {{ (auth.challenge() ? 'verify' : 'signIn') | t }}
          </button>
        }
      </form>
      <div class="auth-footer">
        @if (auth.challenge() && challengeStep() === 'factor' && selectedMethod() === 'Email') {
          <button
            hlmBtn
            variant="outline"
            [disabled]="busy() || resendSeconds() > 0"
            (click)="sendEmailCode()"
          >
            {{
              resendSeconds() > 0
                ? ('resendIn' | t) + ' ' + resendSeconds() + 's'
                : ('resendCode' | t)
            }}
          </button>
        }
        @if (
          auth.challenge() &&
          challengeStep() === 'factor' &&
          selectedMethod() === 'Passkey' &&
          !passkeys.supported
        ) {
          <p hlmFieldDescription>{{ 'passkeysUnsupported' | t }}</p>
        } @else if (!auth.challenge() && passkeys.supported) {
          <hlm-field-separator>{{ 'orContinueWith' | t }}</hlm-field-separator>
          <button hlmBtn variant="outline" [disabled]="busy()" (click)="passkey()">
            {{ 'signInPasskey' | t }}
          </button>
        }
        @if (auth.challenge()) {
          @if (challengeStep() === 'factor') {
            <button hlmBtn variant="link" [disabled]="busy()" (click)="chooseAnotherMethod()">
              {{ 'chooseAnotherMethod' | t }}
            </button>
          }
          <button hlmBtn variant="link" (click)="resetChallenge()">
            {{ 'startAgain' | t }}
          </button>
        }
        <hlm-dialog [state]="forgotDialogState()" (stateChanged)="forgotDialogState.set($event)">
          <button hlmBtn variant="link" hlmDialogTrigger [disabled]="busy()">
            {{ 'forgot' | t }}
          </button>
          <hlm-dialog-content *hlmDialogPortal>
            <hlm-dialog-header>
              <h2 hlmDialogTitle>{{ 'forgotPasswordTitle' | t }}</h2>
              <p hlmDialogDescription>{{ 'recoveryEmailHelp' | t }}</p>
            </hlm-dialog-header>
            <form #recoveryForm="ngForm" class="flex flex-col gap-6" (ngSubmit)="forgot()">
              <div hlmField>
                <label hlmFieldLabel for="recovery-email">{{ 'recoveryEmail' | t }}</label>
                <input
                  hlmInput
                  id="recovery-email"
                  name="recoveryEmail"
                  type="email"
                  autocomplete="email"
                  [(ngModel)]="recoveryEmail"
                  required
                />
              </div>
              <hlm-dialog-footer>
                <button hlmBtn type="submit" [disabled]="busy() || recoveryForm.invalid">
                  @if (busy()) {
                    <hlm-spinner />
                  }
                  {{ 'sendResetLink' | t }}
                </button>
              </hlm-dialog-footer>
            </form>
          </hlm-dialog-content>
        </hlm-dialog>
      </div>
      @if (recoverySent()) {
        <p role="status" class="text-sm text-muted-foreground">{{ 'sent' | t }}</p>
      }
      @if (!auth.challenge() && registrationEnabled()) {
        <p hlmFieldDescription class="text-center">
          {{ 'noAccount' | t }} <a routerLink="/signup">{{ 'signUp' | t }}</a>
        </p>
      }
    </div></app-auth-layout
  >`,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LoginPage, { className: "LoginPage", filePath: "src/app/features/login.ts", lineNumber: 260 }); })();
