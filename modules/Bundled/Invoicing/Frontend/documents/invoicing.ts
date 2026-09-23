import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { CommercialDocument, PageOfCommercialDocument } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { Features } from '../../../../../src/TemplateV4.Angular/src/app/core/features';
import { Auth } from '../../../../../src/TemplateV4.Angular/src/app/core/auth';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import {
  WorkspaceUi,
  Resource,
  ListQuery,
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../../../src/TemplateV4.Angular/src/app/shared/data-table';
import { RowActions } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace-cells';
const column = createColumnHelper<DataTableFeatures, CommercialDocument>();
export const commercialKinds = ['quotation', 'invoice', 'receipt', 'creditNote'];
@Component({
  selector: 'app-invoicing',
  imports: [WorkspaceUi, DataTable],
  template: ` <app-page-header [title]="title" description="invoicingHelp">
      @if (features.enabled('invoicing')) {
        <a hlmBtn variant="outline" routerLink="/administration/invoicing">{{
          'issuerSettings' | t
        }}</a>
        @if (auth.has('invoicing.issue')) {
          <a hlmBtn [routerLink]="['/organisation', 'invoicing', segment, 'new']">{{
            createLabel | t
          }}</a>
        }
      }
    </app-page-header>
    @if (!features.enabled('invoicing')) {
      <div hlmAlert class="mb-6">
        <p hlmAlertDescription>{{ 'invoicingRetained' | t }}</p>
      </div>
    }
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ title | t }}</h2>
        <div hlmField>
          <label hlmFieldLabel for="invoice-search">{{ 'search' | t }}</label
          ><input
            hlmInput
            id="invoice-search"
            type="search"
            [ngModel]="search.value()"
            (ngModelChange)="search.update($event)"
          />
        </div>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'noResults' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'issuedAt')"
            [sortDirection]="query.direction('desc')"
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
export class InvoicingPage {
  private readonly route = inject(ActivatedRoute);
  readonly kind = this.route.snapshot.data['kind'] as 0 | 1;
  readonly title = this.route.snapshot.data['title'] as string;
  readonly createLabel = this.route.snapshot.data['createLabel'] as string;
  readonly segment = this.kind === 0 ? 'quotes' : 'invoices';
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly i18n = inject(I18n);
  readonly features = inject(Features);
  readonly auth = inject(Auth);
  private readonly api = inject(WorkspaceApi);
  private readonly router = inject(Router);
  readonly data = new Resource<PageOfCommercialDocument>();
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('number', { header: this.i18n.text('documentNumber') }),
      column.accessor((x) => x.snapshot.customer.name, {
        id: 'customer',
        header: this.i18n.text('billTo'),
      }),
      column.accessor('kind', {
        header: this.i18n.text('type'),
        cell: (c) => this.i18n.text(commercialKinds[c.getValue()]),
      }),
      column.accessor('amount', {
        id: 'total',
        header: this.i18n.text('total'),
        cell: (c) => this.i18n.currency(c.getValue()),
      }),
      column.accessor('issuedAt', {
        header: this.i18n.text('createdAt'),
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
                    void this.router.navigate(['/organisation', 'invoicing', row.original.id]),
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
  }
  size() {
    const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
  }
  sort(s: ServerSort) {
    void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
  }
  async load() {
    if (
      await this.data.load((signal) =>
        this.api.get(
          `organisation/invoicing`,
          {
            search: this.query.text('search'),
            group: this.segment,
            pageNumber: this.query.page,
            pageSize: this.size(),
            sort: this.query.text('sort', 'issuedAt'),
            direction: this.query.direction('desc'),
          },
          signal,
        ),
      )
    )
      this.query.clamp(this.data.value()?.total, this.size());
  }
}
