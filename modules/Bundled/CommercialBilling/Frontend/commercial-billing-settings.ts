import { Component, HostListener, inject, signal } from '@angular/core';
import { CommercialBillingSettings } from '../../../../src/TemplateV4.Angular/src/app/api/models';
import { WorkspaceApi } from '../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { protectUnload } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
import { Resource, WorkspaceUi } from '../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { Notifications } from '../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';

@Component({
  selector: 'app-commercial-billing-settings',
  imports: [WorkspaceUi],
  template: `<app-page-header
      title="commercialBillingSettings"
      description="commercialBillingSettingsHelp"
    />
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()" skeleton="form-card">
      @if (settings; as value) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'commercialBillingPolicy' | t }}</h2>
          </div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
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
                [(ngModel)]="value.trialDays"
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
                [(ngModel)]="value.graceDays"
              />
            </div>
            <button hlmBtn [disabled]="busy() || form.invalid">{{ 'save' | t }}</button>
          </form>
        </section>
      }
    </app-page-state>`,
})
export class CommercialBillingSettingsPage {
  readonly api = inject(WorkspaceApi);
  readonly toast = inject(Notifications);
  readonly data = new Resource<CommercialBillingSettings>();
  readonly busy = signal(false);
  settings: CommercialBillingSettings | null = null;
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
    if (
      await this.data.load((signal) => this.api.get('configuration/commercial-billing', {}, signal))
    )
      this.settings = { ...this.data.value()! };
  }
  async save() {
    if (this.busy() || !this.settings) return;
    this.busy.set(true);
    try {
      await this.api.post('configuration/commercial-billing', this.settings);
      await this.load();
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
}
