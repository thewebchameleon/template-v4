import { BusinessDraft } from '../shared/business-draft';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { WorkspaceUi } from '../shared/workspace';
import { BusinessSelect } from '../shared/business-select';
import { CrmCustomerPicker } from '../shared/crm-customer-picker';
import { CommercialLines } from '../shared/commercial-lines';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/alert";
import * as i9 from "../core/i18n";
const _c0 = a0 => ["/organizations", a0, "invoicing"];
function CommercialEditorPage_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const totals_r1 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(3, 6, "net"), ": ", ctx_r1.i18n.currency(totals_r1.net));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(6, 8, "tax"), ": ", ctx_r1.i18n.currency(totals_r1.tax));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(9, 10, "total"), ": ", ctx_r1.i18n.currency(totals_r1.total));
} }
export class CommercialEditorPage extends BusinessDraft {
    draftValue() {
        return {
            customer: this.customer,
            kind: this.kind,
            reference: this.reference,
            lines: this.lines,
        };
    }
    route = inject(ActivatedRoute);
    api = inject(WorkspaceApi);
    router = inject(Router);
    i18n = inject(I18n);
    organization = this.route.snapshot.paramMap.get('id');
    source = this.route.snapshot.queryParamMap.get('source');
    mode = this.route.snapshot.queryParamMap.get('mode');
    kinds = [
        { id: '0', label: 'quotation' },
        { id: '1', label: 'invoice' },
    ];
    kind = '1';
    customer = '';
    reference = '';
    lines = [
        { description: '', category: 1, quantity: 1, unitPrice: 0, taxTreatment: 3, taxRate: 0 },
    ];
    totals = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totals" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    timer;
    generation = 0;
    key = crypto.randomUUID();
    submitted = '';
    constructor() {
        super();
        this.markSaved();
        inject(DestroyRef).onDestroy(() => {
            clearTimeout(this.timer);
            this.generation++;
        });
        if (this.source && this.mode === 'invoice') {
            void this.router.navigate(['/organizations', this.organization, 'invoicing', this.source]);
            return;
        }
        if (this.source)
            void this.api
                .get(`organizations/${this.organization}/invoicing/${this.source}`)
                .then((detail) => {
                this.customer = detail.document.customerId;
                this.lines = structuredClone(detail.document.snapshot.totals.lines.map((x) => x.source));
                this.kind = this.mode === 'revision' ? '0' : '1';
                this.changed();
                this.markSaved();
            })
                .catch(() => {
                /* Interceptor reports lookup failure. */
            });
    }
    changed() {
        this.totals.set(null);
        this.key = crypto.randomUUID();
        const generation = ++this.generation;
        clearTimeout(this.timer);
        if (this.lines.some((x) => !x.description.trim() || x.quantity <= 0 || x.unitPrice < 0))
            return;
        this.timer = setTimeout(() => {
            void this.api
                .post(`organizations/${this.organization}/invoicing/preview`, {
                lines: this.lines,
            })
                .then((result) => {
                if (generation === this.generation)
                    this.totals.set(result);
            })
                .catch(() => {
                /* The HTTP interceptor reports the error. */
            });
        }, 350);
    }
    async issue() {
        if (this.busy() || !this.totals())
            return;
        this.busy.set(true);
        try {
            const fingerprint = JSON.stringify({
                customer: this.customer,
                kind: this.kind,
                reference: this.reference,
                lines: this.lines,
                source: this.source,
                mode: this.mode,
            });
            if (this.submitted !== fingerprint) {
                this.key = crypto.randomUUID();
                this.submitted = fingerprint;
            }
            const result = await this.api.post(`organizations/${this.organization}/invoicing`, {
                idempotencyKey: this.key,
                customerId: this.customer,
                kind: Number(this.kind),
                lines: this.lines,
                origin: null,
                acceptedQuotationId: this.mode === 'invoice' ? this.source : null,
                previousRevisionId: this.mode === 'revision' ? this.source : null,
                reference: this.reference || null,
            });
            this.markSaved();
            await this.router.navigate(['/organizations', this.organization, 'invoicing', result.id]);
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function CommercialEditorPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CommercialEditorPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CommercialEditorPage, selectors: [["app-commercial-editor"]], features: [i0.ɵɵInheritDefinitionFeature], decls: 23, vars: 26, consts: [["title", "issueDocument", "description", "invoicingHelp"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-6", 3, "ngSubmit"], [1, "grid", "gap-6", 3, "disabled"], ["controlId", "document-kind", "label", "type", 3, "valueChange", "options", "value", "allowEmpty", "disabled"], ["controlId", "document-customer", 3, "valueChange", "organization", "value"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "document-reference"], ["hlmInput", "", "id", "document-reference", "name", "reference", "maxlength", "250", 3, "ngModelChange", "ngModel"], [3, "linesChange", "changed", "lines"], ["hlmAlert", "", 1, "grid", "gap-2"], ["hlmBtn", "", 3, "disabled"]], template: function CommercialEditorPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "a", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "section", 2)(5, "div", 3)(6, "h2", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "form", 5);
            i0.ɵɵlistener("ngSubmit", function CommercialEditorPage_Template_form_ngSubmit_9_listener() { return ctx.issue(); });
            i0.ɵɵelementStart(10, "fieldset", 6)(11, "app-business-select", 7);
            i0.ɵɵtwoWayListener("valueChange", function CommercialEditorPage_Template_app_business_select_valueChange_11_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.kind, $event) || (ctx.kind = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "app-crm-customer-picker", 8);
            i0.ɵɵtwoWayListener("valueChange", function CommercialEditorPage_Template_app_crm_customer_picker_valueChange_12_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.customer, $event) || (ctx.customer = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "div", 9)(14, "label", 10);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "input", 11);
            i0.ɵɵtwoWayListener("ngModelChange", function CommercialEditorPage_Template_input_ngModelChange_17_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.reference, $event) || (ctx.reference = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "app-commercial-lines", 12);
            i0.ɵɵtwoWayListener("linesChange", function CommercialEditorPage_Template_app_commercial_lines_linesChange_18_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.lines, $event) || (ctx.lines = $event); return $event; });
            i0.ɵɵlistener("changed", function CommercialEditorPage_Template_app_commercial_lines_changed_18_listener() { return ctx.changed(); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(19, CommercialEditorPage_Conditional_19_Template, 10, 12, "div", 13);
            i0.ɵɵelementStart(20, "button", 14);
            i0.ɵɵtext(21);
            i0.ɵɵpipe(22, "t");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            let tmp_14_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(24, _c0, ctx.organization));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 16, "invoicing"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 18, "issueDocument"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵproperty("options", ctx.kinds);
            i0.ɵɵtwoWayProperty("value", ctx.kind);
            i0.ɵɵproperty("allowEmpty", false)("disabled", !!ctx.source);
            i0.ɵɵadvance();
            i0.ɵɵproperty("organization", ctx.organization);
            i0.ɵɵtwoWayProperty("value", ctx.customer);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 20, "reference"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.reference);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵtwoWayProperty("lines", ctx.lines);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_14_0 = ctx.totals()) ? 19 : -1, tmp_14_0);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.busy() || !ctx.customer || !ctx.totals() || ctx.totals().total <= 0);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 22, "issueDocument"), " ");
        } }, dependencies: [i1.PageHeader, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.MaxLengthValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.HlmAlert, BusinessSelect, CrmCustomerPicker, CommercialLines, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CommercialEditorPage, [{
        type: Component,
        args: [{
                selector: 'app-commercial-editor',
                imports: [WorkspaceUi, BusinessSelect, CrmCustomerPicker, CommercialLines],
                template: ` <app-page-header title="issueDocument" description="invoicingHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', organization, 'invoicing']">{{
        'invoicing' | t
      }}</a></app-page-header
    >
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'issueDocument' | t }}</h2>
      </div>
      <form hlmCardContent class="grid gap-6" (ngSubmit)="issue()">
        <fieldset [disabled]="busy()" class="grid gap-6">
          <app-business-select
            controlId="document-kind"
            label="type"
            [options]="kinds"
            [(value)]="kind"
            [allowEmpty]="false"
            [disabled]="!!source"
          />
          <app-crm-customer-picker
            [organization]="organization"
            controlId="document-customer"
            [(value)]="customer"
          />
          <div hlmField>
            <label hlmFieldLabel for="document-reference">{{ 'reference' | t }}</label
            ><input
              hlmInput
              id="document-reference"
              name="reference"
              [(ngModel)]="reference"
              maxlength="250"
            />
          </div>
          <app-commercial-lines [(lines)]="lines" (changed)="changed()" />
          @if (totals(); as totals) {
            <div hlmAlert class="grid gap-2">
              <p>{{ 'net' | t }}: {{ i18n.currency(totals.net) }}</p>
              <p>{{ 'tax' | t }}: {{ i18n.currency(totals.tax) }}</p>
              <strong>{{ 'total' | t }}: {{ i18n.currency(totals.total) }}</strong>
            </div>
          }
          <button hlmBtn [disabled]="busy() || !customer || !totals() || totals()!.total <= 0">
            {{ 'issueDocument' | t }}
          </button>
        </fieldset>
      </form>
    </section>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CommercialEditorPage, { className: "CommercialEditorPage", filePath: "src/app/features/commercial-editor.ts", lineNumber: 68 }); })();
