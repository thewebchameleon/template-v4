import { Component, computed, inject, signal } from '@angular/core';
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
} from '../../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../shared/data-table';
import { RecordIdentity } from '../../../shared/workspace-cells';
import { WorkspaceApi } from '../../../core/workspace-api';
import { I18n } from '../../../core/i18n';
import { CmsArticleSummary, PageOfCmsArticleSummary, PublicWebsite } from '../../../api/models';

const column = createColumnHelper<DataTableFeatures, CmsArticleSummary>();
@Component({
  selector: 'app-cms',
  imports: [WorkspaceUi, HlmSelectImports, DataTable],
  providers: [workspaceIcons],
  template: ` <app-page-header title="cms" description="cmsIntro">
      @if (publicBlog(); as url) {
        <a hlmBtn variant="outline" [href]="url" target="_blank" rel="noopener">{{
          'cmsOpenBlog' | t
        }}</a>
      }
      <a hlmBtn routerLink="/cms/new">{{ 'cmsNew' | t }}</a>
      <a hlmBtn variant="outline" routerLink="/cms/sections">{{ 'websiteSections' | t }}</a>
    </app-page-header>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'cmsArticles' | t }}</h2>
        <p hlmCardDescription>{{ 'cmsEditHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="mb-4 grid gap-4 sm:grid-cols-2">
          <div hlmField>
            <label hlmFieldLabel for="cms-search">{{ 'search' | t }}</label>
            <input
              hlmInput
              id="cms-search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
              maxlength="200"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="cms-status">{{ 'status' | t }}</label>
            <hlm-select
              [value]="query.text('status', 'all')"
              [itemToString]="statusLabel"
              (valueChange)="query.set({ status: $event ?? 'all', page: 1 })"
            >
              <hlm-select-trigger buttonId="cms-status" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t">
                <hlm-select-item value="all">{{ 'cmsAll' | t }}</hlm-select-item>
                <hlm-select-item value="draft">{{ 'cmsDraft' | t }}</hlm-select-item>
                <hlm-select-item value="published">{{ 'cmsPublished' | t }}</hlm-select-item>
              </hlm-select-content>
            </hlm-select>
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
            [loading]="data.refreshing()"
            [emptyText]="'cmsEmpty' | t"
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
export class CmsPage {
  readonly publicBlog = signal('');
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly data = new Resource<PageOfCmsArticleSummary>();
  readonly statusLabel = (value: string) =>
    this.i18n.text(
      value === 'draft' ? 'cmsDraft' : value === 'published' ? 'cmsPublished' : 'cmsAll',
    );
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('title', {
        header: this.i18n.text('cmsTitle'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: { label: row.original.title, link: '/cms/' + row.original.id },
          }),
      }),
      column.accessor('published', {
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          this.i18n.text(
            row.original.pendingChanges
              ? 'cmsPending'
              : row.original.published
                ? 'cmsPublished'
                : 'cmsDraft',
          ),
      }),
      column.accessor('updatedAt', {
        header: this.i18n.text('cmsUpdated'),
        cell: (c) => this.i18n.date(c.getValue()),
      }),
    ]);
  });
  constructor() {
    void this.api
      .get<PublicWebsite>('/website')
      .then((site) => {
        if (site.enabled && site.details)
          this.publicBlog.set(site.details.publicUrl.replace(/\/$/, '') + '/blog');
      })
      .catch(() => this.publicBlog.set(''));
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    });
  }
  pageSize() {
    const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async load() {
    await this.data.load((signal) =>
      this.api.get(
        'cms',
        {
          search: this.query.text('search'),
          status: this.query.text('status', 'all'),
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
