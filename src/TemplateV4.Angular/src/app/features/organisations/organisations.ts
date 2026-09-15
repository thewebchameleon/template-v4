import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HostListener } from '@angular/core';
import { protectUnload } from '../../shared/confirmation';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FOUNDATION_FEATURES } from '../../core/feature-extensions';
import { organisationDestinations } from '../../core/destinations';
import { Features } from '../../core/features';
import { CustomerHome } from '../../api/models';
import { WorkspaceApi } from '../../core/workspace-api';
import { Notifications } from '../notifications/notifications';
import { Resource, WorkspaceUi } from '../../shared/workspace';

@Component({
  selector: 'app-organisations',
  imports: [WorkspaceUi, RouterLink],
  template: `<app-page-header
      [title]="administration ? 'organisations' : 'organisation'"
      [description]="administration ? 'organisationManagementHelp' : 'currentOrganisationHelp'"
    />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
    >
      @if (data.value(); as home) {
        <div class="grid gap-6">
          @for (
            invite of features.enabled('organisations') ? home.invitations : [];
            track invite.id
          ) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ invite.customerName }}</h2>
                <p hlmCardDescription>
                  {{ 'organisationInvitation' | t }} · {{ 'customer.' + invite.role | t }}
                </p>
              </div>
              <div hlmCardFooter>
                <button hlmBtn [disabled]="busy()" (click)="accept(invite.id)">
                  {{ 'acceptInvitation' | t }}
                </button>
              </div>
            </section>
          }
          @if (!selectableAccounts().length) {
            <div hlmAlert>
              <p hlmAlertDescription>{{ 'noOrganisations' | t }}</p>
            </div>
          }
          @for (account of selectableAccounts(); track account.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ account.name }}</h2>
                <p hlmCardDescription>
                  {{ 'customer.' + account.kind | t }} · {{ 'customer.' + account.role | t }}
                </p>
              </div>
              <div hlmCardFooter class="flex-wrap gap-2">
                @if (account.kind === 'Organisation') {
                  @if (administration) {
                    <a hlmBtn [routerLink]="['/administration/organisations', account.id]">{{
                      'openWorkspace' | t
                    }}</a>
                  } @else {
                    <button
                      hlmBtn
                      [disabled]="busy() || home.currentOrganisationId === account.id"
                      (click)="select(account.id)"
                    >
                      {{
                        (home.currentOrganisationId === account.id
                          ? 'currentOrganisation'
                          : 'selectOrganisation'
                        ) | t
                      }}
                    </button>
                  }
                } @else {
                  <a hlmBtn routerLink="/my-files">{{ 'files' | t }}</a>
                }
              </div>
            </section>
          }
          @if (administration && home.mode !== 'Personal') {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'createOrganisation' | t }}</h2>
              </div>
              <form hlmCardContent class="grid gap-4" (ngSubmit)="create()" #form="ngForm">
                <div hlmField>
                  <label hlmFieldLabel for="organisation-name">{{ 'organisationName' | t }}</label
                  ><input
                    hlmInput
                    id="organisation-name"
                    name="name"
                    [(ngModel)]="name"
                    required
                    maxlength="120"
                  />
                </div>
                <button hlmBtn [disabled]="busy() || form.invalid || !name.trim()">
                  {{ 'createOrganisation' | t }}
                </button>
              </form>
            </section>
          }
        </div>
      }
    </app-page-state>`,
})
export class OrganisationsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly administration = this.route.snapshot.data['organisationAdministration'] === true;
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly destinations = [
    ...organisationDestinations,
    ...inject(FOUNDATION_FEATURES).flatMap((feature) => feature.organisationDestinations ?? []),
  ];
  readonly moduleDestination = computed(() =>
    this.destinations.find((item) => item.path === this.params().get('module')),
  );
  readonly data = new Resource<CustomerHome>();
  readonly selectableAccounts = computed(() =>
    (this.data.value()?.accounts ?? []).filter((account) => account.kind === 'Organisation'),
  );
  readonly api = inject(WorkspaceApi);
  readonly features = inject(Features);
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
    return this.data.load((signal) =>
      this.api.get(this.administration ? 'customers/administration' : 'customers/', {}, signal),
    );
  }
  async select(id: string) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('customers/current', { organisationId: id });
      await this.load();
      this.toast.success('customerSaved');
      const destination = this.moduleDestination();
      if (destination) {
        this.busy.set(false);
        await this.router.navigate(['/organisations', id, ...destination.path.split('/')]);
      }
    } finally {
      this.busy.set(false);
    }
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
