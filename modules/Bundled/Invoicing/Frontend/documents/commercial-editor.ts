import { BusinessDraft } from '../../../../../src/TemplateV4.Angular/src/app/shared/business-draft';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CommercialDetail,
  CommercialDocument,
  CommercialLine,
  CommercialTotals,
} from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { WorkspaceUi } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { CrmCustomerPicker } from '../../../../../src/TemplateV4.Angular/src/app/shared/crm-customer-picker';
import { CommercialLines } from '../../../../../src/TemplateV4.Angular/src/app/shared/commercial-lines';
@Component({
  selector: 'app-commercial-editor',
  imports: [WorkspaceUi, CrmCustomerPicker, CommercialLines],
  template: ` <app-page-header [title]="title" description="invoicingHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organisation', 'invoicing', segment]">{{
        listLabel | t
      }}</a></app-page-header
    >
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ title | t }}</h2>
      </div>
      <form hlmCardContent class="grid gap-6" (ngSubmit)="issue()">
        <fieldset [disabled]="busy()" class="grid gap-6">
          <app-crm-customer-picker controlId="document-customer" [(value)]="customer" />
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
            {{ title | t }}
          </button>
        </fieldset>
      </form>
    </section>`,
})
export class CommercialEditorPage extends BusinessDraft {
  protected draftValue() {
    return {
      customer: this.customer,
      kind: this.kind,
      reference: this.reference,
      lines: this.lines,
    };
  }
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(WorkspaceApi);
  private readonly router = inject(Router);
  readonly i18n = inject(I18n);
  readonly source = this.route.snapshot.queryParamMap.get('source');
  readonly mode = this.route.snapshot.queryParamMap.get('mode');
  readonly kind = this.route.snapshot.data['kind'] as 0 | 1;
  readonly segment = this.kind === 0 ? 'quotes' : 'invoices';
  readonly listLabel = this.kind === 0 ? 'quotes' : 'invoices';
  readonly title = this.kind === 0 ? 'newQuote' : 'newInvoice';
  customer = '';
  reference = '';
  lines: CommercialLine[] = [
    { description: '', category: 1, quantity: 1, unitPrice: 0, taxTreatment: 3, taxRate: 0 },
  ];
  readonly totals = signal<CommercialTotals | null>(null);
  readonly busy = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private generation = 0;
  private key = crypto.randomUUID();
  private submitted = '';
  constructor() {
    super();
    this.markSaved();
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.generation++;
    });
    if (this.source && this.mode === 'invoice') {
      void this.router.navigate(['/organisation', 'invoicing', this.source]);
      return;
    }
    if (this.source)
      void this.api
        .get<CommercialDetail>(`organisation/invoicing/${this.source}`)
        .then((detail) => {
          this.customer = detail.document.customerId;
          this.lines = structuredClone(detail.document.snapshot.totals.lines.map((x) => x.source));
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
    if (this.lines.some((x) => !x.description.trim() || x.quantity <= 0 || x.unitPrice < 0)) return;
    this.timer = setTimeout(() => {
      void this.api
        .post<CommercialTotals>(`organisation/invoicing/preview`, {
          lines: this.lines,
        })
        .then((result) => {
          if (generation === this.generation) this.totals.set(result);
        })
        .catch(() => {
          /* The HTTP interceptor reports the error. */
        });
    }, 350);
  }
  async issue() {
    if (this.busy() || !this.totals()) return;
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
      const result = await this.api.post<CommercialDocument>(`organisation/invoicing`, {
        idempotencyKey: this.key,
        customerId: this.customer,
        kind: this.kind,
        lines: this.lines,
        origin: null,
        acceptedQuotationId: this.mode === 'invoice' ? this.source : null,
        previousRevisionId: this.mode === 'revision' ? this.source : null,
        reference: this.reference || null,
      });
      this.markSaved();
      await this.router.navigate(['/organisation', 'invoicing', result.id]);
    } finally {
      this.busy.set(false);
    }
  }
}
