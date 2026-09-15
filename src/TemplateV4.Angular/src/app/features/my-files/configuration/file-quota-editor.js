import { Component, inject, input, output, signal } from '@angular/core';
import { WorkspaceUi, Resource, Confirmations } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Notifications } from '../../notifications/notifications';
import { HlmSliderImports } from '@spartan-ng/helm/slider';
import { I18n } from '../../../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "../../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/field";
import * as i5 from "@spartan-ng/helm/input";
import * as i6 from "@spartan-ng/helm/slider";
import * as i7 from "../../../core/i18n";
const _c0 = a0 => [a0];
function FileQuotaEditor_Conditional_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "quotaValidation"));
} }
function FileQuotaEditor_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "label", 6);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 7);
    i0.ɵɵtwoWayListener("ngModelChange", function FileQuotaEditor_Conditional_2_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.quotaMb, $event) || (ctx_r1.quotaMb = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(5, "p", 8);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, FileQuotaEditor_Conditional_2_Conditional_8_Template, 3, 3, "hlm-field-error", 9);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, "userQuota"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.quotaMb);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵattribute("aria-invalid", !ctx_r1.valid() ? true : null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 8, "userQuotaHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.valid() ? 8 : -1);
} }
function FileQuotaEditor_Conditional_3_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "maxUploadNoLimit"), " ");
} }
function FileQuotaEditor_Conditional_3_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.storageSize(ctx_r1.quotaMb), " ");
} }
function FileQuotaEditor_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "div", 10)(2, "span", 11);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "output", 12);
    i0.ɵɵconditionalCreate(6, FileQuotaEditor_Conditional_3_Conditional_6_Template, 2, 3)(7, FileQuotaEditor_Conditional_3_Conditional_7_Template, 1, 1);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "hlm-slider", 13);
    i0.ɵɵlistener("valueChange", function FileQuotaEditor_Conditional_3_Template_hlm_slider_valueChange_8_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setDefaultQuotaPosition($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 8);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 8, "defaultQuota"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.quotaMb === -1 ? 6 : 7);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", i0.ɵɵpureFunction1(12, _c0, ctx_r1.defaultQuotaPosition()))("min", 0)("max", ctx_r1.defaultQuotaOptionsMb.length - 1)("step", 1)("disabled", ctx_r1.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 10, "defaultQuotaHelp"));
} }
function FileQuotaEditor_Conditional_7_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "maxUploadNoLimit"), " ");
} }
function FileQuotaEditor_Conditional_7_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.storageSize(ctx_r1.maxUploadMb), " ");
} }
function FileQuotaEditor_Conditional_7_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "myFilesDemoExpiryValidation"));
} }
function FileQuotaEditor_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "div", 10)(2, "span", 14);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "output", 15);
    i0.ɵɵconditionalCreate(6, FileQuotaEditor_Conditional_7_Conditional_6_Template, 2, 3)(7, FileQuotaEditor_Conditional_7_Conditional_7_Template, 1, 1);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "hlm-slider", 16);
    i0.ɵɵlistener("valueChange", function FileQuotaEditor_Conditional_7_Template_hlm_slider_valueChange_8_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setMaxUploadPosition($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 17);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 2)(13, "label", 18);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "input", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function FileQuotaEditor_Conditional_7_Template_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.demoExpiryMinutes, $event) || (ctx_r1.demoExpiryMinutes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(17, "p", 20);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, FileQuotaEditor_Conditional_7_Conditional_20_Template, 3, 3, "hlm-field-error", 9);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 14, "maxUploadSize"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.maxUploadMb === 0 ? 6 : 7);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", i0.ɵɵpureFunction1(22, _c0, ctx_r1.maxUploadPosition()))("min", 0)("max", ctx_r1.maxUploadOptionsMb.length - 1)("step", 1)("disabled", ctx_r1.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 16, "maxUploadSizeHelp"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 18, "myFilesDemoExpiry"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.demoExpiryMinutes);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵattribute("aria-invalid", !ctx_r1.validExpiry() ? true : null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 20, "myFilesDemoExpiryHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.validExpiry() ? 20 : -1);
} }
const storageSizeOptionsMb = [
    ...Array.from({ length: 20 }, (_, index) => (index + 1) * 5),
    ...Array.from({ length: 10 }, (_, index) => 110 + index * 10),
    ...Array.from({ length: 6 }, (_, index) => 250 + index * 50),
    ...Array.from({ length: 5 }, (_, index) => 600 + index * 100),
];
const maxUploadOptionsMb = [...storageSizeOptionsMb, 0];
const defaultQuotaOptionsMb = [
    ...storageSizeOptionsMb.filter((value) => value >= 50),
    ...Array.from({ length: 40 }, (_, index) => 1100 + index * 100),
    ...Array.from({ length: 15 }, (_, index) => 6000 + index * 1000),
    -1,
];
export class FileQuotaEditor {
    owner = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "owner" }] : /* istanbul ignore next */ []));
    saved = output();
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    maxUploadOptionsMb = maxUploadOptionsMb;
    defaultQuotaOptionsMb = defaultQuotaOptionsMb;
    quotaMb = null;
    maxUploadMb = 20;
    demoExpiryMinutes = 60;
    originalMaxUpload = 20;
    originalExpiry = 60;
    original = null;
    version = '';
    ngOnInit() {
        void this.load();
    }
    async load() {
        const loaded = await this.data.load((signal) => this.api.get(this.owner() ? `my-files/admin/users/${this.owner()}` : 'my-files/admin/settings', {}, signal));
        if (!loaded)
            return;
        const value = this.data.value();
        const bytes = 'quotaOverrideBytes' in value ? value.quotaOverrideBytes : value.defaultQuotaBytes;
        this.quotaMb = bytes == null ? null : bytes === -1 ? -1 : bytes / 1048576;
        this.original = this.quotaMb;
        this.version = 'version' in value ? (value.version ?? '') : '';
        const maxUploadBytes = 'maxUploadBytes' in value ? (value.maxUploadBytes ?? 20 * 1048576) : 20 * 1048576;
        this.maxUploadMb = maxUploadBytes / 1048576;
        this.originalMaxUpload = this.maxUploadMb;
        this.demoExpiryMinutes = value.demoExpiryMinutes ?? 60;
        this.originalExpiry = this.demoExpiryMinutes;
    }
    valid() {
        if (!this.owner())
            return this.quotaMb != null && defaultQuotaOptionsMb.includes(this.quotaMb);
        return this.quotaMb == null
            ? true
            : Number.isFinite(this.quotaMb) && this.quotaMb >= 0 && this.quotaMb <= 102400;
    }
    defaultQuotaPosition() {
        const position = defaultQuotaOptionsMb.indexOf(this.quotaMb ?? 100);
        return position >= 0 ? position : defaultQuotaOptionsMb.indexOf(100);
    }
    setDefaultQuotaPosition(value) {
        const position = Math.round(value[0] ?? this.defaultQuotaPosition());
        this.quotaMb = defaultQuotaOptionsMb[position] ?? this.quotaMb;
    }
    storageSize(megabytes) {
        if (megabytes == null)
            return '';
        return megabytes >= 1000
            ? `${this.i18n.number(megabytes / 1000)} GB`
            : `${this.i18n.number(megabytes)} MB`;
    }
    hasUnsavedChanges() {
        return (this.quotaMb !== this.original ||
            (!this.owner() &&
                (this.maxUploadMb !== this.originalMaxUpload ||
                    this.demoExpiryMinutes !== this.originalExpiry)));
    }
    validMaxUpload() {
        return (!!this.owner() || (this.maxUploadMb != null && maxUploadOptionsMb.includes(this.maxUploadMb)));
    }
    maxUploadPosition() {
        const position = maxUploadOptionsMb.indexOf(this.maxUploadMb ?? 20);
        return position >= 0 ? position : maxUploadOptionsMb.indexOf(20);
    }
    setMaxUploadPosition(value) {
        const position = Math.round(value[0] ?? this.maxUploadPosition());
        this.maxUploadMb = maxUploadOptionsMb[position] ?? this.maxUploadMb;
    }
    validExpiry() {
        return (!!this.owner() ||
            (this.demoExpiryMinutes != null &&
                Number.isInteger(this.demoExpiryMinutes) &&
                this.demoExpiryMinutes >= 1 &&
                this.demoExpiryMinutes <= 525600));
    }
    async reload() {
        if (!this.hasUnsavedChanges() || (await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            await this.load();
    }
    async save() {
        if (this.busy() ||
            !this.valid() ||
            !this.validMaxUpload() ||
            !this.validExpiry() ||
            !this.hasUnsavedChanges())
            return;
        this.busy.set(true);
        try {
            const bytes = this.quotaMb == null ? null : this.quotaMb === -1 ? -1 : Math.round(this.quotaMb * 1048576);
            await this.api.post(this.owner() ? `my-files/admin/users/${this.owner()}/quota` : 'my-files/admin/settings', this.owner()
                ? { quotaBytes: bytes }
                : {
                    defaultQuotaBytes: bytes,
                    maxUploadBytes: Math.round(this.maxUploadMb * 1048576),
                    version: this.version,
                    demoExpiryMinutes: this.demoExpiryMinutes,
                });
            this.toast.success(this.owner() ? 'quotaSaved' : 'myFilesStorageSaved');
            await this.load();
            this.saved.emit();
        }
        catch {
            /* Central errors; retain the draft. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function FileQuotaEditor_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileQuotaEditor)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FileQuotaEditor, selectors: [["app-file-quota-editor"]], inputs: { owner: [1, "owner"] }, outputs: { saved: "saved" }, decls: 14, vars: 15, consts: [[3, "retry", "state", "refreshError"], [1, "grid", "gap-4", "mt-4", 3, "ngSubmit"], ["hlmField", ""], [1, "workspace-meta"], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click", "disabled"], ["hlmBtn", "", "type", "submit", 3, "disabled"], ["hlmFieldLabel", "", "for", "user-quota"], ["hlmInput", "", "id", "user-quota", "name", "quota", "type", "number", "min", "0", "max", "102400", "step", "any", "aria-describedby", "quota-help", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldDescription", "", "id", "quota-help"], ["forceShow", ""], [1, "flex", "items-center", "justify-between", "gap-3"], ["hlmFieldLabel", "", "id", "default-quota-label"], ["id", "default-quota-value", "for", "default-quota", 1, "text-sm", "tabular-nums"], ["id", "default-quota", "aria-labelledby", "default-quota-label default-quota-value", "aria-describedby", "quota-help", 3, "valueChange", "value", "min", "max", "step", "disabled"], ["hlmFieldLabel", "", "id", "max-upload-label"], ["id", "max-upload-value", "for", "max-upload", 1, "text-sm", "tabular-nums"], ["id", "max-upload", "aria-labelledby", "max-upload-label max-upload-value", "aria-describedby", "max-upload-help", 3, "valueChange", "value", "min", "max", "step", "disabled"], ["hlmFieldDescription", "", "id", "max-upload-help"], ["hlmFieldLabel", "", "for", "demo-expiry"], ["hlmInput", "", "id", "demo-expiry", "name", "demoExpiryMinutes", "type", "number", "min", "1", "max", "525600", "step", "1", "aria-describedby", "demo-expiry-help", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldDescription", "", "id", "demo-expiry-help"]], template: function FileQuotaEditor_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-state", 0);
            i0.ɵɵlistener("retry", function FileQuotaEditor_Template_app_page_state_retry_0_listener() { return ctx.load(); });
            i0.ɵɵelementStart(1, "form", 1);
            i0.ɵɵlistener("ngSubmit", function FileQuotaEditor_Template_form_ngSubmit_1_listener() { return ctx.save(); });
            i0.ɵɵconditionalCreate(2, FileQuotaEditor_Conditional_2_Template, 9, 10, "div", 2)(3, FileQuotaEditor_Conditional_3_Template, 12, 14, "div", 2);
            i0.ɵɵelementStart(4, "p", 3);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(7, FileQuotaEditor_Conditional_7_Template, 21, 24);
            i0.ɵɵelementStart(8, "button", 4);
            i0.ɵɵlistener("click", function FileQuotaEditor_Template_button_click_8_listener() { return ctx.reload(); });
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "button", 5);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "t");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.owner() ? 2 : 3);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 9, "quotaReductionHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.owner() ? 7 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 11, "reloadQuota"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || !ctx.valid() || !ctx.validMaxUpload() || !ctx.validExpiry() || !ctx.hasUnsavedChanges());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 13, "save"), " ");
        } }, dependencies: [i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.MinValidator, i2.MaxValidator, i2.NgModel, i2.NgForm, i3.HlmButton, i4.HlmField, i4.HlmFieldDescription, i4.HlmFieldError, i4.HlmFieldLabel, i5.HlmInput, i6.HlmSlider, i7.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileQuotaEditor, [{
        type: Component,
        args: [{
                selector: 'app-file-quota-editor',
                imports: [WorkspaceUi, HlmSliderImports],
                template: `<app-page-state
    [state]="data.state()"
    [refreshError]="data.refreshError()"
    (retry)="load()"
  >
    <form class="grid gap-4 mt-4" (ngSubmit)="save()">
      @if (owner()) {
        <div hlmField>
          <label hlmFieldLabel for="user-quota">{{ 'userQuota' | t }}</label>
          <input
            hlmInput
            id="user-quota"
            name="quota"
            type="number"
            min="0"
            max="102400"
            step="any"
            [(ngModel)]="quotaMb"
            [disabled]="busy()"
            aria-describedby="quota-help"
            [attr.aria-invalid]="!valid() ? true : null"
          />
          <p hlmFieldDescription id="quota-help">{{ 'userQuotaHelp' | t }}</p>
          @if (!valid()) {
            <hlm-field-error forceShow>{{ 'quotaValidation' | t }}</hlm-field-error>
          }
        </div>
      } @else {
        <div hlmField>
          <div class="flex items-center justify-between gap-3">
            <span hlmFieldLabel id="default-quota-label">{{ 'defaultQuota' | t }}</span>
            <output id="default-quota-value" for="default-quota" class="text-sm tabular-nums">
              @if (quotaMb === -1) {
                {{ 'maxUploadNoLimit' | t }}
              } @else {
                {{ storageSize(quotaMb) }}
              }
            </output>
          </div>
          <hlm-slider
            id="default-quota"
            [value]="[defaultQuotaPosition()]"
            [min]="0"
            [max]="defaultQuotaOptionsMb.length - 1"
            [step]="1"
            [disabled]="busy()"
            aria-labelledby="default-quota-label default-quota-value"
            aria-describedby="quota-help"
            (valueChange)="setDefaultQuotaPosition($event)"
          ></hlm-slider>
          <p hlmFieldDescription id="quota-help">{{ 'defaultQuotaHelp' | t }}</p>
        </div>
      }
      <p class="workspace-meta">{{ 'quotaReductionHelp' | t }}</p>
      @if (!owner()) {
        <div hlmField>
          <div class="flex items-center justify-between gap-3">
            <span hlmFieldLabel id="max-upload-label">{{ 'maxUploadSize' | t }}</span>
            <output id="max-upload-value" for="max-upload" class="text-sm tabular-nums">
              @if (maxUploadMb === 0) {
                {{ 'maxUploadNoLimit' | t }}
              } @else {
                {{ storageSize(maxUploadMb) }}
              }
            </output>
          </div>
          <hlm-slider
            id="max-upload"
            [value]="[maxUploadPosition()]"
            [min]="0"
            [max]="maxUploadOptionsMb.length - 1"
            [step]="1"
            [disabled]="busy()"
            aria-labelledby="max-upload-label max-upload-value"
            aria-describedby="max-upload-help"
            (valueChange)="setMaxUploadPosition($event)"
          ></hlm-slider>
          <p hlmFieldDescription id="max-upload-help">{{ 'maxUploadSizeHelp' | t }}</p>
        </div>
        <div hlmField>
          <label hlmFieldLabel for="demo-expiry">{{ 'myFilesDemoExpiry' | t }}</label>
          <input
            hlmInput
            id="demo-expiry"
            name="demoExpiryMinutes"
            type="number"
            min="1"
            max="525600"
            step="1"
            [(ngModel)]="demoExpiryMinutes"
            [disabled]="busy()"
            aria-describedby="demo-expiry-help"
            [attr.aria-invalid]="!validExpiry() ? true : null"
          />
          <p hlmFieldDescription id="demo-expiry-help">{{ 'myFilesDemoExpiryHelp' | t }}</p>
          @if (!validExpiry()) {
            <hlm-field-error forceShow>{{ 'myFilesDemoExpiryValidation' | t }}</hlm-field-error>
          }
        </div>
      }
      <button hlmBtn variant="outline" type="button" [disabled]="busy()" (click)="reload()">
        {{ 'reloadQuota' | t }}
      </button>
      <button
        hlmBtn
        type="submit"
        [disabled]="
          busy() || !valid() || !validMaxUpload() || !validExpiry() || !hasUnsavedChanges()
        "
      >
        {{ 'save' | t }}
      </button>
    </form>
  </app-page-state>`,
            }]
    }], null, { owner: [{ type: i0.Input, args: [{ isSignal: true, alias: "owner", required: false }] }], saved: [{ type: i0.Output, args: ["saved"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FileQuotaEditor, { className: "FileQuotaEditor", filePath: "src/app/features/file-quota-editor.ts", lineNumber: 141 }); })();
