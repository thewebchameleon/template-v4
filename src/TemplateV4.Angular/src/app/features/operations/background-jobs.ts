import { Component, computed, inject, input, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NgScrollbar } from 'ngx-scrollbar';
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
  imports: [
    WorkspaceUi,
    DataTable,
    HlmDrawerImports,
    HlmScrollAreaImports,
    NgScrollbar,
    HlmSelectImports,
  ],
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
      [closeLabel]="'close' | t"
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
        <ng-scrollbar hlm hlmDrawerBody orientation="vertical" class="min-h-0 flex-1">
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
        </ng-scrollbar>
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
  readonly runHistories = signal<Record<string, BackgroundJobRun[] | undefined>>({});
  private historyLoad = 0;
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
      jobColumn.display({
        id: 'runHistory',
        enableSorting: false,
        header: this.i18n.text('runHistory'),
        cell: ({ row }) =>
          flexRenderComponent(RunHistorySparkline, {
            inputs: { runs: this.runHistories()[row.original.id] },
          }),
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
    if (loaded) {
      this.query.clamp(this.data.value()?.total, this.pageSize());
      void this.loadRunHistories(this.data.value()?.items ?? []);
    }
  }
  private async loadRunHistories(jobs: BackgroundJobSummary[]) {
    const load = ++this.historyLoad;
    this.runHistories.set(Object.fromEntries(jobs.map((job) => [job.id, undefined])));
    const histories = await Promise.all(
      jobs.map(async (job) => {
        const detail = await this.api.get<BackgroundJobDetail>(
          `administration/background-jobs/${job.id}`,
        );
        return [job.id, detail.history.slice(0, 10)] as const;
      }),
    );
    if (load === this.historyLoad) this.runHistories.set(Object.fromEntries(histories));
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

interface SparklinePoint {
  run: BackgroundJobRun;
  x: number;
  y: number;
  duration: number;
}

@Component({
  selector: 'app-run-history-sparkline',
  imports: [WorkspaceUi, HlmTooltipImports],
  template: `
    @if (runs(); as history) {
      @if (points().length) {
        <div class="grid min-w-40 gap-1.5 py-1">
          <svg
            class="h-12 w-40 overflow-visible rounded-md bg-muted/30"
            viewBox="0 0 160 48"
            role="img"
            [attr.aria-label]="summary()"
          >
            @for (y of guideLines; track y) {
              <line
                x1="12"
                x2="148"
                [attr.y1]="y"
                [attr.y2]="y"
                stroke="currentColor"
                class="text-border/70"
                stroke-width="1"
                stroke-dasharray="2 3"
              />
            }
            <polyline
              fill="none"
              stroke="currentColor"
              class="text-muted-foreground/70"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              [attr.points]="line()"
            />
            @for (point of points(); track point.run.id) {
              <g
                class="run-history-point"
                tabindex="0"
                role="img"
                [attr.aria-label]="pointLabel(point)"
                [hlmTooltip]="runTooltip"
                (pointerenter)="activePoint.set(point)"
                (focus)="activePoint.set(point)"
              >
                <circle [attr.cx]="point.x" [attr.cy]="point.y" r="12" fill="transparent" />
                <circle
                  [attr.cx]="point.x"
                  [attr.cy]="point.y"
                  r="3.5"
                  [attr.fill]="color(point.run.state)"
                  class="run-history-dot stroke-background"
                  stroke-width="1.5"
                />
              </g>
            }
          </svg>
        </div>
      } @else {
        <span class="text-muted-foreground">{{ 'noRunHistory' | t }}</span>
      }
    } @else {
      <span class="text-muted-foreground" role="status">{{ 'loading' | t }}</span>
    }

    <ng-template #runTooltip>
      @if (activePoint(); as point) {
        <div class="grid min-w-60 gap-2 text-start">
          <div class="flex items-center justify-between gap-4 border-b border-background/20 pb-2">
            <span class="inline-flex items-center gap-2 font-semibold">
              <span
                class="size-2 rounded-full"
                [style.background-color]="color(point.run.state)"
              ></span>
              {{ point.run.state | t }}
            </span>
            <span class="text-[10px] tracking-wide text-background/65 uppercase">{{
              'runDetails' | t
            }}</span>
          </div>
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt class="text-background/65">{{ 'started' | t }}</dt>
            <dd class="text-end font-medium">{{ i18n.date(point.run.availableAt) }}</dd>
            <dt class="text-background/65">
              {{ durationLabel(point.run) | t }}
            </dt>
            <dd class="text-end font-medium">{{ formatDuration(point.duration) }}</dd>
            <dt class="text-background/65">{{ 'attempts' | t }}</dt>
            <dd class="text-end font-medium">{{ i18n.number(point.run.attempts) }}</dd>
            @if (point.run.errorCode) {
              <dt class="text-background/65">{{ 'failureReason' | t }}</dt>
              <dd class="max-w-40 text-end font-medium break-words">
                {{ point.run.errorCode }}
              </dd>
            }
          </dl>
        </div>
      }
    </ng-template>
  `,
  styles: `
    .run-history-point {
      cursor: help;
      outline: none;
    }
    .run-history-dot {
      transition:
        r 150ms ease,
        stroke-width 150ms ease;
    }
    .run-history-point:hover .run-history-dot,
    .run-history-point:focus-visible .run-history-dot {
      r: 5px;
      stroke: var(--ring);
      stroke-width: 2.5;
    }
    @media (prefers-reduced-motion: reduce) {
      .run-history-dot {
        transition: none;
      }
    }
  `,
})
class RunHistorySparkline {
  readonly runs = input<BackgroundJobRun[] | undefined>();
  readonly i18n = inject(I18n);
  readonly activePoint = signal<SparklinePoint | null>(null);
  readonly guideLines = [12, 24, 36];
  readonly points = computed<SparklinePoint[]>(() => {
    const runs = [...(this.runs() ?? [])].reverse();
    const durations = runs.map((run) => this.duration(run));
    const minimum = Math.min(...durations);
    const maximum = Math.max(...durations);
    const range = maximum - minimum;
    return runs.map((run, index) => ({
      run,
      duration: durations[index],
      x: runs.length === 1 ? 80 : 12 + (index * 136) / (runs.length - 1),
      y: range === 0 ? 24 : 36 - ((durations[index] - minimum) / range) * 24,
    }));
  });
  readonly line = computed(() =>
    this.points()
      .map((point) => `${point.x},${point.y}`)
      .join(' '),
  );
  readonly summary = computed(() => {
    this.i18n.culture();
    return this.i18n
      .text('runHistorySummary')
      .replace('{count}', this.i18n.number(this.points().length));
  });
  pointLabel(point: SparklinePoint) {
    const durationLabel = this.durationLabel(point.run);
    return `${this.i18n.text(point.run.state)} · ${this.i18n.date(point.run.availableAt)} · ${this.i18n.text(durationLabel)}: ${this.formatDuration(point.duration)}`;
  }
  durationLabel(run: BackgroundJobRun) {
    return run.state === 'Running' || run.state === 'Pending' || run.state === 'Retry'
      ? 'elapsed'
      : 'duration';
  }
  color(state: string) {
    switch (state) {
      case 'Completed':
        return 'var(--chart-2)';
      case 'Failed':
        return 'var(--destructive)';
      case 'Running':
        return 'var(--chart-1)';
      case 'Retry':
        return 'var(--chart-3)';
      default:
        return 'var(--muted-foreground)';
    }
  }
  private duration(run: BackgroundJobRun) {
    const started = new Date(run.availableAt).getTime();
    const finished = run.completedAt ? new Date(run.completedAt).getTime() : Date.now();
    return Math.max(0, finished - started);
  }
  formatDuration(milliseconds: number) {
    if (milliseconds < 1000)
      return `${new Intl.NumberFormat(this.i18n.culture(), { maximumFractionDigits: 0 }).format(milliseconds)} ms`;
    if (milliseconds < 60_000)
      return `${new Intl.NumberFormat(this.i18n.culture(), { maximumFractionDigits: 1 }).format(milliseconds / 1000)} s`;
    return `${new Intl.NumberFormat(this.i18n.culture(), { maximumFractionDigits: 1 }).format(milliseconds / 60_000)} min`;
  }
}
