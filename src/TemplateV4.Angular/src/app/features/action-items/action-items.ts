import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  Resource,
  ListQuery,
  DebouncedSearch,
  PAGE_SIZE_OPTIONS,
} from '../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../shared/data-table';
import { RecordIdentity, RowActions } from '../../shared/workspace-cells';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { ActionItemDto, PageOfActionItemDto } from '../../api/models';
const column = createColumnHelper<DataTableFeatures, ActionItemDto>();

@Component({
  selector: 'app-action-items',
  imports: [WorkspaceUi, DataTable],
  template: `
    @if (!overview()) {
      <app-page-header title="actionItems" description="actionItemsHelp" eyebrow="workspace" />
    }
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ (overview() ? 'actionOverview' : 'actionInbox') | t }}</h2>
        <p hlmCardDescription>{{ 'actionOverviewHelp' | t }}</p>
        <div class="flex flex-wrap gap-3">
          @if (!overview()) {
            <hlm-tabs
              [tab]="query.text('scope', 'mine')"
              (tabActivated)="query.set({ scope: $event, page: 1 })"
              ><hlm-tabs-list [attr.aria-label]="'actionScope' | t"
                ><button hlmTabsTrigger="mine">{{ 'actionInbox' | t }}</button
                ><button hlmTabsTrigger="overview">
                  {{ 'actionOverview' | t }}
                </button></hlm-tabs-list
              ></hlm-tabs
            >
          }
          <hlm-tabs
            [tab]="query.text('state', 'Open')"
            (tabActivated)="query.set({ state: $event, page: 1 })"
            ><hlm-tabs-list [attr.aria-label]="'status' | t"
              ><button hlmTabsTrigger="Open">{{ 'actionOpen' | t }}</button
              ><button hlmTabsTrigger="Completed">
                {{ 'actionCompleted' | t }}
              </button></hlm-tabs-list
            ></hlm-tabs
          >
          <button hlmBtn variant="outline" (click)="load()">{{ 'refresh' | t }}</button>
          @if (overview()) {
            <a hlmBtn variant="outline" routerLink="/action-items">{{ 'actionInbox' | t }}</a>
          }
        </div>
        <div hlmField>
          <label hlmFieldLabel for="action-search">{{ 'search' | t }}</label
          ><input
            hlmInput
            id="action-search"
            [ngModel]="search.value()"
            (ngModelChange)="search.update($event)"
            maxlength="120"
          />
        </div>
      </div>
      <div hlmCardContent>
        <app-page-state
          [state]="data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
        >
          <app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="'actionItemsEmpty' | t"
            [sortColumn]="query.text('sort', 'createdAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [sizeOptions]="pageSizes"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ pageSize: $event, page: 1 })"
          />
        </app-page-state>
      </div>
    </section>
  `,
})
export class ActionItemsPage {
  readonly overview = input(false);
  readonly api = inject(WorkspaceApi);
  readonly router = inject(Router);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly data = new Resource<PageOfActionItemDto>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly busy = signal(false);
  readonly pageSizes = PAGE_SIZE_OPTIONS;
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.accessor('title', {
        header: this.i18n.text('actionTitle'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label:
                row.original.source === 'Manual'
                  ? row.original.title
                  : this.i18n.text(row.original.title),
              description: row.original.description,
            },
          }),
      }),
      column.accessor('source', {
        header: this.i18n.text('actionSource'),
        cell: (c) => this.i18n.text('actionSource' + c.getValue()),
      }),
      column.accessor('assignee', {
        header: this.i18n.text('actionAssignment'),
        cell: ({ row }) =>
          row.original.queueId
            ? this.i18n.text(
                row.original.queueId === 'registration-approvals'
                  ? 'actionQueueRegistration'
                  : 'actionQueuePrivacy',
              )
            : row.original.assignee,
      }),
      column.accessor('state', {
        header: this.i18n.text('status'),
        cell: (c) => this.i18n.text('action' + c.getValue()),
      }),
      column.accessor('createdAt', {
        header: this.i18n.text('createdAt'),
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
                  label: 'actionOpenPage',
                  run: () => void this.router.navigateByUrl(row.original.link),
                },
                ...(row.original.canComplete
                  ? [
                      {
                        label: 'actionComplete',
                        disabled: busy,
                        run: () => void this.complete(row.original.id),
                      },
                    ]
                  : []),
              ],
            },
          }),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    });
  }
  pageSize() {
    const size = Number(this.query.text('pageSize', '10'));
    return this.pageSizes.includes(size) ? size : 10;
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'action-items',
        {
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          scope: this.overview() ? 'overview' : this.query.text('scope', 'mine'),
          state: this.query.text('state', 'Open'),
          sort: this.query.text('sort', 'createdAt'),
          direction: this.query.direction('desc'),
          search: this.query.text('search'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.total, this.pageSize());
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async complete(id: string) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('action-items/' + id + '/complete');
      this.toast.success('actionCompleted');
      await this.load();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
