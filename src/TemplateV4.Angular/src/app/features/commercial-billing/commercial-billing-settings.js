import { Component, HostListener, inject, signal } from '@angular/core';
import { WorkspaceApi } from '../../core/workspace-api';
import { protectUnload } from '../../shared/confirmation';
import { Resource, WorkspaceUi } from '../../shared/workspace';
import { Notifications } from '../notifications/notifications';
import * as i0 from "@angular/core";
import * as i1 from "../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/card";
import * as i5 from "@spartan-ng/helm/field";
import * as i6 from "@spartan-ng/helm/input";
import * as i7 from "../../core/i18n";
function CommercialBillingSettingsPage_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "h2", 5);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 6, 0);
    i0.ɵɵlistener("ngSubmit", function CommercialBillingSettingsPage_Conditional_2_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.save()); });
    i0.ɵɵelementStart(7, "div", 7)(8, "label", 8);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "input", 9);
    i0.ɵɵtwoWayListener("ngModelChange", function CommercialBillingSettingsPage_Conditional_2_Template_input_ngModelChange_11_listener($event) { const value_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(value_r3.trialDays, $event) || (value_r3.trialDays = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 7)(13, "label", 10);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "input", 11);
    i0.ɵɵtwoWayListener("ngModelChange", function CommercialBillingSettingsPage_Conditional_2_Template_input_ngModelChange_16_listener($event) { const value_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(value_r3.graceDays, $event) || (value_r3.graceDays = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "button", 12);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const value_r3 = ctx;
    const form_r4 = i0.ɵɵreference(6);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, "commercialBillingPolicy"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 9, "trialDays"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", value_r3.trialDays);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 11, "graceDays"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", value_r3.graceDays);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r4.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 13, "save"));
} }
export class CommercialBillingSettingsPage {
    api = inject(WorkspaceApi);
    toast = inject(Notifications);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    settings = null;
    hasUnsavedChanges() {
        return this.busy() || (this.settings != null && JSON.stringify(this.settings) !== JSON.stringify(this.data.value()));
    }
    beforeUnload(event) { protectUnload(event, this.hasUnsavedChanges()); }
    constructor() { void this.load(); }
    async load() {
        if (await this.data.load((signal) => this.api.get('configuration/commercial-billing', {}, signal)))
            this.settings = { ...this.data.value() };
    }
    async save() {
        if (this.busy() || !this.settings)
            return;
        this.busy.set(true);
        try {
            await this.api.post('configuration/commercial-billing', this.settings);
            await this.load();
            this.toast.success('customerSaved');
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function CommercialBillingSettingsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CommercialBillingSettingsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CommercialBillingSettingsPage, selectors: [["app-commercial-billing-settings"]], hostBindings: function CommercialBillingSettingsPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function CommercialBillingSettingsPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 3, vars: 3, consts: [["form", "ngForm"], ["title", "commercialBillingSettings", "description", "commercialBillingSettingsHelp"], [3, "retry", "state", "refreshError"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "trial-days"], ["hlmInput", "", "id", "trial-days", "name", "trial", "type", "number", "min", "0", "max", "90", "step", "1", "required", "", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "grace-days"], ["hlmInput", "", "id", "grace-days", "name", "grace", "type", "number", "min", "0", "max", "30", "step", "1", "required", "", 3, "ngModelChange", "ngModel"], ["hlmBtn", "", 3, "disabled"]], template: function CommercialBillingSettingsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 1);
            i0.ɵɵelementStart(1, "app-page-state", 2);
            i0.ɵɵlistener("retry", function CommercialBillingSettingsPage_Template_app_page_state_retry_1_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(2, CommercialBillingSettingsPage_Conditional_2_Template, 20, 15, "section", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_2_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_2_0 = ctx.settings) ? 2 : -1, tmp_2_0);
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MinValidator, i2.MaxValidator, i2.NgModel, i2.NgForm, i3.HlmButton, i4.HlmCard, i4.HlmCardContent, i4.HlmCardHeader, i4.HlmCardTitle, i5.HlmField, i5.HlmFieldLabel, i6.HlmInput, i7.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CommercialBillingSettingsPage, [{
        type: Component,
        args: [{
                selector: 'app-commercial-billing-settings',
                imports: [WorkspaceUi],
                template: `<app-page-header title="commercialBillingSettings" description="commercialBillingSettingsHelp" />
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (settings; as value) {
        <section hlmCard>
          <div hlmCardHeader><h2 hlmCardTitle>{{ 'commercialBillingPolicy' | t }}</h2></div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <div hlmField>
              <label hlmFieldLabel for="trial-days">{{ 'trialDays' | t }}</label
              ><input hlmInput id="trial-days" name="trial" type="number" min="0" max="90" step="1" required [(ngModel)]="value.trialDays" />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="grace-days">{{ 'graceDays' | t }}</label
              ><input hlmInput id="grace-days" name="grace" type="number" min="0" max="30" step="1" required [(ngModel)]="value.graceDays" />
            </div>
            <button hlmBtn [disabled]="busy() || form.invalid">{{ 'save' | t }}</button>
          </form>
        </section>
      }
    </app-page-state>`,
            }]
    }], () => [], { beforeUnload: [{
            type: HostListener,
            args: ['window:beforeunload', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CommercialBillingSettingsPage, { className: "CommercialBillingSettingsPage", filePath: "src/app/features/commercial-billing/commercial-billing-settings.ts", lineNumber: 31 }); })();
