import { RecordAttachments } from '../../../../../../src/TemplateV4.Angular/src/app/shared/record-attachments';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceApi } from '../../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { Features } from '../../../../../../src/TemplateV4.Angular/src/app/core/features';
import { WorkspaceUi, Resource } from '../../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { BusinessSelect } from '../../../../../../src/TemplateV4.Angular/src/app/shared/business-select';
import { BusinessDate } from '../../../../../../src/TemplateV4.Angular/src/app/shared/business-date';
import { commercialKinds } from './invoicing';
import * as i0 from "@angular/core";
import * as i1 from "../../../../../../src/TemplateV4.Angular/src/app/shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "../../../../../../src/TemplateV4.Angular/src/app/core/i18n";
const _c0 = a0 => ["/organizations", a0, "invoicing"];
const _c1 = a0 => ["/organizations", a0, "invoicing", "new"];
const _c2 = a0 => ({ source: a0, mode: "revision" });
const _c3 = (a0, a1) => ["/organizations", a0, "invoicing", a1];
const _forTrack0 = ($index, $item) => $item.id;
function CommercialDetailPage_Conditional_5_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 21);
    i0.ɵɵlistener("click", function CommercialDetailPage_Conditional_5_Conditional_13_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.storePdf()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "storePdf"), " ");
} }
function CommercialDetailPage_Conditional_5_Conditional_14_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 24);
    i0.ɵɵlistener("click", function CommercialDetailPage_Conditional_5_Conditional_14_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.invoiceAccepted()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "invoiceQuotation"), " ");
} }
function CommercialDetailPage_Conditional_5_Conditional_14_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const doc_r5 = i0.ɵɵreadContextLet(0);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(5, _c1, ctx_r1.organization))("queryParams", i0.ɵɵpureFunction1(7, _c2, doc_r5.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "reviseQuotation"));
} }
function CommercialDetailPage_Conditional_5_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CommercialDetailPage_Conditional_5_Conditional_14_Conditional_0_Template, 3, 4, "button", 22)(1, CommercialDetailPage_Conditional_5_Conditional_14_Conditional_1_Template, 3, 9, "a", 23);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const doc_r5 = i0.ɵɵreadContextLet(0);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(doc_r5.accepted ? 0 : ctx_r1.features.enabled("invoicing") && !doc_r5.origin ? 1 : -1);
} }
function CommercialDetailPage_Conditional_5_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const doc_r5 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "vatNumber"), ": ", doc_r5.snapshot.issuer.vatNumber);
} }
function CommercialDetailPage_Conditional_5_For_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 15)(1, "div")(2, "p", 25);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 26);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 27)(8, "p");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const line_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(line_r6.source.description);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3(" ", i0.ɵɵpipeBind1(6, 7, "quantity"), ": ", ctx_r1.i18n.number(line_r6.source.quantity), " \u00D7 ", ctx_r1.i18n.currency(line_r6.source.unitPrice), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(10, 9, "tax"), ": ", ctx_r1.i18n.currency(line_r6.tax));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.currency(line_r6.total));
} }
function CommercialDetailPage_Conditional_5_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dt");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd", 12);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "outstanding"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.currency(ctx_r1.outstanding()));
} }
function CommercialDetailPage_Conditional_5_Conditional_59_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "h2", 5);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 28);
    i0.ɵɵlistener("ngSubmit", function CommercialDetailPage_Conditional_5_Conditional_59_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.accept()); });
    i0.ɵɵelementStart(6, "div", 29)(7, "label", 30);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "input", 31);
    i0.ɵɵtwoWayListener("ngModelChange", function CommercialDetailPage_Conditional_5_Conditional_59_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.acceptance, $event) || (ctx_r1.acceptance = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 22);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "acceptQuotation"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 7, "reference"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.acceptance);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.acceptance.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 9, "acceptQuotation"), " ");
} }
function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 42);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "creditAllocationHelp"));
} }
function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 33);
    i0.ɵɵlistener("ngSubmit", function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.record()); });
    i0.ɵɵelementStart(1, "div", 29)(2, "label", 34);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 35);
    i0.ɵɵtwoWayListener("ngModelChange", function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.amount, $event) || (ctx_r1.amount = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "app-business-select", 36);
    i0.ɵɵtwoWayListener("valueChange", function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template_app_business_select_valueChange_6_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.method, $event) || (ctx_r1.method = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "app-business-date", 37);
    i0.ɵɵtwoWayListener("valueChange", function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template_app_business_date_valueChange_7_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.date, $event) || (ctx_r1.date = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 29)(9, "label", 38);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "input", 39);
    i0.ɵɵtwoWayListener("ngModelChange", function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template_input_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.reference, $event) || (ctx_r1.reference = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 29)(14, "label", 40);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "input", 41);
    i0.ɵɵtwoWayListener("ngModelChange", function CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.reason, $event) || (ctx_r1.reason = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Conditional_18_Template, 3, 3, "p", 42);
    i0.ɵɵelementStart(19, "button", 22);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 15, "amount"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.amount);
    i0.ɵɵproperty("readonly", ctx_r1.action === "payment");
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("options", ctx_r1.methods)("allowEmpty", false);
    i0.ɵɵtwoWayProperty("value", ctx_r1.method);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("value", ctx_r1.date);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 17, "reference"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.reference);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 19, "reason"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.reason);
    i0.ɵɵproperty("required", ctx_r1.action !== "payment");
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.action === "credit" ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.amount <= 0 || !ctx_r1.date || ctx_r1.action !== "payment" && !ctx_r1.reason.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(21, 21, ctx_r1.action === "payment" ? "recordPayment" : ctx_r1.action === "credit" ? "recordCredit" : "recordRefund"), " ");
} }
function CommercialDetailPage_Conditional_5_Conditional_60_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "h2", 5);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 7)(6, "div", 8)(7, "button", 24);
    i0.ɵɵlistener("click", function CommercialDetailPage_Conditional_5_Conditional_60_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.begin("payment")); });
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 21);
    i0.ɵɵlistener("click", function CommercialDetailPage_Conditional_5_Conditional_60_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.begin("credit")); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 21);
    i0.ɵɵlistener("click", function CommercialDetailPage_Conditional_5_Conditional_60_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.begin("refund")); });
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(16, CommercialDetailPage_Conditional_5_Conditional_60_Conditional_16_Template, 22, 23, "form", 32);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const doc_r5 = i0.ɵɵreadContextLet(0);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 8, "invoicing"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.outstanding() <= 0 || doc_r5.paid > 0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 10, "recordPayment"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || doc_r5.credits >= doc_r5.amount);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 12, "recordCredit"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.refundable() <= 0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 14, "recordRefund"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.action ? 16 : -1);
} }
function CommercialDetailPage_Conditional_5_For_68_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 19)(1, "p", 43);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const entry_r10 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", entry_r10.kind, " \u2014 ", ctx_r1.i18n.currency(entry_r10.amount));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", entry_r10.reference, " ", entry_r10.reason);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.date(entry_r10.at));
} }
function CommercialDetailPage_Conditional_5_For_70_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 1);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const related_r11 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction2(5, _c3, ctx_r1.organization, related_r11.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", related_r11.number, " \u2014 ", i0.ɵɵpipeBind1(2, 3, ctx_r1.kinds[related_r11.kind]));
} }
function CommercialDetailPage_Conditional_5_Conditional_71_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-record-attachments", 20);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("organization", ctx_r1.organization)("record", ctx_r1.documentId);
} }
function CommercialDetailPage_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵelementStart(1, "section", 3)(2, "div", 4)(3, "h2", 5);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 6);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 7)(9, "div", 8)(10, "button", 9);
    i0.ɵɵlistener("click", function CommercialDetailPage_Conditional_5_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.download()); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, CommercialDetailPage_Conditional_5_Conditional_13_Template, 3, 4, "button", 10);
    i0.ɵɵconditionalCreate(14, CommercialDetailPage_Conditional_5_Conditional_14_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "div", 11)(16, "div")(17, "h3", 12);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "p", 13);
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "p");
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(23, CommercialDetailPage_Conditional_5_Conditional_23_Template, 3, 4, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "div")(25, "h3", 12);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "p", 13);
    i0.ɵɵtext(29);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "p");
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(32, "ol", 14);
    i0.ɵɵrepeaterCreate(33, CommercialDetailPage_Conditional_5_For_34_Template, 13, 11, "li", 15, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "dl", 16)(36, "dt");
    i0.ɵɵtext(37);
    i0.ɵɵpipe(38, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "dd", 12);
    i0.ɵɵtext(40);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "dt");
    i0.ɵɵtext(42);
    i0.ɵɵpipe(43, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "dd");
    i0.ɵɵtext(45);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "dt");
    i0.ɵɵtext(47);
    i0.ɵɵpipe(48, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "dd");
    i0.ɵɵtext(50);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "dt");
    i0.ɵɵtext(52);
    i0.ɵɵpipe(53, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(54, "dd");
    i0.ɵɵtext(55);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(56, CommercialDetailPage_Conditional_5_Conditional_56_Template, 5, 4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "p", 13);
    i0.ɵɵtext(58);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(59, CommercialDetailPage_Conditional_5_Conditional_59_Template, 14, 11, "section", 3);
    i0.ɵɵconditionalCreate(60, CommercialDetailPage_Conditional_5_Conditional_60_Template, 17, 16, "section", 3);
    i0.ɵɵelementStart(61, "section", 17)(62, "div", 4)(63, "h2", 5);
    i0.ɵɵtext(64);
    i0.ɵɵpipe(65, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(66, "div", 18);
    i0.ɵɵrepeaterCreate(67, CommercialDetailPage_Conditional_5_For_68_Template, 7, 5, "article", 19, _forTrack0);
    i0.ɵɵrepeaterCreate(69, CommercialDetailPage_Conditional_5_For_70_Template, 3, 8, "a", 1, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(71, CommercialDetailPage_Conditional_5_Conditional_71_Template, 1, 2, "app-record-attachments", 20);
} if (rf & 2) {
    const detail_r12 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    const doc_r13 = i0.ɵɵstoreLet(detail_r12.document);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", doc_r13.number, " \u2014 ", i0.ɵɵpipeBind1(5, 29, ctx_r1.kinds[doc_r13.kind]));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.date(doc_r13.issuedAt));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 31, "download"), " PDF ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.features.enabled("invoicing-files") ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(doc_r13.kind === 0 ? 14 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(doc_r13.snapshot.issuer.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r13.snapshot.issuer.address);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r13.snapshot.issuer.contact);
    i0.ɵɵadvance();
    i0.ɵɵconditional(doc_r13.snapshot.issuer.vatRegistered ? 23 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(27, 33, "billTo"), ": ", doc_r13.snapshot.customer.name);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r13.snapshot.customer.address);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r13.snapshot.customer.email);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(doc_r13.snapshot.totals.lines);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 35, "total"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.currency(doc_r13.amount));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 37, "credits"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.currency(doc_r13.credits));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 39, "paid"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.currency(doc_r13.paid));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 41, "refunded"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.currency(doc_r13.refunded));
    i0.ɵɵadvance();
    i0.ɵɵconditional(doc_r13.kind === 1 ? 56 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r13.snapshot.issuer.paymentInstructions);
    i0.ɵɵadvance();
    i0.ɵɵconditional(doc_r13.kind === 0 && !doc_r13.accepted && ctx_r1.features.enabled("invoicing") ? 59 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(doc_r13.kind === 1 ? 60 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(65, 43, "history"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(detail_r12.entries);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(detail_r12.related);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.features.enabled("invoicing-files") ? 71 : -1);
} }
export class CommercialDetailPage {
    route = inject(ActivatedRoute);
    router = inject(Router);
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    features = inject(Features);
    organization = this.route.snapshot.paramMap.get('id');
    documentId = this.route.snapshot.paramMap.get('documentId');
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    kinds = commercialKinds;
    methods = [
        { id: '0', label: 'cash' },
        { id: '1', label: 'eft' },
        { id: '2', label: 'card' },
    ];
    action = '';
    method = '1';
    amount = 0;
    reason = '';
    reference = '';
    date = new Date().toLocaleDateString('en-CA');
    acceptance = '';
    key = crypto.randomUUID();
    submitted = '';
    constructor() {
        void this.load();
    }
    async load() {
        await this.data.load((signal) => this.api.get(`organizations/${this.organization}/invoicing/${this.documentId}`, {}, signal));
    }
    outstanding() {
        const d = this.data.value()?.document;
        return d ? Math.max(0, d.amount - d.credits - d.paid) : 0;
    }
    refundable() {
        const d = this.data.value()?.document;
        return d ? Math.max(0, d.paid - (d.amount - d.credits) - d.refunded) : 0;
    }
    begin(action) {
        this.action = action;
        this.amount =
            action === 'payment' ? this.outstanding() : action === 'refund' ? this.refundable() : 0;
        this.reason = '';
        this.reference = '';
        this.key = crypto.randomUUID();
        this.submitted = '';
    }
    async storePdf() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`organizations/${this.organization}/invoicing/${this.documentId}/store-pdf`);
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    async download() {
        const d = this.data.value()?.document;
        if (d)
            await this.api.download(`organizations/${this.organization}/invoicing/${d.id}/pdf`, d.number + '.pdf');
    }
    async accept() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`organizations/${this.organization}/invoicing/${this.documentId}/accept`, { version: this.data.value().document.version, reference: this.acceptance });
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    async invoiceAccepted() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            const result = await this.api.post(`organizations/${this.organization}/invoicing/${this.documentId}/invoice?idempotencyKey=${this.key}`);
            await this.router.navigate(['/organizations', this.organization, 'invoicing', result.id]);
        }
        finally {
            this.busy.set(false);
        }
    }
    async record() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            const payload = {
                version: this.data.value().document.version,
                amount: this.amount,
                reason: this.reason,
                method: Number(this.method),
                date: this.date,
                reference: this.reference || null,
            };
            const fingerprint = JSON.stringify({ action: this.action, ...payload });
            if (this.submitted && this.submitted !== fingerprint)
                this.key = crypto.randomUUID();
            this.submitted = fingerprint;
            await this.api.post(`organizations/${this.organization}/invoicing/${this.documentId}/${this.action}`, { idempotencyKey: this.key, ...payload });
            this.action = '';
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function CommercialDetailPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CommercialDetailPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CommercialDetailPage, selectors: [["app-commercial-detail"]], decls: 6, vars: 9, consts: [["title", "invoicing", "description", "immutableDocument"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], [3, "retry", "state", "refreshError"], ["hlmCard", "", 1, "mb-6"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "grid", "gap-5"], [1, "flex", "flex-wrap", "gap-3"], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmBtn", "", "variant", "outline", 3, "disabled"], [1, "grid", "gap-6", "md:grid-cols-2"], [1, "font-semibold"], [1, "whitespace-pre-wrap"], [1, "divide-y"], [1, "grid", "gap-2", "py-4", "sm:grid-cols-2"], [1, "grid", "gap-3", "sm:grid-cols-2"], ["hlmCard", ""], ["hlmCardContent", "", 1, "grid", "gap-4"], [1, "border-b", "pb-3"], ["kind", "invoicing", 3, "organization", "record"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["hlmBtn", "", 3, "disabled"], ["hlmBtn", "", "variant", "outline", 3, "routerLink", "queryParams"], ["hlmBtn", "", 3, "click", "disabled"], [1, "font-medium", "break-words"], [1, "text-muted-foreground"], [1, "sm:text-right"], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "acceptance-reference"], ["hlmInput", "", "id", "acceptance-reference", "name", "acceptance", "required", "", "maxlength", "1000", 3, "ngModelChange", "ngModel"], [1, "grid", "gap-4"], [1, "grid", "gap-4", 3, "ngSubmit"], ["hlmFieldLabel", "", "for", "financial-amount"], ["hlmInput", "", "id", "financial-amount", "name", "amount", "type", "number", "min", "0.01", "step", "0.01", "required", "", 3, "ngModelChange", "ngModel", "readonly"], ["controlId", "financial-method", "label", "paymentMethod", 3, "valueChange", "options", "allowEmpty", "value"], ["controlId", "financial-date", "label", "date", 3, "valueChange", "value"], ["hlmFieldLabel", "", "for", "financial-reference"], ["hlmInput", "", "id", "financial-reference", "name", "reference", "maxlength", "250", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "financial-reason"], ["hlmInput", "", "id", "financial-reason", "name", "reason", "maxlength", "1000", 3, "ngModelChange", "ngModel", "required"], ["hlmFieldDescription", ""], [1, "font-medium"]], template: function CommercialDetailPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "a", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "app-page-state", 2);
            i0.ɵɵlistener("retry", function CommercialDetailPage_Template_app_page_state_retry_4_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(5, CommercialDetailPage_Conditional_5_Template, 72, 45);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_4_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(7, _c0, ctx.organization));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "invoicing"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.data.value()) ? 5 : -1, tmp_4_0);
        } }, dependencies: [RecordAttachments, i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.MinValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldDescription, i6.HlmFieldLabel, i7.HlmInput, BusinessSelect, BusinessDate, i8.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CommercialDetailPage, [{
        type: Component,
        args: [{
                selector: 'app-commercial-detail',
                imports: [RecordAttachments, WorkspaceUi, BusinessSelect, BusinessDate],
                template: ` <app-page-header title="invoicing" description="immutableDocument"
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', organization, 'invoicing']">{{
        'invoicing' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (data.value(); as detail) {
        @let doc = detail.document;
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ doc.number }} — {{ kinds[doc.kind] | t }}</h2>
            <p hlmCardDescription>{{ i18n.date(doc.issuedAt) }}</p>
          </div>
          <div hlmCardContent class="grid gap-5">
            <div class="flex flex-wrap gap-3">
              <button hlmBtn variant="outline" (click)="download()">
                {{ 'download' | t }} PDF
              </button>
              @if (features.enabled('invoicing-files')) {
                <button hlmBtn variant="outline" [disabled]="busy()" (click)="storePdf()">
                  {{ 'storePdf' | t }}
                </button>
              }
              @if (doc.kind === 0) {
                @if (doc.accepted) {
                  <button hlmBtn [disabled]="busy()" (click)="invoiceAccepted()">
                    {{ 'invoiceQuotation' | t }}
                  </button>
                } @else if (features.enabled('invoicing') && !doc.origin) {
                  <a
                    hlmBtn
                    variant="outline"
                    [routerLink]="['/organizations', organization, 'invoicing', 'new']"
                    [queryParams]="{ source: doc.id, mode: 'revision' }"
                    >{{ 'reviseQuotation' | t }}</a
                  >
                }
              }
            </div>
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <h3 class="font-semibold">{{ doc.snapshot.issuer.name }}</h3>
                <p class="whitespace-pre-wrap">{{ doc.snapshot.issuer.address }}</p>
                <p>{{ doc.snapshot.issuer.contact }}</p>
                @if (doc.snapshot.issuer.vatRegistered) {
                  <p>{{ 'vatNumber' | t }}: {{ doc.snapshot.issuer.vatNumber }}</p>
                }
              </div>
              <div>
                <h3 class="font-semibold">{{ 'billTo' | t }}: {{ doc.snapshot.customer.name }}</h3>
                <p class="whitespace-pre-wrap">{{ doc.snapshot.customer.address }}</p>
                <p>{{ doc.snapshot.customer.email }}</p>
              </div>
            </div>
            <ol class="divide-y">
              @for (line of doc.snapshot.totals.lines; track $index) {
                <li class="grid gap-2 py-4 sm:grid-cols-2">
                  <div>
                    <p class="font-medium break-words">{{ line.source.description }}</p>
                    <p class="text-muted-foreground">
                      {{ 'quantity' | t }}: {{ i18n.number(line.source.quantity) }} ×
                      {{ i18n.currency(line.source.unitPrice) }}
                    </p>
                  </div>
                  <div class="sm:text-right">
                    <p>{{ 'tax' | t }}: {{ i18n.currency(line.tax) }}</p>
                    <p>{{ i18n.currency(line.total) }}</p>
                  </div>
                </li>
              }
            </ol>
            <dl class="grid gap-3 sm:grid-cols-2">
              <dt>{{ 'total' | t }}</dt>
              <dd class="font-semibold">{{ i18n.currency(doc.amount) }}</dd>
              <dt>{{ 'credits' | t }}</dt>
              <dd>{{ i18n.currency(doc.credits) }}</dd>
              <dt>{{ 'paid' | t }}</dt>
              <dd>{{ i18n.currency(doc.paid) }}</dd>
              <dt>{{ 'refunded' | t }}</dt>
              <dd>{{ i18n.currency(doc.refunded) }}</dd>
              @if (doc.kind === 1) {
                <dt>{{ 'outstanding' | t }}</dt>
                <dd class="font-semibold">{{ i18n.currency(outstanding()) }}</dd>
              }
            </dl>
            <p class="whitespace-pre-wrap">{{ doc.snapshot.issuer.paymentInstructions }}</p>
          </div>
        </section>
        @if (doc.kind === 0 && !doc.accepted && features.enabled('invoicing')) {
          <section hlmCard class="mb-6">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'acceptQuotation' | t }}</h2>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="accept()">
              <div hlmField>
                <label hlmFieldLabel for="acceptance-reference">{{ 'reference' | t }}</label
                ><input
                  hlmInput
                  id="acceptance-reference"
                  name="acceptance"
                  [(ngModel)]="acceptance"
                  required
                  maxlength="1000"
                />
              </div>
              <button hlmBtn [disabled]="busy() || !acceptance.trim()">
                {{ 'acceptQuotation' | t }}
              </button>
            </form>
          </section>
        }
        @if (doc.kind === 1) {
          <section hlmCard class="mb-6">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'invoicing' | t }}</h2>
            </div>
            <div hlmCardContent class="grid gap-5">
              <div class="flex flex-wrap gap-3">
                <button
                  hlmBtn
                  [disabled]="busy() || outstanding() <= 0 || doc.paid > 0"
                  (click)="begin('payment')"
                >
                  {{ 'recordPayment' | t }}</button
                ><button
                  hlmBtn
                  variant="outline"
                  [disabled]="busy() || doc.credits >= doc.amount"
                  (click)="begin('credit')"
                >
                  {{ 'recordCredit' | t }}</button
                ><button
                  hlmBtn
                  variant="outline"
                  [disabled]="busy() || refundable() <= 0"
                  (click)="begin('refund')"
                >
                  {{ 'recordRefund' | t }}
                </button>
              </div>
              @if (action) {
                <form class="grid gap-4" (ngSubmit)="record()">
                  <div hlmField>
                    <label hlmFieldLabel for="financial-amount">{{ 'amount' | t }}</label
                    ><input
                      hlmInput
                      id="financial-amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      [(ngModel)]="amount"
                      [readonly]="action === 'payment'"
                      required
                    />
                  </div>
                  <app-business-select
                    controlId="financial-method"
                    label="paymentMethod"
                    [options]="methods"
                    [allowEmpty]="false"
                    [(value)]="method"
                  />
                  <app-business-date controlId="financial-date" label="date" [(value)]="date" />
                  <div hlmField>
                    <label hlmFieldLabel for="financial-reference">{{ 'reference' | t }}</label
                    ><input
                      hlmInput
                      id="financial-reference"
                      name="reference"
                      [(ngModel)]="reference"
                      maxlength="250"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="financial-reason">{{ 'reason' | t }}</label
                    ><input
                      hlmInput
                      id="financial-reason"
                      name="reason"
                      [(ngModel)]="reason"
                      maxlength="1000"
                      [required]="action !== 'payment'"
                    />
                  </div>
                  @if (action === 'credit') {
                    <p hlmFieldDescription>{{ 'creditAllocationHelp' | t }}</p>
                  }
                  <button
                    hlmBtn
                    [disabled]="
                      busy() || amount <= 0 || !date || (action !== 'payment' && !reason.trim())
                    "
                  >
                    {{
                      (action === 'payment'
                        ? 'recordPayment'
                        : action === 'credit'
                          ? 'recordCredit'
                          : 'recordRefund'
                      ) | t
                    }}
                  </button>
                </form>
              }
            </div>
          </section>
        }
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'history' | t }}</h2>
          </div>
          <div hlmCardContent class="grid gap-4">
            @for (entry of detail.entries; track entry.id) {
              <article class="border-b pb-3">
                <p class="font-medium">{{ entry.kind }} — {{ i18n.currency(entry.amount) }}</p>
                <p>{{ entry.reference }} {{ entry.reason }}</p>
                <small>{{ i18n.date(entry.at) }}</small>
              </article>
            }
            @for (related of detail.related; track related.id) {
              <a
                hlmBtn
                variant="outline"
                [routerLink]="['/organizations', organization, 'invoicing', related.id]"
                >{{ related.number }} — {{ kinds[related.kind] | t }}</a
              >
            }
          </div>
        </section>
        @if (features.enabled('invoicing-files')) {
          <app-record-attachments
            [organization]="organization"
            [record]="documentId"
            kind="invoicing"
          />
        }
      }
    </app-page-state>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CommercialDetailPage, { className: "CommercialDetailPage", filePath: "src/app/features/commercial-detail.ts", lineNumber: 256 }); })();
