import { RecordAttachments } from '../../../shared/record-attachments';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommercialDetail } from '../../../api/models';
import { WorkspaceApi } from '../../../core/workspace-api';
import { I18n } from '../../../core/i18n';
import { Features } from '../../../core/features';
import { Auth } from '../../../core/auth';
import { WorkspaceUi, Resource } from '../../../shared/workspace';
import { BusinessSelect } from '../../../shared/business-select';
import { BusinessDate } from '../../../shared/business-date';
import { commercialKinds } from './invoicing';

@Component({
  selector: 'app-commercial-detail',
  imports: [RecordAttachments, WorkspaceUi, BusinessSelect, BusinessDate],
  template: ` <app-page-header title="invoicing" description="immutableDocument"
      ><a hlmBtn variant="outline" [routerLink]="['/organisations', organisation, 'invoicing']">{{
        'invoicing' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (data.value(); as detail) {
        @let doc = detail.document;
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ doc.number }} — {{ kinds[doc.kind] | t }}</h2>
            <p hlmCardDescription>{{ i18n.date(doc.issuedAt) }}</p>
          </div>
          <div hlmCardContent class="grid gap-5">
            <div class="flex flex-wrap gap-3">
              <button hlmBtn variant="outline" (click)="download()">
                {{ 'download' | t }} PDF
              </button>
              @if (features.enabled('invoicing-files')) {
                <button hlmBtn variant="outline" [disabled]="busy()" (click)="storePdf()">
                  {{ 'storePdf' | t }}
                </button>
              }
              @if (doc.kind === 0 && auth.has('invoicing.issue')) {
                @if (doc.accepted) {
                  <button hlmBtn [disabled]="busy()" (click)="invoiceAccepted()">
                    {{ 'invoiceQuotation' | t }}
                  </button>
                } @else if (features.enabled('invoicing') && !doc.origin) {
                  <a
                    hlmBtn
                    variant="outline"
                    [routerLink]="['/organisations', organisation, 'invoicing', 'new']"
                    [queryParams]="{ source: doc.id, mode: 'revision' }"
                    >{{ 'reviseQuotation' | t }}</a
                  >
                }
              }
            </div>
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <h3 class="font-semibold">{{ doc.snapshot.issuer.name }}</h3>
                <p class="whitespace-pre-wrap">{{ doc.snapshot.issuer.address }}</p>
                <p>{{ doc.snapshot.issuer.contact }}</p>
                @if (doc.snapshot.issuer.vatRegistered) {
                  <p>{{ 'vatNumber' | t }}: {{ doc.snapshot.issuer.vatNumber }}</p>
                }
              </div>
              <div>
                <h3 class="font-semibold">{{ 'billTo' | t }}: {{ doc.snapshot.customer.name }}</h3>
                <p class="whitespace-pre-wrap">{{ doc.snapshot.customer.address }}</p>
                <p>{{ doc.snapshot.customer.email }}</p>
              </div>
            </div>
            <ol class="divide-y">
              @for (line of doc.snapshot.totals.lines; track $index) {
                <li class="grid gap-2 py-4 sm:grid-cols-2">
                  <div>
                    <p class="font-medium break-words">{{ line.source.description }}</p>
                    <p class="text-muted-foreground">
                      {{ 'quantity' | t }}: {{ i18n.number(line.source.quantity) }} ×
                      {{ i18n.currency(line.source.unitPrice) }}
                    </p>
                  </div>
                  <div class="sm:text-right">
                    <p>{{ 'tax' | t }}: {{ i18n.currency(line.tax) }}</p>
                    <p>{{ i18n.currency(line.total) }}</p>
                  </div>
                </li>
              }
            </ol>
            <dl class="grid gap-3 sm:grid-cols-2">
              <dt>{{ 'total' | t }}</dt>
              <dd class="font-semibold">{{ i18n.currency(doc.amount) }}</dd>
              <dt>{{ 'credits' | t }}</dt>
              <dd>{{ i18n.currency(doc.credits) }}</dd>
              <dt>{{ 'paid' | t }}</dt>
              <dd>{{ i18n.currency(doc.paid) }}</dd>
              <dt>{{ 'refunded' | t }}</dt>
              <dd>{{ i18n.currency(doc.refunded) }}</dd>
              @if (doc.kind === 1) {
                <dt>{{ 'outstanding' | t }}</dt>
                <dd class="font-semibold">{{ i18n.currency(outstanding()) }}</dd>
              }
            </dl>
            <p class="whitespace-pre-wrap">{{ doc.snapshot.issuer.paymentInstructions }}</p>
          </div>
        </section>
        @if (
          doc.kind === 0 &&
          !doc.accepted &&
          features.enabled('invoicing') &&
          auth.has('invoicing.issue')
        ) {
          <section hlmCard class="mb-6">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'acceptQuotation' | t }}</h2>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="accept()">
              <div hlmField>
                <label hlmFieldLabel for="acceptance-reference">{{ 'reference' | t }}</label
                ><input
                  hlmInput
                  id="acceptance-reference"
                  name="acceptance"
                  [(ngModel)]="acceptance"
                  required
                  maxlength="1000"
                />
              </div>
              <button hlmBtn [disabled]="busy() || !acceptance.trim()">
                {{ 'acceptQuotation' | t }}
              </button>
            </form>
          </section>
        }
        @if (doc.kind === 1 && (auth.has('invoicing.settle') || auth.has('invoicing.correct'))) {
          <section hlmCard class="mb-6">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'invoicing' | t }}</h2>
            </div>
            <div hlmCardContent class="grid gap-5">
              <div class="flex flex-wrap gap-3">
                @if (auth.has('invoicing.settle')) {
                  <button
                    hlmBtn
                    [disabled]="busy() || outstanding() <= 0 || doc.paid > 0"
                    (click)="begin('payment')"
                  >
                    {{ 'recordPayment' | t }}
                  </button>
                }
                @if (auth.has('invoicing.correct')) {
                  <button
                    hlmBtn
                    variant="outline"
                    [disabled]="busy() || doc.credits >= doc.amount"
                    (click)="begin('credit')"
                  >
                    {{ 'recordCredit' | t }}</button
                  ><button
                    hlmBtn
                    variant="outline"
                    [disabled]="busy() || refundable() <= 0"
                    (click)="begin('refund')"
                  >
                    {{ 'recordRefund' | t }}
                  </button>
                }
              </div>
              @if (action) {
                <form class="grid gap-4" (ngSubmit)="record()">
                  <div hlmField>
                    <label hlmFieldLabel for="financial-amount">{{ 'amount' | t }}</label
                    ><input
                      hlmInput
                      id="financial-amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      [(ngModel)]="amount"
                      [readonly]="action === 'payment'"
                      required
                    />
                  </div>
                  <app-business-select
                    controlId="financial-method"
                    label="paymentMethod"
                    [options]="methods"
                    [allowEmpty]="false"
                    [(value)]="method"
                  />
                  <app-business-date controlId="financial-date" label="date" [(value)]="date" />
                  <div hlmField>
                    <label hlmFieldLabel for="financial-reference">{{ 'reference' | t }}</label
                    ><input
                      hlmInput
                      id="financial-reference"
                      name="reference"
                      [(ngModel)]="reference"
                      maxlength="250"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="financial-reason">{{ 'reason' | t }}</label
                    ><input
                      hlmInput
                      id="financial-reason"
                      name="reason"
                      [(ngModel)]="reason"
                      maxlength="1000"
                      [required]="action !== 'payment'"
                    />
                  </div>
                  @if (action === 'credit') {
                    <p hlmFieldDescription>{{ 'creditAllocationHelp' | t }}</p>
                  }
                  <button
                    hlmBtn
                    [disabled]="
                      busy() || amount <= 0 || !date || (action !== 'payment' && !reason.trim())
                    "
                  >
                    {{
                      (action === 'payment'
                        ? 'recordPayment'
                        : action === 'credit'
                          ? 'recordCredit'
                          : 'recordRefund'
                      ) | t
                    }}
                  </button>
                </form>
              }
            </div>
          </section>
        }
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'history' | t }}</h2>
          </div>
          <div hlmCardContent class="grid gap-4">
            @for (entry of detail.entries; track entry.id) {
              <article class="border-b pb-3">
                <p class="font-medium">{{ entry.kind }} — {{ i18n.currency(entry.amount) }}</p>
                <p>{{ entry.reference }} {{ entry.reason }}</p>
                <small>{{ i18n.date(entry.at) }}</small>
              </article>
            }
            @for (related of detail.related; track related.id) {
              <a
                hlmBtn
                variant="outline"
                [routerLink]="['/organisations', organisation, 'invoicing', related.id]"
                >{{ related.number }} — {{ kinds[related.kind] | t }}</a
              >
            }
          </div>
        </section>
        @if (features.enabled('invoicing-files')) {
          <app-record-attachments
            [organisation]="organisation"
            [record]="documentId"
            kind="invoicing"
          />
        }
      }
    </app-page-state>`,
})
export class CommercialDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly features = inject(Features);
  readonly auth = inject(Auth);
  readonly organisation = this.route.snapshot.paramMap.get('id')!;
  readonly documentId = this.route.snapshot.paramMap.get('documentId')!;
  readonly data = new Resource<CommercialDetail>();
  readonly busy = signal(false);
  readonly kinds = commercialKinds;
  readonly methods = [
    { id: '0', label: 'cash' },
    { id: '1', label: 'eft' },
    { id: '2', label: 'card' },
  ];
  action = '';
  method = '1';
  amount = 0;
  reason = '';
  reference = '';
  date: string | null = new Date().toLocaleDateString('en-CA');
  acceptance = '';
  private key = crypto.randomUUID();
  private submitted = '';
  constructor() {
    void this.load();
  }
  async load() {
    await this.data.load((signal) =>
      this.api.get(`organisations/${this.organisation}/invoicing/${this.documentId}`, {}, signal),
    );
  }
  outstanding() {
    const d = this.data.value()?.document;
    return d ? Math.max(0, d.amount - d.credits - d.paid) : 0;
  }
  refundable() {
    const d = this.data.value()?.document;
    return d ? Math.max(0, d.paid - (d.amount - d.credits) - d.refunded) : 0;
  }
  begin(action: string) {
    this.action = action;
    this.amount =
      action === 'payment' ? this.outstanding() : action === 'refund' ? this.refundable() : 0;
    this.reason = '';
    this.reference = '';
    this.key = crypto.randomUUID();
    this.submitted = '';
  }
  async storePdf() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(
        `organisations/${this.organisation}/invoicing/${this.documentId}/store-pdf`,
      );
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
  async download() {
    const d = this.data.value()?.document;
    if (d)
      await this.api.download(
        `organisations/${this.organisation}/invoicing/${d.id}/pdf`,
        d.number + '.pdf',
      );
  }
  async accept() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(
        `organisations/${this.organisation}/invoicing/${this.documentId}/accept`,
        { version: this.data.value()!.document.version, reference: this.acceptance },
      );
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
  async invoiceAccepted() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const result = await this.api.post<{ id: string }>(
        `organisations/${this.organisation}/invoicing/${this.documentId}/invoice?idempotencyKey=${this.key}`,
      );
      await this.router.navigate(['/organisations', this.organisation, 'invoicing', result.id]);
    } finally {
      this.busy.set(false);
    }
  }
  async record() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const payload = {
        version: this.data.value()!.document.version,
        amount: this.amount,
        reason: this.reason,
        method: Number(this.method),
        date: this.date,
        reference: this.reference || null,
      };
      const fingerprint = JSON.stringify({ action: this.action, ...payload });
      if (this.submitted && this.submitted !== fingerprint) this.key = crypto.randomUUID();
      this.submitted = fingerprint;
      await this.api.post(
        `organisations/${this.organisation}/invoicing/${this.documentId}/${this.action}`,
        { idempotencyKey: this.key, ...payload },
      );
      this.action = '';
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
}
