import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
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
  imports: [WorkspaceUi, DataTable, HlmSelectImports],
  providers: [workspaceIcons],
  template: `
    <section hlmCard class="workspace-directory-panel">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ (overview() ? 'actionOverview' : 'actionInbox') | t }}</h2>
        <p hlmCardDescription>{{ 'actionOverviewHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="workspace-directory-controls">
          @if (!overview()) {
            <hlm-tabs
              [tab]="scopeFilter()"
              (tabActivated)="setScope($event)"
              class="workspace-directory-tabs"
              ><hlm-tabs-list [attr.aria-label]="'actionScope' | t" class="flex-wrap"
                ><button hlmTabsTrigger="mine">{{ 'actionInbox' | t }}</button
                ><button hlmTabsTrigger="overview">
                  {{ 'actionOverview' | t }}
                </button></hlm-tabs-list
              ></hlm-tabs
            >
          }
          <div class="workspace-directory-toolbar">
            <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
              <label hlmFieldLabel class="sr-only" for="action-search">{{ 'search' | t }}</label>
              <input
                hlmInput
                id="action-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="120"
                [placeholder]="'search' | t"
              />
            </div>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="data.state() === 'loading'"
              (click)="load()"
            >
              <ng-icon name="lucideRefreshCw" aria-hidden="true" />
              {{ 'refresh' | t }}
            </button>
            @if (overview()) {
              <a hlmBtn variant="outline" routerLink="/me/action-items">{{ 'actionInbox' | t }}</a>
            }
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-4 py-3" aria-live="polite">
          <div hlmField class="w-full sm:w-56">
            <label hlmFieldLabel for="action-state-filter">{{ 'status' | t }}</label>
            <hlm-select
              [value]="stateFilter()"
              [itemToString]="stateLabel"
              (valueChange)="setState($event)"
            >
              <hlm-select-trigger buttonId="action-state-filter" class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t">
                <hlm-select-item value="Open">{{ 'actionOpen' | t }}</hlm-select-item>
                <hlm-select-item value="Completed">{{ 'actionCompleted' | t }}</hlm-select-item>
              </hlm-select-content>
            </hlm-select>
          </div>
          <button
            hlmBtn
            type="button"
            variant="destructive"
            class="ms-auto"
            [disabled]="!hasFilters()"
            (click)="clearFilters()"
          >
            <ng-icon name="lucideFunnelX" aria-hidden="true" />
            {{ 'clearFilters' | t }}
          </button>
        </div>

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
            [busy]="data.refreshing()"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
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
  readonly stateLabel = (state: string) =>
    this.i18n.text(state === 'Completed' ? 'actionCompleted' : 'actionOpen');
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
    const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return this.pageSizes.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }
  scopeFilter() {
    return this.query.text('scope', 'mine') === 'overview' ? 'overview' : 'mine';
  }
  stateFilter() {
    return this.query.text('state', 'Open') === 'Completed' ? 'Completed' : 'Open';
  }
  hasFilters() {
    return (
      !!this.search.value() ||
      this.stateFilter() !== 'Open' ||
      (!this.overview() && this.scopeFilter() !== 'mine')
    );
  }
  setScope(scope: string) {
    void this.query.set({ scope: scope === 'overview' ? 'overview' : null, page: 1 });
  }
  setState(state: string | null | undefined) {
    void this.query.set({ state: state === 'Completed' ? 'Completed' : null, page: 1 });
  }
  clearFilters() {
    this.search.update('');
    void this.query.set({ search: null, scope: null, state: null, page: 1 });
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'action-items',
        {
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          scope: this.overview() ? 'overview' : this.scopeFilter(),
          state: this.stateFilter(),
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
