import { ActivatedRoute } from '@angular/router';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { FileQuotaEditor } from './file-quota-editor';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  Confirmations,
  protectUnload,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
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
  imports: [WorkspaceUi, DataTable, HlmDialogImports, FileQuotaEditor],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="files" description="filesIntro">
      @if (!adminOwner) {
        <button hlmBtn (click)="showUpload()">
          <ng-icon name="lucideArrowUpFromLine" />{{ 'uploadFile' | t }}</button
        ><button hlmBtn variant="outline" (click)="edit(null)">{{ 'createFolder' | t }}</button>
      }
      <span hlmBadge variant="outline"
        ><ng-icon name="lucideShieldCheck" />{{ 'privateFiles' | t }}</span
      ></app-page-header
    >
    @if (adminOwner) {
      <p class="mb-4 break-words" role="status">
        {{ 'viewingUserFiles' | t }}: {{ data.value()?.ownerName }}
      </p>
    }
    <div class="workspace-columns">
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle id="file-library-title" tabindex="-1">{{ 'fileLibrary' | t }}</h2>
          <p hlmCardDescription>{{ 'fileLibraryHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <nav
            class="flex flex-wrap items-center gap-2 mb-4"
            [attr.aria-label]="'folderNavigation' | t"
          >
            <button
              hlmBtn
              variant="outline"
              [disabled]="busy() || !query.text('folder')"
              (click)="openFolder(null)"
            >
              {{ 'rootFolder' | t }}
            </button>
            @if (data.value()?.folder; as folder) {
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy()"
                (click)="openFolder(folder.parentId ?? null)"
              >
                {{ 'parentFolder' | t }}
              </button>
              <span class="break-all" aria-current="location" role="status">{{ folder.name }}</span>
            }
          </nav>
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
              [size]="pageSize"
              [showSizePicker]="true"
              [busy]="busy() || data.refreshing()"
              (sizeChange)="query.set({ size: $event, page: 1 })"
              (pageChange)="query.set({ page: $event })"
          /></app-page-state>
        </div>
      </section>
      <aside class="workspace-stack">
        @if (!adminOwner) {
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
                    [disabled]="busy()"
                    (change)="choose($event)"
                    aria-describedby="upload-help"
                    [attr.aria-invalid]="validation() ? true : null"
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
                  <button hlmBtn variant="ghost" (click)="clearSelection()">
                    {{ 'clear' | t }}
                  </button>
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
        }
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
                [max]="value.quotaBytes || 1"
                [attr.aria-label]="'storageUsage' | t"
              ></progress>
            }
            @if (data.value(); as value) {
              @if (value.usedBytes >= value.quotaBytes) {
                <div hlmAlert class="mt-4" role="status">
                  <h3 hlmAlertTitle>{{ 'quotaReached' | t }}</h3>
                  <p hlmAlertDescription>{{ 'quotaReachedHelp' | t }}</p>
                </div>
              }
            }
            @if (adminOwner) {
              <app-file-quota-editor [owner]="adminOwner" (saved)="load()" />
            }
            <p class="workspace-meta mt-4">{{ 'fileRetentionHelp' | t }}</p>
            <a routerLink="/privacy" class="workspace-link text-sm mt-3 inline-block">{{
              'privacyAndData' | t
            }}</a>
          </div>
        </section>
      </aside>
    </div>
    <hlm-dialog
      [state]="editorOpen() ? 'open' : 'closed'"
      (stateChanged)="!busy() && editorOpen.set($event === 'open')"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header
          ><h2 hlmDialogTitle>{{ (editing() ? 'renameFile' : 'createFolder') | t }}</h2>
          <p hlmDialogDescription>{{ 'fileNameHelp' | t }}</p></hlm-dialog-header
        >
        <form class="grid gap-4" (ngSubmit)="saveName()">
          <div hlmField>
            <label hlmFieldLabel for="entry-name">{{ 'entryName' | t }}</label
            ><input
              hlmInput
              id="entry-name"
              name="entryName"
              [(ngModel)]="entryName"
              required
              maxlength="180"
              [disabled]="busy()"
            />
          </div>
          <hlm-dialog-footer
            ><button
              hlmBtn
              variant="outline"
              type="button"
              [disabled]="busy()"
              (click)="editorOpen.set(false)"
            >
              {{ 'cancel' | t }}</button
            ><button hlmBtn type="submit" [disabled]="busy() || !entryName.trim()">
              {{ 'save' | t }}
            </button></hlm-dialog-footer
          >
        </form>
      </hlm-dialog-content>
    </hlm-dialog>`,
})
export class FilesPage {
  readonly quotaEditor = viewChild(FileQuotaEditor);
  readonly adminOwner = inject(ActivatedRoute).snapshot.paramMap.get('ownerId');
  readonly basePath = this.adminOwner ? `files/admin/users/${this.adminOwner}` : 'files';
  readonly editorOpen = signal(false);
  readonly editing = signal<FileItem | null>(null);
  entryName = '';
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
              description: row.original.isFolder
                ? this.i18n.text('folder')
                : (row.original.name.split('.').at(-1)?.toUpperCase() ?? ''),
            },
          }),
      }),
      column.accessor('size', {
        header: this.i18n.text('fileSize'),
        cell: (c) => (c.row.original.isFolder ? '—' : this.bytes(c.getValue())),
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
                {
                  label: row.original.isFolder ? 'openFolder' : 'download',
                  disabled: busy,
                  run: () =>
                    row.original.isFolder
                      ? this.openFolder(row.original.id)
                      : void this.download(row.original),
                },
                ...(!this.adminOwner
                  ? [
                      { label: 'renameFile', disabled: busy, run: () => this.edit(row.original) },
                      {
                        label: 'delete',
                        disabled: busy,
                        destructive: true,
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
  constructor() {
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    });
  }
  hasUnsavedChanges() {
    return (
      this.selected() !== null ||
      this.uploading() ||
      this.editorOpen() ||
      (this.quotaEditor()?.hasUnsavedChanges() ?? false)
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  bytes(value: number) {
    if (value < 1024) return this.i18n.number(value) + ' B';
    if (value < 1048576) return this.i18n.number(Math.round(value / 1024)) + ' KB';
    return this.i18n.number(Math.round((value / 1048576) * 10) / 10) + ' MB';
  }
  private loadedFolder: string | undefined;
  async load() {
    const folder = this.query.text('folder');
    const folderChanged = this.loadedFolder !== undefined && this.loadedFolder !== folder;
    const loaded = await this.data.load((signal) =>
      this.api.get(
        this.basePath,
        {
          ...(this.query.text('folder') ? { parentId: this.query.text('folder') } : {}),
          pageNumber: this.query.page,
          pageSize: this.pageSize,
          search: this.query.text('search'),
          sort: this.query.text('sort', 'createdAt'),
          direction: this.query.direction('desc'),
        },
        signal,
      ),
    );
    if (loaded) {
      this.query.clamp(this.data.value()?.page.total, this.pageSize);
      this.loadedFolder = folder;
      if (folderChanged) document.getElementById('file-library-title')?.focus();
    }
  }
  get pageSize() {
    const size = Number(this.query.text('size'));
    return (PAGE_SIZE_OPTIONS as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE;
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  showUpload() {
    document
      .getElementById('upload-panel')
      ?.scrollIntoView({ block: 'start', behavior: 'instant' });
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
      file && file.size > (this.data.value()?.maxUploadBytes ?? 20 * 1024 * 1024)
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
      await this.api.upload(file, (value) => this.progress.set(value), this.query.text('folder'));
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
      await this.api.download(`${this.basePath}/${file.id}/download`, file.name);
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
  openFolder(id: string | null) {
    if (this.busy()) return;
    this.data.value.set(null);
    void this.query.set({ folder: id, search: null, page: 1 });
  }
  edit(file: FileItem | null) {
    this.editing.set(file);
    this.entryName = file?.name ?? '';
    this.editorOpen.set(true);
  }
  async saveName() {
    if (this.busy() || !this.entryName.trim()) return;
    this.busy.set(true);
    try {
      const entry = this.editing();
      await this.api.post(entry ? `files/${entry.id}/rename` : 'files/folders', {
        name: this.entryName,
        parentId: this.query.text('folder') || null,
      });
      this.editorOpen.set(false);
      this.toast.success(entry ? 'fileRenamed' : 'folderCreated');
      await this.load();
    } catch {
      /* Central errors; keep the draft. */
    } finally {
      this.busy.set(false);
    }
  }
  async remove(file: FileItem) {
    if (
      this.busy() ||
      !(await this.confirm.ask(
        'deleteFileTitle',
        file.isFolder ? 'deleteFolderHelp' : 'deleteFileHelp',
        file.name,
        true,
      ))
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
