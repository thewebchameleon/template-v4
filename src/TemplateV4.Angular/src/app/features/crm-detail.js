import { BusinessDraft } from '../shared/business-draft';
import { FOUNDATION_FEATURES } from '../core/feature-extensions';
import { Features } from '../core/features';
import { RecordAttachments } from '../shared/record-attachments';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Resource, WorkspaceUi } from '../shared/workspace';
import { BusinessSelect } from '../shared/business-select';
import { BusinessDate } from '../shared/business-date';
import { CrmCustomerPicker } from '../shared/crm-customer-picker';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/checkbox";
import * as i9 from "@spartan-ng/helm/textarea";
import * as i10 from "../core/i18n";
const _c0 = a0 => ["/organizations", a0, "crm"];
const _c1 = () => [];
const _c2 = (a0, a1) => ["/organizations", a0, a1];
const _c3 = (a0, a1) => ({ deal: a0, customer: a1 });
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.segment;
function CrmDetailPage_Conditional_5_For_9_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "label", 16);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 17);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmDetailPage_Conditional_5_For_9_Template_input_ngModelChange_4_listener($event) { const key_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.draft[key_r4], $event) || (ctx_r1.draft[key_r4] = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const key_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", "crm-" + key_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 7, key_r4));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "crm-" + key_r4)("name", key_r4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.draft[key_r4]);
    i0.ɵɵproperty("required", key_r4 === "name")("maxlength", key_r4 === "address" ? 2000 : 250);
    i0.ɵɵcontrol();
} }
function CrmDetailPage_Conditional_5_For_14_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 16)(1, "div", 18)(2, "hlm-checkbox", 19);
    i0.ɵɵlistener("ngModelChange", function CrmDetailPage_Conditional_5_For_14_Conditional_0_Template_hlm_checkbox_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r5); const tag_r6 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleTag(tag_r6.id, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const tag_r6 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("for", "tag-" + tag_r6.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", "tag-" + tag_r6.id)("name", "tag-" + tag_r6.id)("ngModel", ctx_r1.draft.tags.includes(tag_r6.id));
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(tag_r6.label);
} }
function CrmDetailPage_Conditional_5_For_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CrmDetailPage_Conditional_5_For_14_Conditional_0_Template, 5, 5, "label", 16);
} if (rf & 2) {
    const tag_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(!tag_r6.retired || ctx_r1.draft.tags.includes(tag_r6.id) ? 0 : -1);
} }
function CrmDetailPage_Conditional_5_Conditional_15_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 20)(1, "app-crm-customer-picker", 22);
    i0.ɵɵtwoWayListener("valueChange", function CrmDetailPage_Conditional_5_Conditional_15_For_4_Template_app_crm_customer_picker_valueChange_1_listener($event) { const relation_r9 = i0.ɵɵrestoreView(_r8).$implicit; i0.ɵɵtwoWayBindingSet(relation_r9.companyId, $event) || (relation_r9.companyId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 9)(3, "label", 16);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "input", 23);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmDetailPage_Conditional_5_Conditional_15_For_4_Template_input_ngModelChange_6_listener($event) { const relation_r9 = i0.ɵɵrestoreView(_r8).$implicit; i0.ɵɵtwoWayBindingSet(relation_r9.role, $event) || (relation_r9.role = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 21);
    i0.ɵɵlistener("click", function CrmDetailPage_Conditional_5_Conditional_15_For_4_Template_button_click_7_listener() { const ɵ$index_53_r10 = i0.ɵɵrestoreView(_r8).$index; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.draft.companies.splice(ɵ$index_53_r10, 1)); });
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const relation_r9 = ctx.$implicit;
    const ɵ$index_53_r10 = ctx.$index;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("organization", ctx_r1.organization)("controlId", "company-" + ɵ$index_53_r10);
    i0.ɵɵtwoWayProperty("value", relation_r9.companyId);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", "role-" + ɵ$index_53_r10);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 9, "relationshipRole"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "role-" + ɵ$index_53_r10)("name", "role-" + ɵ$index_53_r10);
    i0.ɵɵtwoWayProperty("ngModel", relation_r9.role);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 11, "remove"), " ");
} }
function CrmDetailPage_Conditional_5_Conditional_15_For_9_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-business-select", 25);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Conditional_15_For_9_Conditional_0_Template_app_business_select_valueChange_0_listener($event) { i0.ɵɵrestoreView(_r11); const field_r12 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.setField(field_r12.id, $event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const field_r12 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("controlId", "field-" + field_r12.id)("label", field_r12.label)("options", field_r12.options)("value", ctx_r1.fieldValue(field_r12.id));
} }
function CrmDetailPage_Conditional_5_Conditional_15_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CrmDetailPage_Conditional_5_Conditional_15_For_9_Conditional_0_Template, 1, 4, "app-business-select", 24);
} if (rf & 2) {
    const field_r12 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(!field_r12.retired || ctx_r1.fieldValue(field_r12.id) ? 0 : -1);
} }
function CrmDetailPage_Conditional_5_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "h3");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(3, CrmDetailPage_Conditional_5_Conditional_15_For_4_Template, 10, 13, "div", 20, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementStart(5, "button", 21);
    i0.ɵɵlistener("click", function CrmDetailPage_Conditional_5_Conditional_15_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.draft.companies.push({ companyId: "", role: "" })); });
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(8, CrmDetailPage_Conditional_5_Conditional_15_For_9_Template, 1, 1, null, null, _forTrack0);
} if (rf & 2) {
    const config_r13 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "companyRelationships"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.draft.companies);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 4, "addRelationship"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(config_r13.contactFields);
} }
function CrmDetailPage_Conditional_5_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-crm-customer-picker", 26);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Conditional_16_Template_app_crm_customer_picker_valueChange_0_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.draft.customerId = $event || null); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(1, "app-crm-customer-picker", 27);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Conditional_16_Template_app_crm_customer_picker_valueChange_1_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.draft.contactId = $event || null); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 9)(3, "label", 28);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "input", 29);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmDetailPage_Conditional_5_Conditional_16_Template_input_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.draft.value, $event) || (ctx_r1.draft.value = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "app-business-date", 30);
    i0.ɵɵtwoWayListener("valueChange", function CrmDetailPage_Conditional_5_Conditional_16_Template_app_business_date_valueChange_7_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.draft.expectedCloseDate, $event) || (ctx_r1.draft.expectedCloseDate = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "app-business-select", 31);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Conditional_16_Template_app_business_select_valueChange_8_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.pipeline($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "app-business-select", 32);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Conditional_16_Template_app_business_select_valueChange_9_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.draft.stageId = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "app-business-select", 33);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Conditional_16_Template_app_business_select_valueChange_10_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setOutcome($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("organization", ctx_r1.organization)("value", ctx_r1.draft.customerId ?? "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("organization", ctx_r1.organization)("value", ctx_r1.draft.contactId ?? "");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 16, "value"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.draft.value);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("value", ctx_r1.draft.expectedCloseDate);
    i0.ɵɵadvance();
    i0.ɵɵproperty("options", ctx_r1.pipelines())("allowEmpty", false)("value", ctx_r1.draft.pipelineId ?? "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("options", ctx_r1.stages())("allowEmpty", false)("value", ctx_r1.draft.stageId ?? "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("options", ctx_r1.outcomes)("allowEmpty", false)("value", "" + ctx_r1.draft.outcome);
} }
function CrmDetailPage_Conditional_5_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const form_r15 = i0.ɵɵreference(6);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r15.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "save"));
} }
function CrmDetailPage_Conditional_5_Conditional_18_For_1_For_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 34);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r16 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction2(5, _c2, ctx_r1.organization, action_r16.segment))("queryParams", i0.ɵɵpureFunction2(8, _c3, ctx_r1.recordId, ctx_r1.draft.customerId));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, action_r16.label));
} }
function CrmDetailPage_Conditional_5_Conditional_18_For_1_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CrmDetailPage_Conditional_5_Conditional_18_For_1_For_1_Conditional_0_Template, 3, 11, "a", 34);
} if (rf & 2) {
    const action_r16 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵconditional(ctx_r1.features.enabled(action_r16.capability) ? 0 : -1);
} }
function CrmDetailPage_Conditional_5_Conditional_18_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, CrmDetailPage_Conditional_5_Conditional_18_For_1_For_1_Template, 1, 1, null, null, _forTrack1);
} if (rf & 2) {
    const feature_r17 = ctx.$implicit;
    i0.ɵɵrepeater(feature_r17.crmDealActions ?? i0.ɵɵpureFunction0(0, _c1));
} }
function CrmDetailPage_Conditional_5_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, CrmDetailPage_Conditional_5_Conditional_18_For_1_Template, 2, 1, null, null, _forTrack0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(ctx_r1.extensions);
} }
function CrmDetailPage_Conditional_5_Conditional_19_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 36)(1, "p", 38);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "small", 39);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const note_r18 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(note_r18.text);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.date(note_r18.at));
} }
function CrmDetailPage_Conditional_5_Conditional_19_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 40);
    i0.ɵɵlistener("ngSubmit", function CrmDetailPage_Conditional_5_Conditional_19_Conditional_8_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r19); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.addNote()); });
    i0.ɵɵelementStart(1, "label", 41);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "textarea", 42);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmDetailPage_Conditional_5_Conditional_19_Conditional_8_Template_textarea_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r19); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.note, $event) || (ctx_r1.note = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(5, "button", 13);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "addNote"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.note);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.note.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "addNote"));
} }
function CrmDetailPage_Conditional_5_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 14)(1, "div", 5)(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 35);
    i0.ɵɵrepeaterCreate(6, CrmDetailPage_Conditional_5_Conditional_19_For_7_Template, 5, 2, "article", 36, _forTrack0);
    i0.ɵɵconditionalCreate(8, CrmDetailPage_Conditional_5_Conditional_19_Conditional_8_Template, 8, 8, "form", 37);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "notes"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx.notes);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.archived() ? 8 : -1);
} }
function CrmDetailPage_Conditional_5_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-record-attachments", 15);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("organization", ctx_r1.organization)("record", ctx_r1.recordId);
} }
function CrmDetailPage_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 5)(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 7, 0);
    i0.ɵɵlistener("ngSubmit", function CrmDetailPage_Conditional_5_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.save()); });
    i0.ɵɵelementStart(7, "fieldset", 8);
    i0.ɵɵrepeaterCreate(8, CrmDetailPage_Conditional_5_For_9_Template, 5, 9, "div", 9, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(10, "app-business-select", 10);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Template_app_business_select_valueChange_10_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.draft.ownerId = $event || null); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "app-business-select", 11);
    i0.ɵɵlistener("valueChange", function CrmDetailPage_Conditional_5_Template_app_business_select_valueChange_11_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.draft.lifecycleStatusId = $event || null); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 12);
    i0.ɵɵrepeaterCreate(13, CrmDetailPage_Conditional_5_For_14_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, CrmDetailPage_Conditional_5_Conditional_15_Template, 10, 6);
    i0.ɵɵconditionalCreate(16, CrmDetailPage_Conditional_5_Conditional_16_Template, 11, 18);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(17, CrmDetailPage_Conditional_5_Conditional_17_Template, 3, 4, "button", 13);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(18, CrmDetailPage_Conditional_5_Conditional_18_Template, 2, 0);
    i0.ɵɵconditionalCreate(19, CrmDetailPage_Conditional_5_Conditional_19_Template, 9, 4, "section", 14);
    i0.ɵɵconditionalCreate(20, CrmDetailPage_Conditional_5_Conditional_20_Template, 1, 2, "app-record-attachments", 15);
} if (rf & 2) {
    let tmp_15_0;
    const config_r13 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.draft.name || i0.ɵɵpipeBind1(4, 12, "crmNew"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.archived());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.textFields);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("options", ctx_r1.owners())("value", ctx_r1.draft.ownerId ?? "");
    i0.ɵɵadvance();
    i0.ɵɵproperty("options", config_r13.lifecycleStatuses)("value", ctx_r1.draft.lifecycleStatusId ?? "");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(config_r13.tags);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.draft.kind === 0 ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.draft.kind === 2 ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.archived() ? 17 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.draft.kind === 2 && ctx_r1.recordId !== "new" && !ctx_r1.archived() ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_15_0 = ctx_r1.data.value()) ? 19 : -1, tmp_15_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.recordId !== "new" && ctx_r1.features.enabled("crm-files") ? 20 : -1);
} }
export class CrmDetailPage extends BusinessDraft {
    draftValue() {
        return this.draft;
    }
    features = inject(Features);
    extensions = inject(FOUNDATION_FEATURES);
    route = inject(ActivatedRoute);
    router = inject(Router);
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    organization = this.route.snapshot.paramMap.get('id');
    recordId = this.route.snapshot.paramMap.get('recordId');
    owners = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "owners" }] : /* istanbul ignore next */ []));
    data = new Resource();
    configuration = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "configuration" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    note = '';
    textFields = ['name', 'email', 'phone', 'address', 'vatNumber'];
    outcomes = [
        { id: '0', label: 'dealOpen' },
        { id: '1', label: 'dealWon' },
        { id: '2', label: 'dealLost' },
    ];
    draft = {
        kind: Number(this.route.snapshot.queryParamMap.get('kind') ?? 0),
        name: '',
        email: '',
        phone: '',
        address: '',
        companies: [],
        customFields: [],
        tags: [],
        ownerId: null,
        lifecycleStatusId: null,
        customerId: null,
        contactId: null,
        value: null,
        expectedCloseDate: null,
        pipelineId: null,
        stageId: null,
        outcome: 0,
    };
    constructor() {
        super();
        void this.load();
        void this.api
            .get(`organizations/${this.organization}/members`, { pageSize: 100 })
            .then((page) => this.owners.set(page.items.map((x) => ({ id: x.userId, label: x.name }))))
            .catch(() => {
            /* The HTTP interceptor reports the error. */
        });
    }
    archived() {
        return this.data.value()?.record.archived ?? false;
    }
    async load() {
        await this.data.load(async (signal) => {
            const [config, detail] = await Promise.all([
                this.api.get(`organizations/${this.organization}/crm/configuration`, {}, signal),
                this.recordId === 'new'
                    ? Promise.resolve(null)
                    : this.api.get(`organizations/${this.organization}/crm/${this.recordId}`, {}, signal),
            ]);
            this.configuration.set(config);
            if (detail)
                this.draft = structuredClone(detail.record.data);
            else if (this.draft.kind === 2) {
                this.draft.value = 0;
                this.pipeline(config.pipelines[0].id);
            }
            this.markSaved();
            return detail;
        });
    }
    pipelines() {
        return (this.configuration()?.pipelines ?? []).map((x) => ({
            id: x.id,
            label: x.label,
            retired: x.retired,
        }));
    }
    stages() {
        return (this.configuration()?.pipelines.find((x) => x.id === this.draft.pipelineId)?.stages ?? []);
    }
    pipeline(id) {
        this.draft.pipelineId = id;
        this.draft.stageId = this.stages().find((x) => !x.retired)?.id ?? null;
    }
    setOutcome(value) {
        this.draft.outcome = Number(value);
    }
    fieldValue(id) {
        return this.draft.customFields.find((x) => x.fieldId === id)?.optionId ?? '';
    }
    setField(id, value) {
        this.draft.customFields = this.draft.customFields.filter((x) => x.fieldId !== id);
        if (value)
            this.draft.customFields.push({ fieldId: id, optionId: value });
    }
    toggleTag(id, value) {
        this.draft.tags = this.draft.tags.filter((x) => x !== id);
        if (value)
            this.draft.tags.push(id);
    }
    async save() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            const record = await this.api.post(`organizations/${this.organization}/crm`, {
                id: this.recordId === 'new' ? null : this.recordId,
                version: this.data.value()?.record.version ?? null,
                data: this.draft,
            });
            if (this.recordId === 'new') {
                this.markSaved();
                await this.router.navigate(['/organizations', this.organization, 'crm', record.id]);
            }
            else
                await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    async addNote() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`organizations/${this.organization}/crm/${this.recordId}/notes`, {
                text: this.note,
            });
            this.note = '';
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function CrmDetailPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CrmDetailPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CrmDetailPage, selectors: [["app-crm-detail"]], features: [i0.ɵɵInheritDefinitionFeature], decls: 6, vars: 9, consts: [["form", "ngForm"], ["title", "crmEdit", "description", "crmHelp"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], [3, "retry", "state", "refreshError"], ["hlmCard", "", 1, "mb-6"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-5", 3, "ngSubmit"], [1, "grid", "gap-5", 3, "disabled"], ["hlmField", ""], ["controlId", "crm-owner", "label", "recordOwner", 3, "valueChange", "options", "value"], ["controlId", "crm-lifecycle", "label", "lifecycle", 3, "valueChange", "options", "value"], [1, "flex", "flex-wrap", "gap-4"], ["hlmBtn", "", 3, "disabled"], ["hlmCard", ""], ["kind", "crm", 3, "organization", "record"], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", 3, "ngModelChange", "id", "name", "ngModel", "required", "maxlength"], ["hlmField", "", "orientation", "horizontal"], [3, "ngModelChange", "inputId", "name", "ngModel"], [1, "grid", "gap-3", "rounded-lg", "border", "p-4"], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click"], ["label", "companies", "fixedKind", "1", 3, "valueChange", "organization", "controlId", "value"], ["hlmInput", "", "maxlength", "100", 3, "ngModelChange", "id", "name", "ngModel"], [3, "controlId", "label", "options", "value"], [3, "valueChange", "controlId", "label", "options", "value"], ["controlId", "deal-customer", 3, "valueChange", "organization", "value"], ["controlId", "deal-contact", "label", "contacts", "fixedKind", "0", 3, "valueChange", "organization", "value"], ["hlmFieldLabel", "", "for", "deal-value"], ["hlmInput", "", "id", "deal-value", "name", "value", "type", "number", "min", "0", "step", "0.01", "required", "", 3, "ngModelChange", "ngModel"], ["controlId", "deal-close", "label", "expectedClose", 3, "valueChange", "value"], ["controlId", "deal-pipeline", "label", "pipeline", 3, "valueChange", "options", "allowEmpty", "value"], ["controlId", "deal-stage", "label", "stage", 3, "valueChange", "options", "allowEmpty", "value"], ["controlId", "deal-outcome", "label", "outcome", 3, "valueChange", "options", "allowEmpty", "value"], ["hlmBtn", "", "variant", "outline", 3, "routerLink", "queryParams"], ["hlmCardContent", "", 1, "grid", "gap-4"], [1, "border-b", "pb-4"], [1, "grid", "gap-3"], [1, "whitespace-pre-wrap", "break-words"], [1, "text-muted-foreground"], [1, "grid", "gap-3", 3, "ngSubmit"], ["hlmFieldLabel", "", "for", "crm-note"], ["hlmTextarea", "", "id", "crm-note", "name", "note", "maxlength", "8000", "required", "", 3, "ngModelChange", "ngModel"]], template: function CrmDetailPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 1)(1, "a", 2);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "app-page-state", 3);
            i0.ɵɵlistener("retry", function CrmDetailPage_Template_app_page_state_retry_4_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(5, CrmDetailPage_Conditional_5_Template, 21, 14);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_4_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(7, _c0, ctx.organization));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "crm"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.configuration()) ? 5 : -1, tmp_4_0);
        } }, dependencies: [RecordAttachments, i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.MinValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.HlmCheckbox, BusinessSelect,
            BusinessDate,
            CrmCustomerPicker, i9.HlmTextarea, i10.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CrmDetailPage, [{
        type: Component,
        args: [{
                selector: 'app-crm-detail',
                imports: [
                    RecordAttachments,
                    WorkspaceUi,
                    BusinessSelect,
                    BusinessDate,
                    CrmCustomerPicker,
                    HlmTextareaImports,
                ],
                template: `<app-page-header title="crmEdit" description="crmHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', organization, 'crm']">{{
        'crm' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (configuration(); as config) {
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ draft.name || ('crmNew' | t) }}</h2>
          </div>
          <form hlmCardContent class="grid gap-5" (ngSubmit)="save()" #form="ngForm">
            <fieldset [disabled]="busy() || archived()" class="grid gap-5">
              @for (key of textFields; track key) {
                <div hlmField>
                  <label hlmFieldLabel [for]="'crm-' + key">{{ key | t }}</label
                  ><input
                    hlmInput
                    [id]="'crm-' + key"
                    [name]="key"
                    [(ngModel)]="draft[key]"
                    [required]="key === 'name'"
                    [maxlength]="key === 'address' ? 2000 : 250"
                  />
                </div>
              }
              <app-business-select
                controlId="crm-owner"
                label="recordOwner"
                [options]="owners()"
                [value]="draft.ownerId ?? ''"
                (valueChange)="draft.ownerId = $event || null"
              />
              <app-business-select
                controlId="crm-lifecycle"
                label="lifecycle"
                [options]="config.lifecycleStatuses"
                [value]="draft.lifecycleStatusId ?? ''"
                (valueChange)="draft.lifecycleStatusId = $event || null"
              />
              <div class="flex flex-wrap gap-4">
                @for (tag of config.tags; track tag.id) {
                  @if (!tag.retired || draft.tags.includes(tag.id)) {
                    <label hlmFieldLabel [for]="'tag-' + tag.id"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          [inputId]="'tag-' + tag.id"
                          [name]="'tag-' + tag.id"
                          [ngModel]="draft.tags.includes(tag.id)"
                          (ngModelChange)="toggleTag(tag.id, $event)"
                        /><span>{{ tag.label }}</span>
                      </div></label
                    >
                  }
                }
              </div>
              @if (draft.kind === 0) {
                <h3>{{ 'companyRelationships' | t }}</h3>
                @for (relation of draft.companies; track $index; let index = $index) {
                  <div class="grid gap-3 rounded-lg border p-4">
                    <app-crm-customer-picker
                      [organization]="organization"
                      [controlId]="'company-' + index"
                      label="companies"
                      fixedKind="1"
                      [(value)]="relation.companyId"
                    />
                    <div hlmField>
                      <label hlmFieldLabel [for]="'role-' + index">{{
                        'relationshipRole' | t
                      }}</label
                      ><input
                        hlmInput
                        [id]="'role-' + index"
                        [name]="'role-' + index"
                        [(ngModel)]="relation.role"
                        maxlength="100"
                      />
                    </div>
                    <button
                      hlmBtn
                      variant="outline"
                      type="button"
                      (click)="draft.companies.splice(index, 1)"
                    >
                      {{ 'remove' | t }}
                    </button>
                  </div>
                }
                <button
                  hlmBtn
                  variant="outline"
                  type="button"
                  (click)="draft.companies.push({ companyId: '', role: '' })"
                >
                  {{ 'addRelationship' | t }}
                </button>
                @for (field of config.contactFields; track field.id) {
                  @if (!field.retired || fieldValue(field.id)) {
                    <app-business-select
                      [controlId]="'field-' + field.id"
                      [label]="field.label"
                      [options]="field.options"
                      [value]="fieldValue(field.id)"
                      (valueChange)="setField(field.id, $event)"
                    />
                  }
                }
              }
              @if (draft.kind === 2) {
                <app-crm-customer-picker
                  [organization]="organization"
                  controlId="deal-customer"
                  [value]="draft.customerId ?? ''"
                  (valueChange)="draft.customerId = $event || null"
                />
                <app-crm-customer-picker
                  [organization]="organization"
                  controlId="deal-contact"
                  label="contacts"
                  fixedKind="0"
                  [value]="draft.contactId ?? ''"
                  (valueChange)="draft.contactId = $event || null"
                />
                <div hlmField>
                  <label hlmFieldLabel for="deal-value">{{ 'value' | t }}</label
                  ><input
                    hlmInput
                    id="deal-value"
                    name="value"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    [(ngModel)]="draft.value"
                  />
                </div>
                <app-business-date
                  controlId="deal-close"
                  label="expectedClose"
                  [(value)]="draft.expectedCloseDate"
                />
                <app-business-select
                  controlId="deal-pipeline"
                  label="pipeline"
                  [options]="pipelines()"
                  [allowEmpty]="false"
                  [value]="draft.pipelineId ?? ''"
                  (valueChange)="pipeline($event)"
                />
                <app-business-select
                  controlId="deal-stage"
                  label="stage"
                  [options]="stages()"
                  [allowEmpty]="false"
                  [value]="draft.stageId ?? ''"
                  (valueChange)="draft.stageId = $event"
                />
                <app-business-select
                  controlId="deal-outcome"
                  label="outcome"
                  [options]="outcomes"
                  [allowEmpty]="false"
                  [value]="'' + draft.outcome"
                  (valueChange)="setOutcome($event)"
                />
              }
            </fieldset>
            @if (!archived()) {
              <button hlmBtn [disabled]="busy() || form.invalid">{{ 'save' | t }}</button>
            }
          </form>
        </section>
        @if (draft.kind === 2 && recordId !== 'new' && !archived()) {
          @for (feature of extensions; track feature.id) {
            @for (action of feature.crmDealActions ?? []; track action.segment) {
              @if (features.enabled(action.capability)) {
                <a
                  hlmBtn
                  variant="outline"
                  [routerLink]="['/organizations', organization, action.segment]"
                  [queryParams]="{ deal: recordId, customer: draft.customerId }"
                  >{{ action.label | t }}</a
                >
              }
            }
          }
        }
        @if (data.value(); as detail) {
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'notes' | t }}</h2>
            </div>
            <div hlmCardContent class="grid gap-4">
              @for (note of detail.notes; track note.id) {
                <article class="border-b pb-4">
                  <p class="whitespace-pre-wrap break-words">{{ note.text }}</p>
                  <small class="text-muted-foreground">{{ i18n.date(note.at) }}</small>
                </article>
              }
              @if (!archived()) {
                <form class="grid gap-3" (ngSubmit)="addNote()">
                  <label hlmFieldLabel for="crm-note">{{ 'addNote' | t }}</label
                  ><textarea
                    hlmTextarea
                    id="crm-note"
                    name="note"
                    [(ngModel)]="note"
                    maxlength="8000"
                    required
                  ></textarea
                  ><button hlmBtn [disabled]="busy() || !note.trim()">{{ 'addNote' | t }}</button>
                </form>
              }
            </div>
          </section>
        }
        @if (recordId !== 'new' && features.enabled('crm-files')) {
          <app-record-attachments [organization]="organization" [record]="recordId" kind="crm" />
        }
      }
    </app-page-state>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CrmDetailPage, { className: "CrmDetailPage", filePath: "src/app/features/crm-detail.ts", lineNumber: 249 }); })();
