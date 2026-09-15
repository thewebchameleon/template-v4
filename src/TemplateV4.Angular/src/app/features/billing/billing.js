import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../../shared/confirmation';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { Resource, WorkspaceUi, Confirmations } from '../../shared/workspace';
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
const _forTrack0 = ($index, $item) => $item.id;
function BillingPage_Conditional_8_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const billing_r1 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "trialEnds"), ": ", ctx_r1.i18n.date(billing_r1.trialUntil));
} }
function BillingPage_Conditional_8_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const billing_r1 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "paidUntil"), ": ", ctx_r1.i18n.date(billing_r1.paidUntil));
} }
function BillingPage_Conditional_8_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 13);
    i0.ɵɵlistener("click", function BillingPage_Conditional_8_Conditional_18_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.cancel()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const billing_r1 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || billing_r1.state === "CancellationPending");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "cancelSubscription"), " ");
} }
function BillingPage_Conditional_8_For_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 12)(1, "div", 6)(2, "h2", 7);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 8);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 14)(8, "p");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "p");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const plan_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(plan_r4.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "billing." + plan_r4.pricing));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", ctx_r1.price(plan_r4.monthlyMinor, plan_r4.currency), " / ", i0.ɵɵpipeBind1(10, 10, "billing.month"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r1.price(plan_r4.yearlyMinor, plan_r4.currency), " / ", i0.ɵɵpipeBind1(13, 12, "billing.year"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(16, 14, "storageQuota"), ": ", ctx_r1.bytes(plan_r4.storageBytes));
} }
function BillingPage_Conditional_8_Conditional_22_hlm_select_content_17_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const plan_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("value", plan_r6.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(plan_r6.name);
} }
function BillingPage_Conditional_8_Conditional_22_hlm_select_content_17_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, BillingPage_Conditional_8_Conditional_22_hlm_select_content_17_For_2_Conditional_0_Template, 2, 2, "hlm-select-item", 34);
} if (rf & 2) {
    const plan_r6 = ctx.$implicit;
    i0.ɵɵconditional(plan_r6.id !== "free" ? 0 : -1);
} }
function BillingPage_Conditional_8_Conditional_22_hlm_select_content_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content");
    i0.ɵɵrepeaterCreate(1, BillingPage_Conditional_8_Conditional_22_hlm_select_content_17_For_2_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const billing_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(billing_r1.plans);
} }
function BillingPage_Conditional_8_Conditional_22_hlm_select_content_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content")(1, "hlm-select-item", 35);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "hlm-select-item", 36);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "billing.month"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "billing.year"));
} }
function BillingPage_Conditional_8_Conditional_22_hlm_select_content_41_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 37);
    i0.ɵɵtext(1, "PayFast (ZAR)");
    i0.ɵɵelementEnd();
} }
function BillingPage_Conditional_8_Conditional_22_hlm_select_content_41_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 38);
    i0.ɵɵtext(1, "Stripe");
    i0.ɵɵelementEnd();
} }
function BillingPage_Conditional_8_Conditional_22_hlm_select_content_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content");
    i0.ɵɵconditionalCreate(1, BillingPage_Conditional_8_Conditional_22_hlm_select_content_41_Conditional_1_Template, 2, 0, "hlm-select-item", 37);
    i0.ɵɵconditionalCreate(2, BillingPage_Conditional_8_Conditional_22_hlm_select_content_41_Conditional_2_Template, 2, 0, "hlm-select-item", 38);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const billing_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(billing_r1.settings.payFastEnabled ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(billing_r1.settings.stripeEnabled ? 2 : -1);
} }
function BillingPage_Conditional_8_Conditional_22_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 30)(1, "p", 39);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "billing.not_configured"));
} }
function BillingPage_Conditional_8_Conditional_22_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 40);
    i0.ɵɵlistener("click", function BillingPage_Conditional_8_Conditional_22_Conditional_47_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.trial()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const billing_r1 = i0.ɵɵnextContext(2);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.planId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate3(" ", i0.ɵɵpipeBind1(2, 4, "startTrial"), " (", billing_r1.settings.trialDays, " ", i0.ɵɵpipeBind1(3, 6, "days"), ") ");
} }
function BillingPage_Conditional_8_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 12)(1, "div", 6)(2, "h2", 7);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 8);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "form", 15, 0);
    i0.ɵɵlistener("ngSubmit", function BillingPage_Conditional_8_Conditional_22_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.checkout()); });
    i0.ɵɵelementStart(10, "div", 16)(11, "label", 17);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "hlm-select", 18);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingPage_Conditional_8_Conditional_22_Template_hlm_select_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.planId, $event) || (ctx_r1.planId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(15, "hlm-select-trigger", 19);
    i0.ɵɵelement(16, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(17, BillingPage_Conditional_8_Conditional_22_hlm_select_content_17_Template, 3, 0, "hlm-select-content", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "div", 16)(19, "label", 21);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "hlm-select", 22);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingPage_Conditional_8_Conditional_22_Template_hlm_select_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.interval, $event) || (ctx_r1.interval = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(23, "hlm-select-trigger", 23);
    i0.ɵɵelement(24, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(25, BillingPage_Conditional_8_Conditional_22_hlm_select_content_25_Template, 7, 6, "hlm-select-content", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "div", 16)(27, "label", 24);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "input", 25);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingPage_Conditional_8_Conditional_22_Template_input_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.seats, $event) || (ctx_r1.seats = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(31, "p", 26);
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div", 16)(35, "label", 27);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "hlm-select", 28);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingPage_Conditional_8_Conditional_22_Template_hlm_select_ngModelChange_38_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.provider, $event) || (ctx_r1.provider = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(39, "hlm-select-trigger", 29);
    i0.ɵɵelement(40, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(41, BillingPage_Conditional_8_Conditional_22_hlm_select_content_41_Template, 3, 2, "hlm-select-content", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(42, BillingPage_Conditional_8_Conditional_22_Conditional_42_Template, 4, 3, "div", 30);
    i0.ɵɵelementStart(43, "div", 31)(44, "button", 32);
    i0.ɵɵtext(45);
    i0.ɵɵpipe(46, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(47, BillingPage_Conditional_8_Conditional_22_Conditional_47_Template, 4, 8, "button", 33);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const form_r8 = i0.ɵɵreference(9);
    const billing_r1 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 15, "chooseSubscription"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 17, "checkoutHelp"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 19, "billingPlan"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.planId);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 21, "billingInterval"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.interval);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 23, "billingSeats"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.seats);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 25, "billingSeatsHelp"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 27, "paymentProvider"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.provider);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(!billing_r1.settings.stripeEnabled && !billing_r1.settings.payFastEnabled ? 42 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r8.invalid || !ctx_r1.provider);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(46, 29, "continueToPayment"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(billing_r1.settings.trialDays > 0 && !billing_r1.provider && billing_r1.state === "Free" ? 47 : -1);
} }
function BillingPage_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 5)(1, "div", 6)(2, "h2", 7);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 8);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 9);
    i0.ɵɵconditionalCreate(9, BillingPage_Conditional_8_Conditional_9_Template, 3, 4, "p");
    i0.ɵɵconditionalCreate(10, BillingPage_Conditional_8_Conditional_10_Template, 3, 4, "p");
    i0.ɵɵelementStart(11, "p");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p");
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, BillingPage_Conditional_8_Conditional_18_Template, 3, 4, "button", 10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 11);
    i0.ɵɵrepeaterCreate(20, BillingPage_Conditional_8_For_21_Template, 17, 16, "section", 12, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(22, BillingPage_Conditional_8_Conditional_22_Template, 48, 31, "section", 12);
} if (rf & 2) {
    const billing_r1 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 11, "billing." + billing_r1.state));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate3(" ", billing_r1.planId, " \u00B7 ", i0.ɵɵpipeBind1(7, 13, "storageQuota"), ": ", ctx_r1.bytes(billing_r1.storageBytes), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(billing_r1.trialUntil ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(billing_r1.paidUntil ? 10 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(13, 15, "billingEntitlement"), ": ", i0.ɵɵpipeBind1(14, 17, "billing." + billing_r1.entitlementState));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 19, "billingRetentionHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(billing_r1.canCancel ? 18 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(billing_r1.plans);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(billing_r1.canManage && billing_r1.canCheckout ? 22 : -1);
} }
export class BillingPage {
    id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    confirm = inject(Confirmations);
    toast = inject(Notifications);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    planId = '';
    interval = 'month';
    provider = '';
    seats = 1;
    baseline = '';
    selection() {
        return JSON.stringify([this.planId, this.interval, this.provider, this.seats]);
    }
    requestId = crypto.randomUUID();
    hasUnsavedChanges() {
        return this.busy() || (!!this.baseline && this.selection() !== this.baseline);
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    constructor() {
        try {
            this.requestId = sessionStorage.getItem('billing-checkout-' + this.id) ?? this.requestId;
        }
        catch {
            /* Storage may be unavailable. */
        }
        void this.load();
    }
    async refresh() {
        if (this.hasUnsavedChanges() &&
            !(await this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges')))
            return;
        await this.load();
    }
    async load() {
        if (await this.data.load((signal) => this.api.get(`customers/${this.id}/billing`, {}, signal))) {
            const b = this.data.value();
            if (b.state === 'Cancelled' || (!b.provider && b.state === 'Free'))
                this.requestId = crypto.randomUUID();
            this.planId =
                b.planId !== 'free' ? b.planId : (b.plans.find((p) => p.id !== 'free')?.id ?? '');
            this.interval = b.interval ?? 'month';
            this.seats = Math.max(1, b.seats);
            this.provider =
                b.provider ??
                    (b.settings.defaultProvider === 'payfast' && b.settings.payFastEnabled
                        ? 'payfast'
                        : b.settings.stripeEnabled
                            ? 'stripe'
                            : b.settings.payFastEnabled
                                ? 'payfast'
                                : '');
            this.baseline = this.selection();
        }
    }
    price(minor, currency) {
        return new Intl.NumberFormat(this.i18n.culture(), { style: 'currency', currency }).format(minor / 100);
    }
    bytes(value) {
        return (new Intl.NumberFormat(this.i18n.culture(), { maximumFractionDigits: 2 }).format(value / 1024 / 1024) + ' MiB');
    }
    async trial() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`customers/${this.id}/billing/trial`, { planId: this.planId });
            await this.load();
            this.toast.success('customerSaved');
        }
        finally {
            this.busy.set(false);
        }
    }
    async cancel() {
        if (this.busy() ||
            !(await this.confirm.ask('cancelSubscription', 'cancelSubscriptionHelp', '', true)))
            return;
        this.busy.set(true);
        try {
            await this.api.post(`customers/${this.id}/billing/cancel`);
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    async checkout() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            try {
                sessionStorage.setItem('billing-checkout-' + this.id, this.requestId);
            }
            catch {
                /* The server also prevents concurrent subscriptions. */
            }
            const result = await this.api.post(`customers/${this.id}/billing/checkout`, {
                planId: this.planId,
                interval: this.interval,
                provider: this.provider,
                seats: this.seats,
                requestId: this.requestId,
            });
            const url = new URL(result.url);
            if (url.protocol !== 'https:' ||
                !['checkout.stripe.com', 'sandbox.payfast.co.za', 'www.payfast.co.za'].includes(url.hostname))
                throw new Error('Invalid payment destination');
            this.baseline = this.selection();
            this.busy.set(false);
            if (result.fields) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = url.href;
                for (const [name, value] of Object.entries(result.fields)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = value;
                    form.appendChild(input);
                }
                document.body.appendChild(form);
                form.submit();
                form.remove();
            }
            else
                window.location.assign(url.href);
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function BillingPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BillingPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BillingPage, selectors: [["app-billing"]], hostBindings: function BillingPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function BillingPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 9, vars: 11, consts: [["form", "ngForm"], ["title", "billing", "description", "billingHelp"], ["hlmBtn", "", "variant", "outline", "routerLink", "/organizations"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], [3, "retry", "state", "refreshError", "refreshing"], ["hlmCard", "", 1, "mb-6"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "grid", "gap-2"], ["hlmBtn", "", "variant", "destructive", 3, "disabled"], [1, "grid", "gap-6", "md:grid-cols-3", "mb-6"], ["hlmCard", ""], ["hlmBtn", "", "variant", "destructive", 3, "click", "disabled"], ["hlmCardContent", ""], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "billing-plan"], ["name", "plan", "required", "", 3, "ngModelChange", "ngModel"], ["buttonId", "billing-plan"], [4, "hlmSelectPortal"], ["hlmFieldLabel", "", "for", "billing-interval"], ["name", "interval", 3, "ngModelChange", "ngModel"], ["buttonId", "billing-interval"], ["hlmFieldLabel", "", "for", "billing-seats"], ["hlmInput", "", "id", "billing-seats", "name", "seats", "type", "number", "min", "1", "max", "1000", "step", "1", "required", "", 3, "ngModelChange", "ngModel"], ["hlmFieldDescription", ""], ["hlmFieldLabel", "", "for", "billing-provider"], ["name", "provider", 3, "ngModelChange", "ngModel"], ["buttonId", "billing-provider"], ["hlmAlert", ""], [1, "flex", "flex-wrap", "gap-2"], ["hlmBtn", "", 3, "disabled"], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "disabled"], [3, "value"], ["value", "month"], ["value", "year"], ["value", "payfast"], ["value", "stripe"], ["hlmAlertDescription", ""], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click", "disabled"]], template: function BillingPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 1)(1, "a", 2);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "button", 3);
            i0.ɵɵlistener("click", function BillingPage_Template_button_click_4_listener() { return ctx.refresh(); });
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "app-page-state", 4);
            i0.ɵɵlistener("retry", function BillingPage_Template_app_page_state_retry_7_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(8, BillingPage_Conditional_8_Template, 23, 21);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_6_0;
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 7, "switchAccount"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 9, "refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError())("refreshing", ctx.data.refreshing());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_6_0 = ctx.data.value()) ? 8 : -1, tmp_6_0);
        } }, dependencies: [i1.HlmSelect, i1.HlmSelectContent, i1.HlmSelectItem, i1.HlmSelectPortal, i1.HlmSelectTrigger, i1.HlmSelectValue, i2.PageHeader, i2.PageState, i3.FormsModule, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.NumberValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.MinValidator, i3.MaxValidator, i3.NgModel, i3.NgForm, i4.RouterLink, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmField, i7.HlmFieldDescription, i7.HlmFieldLabel, i8.HlmInput, i9.HlmAlert, i9.HlmAlertDescription, i10.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BillingPage, [{
        type: Component,
        args: [{
                selector: 'app-billing',
                imports: [HlmSelectImports, WorkspaceUi, RouterLink],
                template: `<app-page-header title="billing" description="billingHelp"
      ><a hlmBtn variant="outline" routerLink="/organizations">{{ 'switchAccount' | t }}</a
      ><button hlmBtn variant="outline" [disabled]="busy()" (click)="refresh()">
        {{ 'refresh' | t }}
      </button></app-page-header
    >
    <app-page-state
      [state]="data.state()"
      [refreshError]="data.refreshError()"
      [refreshing]="data.refreshing()"
      (retry)="load()"
    >
      @if (data.value(); as billing) {
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'billing.' + billing.state | t }}</h2>
            <p hlmCardDescription>
              {{ billing.planId }} · {{ 'storageQuota' | t }}: {{ bytes(billing.storageBytes) }}
            </p>
          </div>
          <div hlmCardContent class="grid gap-2">
            @if (billing.trialUntil) {
              <p>{{ 'trialEnds' | t }}: {{ i18n.date(billing.trialUntil) }}</p>
            }
            @if (billing.paidUntil) {
              <p>{{ 'paidUntil' | t }}: {{ i18n.date(billing.paidUntil) }}</p>
            }
            <p>{{ 'billingEntitlement' | t }}: {{ 'billing.' + billing.entitlementState | t }}</p>
            <p>{{ 'billingRetentionHelp' | t }}</p>
            @if (billing.canCancel) {
              <button
                hlmBtn
                variant="destructive"
                [disabled]="busy() || billing.state === 'CancellationPending'"
                (click)="cancel()"
              >
                {{ 'cancelSubscription' | t }}
              </button>
            }
          </div>
        </section>
        <div class="grid gap-6 md:grid-cols-3 mb-6">
          @for (plan of billing.plans; track plan.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ plan.name }}</h2>
                <p hlmCardDescription>{{ 'billing.' + plan.pricing | t }}</p>
              </div>
              <div hlmCardContent>
                <p>{{ price(plan.monthlyMinor, plan.currency) }} / {{ 'billing.month' | t }}</p>
                <p>{{ price(plan.yearlyMinor, plan.currency) }} / {{ 'billing.year' | t }}</p>
                <p>{{ 'storageQuota' | t }}: {{ bytes(plan.storageBytes) }}</p>
              </div>
            </section>
          }
        </div>
        @if (billing.canManage && billing.canCheckout) {
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'chooseSubscription' | t }}</h2>
              <p hlmCardDescription>{{ 'checkoutHelp' | t }}</p>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="checkout()" #form="ngForm">
              <div hlmField>
                <label hlmFieldLabel for="billing-plan">{{ 'billingPlan' | t }}</label
                ><hlm-select name="plan" [(ngModel)]="planId" required
                  ><hlm-select-trigger buttonId="billing-plan"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal>
                    @for (plan of billing.plans; track plan.id) {
                      @if (plan.id !== 'free') {
                        <hlm-select-item [value]="plan.id">{{ plan.name }}</hlm-select-item>
                      }
                    }
                  </hlm-select-content></hlm-select
                >
              </div>
              <div hlmField>
                <label hlmFieldLabel for="billing-interval">{{ 'billingInterval' | t }}</label
                ><hlm-select name="interval" [(ngModel)]="interval"
                  ><hlm-select-trigger buttonId="billing-interval"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal
                    ><hlm-select-item value="month">{{ 'billing.month' | t }}</hlm-select-item
                    ><hlm-select-item value="year">{{
                      'billing.year' | t
                    }}</hlm-select-item></hlm-select-content
                  ></hlm-select
                >
              </div>
              <div hlmField>
                <label hlmFieldLabel for="billing-seats">{{ 'billingSeats' | t }}</label
                ><input
                  hlmInput
                  id="billing-seats"
                  name="seats"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  [(ngModel)]="seats"
                  required
                />
                <p hlmFieldDescription>{{ 'billingSeatsHelp' | t }}</p>
              </div>
              <div hlmField>
                <label hlmFieldLabel for="billing-provider">{{ 'paymentProvider' | t }}</label
                ><hlm-select name="provider" [(ngModel)]="provider"
                  ><hlm-select-trigger buttonId="billing-provider"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal>
                    @if (billing.settings.payFastEnabled) {
                      <hlm-select-item value="payfast">PayFast (ZAR)</hlm-select-item>
                    }
                    @if (billing.settings.stripeEnabled) {
                      <hlm-select-item value="stripe">Stripe</hlm-select-item>
                    }
                  </hlm-select-content></hlm-select
                >
              </div>
              @if (!billing.settings.stripeEnabled && !billing.settings.payFastEnabled) {
                <div hlmAlert>
                  <p hlmAlertDescription>{{ 'billing.not_configured' | t }}</p>
                </div>
              }
              <div class="flex flex-wrap gap-2">
                <button hlmBtn [disabled]="busy() || form.invalid || !provider">
                  {{ 'continueToPayment' | t }}
                </button>
                @if (
                  billing.settings.trialDays > 0 && !billing.provider && billing.state === 'Free'
                ) {
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    [disabled]="busy() || !planId"
                    (click)="trial()"
                  >
                    {{ 'startTrial' | t }} ({{ billing.settings.trialDays }} {{ 'days' | t }})
                  </button>
                }
              </div>
            </form>
          </section>
        }
      }
    </app-page-state>`,
            }]
    }], () => [], { beforeUnload: [{
            type: HostListener,
            args: ['window:beforeunload', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BillingPage, { className: "BillingPage", filePath: "src/app/features/billing.ts", lineNumber: 164 }); })();
