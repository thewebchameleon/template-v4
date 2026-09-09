import { Component, computed, inject } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';

import { lucideInfo } from '@ng-icons/lucide';

import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';

import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
} from '../shared/workspace';

import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';

import { RecordIdentity } from '../shared/workspace-cells';

import { WorkspaceApi } from '../core/workspace-api';

import { I18n, Translate } from '../core/i18n';

import { AuditItem, PageOfAuditItem } from '../api/models';

import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';

import { HlmButtonImports } from '@spartan-ng/helm/button';

import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmSelectImports } from '@spartan-ng/helm/select';

const column = createColumnHelper<DataTableFeatures, AuditItem>();

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

  imports: [WorkspaceUi, DataTable, HlmDatePickerImports, HlmSelectImports],

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
        <div class="workspace-toolbar">
          <div hlmField>
            <label hlmFieldLabel for="audit-action">{{ 'activity' | t }}</label
            ><hlm-select
              class="w-full"
              [value]="action.value() || 'all'"
              [itemToString]="activityLabel"
              (valueChange)="setActivity($event)"
            >
              <hlm-select-trigger buttonId="audit-action" class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'activity' | t">
                <hlm-select-item value="all">{{ 'allActivity' | t }}</hlm-select-item>
                @for (activity of activities; track activity) {
                  <hlm-select-item [value]="activity">{{ summary(activity) }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>

          <div hlmField>
            <label hlmFieldLabel for="audit-from">{{ 'fromDate' | t }}</label
            ><hlm-date-picker
              [ngModel]="from"
              (ngModelChange)="from = $event; applyDates()"
              [formatDate]="formatDate"
              [maxDate]="until ?? undefined"
              [autoCloseOnSelect]="true"
            >
              <hlm-date-picker-trigger class="w-full" buttonId="audit-from">
                {{ 'fromDate' | t }}
              </hlm-date-picker-trigger>
            </hlm-date-picker>
          </div>

          <div hlmField>
            <label hlmFieldLabel for="audit-until">{{ 'untilDate' | t }}</label
            ><hlm-date-picker
              [ngModel]="until"
              (ngModelChange)="until = $event; applyDates()"
              [formatDate]="formatDate"
              [minDate]="from ?? undefined"
              [autoCloseOnSelect]="true"
            >
              <hlm-date-picker-trigger class="w-full" buttonId="audit-until">
                {{ 'untilDate' | t }}
              </hlm-date-picker-trigger>
            </hlm-date-picker>
          </div>

          <button hlmBtn variant="ghost" type="button" (click)="clear()">{{ 'clear' | t }}</button>
        </div>

        @if (query.text('subjectId') || query.text('actorId')) {
          <div class="flex flex-wrap gap-2 mb-4">
            @if (query.text('subjectId')) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                (click)="query.set({ subjectId: null, subjectName: null, page: 1 })"
              >
                {{ query.text('subjectName', i18n.text('relatedRecord')) }} · {{ 'clear' | t }}
              </button>
            }
            @if (query.text('actorId')) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                (click)="query.set({ actorId: null, actorName: null, page: 1 })"
              >
                {{ query.text('actorName', i18n.text('performedBy')) }} · {{ 'clear' | t }}
              </button>
            }
          </div>
        }

        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
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
    </section>`,
})
export class AuditPage {
  readonly api = inject(WorkspaceApi);

  readonly i18n = inject(I18n);

  readonly data = new Resource<PageOfAuditItem>();

  readonly query = new ListQuery();

  readonly activities = [
    'auth.login',
    'user.created',
    'user.access_changed',
    'role.created',
    'role.permissions_changed',
    'operations.replayed',
  ];

  readonly action = new DebouncedSearch(this.query, 'action');

  readonly activityLabel = (activity: string) =>
    activity === 'all' ? this.i18n.text('allActivity') : this.summary(activity);

  from: Date | null = null;

  until: Date | null = null;

  readonly formatDate = (date: Date) =>
    new Intl.DateTimeFormat(this.i18n.culture(), { dateStyle: 'medium' }).format(date);

  readonly columns = computed(() => {
    this.i18n.culture();

    return column.columns([
      column.accessor('at', {
        header: this.i18n.text('actionDate'),

        cell: (context) => this.i18n.date(context.getValue()),
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
                this.i18n.text(row.original.actorId ? 'deletedAccount' : 'systemActor'),

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

      pageSize: 25,

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

  setActivity(activity: string | null | undefined) {
    this.action.update(!activity || activity === 'all' ? '' : activity);
  }

  applyDates() {
    if (this.from && this.until && this.from > this.until) return;

    void this.query.set({
      from: this.formatQueryDate(this.from),

      until: this.formatQueryDate(this.until),

      page: 1,
    });
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
