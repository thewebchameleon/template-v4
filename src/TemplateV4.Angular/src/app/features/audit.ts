import { Component, computed, inject } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery } from '../shared/workspace';
import { DataTable, DataTableFeatures } from '../shared/data-table';
import { RecordIdentity } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { AuditItem, PageOfAuditItem } from '../api/models';
const column = createColumnHelper<DataTableFeatures, AuditItem>();
@Component({
  selector: 'app-audit',
  imports: [WorkspaceUi, DataTable],
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
        <form class="workspace-toolbar" (ngSubmit)="apply()">
          <div hlmField>
            <label hlmFieldLabel for="audit-action">{{ 'activity' | t }}</label
            ><input
              hlmInput
              id="audit-action"
              name="action"
              [(ngModel)]="action"
              maxlength="100"
              [placeholder]="'auditSearchPlaceholder' | t"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="audit-from">{{ 'fromDate' | t }}</label
            ><input hlmInput id="audit-from" type="date" name="from" [(ngModel)]="from" />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="audit-until">{{ 'untilDate' | t }}</label
            ><input
              hlmInput
              id="audit-until"
              type="date"
              name="until"
              [(ngModel)]="until"
              [min]="from"
            />
          </div>
          <button hlmBtn type="submit">{{ 'applyFilters' | t }}</button
          ><button hlmBtn variant="ghost" type="button" (click)="clear()">{{ 'clear' | t }}</button>
        </form>
        @if (query.text('subjectId') || query.text('actorId')) {
          <p class="workspace-meta mb-4">{{ 'auditPersonFilter' | t }}</p>
        }
        <app-page-state [state]="data.state()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [emptyText]="'auditEmpty' | t" /><app-list-pager
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
  action = '';
  from = '';
  until = '';
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('action', {
        header: this.i18n.text('activity'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: { label: this.summary(row.original.action) },
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
              params: row.original.actorId ? { actorId: row.original.actorId, page: '1' } : {},
            },
          }),
      }),
      column.accessor('subjectName', {
        header: this.i18n.text('relatedRecord'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.subjectName || this.i18n.text('systemRecord'),
              link: row.original.subjectId ? '/audit' : null,
              params: row.original.subjectId
                ? { subjectId: row.original.subjectId, page: '1' }
                : {},
            },
          }),
      }),
      column.accessor('at', {
        header: this.i18n.text('date'),
        cell: (context) => this.i18n.date(context.getValue()),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => {
      this.action = this.query.text('action');
      this.from = this.query.text('from');
      this.until = this.query.text('until');
      void this.load();
    });
  }
  summary(action: string) {
    if (action.startsWith('user.security_changed:')) {
      const match = /d:(True|False)>(True|False):r:(.*)>(.*)/.exec(action);
      if (match)
        return `${this.i18n.text('securityChanged')}: ${this.i18n.text(match[2] === 'True' ? 'disabled' : 'active')} · ${match[3] || '—'} → ${match[4] || '—'}`;
    }
    const key = 'audit.' + action;
    const translated = this.i18n.text(key);
    return translated === key ? action.replaceAll('.', ' · ').replaceAll('_', ' ') : translated;
  }
  load() {
    const params: Record<string, string | number> = {
      pageNumber: this.query.page,
      action: this.query.text('action'),
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
    return this.data.load(() => this.api.get('audit', params));
  }
  apply() {
    if (this.from && this.until && this.from > this.until) return;
    void this.query.set({
      action: this.action || null,
      from: this.from || null,
      until: this.until || null,
      page: 1,
    });
  }
  clear() {
    void this.query.set({
      action: null,
      from: null,
      until: null,
      actorId: null,
      subjectId: null,
      page: 1,
    });
  }
}
