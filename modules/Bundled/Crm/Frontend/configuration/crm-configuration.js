import { BusinessDraft } from '../../../../../src/TemplateV4.Angular/src/app/shared/business-draft';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { Resource, WorkspaceUi } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../../../../../src/TemplateV4.Angular/src/app/shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/checkbox";
import * as i9 from "../../../../../src/TemplateV4.Angular/src/app/core/i18n";
const _c0 = a0 => ["/organizations", a0, "crm"];
const _forTrack0 = ($index, $item) => $item.key;
const _forTrack1 = ($index, $item) => $item.id;
function CrmConfigurationPage_Conditional_5_For_3_For_7_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 13)(1, "div", 14)(2, "label", 15);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 16);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_3_For_7_Template_input_ngModelChange_5_listener($event) { const option_r5 = i0.ɵɵrestoreView(_r4).$implicit; i0.ɵɵtwoWayBindingSet(option_r5.label, $event) || (option_r5.label = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "label", 15)(7, "div", 17)(8, "hlm-checkbox", 18);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_3_For_7_Template_hlm_checkbox_ngModelChange_8_listener($event) { const option_r5 = i0.ɵɵrestoreView(_r4).$implicit; i0.ɵɵtwoWayBindingSet(option_r5.retired, $event) || (option_r5.retired = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const option_r5 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", option_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 10, "name"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", option_r5.id)("name", option_r5.id);
    i0.ɵɵtwoWayProperty("ngModel", option_r5.label);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", option_r5.id + "-retired");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", option_r5.id + "-retired")("name", option_r5.id + "-retired");
    i0.ɵɵtwoWayProperty("ngModel", option_r5.retired);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 12, "retired"));
} }
function CrmConfigurationPage_Conditional_5_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 6)(1, "div", 7)(2, "h2", 8);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 9);
    i0.ɵɵrepeaterCreate(6, CrmConfigurationPage_Conditional_5_For_3_For_7_Template, 12, 14, "div", 13, _forTrack1);
    i0.ɵɵelementStart(8, "button", 11);
    i0.ɵɵlistener("click", function CrmConfigurationPage_Conditional_5_For_3_Template_button_click_8_listener() { const section_r6 = i0.ɵɵrestoreView(_r3).$implicit; const config_r7 = i0.ɵɵnextContext(); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(config_r7[section_r6.key].push({ id: ctx_r1.uuid(), label: "", retired: false })); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const section_r6 = ctx.$implicit;
    const config_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, section_r6.label));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(config_r7[section_r6.key]);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 4, "addOption"), " ");
} }
function CrmConfigurationPage_Conditional_5_For_11_For_13_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 13)(1, "div", 14)(2, "label", 15);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_11_For_13_Template_input_ngModelChange_5_listener($event) { const stage_r11 = i0.ɵɵrestoreView(_r10).$implicit; i0.ɵɵtwoWayBindingSet(stage_r11.label, $event) || (stage_r11.label = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "label", 15)(7, "div", 17)(8, "hlm-checkbox", 18);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_11_For_13_Template_hlm_checkbox_ngModelChange_8_listener($event) { const stage_r11 = i0.ɵɵrestoreView(_r10).$implicit; i0.ɵɵtwoWayBindingSet(stage_r11.retired, $event) || (stage_r11.retired = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const stage_r11 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", stage_r11.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 10, "stage"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", stage_r11.id)("name", stage_r11.id);
    i0.ɵɵtwoWayProperty("ngModel", stage_r11.label);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", stage_r11.id + "-retired");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", stage_r11.id + "-retired")("name", stage_r11.id + "-retired");
    i0.ɵɵtwoWayProperty("ngModel", stage_r11.retired);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 12, "retired"));
} }
function CrmConfigurationPage_Conditional_5_For_11_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "fieldset", 10)(1, "div", 14)(2, "label", 15);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_11_Template_input_ngModelChange_5_listener($event) { const pipeline_r9 = i0.ɵɵrestoreView(_r8).$implicit; i0.ɵɵtwoWayBindingSet(pipeline_r9.label, $event) || (pipeline_r9.label = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "label", 15)(7, "div", 17)(8, "hlm-checkbox", 18);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_11_Template_hlm_checkbox_ngModelChange_8_listener($event) { const pipeline_r9 = i0.ɵɵrestoreView(_r8).$implicit; i0.ɵɵtwoWayBindingSet(pipeline_r9.retired, $event) || (pipeline_r9.retired = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵrepeaterCreate(12, CrmConfigurationPage_Conditional_5_For_11_For_13_Template, 12, 14, "div", 13, _forTrack1);
    i0.ɵɵelementStart(14, "button", 20);
    i0.ɵɵlistener("click", function CrmConfigurationPage_Conditional_5_For_11_Template_button_click_14_listener() { const pipeline_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(pipeline_r9.stages.push({ id: ctx_r1.uuid(), label: "", retired: false })); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const pipeline_r9 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", pipeline_r9.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 11, "pipeline"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", pipeline_r9.id)("name", pipeline_r9.id);
    i0.ɵɵtwoWayProperty("ngModel", pipeline_r9.label);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", pipeline_r9.id + "-retired");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", pipeline_r9.id + "-retired")("name", pipeline_r9.id + "-retired");
    i0.ɵɵtwoWayProperty("ngModel", pipeline_r9.retired);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 13, "retired"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(pipeline_r9.stages);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 15, "addOption"), " ");
} }
function CrmConfigurationPage_Conditional_5_For_23_For_13_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 13)(1, "div", 14)(2, "label", 15);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_23_For_13_Template_input_ngModelChange_5_listener($event) { const option_r15 = i0.ɵɵrestoreView(_r14).$implicit; i0.ɵɵtwoWayBindingSet(option_r15.label, $event) || (option_r15.label = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "label", 15)(7, "div", 17)(8, "hlm-checkbox", 18);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_23_For_13_Template_hlm_checkbox_ngModelChange_8_listener($event) { const option_r15 = i0.ɵɵrestoreView(_r14).$implicit; i0.ɵɵtwoWayBindingSet(option_r15.retired, $event) || (option_r15.retired = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const option_r15 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", option_r15.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 10, "name"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", option_r15.id)("name", option_r15.id);
    i0.ɵɵtwoWayProperty("ngModel", option_r15.label);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", option_r15.id + "-retired");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", option_r15.id + "-retired")("name", option_r15.id + "-retired");
    i0.ɵɵtwoWayProperty("ngModel", option_r15.retired);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 12, "retired"));
} }
function CrmConfigurationPage_Conditional_5_For_23_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "fieldset", 10)(1, "div", 14)(2, "label", 15);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_23_Template_input_ngModelChange_5_listener($event) { const field_r13 = i0.ɵɵrestoreView(_r12).$implicit; i0.ɵɵtwoWayBindingSet(field_r13.label, $event) || (field_r13.label = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "label", 15)(7, "div", 17)(8, "hlm-checkbox", 18);
    i0.ɵɵtwoWayListener("ngModelChange", function CrmConfigurationPage_Conditional_5_For_23_Template_hlm_checkbox_ngModelChange_8_listener($event) { const field_r13 = i0.ɵɵrestoreView(_r12).$implicit; i0.ɵɵtwoWayBindingSet(field_r13.retired, $event) || (field_r13.retired = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵrepeaterCreate(12, CrmConfigurationPage_Conditional_5_For_23_For_13_Template, 12, 14, "div", 13, _forTrack1);
    i0.ɵɵelementStart(14, "button", 20);
    i0.ɵɵlistener("click", function CrmConfigurationPage_Conditional_5_For_23_Template_button_click_14_listener() { const field_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(field_r13.options.push({ id: ctx_r1.uuid(), label: "", retired: false })); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const field_r13 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", field_r13.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 11, "fieldName"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", field_r13.id)("name", field_r13.id);
    i0.ɵɵtwoWayProperty("ngModel", field_r13.label);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", field_r13.id + "-retired");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", field_r13.id + "-retired")("name", field_r13.id + "-retired");
    i0.ɵɵtwoWayProperty("ngModel", field_r13.retired);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 13, "retired"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(field_r13.options);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 15, "addOption"), " ");
} }
function CrmConfigurationPage_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 4);
    i0.ɵɵlistener("ngSubmit", function CrmConfigurationPage_Conditional_5_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.save()); });
    i0.ɵɵelementStart(1, "fieldset", 5);
    i0.ɵɵrepeaterCreate(2, CrmConfigurationPage_Conditional_5_For_3_Template, 11, 6, "section", 6, _forTrack0);
    i0.ɵɵelementStart(4, "section", 6)(5, "div", 7)(6, "h2", 8);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 9);
    i0.ɵɵrepeaterCreate(10, CrmConfigurationPage_Conditional_5_For_11_Template, 17, 17, "fieldset", 10, _forTrack1);
    i0.ɵɵelementStart(12, "button", 11);
    i0.ɵɵlistener("click", function CrmConfigurationPage_Conditional_5_Template_button_click_12_listener() { const config_r7 = i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(config_r7.pipelines.push({ id: ctx_r1.uuid(), label: "", retired: false, stages: [{ id: ctx_r1.uuid(), label: "", retired: false }] })); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "section", 6)(17, "div", 7)(18, "h2", 8);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 9);
    i0.ɵɵrepeaterCreate(22, CrmConfigurationPage_Conditional_5_For_23_Template, 17, 17, "fieldset", 10, _forTrack1);
    i0.ɵɵelementStart(24, "button", 11);
    i0.ɵɵlistener("click", function CrmConfigurationPage_Conditional_5_Template_button_click_24_listener() { const config_r7 = i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(config_r7.contactFields.push({ id: ctx_r1.uuid(), label: "", options: [], retired: false })); });
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "button", 12);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const config_r7 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.canConfigure());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.sections);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 8, "pipeline"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(config_r7.pipelines);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(14, 10, "add"), " ", i0.ɵɵpipeBind1(15, 12, "pipeline"), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 14, "customFields"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(config_r7.contactFields);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 16, "addField"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.canConfigure());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 18, "save"));
} }
export class CrmConfigurationPage extends BusinessDraft {
    draftValue() {
        return this.draft;
    }
    organization = inject(ActivatedRoute).snapshot.paramMap.get('id');
    api = inject(WorkspaceApi);
    state = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    canConfigure = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canConfigure" }] : /* istanbul ignore next */ []));
    draft = null;
    sections = [
        { key: 'lifecycleStatuses', label: 'lifecycle' },
        { key: 'tags', label: 'tags' },
    ];
    constructor() {
        super();
        void this.load();
    }
    uuid() {
        return crypto.randomUUID();
    }
    async load() {
        await this.state.load(async (signal) => {
            const [config, home] = await Promise.all([
                this.api.get(`organizations/${this.organization}/crm/configuration`, {}, signal),
                this.api.get('customers/', {}, signal),
            ]);
            this.canConfigure.set(['Owner', 'Admin'].includes(home.accounts.find((x) => x.id === this.organization)?.role ?? ''));
            this.draft = structuredClone(config);
            this.markSaved();
            return config;
        });
    }
    async save() {
        if (this.busy() || !this.draft)
            return;
        this.busy.set(true);
        try {
            await this.api.post(`organizations/${this.organization}/crm/configuration`, this.draft);
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function CrmConfigurationPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CrmConfigurationPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CrmConfigurationPage, selectors: [["app-crm-configuration"]], features: [i0.ɵɵInheritDefinitionFeature], decls: 6, vars: 9, consts: [["title", "crmConfiguration", "description", "retireHelp"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], [3, "retry", "state", "refreshError"], [1, "grid", "gap-6"], [1, "grid", "gap-6", 3, "ngSubmit"], [1, "grid", "gap-6", 3, "disabled"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-4"], [1, "grid", "gap-3", "rounded-lg", "border", "p-4"], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click"], ["hlmBtn", "", 3, "disabled"], [1, "grid", "gap-3", "sm:grid-cols-2"], ["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", "maxlength", "150", "required", "", 3, "ngModelChange", "id", "name", "ngModel"], ["hlmField", "", "orientation", "horizontal"], [3, "ngModelChange", "inputId", "name", "ngModel"], ["hlmInput", "", "required", "", "maxlength", "150", 3, "ngModelChange", "id", "name", "ngModel"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click"]], template: function CrmConfigurationPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "a", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "app-page-state", 2);
            i0.ɵɵlistener("retry", function CrmConfigurationPage_Template_app_page_state_retry_4_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(5, CrmConfigurationPage_Conditional_5_Template, 30, 20, "form", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_4_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(7, _c0, ctx.organization));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "crm"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.state.state())("refreshError", ctx.state.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.draft) ? 5 : -1, tmp_4_0);
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.HlmCheckbox, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CrmConfigurationPage, [{
        type: Component,
        args: [{
                selector: 'app-crm-configuration',
                imports: [WorkspaceUi],
                template: ` <app-page-header title="crmConfiguration" description="retireHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', organization, 'crm']">{{
        'crm' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="state.state()" [refreshError]="state.refreshError()" (retry)="load()">
      @if (draft; as config) {
        <form class="grid gap-6" (ngSubmit)="save()">
          <fieldset [disabled]="busy() || !canConfigure()" class="grid gap-6">
            @for (section of sections; track section.key) {
              <section hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>{{ section.label | t }}</h2>
                </div>
                <div hlmCardContent class="grid gap-4">
                  @for (option of config[section.key]; track option.id) {
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div hlmField>
                        <label hlmFieldLabel [for]="option.id">{{ 'name' | t }}</label
                        ><input
                          hlmInput
                          [id]="option.id"
                          [name]="option.id"
                          [(ngModel)]="option.label"
                          maxlength="150"
                          required
                        />
                      </div>
                      <label hlmFieldLabel [for]="option.id + '-retired'"
                        ><div hlmField orientation="horizontal">
                          <hlm-checkbox
                            [inputId]="option.id + '-retired'"
                            [name]="option.id + '-retired'"
                            [(ngModel)]="option.retired"
                          /><span>{{ 'retired' | t }}</span>
                        </div></label
                      >
                    </div>
                  }
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    (click)="config[section.key].push({ id: uuid(), label: '', retired: false })"
                  >
                    {{ 'addOption' | t }}
                  </button>
                </div>
              </section>
            }
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'pipeline' | t }}</h2>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (pipeline of config.pipelines; track pipeline.id) {
                  <fieldset class="grid gap-3 rounded-lg border p-4">
                    <div hlmField>
                      <label hlmFieldLabel [for]="pipeline.id">{{ 'pipeline' | t }}</label
                      ><input
                        hlmInput
                        [id]="pipeline.id"
                        [name]="pipeline.id"
                        [(ngModel)]="pipeline.label"
                        required
                        maxlength="150"
                      />
                    </div>
                    <label hlmFieldLabel [for]="pipeline.id + '-retired'"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          [inputId]="pipeline.id + '-retired'"
                          [name]="pipeline.id + '-retired'"
                          [(ngModel)]="pipeline.retired"
                        /><span>{{ 'retired' | t }}</span>
                      </div></label
                    >
                    @for (stage of pipeline.stages; track stage.id) {
                      <div class="grid gap-3 sm:grid-cols-2">
                        <div hlmField>
                          <label hlmFieldLabel [for]="stage.id">{{ 'stage' | t }}</label
                          ><input
                            hlmInput
                            [id]="stage.id"
                            [name]="stage.id"
                            [(ngModel)]="stage.label"
                            required
                            maxlength="150"
                          />
                        </div>
                        <label hlmFieldLabel [for]="stage.id + '-retired'"
                          ><div hlmField orientation="horizontal">
                            <hlm-checkbox
                              [inputId]="stage.id + '-retired'"
                              [name]="stage.id + '-retired'"
                              [(ngModel)]="stage.retired"
                            /><span>{{ 'retired' | t }}</span>
                          </div></label
                        >
                      </div>
                    }
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      (click)="pipeline.stages.push({ id: uuid(), label: '', retired: false })"
                    >
                      {{ 'addOption' | t }}
                    </button>
                  </fieldset>
                }
                <button
                  hlmBtn
                  variant="outline"
                  type="button"
                  (click)="
                    config.pipelines.push({
                      id: uuid(),
                      label: '',
                      retired: false,
                      stages: [{ id: uuid(), label: '', retired: false }],
                    })
                  "
                >
                  {{ 'add' | t }} {{ 'pipeline' | t }}
                </button>
              </div>
            </section>
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'customFields' | t }}</h2>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (field of config.contactFields; track field.id) {
                  <fieldset class="grid gap-3 rounded-lg border p-4">
                    <div hlmField>
                      <label hlmFieldLabel [for]="field.id">{{ 'fieldName' | t }}</label
                      ><input
                        hlmInput
                        [id]="field.id"
                        [name]="field.id"
                        [(ngModel)]="field.label"
                        required
                        maxlength="150"
                      />
                    </div>
                    <label hlmFieldLabel [for]="field.id + '-retired'"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          [inputId]="field.id + '-retired'"
                          [name]="field.id + '-retired'"
                          [(ngModel)]="field.retired"
                        /><span>{{ 'retired' | t }}</span>
                      </div></label
                    >
                    @for (option of field.options; track option.id) {
                      <div class="grid gap-3 sm:grid-cols-2">
                        <div hlmField>
                          <label hlmFieldLabel [for]="option.id">{{ 'name' | t }}</label
                          ><input
                            hlmInput
                            [id]="option.id"
                            [name]="option.id"
                            [(ngModel)]="option.label"
                            required
                            maxlength="150"
                          />
                        </div>
                        <label hlmFieldLabel [for]="option.id + '-retired'"
                          ><div hlmField orientation="horizontal">
                            <hlm-checkbox
                              [inputId]="option.id + '-retired'"
                              [name]="option.id + '-retired'"
                              [(ngModel)]="option.retired"
                            /><span>{{ 'retired' | t }}</span>
                          </div></label
                        >
                      </div>
                    }
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      (click)="field.options.push({ id: uuid(), label: '', retired: false })"
                    >
                      {{ 'addOption' | t }}
                    </button>
                  </fieldset>
                }
                <button
                  hlmBtn
                  variant="outline"
                  type="button"
                  (click)="
                    config.contactFields.push({
                      id: uuid(),
                      label: '',
                      options: [],
                      retired: false,
                    })
                  "
                >
                  {{ 'addField' | t }}
                </button>
              </div>
            </section>
            <button hlmBtn [disabled]="busy() || !canConfigure()">{{ 'save' | t }}</button>
          </fieldset>
        </form>
      }
    </app-page-state>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CrmConfigurationPage, { className: "CrmConfigurationPage", filePath: "src/app/features/crm-configuration.ts", lineNumber: 223 }); })();
