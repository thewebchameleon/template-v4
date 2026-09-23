import { BusinessDraft } from '../../../../../../src/TemplateV4.Angular/src/app/shared/business-draft';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceApi } from '../../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { Resource, WorkspaceUi } from '../../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../../../../../../src/TemplateV4.Angular/src/app/shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/checkbox";
import * as i9 from "../../../../../../src/TemplateV4.Angular/src/app/core/i18n";
const _c0 = a0 => ["/organizations", a0, "invoicing"];
const _forTrack0 = ($index, $item) => $item.key;
function IssuerSettingsPage_Conditional_5_For_9_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "label", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 15);
    i0.ɵɵtwoWayListener("ngModelChange", function IssuerSettingsPage_Conditional_5_For_9_Template_input_ngModelChange_4_listener($event) { const field_r4 = i0.ɵɵrestoreView(_r3).$implicit; const draft_r5 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(draft_r5[field_r4.key], $event) || (draft_r5[field_r4.key] = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const field_r4 = ctx.$implicit;
    const draft_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", "issuer-" + field_r4.key);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, field_r4.label));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "issuer-" + field_r4.key)("name", field_r4.key);
    i0.ɵɵtwoWayProperty("ngModel", draft_r5[field_r4.key]);
    i0.ɵɵproperty("required", field_r4.key === "name" || field_r4.key === "address" || field_r4.key === "numberPrefix");
    i0.ɵɵcontrol();
} }
function IssuerSettingsPage_Conditional_5_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "label", 16);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 17);
    i0.ɵɵtwoWayListener("ngModelChange", function IssuerSettingsPage_Conditional_5_Conditional_16_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r6); const draft_r5 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(draft_r5.vatNumber, $event) || (draft_r5.vatNumber = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const draft_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "vatNumber"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", draft_r5.vatNumber);
    i0.ɵɵcontrol();
} }
function IssuerSettingsPage_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 5)(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 7, 0);
    i0.ɵɵlistener("ngSubmit", function IssuerSettingsPage_Conditional_5_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.save()); });
    i0.ɵɵelementStart(7, "fieldset", 8);
    i0.ɵɵrepeaterCreate(8, IssuerSettingsPage_Conditional_5_For_9_Template, 5, 8, "div", 9, _forTrack0);
    i0.ɵɵelementStart(10, "label", 10)(11, "div", 11)(12, "hlm-checkbox", 12);
    i0.ɵɵtwoWayListener("ngModelChange", function IssuerSettingsPage_Conditional_5_Template_hlm_checkbox_ngModelChange_12_listener($event) { const draft_r5 = i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(draft_r5.vatRegistered, $event) || (draft_r5.vatRegistered = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(13, "span");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(16, IssuerSettingsPage_Conditional_5_Conditional_16_Template, 5, 4, "div", 9);
    i0.ɵɵelementStart(17, "button", 13);
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const draft_r5 = ctx;
    const form_r7 = i0.ɵɵreference(6);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, "issuerSettings"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.canConfigure());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.fields);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", draft_r5.vatRegistered);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 9, "vatRegistered"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(draft_r5.vatRegistered ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || form_r7.invalid || !ctx_r1.canConfigure());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 11, "save"), " ");
} }
export class IssuerSettingsPage extends BusinessDraft {
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
    fields = [
        { key: 'name', label: 'issuerName' },
        { key: 'address', label: 'issuerAddress' },
        { key: 'contact', label: 'contact' },
        { key: 'paymentInstructions', label: 'paymentInstructions' },
        { key: 'numberPrefix', label: 'numberPrefix' },
    ];
    constructor() {
        super();
        void this.load();
    }
    async load() {
        await this.state.load(async (signal) => {
            const [settings, home] = await Promise.all([
                this.api.get(`organizations/${this.organization}/invoicing/settings`, {}, signal),
                this.api.get('customers/', {}, signal),
            ]);
            this.canConfigure.set(['Owner', 'Admin'].includes(home.accounts.find((x) => x.id === this.organization)?.role ?? ''));
            this.draft = structuredClone(settings);
            this.markSaved();
            return settings;
        });
    }
    async save() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`organizations/${this.organization}/invoicing/settings`, this.draft);
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function IssuerSettingsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || IssuerSettingsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: IssuerSettingsPage, selectors: [["app-issuer-settings"]], features: [i0.ɵɵInheritDefinitionFeature], decls: 6, vars: 9, consts: [["form", "ngForm"], ["title", "issuerSettings", "description", "invoicingHelp"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], [3, "retry", "state", "refreshError"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], [1, "grid", "gap-4", 3, "disabled"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "issuer-vat"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "issuer-vat", "name", "vatRegistered", 3, "ngModelChange", "ngModel"], ["hlmBtn", "", 3, "disabled"], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", 3, "ngModelChange", "id", "name", "ngModel", "required"], ["hlmFieldLabel", "", "for", "issuer-vat-number"], ["hlmInput", "", "id", "issuer-vat-number", "name", "vatNumber", "pattern", "4[0-9]{9}", "required", "", 3, "ngModelChange", "ngModel"]], template: function IssuerSettingsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 1)(1, "a", 2);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "app-page-state", 3);
            i0.ɵɵlistener("retry", function IssuerSettingsPage_Template_app_page_state_retry_4_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(5, IssuerSettingsPage_Conditional_5_Template, 20, 13, "section", 4);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_4_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(7, _c0, ctx.organization));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "invoicing"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.state.state())("refreshError", ctx.state.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_4_0 = ctx.draft) ? 5 : -1, tmp_4_0);
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.PatternValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.HlmCheckbox, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(IssuerSettingsPage, [{
        type: Component,
        args: [{
                selector: 'app-issuer-settings',
                imports: [WorkspaceUi],
                template: ` <app-page-header title="issuerSettings" description="invoicingHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', organization, 'invoicing']">{{
        'invoicing' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="state.state()" [refreshError]="state.refreshError()" (retry)="load()">
      @if (draft; as draft) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'issuerSettings' | t }}</h2>
          </div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <fieldset [disabled]="busy() || !canConfigure()" class="grid gap-4">
              @for (field of fields; track field.key) {
                <div hlmField>
                  <label hlmFieldLabel [for]="'issuer-' + field.key">{{ field.label | t }}</label
                  ><input
                    hlmInput
                    [id]="'issuer-' + field.key"
                    [name]="field.key"
                    [(ngModel)]="draft[field.key]"
                    [required]="
                      field.key === 'name' ||
                      field.key === 'address' ||
                      field.key === 'numberPrefix'
                    "
                  />
                </div>
              }
              <label hlmFieldLabel for="issuer-vat"
                ><div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="issuer-vat"
                    name="vatRegistered"
                    [(ngModel)]="draft.vatRegistered"
                  /><span>{{ 'vatRegistered' | t }}</span>
                </div></label
              >
              @if (draft.vatRegistered) {
                <div hlmField>
                  <label hlmFieldLabel for="issuer-vat-number">{{ 'vatNumber' | t }}</label
                  ><input
                    hlmInput
                    id="issuer-vat-number"
                    name="vatNumber"
                    [(ngModel)]="draft.vatNumber"
                    pattern="4[0-9]{9}"
                    required
                  />
                </div>
              }
              <button hlmBtn [disabled]="busy() || form.invalid || !canConfigure()">
                {{ 'save' | t }}
              </button>
            </fieldset>
          </form>
        </section>
      }
    </app-page-state>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(IssuerSettingsPage, { className: "IssuerSettingsPage", filePath: "src/app/features/issuer-settings.ts", lineNumber: 70 }); })();
