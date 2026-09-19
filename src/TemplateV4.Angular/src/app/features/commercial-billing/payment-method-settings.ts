import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, HostListener, inject, signal } from '@angular/core';
import { PaymentMethodSettings, PaymentMethodStatus } from '../../api/models';
import { WorkspaceApi } from '../../core/workspace-api';
import { protectUnload } from '../../shared/confirmation';
import { Resource, WorkspaceUi } from '../../shared/workspace';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'app-payment-method-settings',
  imports: [HlmSelectImports, WorkspaceUi],
  template: `<app-page-header title="paymentMethods" description="paymentMethodsHelp" />
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (settings; as value) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'paymentMethods' | t }}</h2>
          </div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <div hlmField>
              <label hlmFieldLabel for="enable-stripe"
                ><hlm-checkbox id="enable-stripe" name="stripe" [(ngModel)]="value.stripeEnabled" />
                Stripe</label
              >
              <p hlmFieldDescription>
                {{
                  (data.value()?.stripeReady ? 'providerReady' : 'providerCredentialsMissing') | t
                }}
              </p>
            </div>
            <div hlmField>
              <label hlmFieldLabel for="enable-payfast"
                ><hlm-checkbox
                  id="enable-payfast"
                  name="payfast"
                  [(ngModel)]="value.payFastEnabled"
                />
                PayFast</label
              >
              <p hlmFieldDescription>
                {{
                  (data.value()?.payFastReady ? 'providerReady' : 'providerCredentialsMissing') | t
                }}
              </p>
            </div>
            <div hlmField>
              <label hlmFieldLabel for="default-provider">{{ 'defaultPaymentProvider' | t }}</label
              ><hlm-select name="default" [(ngModel)]="value.defaultProvider"
                ><hlm-select-trigger buttonId="default-provider"
                  ><hlm-select-value /></hlm-select-trigger
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
})
export class PaymentMethodSettingsPage {
  readonly api = inject(WorkspaceApi);
  readonly toast = inject(Notifications);
  readonly data = new Resource<PaymentMethodStatus>();
  readonly busy = signal(false);
  settings: PaymentMethodSettings | null = null;
  hasUnsavedChanges() {
    if (!this.settings) return this.busy();
    const original = this.data.value();
    return (
      this.busy() ||
      !original ||
      this.settings.stripeEnabled !== original.stripeEnabled ||
      this.settings.payFastEnabled !== original.payFastEnabled ||
      this.settings.defaultProvider !== original.defaultProvider
    );
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  constructor() {
    void this.load();
  }
  async load() {
    if (
      await this.data.load((signal) => this.api.get('configuration/payment-methods', {}, signal))
    ) {
      const value = this.data.value()!;
      this.settings = {
        stripeEnabled: value.stripeEnabled,
        payFastEnabled: value.payFastEnabled,
        defaultProvider: value.defaultProvider,
        version: value.version,
      };
    }
  }
  async save() {
    if (this.busy() || !this.settings) return;
    this.busy.set(true);
    try {
      await this.api.post('configuration/payment-methods', this.settings);
      await this.load();
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
}
