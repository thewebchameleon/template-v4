import { Component, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../shared/confirmation';
import { RouterLink } from '@angular/router';
import { CustomerHome } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { Resource, WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-organizations',
  imports: [WorkspaceUi, RouterLink],
  template: `<app-page-header title="organizations" description="organizationsHelp" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
    >
      @if (data.value(); as home) {
        <div class="grid gap-6">
          @for (invite of home.invitations; track invite.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ invite.customerName }}</h2>
                <p hlmCardDescription>
                  {{ 'organizationInvitation' | t }} · {{ 'customer.' + invite.role | t }}
                </p>
              </div>
              <div hlmCardFooter>
                <button hlmBtn [disabled]="busy()" (click)="accept(invite.id)">
                  {{ 'acceptInvitation' | t }}
                </button>
              </div>
            </section>
          }
          @for (account of home.accounts; track account.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ account.name }}</h2>
                <p hlmCardDescription>
                  {{ 'customer.' + account.kind | t }} · {{ 'customer.' + account.role | t }}
                </p>
              </div>
              <div hlmCardFooter class="flex-wrap gap-2">
                @if (account.kind === 'Organization') {
                  <a hlmBtn [routerLink]="['/organizations', account.id]">{{
                    'openWorkspace' | t
                  }}</a>
                } @else {
                  <a hlmBtn routerLink="/files">{{ 'files' | t }}</a>
                }
                <a
                  hlmBtn
                  variant="outline"
                  [routerLink]="['/organizations', account.id, 'billing']"
                  >{{ 'billing' | t }}</a
                >
              </div>
            </section>
          }
          @if (home.mode !== 'Personal') {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'createOrganization' | t }}</h2>
              </div>
              <form hlmCardContent class="grid gap-4" (ngSubmit)="create()" #form="ngForm">
                <div hlmField>
                  <label hlmFieldLabel for="organization-name">{{ 'organizationName' | t }}</label
                  ><input
                    hlmInput
                    id="organization-name"
                    name="name"
                    [(ngModel)]="name"
                    required
                    maxlength="120"
                  />
                </div>
                <button hlmBtn [disabled]="busy() || form.invalid || !name.trim()">
                  {{ 'createOrganization' | t }}
                </button>
              </form>
            </section>
          }
        </div>
      }
    </app-page-state>`,
})
export class OrganizationsPage {
  readonly data = new Resource<CustomerHome>();
  readonly api = inject(WorkspaceApi);
  readonly toast = inject(Notifications);
  readonly busy = signal(false);
  name = '';
  hasUnsavedChanges() {
    return this.busy() || !!this.name.trim();
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  constructor() {
    void this.load();
  }
  load() {
    return this.data.load((signal) => this.api.get('customers/', {}, signal));
  }
  async create() {
    if (this.busy() || !this.name.trim()) return;
    this.busy.set(true);
    try {
      await this.api.post('customers/', { name: this.name });
      this.name = '';
      await this.load();
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
  async accept(id: string) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`customers/invitations/${id}/accept`);
      await this.load();
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
}
