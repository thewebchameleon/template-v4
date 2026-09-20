import { Component, computed, inject } from '@angular/core';
import { FileStorageDemoBanner } from '../files/file-storage-demo-banner';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  Resource,
  ListQuery,
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../shared/data-table';
import { FileItem, FilePage, PublicFileShare } from '../../../api/models';
import { FileStorageFileName } from '../files/file-storage-components';
import { RowActions } from '../../../shared/workspace-cells';
import { I18n } from '../../../core/i18n';
import { Runtime } from '../../../core/runtime';
const column = createColumnHelper<DataTableFeatures, FileItem>();
@Component({
  selector: 'app-public-file-storage',
  imports: [WorkspaceUi, DataTable, FileStorageDemoBanner],
  template: `<div class="mx-auto flex w-full flex-col items-center gap-6 py-8 sm:py-16">
    <section hlmCard size="sm" class="w-full max-w-lg">
      <app-page-state
        [state]="share.state()"
        [refreshError]="share.refreshError()"
        (retry)="load()"
      >
        @if (share.value(); as shared) {
          <div hlmCardHeader>
            <h1 hlmCardTitle>{{ shareMessage(shared) }}</h1>
          </div>
          <div hlmCardContent>
            @if (shared.revoked) {
              <div hlmAlert variant="destructive" role="status">
                <p hlmAlertDescription>{{ 'publicShareRevoked' | t }}</p>
              </div>
            } @else if (!shared.file.isFolder) {
              <button hlmBtn (click)="download(shared.file)">
                {{ 'download' | t }} · {{ shared.file.name }}
              </button>
            } @else {
              <p class="workspace-meta">{{ 'publicFilesHelp' | t }}</p>
            }
          </div>
        }
      </app-page-state>
    </section>

    @if (share.value(); as shared) {
      <app-file-storage-demo-banner
        class="w-full max-w-5xl"
        [enabled]="!shared.revoked && (shared.file.demoMode ?? false)"
        [minutes]="shared.file.demoExpiryMinutes ?? 60"
      />
      @if (!shared.revoked && shared.file.isFolder) {
        <section hlmCard class="w-full max-w-5xl">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'sharedRoot' | t }}</h2>
          </div>
          <div hlmCardContent>
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
                [size]="pageSize()"
                [showSizePicker]="true"
                (pageChange)="query.set({ page: $event })"
                (sizeChange)="query.set({ size: $event, page: 1 })"
            /></app-page-state>
          </div>
        </section>
      }
    }
  </div>`,
})
export class PublicFileStoragePage {
  readonly share = new Resource<PublicFileShare>();
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
  private readonly base = `${this.runtime.apiUrl}/api/v1/auth/file-storage/public`;
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('name', {
        header: this.i18n.text('fileName'),
        cell: ({ row }) =>
          flexRenderComponent(FileStorageFileName, {
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
      await this.share.load(() =>
        firstValueFrom(
          this.http.get<PublicFileShare>(`${this.base}/${this.root}`, { headers: this.headers }),
        ),
      )
    ) {
      const shared = this.share.value();
      if (shared && !shared.revoked && shared.file.isFolder)
        await this.data.load(() =>
          firstValueFrom(
            this.http.get<FilePage>(
              `${this.base}/${this.query.text('folder', this.root)}/children`,
              {
                headers: this.headers,
                params: {
                  pageNumber: this.query.page,
                  pageSize: this.pageSize(),
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
  shareMessage(shared: PublicFileShare) {
    return this.i18n
      .text('publicShareMessage')
      .replace('{displayName}', shared.sharedByDisplayName ?? '')
      .replace('{email}', shared.sharedByEmail ?? '')
      .replace('{filename}', shared.file.name);
  }
  pageSize() {
    const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
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
