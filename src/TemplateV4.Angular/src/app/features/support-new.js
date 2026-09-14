import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, Resource, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/select";
import * as i2 from "../shared/workspace";
import * as i3 from "@angular/forms";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/field";
import * as i6 from "@spartan-ng/helm/input";
import * as i7 from "@spartan-ng/helm/spinner";
import * as i8 from "@spartan-ng/helm/textarea";
import * as i9 from "@spartan-ng/helm/drawer";
import * as i10 from "../core/i18n";
const _c0 = () => [];
const _forTrack0 = ($index, $item) => $item.id;
function SupportNewPage_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-page-header", 3);
} }
function SupportNewPage_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "supportRequired"));
} }
function SupportNewPage_hlm_select_content_21_For_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 20);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("value", c_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r3.name);
} }
function SupportNewPage_hlm_select_content_21_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, SupportNewPage_hlm_select_content_21_For_3_Conditional_0_Template, 2, 2, "hlm-select-item", 20);
} if (rf & 2) {
    const c_r3 = ctx.$implicit;
    i0.ɵɵconditional(c_r3.active ? 0 : -1);
} }
function SupportNewPage_hlm_select_content_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 19);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, SupportNewPage_hlm_select_content_21_For_3_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "supportCategory"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.options.value()?.categories ?? i0.ɵɵpureFunction0(3, _c0));
} }
function SupportNewPage_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "supportRequired"));
} }
function SupportNewPage_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
export class SupportNewPage {
    embedded = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "embedded" }] : /* istanbul ignore next */ []));
    api = inject(WorkspaceApi);
    router = inject(Router);
    toast = inject(Notifications);
    options = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    subject = '';
    description = '';
    category = '';
    categoryLabel = (id) => this.options.value()?.categories.find((category) => category.id === id)?.name ?? '';
    constructor() {
        void this.load();
    }
    load() {
        return this.options.load((signal) => this.api.get('support/options', {}, signal));
    }
    hasUnsavedChanges() {
        return !!(this.subject || this.description || this.category);
    }
    beforeUnload(e) {
        protectUnload(e, this.hasUnsavedChanges());
    }
    async save() {
        if (this.busy() || !this.category)
            return;
        this.busy.set(true);
        try {
            const id = await this.api.post('support/', {
                subject: this.subject,
                description: this.description,
                categoryId: this.category,
            });
            this.subject = '';
            this.description = '';
            this.category = '';
            this.toast.success('supportCreated');
            await this.router.navigate(['/support', id]);
        }
        catch {
            /* Central error UI retains the draft. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function SupportNewPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SupportNewPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SupportNewPage, selectors: [["app-support-new"]], hostBindings: function SupportNewPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function SupportNewPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, inputs: { embedded: [1, "embedded"] }, decls: 34, vars: 25, consts: [["form", "ngForm"], ["subjectField", "ngModel"], ["bodyField", "ngModel"], ["title", "supportTicketDetails", "description", "supportNewHelp"], [1, "flex", "min-h-0", "flex-1", "flex-col", 3, "ngSubmit"], ["hlmDrawerBody", "", 1, "min-h-0", "flex-1", "overflow-y-auto"], [3, "retry", "state"], [1, "grid", "gap-4"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "subject"], ["hlmInput", "", "id", "subject", "name", "subject", "required", "", "maxlength", "180", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "category"], [3, "valueChange", "value", "itemToString"], ["buttonId", "category", 1, "w-full"], [3, "placeholder"], [3, "ariaLabel", 4, "hlmSelectPortal"], ["hlmFieldLabel", "", "for", "description"], ["hlmTextarea", "", "id", "description", "name", "description", "required", "", "maxlength", "10000", "rows", "8", 3, "ngModelChange", "ngModel"], ["hlmBtn", "", "type", "submit", 3, "disabled"], [3, "ariaLabel"], [3, "value"]], template: function SupportNewPage_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵconditionalCreate(0, SupportNewPage_Conditional_0_Template, 1, 0, "app-page-header", 3);
            i0.ɵɵelementStart(1, "form", 4, 0);
            i0.ɵɵlistener("ngSubmit", function SupportNewPage_Template_form_ngSubmit_1_listener() { i0.ɵɵrestoreView(_r1); const form_r2 = i0.ɵɵreference(2); return i0.ɵɵresetView(form_r2.valid && ctx.save()); });
            i0.ɵɵelementStart(3, "div", 5)(4, "app-page-state", 6);
            i0.ɵɵlistener("retry", function SupportNewPage_Template_app_page_state_retry_4_listener() { return ctx.load(); });
            i0.ɵɵelementStart(5, "div", 7)(6, "div", 8)(7, "label", 9);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "input", 10, 1);
            i0.ɵɵtwoWayListener("ngModelChange", function SupportNewPage_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.subject, $event) || (ctx.subject = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(12, SupportNewPage_Conditional_12_Template, 3, 3, "hlm-field-error");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "div", 8)(14, "label", 11);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "hlm-select", 12);
            i0.ɵɵlistener("valueChange", function SupportNewPage_Template_hlm_select_valueChange_17_listener($event) { return ctx.category = $event ?? ""; });
            i0.ɵɵelementStart(18, "hlm-select-trigger", 13);
            i0.ɵɵelement(19, "hlm-select-value", 14);
            i0.ɵɵpipe(20, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(21, SupportNewPage_hlm_select_content_21_Template, 4, 4, "hlm-select-content", 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "div", 8)(23, "label", 16);
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "textarea", 17, 2);
            i0.ɵɵtwoWayListener("ngModelChange", function SupportNewPage_Template_textarea_ngModelChange_26_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.description, $event) || (ctx.description = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(28, SupportNewPage_Conditional_28_Template, 3, 3, "hlm-field-error");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(29, "hlm-drawer-footer")(30, "button", 18);
            i0.ɵɵconditionalCreate(31, SupportNewPage_Conditional_31_Template, 1, 0, "hlm-spinner");
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "t");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            const form_r2 = i0.ɵɵreference(2);
            const subjectField_r5 = i0.ɵɵreference(11);
            const bodyField_r6 = i0.ɵɵreference(27);
            i0.ɵɵconditional(!ctx.embedded() ? 0 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("state", ctx.options.state());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 15, "supportSubject"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.subject);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(subjectField_r5.invalid && subjectField_r5.touched ? 12 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 17, "supportCategory"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.category || undefined)("itemToString", ctx.categoryLabel);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(20, 19, "supportChooseCategory"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 21, "supportDescription"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.description);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(bodyField_r6.invalid && bodyField_r6.touched ? 28 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || ctx.options.state() !== "ready" || !form_r2.valid || !ctx.category || !ctx.subject.trim() || !ctx.description.trim());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.busy() ? 31 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(33, 23, "supportSubmit"), " ");
        } }, dependencies: [i1.HlmSelect, i1.HlmSelectContent, i1.HlmSelectItem, i1.HlmSelectPortal, i1.HlmSelectTrigger, i1.HlmSelectValue, i2.PageHeader, i2.PageState, i3.FormsModule, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.MaxLengthValidator, i3.NgModel, i3.NgForm, i4.HlmButton, i5.HlmField, i5.HlmFieldError, i5.HlmFieldLabel, i6.HlmInput, i7.HlmSpinner, i8.HlmTextarea, i9.HlmDrawerBody, i9.HlmDrawerFooter, i10.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SupportNewPage, [{
        type: Component,
        args: [{
                selector: 'app-support-new',
                imports: [HlmSelectImports, WorkspaceUi, HlmTextareaImports, HlmDrawerImports],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: `@if (!embedded()) {
      <app-page-header title="supportTicketDetails" description="supportNewHelp" />
    }
    <form class="flex min-h-0 flex-1 flex-col" #form="ngForm" (ngSubmit)="form.valid && save()">
      <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
        <app-page-state [state]="options.state()" (retry)="load()">
          <div class="grid gap-4">
            <div hlmField>
              <label hlmFieldLabel for="subject">{{ 'supportSubject' | t }}</label
              ><input
                hlmInput
                id="subject"
                name="subject"
                [(ngModel)]="subject"
                required
                maxlength="180"
                #subjectField="ngModel"
              />
              @if (subjectField.invalid && subjectField.touched) {
                <hlm-field-error>{{ 'supportRequired' | t }}</hlm-field-error>
              }
            </div>
            <div hlmField>
              <label hlmFieldLabel for="category">{{ 'supportCategory' | t }}</label
              ><hlm-select
                [value]="category || undefined"
                [itemToString]="categoryLabel"
                (valueChange)="category = $event ?? ''"
              >
                <hlm-select-trigger buttonId="category" class="w-full">
                  <hlm-select-value [placeholder]="'supportChooseCategory' | t" />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t">
                  @for (c of options.value()?.categories ?? []; track c.id) {
                    @if (c.active) {
                      <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                    }
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
            <div hlmField>
              <label hlmFieldLabel for="description">{{ 'supportDescription' | t }}</label
              ><textarea
                hlmTextarea
                id="description"
                name="description"
                [(ngModel)]="description"
                required
                maxlength="10000"
                rows="8"
                #bodyField="ngModel"
              ></textarea>
              @if (bodyField.invalid && bodyField.touched) {
                <hlm-field-error>{{ 'supportRequired' | t }}</hlm-field-error>
              }
            </div>
          </div>
        </app-page-state>
      </div>
      <hlm-drawer-footer>
        <button
          hlmBtn
          type="submit"
          [disabled]="
            busy() ||
            options.state() !== 'ready' ||
            !form.valid ||
            !category ||
            !subject.trim() ||
            !description.trim()
          "
        >
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'supportSubmit' | t }}
        </button>
      </hlm-drawer-footer>
    </form>`,
            }]
    }], () => [], { embedded: [{ type: i0.Input, args: [{ isSignal: true, alias: "embedded", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SupportNewPage, { className: "SupportNewPage", filePath: "src/app/features/support-new.ts", lineNumber: 96 }); })();
