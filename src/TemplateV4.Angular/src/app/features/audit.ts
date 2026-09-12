import { Component, computed, inject, input, signal } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
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
} from '../shared/workspace';

import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';

import { RecordIdentity } from '../shared/workspace-cells';

import { WorkspaceApi } from '../core/workspace-api';

import { I18n, Translate } from '../core/i18n';

import { AuditItem, PageOfAuditItem } from '../api/models';

import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';

import { HlmButtonImports } from '@spartan-ng/helm/button';

import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

const column = createColumnHelper<DataTableFeatures, AuditItem>();

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
    <span class="inline-flex items-center gap-1">
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

  imports: [WorkspaceUi, DataTable, HlmDatePickerImports, HlmDrawerImports, AuditDetailPanel],

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
            <hlm-drawer
              direction="right"
              [state]="filtersOpen() ? 'open' : 'closed'"
              (stateChanged)="setFiltersOpen($event === 'open')"
            >
              <button hlmBtn hlmDrawerTrigger type="button" variant="outline">
                <ng-icon name="lucideFunnel" aria-hidden="true" />
                {{ 'filters' | t }}
                @if (filterCount()) {
                  <span hlmBadge variant="counter">{{ filterCount() }}</span>
                }
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'filters' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'auditFiltersHelp' | t }}</p>
                </hlm-drawer-header>
                <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                  <div class="grid gap-4">
                    <div hlmField>
                      <label hlmFieldLabel for="audit-from">{{ 'fromDate' | t }}</label>
                      <hlm-date-picker
                        [ngModel]="fromDraft()"
                        (ngModelChange)="fromDraft.set($event)"
                        [formatDate]="formatDate"
                        [maxDate]="untilDraft() ?? undefined"
                        [autoCloseOnSelect]="true"
                      >
                        <hlm-date-picker-trigger class="w-full" buttonId="audit-from">
                          {{ 'fromDate' | t }}
                        </hlm-date-picker-trigger>
                      </hlm-date-picker>
                    </div>
                    <div hlmField>
                      <label hlmFieldLabel for="audit-until">{{ 'untilDate' | t }}</label>
                      <hlm-date-picker
                        [ngModel]="untilDraft()"
                        (ngModelChange)="untilDraft.set($event)"
                        [formatDate]="formatDate"
                        [minDate]="fromDraft() ?? undefined"
                        [autoCloseOnSelect]="true"
                      >
                        <hlm-date-picker-trigger class="w-full" buttonId="audit-until">
                          {{ 'untilDate' | t }}
                        </hlm-date-picker-trigger>
                      </hlm-date-picker>
                    </div>
                  </div>
                </div>
                <hlm-drawer-footer>
                  <button
                    hlmBtn
                    type="button"
                    [disabled]="!filtersChanged()"
                    (click)="applyFilters()"
                  >
                    {{ 'applyFilters' | t }}
                  </button>
                  <button
                    hlmBtn
                    type="button"
                    variant="outline"
                    [disabled]="!hasFilters()"
                    (click)="clear()"
                  >
                    <ng-icon name="lucideFunnelX" aria-hidden="true" />
                    {{ 'clearFilters' | t }}
                  </button>
                </hlm-drawer-footer>
              </hlm-drawer-content>
            </hlm-drawer>
          </div>
        </div>

        @if (filterCount()) {
          <div class="flex flex-wrap gap-2 py-3" aria-live="polite">
            @if (from) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                type="button"
                (click)="removeFilter('from')"
              >
                {{ 'fromDate' | t }}: {{ formatDate(from) }} · {{ 'clear' | t }}
              </button>
            }
            @if (until) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                type="button"
                (click)="removeFilter('until')"
              >
                {{ 'untilDate' | t }}: {{ formatDate(until) }} · {{ 'clear' | t }}
              </button>
            }
            @if (query.text('subjectId')) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                type="button"
                (click)="removeFilter('subjectId')"
              >
                {{ query.text('subjectName', i18n.text('relatedRecord')) }} · {{ 'clear' | t }}
              </button>
            }
            @if (query.text('actorId')) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                type="button"
                (click)="removeFilter('actorId')"
              >
                {{ query.text('actorName', i18n.text('performedBy')) }} · {{ 'clear' | t }}
              </button>
            }
          </div>
        }

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
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>
    <hlm-drawer
      direction="right"
      [state]="selected() ? 'open' : 'closed'"
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
        <div
          hlmDrawerBody
          tabindex="0"
          role="region"
          [attr.aria-label]="'auditDetails' | t"
          class="min-h-0 flex-1 overflow-y-auto focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
        >
          @if (selected(); as entry) {
            <app-audit-detail [id]="entry.id!" />
          }
        </div>
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
  readonly filtersOpen = signal(false);
  readonly fromDraft = signal<Date | null>(null);
  readonly untilDraft = signal<Date | null>(null);
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
          const until = new Date();
          const from = new Date(until);
          from.setDate(from.getDate() - 7);
          void this.query.set({
            from: this.formatQueryDate(from),
            until: this.formatQueryDate(until),
            page: 1,
          });
          return;
        }
      }

      this.from = this.parseQueryDate(this.query.text('from'));

      this.until = this.parseQueryDate(this.query.text('until'));

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

      pageSize: DEFAULT_PAGE_SIZE,

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

    if (loaded) this.query.clamp(this.data.value()?.total);
  }

  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }

  setFiltersOpen(open: boolean) {
    if (open) {
      this.fromDraft.set(this.from);
      this.untilDraft.set(this.until);
    }
    this.filtersOpen.set(open);
  }

  filtersChanged() {
    return (
      this.formatQueryDate(this.fromDraft()) !== this.query.text('from') ||
      this.formatQueryDate(this.untilDraft()) !== this.query.text('until')
    );
  }

  applyFilters() {
    if (this.fromDraft() && this.untilDraft() && this.fromDraft()! > this.untilDraft()!) return;
    this.filtersOpen.set(false);
    void this.query.set({
      from: this.formatQueryDate(this.fromDraft()),
      until: this.formatQueryDate(this.untilDraft()),
      page: 1,
    });
  }

  filterCount() {
    return (
      Number(!!this.from) +
      Number(!!this.until) +
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

  clear() {
    this.action.update('');
    this.fromDraft.set(null);
    this.untilDraft.set(null);

    void this.query.set({
      action: null,

      from: null,

      until: null,

      actorName: null,
      subjectName: null,

      actorId: null,

      subjectId: null,

      page: 1,
    });
  }
}
