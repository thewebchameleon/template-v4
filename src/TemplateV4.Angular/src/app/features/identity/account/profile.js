import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { Auth } from '../../../core/auth';
import { Passkeys } from '../../passkeys/passkeys';
import { Runtime } from '../../../core/runtime';
import { Translate } from '../../../core/i18n';
import { protectUnload } from '../../../shared/confirmation';
import { Notifications } from '../../notifications/notifications';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/button";
import * as i3 from "@spartan-ng/helm/field";
import * as i4 from "@spartan-ng/helm/input";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/checkbox";
import * as i7 from "@spartan-ng/helm/alert";
import * as i8 from "@spartan-ng/helm/empty";
import * as i9 from "@spartan-ng/helm/badge";
import * as i10 from "@spartan-ng/helm/spinner";
import * as i11 from "@spartan-ng/helm/separator";
import * as i12 from "@spartan-ng/helm/tabs";
const _forTrack0 = ($index, $item) => $item.id;
function ProfilePage_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 4);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "sessions"));
} }
function ProfilePage_Conditional_8_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8)(1, "p", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const user_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, user_r1.passkeyRequired ? "passkeySetupRequired" : "setupRequired"), " ");
} }
function ProfilePage_Conditional_8_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "emailMfaEnabled"));
} }
function ProfilePage_Conditional_8_Conditional_20_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 31);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const method_r4 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("hlmTabsTrigger", method_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, ctx_r2.methodLabel(method_r4)), " ");
} }
function ProfilePage_Conditional_8_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "fieldset", 16)(1, "legend", 27);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 28);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "hlm-tabs", 29);
    i0.ɵɵlistener("tabActivated", function ProfilePage_Conditional_8_Conditional_20_Template_hlm_tabs_tabActivated_7_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.selectPreferred($event)); });
    i0.ɵɵelementStart(8, "hlm-tabs-list", 30);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵrepeaterCreate(10, ProfilePage_Conditional_8_Conditional_20_For_11_Template, 3, 4, "button", 31, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 32);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_20_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.savePreference()); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const user_r1 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, "preferredMfaMethod"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "preferredMfaHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("tab", ctx_r2.preferredMethod);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 10, "preferredMfaMethod"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(user_r1.mfaMethods);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy() || ctx_r2.preferredMethod === user_r1.preferredMfaMethod);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 12, "savePreference"), " ");
} }
function ProfilePage_Conditional_8_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 33);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_22_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.chooseAction("enroll")); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "enrollAuthenticator"), " ");
} }
function ProfilePage_Conditional_8_Conditional_23_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 35);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_23_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.chooseAction("disable")); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "disableMfa"), " ");
} }
function ProfilePage_Conditional_8_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 32);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_23_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.chooseAction("recovery")); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, ProfilePage_Conditional_8_Conditional_23_Conditional_3_Template, 3, 4, "button", 34);
} if (rf & 2) {
    const user_r1 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, "rotateRecovery"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!user_r1.mfaRequired || user_r1.passkeys.length > 0 || user_r1.emailMfaEnabled ? 3 : -1);
} }
function ProfilePage_Conditional_8_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "code", 36);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "form", 37, 0);
    i0.ɵɵlistener("ngSubmit", function ProfilePage_Conditional_8_Conditional_24_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r8); const confirmation_r9 = i0.ɵɵreference(6); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(confirmation_r9.valid && ctx_r2.confirm()); });
    i0.ɵɵelementStart(7, "div", 38)(8, "label", 39);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "input", 40);
    i0.ɵɵtwoWayListener("ngModelChange", function ProfilePage_Conditional_8_Conditional_24_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.code, $event) || (ctx_r2.code = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 18);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const confirmation_r9 = i0.ɵɵreference(6);
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 6, "authenticatorSetupHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx.key);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 8, "factorCode"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.code);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.busy() || confirmation_r9.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 10, "confirmFactor"), " ");
} }
function ProfilePage_Conditional_8_Conditional_25_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "code");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r11 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r11);
} }
function ProfilePage_Conditional_8_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 19)(1, "h3", 41);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 26);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "ul", 42);
    i0.ɵɵrepeaterCreate(8, ProfilePage_Conditional_8_Conditional_25_For_9_Template, 3, 1, "li", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 43);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_25_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.copyCodes()); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 44);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_25_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.codes.set([])); });
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "saveRecovery"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "recoveryHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.codes());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 8, "copyRecoveryCodes"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 10, "savedRecovery"), " ");
} }
function ProfilePage_Conditional_8_For_35_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 22)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 32);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_For_35_Template_button_click_3_listener() { const key_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.chooseAction("remove", key_r13.id)); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const key_r13 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(key_r13.name);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 4, "remove") + ": " + key_r13.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 6, "remove"), " ");
} }
function ProfilePage_Conditional_8_ForEmpty_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 46)(2, "div", 47)(3, "p", 48);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "noPasskeys"));
} }
function ProfilePage_Conditional_8_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 38)(1, "label", 49);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 50);
    i0.ɵɵtwoWayListener("ngModelChange", function ProfilePage_Conditional_8_Conditional_37_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.keyName, $event) || (ctx_r2.keyName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 32);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_37_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.chooseAction("register")); });
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "passkeyName"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.keyName);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.busy() || !ctx_r2.keyName);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 6, "addPasskey"), " ");
} }
function ProfilePage_Conditional_8_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 23)(1, "p", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "passkeysUnsupported"));
} }
function ProfilePage_Conditional_8_Conditional_39_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 38)(1, "label", 57);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 58);
    i0.ɵɵtwoWayListener("ngModelChange", function ProfilePage_Conditional_8_Conditional_39_Conditional_12_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r2 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r2.proofCode, $event) || (ctx_r2.proofCode = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(5, "div", 59)(6, "hlm-checkbox", 60);
    i0.ɵɵtwoWayListener("ngModelChange", function ProfilePage_Conditional_8_Conditional_39_Conditional_12_Template_hlm_checkbox_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r2 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r2.recovery, $event) || (ctx_r2.recovery = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(7, "label", 61);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "factorCode"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.proofCode);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.recovery);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 6, "useRecovery"));
} }
function ProfilePage_Conditional_8_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 24)(1, "h3", 51);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 52);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 38)(8, "label", 53);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "input", 54);
    i0.ɵɵtwoWayListener("ngModelChange", function ProfilePage_Conditional_8_Conditional_39_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.password, $event) || (ctx_r2.password = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(12, ProfilePage_Conditional_8_Conditional_39_Conditional_12_Template, 10, 8, "div", 38);
    i0.ɵɵelementStart(13, "div", 55)(14, "button", 33);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_39_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.executeAction()); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "button", 56);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_39_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.cancelAction()); });
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const user_r1 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 8, ctx_r2.actionLabel()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 10, "emailProofHelp"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 12, "password"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.password);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(user_r1.mfaEnabled ? 12 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy() || !ctx_r2.password || user_r1.mfaEnabled && !ctx_r2.proofCode);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 14, ctx_r2.actionLabel()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 16, "cancel"), " ");
} }
function ProfilePage_Conditional_8_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 25)(1, "p", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "bootstrapRecoveryHelp"));
} }
function ProfilePage_Conditional_8_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "p", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 56);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_8_Conditional_41_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.signInAgain()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "reauthenticationRequired"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "signInAgain"));
} }
function ProfilePage_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, ProfilePage_Conditional_8_Conditional_2_Template, 4, 3, "div", 8);
    i0.ɵɵelementStart(3, "section", 9)(4, "div", 10)(5, "h2", 11);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 12);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 13)(12, "p")(13, "span", 14);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span", 15);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(19, ProfilePage_Conditional_8_Conditional_19_Template, 3, 3, "span", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, ProfilePage_Conditional_8_Conditional_20_Template, 15, 14, "fieldset", 16);
    i0.ɵɵelementStart(21, "div", 17);
    i0.ɵɵconditionalCreate(22, ProfilePage_Conditional_8_Conditional_22_Template, 3, 4, "button", 18)(23, ProfilePage_Conditional_8_Conditional_23_Template, 4, 5);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(24, ProfilePage_Conditional_8_Conditional_24_Template, 15, 12);
    i0.ɵɵconditionalCreate(25, ProfilePage_Conditional_8_Conditional_25_Template, 16, 12, "div", 19);
    i0.ɵɵelement(26, "hlm-separator");
    i0.ɵɵelementStart(27, "h3", 20);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "p");
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "ul", 21);
    i0.ɵɵrepeaterCreate(34, ProfilePage_Conditional_8_For_35_Template, 7, 8, "li", 22, _forTrack0, false, ProfilePage_Conditional_8_ForEmpty_36_Template, 6, 3, "li");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(37, ProfilePage_Conditional_8_Conditional_37_Template, 8, 8)(38, ProfilePage_Conditional_8_Conditional_38_Template, 4, 3, "div", 23);
    i0.ɵɵconditionalCreate(39, ProfilePage_Conditional_8_Conditional_39_Template, 20, 18, "section", 24);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(40, ProfilePage_Conditional_8_Conditional_40_Template, 4, 3, "div", 25);
    i0.ɵɵconditionalCreate(41, ProfilePage_Conditional_8_Conditional_41_Template, 7, 6, "div", 5);
} if (rf & 2) {
    let tmp_11_0;
    const user_r1 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", user_r1.displayName, " \u00B7 ", user_r1.email);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.auth.access()?.setupRequired ? 2 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 19, "security"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 21, "securityHelp"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 23, user_r1.mfaRequired || user_r1.mfaMethods.length ? "mfaRequired" : "mfaOptional"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 25, user_r1.mfaEnabled ? "authenticatorEnabled" : "authenticatorDisabled"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(user_r1.emailMfaEnabled ? 19 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(user_r1.mfaMethods.length ? 20 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!user_r1.mfaEnabled ? 22 : 23);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_11_0 = ctx_r2.enrollment()) ? 24 : -1, tmp_11_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.codes().length ? 25 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 27, "passkeys"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 29, "passkeysHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(user_r1.passkeys);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.passkeys.supported ? 37 : 38);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.action() ? 39 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isBootstrapAccount(user_r1.email) ? 40 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.reauthenticationRequired() ? 41 : -1);
} }
function ProfilePage_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "p", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 56);
    i0.ɵɵlistener("click", function ProfilePage_Conditional_9_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r18); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.retry()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "loadFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "retry"));
} }
function ProfilePage_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵelement(1, "hlm-spinner");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 1, "loading"), " ");
} }
export class ProfilePage {
    action = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "action" }] : /* istanbul ignore next */ []));
    actionId = '';
    chooseAction(action, id = '') {
        this.cancelAction();
        this.action.set(action);
        this.actionId = id;
        setTimeout(() => document.getElementById('proof-password')?.focus());
    }
    actionLabel() {
        return ({
            enroll: 'enrollAuthenticator',
            recovery: 'rotateRecovery',
            disable: 'disableMfa',
            register: 'addPasskey',
            remove: 'remove',
        }[this.action()] ?? 'confirm');
    }
    cancelAction() {
        this.action.set('');
        this.password = '';
        this.proofCode = '';
        this.recovery = false;
    }
    async executeAction() {
        const action = this.action();
        if (action === 'enroll')
            await this.enroll();
        else if (action === 'recovery' || action === 'disable')
            await this.manage(action === 'disable');
        else if (action === 'register')
            await this.register();
        else if (action === 'remove')
            await this.remove(this.actionId);
    }
    hasUnsavedChanges() {
        return this.codes().length > 0 || !!this.enrollment() || !!this.password || !!this.proofCode;
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    async copyCodes() {
        await navigator.clipboard.writeText(this.codes().join('\n'));
    }
    auth = inject(Auth);
    passkeys = inject(Passkeys);
    http = inject(HttpClient);
    runtime = inject(Runtime);
    profile = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "profile" }] : /* istanbul ignore next */ []));
    enrollment = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enrollment" }] : /* istanbul ignore next */ []));
    codes = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "codes" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    loadState = signal('loading', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadState" }] : /* istanbul ignore next */ []));
    reauthenticationRequired = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reauthenticationRequired" }] : /* istanbul ignore next */ []));
    router = inject(Router);
    notifications = inject(Notifications);
    password = '';
    proofCode = '';
    recovery = false;
    code = '';
    keyName = '';
    preferredMethod = 'Email';
    constructor() {
        void this.run(() => this.load());
    }
    proof() {
        return { password: this.password, code: this.proofCode, recoveryCode: this.recovery };
    }
    async load() {
        this.loadState.set('loading');
        try {
            const profile = await firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/auth/profile`));
            this.profile.set(profile);
            this.preferredMethod = profile.preferredMfaMethod ?? 'Email';
            this.loadState.set('ready');
        }
        catch (error) {
            this.loadState.set('error');
            throw error;
        }
    }
    async run(action) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await action();
        }
        catch (error) {
            if (error instanceof HttpErrorResponse &&
                error.error?.code === 'auth.reauthentication_required')
                this.reauthenticationRequired.set(true);
        }
        finally {
            this.busy.set(false);
        }
    }
    async changed() {
        this.action.set('');
        this.password = '';
        this.proofCode = '';
        await this.auth.refresh();
        await this.load();
        this.notifications.success('securitySaved');
    }
    enroll() {
        return this.run(async () => {
            this.enrollment.set(await this.auth.action('mfa/enroll', this.proof()));
            this.cancelAction();
        });
    }
    confirm() {
        return this.run(async () => {
            this.codes.set(await this.auth.action('mfa/confirm', { code: this.code }));
            this.enrollment.set(null);
            this.code = '';
            await this.changed();
        });
    }
    manage(disable) {
        return this.run(async () => {
            this.codes.set(await this.auth.action(disable ? 'mfa/disable' : 'mfa/recovery', this.proof()));
            await this.changed();
        });
    }
    register() {
        return this.run(async () => {
            await this.passkeys.register(this.proof(), this.keyName);
            this.keyName = '';
            await this.changed();
        });
    }
    remove(id) {
        return this.run(async () => {
            await this.auth.action('passkeys/remove', { id, proof: this.proof() });
            await this.changed();
        });
    }
    methodLabel(method) {
        return method === 'Passkey'
            ? 'passkeyMethod'
            : method === 'Authenticator'
                ? 'authenticatorMethod'
                : 'emailMethod';
    }
    selectPreferred(value) {
        if (typeof value === 'string' && value)
            this.preferredMethod = value;
    }
    savePreference() {
        return this.run(async () => {
            await this.auth.action('mfa/preference', { method: this.preferredMethod });
            await this.load();
            this.notifications.success('securitySaved');
        });
    }
    isBootstrapAccount(email) {
        return email.toLowerCase().endsWith('@example.invalid');
    }
    async signInAgain() {
        await this.auth.logout();
        await this.router.navigate(['/login'], { queryParams: { returnUrl: '/security' } });
    }
    retry() {
        return this.run(() => this.load());
    }
    static ɵfac = function ProfilePage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProfilePage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProfilePage, selectors: [["app-profile"]], hostBindings: function ProfilePage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function ProfilePage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 11, vars: 8, consts: [["confirmation", "ngForm"], [1, "page-title"], [1, "my-4", "flex", "gap-3"], ["hlmBtn", "", "variant", "outline", "routerLink", "/me"], ["hlmBtn", "", "variant", "outline", "routerLink", "/security/sessions"], ["hlmAlert", "", "variant", "destructive", "role", "alert", 1, "mt-6"], ["role", "status", 1, "flex", "items-center", "gap-2", "mt-6"], [1, "mt-3", "break-words"], ["hlmAlert", "", "role", "status", 1, "my-4"], ["hlmCard", "", 1, "mt-6", "max-w-(--form-content-width)"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "flex", "flex-col", "gap-5"], ["hlmBadge", "", "variant", "secondary"], ["hlmBadge", "", "variant", "outline"], ["hlmFieldSet", ""], [1, "flex", "flex-wrap", "gap-3"], ["hlmBtn", "", 3, "disabled"], ["hlmAlert", "", "role", "status"], [1, "text-xl", "font-semibold"], [1, "flex", "flex-col", "gap-3"], [1, "flex", "flex-wrap", "items-center", "gap-3"], ["hlmAlert", ""], ["aria-labelledby", "proof-title", 1, "grid", "gap-4", "rounded-md", "border", "p-4"], ["hlmAlert", "", 1, "mt-6"], ["hlmAlertDescription", ""], ["hlmFieldLegend", ""], ["hlmFieldDescription", ""], ["orientation", "vertical", 3, "tabActivated", "tab"], [1, "w-full", "gap-2"], [1, "w-full", 3, "hlmTabsTrigger"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["hlmBtn", "", 3, "click", "disabled"], ["hlmBtn", "", "variant", "destructive", 3, "disabled"], ["hlmBtn", "", "variant", "destructive", 3, "click", "disabled"], [1, "break-all", "select-all"], [1, "flex", "flex-col", "gap-3", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "enrollment-code"], ["hlmInput", "", "id", "enrollment-code", "name", "code", "autocomplete", "one-time-code", "inputmode", "numeric", "pattern", "[0-9]{6}", "required", "", 3, "ngModelChange", "ngModel"], ["hlmAlertTitle", ""], [1, "grid", "grid-cols-2", "gap-2", "mt-3"], ["hlmBtn", "", "variant", "outline", 1, "mt-3", "mr-2", 3, "click"], ["hlmBtn", "", "variant", "outline", 1, "mt-3", 3, "click"], [1, "break-all"], ["hlmEmpty", ""], ["hlmEmptyHeader", ""], ["hlmEmptyTitle", ""], ["hlmFieldLabel", "", "for", "passkey-name"], ["hlmInput", "", "id", "passkey-name", "maxlength", "80", 3, "ngModelChange", "ngModel"], ["id", "proof-title", 1, "font-semibold"], [1, "text-sm", "text-muted-foreground"], ["hlmFieldLabel", "", "for", "proof-password"], ["hlmInput", "", "id", "proof-password", "type", "password", "autocomplete", "current-password", 3, "ngModelChange", "ngModel"], [1, "flex", "gap-2"], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmFieldLabel", "", "for", "proof-code"], ["hlmInput", "", "id", "proof-code", "autocomplete", "one-time-code", 3, "ngModelChange", "ngModel"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "proof-recovery", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "proof-recovery"]], template: function ProfilePage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h1", 1);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "nav", 2)(4, "a", 3);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(7, ProfilePage_Conditional_7_Template, 3, 3, "a", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, ProfilePage_Conditional_8_Template, 42, 31)(9, ProfilePage_Conditional_9_Template, 7, 6, "div", 5)(10, ProfilePage_Conditional_10_Template, 4, 3, "div", 6);
        } if (rf & 2) {
            let tmp_3_0;
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 4, "security"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "account"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.auth.access()?.setupRequired ? 7 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.profile()) ? 8 : ctx.loadState() === "error" ? 9 : 10, tmp_3_0);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MaxLengthValidator, i1.PatternValidator, i1.NgModel, i1.NgForm, RouterLink, i2.HlmButton, i3.HlmField, i3.HlmFieldDescription, i3.HlmFieldLabel, i3.HlmFieldLegend, i3.HlmFieldSet, i4.HlmInput, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmCheckbox, i7.HlmAlert, i7.HlmAlertDescription, i7.HlmAlertTitle, i8.HlmEmpty, i8.HlmEmptyHeader, i8.HlmEmptyTitle, i9.HlmBadge, i10.HlmSpinner, i11.HlmSeparator, i12.HlmTabs, i12.HlmTabsList, i12.HlmTabsTrigger, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProfilePage, [{
        type: Component,
        args: [{
                selector: 'app-profile',
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                imports: [
                    FormsModule,
                    RouterLink,
                    HlmButtonImports,
                    HlmFieldImports,
                    HlmInputImports,
                    HlmCardImports,
                    HlmCheckboxImports,
                    HlmAlertImports,
                    HlmEmptyImports,
                    HlmBadgeImports,
                    HlmSpinnerImports,
                    HlmSeparatorImports,
                    HlmTabsImports,
                    Translate,
                ],
                template: `<h1 class="page-title">{{ 'security' | t }}</h1>
    <nav class="my-4 flex gap-3">
      <a hlmBtn variant="outline" routerLink="/me">{{ 'account' | t }}</a>
      @if (!auth.access()?.setupRequired) {
        <a hlmBtn variant="outline" routerLink="/security/sessions">{{ 'sessions' | t }}</a>
      }
    </nav>
    @if (profile(); as user) {
      <p class="mt-3 break-words">{{ user.displayName }} · {{ user.email }}</p>
      @if (auth.access()?.setupRequired) {
        <div hlmAlert role="status" class="my-4">
          <p hlmAlertDescription>
            {{ (user.passkeyRequired ? 'passkeySetupRequired' : 'setupRequired') | t }}
          </p>
        </div>
      }
      <section hlmCard class="mt-6 max-w-(--form-content-width)">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'security' | t }}</h2>
          <p hlmCardDescription>{{ 'securityHelp' | t }}</p>
        </div>
        <div hlmCardContent class="flex flex-col gap-5">
          <p>
            <span hlmBadge variant="secondary">{{
              (user.mfaRequired || user.mfaMethods.length ? 'mfaRequired' : 'mfaOptional') | t
            }}</span>
            <span hlmBadge variant="outline">{{
              (user.mfaEnabled ? 'authenticatorEnabled' : 'authenticatorDisabled') | t
            }}</span>
            @if (user.emailMfaEnabled) {
              <span hlmBadge variant="outline">{{ 'emailMfaEnabled' | t }}</span>
            }
          </p>
          @if (user.mfaMethods.length) {
            <fieldset hlmFieldSet>
              <legend hlmFieldLegend>{{ 'preferredMfaMethod' | t }}</legend>
              <p hlmFieldDescription>{{ 'preferredMfaHelp' | t }}</p>
              <hlm-tabs
                orientation="vertical"
                [tab]="preferredMethod"
                (tabActivated)="selectPreferred($event)"
              >
                <hlm-tabs-list class="w-full gap-2" [attr.aria-label]="'preferredMfaMethod' | t">
                  @for (method of user.mfaMethods; track method) {
                    <button [hlmTabsTrigger]="method" class="w-full">
                      {{ methodLabel(method) | t }}
                    </button>
                  }
                </hlm-tabs-list>
              </hlm-tabs>
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy() || preferredMethod === user.preferredMfaMethod"
                (click)="savePreference()"
              >
                {{ 'savePreference' | t }}
              </button>
            </fieldset>
          }
          <div class="flex flex-wrap gap-3">
            @if (!user.mfaEnabled) {
              <button hlmBtn [disabled]="busy()" (click)="chooseAction('enroll')">
                {{ 'enrollAuthenticator' | t }}
              </button>
            } @else {
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy()"
                (click)="chooseAction('recovery')"
              >
                {{ 'rotateRecovery' | t }}
              </button>
              @if (!user.mfaRequired || user.passkeys.length > 0 || user.emailMfaEnabled) {
                <button
                  hlmBtn
                  variant="destructive"
                  [disabled]="busy()"
                  (click)="chooseAction('disable')"
                >
                  {{ 'disableMfa' | t }}
                </button>
              }
            }
          </div>
          @if (enrollment(); as setup) {
            <p>{{ 'authenticatorSetupHelp' | t }}</p>
            <code class="break-all select-all">{{ setup.key }}</code>
            <form
              #confirmation="ngForm"
              (ngSubmit)="confirmation.valid && confirm()"
              class="flex flex-col gap-3"
            >
              <div hlmField>
                <label hlmFieldLabel for="enrollment-code">{{ 'factorCode' | t }}</label
                ><input
                  hlmInput
                  id="enrollment-code"
                  name="code"
                  [(ngModel)]="code"
                  autocomplete="one-time-code"
                  inputmode="numeric"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              <button hlmBtn [disabled]="busy() || confirmation.invalid">
                {{ 'confirmFactor' | t }}
              </button>
            </form>
          }
          @if (codes().length) {
            <div hlmAlert role="status">
              <h3 hlmAlertTitle>{{ 'saveRecovery' | t }}</h3>
              <p hlmAlertDescription>{{ 'recoveryHelp' | t }}</p>
              <ul class="grid grid-cols-2 gap-2 mt-3">
                @for (item of codes(); track item) {
                  <li>
                    <code>{{ item }}</code>
                  </li>
                }
              </ul>
              <button hlmBtn variant="outline" class="mt-3 mr-2" (click)="copyCodes()">
                {{ 'copyRecoveryCodes' | t }}</button
              ><button hlmBtn variant="outline" class="mt-3" (click)="codes.set([])">
                {{ 'savedRecovery' | t }}
              </button>
            </div>
          }
          <hlm-separator />
          <h3 class="text-xl font-semibold">{{ 'passkeys' | t }}</h3>
          <p>{{ 'passkeysHelp' | t }}</p>
          <ul class="flex flex-col gap-3">
            @for (key of user.passkeys; track key.id) {
              <li class="flex flex-wrap items-center gap-3">
                <span class="break-all">{{ key.name }}</span
                ><button
                  hlmBtn
                  variant="outline"
                  [disabled]="busy()"
                  [attr.aria-label]="('remove' | t) + ': ' + key.name"
                  (click)="chooseAction('remove', key.id)"
                >
                  {{ 'remove' | t }}
                </button>
              </li>
            } @empty {
              <li>
                <div hlmEmpty>
                  <div hlmEmptyHeader>
                    <p hlmEmptyTitle>{{ 'noPasskeys' | t }}</p>
                  </div>
                </div>
              </li>
            }
          </ul>
          @if (passkeys.supported) {
            <div hlmField>
              <label hlmFieldLabel for="passkey-name">{{ 'passkeyName' | t }}</label
              ><input hlmInput id="passkey-name" [(ngModel)]="keyName" maxlength="80" />
            </div>
            <button
              hlmBtn
              variant="outline"
              [disabled]="busy() || !keyName"
              (click)="chooseAction('register')"
            >
              {{ 'addPasskey' | t }}
            </button>
          } @else {
            <div hlmAlert>
              <p hlmAlertDescription>{{ 'passkeysUnsupported' | t }}</p>
            </div>
          }
          @if (action()) {
            <section class="grid gap-4 rounded-md border p-4" aria-labelledby="proof-title">
              <h3 id="proof-title" class="font-semibold">{{ actionLabel() | t }}</h3>
              <p class="text-sm text-muted-foreground">{{ 'emailProofHelp' | t }}</p>
              <div hlmField>
                <label hlmFieldLabel for="proof-password">{{ 'password' | t }}</label
                ><input
                  hlmInput
                  id="proof-password"
                  type="password"
                  autocomplete="current-password"
                  [(ngModel)]="password"
                />
              </div>
              @if (user.mfaEnabled) {
                <div hlmField>
                  <label hlmFieldLabel for="proof-code">{{ 'factorCode' | t }}</label
                  ><input
                    hlmInput
                    id="proof-code"
                    autocomplete="one-time-code"
                    [(ngModel)]="proofCode"
                  />
                  <div hlmField orientation="horizontal">
                    <hlm-checkbox inputId="proof-recovery" [(ngModel)]="recovery" />
                    <label hlmFieldLabel for="proof-recovery">{{ 'useRecovery' | t }}</label>
                  </div>
                </div>
              }
              <div class="flex gap-2">
                <button
                  hlmBtn
                  [disabled]="busy() || !password || (user.mfaEnabled && !proofCode)"
                  (click)="executeAction()"
                >
                  {{ actionLabel() | t }}</button
                ><button hlmBtn variant="outline" (click)="cancelAction()">
                  {{ 'cancel' | t }}
                </button>
              </div>
            </section>
          }
        </div>
      </section>
      @if (isBootstrapAccount(user.email)) {
        <div hlmAlert class="mt-6">
          <p hlmAlertDescription>{{ 'bootstrapRecoveryHelp' | t }}</p>
        </div>
      }
      @if (reauthenticationRequired()) {
        <div hlmAlert variant="destructive" class="mt-6" role="alert">
          <p hlmAlertDescription>{{ 'reauthenticationRequired' | t }}</p>
          <button hlmBtn variant="outline" (click)="signInAgain()">{{ 'signInAgain' | t }}</button>
        </div>
      }
    } @else if (loadState() === 'error') {
      <div hlmAlert variant="destructive" class="mt-6" role="alert">
        <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
        <button hlmBtn variant="outline" (click)="retry()">{{ 'retry' | t }}</button>
      </div>
    } @else {
      <div class="flex items-center gap-2 mt-6" role="status">
        <hlm-spinner />{{ 'loading' | t }}
      </div>
    }`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProfilePage, { className: "ProfilePage", filePath: "src/app/features/profile.ts", lineNumber: 292 }); })();
