import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { CommercialBillingSummary, PaymentCheckout } from '../../../../src/TemplateV4.Angular/src/app/api/models';
import { I18n } from '../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { WorkspaceApi } from '../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { protectUnload } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
import { Confirmations, Resource, WorkspaceUi } from '../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { Notifications } from '../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';

@Component({
  selector: 'app-commercial-billing',
  imports: [HlmSelectImports, WorkspaceUi, RouterLink],
  template: `<app-page-header title="commercialBilling" description="commercialBillingHelp"
      ><a hlmBtn variant="outline" routerLink="/organisation">{{ 'organisation' | t }}</a
      ><button hlmBtn variant="outline" [disabled]="busy()" (click)="refresh()">
        {{ 'refresh' | t }}
      </button></app-page-header
    >
    <app-page-state
      [state]="data.state()"
      [refreshError]="data.refreshError()"
      [refreshing]="data.refreshing()"
      (retry)="load()"
      skeleton="summary-cards"
    >
      @if (data.value(); as billing) {
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'billing.' + billing.state | t }}</h2>
            <p hlmCardDescription>
              {{ currentPlan(billing)?.name ?? billing.planId }} · {{ 'storageQuota' | t }}:
              {{ bytes(storageLimit(billing)) }}
            </p>
          </div>
          <div hlmCardContent class="grid gap-2">
            @if (billing.trialUntil) {
              <p>{{ 'trialEnds' | t }}: {{ i18n.date(billing.trialUntil) }}</p>
            }
            @if (billing.paidUntil) {
              <p>{{ 'paidUntil' | t }}: {{ i18n.date(billing.paidUntil) }}</p>
            }
            <p>{{ 'billingRetentionHelp' | t }}</p>
            @if (billing.canCancel) {
              <button
                hlmBtn
                variant="destructive"
                [disabled]="busy() || billing.state === 'CancellationPending'"
                (click)="cancel()"
              >
                {{ 'cancelSubscription' | t }}
              </button>
            }
          </div>
        </section>

        <div class="mb-6 grid gap-6 md:grid-cols-3">
          @for (plan of billing.plans; track plan.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ plan.name }}</h2>
                <p hlmCardDescription>{{ 'billing.' + plan.pricing | t }}</p>
              </div>
              <div hlmCardContent class="grid gap-1">
                <p>
                  {{ price(plan.price.monthlyMinor, plan.price.currency) }} /
                  {{ 'billing.month' | t }}
                </p>
                <p>
                  {{ price(plan.price.yearlyMinor, plan.price.currency) }} /
                  {{ 'billing.year' | t }}
                </p>
                <p>{{ 'storageQuota' | t }}: {{ bytes(plan.storageBytes) }}</p>
              </div>
            </section>
          }
        </div>

        @if (billing.canManage && billing.canCheckout) {
          <section hlmCard class="mb-6">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'chooseSubscription' | t }}</h2>
              <p hlmCardDescription>{{ 'checkoutHelp' | t }}</p>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="checkout()" #form="ngForm">
              <div hlmField>
                <label hlmFieldLabel for="commercial-plan">{{ 'billingPlan' | t }}</label
                ><hlm-select name="plan" [(ngModel)]="planId" required
                  ><hlm-select-trigger buttonId="commercial-plan"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal>
                    @for (plan of billing.plans; track plan.id) {
                      @if (plan.id !== 'free') {
                        <hlm-select-item [value]="plan.id">{{ plan.name }}</hlm-select-item>
                      }
                    }
                  </hlm-select-content></hlm-select
                >
              </div>
              <div hlmField>
                <label hlmFieldLabel for="commercial-interval">{{ 'billingInterval' | t }}</label
                ><hlm-select name="interval" [(ngModel)]="interval"
                  ><hlm-select-trigger buttonId="commercial-interval"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal
                    ><hlm-select-item value="month">{{ 'billing.month' | t }}</hlm-select-item
                    ><hlm-select-item value="year">{{
                      'billing.year' | t
                    }}</hlm-select-item></hlm-select-content
                  ></hlm-select
                >
              </div>
              @if (selectedPlan(billing)?.pricing === 'PerSeat') {
              <div hlmField>
                <label hlmFieldLabel for="commercial-seats">{{ 'billingSeats' | t }}</label
                ><input
                  hlmInput
                  id="commercial-seats"
                  name="seats"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  [(ngModel)]="seats"
                  required
                />
                <p hlmFieldDescription>{{ 'billingSeatsHelp' | t }}</p>
              </div>
              }
              <div hlmField>
                <label hlmFieldLabel for="commercial-provider">{{ 'paymentProvider' | t }}</label
                ><hlm-select name="provider" [(ngModel)]="provider"
                  ><hlm-select-trigger buttonId="commercial-provider"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal>
                    @if (
                      billing.paymentMethods.payFastEnabled && billing.paymentMethods.payFastReady
                    ) {
                      <hlm-select-item value="payfast">PayFast (ZAR)</hlm-select-item>
                    }
                    @if (
                      billing.paymentMethods.stripeEnabled && billing.paymentMethods.stripeReady
                    ) {
                      <hlm-select-item value="stripe">Stripe</hlm-select-item>
                    }
                  </hlm-select-content></hlm-select
                >
              </div>
              @if (!providerReady(billing)) {
                <div hlmAlert>
                  <p hlmAlertDescription>{{ 'billing.not_configured' | t }}</p>
                </div>
              }
              @if (selectedPlan(billing); as selected) {
                <div hlmAlert>
                  <p hlmAlertDescription>
                    {{ 'billingCommitment' | t }}:
                    {{ price(checkoutTotal(selected), selected.price.currency) }} /
                    {{ 'billing.' + interval | t }}
                  </p>
                </div>
              }
              <div class="flex flex-wrap gap-2">
                <button hlmBtn [disabled]="busy() || form.invalid || !providerReady(billing)">
                  {{ (billing.state === 'Pending' ? 'resumePayment' : 'continueToPayment') | t }}
                </button>
                @if (
                  billing.settings.trialDays > 0 && !billing.provider && billing.state === 'Free'
                ) {
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    [disabled]="busy() || !planId"
                    (click)="trial()"
                  >
                    {{ 'startTrial' | t }} ({{ billing.settings.trialDays }} {{ 'days' | t }})
                  </button>
                }
              </div>
            </form>
          </section>
        }

        <div class="grid gap-6 lg:grid-cols-2">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'billingEntitlements' | t }}</h2>
            </div>
            <div hlmCardContent class="grid gap-2">
              @for (item of billing.entitlements; track item.code) {
                <p>
                  {{ item.code }}: {{ item.limit }}
                  @if (item.validUntil) {
                    · {{ i18n.date(item.validUntil) }}
                  }
                </p>
              } @empty {
                <p>{{ 'none' | t }}</p>
              }
              @for (item of billing.usage; track item.code + item.periodStart) {
                <p>
                  {{ item.code }}: {{ item.code === 'storage-bytes' ? bytes(item.quantity) : item.quantity }} · {{ i18n.date(item.periodStart) }}–{{
                    i18n.date(item.periodEnd)
                  }}
                </p>
              }
            </div>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'billingHistory' | t }}</h2>
            </div>
            <div hlmCardContent class="grid gap-2">
              @for (invoice of billing.invoices; track invoice.id) {
                <p>
                  {{ invoice.number }} · {{ price(invoice.totalMinor, invoice.currency) }} ·
                  {{ invoice.state }}
                </p>
              }
              @for (receipt of billing.receipts; track receipt.provider + receipt.id) {
                <p>
                  {{ receipt.provider }} · {{ price(receipt.amountMinor, receipt.currency) }} ·
                  {{ i18n.date(receipt.settledAt) }}
                </p>
              }
              @if (billing.invoices.length === 0 && billing.receipts.length === 0) {
                <p>{{ 'none' | t }}</p>
              }
            </div>
          </section>
        </div>
      }
    </app-page-state>`,
})
export class CommercialBillingPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly confirm = inject(Confirmations);
  readonly toast = inject(Notifications);
  readonly data = new Resource<CommercialBillingSummary>();
  readonly busy = signal(false);
  planId = '';
  interval = 'month';
  provider = '';
  seats = 1;
  private baseline = '';
  private requestId: string = crypto.randomUUID();

  private selection() {
    return JSON.stringify([this.planId, this.interval, this.provider, this.seats]);
  }
  hasUnsavedChanges() {
    return this.busy() || (!!this.baseline && this.selection() !== this.baseline);
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  constructor() {
    try {
      this.requestId = sessionStorage.getItem('commercial-billing-checkout') ?? this.requestId;
    } catch {
      /* Storage may be unavailable. */
    }
    void this.load();
  }
  currentPlan(billing: CommercialBillingSummary) {
    return billing.plans.find((plan) => plan.id === billing.planId);
  }
  selectedPlan(billing: CommercialBillingSummary) {
    return billing.plans.find((plan) => plan.id === this.planId);
  }
  checkoutTotal(plan: CommercialBillingSummary['plans'][number]) {
    const unit = this.interval === 'year' ? plan.price.yearlyMinor : plan.price.monthlyMinor;
    return unit * (plan.pricing === 'PerSeat' ? this.seats : 1);
  }
  storageLimit(billing: CommercialBillingSummary) {
    return (
      billing.entitlements.find((item) => item.code === 'storage-bytes')?.limit ??
      this.currentPlan(billing)?.storageBytes ??
      0
    );
  }
  providerReady(billing: CommercialBillingSummary) {
    return this.provider === 'stripe'
      ? billing.paymentMethods.stripeEnabled && billing.paymentMethods.stripeReady
      : this.provider === 'payfast'
        ? billing.paymentMethods.payFastEnabled && billing.paymentMethods.payFastReady
        : false;
  }
  async refresh() {
    if (
      this.hasUnsavedChanges() &&
      !(await this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'))
    )
      return;
    await this.load();
  }
  async load() {
    if (await this.data.load((signal) => this.api.get('commercial-billing', {}, signal))) {
      const billing = this.data.value()!;
      if (billing.state === 'Cancelled' || (!billing.provider && billing.state === 'Free'))
        this.requestId = crypto.randomUUID();
      this.planId =
        billing.planId !== 'free'
          ? billing.planId
          : (billing.plans.find((plan) => plan.id !== 'free')?.id ?? '');
      this.interval = billing.interval ?? 'month';
      this.seats = Math.max(1, billing.seats);
      const methods = billing.paymentMethods;
      this.provider =
        billing.provider ??
        (methods.defaultProvider === 'payfast' && methods.payFastEnabled && methods.payFastReady
          ? 'payfast'
          : methods.stripeEnabled && methods.stripeReady
            ? 'stripe'
            : methods.payFastEnabled && methods.payFastReady
              ? 'payfast'
              : '');
      this.baseline = this.selection();
    }
  }
  price(minor: number, currency: string) {
    return new Intl.NumberFormat(this.i18n.culture(), { style: 'currency', currency }).format(
      minor / 100,
    );
  }
  bytes(value: number) {
    return (
      new Intl.NumberFormat(this.i18n.culture(), { maximumFractionDigits: 2 }).format(
        value / 1024 / 1024,
      ) + ' MiB'
    );
  }
  async trial() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('commercial-billing/trial', { planId: this.planId });
      await this.load();
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
  async cancel() {
    if (
      this.busy() ||
      !(await this.confirm.ask('cancelSubscription', 'cancelSubscriptionHelp', '', true))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post('commercial-billing/cancel');
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
  async checkout() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      try {
        sessionStorage.setItem('commercial-billing-checkout', this.requestId);
      } catch {
        /* The server also prevents concurrent subscriptions. */
      }
      const result = await this.api.post<PaymentCheckout>('commercial-billing/checkout', {
        planId: this.planId,
        interval: this.interval,
        provider: this.provider,
        seats: this.seats,
        requestId: this.requestId,
      });
      const url = new URL(result.url);
      if (
        url.protocol !== 'https:' ||
        !['checkout.stripe.com', 'sandbox.payfast.co.za', 'www.payfast.co.za'].includes(
          url.hostname,
        )
      )
        throw new Error('Invalid payment destination');
      this.baseline = this.selection();
      if (result.fields) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url.href;
        for (const [name, value] of Object.entries(result.fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        form.remove();
      } else window.location.assign(url.href);
    } finally {
      this.busy.set(false);
    }
  }
}
