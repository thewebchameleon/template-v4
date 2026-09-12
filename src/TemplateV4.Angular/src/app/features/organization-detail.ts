import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { CustomerHome, CustomerMember, PageOfCustomerMember } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import {
  Resource,
  WorkspaceUi,
  ListQuery,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  Confirmations,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RowActions } from '../shared/workspace-cells';

const column = createColumnHelper<DataTableFeatures, CustomerMember>();
@Component({
  selector: 'app-organization-detail',
  imports: [HlmSelectImports, WorkspaceUi, RouterLink, DataTable],
  template: `<app-page-header title="organizationWorkspace" description="organizationWorkspaceHelp"
      ><a hlmBtn variant="outline" routerLink="/organizations">{{ 'switchAccount' | t }}</a
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', id, 'files']">{{
        'files' | t
      }}</a
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', id, 'billing']">{{
        'billing' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="home.state()" [refreshError]="home.refreshError()" (retry)="reload()">
      @if (account(); as account) {
        <h2 class="page-title mb-6">{{ account.name }}</h2>
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'organizationMembers' | t }}</h2>
            <p hlmCardDescription>{{ 'customer.' + account.role | t }}</p>
          </div>
          <div hlmCardContent>
            <app-page-state
              [state]="members.state()"
              [refreshError]="members.refreshError()"
              (retry)="loadMembers()"
            >
              <app-data-table
                [columns]="columns()"
                [data]="members.value()?.items ?? []"
                [loading]="members.refreshing()"
                [emptyText]="'noResults' | t"
                [loadingText]="'loading' | t"
                [sortColumn]="query.text('sort', 'name')"
                [sortDirection]="query.direction('asc')"
                (sortChange)="sort($event)"
              />
              <app-list-pager
                [total]="members.value()?.total ?? 0"
                [page]="query.page"
                [size]="pageSize()"
                [showSizePicker]="true"
                (pageChange)="query.set({ page: $event })"
                (sizeChange)="query.set({ size: $event, page: 1 })"
              />
            </app-page-state>
          </div>
        </section>
        @if (account.role !== 'Member') {
          <section hlmCard class="mb-6">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'inviteMember' | t }}</h2>
              <p hlmCardDescription>{{ 'inviteMemberHelp' | t }}</p>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="invite()" #inviteForm="ngForm">
              <div hlmField>
                <label hlmFieldLabel for="member-email">{{ 'email' | t }}</label
                ><input
                  hlmInput
                  type="email"
                  email
                  id="member-email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  maxlength="256"
                />
              </div>
              <div hlmField>
                <label hlmFieldLabel for="member-role">{{ 'role' | t }}</label
                ><hlm-select name="role" [(ngModel)]="role"
                  ><hlm-select-trigger id="member-role"><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal
                    ><hlm-select-item value="Member">{{ 'customer.Member' | t }}</hlm-select-item>
                    @if (account.role === 'Owner') {
                      <hlm-select-item value="Admin">{{ 'customer.Admin' | t }}</hlm-select-item>
                    }
                  </hlm-select-content></hlm-select
                >
              </div>
              <button hlmBtn [disabled]="busy() || inviteForm.invalid">
                {{ 'inviteMember' | t }}
              </button>
            </form>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'organizationName' | t }}</h2>
            </div>
            <form hlmCardContent class="grid gap-4" (ngSubmit)="rename()" #renameForm="ngForm">
              <div hlmField>
                <label hlmFieldLabel for="rename-organization">{{ 'organizationName' | t }}</label
                ><input
                  hlmInput
                  id="rename-organization"
                  name="name"
                  [(ngModel)]="name"
                  required
                  maxlength="120"
                />
              </div>
              <button hlmBtn [disabled]="busy() || renameForm.invalid || !name.trim()">
                {{ 'save' | t }}
              </button>
            </form>
          </section>
        }
      } @else {
        <div hlmAlert>
          <p hlmAlertDescription>{{ 'customers.not_found' | t }}</p>
        </div>
      }
    </app-page-state>`,
})
export class OrganizationDetailPage {
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly home = new Resource<CustomerHome>();
  readonly members = new Resource<PageOfCustomerMember>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  readonly account = computed(() => this.home.value()?.accounts.find((a) => a.id === this.id));
  email = '';
  role = 'Member';
  name = '';
  readonly columns = computed(() => {
    this.i18n.culture();
    const owner = this.account()?.role === 'Owner';
    const manager = owner || this.account()?.role === 'Admin';
    return column.columns([
      column.accessor('name', { header: this.i18n.text('name') }),
      column.accessor('email', { header: this.i18n.text('email') }),
      column.accessor('role', {
        header: this.i18n.text('role'),
        cell: (c) => this.i18n.text('customer.' + c.getValue()),
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions:
                row.original.role === 'Owner'
                  ? []
                  : [
                      ...(owner
                        ? [
                            {
                              label: row.original.role === 'Admin' ? 'makeMember' : 'makeAdmin',
                              run: () => void this.change(row.original, 'role'),
                            },
                            {
                              label: 'transferOwnership',
                              run: () => void this.change(row.original, 'transfer'),
                            },
                          ]
                        : []),
                      ...(manager && (owner || row.original.role === 'Member')
                        ? [
                            {
                              label: 'remove',
                              destructive: true,
                              run: () => void this.change(row.original, 'remove'),
                            },
                          ]
                        : []),
                    ].map((a) => ({ ...a, disabled: this.busy() })),
            },
          }),
      }),
    ]);
  });
  constructor() {
    void this.reload();
    this.query.connect(() => void this.loadMembers());
  }
  async reload() {
    if (await this.home.load((signal) => this.api.get('customers/', {}, signal)))
      this.name = this.account()?.name ?? '';
  }
  pageSize() {
    const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
  }
  async loadMembers() {
    if (
      await this.members.load((signal) =>
        this.api.get(
          `customers/${this.id}/members`,
          {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            sort: this.query.text('sort', 'name'),
            direction: this.query.direction('asc'),
          },
          signal,
        ),
      )
    )
      this.query.clamp(this.members.value()?.total, this.pageSize());
  }
  sort(s: ServerSort) {
    void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
  }
  async run(path: string, body: unknown) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`customers/${this.id}/${path}`, body);
      await this.reload();
      await this.loadMembers();
      this.toast.success('customerSaved');
    } finally {
      this.busy.set(false);
    }
  }
  async invite() {
    await this.run('invite', { email: this.email, role: this.role });
  }
  async rename() {
    await this.run('rename', { name: this.name, version: this.account()?.version });
  }
  async change(member: CustomerMember, action: string) {
    if (
      !(await this.confirm.ask(
        'confirmCustomerChange',
        'confirmCustomerChangeHelp',
        member.name,
        action === 'remove',
      ))
    )
      return;
    await this.run(action === 'transfer' ? 'transfer' : `members/${action}`, {
      userId: member.userId,
      version: this.account()?.version,
      role: member.role === 'Admin' ? 'Member' : 'Admin',
    });
  }
}
