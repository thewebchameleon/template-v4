import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../../shared/confirmation';
import { WorkspaceApi } from '../../core/workspace-api';
import { Notifications } from '../notifications/notifications';
import { Resource, WorkspaceUi } from '../../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/select";
import * as i2 from "../../shared/workspace";
import * as i3 from "@angular/forms";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/checkbox";
import * as i9 from "../../core/i18n";
const _c0 = () => ["Both", "Personal", "Organization"];
function BillingSettingsPage_Conditional_2_hlm_select_content_14_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const value_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", value_r4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "customer." + value_r4));
} }
function BillingSettingsPage_Conditional_2_hlm_select_content_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content");
    i0.ɵɵrepeaterCreate(1, BillingSettingsPage_Conditional_2_hlm_select_content_14_For_2_Template, 3, 4, "hlm-select-item", 24, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵrepeater(i0.ɵɵpureFunction0(0, _c0));
} }
function BillingSettingsPage_Conditional_2_hlm_select_content_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content")(1, "hlm-select-item", 25);
    i0.ɵɵtext(2, "PayFast");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "hlm-select-item", 26);
    i0.ɵɵtext(4, "Stripe");
    i0.ɵɵelementEnd()();
} }
function BillingSettingsPage_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "h2", 5);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 6, 0);
    i0.ɵɵlistener("ngSubmit", function BillingSettingsPage_Conditional_2_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.save()); });
    i0.ɵɵelementStart(7, "div", 7)(8, "label", 8);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "hlm-select", 9);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingSettingsPage_Conditional_2_Template_hlm_select_ngModelChange_11_listener($event) { const s_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(s_r3.ownership, $event) || (s_r3.ownership = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(12, "hlm-select-trigger", 10);
    i0.ɵɵelement(13, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(14, BillingSettingsPage_Conditional_2_hlm_select_content_14_Template, 3, 1, "hlm-select-content", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "div", 7)(16, "label", 12)(17, "hlm-checkbox", 13);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingSettingsPage_Conditional_2_Template_hlm_checkbox_ngModelChange_17_listener($event) { const s_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(s_r3.stripeEnabled, $event) || (s_r3.stripeEnabled = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(18, " Stripe");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 7)(20, "label", 14)(21, "hlm-checkbox", 15);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingSettingsPage_Conditional_2_Template_hlm_checkbox_ngModelChange_21_listener($event) { const s_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(s_r3.payFastEnabled, $event) || (s_r3.payFastEnabled = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(22, " PayFast");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div", 7)(24, "label", 16);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "hlm-select", 17);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingSettingsPage_Conditional_2_Template_hlm_select_ngModelChange_27_listener($event) { const s_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(s_r3.defaultProvider, $event) || (s_r3.defaultProvider = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(28, "hlm-select-trigger", 18);
    i0.ɵɵelement(29, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(30, BillingSettingsPage_Conditional_2_hlm_select_content_30_Template, 5, 0, "hlm-select-content", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div", 7)(32, "label", 19);
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "input", 20);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingSettingsPage_Conditional_2_Template_input_ngModelChange_35_listener($event) { const s_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(s_r3.trialDays, $event) || (s_r3.trialDays = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "div", 7)(37, "label", 21);
    i0.ɵɵtext(38);
    i0.ɵɵpipe(39, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "input", 22);
    i0.ɵɵtwoWayListener("ngModelChange", function BillingSettingsPage_Conditional_2_Template_input_ngModelChange_40_listener($event) { const s_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(s_r3.graceDays, $event) || (s_r3.graceDays = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "button", 23);
    i0.ɵɵtext(42);
    i0.ɵɵpipe(43, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const s_r3 = ctx;
    const form_r5 = i0.ɵɵreference(6);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 13, "billingSettings"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 15, "billingOwnership"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", s_r3.ownership);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵtwoWayProperty("ngModel", s_r3.stripeEnabled);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", s_r3.payFastEnabled);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 17, "defaultPaymentProvider"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", s_r3.defaultProvider);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 19, "trialDays"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", s_r3.trialDays);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(39, 21, "graceDays"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", s_r3.graceDays);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r5.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 23, "save"));
} }
export class BillingSettingsPage {
    api = inject(WorkspaceApi);
    toast = inject(Notifications);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    settings = null;
    hasUnsavedChanges() {
        return (this.busy() ||
            (this.settings != null && JSON.stringify(this.settings) !== JSON.stringify(this.data.value())));
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    constructor() {
        void this.load();
    }
    async load() {
        if (await this.data.load((signal) => this.api.get('configuration/billing', {}, signal)))
            this.settings = { ...this.data.value() };
    }
    async save() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post('configuration/billing', this.settings);
            await this.load();
            this.toast.success('customerSaved');
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function BillingSettingsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BillingSettingsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BillingSettingsPage, selectors: [["app-billing-settings"]], hostBindings: function BillingSettingsPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function BillingSettingsPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 3, vars: 3, consts: [["form", "ngForm"], ["title", "billingSettings", "description", "billingSettingsHelp"], [3, "retry", "state", "refreshError"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "billing-ownership"], ["name", "ownership", 3, "ngModelChange", "ngModel"], ["buttonId", "billing-ownership"], [4, "hlmSelectPortal"], ["hlmFieldLabel", "", "for", "enable-stripe"], ["id", "enable-stripe", "name", "stripe", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "enable-payfast"], ["id", "enable-payfast", "name", "payfast", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "default-provider"], ["name", "default", 3, "ngModelChange", "ngModel"], ["buttonId", "default-provider"], ["hlmFieldLabel", "", "for", "trial-days"], ["hlmInput", "", "id", "trial-days", "name", "trial", "type", "number", "min", "0", "max", "90", "step", "1", "required", "", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "grace-days"], ["hlmInput", "", "id", "grace-days", "name", "grace", "type", "number", "min", "0", "max", "30", "step", "1", "required", "", 3, "ngModelChange", "ngModel"], ["hlmBtn", "", 3, "disabled"], [3, "value"], ["value", "payfast"], ["value", "stripe"]], template: function BillingSettingsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 1);
            i0.ɵɵelementStart(1, "app-page-state", 2);
            i0.ɵɵlistener("retry", function BillingSettingsPage_Template_app_page_state_retry_1_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(2, BillingSettingsPage_Conditional_2_Template, 44, 25, "section", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_2_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_2_0 = ctx.settings) ? 2 : -1, tmp_2_0);
        } }, dependencies: [i1.HlmSelect, i1.HlmSelectContent, i1.HlmSelectItem, i1.HlmSelectPortal, i1.HlmSelectTrigger, i1.HlmSelectValue, i2.PageHeader, i2.PageState, i3.FormsModule, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.NumberValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.MinValidator, i3.MaxValidator, i3.NgModel, i3.NgForm, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.HlmCheckbox, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BillingSettingsPage, [{
        type: Component,
        args: [{
                selector: 'app-billing-settings',
                imports: [HlmSelectImports, WorkspaceUi],
                template: `<app-page-header title="billingSettings" description="billingSettingsHelp" />
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (settings; as s) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'billingSettings' | t }}</h2>
          </div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <div hlmField>
              <label hlmFieldLabel for="billing-ownership">{{ 'billingOwnership' | t }}</label
              ><hlm-select name="ownership" [(ngModel)]="s.ownership"
                ><hlm-select-trigger buttonId="billing-ownership"
                  ><hlm-select-value /></hlm-select-trigger
                ><hlm-select-content *hlmSelectPortal>
                  @for (value of ['Both', 'Personal', 'Organization']; track value) {
                    <hlm-select-item [value]="value">{{ 'customer.' + value | t }}</hlm-select-item>
                  }
                </hlm-select-content></hlm-select
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="enable-stripe"
                ><hlm-checkbox id="enable-stripe" name="stripe" [(ngModel)]="s.stripeEnabled" />
                Stripe</label
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="enable-payfast"
                ><hlm-checkbox id="enable-payfast" name="payfast" [(ngModel)]="s.payFastEnabled" />
                PayFast</label
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="default-provider">{{ 'defaultPaymentProvider' | t }}</label
              ><hlm-select name="default" [(ngModel)]="s.defaultProvider"
                ><hlm-select-trigger buttonId="default-provider"
                  ><hlm-select-value /></hlm-select-trigger
                ><hlm-select-content *hlmSelectPortal
                  ><hlm-select-item value="payfast">PayFast</hlm-select-item
                  ><hlm-select-item value="stripe">Stripe</hlm-select-item></hlm-select-content
                ></hlm-select
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="trial-days">{{ 'trialDays' | t }}</label
              ><input
                hlmInput
                id="trial-days"
                name="trial"
                type="number"
                min="0"
                max="90"
                step="1"
                required
                [(ngModel)]="s.trialDays"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="grace-days">{{ 'graceDays' | t }}</label
              ><input
                hlmInput
                id="grace-days"
                name="grace"
                type="number"
                min="0"
                max="30"
                step="1"
                required
                [(ngModel)]="s.graceDays"
              />
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
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BillingSettingsPage, { className: "BillingSettingsPage", filePath: "src/app/features/billing-settings.ts", lineNumber: 89 }); })();
