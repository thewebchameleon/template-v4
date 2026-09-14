import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { Translate } from '../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/select";
import * as i3 from "@spartan-ng/helm/field";
const _c0 = () => ({ standalone: true });
const _forTrack0 = ($index, $item) => $item.id;
function BusinessSelect_hlm_select_content_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "none"));
} }
function BusinessSelect_hlm_select_content_7_For_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("value", option_r1.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, option_r1.label));
} }
function BusinessSelect_hlm_select_content_7_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, BusinessSelect_hlm_select_content_7_For_3_Conditional_0_Template, 3, 4, "hlm-select-item", 6);
} if (rf & 2) {
    const option_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(!option_r1.retired || ctx_r1.value() === option_r1.id ? 0 : -1);
} }
function BusinessSelect_hlm_select_content_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content");
    i0.ɵɵconditionalCreate(1, BusinessSelect_hlm_select_content_7_Conditional_1_Template, 3, 3, "hlm-select-item", 5);
    i0.ɵɵrepeaterCreate(2, BusinessSelect_hlm_select_content_7_For_3_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.allowEmpty() ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.options());
} }
export class BusinessSelect {
    controlId = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controlId" }] : /* istanbul ignore next */ []));
    label = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    options = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    value = model('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    allowEmpty = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "allowEmpty" }] : /* istanbul ignore next */ []));
    disabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    static ɵfac = function BusinessSelect_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BusinessSelect)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BusinessSelect, selectors: [["app-business-select"]], inputs: { controlId: [1, "controlId"], label: [1, "label"], options: [1, "options"], value: [1, "value"], allowEmpty: [1, "allowEmpty"], disabled: [1, "disabled"] }, outputs: { value: "valueChange" }, decls: 8, vars: 9, consts: [["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], [3, "ngModelChange", "ngModel", "ngModelOptions", "disabled"], [3, "buttonId"], [4, "hlmSelectPortal"], ["value", ""], [3, "value"]], template: function BusinessSelect_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "label", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "hlm-select", 2);
            i0.ɵɵlistener("ngModelChange", function BusinessSelect_Template_hlm_select_ngModelChange_4_listener($event) { return ctx.value.set($event); });
            i0.ɵɵelementStart(5, "hlm-select-trigger", 3);
            i0.ɵɵelement(6, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(7, BusinessSelect_hlm_select_content_7_Template, 4, 1, "hlm-select-content", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", ctx.controlId());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, ctx.label()));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.value())("ngModelOptions", i0.ɵɵpureFunction0(8, _c0))("disabled", ctx.disabled());
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("buttonId", ctx.controlId());
        } }, dependencies: [FormsModule, i1.NgControlStatus, i1.NgModel, i2.HlmSelect, i2.HlmSelectContent, i2.HlmSelectItem, i2.HlmSelectPortal, i2.HlmSelectTrigger, i2.HlmSelectValue, i3.HlmField, i3.HlmFieldLabel, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BusinessSelect, [{
        type: Component,
        args: [{
                selector: 'app-business-select',
                imports: [FormsModule, HlmSelectImports, HlmFieldImports, Translate],
                template: `<div hlmField>
    <label hlmFieldLabel [for]="controlId()">{{ label() | t }}</label>
    <hlm-select
      [ngModel]="value()"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="value.set($event)"
      [disabled]="disabled()"
    >
      <hlm-select-trigger [buttonId]="controlId()"><hlm-select-value /></hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal>
        @if (allowEmpty()) {
          <hlm-select-item value="">{{ 'none' | t }}</hlm-select-item>
        }
        @for (option of options(); track option.id) {
          @if (!option.retired || value() === option.id) {
            <hlm-select-item [value]="option.id">{{ option.label | t }}</hlm-select-item>
          }
        }
      </hlm-select-content>
    </hlm-select>
  </div>`,
            }]
    }], null, { controlId: [{ type: i0.Input, args: [{ isSignal: true, alias: "controlId", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], options: [{ type: i0.Input, args: [{ isSignal: true, alias: "options", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], allowEmpty: [{ type: i0.Input, args: [{ isSignal: true, alias: "allowEmpty", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BusinessSelect, { className: "BusinessSelect", filePath: "src/app/shared/business-select.ts", lineNumber: 37 }); })();
