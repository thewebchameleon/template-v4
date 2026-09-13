import { Component, computed, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../shared/confirmation';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { OrganizationFileItem, OrganizationFilePage } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { Runtime } from '../core/runtime';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import {
  Resource,
  WorkspaceUi,
  ListQuery,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  Confirmations,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RowActions } from '../shared/workspace-cells';
const column = createColumnHelper<DataTableFeatures, OrganizationFileItem>();
@Component({
  selector: 'app-organization-files',
  imports: [WorkspaceUi, RouterLink, DataTable],
  template: `<app-page-header title="organizationFiles" description="organizationFilesHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', id]">{{
        'organizationWorkspace' | t
      }}</a></app-page-header
    >
    <section hlmCard class="mb-6">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'uploadFile' | t }}</h2>
        <p hlmCardDescription>{{ 'organizationUploadHelp' | t }}</p>
      </div>
      <form hlmCardContent class="grid gap-4" (ngSubmit)="upload()">
        <div hlmField>
          <label hlmFieldLabel for="organization-file">{{ 'chooseFile' | t }}</label
          ><input
            hlmInput
            id="organization-file"
            type="file"
            [disabled]="busy()"
            (change)="choose($event)"
          />
        </div>
        <button hlmBtn [disabled]="busy() || !file()">{{ 'uploadFile' | t }}</button>
      </form>
    </section>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'organizationFiles' | t }}</h2>
        <p hlmCardDescription>
          {{ 'storageUsed' | t }}: {{ bytes(data.value()?.usedBytes ?? 0) }} /
          {{ bytes(data.value()?.quotaBytes ?? 0) }}
        </p>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.page?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'noResults' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'name')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)" />
          <app-list-pager
            [total]="data.value()?.page?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
        /></app-page-state>
      </div>
    </section>`,
})
export class OrganizationFilesPage {
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly http = inject(HttpClient);
  readonly runtime = inject(Runtime);
  readonly i18n = inject(I18n);
  readonly confirm = inject(Confirmations);
  readonly data = new Resource<OrganizationFilePage>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  readonly file = signal<File | null>(null);
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('name', { header: this.i18n.text('name') }),
      column.accessor('size', {
        header: this.i18n.text('size'),
        cell: (c) => this.bytes(c.getValue()),
      }),
      column.accessor('createdAt', {
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
                  label: 'download',
                  disabled: this.busy(),
                  run: () =>
                    void this.api.download(
                      `customers/${this.id}/files/${row.original.id}`,
                      row.original.name,
                    ),
                },
                ...(row.original.canDelete
                  ? [
                      {
                        label: 'delete',
                        destructive: true,
                        disabled: this.busy(),
                        run: () => void this.remove(row.original),
                      },
                    ]
                  : []),
              ],
            },
          }),
      }),
    ]);
  });
  hasUnsavedChanges() {
    return this.busy() || this.file() != null;
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  constructor() {
    this.query.connect(() => void this.load());
  }
  bytes(value: number) {
    return (
      new Intl.NumberFormat(this.i18n.culture(), { maximumFractionDigits: 2 }).format(
        value / 1024 / 1024,
      ) + ' MiB'
    );
  }
  pageSize() {
    const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
  }
  async load() {
    if (
      await this.data.load((signal) =>
        this.api.get(
          `customers/${this.id}/files`,
          {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            sort: this.query.text('sort', 'name'),
            direction: this.query.direction('asc'),
          },
          signal,
        ),
      )
    )
      this.query.clamp(this.data.value()?.page.total, this.pageSize());
  }
  sort(s: ServerSort) {
    void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
  }
  private fileInput: HTMLInputElement | null = null;
  choose(e: Event) {
    this.fileInput = e.target as HTMLInputElement;
    this.file.set(this.fileInput.files?.[0] ?? null);
  }
  async upload() {
    const file = this.file();
    if (!file || this.busy()) return;
    this.busy.set(true);
    try {
      const headers = await this.auth.browserHeaders();
      await firstValueFrom(
        this.http.post(
          `${this.runtime.apiUrl}/api/v1/auth/customers/${this.id}/files/upload`,
          file,
          {
            params: { name: file.name },
            headers: { ...headers, 'Content-Type': 'application/octet-stream' },
            withCredentials: true,
          },
        ),
      );
      this.file.set(null);
      if (this.fileInput) this.fileInput.value = '';
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
  async remove(file: OrganizationFileItem) {
    if (
      this.busy() ||
      !(await this.confirm.ask('deleteFileTitle', 'deleteFileHelp', file.name, true))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post(`customers/${this.id}/files/${file.id}/delete`);
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
}
