import { Component, computed, inject, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  Confirmations,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RecordIdentity, RowActions } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { Auth } from '../core/auth';
import { DeletionItem, PageOfDeletionItem } from '../api/models';
const column = createColumnHelper<DataTableFeatures, DeletionItem>();
@Component({
  selector: 'app-privacy-requests',
  imports: [WorkspaceUi, DataTable],
  providers: [workspaceIcons],
  template: ` <app-page-header
      eyebrow="administration"
      title="privacyRequests"
      description="privacyRequestsIntro"
      ><button hlmBtn variant="outline" (click)="load()" [disabled]="data.state() === 'loading'">
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button></app-page-header
    >
    <div hlmAlert class="mb-6">
      <h2 hlmAlertTitle>{{ 'reviewBeforeApproval' | t }}</h2>
      <p hlmAlertDescription>{{ 'reviewBeforeApprovalHelp' | t }}</p>
    </div>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'pendingRequests' | t }}</h2>
        <p hlmCardDescription>{{ 'pendingRequestsHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="'privacyRequestsEmpty' | t"
            [sortColumn]="query.text('sort', 'requestedAt')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)" /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>`,
})
export class PrivacyRequestsPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly auth = inject(Auth);
  readonly data = new Resource<PageOfDeletionItem>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.accessor('displayName', {
        header: this.i18n.text('person'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.displayName ?? this.i18n.text('deletedAccount'),
              link: '/audit',
              params: { subjectId: row.original.userId },
            },
          }),
      }),
      column.accessor('requestedAt', {
        header: this.i18n.text('requestedAt'),
        cell: (c) => this.i18n.date(c.getValue()),
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions: [
                {
                  label: 'decline',
                  disabled: busy || row.original.userId === this.auth.access()?.userId,
                  run: () => void this.review(row.original, false),
                },
                {
                  label: 'approveDeletion',
                  disabled: busy || row.original.userId === this.auth.access()?.userId,
                  destructive: true,
                  run: () => void this.review(row.original, true),
                },
              ],
            },
          }),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => void this.load());
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'privacy/requests',
        {
          pageNumber: this.query.page,
          pageSize: 25,
          sort: this.query.text('sort', 'requestedAt'),
          direction: this.query.direction('asc'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.total);
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async review(item: DeletionItem, approve: boolean) {
    if (
      this.busy() ||
      !(await this.confirm.ask(
        approve ? 'approveDeletion' : 'declineRequest',
        approve ? 'approveDeletionHelp' : 'declineRequestHelp',
        item.displayName ?? '',
        approve,
      ))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post('privacy/review', { id: item.id, approve });
      this.toast.success('requestReviewed');
      await this.load();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
