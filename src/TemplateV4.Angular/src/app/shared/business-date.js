import { Component, inject, input, model } from '@angular/core';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { WorkspaceUi } from './workspace';
import { I18n } from '../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/field";
import * as i3 from "@spartan-ng/helm/date-picker";
import * as i4 from "../core/i18n";
const _c0 = () => ({ standalone: true });
export class BusinessDate {
    controlId = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controlId" }] : /* istanbul ignore next */ []));
    label = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    value = model(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    i18n = inject(I18n);
    date() {
        const value = this.value();
        if (!value)
            return undefined;
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    change(date) {
        this.value.set(date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            : null);
    }
    formatDate = (date) => new Intl.DateTimeFormat(this.i18n.culture(), { dateStyle: 'medium' }).format(date);
    static ɵfac = function BusinessDate_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BusinessDate)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BusinessDate, selectors: [["app-business-date"]], inputs: { controlId: [1, "controlId"], label: [1, "label"], value: [1, "value"] }, outputs: { value: "valueChange" }, decls: 8, vars: 13, consts: [["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], [3, "ngModelChange", "ngModel", "ngModelOptions", "formatDate", "autoCloseOnSelect"], [3, "buttonId"]], template: function BusinessDate_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "label", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "hlm-date-picker", 2);
            i0.ɵɵlistener("ngModelChange", function BusinessDate_Template_hlm_date_picker_ngModelChange_4_listener($event) { return ctx.change($event); });
            i0.ɵɵelementStart(5, "hlm-date-picker-trigger", 3);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", ctx.controlId());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 8, ctx.label()));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.date())("ngModelOptions", i0.ɵɵpureFunction0(12, _c0))("formatDate", ctx.formatDate)("autoCloseOnSelect", true);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("buttonId", ctx.controlId());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.value() || i0.ɵɵpipeBind1(7, 10, ctx.label()));
        } }, dependencies: [i1.FormsModule, i1.NgControlStatus, i1.NgModel, i2.HlmField, i2.HlmFieldLabel, i3.HlmDatePicker, i3.HlmDatePickerTrigger, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BusinessDate, [{
        type: Component,
        args: [{
                selector: 'app-business-date',
                imports: [WorkspaceUi, HlmDatePickerImports],
                template: `<div hlmField>
    <label hlmFieldLabel [for]="controlId()">{{ label() | t }}</label>
    <hlm-date-picker
      [ngModel]="date()"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="change($event)"
      [formatDate]="formatDate"
      [autoCloseOnSelect]="true"
    >
      <hlm-date-picker-trigger [buttonId]="controlId()">{{
        value() || (label() | t)
      }}</hlm-date-picker-trigger>
    </hlm-date-picker>
  </div>`,
            }]
    }], null, { controlId: [{ type: i0.Input, args: [{ isSignal: true, alias: "controlId", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BusinessDate, { className: "BusinessDate", filePath: "src/app/shared/business-date.ts", lineNumber: 24 }); })();
