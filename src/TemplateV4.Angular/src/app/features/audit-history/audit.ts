import { Component, computed, inject, input, signal } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { NgScrollbar } from 'ngx-scrollbar';
import { AuditDetailPanel } from './audit-detail';

import { NgIcon, provideIcons } from '@ng-icons/core';

import { lucideInfo } from '@ng-icons/lucide';

import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';

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

import { RecordIdentity } from '../../shared/workspace-cells';

import { WorkspaceApi } from '../../core/workspace-api';

import { I18n, Translate } from '../../core/i18n';

import { AuditItem, PageOfAuditItem } from '../../api/models';

import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';

import { HlmButtonImports } from '@spartan-ng/helm/button';

import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

import { HlmSelectImports } from '@spartan-ng/helm/select';

const column = createColumnHelper<DataTableFeatures, AuditItem>();

type DateRange = 'today' | 'last7Days' | 'last30Days' | 'custom';

@Component({
  selector: 'app-audit-date-cell',
  template: `<span class="inline-block min-w-48 whitespace-nowrap">{{ value() }}</span>`,
})
class AuditDateCell {
  readonly value = input.required<string>();
}

@Component({
  selector: 'app-related-record-header',

  imports: [NgIcon, Translate, HlmButtonImports, HlmTooltipImports],

  providers: [provideIcons({ lucideInfo })],

  template: `
    <span class="inline-flex items-center gap-1 whitespace-nowrap">
      {{ 'relatedRecord' | t }}
      <button
        hlmBtn
        variant="ghost"
        size="icon-xs"
        type="button"
        [hlmTooltip]="'relatedRecordHelp' | t"
        [attr.aria-label]="'relatedRecordInfo' | t"
      >
        <ng-icon name="lucideInfo" />
      </button>
    </span>
  `,
})
class RelatedRecordHeader {}

@Component({
  selector: 'app-audit',

  imports: [
    WorkspaceUi,
    DataTable,
    HlmDatePickerImports,
    HlmDrawerImports,
    HlmScrollAreaImports,
    HlmSelectImports,
    NgScrollbar,
    AuditDetailPanel,
  ],

  providers: [workspaceIcons],

  template: ` <app-page-header
      eyebrow="administration"
      title="auditHistory"
      description="auditIntro"
      ><button hlmBtn variant="outline" (click)="load()" [disabled]="data.state() === 'loading'">
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button></app-page-header
    >

    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'activityLog' | t }}</h2>

        <p hlmCardDescription>{{ 'auditHelp' | t }}</p>
      </div>

      <div hlmCardContent>
        <div class="workspace-directory-controls">
          <div class="workspace-directory-toolbar">
            <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
              <label hlmFieldLabel class="sr-only" for="audit-search">{{ 'search' | t }}</label>
              <input
                hlmInput
                id="audit-search"
                [ngModel]="action.value()"
                (ngModelChange)="action.update($event)"
                maxlength="100"
                [placeholder]="'auditSearchPlaceholder' | t"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-4 py-3" aria-live="polite">
          <div hlmField class="w-full sm:w-48">
            <label hlmFieldLabel for="audit-active-date-range">{{ 'dateRange' | t }}</label>
            <hlm-select
              [value]="activeRange()"
              [itemToString]="dateRangeLabel"
              (valueChange)="setActiveDateRange($event)"
            >
              <hlm-select-trigger buttonId="audit-active-date-range" class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'dateRange' | t">
                <hlm-select-item value="today">{{ 'today' | t }}</hlm-select-item>
                <hlm-select-item value="last7Days">{{ 'last7Days' | t }}</hlm-select-item>
                <hlm-select-item value="last30Days">{{ 'last30Days' | t }}</hlm-select-item>
                <hlm-select-item value="custom">{{ 'custom' | t }}</hlm-select-item>
              </hlm-select-content>
            </hlm-select>
          </div>
          @if (activeRange() === 'custom') {
            <div hlmField class="w-full sm:w-56">
              <label hlmFieldLabel for="audit-active-from">{{ 'fromDate' | t }}</label>
              <div class="flex items-center">
                <hlm-date-picker
                  class="min-w-0 flex-1"
                  [ngModel]="from"
                  (ngModelChange)="setActiveDate('from', $event)"
                  [formatDate]="formatDate"
                  [maxDate]="until ?? undefined"
                  [autoCloseOnSelect]="true"
                >
                  <hlm-date-picker-trigger
                    class="w-full rounded-r-none"
                    buttonId="audit-active-from"
                  >
                    {{ 'fromDate' | t }}
                  </hlm-date-picker-trigger>
                </hlm-date-picker>
                <button
                  hlmBtn
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="-ms-px rounded-l-none bg-clip-border"
                  [disabled]="!from"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('fromDate')"
                  (click)="setActiveDate('from', null)"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div hlmField class="w-full sm:w-56">
              <label hlmFieldLabel for="audit-active-until">{{ 'untilDate' | t }}</label>
              <div class="flex items-center">
                <hlm-date-picker
                  class="min-w-0 flex-1"
                  [ngModel]="until"
                  (ngModelChange)="setActiveDate('until', $event)"
                  [formatDate]="formatDate"
                  [minDate]="from ?? undefined"
                  [autoCloseOnSelect]="true"
                >
                  <hlm-date-picker-trigger
                    class="w-full rounded-r-none"
                    buttonId="audit-active-until"
                  >
                    {{ 'untilDate' | t }}
                  </hlm-date-picker-trigger>
                </hlm-date-picker>
                <button
                  hlmBtn
                  type="button"
                  variant="destructive"
                  size="icon"
                  class="-ms-px rounded-l-none bg-clip-border"
                  [disabled]="!until"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('untilDate')"
                  (click)="setActiveDate('until', null)"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            </div>
          }
          @if (query.text('subjectId')) {
            <div hlmField class="w-full sm:w-56">
              <label hlmFieldLabel for="audit-related-record">{{ 'relatedRecord' | t }}</label>
              <div class="flex items-center">
                <input
                  hlmInput
                  id="audit-related-record"
                  class="min-w-0 flex-1 rounded-r-none"
                  [value]="query.text('subjectName', i18n.text('systemRecord'))"
                  readonly
                />
                <button
                  hlmBtn
                  variant="destructive"
                  size="icon"
                  type="button"
                  class="-ms-px rounded-l-none bg-clip-border"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('relatedRecord')"
                  (click)="removeFilter('subjectId')"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            </div>
          }
          @if (query.text('actorId')) {
            <div hlmField class="w-full sm:w-56">
              <label hlmFieldLabel for="audit-performed-by">{{ 'performedBy' | t }}</label>
              <div class="flex items-center">
                <input
                  hlmInput
                  id="audit-performed-by"
                  class="min-w-0 flex-1 rounded-r-none"
                  [value]="query.text('actorName', i18n.text('performedBy'))"
                  readonly
                />
                <button
                  hlmBtn
                  variant="destructive"
                  size="icon"
                  type="button"
                  class="-ms-px rounded-l-none bg-clip-border"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('performedBy')"
                  (click)="removeFilter('actorId')"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            </div>
          }
          <button
            hlmBtn
            type="button"
            variant="destructive"
            class="ms-auto"
            [disabled]="!hasFilters()"
            (click)="clear()"
          >
            <ng-icon name="lucideFunnelX" aria-hidden="true" />
            {{ 'clearFilters' | t }}
          </button>
        </div>

        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [rowActionLabel]="detailsLabel"
            (rowAction)="selected.set($event)"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            fillColumn="action"
            [emptyText]="'auditEmpty' | t"
            [sortColumn]="query.text('sort', 'at')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)" /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
        /></app-page-state>
      </div>
    </section>
    <hlm-drawer
      direction="right"
      [state]="selected() ? 'open' : 'closed'"
      [closeLabel]="'close' | t"
      (stateChanged)="$event === 'closed' && selected.set(null)"
    >
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'auditDetails' | t }}</h2>
          <p hlmDrawerDescription>{{ 'auditDetailsHelp' | t }}</p>
        </hlm-drawer-header>
        <ng-scrollbar
          hlm
          hlmDrawerBody
          orientation="vertical"
          role="region"
          tabindex="0"
          [attr.aria-label]="'auditDetails' | t"
          class="min-h-0 flex-1"
        >
          @if (selected(); as entry) {
            <app-audit-detail [id]="entry.id!" />
          }
        </ng-scrollbar>
        <hlm-drawer-footer
          ><button hlmBtn type="button" variant="outline" hlmDrawerClose>
            {{ 'close' | t }}
          </button></hlm-drawer-footer
        >
      </hlm-drawer-content>
    </hlm-drawer>`,
})
export class AuditPage {
  readonly selected = signal<AuditItem | null>(null);
  readonly detailsLabel = (entry: AuditItem) =>
    `${this.i18n.text('auditDetails')}: ${this.summary(entry.action)} · ${this.i18n.date(entry.at)}`;
  readonly api = inject(WorkspaceApi);

  readonly i18n = inject(I18n);

  readonly data = new Resource<PageOfAuditItem>();

  readonly query = new ListQuery();

  readonly action = new DebouncedSearch(this.query, 'action');
  readonly activeRange = signal<DateRange>('today');
  private initialized = false;

  from: Date | null = null;

  until: Date | null = null;

  readonly formatDate = (date: Date) =>
    new Intl.DateTimeFormat(this.i18n.culture(), { dateStyle: 'medium' }).format(date);

  readonly columns = computed(() => {
    this.i18n.culture();

    return column.columns([
      column.accessor('at', {
        header: this.i18n.text('actionDate'),

        cell: (context) =>
          flexRenderComponent(AuditDateCell, {
            inputs: { value: this.i18n.date(context.getValue()) },
          }),
      }),

      column.accessor('action', {
        header: this.i18n.text('activity'),

        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: this.summary(row.original.action),

              constrainWidth: false,
            },
          }),
      }),

      column.accessor('actorName', {
        header: this.i18n.text('performedBy'),

        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label:
                row.original.actorName ||
                this.i18n.text(
                  row.original.actorId
                    ? 'deletedAccount'
                    : row.original.action === 'auth.login_failed'
                      ? 'auditValue.anonymous'
                      : 'systemActor',
                ),

              link: row.original.actorId ? '/audit' : null,

              merge: true,
              constrainWidth: false,
              nowrap: true,
              params: row.original.actorId
                ? {
                    actorId: row.original.actorId,
                    actorName: row.original.actorName ?? this.i18n.text('deletedAccount'),
                    page: '1',
                  }
                : {},
            },
          }),
      }),

      column.accessor('subjectName', {
        header: () => flexRenderComponent(RelatedRecordHeader),

        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.subjectName || this.i18n.text('systemRecord'),

              link: row.original.subjectId ? '/audit' : null,

              merge: true,
              constrainWidth: false,
              nowrap: true,
              params: row.original.subjectId
                ? {
                    subjectId: row.original.subjectId,
                    subjectName: row.original.subjectName ?? this.i18n.text('systemRecord'),
                    page: '1',
                  }
                : {},
            },
          }),
      }),
    ]);
  });

  constructor() {
    this.query.connect(() => {
      this.action.sync(this.query.text('action'));

      if (!this.initialized) {
        this.initialized = true;
        if (!this.query.text('from') && !this.query.text('until')) {
          const { from, until } = this.dateRange('today');
          void this.query.set({
            range: 'today',
            from: this.formatQueryDate(from),
            until: this.formatQueryDate(until),
            page: 1,
          });
          return;
        }
      }

      this.from = this.parseQueryDate(this.query.text('from'));

      this.until = this.parseQueryDate(this.query.text('until'));

      const range = this.query.text('range');
      this.activeRange.set(
        this.isDateRange(range) ? range : this.matchDateRange(this.from, this.until),
      );

      void this.load();
    });
  }

  summary(action: string) {
    for (const prefix of [
      'role.granted:',
      'role.removed:',
      'user.role_granted:',
      'user.role_removed:',
    ])
      if (action.startsWith(prefix)) {
        const detail = action.slice(prefix.length);
        return (
          this.i18n.text('audit.' + prefix.slice(0, -1)) +
          ': ' +
          (prefix.startsWith('role.') ? this.i18n.text('permission.' + detail) : detail)
        );
      }

    if (action.startsWith('user.security_changed:')) {
      const match = /d:(True|False)>(True|False):r:(.*)>(.*)/.exec(action);

      if (match)
        return `${this.i18n.text('securityChanged')}: ${this.i18n.text(match[2] === 'True' ? 'disabled' : 'active')} · ${match[3] || '—'} → ${match[4] || '—'}`;
    }

    const key = 'audit.' + action;

    const translated = this.i18n.text(key);

    return translated === key ? action.replaceAll('.', ' · ').replaceAll('_', ' ') : translated;
  }

  async load() {
    const params: Record<string, string | number> = {
      pageNumber: this.query.page,

      pageSize: this.pageSize(),

      action: this.query.text('action'),

      sort: this.query.text('sort', 'at'),

      direction: this.query.direction('desc'),
    };

    for (const key of ['actorId', 'subjectId'])
      if (this.query.text(key)) params[key] = this.query.text(key);

    if (this.query.text('from')) {
      const date = new Date(this.query.text('from') + 'T00:00:00');

      if (!Number.isNaN(date.valueOf())) params['from'] = date.toISOString();
    }

    if (this.query.text('until')) {
      const date = new Date(this.query.text('until') + 'T23:59:59.999');

      if (!Number.isNaN(date.valueOf())) params['until'] = date.toISOString();
    }

    const loaded = await this.data.load((signal) => this.api.get('audit', params, signal));

    if (loaded) this.query.clamp(this.data.value()?.total, this.pageSize());
  }

  pageSize() {
    const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }

  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }

  readonly dateRangeLabel = (range: DateRange) => this.i18n.text(range);

  setActiveDateRange(range: DateRange | null | undefined) {
    if (!range) return;

    this.activeRange.set(range);
    if (range === 'custom') {
      void this.query.set({ range, page: 1 });
      return;
    }

    const dates = this.dateRange(range);
    void this.query.set({
      range,
      from: this.formatQueryDate(dates.from),
      until: this.formatQueryDate(dates.until),
      page: 1,
    });
  }

  setActiveDate(filter: 'from' | 'until', date: Date | null) {
    this.activeRange.set('custom');
    void this.query.set({
      range: 'custom',
      [filter]: this.formatQueryDate(date),
      page: 1,
    });
  }

  filterCount() {
    return (
      Number(!!this.from || !!this.until) +
      Number(!!this.query.text('actorId')) +
      Number(!!this.query.text('subjectId'))
    );
  }

  hasFilters() {
    return !!this.action.value() || this.filterCount() > 0;
  }

  removeFilter(filter: 'from' | 'until' | 'actorId' | 'subjectId') {
    const values: Record<string, string | number | null> = { [filter]: null, page: 1 };
    if (filter === 'actorId') values['actorName'] = null;
    if (filter === 'subjectId') values['subjectName'] = null;
    void this.query.set(values);
  }

  private parseQueryDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      ? date
      : null;
  }

  private formatQueryDate(date: Date | null): string | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private dateRange(range: Exclude<DateRange, 'custom'>) {
    const until = new Date();
    const from = new Date(until);
    if (range === 'last7Days') from.setDate(from.getDate() - 6);
    if (range === 'last30Days') from.setDate(from.getDate() - 29);
    return { from, until };
  }

  private matchDateRange(from: Date | null, until: Date | null): DateRange {
    if (!from || !until) return 'custom';

    for (const range of ['today', 'last7Days', 'last30Days'] as const) {
      const dates = this.dateRange(range);
      if (
        this.formatQueryDate(from) === this.formatQueryDate(dates.from) &&
        this.formatQueryDate(until) === this.formatQueryDate(dates.until)
      )
        return range;
    }

    return 'custom';
  }

  private isDateRange(value: string): value is DateRange {
    return ['today', 'last7Days', 'last30Days', 'custom'].includes(value);
  }

  clear() {
    this.action.update('');
    const { from, until } = this.dateRange('today');

    void this.query.set({
      action: null,

      range: 'today',

      from: this.formatQueryDate(from),

      until: this.formatQueryDate(until),

      actorName: null,
      subjectName: null,

      actorId: null,

      subjectId: null,

      page: 1,
    });
  }
}
