import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingSummary, CheckoutResponse } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { Resource, WorkspaceUi, Confirmations } from '../shared/workspace';

@Component({
  selector: 'app-billing',
  imports: [HlmSelectImports, WorkspaceUi, RouterLink],
  template: `<app-page-header title="billing" description="billingHelp"
      ><a hlmBtn variant="outline" routerLink="/organizations">{{ 'switchAccount' | t }}</a
      ><button hlmBtn variant="outline" [disabled]="busy()" (click)="load()">
        {{ 'refresh' | t }}
      </button></app-page-header
    >
    <app-page-state
      [state]="data.state()"
      [refreshError]="data.refreshError()"
      [refreshing]="data.refreshing()"
      (retry)="load()"
    >
      @if (data.value(); as billing) {
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'billing.' + billing.state | t }}</h2>
            <p hlmCardDescription>
              {{ billing.planId }} · {{ 'storageQuota' | t }}: {{ bytes(billing.storageBytes) }}
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
            @if (billing.canManage && billing.state !== 'Free' && billing.state !== 'Cancelled') {
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
        <div class="grid gap-6 md:grid-cols-3 mb-6">
          @for (plan of billing.plans; track plan.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ plan.name }}</h2>
                <p hlmCardDescription>{{ 'billing.' + plan.pricing | t }}</p>
              </div>
              <div hlmCardContent>
                <p>{{ price(plan.monthlyMinor, plan.currency) }} / {{ 'billing.month' | t }}</p>
                <p>{{ price(plan.yearlyMinor, plan.currency) }} / {{ 'billing.year' | t }}</p>
                <p>{{ 'storageQuota' | t }}: {{ bytes(plan.storageBytes) }}</p>
              </div>
            </section>
          }
        </div>
        @if (billing.canManage && billing.canCheckout) {
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'chooseSubscription' | t }}</h2>
              <p hlmCardDescription>{{ 'checkoutHelp' | t }}</p>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="checkout()" #form="ngForm">
              <div hlmField>
                <label hlmFieldLabel for="billing-plan">{{ 'billingPlan' | t }}</label
                ><hlm-select name="plan" [(ngModel)]="planId" required
                  ><hlm-select-trigger id="billing-plan"><hlm-select-value /></hlm-select-trigger
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
                <label hlmFieldLabel for="billing-interval">{{ 'billingInterval' | t }}</label
                ><hlm-select name="interval" [(ngModel)]="interval"
                  ><hlm-select-trigger id="billing-interval"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal
                    ><hlm-select-item value="month">{{ 'billing.month' | t }}</hlm-select-item
                    ><hlm-select-item value="year">{{
                      'billing.year' | t
                    }}</hlm-select-item></hlm-select-content
                  ></hlm-select
                >
              </div>
              <div hlmField>
                <label hlmFieldLabel for="billing-seats">{{ 'billingSeats' | t }}</label
                ><input
                  hlmInput
                  id="billing-seats"
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
              <div hlmField>
                <label hlmFieldLabel for="billing-provider">{{ 'paymentProvider' | t }}</label
                ><hlm-select name="provider" [(ngModel)]="provider"
                  ><hlm-select-trigger id="billing-provider"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal>
                    @if (billing.settings.payFastEnabled) {
                      <hlm-select-item value="payfast">PayFast (ZAR)</hlm-select-item>
                    }
                    @if (billing.settings.stripeEnabled) {
                      <hlm-select-item value="stripe">Stripe</hlm-select-item>
                    }
                  </hlm-select-content></hlm-select
                >
              </div>
              @if (!billing.settings.stripeEnabled && !billing.settings.payFastEnabled) {
                <div hlmAlert>
                  <p hlmAlertDescription>{{ 'billing.not_configured' | t }}</p>
                </div>
              }
              <div class="flex flex-wrap gap-2">
                <button hlmBtn [disabled]="busy() || form.invalid || !provider">
                  {{ 'continueToPayment' | t }}
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
      }
    </app-page-state>`,
})
export class BillingPage {
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly confirm = inject(Confirmations);
  readonly toast = inject(Notifications);
  readonly data = new Resource<BillingSummary>();
  readonly busy = signal(false);
  planId = '';
  interval = 'month';
  provider = '';
  seats = 1;
  private requestId: string = crypto.randomUUID();
  constructor() {
    try {
      this.requestId = sessionStorage.getItem('billing-checkout-' + this.id) ?? this.requestId;
    } catch {
      /* Storage may be unavailable. */
    }
    void this.load();
  }
  async load() {
    if (
      await this.data.load((signal) => this.api.get(`customers/${this.id}/billing`, {}, signal))
    ) {
      const b = this.data.value()!;
      if (b.state === 'Cancelled' || (!b.provider && b.state === 'Free'))
        this.requestId = crypto.randomUUID();
      this.planId =
        b.planId !== 'free' ? b.planId : (b.plans.find((p) => p.id !== 'free')?.id ?? '');
      this.interval = b.interval ?? 'month';
      this.seats = Math.max(1, b.seats);
      this.provider =
        b.provider ??
        (b.settings.defaultProvider === 'payfast' && b.settings.payFastEnabled
          ? 'payfast'
          : b.settings.stripeEnabled
            ? 'stripe'
            : b.settings.payFastEnabled
              ? 'payfast'
              : '');
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
      await this.api.post(`customers/${this.id}/billing/trial`, { planId: this.planId });
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
      await this.api.post(`customers/${this.id}/billing/cancel`);
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
        sessionStorage.setItem('billing-checkout-' + this.id, this.requestId);
      } catch {
        /* The server also prevents concurrent subscriptions. */
      }
      const result = await this.api.post<CheckoutResponse>(
        `customers/${this.id}/billing/checkout`,
        {
          planId: this.planId,
          interval: this.interval,
          provider: this.provider,
          seats: this.seats,
          requestId: this.requestId,
        },
      );
      const url = new URL(result.url);
      if (
        url.protocol !== 'https:' ||
        !['checkout.stripe.com', 'sandbox.payfast.co.za', 'www.payfast.co.za'].includes(
          url.hostname,
        )
      )
        throw new Error('Invalid payment destination');
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
