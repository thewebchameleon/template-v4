import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../shared/confirmation';
import { BillingSettings } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { Resource, WorkspaceUi } from '../shared/workspace';
@Component({
  selector: 'app-billing-settings',
  imports: [HlmSelectImports, WorkspaceUi],
  template: `<app-page-header title="billingSettings" description="billingSettingsHelp" />
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (settings; as s) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'billingSettings' | t }}</h2>
          </div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <div hlmField>
              <label hlmFieldLabel for="billing-ownership">{{ 'billingOwnership' | t }}</label
              ><hlm-select name="ownership" [(ngModel)]="s.ownership"
                ><hlm-select-trigger buttonId="billing-ownership"
                  ><hlm-select-value /></hlm-select-trigger
                ><hlm-select-content *hlmSelectPortal>
                  @for (value of ['Both', 'Personal', 'Organization']; track value) {
                    <hlm-select-item [value]="value">{{ 'customer.' + value | t }}</hlm-select-item>
                  }
                </hlm-select-content></hlm-select
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="enable-stripe"
                ><hlm-checkbox id="enable-stripe" name="stripe" [(ngModel)]="s.stripeEnabled" />
                Stripe</label
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="enable-payfast"
                ><hlm-checkbox id="enable-payfast" name="payfast" [(ngModel)]="s.payFastEnabled" />
                PayFast</label
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="default-provider">{{ 'defaultPaymentProvider' | t }}</label
              ><hlm-select name="default" [(ngModel)]="s.defaultProvider"
                ><hlm-select-trigger buttonId="default-provider"
                  ><hlm-select-value /></hlm-select-trigger
                ><hlm-select-content *hlmSelectPortal
                  ><hlm-select-item value="payfast">PayFast</hlm-select-item
                  ><hlm-select-item value="stripe">Stripe</hlm-select-item></hlm-select-content
                ></hlm-select
              >
            </div>
            <div hlmField>
              <label hlmFieldLabel for="trial-days">{{ 'trialDays' | t }}</label
              ><input
                hlmInput
                id="trial-days"
                name="trial"
                type="number"
                min="0"
                max="90"
                step="1"
                required
                [(ngModel)]="s.trialDays"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="grace-days">{{ 'graceDays' | t }}</label
              ><input
                hlmInput
                id="grace-days"
                name="grace"
                type="number"
                min="0"
                max="30"
                step="1"
                required
                [(ngModel)]="s.graceDays"
              />
            </div>
            <button hlmBtn [disabled]="busy() || form.invalid">{{ 'save' | t }}</button>
          </form>
        </section>
      }
    </app-page-state>`,
})
export class BillingSettingsPage {
  readonly api = inject(WorkspaceApi);
  readonly toast = inject(Notifications);
  readonly data = new Resource<BillingSettings>();
  readonly busy = signal(false);
  settings: BillingSettings | null = null;
  hasUnsavedChanges() {
    return (
      this.busy() ||
      (this.settings != null && JSON.stringify(this.settings) !== JSON.stringify(this.data.value()))
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
    if (await this.data.load((signal) => this.api.get('configuration/billing', {}, signal)))
      this.settings = { ...this.data.value()! };
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('configuration/billing', this.settings);
      await this.load();
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
}
