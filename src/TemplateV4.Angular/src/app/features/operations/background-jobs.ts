import { Component, computed, inject, input, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
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
import { RecordStatus } from '../../shared/workspace-cells';
import { WorkspaceApi } from '../../core/workspace-api';
import { Auth } from '../../core/auth';
import { Runtime } from '../../core/runtime';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  BackgroundJobDetail,
  BackgroundJobPage,
  BackgroundJobRun,
  BackgroundJobSummary,
} from '../../api/models';

const jobColumn = createColumnHelper<DataTableFeatures, BackgroundJobSummary>();
const runColumn = createColumnHelper<DataTableFeatures, BackgroundJobRun>();

@Component({
  selector: 'app-background-jobs',
  imports: [WorkspaceUi, DataTable, HlmDrawerImports, HlmSelectImports],
  providers: [workspaceIcons],
  template: `
    <app-page-header
      eyebrow="administration"
      title="backgroundJobs"
      description="backgroundJobsIntro"
    >
      <button hlmBtn variant="outline" [disabled]="data.refreshing()" (click)="load()">
        <ng-icon name="lucideRefreshCw" aria-hidden="true" />{{ 'refresh' | t }}
      </button>
    </app-page-header>

    <section hlmCard class="workspace-directory-panel">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'jobDefinitions' | t }}</h2>
        <p hlmCardDescription>{{ 'jobDefinitionsHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="workspace-directory-controls">
          <div class="workspace-directory-toolbar">
            <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
              <label hlmFieldLabel class="sr-only" for="background-job-search">{{
                'search' | t
              }}</label>
              <input
                hlmInput
                id="background-job-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="120"
                [placeholder]="'backgroundJobSearch' | t"
              />
            </div>
            <div hlmField class="w-full sm:w-48">
              <label hlmFieldLabel class="sr-only" for="background-job-status">{{
                'status' | t
              }}</label>
              <hlm-select
                [value]="statusFilter()"
                [itemToString]="statusLabel"
                (valueChange)="setStatus($event)"
              >
                <hlm-select-trigger buttonId="background-job-status" class="w-full">
                  <hlm-select-value />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t">
                  <hlm-select-item value="all">{{ 'allStatuses' | t }}</hlm-select-item>
                  <hlm-select-item value="active">{{ 'active' | t }}</hlm-select-item>
                  <hlm-select-item value="paused">{{ 'paused' | t }}</hlm-select-item>
                  <hlm-select-item value="failed">{{ 'failed' | t }}</hlm-select-item>
                </hlm-select-content>
              </hlm-select>
            </div>
          </div>
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
            [emptyText]="'backgroundJobsEmpty' | t"
            [rowActionLabel]="detailsLabel"
            (rowAction)="openDetails($event)"
            [sortColumn]="query.text('sort', 'id')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)"
          /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            [sizeOptions]="pageSizes"
            [busy]="data.refreshing()"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
          />
        </app-page-state>
      </div>
    </section>

    <hlm-drawer
      direction="right"
      [state]="selectedId() ? 'open' : 'closed'"
      [disableClose]="busy()"
      (stateChanged)="$event === 'closed' && closeDetails()"
    >
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'backgroundJobDetails' | t }}</h2>
          <p hlmDrawerDescription>{{ 'backgroundJobDetailsHelp' | t }}</p>
        </hlm-drawer-header>
        <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
          <app-page-state [state]="detail.state()" (retry)="loadDetail()">
            @if (detail.value(); as value) {
              <div class="grid gap-6">
                <section>
                  <div class="mb-4 flex flex-wrap gap-2">
                    <button hlmBtn [disabled]="busy()" (click)="trigger(value.job)">
                      <ng-icon name="lucideActivity" aria-hidden="true" />{{ 'triggerNow' | t }}
                    </button>
                    <button
                      hlmBtn
                      variant="outline"
                      [disabled]="busy()"
                      (click)="setPaused(value.job, value.job.status !== 'Paused')"
                    >
                      {{ (value.job.status === 'Paused' ? 'resumeJob' : 'pauseJob') | t }}
                    </button>
                  </div>
                  <dl class="workspace-detail-list">
                    <div>
                      <dt>{{ 'job' | t }}</dt>
                      <dd>{{ jobName(value.job.id) }}</dd>
                    </div>
                    <div>
                      <dt>{{ 'status' | t }}</dt>
                      <dd>{{ value.job.status | t }}</dd>
                    </div>
                    <div>
                      <dt>{{ 'schedule' | t }}</dt>
                      <dd>{{ value.job.schedule }}</dd>
                    </div>
                    <div>
                      <dt>{{ 'nextRun' | t }}</dt>
                      <dd>{{ date(value.job.nextRunAt) }}</dd>
                    </div>
                    <div>
                      <dt>{{ 'lastRun' | t }}</dt>
                      <dd>{{ date(value.job.lastRunAt) }}</dd>
                    </div>
                    <div>
                      <dt>{{ 'retentionDays' | t }}</dt>
                      <dd>{{ i18n.number(value.retentionDays) }}</dd>
                    </div>
                    <div>
                      <dt>{{ 'payload' | t }}</dt>
                      <dd>{{ (value.hasPayload ? 'available' : 'noPayload') | t }}</dd>
                    </div>
                  </dl>
                </section>
                <section>
                  <h3 class="mb-1 text-base font-semibold">{{ 'executionHistory' | t }}</h3>
                  <p class="mb-4 text-sm text-muted-foreground">{{ 'executionHistoryHelp' | t }}</p>
                  <app-data-table
                    [columns]="historyColumns()"
                    [data]="value.history"
                    [emptyText]="'executionHistoryEmpty' | t"
                    [sortColumn]="'availableAt'"
                    [sortDirection]="'desc'"
                  />
                </section>
              </div>
            }
          </app-page-state>
        </div>
        <hlm-drawer-footer>
          <button
            hlmBtn
            type="button"
            variant="outline"
            [disabled]="busy()"
            (click)="closeDetails()"
          >
            {{ 'close' | t }}
          </button>
        </hlm-drawer-footer>
      </hlm-drawer-content>
    </hlm-drawer>
  `,
})
export class BackgroundJobsPage {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly runtime = inject(Runtime);
  readonly http = inject(HttpClient);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly data = new Resource<BackgroundJobPage>();
  readonly detail = new Resource<BackgroundJobDetail>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly selectedId = signal<string | null>(null);
  readonly busy = signal(false);
  readonly pageSizes = PAGE_SIZE_OPTIONS;
  readonly statusLabel = (value: string) => this.i18n.text(value === 'all' ? 'allStatuses' : value);
  readonly detailsLabel = (job: BackgroundJobSummary) =>
    `${this.i18n.text('viewDetails')}: ${this.jobName(job.id)}`;
  readonly columns = computed(() => {
    this.i18n.culture();
    return jobColumn.columns([
      jobColumn.accessor('id', {
        header: this.i18n.text('job'),
        cell: (cell) => this.jobName(cell.getValue()),
      }),
      jobColumn.accessor('status', {
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: row.original.status, danger: row.original.failedRuns > 0 },
          }),
      }),
      jobColumn.accessor('nextRunAt', {
        header: this.i18n.text('nextRun'),
        cell: (cell) => this.date(cell.getValue()),
      }),
      jobColumn.accessor('lastRunAt', {
        header: this.i18n.text('lastRun'),
        cell: (cell) => this.date(cell.getValue()),
      }),
      jobColumn.accessor('failedRuns', {
        header: this.i18n.text('failedRuns'),
        cell: (cell) => this.i18n.number(cell.getValue()),
      }),
    ]);
  });
  readonly historyColumns = computed(() => {
    this.i18n.culture();
    return runColumn.columns([
      runColumn.accessor('state', {
        enableSorting: false,
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: row.original.state, danger: row.original.state === 'Failed' },
          }),
      }),
      runColumn.accessor('culture', {
        enableSorting: false,
        header: this.i18n.text('language'),
      }),
      runColumn.accessor('availableAt', {
        enableSorting: false,
        header: this.i18n.text('started'),
        cell: (cell) => this.i18n.date(cell.getValue()),
      }),
      runColumn.accessor('completedAt', {
        enableSorting: false,
        header: this.i18n.text('completed'),
        cell: (cell) => this.date(cell.getValue()),
      }),
      runColumn.accessor('attempts', { enableSorting: false, header: this.i18n.text('attempts') }),
      runColumn.accessor('errorCode', {
        enableSorting: false,
        header: this.i18n.text('failureReason'),
        cell: (cell) => cell.getValue() || '—',
      }),
      runColumn.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          row.original.state === 'Failed'
            ? flexRenderComponent(RetryRunButton, {
                inputs: {
                  label: this.i18n.text('retryRun'),
                  disabled: this.busy(),
                  run: () => void this.retry(row.original),
                },
              })
            : '—',
      }),
    ]);
  });

  constructor() {
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    }, ['search', 'status', 'page', 'size', 'sort', 'direction']);
  }
  statusFilter() {
    const value = this.query.text('status', 'all');
    return ['all', 'active', 'paused', 'failed'].includes(value) ? value : 'all';
  }
  pageSize() {
    const value = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(value) ? value : DEFAULT_PAGE_SIZE;
  }
  setStatus(value: string | null | undefined) {
    if (value) void this.query.set({ status: value === 'all' ? null : value, page: 1 });
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'administration/background-jobs',
        {
          search: this.query.text('search'),
          status: this.statusFilter(),
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          sort: this.query.text('sort', 'id'),
          direction: this.query.direction('asc'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.total, this.pageSize());
  }
  openDetails(job: BackgroundJobSummary) {
    this.selectedId.set(job.id);
    void this.loadDetail();
  }
  closeDetails() {
    if (!this.busy()) {
      this.selectedId.set(null);
      this.detail.value.set(null);
    }
  }
  async loadDetail() {
    const id = this.selectedId();
    if (id)
      await this.detail.load((signal) =>
        this.api.get(`administration/background-jobs/${id}`, {}, signal),
      );
  }
  jobName(id: string) {
    return this.i18n.text(id === 'maintenance' ? 'maintenance' : id);
  }
  date(value: string | null) {
    return value ? this.i18n.date(value) : this.i18n.text('notRecorded');
  }
  async trigger(job: BackgroundJobSummary) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const headers = await this.auth.browserHeaders();
      await firstValueFrom(
        this.http.post(
          `${this.runtime.apiUrl}/api/v1/auth/administration/background-jobs/${job.id}/trigger`,
          {},
          {
            withCredentials: true,
            headers: { ...headers, 'Idempotency-Key': crypto.randomUUID() },
          },
        ),
      );
      this.toast.success('jobTriggered');
      await Promise.all([this.load(), this.loadDetail()]);
    } finally {
      this.busy.set(false);
    }
  }
  async setPaused(job: BackgroundJobSummary, paused: boolean) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`administration/background-jobs/${job.id}/schedule`, {
        paused,
        version: job.version,
      });
      this.toast.success(paused ? 'jobPaused' : 'jobResumed');
      await Promise.all([this.load(), this.loadDetail()]);
    } finally {
      this.busy.set(false);
    }
  }
  async retry(run: BackgroundJobRun) {
    const id = this.selectedId();
    if (!id || this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`administration/background-jobs/${id}/runs/${run.id}/retry`);
      this.toast.success('replayQueued');
      await Promise.all([this.load(), this.loadDetail()]);
    } finally {
      this.busy.set(false);
    }
  }
}

@Component({
  selector: 'app-retry-run-button',
  imports: [WorkspaceUi],
  template: `<button
    hlmBtn
    type="button"
    variant="ghost"
    size="sm"
    [disabled]="disabled()"
    (click)="run()()"
  >
    {{ label() }}
  </button>`,
})
class RetryRunButton {
  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly run = input.required<() => void>();
}
