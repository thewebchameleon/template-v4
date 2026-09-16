import { Component, HostListener, inject, signal } from '@angular/core';
import { CustomerInfo } from '../../api/models';
import { WorkspaceApi } from '../../core/workspace-api';
import { Notifications } from '../notifications/notifications';
import { protectUnload } from '../../shared/confirmation';
import { Resource, WorkspaceUi } from '../../shared/workspace';

@Component({
  selector: 'app-organisation-detail',
  imports: [WorkspaceUi],
  template: `<app-page-header title="organisation" description="organisationManagementHelp" />
    <app-page-state [state]="home.state()" [refreshError]="home.refreshError()" (retry)="load()">
      @if (home.value(); as organisation) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'organisationName' | t }}</h2>
          </div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <div hlmField>
              <label hlmFieldLabel for="organisation-name">{{ 'organisationName' | t }}</label>
              <input
                hlmInput
                id="organisation-name"
                name="name"
                [(ngModel)]="name"
                required
                maxlength="120"
                [readonly]="!organisation.canManage"
              />
            </div>
            @if (organisation.canManage) {
              <button hlmBtn [disabled]="busy() || form.invalid || !name.trim()">
                {{ 'save' | t }}
              </button>
            }
          </form>
        </section>
      }
    </app-page-state>`,
})
export class OrganisationDetailPage {
  readonly home = new Resource<CustomerInfo>();
  readonly busy = signal(false);
  private readonly api = inject(WorkspaceApi);
  private readonly toast = inject(Notifications);
  name = '';
  constructor() {
    void this.load();
  }
  hasUnsavedChanges() {
    return this.busy() || (!!this.home.value() && this.name !== this.home.value()!.name);
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async load() {
    const dirty = this.hasUnsavedChanges();
    if (await this.home.load((signal) => this.api.get('organisation/', {}, signal)))
      if (!dirty) this.name = this.home.value()!.name;
  }
  async save() {
    if (this.busy() || !this.name.trim() || !this.home.value()?.canManage) return;
    this.busy.set(true);
    try {
      await this.api.post('organisation/rename', {
        name: this.name,
        version: this.home.value()!.version,
      });
      if (await this.home.load((signal) => this.api.get('organisation/', {}, signal)))
        this.name = this.home.value()!.name;
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
}
