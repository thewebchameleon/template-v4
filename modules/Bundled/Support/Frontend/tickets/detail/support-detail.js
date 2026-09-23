import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { WorkspaceApi } from '../../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { Notifications } from '../../../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';
import { ticketStates, ticketPriorities } from '../support';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/select";
import * as i2 from "../../../../../../src/TemplateV4.Angular/src/app/shared/workspace";
import * as i3 from "@angular/forms";
import * as i4 from "@angular/router";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/badge";
import * as i8 from "@spartan-ng/helm/field";
import * as i9 from "@spartan-ng/helm/input";
import * as i10 from "@spartan-ng/helm/alert";
import * as i11 from "@spartan-ng/helm/checkbox";
import * as i12 from "@spartan-ng/helm/textarea";
import * as i13 from "../../../../../../src/TemplateV4.Angular/src/app/core/i18n";
const _c0 = () => [];
const _forTrack0 = ($index, $item) => $item.id;
function SupportDetailPage_Conditional_8_For_30_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "supportInternal"));
} }
function SupportDetailPage_Conditional_8_For_30_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const message_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(message_r2.body);
} }
function SupportDetailPage_Conditional_8_For_30_Conditional_9_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    const message_r2 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵtextInterpolate1(" ", message_r2.body || i0.ɵɵpipeBind1(1, 1, "supportUnassigned"), " ");
} }
function SupportDetailPage_Conditional_8_For_30_Conditional_9_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    const message_r2 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "ticket." + message_r2.body), " ");
} }
function SupportDetailPage_Conditional_8_For_30_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵconditionalCreate(3, SupportDetailPage_Conditional_8_For_30_Conditional_9_Conditional_3_Template, 2, 3);
    i0.ɵɵconditionalCreate(4, SupportDetailPage_Conditional_8_For_30_Conditional_9_Conditional_4_Template, 2, 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const message_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, "ticketEvent." + message_r2.kind), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(message_r2.kind === "assignment" ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(message_r2.kind === "status" || message_r2.kind === "priority" ? 4 : -1);
} }
function SupportDetailPage_Conditional_8_For_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 19)(1, "div", 25)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "time");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, SupportDetailPage_Conditional_8_For_30_Conditional_7_Template, 3, 3, "span", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, SupportDetailPage_Conditional_8_For_30_Conditional_8_Template, 2, 1, "p", 12)(9, SupportDetailPage_Conditional_8_For_30_Conditional_9_Template, 5, 5, "p");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const message_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(message_r2.author || i0.ɵɵpipeBind1(4, 5, "deletedAccount"));
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("datetime", message_r2.at);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.i18n.date(message_r2.at));
    i0.ɵɵadvance();
    i0.ɵɵconditional(message_r2.internal ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(message_r2.kind === "reply" ? 8 : 9);
} }
function SupportDetailPage_Conditional_8_ForEmpty_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "supportNoReplies"));
} }
function SupportDetailPage_Conditional_8_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 21)(1, "h2", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 27);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 28);
    i0.ɵɵlistener("click", function SupportDetailPage_Conditional_8_Conditional_33_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.reopen()); });
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "supportReopen"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "supportReopenHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 8, "supportReopen"), " ");
} }
function SupportDetailPage_Conditional_8_Conditional_34_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 30)(1, "div", 35)(2, "hlm-checkbox", 36);
    i0.ɵɵtwoWayListener("ngModelChange", function SupportDetailPage_Conditional_8_Conditional_34_Conditional_11_Template_hlm_checkbox_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r2.internal, $event) || (ctx_r2.internal = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(3, "div", 37)(4, "span", 38);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 39);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.internal);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 3, "supportInternal"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 5, "supportInternalHelp"));
} }
function SupportDetailPage_Conditional_8_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 7)(1, "div", 8)(2, "h2", 17);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 10);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "form", 29, 0);
    i0.ɵɵlistener("ngSubmit", function SupportDetailPage_Conditional_8_Conditional_34_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r5); const replyForm_r6 = i0.ɵɵreference(9); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(replyForm_r6.valid && ctx_r2.reply()); });
    i0.ɵɵelementStart(10, "div", 18);
    i0.ɵɵconditionalCreate(11, SupportDetailPage_Conditional_8_Conditional_34_Conditional_11_Template, 10, 7, "label", 30);
    i0.ɵɵelementStart(12, "div", 24)(13, "label", 31);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "textarea", 32);
    i0.ɵɵtwoWayListener("ngModelChange", function SupportDetailPage_Conditional_8_Conditional_34_Template_textarea_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.body, $event) || (ctx_r2.body = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "div", 33)(18, "button", 34);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const detail_r8 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, ctx_r2.internal ? "supportInternal" : "supportReply"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 9, ctx_r2.internal ? "supportInternalHelp" : "supportPublicHelp"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(detail_r8.agent ? 11 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 11, "supportMessage"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.body);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy() || !ctx_r2.body.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 13, ctx_r2.internal ? "supportSaveNote" : "supportSendReply"), " ");
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_17_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 54);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const s_r11 = ctx.$implicit;
    i0.ɵɵproperty("value", s_r11);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "ticket." + s_r11));
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 53);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_17_For_3_Template, 3, 4, "hlm-select-item", 54, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "status"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.states);
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_25_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 54);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const s_r12 = ctx.$implicit;
    i0.ɵɵproperty("value", s_r12);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "ticket." + s_r12));
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 53);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_25_For_3_Template, 3, 4, "hlm-select-item", 54, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "supportPriority"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.priorities);
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_33_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 54);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("value", c_r13.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r13.name);
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_33_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_33_For_5_Conditional_0_Template, 2, 2, "hlm-select-item", 54);
} if (rf & 2) {
    const c_r13 = ctx.$implicit;
    const detail_r8 = i0.ɵɵnextContext(4);
    i0.ɵɵconditional(c_r13.active && c_r13.id !== detail_r8.ticket.categoryId ? 0 : -1);
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 53);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 54);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(4, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_33_For_5_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r8 = i0.ɵɵnextContext(3);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 3, "supportCategory"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", detail_r8.ticket.categoryId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", detail_r8.ticket.category, " ");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.options.value()?.categories ?? i0.ɵɵpureFunction0(5, _c0));
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 54);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r8 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", detail_r8.ticket.assigneeId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", detail_r8.ticket.assignee, " ");
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_For_7_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 54);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const a_r14 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("value", a_r14.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(a_r14.name);
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_For_7_Conditional_0_Template, 2, 2, "hlm-select-item", 54);
} if (rf & 2) {
    const a_r14 = ctx.$implicit;
    const detail_r8 = i0.ɵɵnextContext(4);
    i0.ɵɵconditional(a_r14.id !== detail_r8.ticket.assigneeId ? 0 : -1);
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 53);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 55);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_Conditional_5_Template, 2, 2, "hlm-select-item", 54);
    i0.ɵɵrepeaterCreate(6, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_For_7_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r8 = i0.ɵɵnextContext(3);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 3, "supportAssignee"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "supportUnassigned"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(detail_r8.ticket.assigneeId ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.options.value()?.agents ?? i0.ɵɵpureFunction0(7, _c0));
} }
function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 7)(1, "div", 8)(2, "h2", 17);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 10);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "form", 29);
    i0.ɵɵlistener("ngSubmit", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_form_ngSubmit_8_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.update()); });
    i0.ɵɵelementStart(9, "div", 18)(10, "div", 24)(11, "label", 40);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "hlm-select", 41);
    i0.ɵɵlistener("valueChange", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_hlm_select_valueChange_14_listener($event) { const edit_r10 = i0.ɵɵrestoreView(_r9); return i0.ɵɵresetView(edit_r10.status = $event ?? edit_r10.status); });
    i0.ɵɵelementStart(15, "hlm-select-trigger", 42);
    i0.ɵɵelement(16, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(17, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_17_Template, 4, 3, "hlm-select-content", 43);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div", 24)(19, "label", 44);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "hlm-select", 41);
    i0.ɵɵlistener("valueChange", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_hlm_select_valueChange_22_listener($event) { const edit_r10 = i0.ɵɵrestoreView(_r9); return i0.ɵɵresetView(edit_r10.priority = $event ?? edit_r10.priority); });
    i0.ɵɵelementStart(23, "hlm-select-trigger", 45);
    i0.ɵɵelement(24, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(25, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_25_Template, 4, 3, "hlm-select-content", 43);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(26, "div", 24)(27, "label", 46);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "hlm-select", 41);
    i0.ɵɵlistener("valueChange", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_hlm_select_valueChange_30_listener($event) { const edit_r10 = i0.ɵɵrestoreView(_r9); return i0.ɵɵresetView(edit_r10.categoryId = $event ?? edit_r10.categoryId); });
    i0.ɵɵelementStart(31, "hlm-select-trigger", 47);
    i0.ɵɵelement(32, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(33, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_33_Template, 6, 6, "hlm-select-content", 43);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div", 24)(35, "label", 48);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "input", 49);
    i0.ɵɵtwoWayListener("ngModelChange", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_input_ngModelChange_38_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r2.agentSearch, $event) || (ctx_r2.agentSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(39, "button", 50);
    i0.ɵɵlistener("click", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_button_click_39_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.loadOptions()); });
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(42, "app-page-state", 4);
    i0.ɵɵlistener("retry", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_app_page_state_retry_42_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.loadOptions()); });
    i0.ɵɵelementStart(43, "div", 24)(44, "label", 51);
    i0.ɵɵtext(45);
    i0.ɵɵpipe(46, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "hlm-select", 41);
    i0.ɵɵlistener("valueChange", function SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template_hlm_select_valueChange_47_listener($event) { const edit_r10 = i0.ɵɵrestoreView(_r9); return i0.ɵɵresetView(edit_r10.assigneeId = $event || null); });
    i0.ɵɵelementStart(48, "hlm-select-trigger", 52);
    i0.ɵɵelement(49, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(50, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_hlm_select_content_50_Template, 8, 8, "hlm-select-content", 43);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(51, "div", 33)(52, "button", 34);
    i0.ɵɵtext(53);
    i0.ɵɵpipe(54, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const edit_r10 = ctx;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 21, "supportTriage"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 23, "supportTriageHelp"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 25, "status"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", edit_r10.status)("itemToString", ctx_r2.ticketLabel);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 27, "supportPriority"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", edit_r10.priority)("itemToString", ctx_r2.ticketLabel);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 29, "supportCategory"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", edit_r10.categoryId)("itemToString", ctx_r2.categoryLabel);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 31, "supportFindAgent"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.agentSearch);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(41, 33, "search"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("state", ctx_r2.options.state())("refreshError", ctx_r2.options.refreshError());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(46, 35, "supportAssignee"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", edit_r10.assigneeId ?? "")("itemToString", ctx_r2.assigneeLabel);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("disabled", ctx_r2.busy() || !ctx_r2.triageChanged());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(54, 37, "save"), " ");
} }
function SupportDetailPage_Conditional_8_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, SupportDetailPage_Conditional_8_Conditional_36_Conditional_0_Template, 55, 39, "section", 7);
} if (rf & 2) {
    let tmp_3_0;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_3_0 = ctx_r2.draft) ? 0 : -1, tmp_3_0);
} }
function SupportDetailPage_Conditional_8_For_47_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function SupportDetailPage_Conditional_8_For_47_Template_button_click_0_listener() { const a_r16 = i0.ɵɵrestoreView(_r15).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.download(a_r16.id, a_r16.name)); });
    i0.ɵɵelementStart(1, "span", 57);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const a_r16 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(a_r16.name);
} }
function SupportDetailPage_Conditional_8_ForEmpty_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "supportNoAttachments"));
} }
function SupportDetailPage_Conditional_8_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "label", 58);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 59);
    i0.ɵɵlistener("change", function SupportDetailPage_Conditional_8_Conditional_49_Template_input_change_4_listener($event) { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.attach($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 39);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "supportAttach"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "supportAttachmentsPublic"));
} }
function SupportDetailPage_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "div", 6)(2, "section", 7)(3, "div", 8)(4, "h2", 9);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 10);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 11)(9, "p", 12);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 13)(12, "span", 14);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "span", 15);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span", 16);
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(20, "section", 7)(21, "div", 8)(22, "h2", 17);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "p", 10);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 18);
    i0.ɵɵrepeaterCreate(29, SupportDetailPage_Conditional_8_For_30_Template, 10, 7, "article", 19, _forTrack0, false, SupportDetailPage_Conditional_8_ForEmpty_31_Template, 3, 3, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "app-list-pager", 20);
    i0.ɵɵlistener("pageChange", function SupportDetailPage_Conditional_8_Template_app_list_pager_pageChange_32_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.changePage($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(33, SupportDetailPage_Conditional_8_Conditional_33_Template, 10, 10, "div", 21)(34, SupportDetailPage_Conditional_8_Conditional_34_Template, 21, 15, "section", 7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 22);
    i0.ɵɵconditionalCreate(36, SupportDetailPage_Conditional_8_Conditional_36_Template, 1, 1);
    i0.ɵɵelementStart(37, "section", 7)(38, "div", 8)(39, "h2", 17);
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "p", 10);
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "div", 18);
    i0.ɵɵrepeaterCreate(46, SupportDetailPage_Conditional_8_For_47_Template, 3, 1, "button", 23, _forTrack0, false, SupportDetailPage_Conditional_8_ForEmpty_48_Template, 3, 3, "p");
    i0.ɵɵconditionalCreate(49, SupportDetailPage_Conditional_8_Conditional_49_Template, 8, 7, "div", 24);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const detail_r8 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(detail_r8.ticket.subject);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", detail_r8.ticket.requester, " \u00B7 ", ctx_r2.i18n.date(detail_r8.ticket.createdAt), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(detail_r8.description);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 20, "ticket." + detail_r8.ticket.status));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 22, "ticket." + detail_r8.ticket.priority));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(detail_r8.ticket.category);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 24, "supportConversation"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 26, "supportLatestFirst"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(detail_r8.messages.items);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("total", detail_r8.messages.total)("page", ctx_r2.page)("size", 25)("busy", ctx_r2.busy() || ctx_r2.data.refreshing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(detail_r8.ticket.status === "Resolved" || detail_r8.ticket.status === "Closed" ? 33 : 34);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(detail_r8.agent ? 36 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 28, "supportAttachments"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 30, "supportAttachmentHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(detail_r8.attachments);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(detail_r8.ticket.status !== "Closed" && detail_r8.ticket.status !== "Resolved" ? 49 : -1);
} }
export class SupportDetailPage {
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    data = new Resource();
    options = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    states = ticketStates;
    priorities = ticketPriorities;
    ticketLabel = (value) => this.i18n.text('ticket.' + value);
    categoryLabel = (id) => id === this.data.value()?.ticket.categoryId
        ? this.data.value().ticket.category
        : (this.options.value()?.categories.find((category) => category.id === id)?.name ?? id);
    assigneeLabel = (id) => !id
        ? this.i18n.text('supportUnassigned')
        : id === this.data.value()?.ticket.assigneeId
            ? (this.data.value().ticket.assignee ?? '')
            : (this.options.value()?.agents.find((agent) => agent.id === id)?.name ?? id);
    body = '';
    internal = false;
    page = 1;
    agentSearch = '';
    draft = null;
    constructor() {
        void this.load();
        void this.loadOptions();
    }
    async load() {
        if (await this.data.load((signal) => this.api.get(`support/${this.id}`, { pageNumber: this.page }, signal))) {
            const t = this.data.value().ticket;
            this.draft = {
                id: t.id,
                status: t.status,
                priority: t.priority,
                categoryId: t.categoryId,
                assigneeId: t.assigneeId,
                version: t.version,
            };
        }
    }
    loadOptions() {
        return this.options.load((signal) => this.api.get('support/options', { search: this.agentSearch }, signal));
    }
    triageChanged() {
        const t = this.data.value()?.ticket;
        const d = this.draft;
        return !!(t &&
            d &&
            (t.status !== d.status ||
                t.priority !== d.priority ||
                t.categoryId !== d.categoryId ||
                t.assigneeId !== d.assigneeId));
    }
    hasUnsavedChanges() {
        return !!this.body || this.triageChanged();
    }
    beforeUnload(e) {
        protectUnload(e, this.hasUnsavedChanges());
    }
    async reload() {
        if (!this.hasUnsavedChanges() || (await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) {
            this.body = '';
            await this.load();
        }
    }
    async changePage(page) {
        if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            return;
        this.page = page;
        await this.load();
    }
    async mutate(path, body, done = () => {
        /* No draft reset needed. */
    }) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(path, body);
            done();
            this.toast.success('supportSaved');
            await this.load();
        }
        catch {
            /* Central errors; preserve draft. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async reply() {
        if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            return;
        await this.mutate('support/reply', {
            id: this.id,
            body: this.body,
            internal: this.internal,
            version: this.data.value().ticket.version,
        }, () => {
            this.body = '';
            this.page = 1;
        });
    }
    update() {
        if (this.draft)
            void this.mutate('support/update', this.draft);
    }
    async reopen() {
        if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            return;
        const t = this.data.value().ticket;
        await this.mutate('support/update', {
            id: t.id,
            status: 'Open',
            priority: t.priority,
            categoryId: t.categoryId,
            assigneeId: t.assigneeId,
            version: t.version,
        });
    }
    async attach(event) {
        const input = event.target;
        const file = input.files?.[0];
        if (!file)
            return;
        if (file.size === 0 || file.size > 5 * 1024 * 1024) {
            this.toast.error({ title: this.i18n.text('supportFileSize') });
            input.value = '';
            return;
        }
        if (this.triageChanged() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) {
            input.value = '';
            return;
        }
        try {
            const content = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result).split(',')[1]);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
            });
            await this.mutate('support/attachments', {
                id: this.id,
                name: file.name,
                content,
                version: this.data.value().ticket.version,
            });
        }
        catch {
            this.toast.error({ title: this.i18n.text('supportFileReadFailed') });
        }
        finally {
            input.value = '';
        }
    }
    async download(id, name) {
        try {
            await this.api.download(`support/${this.id}/attachments/${id}`, name);
        }
        catch {
            /* Central error UI. */
        }
    }
    static ɵfac = function SupportDetailPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SupportDetailPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SupportDetailPage, selectors: [["app-support-detail"]], hostBindings: function SupportDetailPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function SupportDetailPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 9, vars: 10, consts: [["replyForm", "ngForm"], ["title", "supportTicketDetails", "description", "supportDetailHelp"], ["hlmBtn", "", "variant", "outline", "routerLink", "/support"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], [3, "retry", "state", "refreshError"], [1, "grid", "gap-6", "lg:grid-cols-3"], [1, "grid", "min-w-0", "gap-6", "lg:col-span-2"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", "", 1, "break-words"], ["hlmCardDescription", ""], ["hlmCardContent", ""], [1, "whitespace-pre-wrap", "break-words"], [1, "mt-4", "flex", "flex-wrap", "gap-2"], ["hlmBadge", ""], ["hlmBadge", "", "variant", "secondary"], ["hlmBadge", "", "variant", "outline"], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-4"], [1, "rounded-md", "border", "p-4"], [3, "pageChange", "total", "page", "size", "busy"], ["hlmAlert", ""], [1, "grid", "min-w-0", "content-start", "gap-6"], ["hlmBtn", "", "variant", "outline", 1, "max-w-full"], ["hlmField", ""], [1, "mb-2", "flex", "flex-wrap", "items-center", "gap-2"], ["hlmAlertTitle", ""], ["hlmAlertDescription", ""], ["hlmBtn", "", 1, "mt-4", 3, "click", "disabled"], [3, "ngSubmit"], ["hlmFieldLabel", "", "for", "internal"], ["hlmFieldLabel", "", "for", "reply"], ["hlmTextarea", "", "id", "reply", "name", "reply", "maxlength", "10000", "required", "", "rows", "5", 3, "ngModelChange", "ngModel"], ["hlmCardFooter", ""], ["hlmBtn", "", "type", "submit", 3, "disabled"], ["hlmField", "", "orientation", "horizontal"], ["id", "internal", "name", "internal", 3, "ngModelChange", "ngModel"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""], ["hlmFieldDescription", ""], ["hlmFieldLabel", "", "for", "status"], [3, "valueChange", "value", "itemToString"], ["buttonId", "status", 1, "w-full"], [3, "ariaLabel", 4, "hlmSelectPortal"], ["hlmFieldLabel", "", "for", "priority"], ["buttonId", "priority", 1, "w-full"], ["hlmFieldLabel", "", "for", "category"], ["buttonId", "category", 1, "w-full"], ["hlmFieldLabel", "", "for", "agent-search"], ["hlmInput", "", "id", "agent-search", "name", "agent-search", "maxlength", "120", 3, "ngModelChange", "ngModel"], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click"], ["hlmFieldLabel", "", "for", "assignee"], ["buttonId", "assignee", 1, "w-full"], [3, "ariaLabel"], [3, "value"], ["value", ""], ["hlmBtn", "", "variant", "outline", 1, "max-w-full", 3, "click"], [1, "truncate"], ["hlmFieldLabel", "", "for", "attachment"], ["hlmInput", "", "id", "attachment", "type", "file", 3, "change", "disabled"]], template: function SupportDetailPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 1)(1, "a", 2);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "button", 3);
            i0.ɵɵlistener("click", function SupportDetailPage_Template_button_click_4_listener() { return ctx.reload(); });
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "app-page-state", 4);
            i0.ɵɵlistener("retry", function SupportDetailPage_Template_app_page_state_retry_7_listener() { return ctx.reload(); });
            i0.ɵɵconditionalCreate(8, SupportDetailPage_Conditional_8_Template, 50, 32, "div", 5);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_5_0;
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, "support"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 8, "refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_5_0 = ctx.data.value()) ? 8 : -1, tmp_5_0);
        } }, dependencies: [i1.HlmSelect, i1.HlmSelectContent, i1.HlmSelectItem, i1.HlmSelectPortal, i1.HlmSelectTrigger, i1.HlmSelectValue, i2.PageHeader, i2.PageState, i2.ListPager, i3.FormsModule, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.MaxLengthValidator, i3.NgModel, i3.NgForm, i4.RouterLink, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardFooter, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmBadge, i8.HlmField, i8.HlmFieldContent, i8.HlmFieldDescription, i8.HlmFieldLabel, i8.HlmFieldTitle, i9.HlmInput, i10.HlmAlert, i10.HlmAlertDescription, i10.HlmAlertTitle, i11.HlmCheckbox, i12.HlmTextarea, i13.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SupportDetailPage, [{
        type: Component,
        args: [{
                selector: 'app-support-detail',
                imports: [HlmSelectImports, WorkspaceUi, HlmTextareaImports],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: `<app-page-header title="supportTicketDetails" description="supportDetailHelp"
      ><a hlmBtn variant="outline" routerLink="/support">{{ 'support' | t }}</a
      ><button hlmBtn variant="outline" [disabled]="busy()" (click)="reload()">
        {{ 'refresh' | t }}
      </button></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="reload()">
      @if (data.value(); as detail) {
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="grid min-w-0 gap-6 lg:col-span-2">
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle class="break-words">{{ detail.ticket.subject }}</h2>
                <p hlmCardDescription>
                  {{ detail.ticket.requester }} · {{ i18n.date(detail.ticket.createdAt) }}
                </p>
              </div>
              <div hlmCardContent>
                <p class="whitespace-pre-wrap break-words">{{ detail.description }}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span hlmBadge>{{ 'ticket.' + detail.ticket.status | t }}</span
                  ><span hlmBadge variant="secondary">{{
                    'ticket.' + detail.ticket.priority | t
                  }}</span
                  ><span hlmBadge variant="outline">{{ detail.ticket.category }}</span>
                </div>
              </div>
            </section>
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'supportConversation' | t }}</h2>
                <p hlmCardDescription>{{ 'supportLatestFirst' | t }}</p>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (message of detail.messages.items; track message.id) {
                  <article class="rounded-md border p-4">
                    <div class="mb-2 flex flex-wrap items-center gap-2">
                      <strong>{{ message.author || ('deletedAccount' | t) }}</strong
                      ><time [attr.datetime]="message.at">{{ i18n.date(message.at) }}</time>
                      @if (message.internal) {
                        <span hlmBadge variant="secondary">{{ 'supportInternal' | t }}</span>
                      }
                    </div>
                    @if (message.kind === 'reply') {
                      <p class="whitespace-pre-wrap break-words">{{ message.body }}</p>
                    } @else {
                      <p>
                        {{ 'ticketEvent.' + message.kind | t }}
                        @if (message.kind === 'assignment') {
                          {{ message.body || ('supportUnassigned' | t) }}
                        }
                        @if (message.kind === 'status' || message.kind === 'priority') {
                          {{ 'ticket.' + message.body | t }}
                        }
                      </p>
                    }
                  </article>
                } @empty {
                  <p>{{ 'supportNoReplies' | t }}</p>
                }
              </div>
              <app-list-pager
                [total]="detail.messages.total"
                [page]="page"
                [size]="25"
                [busy]="busy() || data.refreshing()"
                (pageChange)="changePage($event)"
              />
            </section>
            @if (detail.ticket.status === 'Resolved' || detail.ticket.status === 'Closed') {
              <div hlmAlert>
                <h2 hlmAlertTitle>{{ 'supportReopen' | t }}</h2>
                <p hlmAlertDescription>{{ 'supportReopenHelp' | t }}</p>
                <button hlmBtn class="mt-4" [disabled]="busy()" (click)="reopen()">
                  {{ 'supportReopen' | t }}
                </button>
              </div>
            } @else {
              <section hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>{{ (internal ? 'supportInternal' : 'supportReply') | t }}</h2>
                  <p hlmCardDescription>
                    {{ (internal ? 'supportInternalHelp' : 'supportPublicHelp') | t }}
                  </p>
                </div>
                <form #replyForm="ngForm" (ngSubmit)="replyForm.valid && reply()">
                  <div hlmCardContent class="grid gap-4">
                    @if (detail.agent) {
                      <label hlmFieldLabel for="internal"
                        ><div hlmField orientation="horizontal">
                          <hlm-checkbox id="internal" name="internal" [(ngModel)]="internal" />
                          <div hlmFieldContent>
                            <span hlmFieldTitle>{{ 'supportInternal' | t }}</span>
                            <p hlmFieldDescription>{{ 'supportInternalHelp' | t }}</p>
                          </div>
                        </div></label
                      >
                    }
                    <div hlmField>
                      <label hlmFieldLabel for="reply">{{ 'supportMessage' | t }}</label
                      ><textarea
                        hlmTextarea
                        id="reply"
                        name="reply"
                        [(ngModel)]="body"
                        maxlength="10000"
                        required
                        rows="5"
                      ></textarea>
                    </div>
                  </div>
                  <div hlmCardFooter>
                    <button hlmBtn type="submit" [disabled]="busy() || !body.trim()">
                      {{ (internal ? 'supportSaveNote' : 'supportSendReply') | t }}
                    </button>
                  </div>
                </form>
              </section>
            }
          </div>
          <div class="grid min-w-0 content-start gap-6">
            @if (detail.agent) {
              @if (draft; as edit) {
                <section hlmCard>
                  <div hlmCardHeader>
                    <h2 hlmCardTitle>{{ 'supportTriage' | t }}</h2>
                    <p hlmCardDescription>{{ 'supportTriageHelp' | t }}</p>
                  </div>
                  <form (ngSubmit)="update()">
                    <div hlmCardContent class="grid gap-4">
                      <div hlmField>
                        <label hlmFieldLabel for="status">{{ 'status' | t }}</label
                        ><hlm-select
                          [value]="edit.status"
                          [itemToString]="ticketLabel"
                          (valueChange)="edit.status = $event ?? edit.status"
                        >
                          <hlm-select-trigger buttonId="status" class="w-full"
                            ><hlm-select-value
                          /></hlm-select-trigger>
                          <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t">
                            @for (s of states; track s) {
                              <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                            }
                          </hlm-select-content>
                        </hlm-select>
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="priority">{{ 'supportPriority' | t }}</label
                        ><hlm-select
                          [value]="edit.priority"
                          [itemToString]="ticketLabel"
                          (valueChange)="edit.priority = $event ?? edit.priority"
                        >
                          <hlm-select-trigger buttonId="priority" class="w-full"
                            ><hlm-select-value
                          /></hlm-select-trigger>
                          <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportPriority' | t">
                            @for (s of priorities; track s) {
                              <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                            }
                          </hlm-select-content>
                        </hlm-select>
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="category">{{ 'supportCategory' | t }}</label
                        ><hlm-select
                          [value]="edit.categoryId"
                          [itemToString]="categoryLabel"
                          (valueChange)="edit.categoryId = $event ?? edit.categoryId"
                        >
                          <hlm-select-trigger buttonId="category" class="w-full"
                            ><hlm-select-value
                          /></hlm-select-trigger>
                          <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t"
                            ><hlm-select-item [value]="detail.ticket.categoryId">
                              {{ detail.ticket.category }}
                            </hlm-select-item>
                            @for (c of options.value()?.categories ?? []; track c.id) {
                              @if (c.active && c.id !== detail.ticket.categoryId) {
                                <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                              }
                            }
                          </hlm-select-content>
                        </hlm-select>
                      </div>
                      <div hlmField>
                        <label hlmFieldLabel for="agent-search">{{ 'supportFindAgent' | t }}</label
                        ><input
                          hlmInput
                          id="agent-search"
                          name="agent-search"
                          [(ngModel)]="agentSearch"
                          maxlength="120"
                        /><button hlmBtn variant="outline" type="button" (click)="loadOptions()">
                          {{ 'search' | t }}
                        </button>
                      </div>
                      <app-page-state
                        [state]="options.state()"
                        [refreshError]="options.refreshError()"
                        (retry)="loadOptions()"
                        ><div hlmField>
                          <label hlmFieldLabel for="assignee">{{ 'supportAssignee' | t }}</label
                          ><hlm-select
                            [value]="edit.assigneeId ?? ''"
                            [itemToString]="assigneeLabel"
                            (valueChange)="edit.assigneeId = $event || null"
                          >
                            <hlm-select-trigger buttonId="assignee" class="w-full"
                              ><hlm-select-value
                            /></hlm-select-trigger>
                            <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportAssignee' | t"
                              ><hlm-select-item value="">{{
                                'supportUnassigned' | t
                              }}</hlm-select-item>
                              @if (detail.ticket.assigneeId) {
                                <hlm-select-item [value]="detail.ticket.assigneeId">
                                  {{ detail.ticket.assignee }}
                                </hlm-select-item>
                              }
                              @for (a of options.value()?.agents ?? []; track a.id) {
                                @if (a.id !== detail.ticket.assigneeId) {
                                  <hlm-select-item [value]="a.id">{{ a.name }}</hlm-select-item>
                                }
                              }
                            </hlm-select-content>
                          </hlm-select>
                        </div></app-page-state
                      >
                    </div>
                    <div hlmCardFooter>
                      <button hlmBtn type="submit" [disabled]="busy() || !triageChanged()">
                        {{ 'save' | t }}
                      </button>
                    </div>
                  </form>
                </section>
              }
            }
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'supportAttachments' | t }}</h2>
                <p hlmCardDescription>{{ 'supportAttachmentHelp' | t }}</p>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (a of detail.attachments; track a.id) {
                  <button
                    hlmBtn
                    variant="outline"
                    class="max-w-full"
                    (click)="download(a.id, a.name)"
                  >
                    <span class="truncate">{{ a.name }}</span>
                  </button>
                } @empty {
                  <p>{{ 'supportNoAttachments' | t }}</p>
                }
                @if (detail.ticket.status !== 'Closed' && detail.ticket.status !== 'Resolved') {
                  <div hlmField>
                    <label hlmFieldLabel for="attachment">{{ 'supportAttach' | t }}</label
                    ><input
                      hlmInput
                      id="attachment"
                      type="file"
                      [disabled]="busy()"
                      (change)="attach($event)"
                    />
                    <p hlmFieldDescription>{{ 'supportAttachmentsPublic' | t }}</p>
                  </div>
                }
              </div>
            </section>
          </div>
        </div>
      }
    </app-page-state>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SupportDetailPage, { className: "SupportDetailPage", filePath: "src/app/features/support-detail.ts", lineNumber: 294 }); })();
