import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  Confirmations,
} from '../shared/workspace';
import { DataTable, DataTableFeatures } from '../shared/data-table';
import { RecordIdentity, RecordStatus, RowActions } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { InvitationItem, PageOfInvitationItem } from '../api/models';
const column = createColumnHelper<DataTableFeatures, InvitationItem>();
@Component({
  selector: 'app-invitations',
  imports: [WorkspaceUi, DataTable],
  providers: [workspaceIcons],
  template: ` <app-page-header
      eyebrow="administration"
      title="invitations"
      description="invitationsIntro"
      ><a hlmBtn routerLink="/users"
        ><ng-icon name="lucideMail" />{{ 'invite' | t }}</a
      ></app-page-header
    >
    <div class="workspace-columns">
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'invitationLifecycle' | t }}</h2>
          <p hlmCardDescription>{{ 'invitationLifecycleHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <form
            class="workspace-toolbar"
            (ngSubmit)="query.set({ search: search || null, page: 1 })"
          >
            <div hlmField>
              <label hlmFieldLabel for="invitation-search">{{ 'search' | t }}</label
              ><input
                hlmInput
                id="invitation-search"
                name="search"
                [(ngModel)]="search"
                maxlength="120"
                [placeholder]="'peopleSearch' | t"
              />
            </div>
            <button hlmBtn variant="outline">{{ 'search' | t }}</button>
          </form>
          <hlm-toggle-group
            type="single"
            variant="outline"
            [nullable]="false"
            [value]="query.text('state', 'all')"
            (valueChange)="filter($event)"
            [attr.aria-label]="'status' | t"
            class="mb-5 flex-wrap"
          >
            @for (state of states; track state) {
              <button hlmToggleGroupItem [value]="state">{{ state | t }}</button>
            }
          </hlm-toggle-group>
          <app-page-state [state]="data.state()" (retry)="load()"
            ><app-data-table
              [columns]="columns()"
              [data]="data.value()?.items ?? []"
              [emptyText]="'invitationsEmpty' | t" /><app-list-pager
              [total]="data.value()?.total ?? 0"
              [page]="query.page"
              (pageChange)="query.set({ page: $event })"
          /></app-page-state>
        </div>
      </section>
      <aside hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'onboardingSteps' | t }}</h2>
          <p hlmCardDescription>{{ 'onboardingStepsHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <ol class="grid gap-5">
            @for (step of steps; track step; let index = $index) {
              <li class="flex gap-3">
                <span class="workspace-icon">{{ index + 1 }}</span>
                <div>
                  <p class="font-medium">{{ step | t }}</p>
                  <p class="workspace-meta mt-1">{{ step + 'Help' | t }}</p>
                </div>
              </li>
            }
          </ol>
        </div>
        <div hlmCardFooter>
          <p class="workspace-meta">{{ 'invitationExpiryHelp' | t }}</p>
        </div>
      </aside>
    </div>`,
})
export class InvitationsPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly data = new Resource<PageOfInvitationItem>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  readonly now = signal(Date.now());
  search = '';
  readonly states = ['all', 'Pending', 'Expired', 'Accepted', 'Revoked'];
  readonly steps = ['onboardingInvited', 'onboardingVerified', 'onboardingReady'];
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    const now = this.now();
    return column.columns([
      column.accessor('displayName', {
        header: this.i18n.text('person'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.displayName,
              description: row.original.email,
              link: '/audit',
              params: { subjectId: row.original.id },
            },
          }),
      }),
      column.accessor('state', {
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: row.original.state, danger: row.original.state === 'Expired' },
          }),
      }),
      column.display({
        id: 'progress',
        header: this.i18n.text('onboardingProgress'),
        cell: ({ row }) =>
          this.i18n.text(
            row.original.state === 'Accepted'
              ? 'onboardingReady'
              : row.original.emailConfirmed
                ? 'setPasswordStep'
                : 'verifyEmailStep',
          ),
      }),
      column.accessor('sentAt', {
        header: this.i18n.text('lastSent'),
        cell: (c) => (c.getValue() ? this.i18n.date(c.getValue()!) : this.i18n.text('notRecorded')),
      }),
      column.display({
        id: 'actions',
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions: ['Pending', 'Expired'].includes(row.original.state)
                ? [
                    {
                      label:
                        row.original.resendAt && Date.parse(row.original.resendAt) > now
                          ? 'resendCooldown'
                          : 'resendInvitation',
                      disabled:
                        busy ||
                        (!!row.original.resendAt && Date.parse(row.original.resendAt) > now),
                      run: () => void this.act(row.original, false),
                    },
                    {
                      label: 'revoke',
                      disabled: busy,
                      destructive: true,
                      run: () => void this.act(row.original, true),
                    },
                  ]
                : [],
            },
          }),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => {
      this.search = this.query.text('search');
      void this.load();
    });
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  load() {
    return this.data.load(() =>
      this.api.get('invitations', {
        pageNumber: this.query.page,
        search: this.query.text('search'),
        state: this.query.text('state', 'all'),
      }),
    );
  }
  filter(value: unknown) {
    if (typeof value === 'string' && this.states.includes(value))
      void this.query.set({ state: value, page: 1 });
  }
  async act(item: InvitationItem, cancel: boolean) {
    if (
      this.busy() ||
      (cancel &&
        !(await this.confirm.ask(
          'revokeInvitationTitle',
          'revokeInvitationHelp',
          item.email,
          true,
        )))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post('invitations', { userId: item.id, cancel });
      this.toast.success(cancel ? 'invitationCancelled' : 'invitationSent');
      await this.load();
    } catch {
      /* Central notification preserves server feedback. */
    } finally {
      this.busy.set(false);
    }
  }
}
