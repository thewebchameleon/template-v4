import { Component, computed, inject, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  Confirmations,
} from '../../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../shared/data-table';
import { RecordIdentity, RowActions } from '../../../shared/workspace-cells';
import { WorkspaceApi } from '../../../core/workspace-api';
import { I18n } from '../../../core/i18n';
import { Notifications } from '../../notifications/notifications';
import { Auth } from '../../../core/auth';
import { RegistrationReviewItem, PageOfRegistrationReviewItem } from '../../../api/models';
const column = createColumnHelper<DataTableFeatures, RegistrationReviewItem>();
@Component({
  selector: 'app-registration-requests',
  imports: [WorkspaceUi, DataTable],
  providers: [workspaceIcons],
  template: ` <div class="mb-6 flex justify-end">
      <button hlmBtn variant="outline" (click)="load()" [disabled]="data.state() === 'loading'">
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button>
    </div>
    <div hlmAlert class="mb-6">
      <h2 hlmAlertTitle>{{ 'registrationRequests' | t }}</h2>
      <p hlmAlertDescription>{{ 'registrationReviewHelp' | t }}</p>
    </div>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'registrationRequests' | t }}</h2>
        <p hlmCardDescription>{{ 'registrationReviewHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="'registrationRequestsEmpty' | t"
            [sortColumn]="query.text('sort', 'displayName')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)" /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (sizeChange)="query.set({ pageSize: $event, page: 1 })"
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>`,
})
export class RegistrationRequestsPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly auth = inject(Auth);
  readonly data = new Resource<PageOfRegistrationReviewItem>();
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
              description: row.original.email,
            },
          }),
      }),
      column.accessor('email', { header: this.i18n.text('email') }),
      column.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions: [
                {
                  label: 'declineRegistration',
                  disabled: busy || row.original.id === this.auth.access()?.userId,
                  run: () => void this.review(row.original, false),
                },
                {
                  label: 'approveRegistration',
                  disabled: busy || row.original.id === this.auth.access()?.userId,
                  destructive: false,
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
  pageSize() {
    const size = Number(this.query.text('pageSize', '10'));
    return [5, 10, 25, 50].includes(size) ? size : 10;
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'registration-requests',
        {
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          sort: this.query.text('sort', 'displayName'),
          direction: this.query.direction('asc'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.total, this.pageSize());
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async review(item: RegistrationReviewItem, approve: boolean) {
    if (
      this.busy() ||
      !(await this.confirm.ask(
        approve ? 'approveRegistration' : 'declineRegistration',
        approve ? 'approveRegistrationHelp' : 'declineRegistrationHelp',
        item.displayName ?? '',
        !approve,
      ))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post('registration-requests/review', { id: item.id, approve });
      this.toast.success('requestReviewed');
      await this.load();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
