import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  Resource,
  ListQuery,
  DebouncedSearch,
  PAGE_SIZE_OPTIONS,
} from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../../../src/TemplateV4.Angular/src/app/shared/data-table';
import { RecordIdentity } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace-cells';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import {
  ContentCollection,
  ContentItemSummary,
  PageOfContentItemSummary,
} from '../../../../../src/TemplateV4.Angular/src/app/api/models';

const column = createColumnHelper<DataTableFeatures, ContentItemSummary>();
@Component({
  selector: 'app-content-items',
  imports: [WorkspaceUi, DataTable],
  template: `<app-page-header title="cmsItems" description="cmsItemHelp">
      <a hlmBtn variant="outline" routerLink="/cms">{{ 'cmsCollections' | t }}</a>
      @if (collection.value()?.actions?.includes('cms.content.edit')) {
        <a hlmBtn [routerLink]="['/cms/collections', key, 'items', 'new']">{{
          'cmsNewItem' | t
        }}</a>
      }
      @if (collection.value()?.actions?.includes('cms.schema.manage')) {
        <a hlmBtn variant="outline" [routerLink]="['/cms/collections', key, 'settings']">{{
          'cmsSchema' | t
        }}</a>
      }
    </app-page-header>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ collection.value()?.label }}</h2>
        <p hlmCardDescription>{{ 'cmsItemHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="mb-4 grid gap-3">
          <hlm-tabs
            [tab]="query.text('state', 'all')"
            (tabActivated)="query.set({ state: $event, page: 1 })"
            ><hlm-tabs-list class="flex-wrap" [attr.aria-label]="'status' | t">
              <button hlmTabsTrigger="all">{{ 'cmsAll' | t }}</button>
              @for (state of states; track state) {
                <button [hlmTabsTrigger]="state">{{ 'cmsState.' + state | t }}</button>
              }
            </hlm-tabs-list></hlm-tabs
          >
          <div hlmField>
            <label hlmFieldLabel for="content-search" class="sr-only">{{ 'search' | t }}</label
            ><input
              hlmInput
              id="content-search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
              [placeholder]="'search' | t"
              maxlength="200"
            />
          </div>
        </div>
        <app-page-state
          [state]="data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
          skeleton="table"
          [skeletonColumns]="columns().length"
        >
          <app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'cmsNoItems' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'updatedAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
          />
        </app-page-state>
      </div>
    </section>`,
})
export class ContentItemsPage {
  private readonly api = inject(WorkspaceApi);
  private readonly route = inject(ActivatedRoute);
  readonly i18n = inject(I18n);
  readonly key = this.route.snapshot.paramMap.get('key')!;
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly collection = new Resource<ContentCollection>();
  readonly data = new Resource<PageOfContentItemSummary>();
  readonly states = ['Draft', 'InReview', 'Approved', 'Published'];
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('title', {
        header: this.i18n.text('cmsTitle'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.title,
              link: '/cms/collections/' + this.key + '/items/' + row.original.id,
            },
          }),
      }),
      column.accessor('state', {
        header: this.i18n.text('status'),
        cell: (c) => this.i18n.text('cmsState.' + c.getValue()),
      }),
      column.accessor('published', {
        header: this.i18n.text('cmsPublished'),
        cell: (c) => this.i18n.text(c.getValue() ? 'yes' : 'no'),
      }),
      column.accessor('updatedAt', {
        header: this.i18n.text('cmsUpdated'),
        cell: (c) => this.i18n.date(c.getValue()),
      }),
    ]);
  });
  constructor() {
    void this.collection.load((signal) => this.api.get('cms/collections/' + this.key, {}, signal));
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    });
  }
  pageSize() {
    const size = Number(this.query.text('size', '10'));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : 10;
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async load() {
    await this.data.load((signal) =>
      this.api.get(
        'cms/collections/' + this.key + '/items',
        {
          search: this.query.text('search'),
          state: this.query.text('state', 'all'),
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          sort: this.query.text('sort', 'updatedAt'),
          direction: this.query.direction('desc'),
        },
        signal,
      ),
    );
    this.query.clamp(this.data.value()?.total, this.pageSize());
  }
}
