import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { CrmRecord, CrmOverview, PageOfCrmRecord } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import {
  Resource,
  WorkspaceUi,
  ListQuery,
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RowActions } from '../shared/workspace-cells';
import { BusinessSelect } from '../shared/business-select';
const column = createColumnHelper<DataTableFeatures, CrmRecord>();

@Component({
  selector: 'app-crm',
  imports: [WorkspaceUi, DataTable, BusinessSelect],
  template: `<app-page-header title="crm" description="crmHelp">
      <a
        hlmBtn
        variant="outline"
        [routerLink]="['/organisations', organisation, 'crm', 'configuration']"
        >{{ 'crmConfiguration' | t }}</a
      >
      <a
        hlmBtn
        [routerLink]="['/organisations', organisation, 'crm', 'new']"
        [queryParams]="{ kind: query.text('kind', '0') }"
        >{{ 'crmNew' | t }}</a
      >
    </app-page-header>
    @if (overview.value(); as overview) {
      <section hlmCard class="mb-6">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'crmOverview' | t }}</h2>
        </div>
        <div hlmCardContent class="flex flex-wrap gap-8">
          <p>{{ 'openDeals' | t }}: {{ overview.openDeals }}</p>
          <p>{{ 'openValue' | t }}: {{ i18n.currency(overview.openValue) }}</p>
          <ul>
            @for (record of overview.recent; track record.id) {
              <li>
                <a [routerLink]="['/organisations', organisation, 'crm', record.id]">{{
                  record.data.name
                }}</a>
                � {{ i18n.date(record.updatedAt) }}
              </li>
            }
          </ul>
        </div>
      </section>
    }
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'crm' | t }}</h2>
        <div class="grid gap-4 sm:grid-cols-3">
          <app-business-select
            controlId="crm-kind"
            label="crmKind"
            [options]="kinds"
            [allowEmpty]="false"
            [value]="query.text('kind', '0')"
            (valueChange)="query.set({ kind: $event, page: 1 })"
          />
          <div hlmField>
            <label hlmFieldLabel for="crm-search">{{ 'search' | t }}</label
            ><input
              hlmInput
              id="crm-search"
              type="search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
            />
          </div>
          <label hlmFieldLabel for="crm-archived"
            ><div hlmField orientation="horizontal">
              <hlm-checkbox
                inputId="crm-archived"
                [ngModel]="query.text('archived') === 'true'"
                (ngModelChange)="query.set({ archived: $event ? 'true' : null, page: 1 })"
              />
              <div>
                <span>{{ 'archived' | t }}</span>
                <p hlmFieldDescription>{{ 'archivedHelp' | t }}</p>
              </div>
            </div></label
          >
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
            [loading]="data.refreshing()"
            [emptyText]="'noResults' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'name')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="size()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
          />
        </app-page-state>
      </div>
    </section>`,
})
export class CrmPage {
  readonly organisation = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly i18n = inject(I18n);
  private readonly api = inject(WorkspaceApi);
  private readonly router = inject(Router);
  readonly data = new Resource<PageOfCrmRecord>();
  readonly overview = new Resource<CrmOverview>();
  readonly busy = signal(false);
  readonly kinds = [
    { id: '0', label: 'contacts' },
    { id: '1', label: 'companies' },
    { id: '2', label: 'deals' },
  ];
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor((x) => x.data.name, { id: 'name', header: this.i18n.text('name') }),
      column.accessor((x) => x.data.email, { id: 'email', header: this.i18n.text('email') }),
      column.accessor((x) => x.data.phone, { id: 'phone', header: this.i18n.text('phone') }),
      ...(this.query.text('kind', '0') === '2'
        ? [
            column.accessor((x) => x.data.value ?? 0, {
              id: 'value',
              header: this.i18n.text('value'),
              cell: (c) => this.i18n.currency(c.getValue()),
            }),
          ]
        : []),
      column.accessor('updatedAt', {
        header: this.i18n.text('updatedAt'),
        cell: (c) => this.i18n.date(c.getValue()),
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions: [
                {
                  label: 'view',
                  run: () =>
                    void this.router.navigate([
                      '/organisations',
                      this.organisation,
                      'crm',
                      row.original.id,
                    ]),
                },
                {
                  label: row.original.archived ? 'restore' : 'archive',
                  disabled: this.busy(),
                  run: () => void this.archive(row.original),
                },
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
    void this.overview.load((signal) =>
      this.api.get(`organisations/${this.organisation}/crm/overview`, {}, signal),
    );
  }
  size() {
    const value = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(value) ? value : DEFAULT_PAGE_SIZE;
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async load() {
    if (
      await this.data.load((signal) =>
        this.api.get(
          `organisations/${this.organisation}/crm`,
          {
            kind: Number(this.query.text('kind', '0')),
            search: this.query.text('search'),
            archived: this.query.text('archived') === 'true',
            pageNumber: this.query.page,
            pageSize: this.size(),
            sort: this.query.text('sort', 'name'),
            direction: this.query.direction('asc'),
          },
          signal,
        ),
      )
    )
      this.query.clamp(this.data.value()?.total, this.size());
  }
  async archive(record: CrmRecord) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`organisations/${this.organisation}/crm/${record.id}/archive`, {
        version: record.version,
        archived: !record.archived,
      });
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
}
