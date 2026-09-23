import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, HostListener, inject, signal } from '@angular/core';
import { WorkspaceApi } from '../../core/workspace-api';
import { protectUnload } from '../../shared/confirmation';
import { Resource, WorkspaceUi } from '../../shared/workspace';
import { Notifications } from '../notifications/notifications';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/select";
import * as i2 from "../../shared/workspace";
import * as i3 from "@angular/forms";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/checkbox";
import * as i8 from "../../core/i18n";
function PaymentMethodSettingsPage_Conditional_2_hlm_select_content_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content")(1, "hlm-select-item", 18);
    i0.ɵɵtext(2, "PayFast");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "hlm-select-item", 19);
    i0.ɵɵtext(4, "Stripe");
    i0.ɵɵelementEnd()();
} }
function PaymentMethodSettingsPage_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "h2", 5);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 6, 0);
    i0.ɵɵlistener("ngSubmit", function PaymentMethodSettingsPage_Conditional_2_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.save()); });
    i0.ɵɵelementStart(7, "div", 7)(8, "label", 8)(9, "hlm-checkbox", 9);
    i0.ɵɵtwoWayListener("ngModelChange", function PaymentMethodSettingsPage_Conditional_2_Template_hlm_checkbox_ngModelChange_9_listener($event) { const value_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(value_r3.stripeEnabled, $event) || (value_r3.stripeEnabled = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(10, " Stripe");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 10);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 7)(15, "label", 11)(16, "hlm-checkbox", 12);
    i0.ɵɵtwoWayListener("ngModelChange", function PaymentMethodSettingsPage_Conditional_2_Template_hlm_checkbox_ngModelChange_16_listener($event) { const value_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(value_r3.payFastEnabled, $event) || (value_r3.payFastEnabled = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(17, " PayFast");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p", 10);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 7)(22, "label", 13);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "hlm-select", 14);
    i0.ɵɵtwoWayListener("ngModelChange", function PaymentMethodSettingsPage_Conditional_2_Template_hlm_select_ngModelChange_25_listener($event) { const value_r3 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(value_r3.defaultProvider, $event) || (value_r3.defaultProvider = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(26, "hlm-select-trigger", 15);
    i0.ɵɵelement(27, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(28, PaymentMethodSettingsPage_Conditional_2_hlm_select_content_28_Template, 5, 0, "hlm-select-content", 16);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "button", 17);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const value_r3 = ctx;
    const form_r4 = i0.ɵɵreference(6);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 9, "paymentMethods"));
    i0.ɵɵadvance(6);
    i0.ɵɵtwoWayProperty("ngModel", value_r3.stripeEnabled);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 11, ctx_r1.data.value()?.stripeReady ? "providerReady" : "providerCredentialsMissing"));
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", value_r3.payFastEnabled);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 13, ctx_r1.data.value()?.payFastReady ? "providerReady" : "providerCredentialsMissing"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 15, "defaultPaymentProvider"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", value_r3.defaultProvider);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r4.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 17, "save"));
} }
export class PaymentMethodSettingsPage {
    api = inject(WorkspaceApi);
    toast = inject(Notifications);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    settings = null;
    hasUnsavedChanges() {
        if (!this.settings)
            return this.busy();
        const original = this.data.value();
        return this.busy() || !original || this.settings.stripeEnabled !== original.stripeEnabled ||
            this.settings.payFastEnabled !== original.payFastEnabled || this.settings.defaultProvider !== original.defaultProvider;
    }
    beforeUnload(event) { protectUnload(event, this.hasUnsavedChanges()); }
    constructor() { void this.load(); }
    async load() {
        if (await this.data.load((signal) => this.api.get('configuration/payment-methods', {}, signal))) {
            const value = this.data.value();
            this.settings = { stripeEnabled: value.stripeEnabled, payFastEnabled: value.payFastEnabled, defaultProvider: value.defaultProvider, version: value.version };
        }
    }
    async save() {
        if (this.busy() || !this.settings)
            return;
        this.busy.set(true);
        try {
            await this.api.post('configuration/payment-methods', this.settings);
            await this.load();
            this.toast.success('customerSaved');
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function PaymentMethodSettingsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PaymentMethodSettingsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PaymentMethodSettingsPage, selectors: [["app-payment-method-settings"]], hostBindings: function PaymentMethodSettingsPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function PaymentMethodSettingsPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 3, vars: 3, consts: [["form", "ngForm"], ["title", "paymentMethods", "description", "paymentMethodsHelp"], [3, "retry", "state", "refreshError"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "enable-stripe"], ["id", "enable-stripe", "name", "stripe", 3, "ngModelChange", "ngModel"], ["hlmFieldDescription", ""], ["hlmFieldLabel", "", "for", "enable-payfast"], ["id", "enable-payfast", "name", "payfast", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "default-provider"], ["name", "default", 3, "ngModelChange", "ngModel"], ["buttonId", "default-provider"], [4, "hlmSelectPortal"], ["hlmBtn", "", 3, "disabled"], ["value", "payfast"], ["value", "stripe"]], template: function PaymentMethodSettingsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 1);
            i0.ɵɵelementStart(1, "app-page-state", 2);
            i0.ɵɵlistener("retry", function PaymentMethodSettingsPage_Template_app_page_state_retry_1_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(2, PaymentMethodSettingsPage_Conditional_2_Template, 32, 19, "section", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_2_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_2_0 = ctx.settings) ? 2 : -1, tmp_2_0);
        } }, dependencies: [i1.HlmSelect, i1.HlmSelectContent, i1.HlmSelectItem, i1.HlmSelectPortal, i1.HlmSelectTrigger, i1.HlmSelectValue, i2.PageHeader, i2.PageState, i3.FormsModule, i3.ɵNgNoValidate, i3.NgControlStatus, i3.NgControlStatusGroup, i3.NgModel, i3.NgForm, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldDescription, i6.HlmFieldLabel, i7.HlmCheckbox, i8.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PaymentMethodSettingsPage, [{
        type: Component,
        args: [{
                selector: 'app-payment-method-settings',
                imports: [HlmSelectImports, WorkspaceUi],
                template: `<app-page-header title="paymentMethods" description="paymentMethodsHelp" />
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (settings; as value) {
        <section hlmCard>
          <div hlmCardHeader><h2 hlmCardTitle>{{ 'paymentMethods' | t }}</h2></div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <div hlmField>
              <label hlmFieldLabel for="enable-stripe"><hlm-checkbox id="enable-stripe" name="stripe" [(ngModel)]="value.stripeEnabled" /> Stripe</label>
              <p hlmFieldDescription>{{ (data.value()?.stripeReady ? 'providerReady' : 'providerCredentialsMissing') | t }}</p>
            </div>
            <div hlmField>
              <label hlmFieldLabel for="enable-payfast"><hlm-checkbox id="enable-payfast" name="payfast" [(ngModel)]="value.payFastEnabled" /> PayFast</label>
              <p hlmFieldDescription>{{ (data.value()?.payFastReady ? 'providerReady' : 'providerCredentialsMissing') | t }}</p>
            </div>
            <div hlmField>
              <label hlmFieldLabel for="default-provider">{{ 'defaultPaymentProvider' | t }}</label
              ><hlm-select name="default" [(ngModel)]="value.defaultProvider"
                ><hlm-select-trigger buttonId="default-provider"><hlm-select-value /></hlm-select-trigger
                ><hlm-select-content *hlmSelectPortal
                  ><hlm-select-item value="payfast">PayFast</hlm-select-item
                  ><hlm-select-item value="stripe">Stripe</hlm-select-item></hlm-select-content
                ></hlm-select
              >
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
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PaymentMethodSettingsPage, { className: "PaymentMethodSettingsPage", filePath: "src/app/features/commercial-billing/payment-method-settings.ts", lineNumber: 42 }); })();
