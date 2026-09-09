import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';

import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';

import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  Confirmations,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../shared/workspace';

import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';

import { RecordIdentity, RecordStatus, RowActions } from '../shared/workspace-cells';

import { WorkspaceApi } from '../core/workspace-api';

import { I18n } from '../core/i18n';

import { Notifications } from '../core/notifications';

import { InvitationItem, InvitationPage } from '../api/models';
import { InvitationDrawer } from './invite-user';

const column = createColumnHelper<DataTableFeatures, InvitationItem>();

@Component({
  selector: 'app-invitations-panel',

  imports: [WorkspaceUi, DataTable, InvitationDrawer],

  providers: [workspaceIcons],

  template: ` <section hlmCard class="workspace-directory-panel min-w-0">
    <div hlmCardHeader class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 hlmCardTitle>{{ 'invitationLifecycle' | t }}</h2>
        <p hlmCardDescription>{{ 'invitationLifecycleHelp' | t }}</p>
      </div>
      <app-invitation-drawer (invited)="load()" />
    </div>

    <div hlmCardContent>
      <div class="workspace-directory-controls">
        <hlm-tabs
          [tab]="query.text('state', 'all')"
          (tabActivated)="filter($event)"
          class="workspace-directory-tabs"
        >
          <hlm-tabs-list [attr.aria-label]="'status' | t" class="flex-wrap">
            @for (state of states; track state) {
              <button [hlmTabsTrigger]="state">
                {{ state | t }}
                <span hlmBadge variant="secondary">{{ i18n.number(stateCount(state)) }}</span>
              </button>
            }
          </hlm-tabs-list>
        </hlm-tabs>
        <div class="workspace-directory-toolbar">
          <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
            <label hlmFieldLabel class="sr-only" for="invitation-search">{{ 'search' | t }}</label>
            <input
              hlmInput
              id="invitation-search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
              maxlength="120"
              [placeholder]="'peopleSearch' | t"
            />
          </div>
          @if (search.value()) {
            <button hlmBtn type="button" variant="ghost" (click)="search.update('')">
              {{ 'clear' | t }}
            </button>
          }
        </div>
      </div>

      <app-page-state
        [state]="data.state()"
        [refreshError]="data.refreshError()"
        [showInitialSkeleton]="false"
        (retry)="load()"
        ><app-data-table
          [columns]="columns()"
          [data]="data.value()?.items ?? []"
          [loading]="data.state() === 'loading' || data.refreshing()"
          [loadingText]="'loading' | t"
          [emptyText]="'invitationsEmpty' | t"
          [sortColumn]="query.text('sort', 'sentAt')"
          [sortDirection]="query.direction('desc')"
          (sortChange)="sort($event)" /><app-list-pager
          [total]="data.value()?.total ?? 0"
          [page]="query.page"
          [size]="pageSize()"
          [showSizePicker]="true"
          [busy]="data.refreshing()"
          (pageChange)="query.set({ page: $event })"
          (sizeChange)="setPageSize($event)"
      /></app-page-state>
    </div>
  </section>`,
})
export class InvitationsPanel {
  readonly api = inject(WorkspaceApi);

  readonly i18n = inject(I18n);

  readonly toast = inject(Notifications);

  readonly confirm = inject(Confirmations);

  readonly data = new Resource<InvitationPage>();
  readonly query = new ListQuery('invitation');

  readonly busy = signal(false);

  readonly now = signal(Date.now());

  readonly search = new DebouncedSearch(this.query);

  private readonly invitationDrawer = viewChild(InvitationDrawer);

  readonly states = ['all', 'Pending', 'Expired', 'Accepted', 'Revoked'];

  readonly steps = ['onboardingInvited', 'onboardingVerified', 'onboardingReady'];

  stateCount(state: string) {
    const value = this.data.value();
    if (!value) return 0;
    const pending = value.pending ?? 0;
    const expired = value.expired ?? 0;
    const accepted = value.accepted ?? 0;
    const revoked = value.revoked ?? 0;
    if (state === 'Pending') return pending;
    if (state === 'Expired') return expired;
    if (state === 'Accepted') return accepted;
    if (state === 'Revoked') return revoked;
    return pending + expired + accepted + revoked;
  }

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

              link: '/users/' + row.original.id,
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

      column.accessor('expiresAt', {
        header: this.i18n.text('expiresAt'),
        cell: (c) => (c.getValue() ? this.i18n.date(c.getValue()!) : '—'),
      }),

      column.accessor('sentAt', {
        header: this.i18n.text('lastSent'),

        cell: (c) => (c.getValue() ? this.i18n.date(c.getValue()!) : this.i18n.text('notRecorded')),
      }),

      column.display({
        id: 'actions',

        enableSorting: false,

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
      this.search.sync(this.query.text('search'));

      void this.load();
    }, ['search', 'page', 'size', 'state', 'sort', 'direction']);

    effect((onCleanup) => {
      const dates = (this.data.value()?.items ?? [])
        .map((i) => Date.parse(i.resendAt ?? ''))
        .filter((t) => t > this.now());
      if (!dates.length) return;
      const timer = setTimeout(
        () => this.now.set(Date.now()),
        Math.max(0, Math.min(...dates) - Date.now() + 50),
      );
      onCleanup(() => clearTimeout(timer));
    });
  }

  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'invitations',
        {
          pageNumber: this.query.page,

          pageSize: this.pageSize(),

          search: this.query.text('search'),

          state: this.query.text('state', 'all'),

          sort: this.query.text('sort', 'sentAt'),

          direction: this.query.direction('desc'),
        },
        signal,
      ),
    );

    if (loaded) this.query.clamp(this.data.value()?.total, this.pageSize());
  }

  filter(value: unknown) {
    if (typeof value === 'string' && this.states.includes(value))
      void this.query.set({ state: value, page: 1 });
  }

  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }

  pageSize() {
    const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }

  setPageSize(size: number) {
    void this.query.set({ size, page: 1 });
  }

  hasUnsavedChanges() {
    return this.invitationDrawer()?.hasUnsavedChanges() ?? false;
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
