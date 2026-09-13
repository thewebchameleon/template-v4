import { Component, computed, inject } from '@angular/core';
import { MyFilesDemoBanner } from './my-files-demo-banner';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, Resource, ListQuery, DebouncedSearch } from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { FileItem, FilePage } from '../api/models';
import { MyFileName } from './my-files-components';
import { RowActions } from '../shared/workspace-cells';
import { I18n } from '../core/i18n';
import { Runtime } from '../core/runtime';
const column = createColumnHelper<DataTableFeatures, FileItem>();
@Component({
  selector: 'app-public-my-files',
  imports: [WorkspaceUi, DataTable, MyFilesDemoBanner],
  template: `<app-page-header title="sharedFiles" description="publicFilesHelp" />
    <app-my-files-demo-banner [enabled]="item.value()?.demoMode ?? false" [minutes]="item.value()?.demoExpiryMinutes ?? 60" />
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ item.value()?.name || ('sharedFiles' | t) }}</h2>
        <p hlmCardDescription>{{ item.value()?.description }}</p>
      </div>
      <div hlmCardContent>
        <app-page-state
          [state]="item.state()"
          [refreshError]="item.refreshError()"
          (retry)="load()"
        >
          @if (item.value()?.isFolder) {
            <button hlmBtn variant="outline" (click)="query.set({ folder: null, page: 1 })">
              {{ 'sharedRoot' | t }}
            </button>
            <div hlmField class="my-4">
              <label hlmFieldLabel for="public-search">{{ 'search' | t }}</label
              ><input
                hlmInput
                id="public-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="120"
              />
            </div>
            <app-page-state
              [state]="data.state()"
              [refreshError]="data.refreshError()"
              (retry)="load()"
              ><app-data-table
                [columns]="columns()"
                [data]="data.value()?.page?.items ?? []"
                [loading]="data.refreshing()"
                [loadingText]="'loading' | t"
                [emptyText]="'filesEmpty' | t"
                [sortColumn]="query.text('sort', 'name')"
                [sortDirection]="query.direction('asc')"
                (sortChange)="sort($event)" /><app-list-pager
                [total]="data.value()?.page?.total ?? 0"
                [page]="query.page"
                [size]="10"
                (pageChange)="query.set({ page: $event })"
            /></app-page-state>
          } @else if (item.value(); as file) {
            <button hlmBtn (click)="download(file)">{{ 'download' | t }} · {{ file.name }}</button>
          }
        </app-page-state>
      </div>
    </section>`,
})
export class PublicMyFilesPage {
  readonly item = new Resource<FileItem>();
  readonly data = new Resource<FilePage>();
  readonly query = new ListQuery('', true);
  readonly search = new DebouncedSearch(this.query);
  readonly i18n = inject(I18n);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly root = this.route.snapshot.paramMap.get('id')!;
  private readonly token = this.route.snapshot.fragment ?? '';
  private readonly headers = { 'X-File-Share': this.token };
  private readonly base = `${this.runtime.apiUrl}/api/v1/auth/my-files/public`;
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('name', {
        header: this.i18n.text('fileName'),
        cell: ({ row }) =>
          flexRenderComponent(MyFileName, {
            inputs: {
              file: row.original,
              open: () =>
                row.original.isFolder
                  ? void this.query.set({ folder: row.original.id, page: 1 })
                  : void this.download(row.original),
            },
          }),
      }),
      column.accessor('size', {
        header: this.i18n.text('fileSize'),
        cell: (c) => this.i18n.number(c.getValue()) + ' B',
      }),
      column.accessor('updatedAt', {
        header: this.i18n.text('updatedAt'),
        cell: (c) => this.i18n.date(c.getValue() || c.row.original.createdAt),
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions: [
                {
                  label: row.original.isFolder ? 'openFolder' : 'download',
                  run: () =>
                    row.original.isFolder
                      ? void this.query.set({ folder: row.original.id, page: 1 })
                      : void this.download(row.original),
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
  async load() {
    if (
      await this.item.load(() =>
        firstValueFrom(
          this.http.get<FileItem>(`${this.base}/${this.root}`, { headers: this.headers }),
        ),
      )
    ) {
      if (this.item.value()?.isFolder)
        await this.data.load(() =>
          firstValueFrom(
            this.http.get<FilePage>(
              `${this.base}/${this.query.text('folder', this.root)}/children`,
              {
                headers: this.headers,
                params: {
                  pageNumber: this.query.page,
                  pageSize: 10,
                  sort: this.query.text('sort', 'name'),
                  direction: this.query.direction('asc'),
                  search: this.query.text('search'),
                },
              },
            ),
          ),
        );
    }
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async download(file: FileItem) {
    try {
      const blob = await firstValueFrom(
        this.http.get(`${this.base}/${file.id}/download`, {
          headers: this.headers,
          responseType: 'blob',
        }),
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      /* Central errors. */
    }
  }
}
