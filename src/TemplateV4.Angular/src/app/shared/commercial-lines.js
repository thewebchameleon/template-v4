import { Component, model, output } from '@angular/core';
import { WorkspaceUi } from './workspace';
import { BusinessSelect } from './business-select';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/button";
import * as i3 from "@spartan-ng/helm/field";
import * as i4 from "@spartan-ng/helm/input";
import * as i5 from "../core/i18n";
const _c0 = () => ({ standalone: true });
function CommercialLines_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "fieldset", 1)(1, "div", 3)(2, "label", 4);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 5);
    i0.ɵɵlistener("ngModelChange", function CommercialLines_For_2_Template_input_ngModelChange_5_listener($event) { const line_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); line_r2.description = $event; return i0.ɵɵresetView(ctx_r2.changed.emit()); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 6)(7, "app-business-select", 7);
    i0.ɵɵlistener("valueChange", function CommercialLines_For_2_Template_app_business_select_valueChange_7_listener($event) { const line_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); line_r2.category = ctx_r2.number($event); return i0.ɵɵresetView(ctx_r2.changed.emit()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 3)(9, "label", 4);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "input", 8);
    i0.ɵɵlistener("ngModelChange", function CommercialLines_For_2_Template_input_ngModelChange_12_listener($event) { const line_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); line_r2.quantity = $event; return i0.ɵɵresetView(ctx_r2.changed.emit()); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 3)(14, "label", 4);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "input", 9);
    i0.ɵɵlistener("ngModelChange", function CommercialLines_For_2_Template_input_ngModelChange_17_listener($event) { const line_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); line_r2.unitPrice = $event; return i0.ɵɵresetView(ctx_r2.changed.emit()); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "app-business-select", 10);
    i0.ɵɵlistener("valueChange", function CommercialLines_For_2_Template_app_business_select_valueChange_18_listener($event) { const line_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); line_r2.taxTreatment = ctx_r2.number($event); line_r2.taxRate = ctx_r2.number($event) === 0 ? 15 : 0; return i0.ɵɵresetView(ctx_r2.changed.emit()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div", 3)(20, "label", 4);
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "input", 11);
    i0.ɵɵlistener("ngModelChange", function CommercialLines_For_2_Template_input_ngModelChange_23_listener($event) { const line_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); line_r2.taxRate = $event; return i0.ɵɵresetView(ctx_r2.changed.emit()); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "button", 12);
    i0.ɵɵlistener("click", function CommercialLines_For_2_Template_button_click_24_listener() { const ɵ$index_3_r4 = i0.ɵɵrestoreView(_r1).$index; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.remove(ɵ$index_3_r4)); });
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const line_r2 = ctx.$implicit;
    const ɵ$index_3_r4 = ctx.$index;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", "line-description-" + ɵ$index_3_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 31, "lineDescription"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "line-description-" + ɵ$index_3_r4)("ngModel", line_r2.description)("ngModelOptions", i0.ɵɵpureFunction0(41, _c0));
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("controlId", "line-category-" + ɵ$index_3_r4)("options", ctx_r2.categories)("allowEmpty", false)("value", "" + line_r2.category);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", "line-quantity-" + ɵ$index_3_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 33, "quantity"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "line-quantity-" + ɵ$index_3_r4)("ngModel", line_r2.quantity)("ngModelOptions", i0.ɵɵpureFunction0(42, _c0));
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", "line-unit-" + ɵ$index_3_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 35, "unitPrice"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "line-unit-" + ɵ$index_3_r4)("ngModel", line_r2.unitPrice)("ngModelOptions", i0.ɵɵpureFunction0(43, _c0));
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("controlId", "line-tax-" + ɵ$index_3_r4)("options", ctx_r2.taxes)("allowEmpty", false)("value", "" + line_r2.taxTreatment);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", "line-rate-" + ɵ$index_3_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 37, "taxRate"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "line-rate-" + ɵ$index_3_r4)("disabled", line_r2.taxTreatment !== 0)("ngModel", line_r2.taxRate)("ngModelOptions", i0.ɵɵpureFunction0(44, _c0));
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.lines().length === 1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 39, "remove"), " ");
} }
export class CommercialLines {
    lines = model([
        { description: '', category: 1, quantity: 1, unitPrice: 0, taxTreatment: 3, taxRate: 0 },
    ], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "lines" }] : /* istanbul ignore next */ []));
    changed = output();
    categories = [
        { id: '0', label: 'governmentCharge' },
        { id: '1', label: 'serviceFee' },
        { id: '2', label: 'extra' },
    ];
    taxes = [
        { id: '0', label: 'standardTax' },
        { id: '1', label: 'zeroTax' },
        { id: '2', label: 'exemptTax' },
        { id: '3', label: 'outsideTax' },
    ];
    number(value) {
        return Number(value);
    }
    add() {
        this.lines.update((lines) => [
            ...lines,
            { description: '', category: 1, quantity: 1, unitPrice: 0, taxTreatment: 3, taxRate: 0 },
        ]);
        this.changed.emit();
    }
    remove(index) {
        this.lines.update((lines) => lines.filter((_, i) => i !== index));
        this.changed.emit();
    }
    static ɵfac = function CommercialLines_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CommercialLines)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CommercialLines, selectors: [["app-commercial-lines"]], inputs: { lines: [1, "lines"] }, outputs: { lines: "linesChange", changed: "changed" }, decls: 6, vars: 3, consts: [[1, "grid", "gap-4"], [1, "grid", "gap-4", "rounded-lg", "border", "p-4"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click"], ["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", "maxlength", "1000", "required", "", 3, "ngModelChange", "id", "ngModel", "ngModelOptions"], [1, "grid", "gap-4", "sm:grid-cols-2", "lg:grid-cols-3"], ["label", "category", 3, "valueChange", "controlId", "options", "allowEmpty", "value"], ["hlmInput", "", "type", "number", "min", "0.0001", "step", "0.0001", "max", "1000000", "required", "", 3, "ngModelChange", "id", "ngModel", "ngModelOptions"], ["hlmInput", "", "type", "number", "min", "0", "step", "0.01", "max", "1000000000", "required", "", 3, "ngModelChange", "id", "ngModel", "ngModelOptions"], ["label", "taxTreatment", 3, "valueChange", "controlId", "options", "allowEmpty", "value"], ["hlmInput", "", "type", "number", "min", "0", "max", "100", "step", "0.01", 3, "ngModelChange", "id", "disabled", "ngModel", "ngModelOptions"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click", "disabled"]], template: function CommercialLines_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵrepeaterCreate(1, CommercialLines_For_2_Template, 27, 45, "fieldset", 1, i0.ɵɵrepeaterTrackByIndex);
            i0.ɵɵelementStart(3, "button", 2);
            i0.ɵɵlistener("click", function CommercialLines_Template_button_click_3_listener() { return ctx.add(); });
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.lines());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "addLine"));
        } }, dependencies: [i1.FormsModule, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.MaxLengthValidator, i1.MinValidator, i1.MaxValidator, i1.NgModel, i2.HlmButton, i3.HlmField, i3.HlmFieldLabel, i4.HlmInput, BusinessSelect, i5.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CommercialLines, [{
        type: Component,
        args: [{
                selector: 'app-commercial-lines',
                imports: [WorkspaceUi, BusinessSelect],
                template: ` <div class="grid gap-4">
    @for (line of lines(); track $index; let index = $index) {
      <fieldset class="grid gap-4 rounded-lg border p-4">
        <div hlmField>
          <label hlmFieldLabel [for]="'line-description-' + index">{{
            'lineDescription' | t
          }}</label
          ><input
            hlmInput
            [id]="'line-description-' + index"
            [ngModel]="line.description"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="line.description = $event; changed.emit()"
            maxlength="1000"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <app-business-select
            [controlId]="'line-category-' + index"
            label="category"
            [options]="categories"
            [allowEmpty]="false"
            [value]="'' + line.category"
            (valueChange)="line.category = number($event); changed.emit()"
          />
          <div hlmField>
            <label hlmFieldLabel [for]="'line-quantity-' + index">{{ 'quantity' | t }}</label
            ><input
              hlmInput
              [id]="'line-quantity-' + index"
              type="number"
              min="0.0001"
              step="0.0001"
              max="1000000"
              [ngModel]="line.quantity"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="line.quantity = $event; changed.emit()"
              required
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel [for]="'line-unit-' + index">{{ 'unitPrice' | t }}</label
            ><input
              hlmInput
              [id]="'line-unit-' + index"
              type="number"
              min="0"
              step="0.01"
              max="1000000000"
              [ngModel]="line.unitPrice"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="line.unitPrice = $event; changed.emit()"
              required
            />
          </div>
          <app-business-select
            [controlId]="'line-tax-' + index"
            label="taxTreatment"
            [options]="taxes"
            [allowEmpty]="false"
            [value]="'' + line.taxTreatment"
            (valueChange)="
              line.taxTreatment = number($event);
              line.taxRate = number($event) === 0 ? 15 : 0;
              changed.emit()
            "
          />
          <div hlmField>
            <label hlmFieldLabel [for]="'line-rate-' + index">{{ 'taxRate' | t }}</label
            ><input
              hlmInput
              [id]="'line-rate-' + index"
              type="number"
              min="0"
              max="100"
              step="0.01"
              [disabled]="line.taxTreatment !== 0"
              [ngModel]="line.taxRate"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="line.taxRate = $event; changed.emit()"
            />
          </div>
          <button
            hlmBtn
            type="button"
            variant="outline"
            [disabled]="lines().length === 1"
            (click)="remove(index)"
          >
            {{ 'remove' | t }}
          </button>
        </div>
      </fieldset>
    }
    <button hlmBtn type="button" variant="outline" (click)="add()">{{ 'addLine' | t }}</button>
  </div>`,
            }]
    }], null, { lines: [{ type: i0.Input, args: [{ isSignal: true, alias: "lines", required: false }] }, { type: i0.Output, args: ["linesChange"] }], changed: [{ type: i0.Output, args: ["changed"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CommercialLines, { className: "CommercialLines", filePath: "src/app/shared/commercial-lines.ts", lineNumber: 107 }); })();
