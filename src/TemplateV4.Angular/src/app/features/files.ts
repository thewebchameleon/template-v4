import { Component, computed, inject, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  Confirmations,
  protectUnload,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RecordIdentity, RowActions } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { FileItem, FilePage } from '../api/models';
const column = createColumnHelper<DataTableFeatures, FileItem>();
@Component({
  selector: 'app-files',
  imports: [WorkspaceUi, DataTable],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="files" description="filesIntro"
      ><button hlmBtn (click)="showUpload()">
        <ng-icon name="lucideArrowUpFromLine" />{{ 'uploadFile' | t }}</button
      ><span hlmBadge variant="outline"
        ><ng-icon name="lucideShieldCheck" />{{ 'privateFiles' | t }}</span
      ></app-page-header
    >
    <div class="workspace-columns">
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'fileLibrary' | t }}</h2>
          <p hlmCardDescription>{{ 'fileLibraryHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <div class="workspace-toolbar">
            <div hlmField>
              <label hlmFieldLabel for="file-search">{{ 'search' | t }}</label
              ><input
                hlmInput
                id="file-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="120"
                [placeholder]="'fileSearch' | t"
              />
            </div>
          </div>
          <app-page-state
            [state]="data.state()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
            ><app-data-table
              [columns]="columns()"
              [data]="data.value()?.page?.items ?? []"
              [loading]="data.state() === 'loading' || data.refreshing()"
              [loadingText]="'loading' | t"
              [emptyText]="'filesEmpty' | t"
              [sortColumn]="query.text('sort', 'createdAt')"
              [sortDirection]="query.direction('desc')"
              (sortChange)="sort($event)" /><app-list-pager
              [total]="data.value()?.page?.total ?? 0"
              [page]="query.page"
              (pageChange)="query.set({ page: $event })"
          /></app-page-state>
        </div>
      </section>
      <aside class="workspace-stack">
        <section hlmCard id="upload-panel">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'uploadFile' | t }}</h2>
            <p hlmCardDescription>{{ 'uploadFileHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            <div class="workspace-upload">
              <span class="workspace-icon" aria-hidden="true"
                ><ng-icon name="lucideArrowUpFromLine"
              /></span>
              <div hlmField>
                <label hlmFieldLabel for="file-upload">{{ 'chooseFile' | t }}</label
                ><input
                  hlmInput
                  id="file-upload"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                  [disabled]="busy()"
                  (change)="choose($event)"
                  aria-describedby="upload-help"
                />
                <p hlmFieldDescription id="upload-help">{{ 'uploadLimits' | t }}</p>
                @if (validation()) {
                  <hlm-field-error forceShow>{{ validation() | t }}</hlm-field-error>
                }
              </div>
              @if (selected(); as file) {
                <p class="workspace-meta break-all">{{ file.name }} · {{ bytes(file.size) }}</p>
              }
              @if (uploading()) {
                <progress
                  class="workspace-meter"
                  max="100"
                  [value]="progress()"
                  [attr.aria-label]="'uploadProgress' | t"
                ></progress>
                <p class="workspace-meta" role="status">
                  {{
                    progress() === 100
                      ? ('finishingUpload' | t)
                      : ('uploading' | t) + ' ' + progress() + '%'
                  }}
                </p>
              }
              @if (selected() && !uploading()) {
                <button hlmBtn variant="ghost" (click)="clearSelection()">{{ 'clear' | t }}</button>
              }
              <button
                hlmBtn
                [disabled]="!selected() || busy() || !!validation()"
                (click)="upload()"
              >
                @if (uploading()) {
                  <hlm-spinner />
                }
                {{ 'uploadFile' | t }}
              </button>
            </div>
          </div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'storageUsage' | t }}</h2>
            <p hlmCardDescription>{{ 'storageUsageHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            @if (data.value(); as value) {
              <p class="font-medium mb-3">
                {{ bytes(value.usedBytes) }} / {{ bytes(value.quotaBytes) }}
              </p>
              <progress
                class="workspace-meter"
                [value]="value.usedBytes"
                [max]="value.quotaBytes"
                [attr.aria-label]="'storageUsage' | t"
              ></progress>
            }
            <p class="workspace-meta mt-4">{{ 'fileRetentionHelp' | t }}</p>
            <a routerLink="/privacy" class="workspace-link text-sm mt-3 inline-block">{{
              'privacyAndData' | t
            }}</a>
          </div>
        </section>
      </aside>
    </div>`,
})
export class FilesPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly data = new Resource<FilePage>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  readonly uploading = signal(false);
  readonly progress = signal(0);
  readonly selected = signal<File | null>(null);
  readonly validation = signal('');
  readonly search = new DebouncedSearch(this.query);
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.accessor('name', {
        header: this.i18n.text('fileName'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.name,
              description: row.original.name.split('.').at(-1)?.toUpperCase() ?? '',
            },
          }),
      }),
      column.accessor('size', {
        header: this.i18n.text('fileSize'),
        cell: (c) => this.bytes(c.getValue()),
      }),
      column.accessor('createdAt', {
        header: this.i18n.text('uploadedAt'),
        cell: (c) => this.i18n.date(c.getValue()),
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions: [
                { label: 'download', disabled: busy, run: () => void this.download(row.original) },
                {
                  label: 'delete',
                  disabled: busy,
                  destructive: true,
                  run: () => void this.remove(row.original),
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
  hasUnsavedChanges() {
    return this.selected() !== null || this.uploading();
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  bytes(value: number) {
    if (value < 1024) return this.i18n.number(value) + ' B';
    if (value < 1048576) return this.i18n.number(Math.round(value / 1024)) + ' KB';
    return this.i18n.number(Math.round((value / 1048576) * 10) / 10) + ' MB';
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'files',
        {
          pageNumber: this.query.page,
          pageSize: 25,
          search: this.query.text('search'),
          sort: this.query.text('sort', 'createdAt'),
          direction: this.query.direction('desc'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.page.total);
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  showUpload() {
    document.getElementById('upload-panel')?.scrollIntoView({ block: 'start' });
    document.getElementById('file-upload')?.focus();
  }
  clearSelection() {
    this.selected.set(null);
    this.validation.set('');
    const input = document.getElementById('file-upload') as HTMLInputElement | null;
    if (input) input.value = '';
  }
  choose(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selected.set(file);
    this.validation.set(
      file &&
        (file.size === 0 ||
          file.size > 20 * 1024 * 1024 ||
          !/\.(pdf|png|jpe?g|txt|csv)$/i.test(file.name))
        ? 'uploadValidation'
        : '',
    );
  }
  async upload() {
    const file = this.selected();
    if (!file || this.busy() || this.validation()) return;
    this.busy.set(true);
    this.uploading.set(true);
    this.progress.set(0);
    try {
      await this.api.upload(file, (value) => this.progress.set(value));
      this.selected.set(null);
      const input = document.getElementById('file-upload') as HTMLInputElement | null;
      if (input) input.value = '';
      this.toast.success('fileUploaded');
      await this.load();
    } catch {
      /* Preserve selected file for retry. */
    } finally {
      this.busy.set(false);
      this.uploading.set(false);
    }
  }
  async download(file: FileItem) {
    this.busy.set(true);
    try {
      await this.api.download(`files/${file.id}/download`, file.name);
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
  async remove(file: FileItem) {
    if (
      this.busy() ||
      !(await this.confirm.ask('deleteFileTitle', 'deleteFileHelp', file.name, true))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post(`files/${file.id}/delete`);
      this.toast.success('fileDeleted');
      await this.load();
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
}
