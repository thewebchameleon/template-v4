import { Component, effect, inject, input, model, signal } from '@angular/core';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from './workspace';
import { BusinessSelect } from './business-select';
import * as i0 from "@angular/core";
import * as i1 from "./workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/field";
import * as i4 from "@spartan-ng/helm/input";
import * as i5 from "../core/i18n";
const _c0 = () => ({ standalone: true });
function CrmCustomerPicker_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-business-select", 8);
    i0.ɵɵlistener("valueChange", function CrmCustomerPicker_Conditional_6_Template_app_business_select_valueChange_0_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.kind.set($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("controlId", ctx_r1.controlId())("label", ctx_r1.label())("options", ctx_r1.kindOptions)("value", ctx_r1.kind())("allowEmpty", false);
} }
export class CrmCustomerPicker {
    organization = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "organization" }] : /* istanbul ignore next */ []));
    controlId = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controlId" }] : /* istanbul ignore next */ []));
    label = input('billTo', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    fixedKind = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fixedKind" }] : /* istanbul ignore next */ []));
    value = model('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    kind = signal('0', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "kind" }] : /* istanbul ignore next */ []));
    search = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "search" }] : /* istanbul ignore next */ []));
    page = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "page" }] : /* istanbul ignore next */ []));
    data = new Resource();
    api = inject(WorkspaceApi);
    selected = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
    kindOptions = [
        { id: '0', label: 'contacts' },
        { id: '1', label: 'companies' },
    ];
    constructor() {
        effect((cleanup) => {
            this.organization();
            this.fixedKind();
            this.kind();
            this.search();
            this.page();
            const timeout = setTimeout(() => void this.load(), 300);
            cleanup(() => clearTimeout(timeout));
        });
        effect(() => {
            const value = this.value();
            const organization = this.organization();
            this.selected.set(null);
            if (value)
                void this.api
                    .get(`organizations/${organization}/crm/${value}`)
                    .then((x) => {
                    if (this.value() === value && this.organization() === organization)
                        this.selected.set(x.record);
                })
                    .catch(() => {
                    /* Missing or revoked selections remain unavailable. */
                });
        });
        effect(() => {
            this.search();
            this.kind();
            this.page.set(1);
        });
    }
    options() {
        const values = this.data.value()?.items ?? [];
        const current = this.selected();
        return [
            ...(current && !values.some((x) => x.id === current.id) ? [current] : []),
            ...values,
        ].map((x) => ({ id: x.id, label: x.data.name, retired: x.archived }));
    }
    async load() {
        await this.data.load((signal) => this.api.get(`organizations/${this.organization()}/crm`, {
            kind: this.fixedKind() ?? this.kind(),
            search: this.search(),
            pageNumber: this.page(),
            pageSize: 10,
        }, signal));
    }
    static ɵfac = function CrmCustomerPicker_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CrmCustomerPicker)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CrmCustomerPicker, selectors: [["app-crm-customer-picker"]], inputs: { organization: [1, "organization"], controlId: [1, "controlId"], label: [1, "label"], fixedKind: [1, "fixedKind"], value: [1, "value"] }, outputs: { value: "valueChange" }, decls: 10, vars: 18, consts: [[1, "grid", "gap-3"], ["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", "type", "search", 3, "ngModelChange", "id", "ngModel", "ngModelOptions"], [3, "controlId", "label", "options", "value", "allowEmpty"], [3, "retry", "state", "refreshError"], [3, "valueChange", "controlId", "label", "options", "value"], [3, "pageChange", "total", "page", "size"], [3, "valueChange", "controlId", "label", "options", "value", "allowEmpty"]], template: function CrmCustomerPicker_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "label", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "input", 3);
            i0.ɵɵlistener("ngModelChange", function CrmCustomerPicker_Template_input_ngModelChange_5_listener($event) { return ctx.search.set($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, CrmCustomerPicker_Conditional_6_Template, 1, 5, "app-business-select", 4);
            i0.ɵɵelementStart(7, "app-page-state", 5);
            i0.ɵɵlistener("retry", function CrmCustomerPicker_Template_app_page_state_retry_7_listener() { return ctx.load(); });
            i0.ɵɵelementStart(8, "app-business-select", 6);
            i0.ɵɵtwoWayListener("valueChange", function CrmCustomerPicker_Template_app_business_select_valueChange_8_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "app-list-pager", 7);
            i0.ɵɵlistener("pageChange", function CrmCustomerPicker_Template_app_list_pager_pageChange_9_listener($event) { return ctx.page.set($event); });
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("for", ctx.controlId() + "-search");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 15, "customerSearch"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("id", ctx.controlId() + "-search")("ngModel", ctx.search())("ngModelOptions", i0.ɵɵpureFunction0(17, _c0));
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.fixedKind() === null ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("controlId", ctx.controlId() + "-value")("label", ctx.label())("options", ctx.options());
            i0.ɵɵtwoWayProperty("value", ctx.value);
            i0.ɵɵadvance();
            i0.ɵɵproperty("total", ctx.data.value()?.total ?? 0)("page", ctx.page())("size", 10);
        } }, dependencies: [i1.PageState, i1.ListPager, i2.FormsModule, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgModel, i3.HlmField, i3.HlmFieldLabel, i4.HlmInput, BusinessSelect, i5.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CrmCustomerPicker, [{
        type: Component,
        args: [{
                selector: 'app-crm-customer-picker',
                imports: [WorkspaceUi, BusinessSelect],
                template: `<div class="grid gap-3">
    <div hlmField>
      <label hlmFieldLabel [for]="controlId() + '-search'">{{ 'customerSearch' | t }}</label>
      <input
        hlmInput
        [id]="controlId() + '-search'"
        type="search"
        [ngModel]="search()"
        (ngModelChange)="search.set($event)"
        [ngModelOptions]="{ standalone: true }"
      />
    </div>
    @if (fixedKind() === null) {
      <app-business-select
        [controlId]="controlId()"
        [label]="label()"
        [options]="kindOptions"
        [value]="kind()"
        (valueChange)="kind.set($event)"
        [allowEmpty]="false"
      />
    }
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      <app-business-select
        [controlId]="controlId() + '-value'"
        [label]="label()"
        [options]="options()"
        [(value)]="value"
      />
      <app-list-pager
        [total]="data.value()?.total ?? 0"
        [page]="page()"
        [size]="10"
        (pageChange)="page.set($event)"
      />
    </app-page-state>
  </div>`,
            }]
    }], () => [], { organization: [{ type: i0.Input, args: [{ isSignal: true, alias: "organization", required: true }] }], controlId: [{ type: i0.Input, args: [{ isSignal: true, alias: "controlId", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], fixedKind: [{ type: i0.Input, args: [{ isSignal: true, alias: "fixedKind", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CrmCustomerPicker, { className: "CrmCustomerPicker", filePath: "src/app/shared/crm-customer-picker.ts", lineNumber: 48 }); })();
