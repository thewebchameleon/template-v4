import { StorageUsageCard } from '../../../shared/storage-usage-card';
import { Auth } from '../../../core/auth';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { FileStorageDemoBanner } from './file-storage-demo-banner';
import { NgTemplateOutlet } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronDown,
  lucideChevronsUpDown,
  lucideChevronUp,
  lucideFolderPlus,
  lucideSettings,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { NgScrollbar } from 'ngx-scrollbar';
import {
  FileStorageFileIcon,
  FileStorageFileName,
  FileStorageFileActions,
  FileStorageSelectionCheckbox,
  FileStorageActionDialog,
  FileStorageNavigation,
  fileGroups,
} from './file-storage-components';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { Component, computed, effect, untracked, inject, signal } from '@angular/core';
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
} from '../../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../shared/data-table';
import { type ViewMode } from '../../../shared/view-mode-toggle';
import { canMoveEntry } from './file-storage-ui';
import { simulateSlowUpload } from './file-storage-upload';
import { WorkspaceApi } from '../../../core/workspace-api';
import { I18n } from '../../../core/i18n';
import { Notifications } from '../../notifications/notifications';
import { FileItem, FilePage, FileShareItem } from '../../../api/models';
const column = createColumnHelper<DataTableFeatures, FileItem>();
const parentEntryId = '__file-storage-parent__';
interface PendingUpload {
  file: File;
  parentId: string | null;
}
interface DroppedFile {
  file: File;
  parentPath: readonly string[];
}
interface DroppedItems {
  files: DroppedFile[];
  directories: string[][];
}
interface BrowserFileEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (success: (file: File) => void, failure?: (error: DOMException) => void) => void;
  createReader?: () => {
    readEntries(
      success: (entries: BrowserFileEntry[]) => void,
      failure?: (error: DOMException) => void,
    ): void;
  };
}

async function droppedItems(dataTransfer: DataTransfer): Promise<DroppedItems> {
  const entries = Array.from(dataTransfer.items)
    .filter((item) => item.kind === 'file')
    .map((item) =>
      (item as unknown as { webkitGetAsEntry?: () => BrowserFileEntry | null }).webkitGetAsEntry?.(),
    )
    .filter((entry): entry is BrowserFileEntry => !!entry);
  if (!entries.length) {
    return {
      files: Array.from(dataTransfer.files, (file) => ({ file, parentPath: [] })),
      directories: [],
    };
  }

  const result: DroppedItems = { files: [], directories: [] };
  const readDirectory = async (entry: BrowserFileEntry) => {
    const reader = entry.createReader?.();
    if (!reader) return [];
    const children: BrowserFileEntry[] = [];
    while (true) {
      const page = await new Promise<BrowserFileEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject),
      );
      if (!page.length) return children;
      children.push(...page);
    }
  };
  const walk = async (entry: BrowserFileEntry, parentPath: readonly string[]) => {
    if (entry.isFile && entry.file) {
      const file = await new Promise<File>((resolve, reject) => entry.file!(resolve, reject));
      result.files.push({ file, parentPath });
      return;
    }
    if (!entry.isDirectory) return;
    const path = [...parentPath, entry.name];
    result.directories.push(path);
    for (const child of await readDirectory(entry)) await walk(child, path);
  };
  for (const entry of entries) await walk(entry, []);
  return result;
}
@Component({
  selector: 'app-file-storage',
  imports: [
    WorkspaceUi,
    FileStorageDemoBanner,
    StorageUsageCard,
    DataTable,
    HlmDrawerImports,
    HlmScrollAreaImports,
    NgScrollbar,
    FileStorageFileActions,
    FileStorageActionDialog,
    HlmDialogImports,
    FileStorageFileIcon,
    HlmSelectImports,
    HlmContextMenuImports,
    HlmDropdownMenuImports,
    NgTemplateOutlet,
  ],
  providers: [
    workspaceIcons,
    provideIcons({
      lucideChevronDown,
      lucideChevronsUpDown,
      lucideChevronUp,
      lucideFolderPlus,
      lucideSettings,
      lucideUserPlus,
    }),
  ],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="files" description="filesIntro">
      @if (auth.has('settings.manage')) {
        <a hlmBtn variant="outline" routerLink="/administration/file-storage">
          <ng-icon name="lucideSettings" aria-hidden="true" />{{ 'settings' | t }}
        </a>
      }
    </app-page-header>
    <app-file-storage-demo-banner
      [enabled]="data.value()?.demoMode ?? false"
      [minutes]="data.value()?.demoExpiryMinutes ?? 60"
    />
    <ng-template #itemContextMenu let-file="file">
      <hlm-dropdown-menu>
        <button hlmDropdownMenuItem [disabled]="busy()" (triggered)="download(file)">
          {{ 'download' | t }}
        </button>
        <button
          hlmDropdownMenuItem
          [disabled]="!canModifyFromContext(file)"
          (triggered)="openCopy(file)"
        >
          {{ 'copyItems' | t }}
        </button>
        <button
          hlmDropdownMenuItem
          [disabled]="!canModifyFromContext(file)"
          (triggered)="openMove(file)"
        >
          {{ 'moveFile' | t }}
        </button>
        <button
          hlmDropdownMenuItem
          [disabled]="!canModifyFromContext(file)"
          (triggered)="openRename(file)"
        >
          {{ 'renameFile' | t }}
        </button>
        <button hlmDropdownMenuItem [disabled]="busy()" (triggered)="detail(file, 'fileDetails')">
          {{ 'properties' | t }}
        </button>
        <button
          hlmDropdownMenuItem
          [disabled]="busy() || !canShare(file)"
          (triggered)="openShare(file, false)"
        >
          {{ 'shareFile' | t }}
        </button>
        <button
          hlmDropdownMenuItem
          variant="destructive"
          [disabled]="!canModifyFromContext(file)"
          (triggered)="remove(file)"
        >
          {{ 'delete' | t }}
        </button>
      </hlm-dropdown-menu>
    </ng-template>
    <ng-template #fileGridCard let-file let-selectable="selectable">
      @if (selectable && !isParentEntry(file)) {
        <div class="file-storage-card-selection">
          <hlm-checkbox
            class="file-storage-selection-checkbox"
            [inputId]="'file-grid-select-' + file.id"
            [checked]="isSelected(file)"
            [disabled]="busy()"
            (checkedChange)="setSelected(file, $event)"
          /><label class="sr-only" [for]="'file-grid-select-' + file.id">{{
            selectionLabel(file)
          }}</label>
        </div>
      }
      <button
        class="file-storage-card-open"
        type="button"
        [disabled]="busy()"
        [attr.aria-label]="entryLabel(file)"
        (click)="activateGridEntry($event, file)"
      >
        @if (isParentEntry(file)) {
          <ng-icon name="lucideArrowLeft" class="my-file-icon" aria-hidden="true" />
        } @else {
          <app-my-file-icon [file]="file" />
        }
        <span class="min-w-0 flex-1">
          <span class="block truncate font-medium" [attr.title]="file.name">{{ file.name }}</span>
          @if (!isParentEntry(file)) {
            <span class="workspace-meta block truncate"
              >{{ file.isFolder ? ('folder' | t) : bytes(file.size) }} &middot;
              {{ i18n.date(file.updatedAt || file.createdAt) }}</span
            >
            @if (file.important) {
              <span hlmBadge variant="outline">{{ 'important' | t }}</span>
            }
            @if (file.starred) {
              <span hlmBadge variant="outline">{{ 'starred' | t }}</span>
            }
          }
        </span>
      </button>
      @if (!isParentEntry(file)) {
        <app-my-file-actions [name]="file.name" [actions]="inlineActions(file, busy())" />
      }
    </ng-template>
    @if (group === 'file-storage' && !query.text('folder')) {
      <section hlmCard collapsible class="mb-4 min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'recentFiles' | t }}</h2>
          <p hlmCardDescription>{{ 'recentScopeHelp' | t }}</p>
        </div>
        <div hlmCardContent class="file-storage-recent-content">
          <ul class="file-storage-recent" role="region" [attr.aria-label]="'recentFiles' | t">
            @for (file of (data.value()?.recent ?? []).slice(0, 6); track file.id) {
              <li
                class="file-storage-grid-card file-storage-recent-card"
                [hlmContextMenuTrigger]="itemContextMenu"
                [hlmContextMenuTriggerData]="{ file }"
                [disabled]="contextMenuDisabled(file)"
              >
                <ng-container
                  [ngTemplateOutlet]="fileGridCard"
                  [ngTemplateOutletContext]="{ $implicit: file, selectable: false }"
                />
              </li>
            } @empty {
              <li class="workspace-meta">{{ 'filesEmpty' | t }}</li>
            }
          </ul>
        </div>
      </section>
    }
    <div class="workspace-columns">
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle id="file-library-title" tabindex="-1">
            {{ data.value()?.folder?.name || (groupLabel | t) }}
          </h2>
          <p hlmCardDescription>{{ 'fileLibraryHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <div class="workspace-directory-controls file-storage-controls">
            <div class="file-storage-view-controls">
              <app-view-mode-toggle
                [value]="view()"
                (valueChange)="setView($event)"
                [ariaLabel]="'fileView' | t"
                [listLabel]="'fileListView' | t"
                [gridLabel]="'fileGridView' | t"
              />
            </div>
            <div class="workspace-directory-toolbar file-storage-filter-toolbar">
              <div hlmField class="file-storage-search">
                <label hlmFieldLabel class="sr-only" for="file-search">{{
                  'fileSearchLabel' | t
                }}</label
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
          </div>
          <div
            class="file-storage-selection-toolbar"
            role="toolbar"
            [attr.aria-label]="'selectionActions' | t"
          >
            <button
              hlmBtn
              type="button"
              variant="outline"
              size="sm"
              [disabled]="busy() || allVisibleSelected() || !visibleSelectableItems().length"
              (click)="selectVisible()"
            >
              {{ 'selectAll' | t }}
            </button>
            <button
              hlmBtn
              type="button"
              variant="ghost"
              size="sm"
              [disabled]="busy() || !selectedCount()"
              (click)="clearSelection()"
            >
              {{ 'unselectAll' | t }}
            </button>
            <span class="workspace-meta" role="status">{{ selectionSummary() }}</span>
            @if (selectedCount()) {
              <span class="file-storage-selection-actions">
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  size="sm"
                  [disabled]="busy()"
                  (click)="downloadSelected()"
                >
                  {{ 'download' | t }}
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  size="sm"
                  [disabled]="busy() || !selectedManageable()"
                  (click)="openBulkDestination('move')"
                >
                  {{ 'moveFile' | t }}
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  size="sm"
                  [disabled]="busy() || !selectedManageable()"
                  (click)="openBulkDestination('copy')"
                >
                  {{ 'copyItems' | t }}
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="destructive"
                  size="sm"
                  [disabled]="busy() || !selectedManageable()"
                  (click)="deleteSelected()"
                >
                  {{ 'delete' | t }}
                </button>
              </span>
            } @else {
              <span class="file-storage-selection-actions">
                @if (data.value()?.folder; as folder) {
                  @if (folder.permission === 'owner') {
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      size="sm"
                      [disabled]="busy()"
                      (click)="openRename(folder)"
                    >
                      {{ 'renameFolder' | t }}
                    </button>
                  }
                  <button
                    hlmBtn
                    type="button"
                    variant="outline"
                    size="sm"
                    [disabled]="busy()"
                    (click)="detail(folder, 'fileDetails')"
                  >
                    {{ 'properties' | t }}
                  </button>
                }
                @if (canManage() && group !== 'trash' && !sharingGroup) {
                  <button hlmBtn type="button" size="sm" [disabled]="busy()" (click)="showUpload()">
                    <ng-icon name="lucideArrowUpFromLine" aria-hidden="true" />{{
                      'uploadFiles' | t
                    }}
                  </button>
                  <button
                    hlmBtn
                    type="button"
                    variant="outline"
                    size="sm"
                    [disabled]="busy()"
                    (click)="openCreateFolder()"
                  >
                    <ng-icon name="lucideFolderPlus" aria-hidden="true" />{{ 'createFolder' | t }}
                  </button>
                } @else if (canManage() && group === 'trash') {
                  <button
                    hlmBtn
                    type="button"
                    variant="destructive"
                    size="sm"
                    [disabled]="busy()"
                    (click)="emptyTrash()"
                  >
                    <ng-icon name="lucideTrash2" aria-hidden="true" />{{ 'emptyTrash' | t }}
                  </button>
                }
              </span>
            }
          </div>
          <app-page-state
            [state]="data.state()"
            [refreshing]="view() === 'grid' && data.refreshing()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
          >
            @if (view() === 'list') {
              <app-data-table
                class="file-storage-list-drop-area"
                [class.file-storage-drop-target]="fileAreaDropActive()"
                [columns]="columns()"
                fillColumn="name"
                [rowActionLabel]="entryLabel"
                [rowSelectionActionLabel]="selectionLabel"
                [rowContextMenu]="itemContextMenu"
                [rowContextMenuDisabled]="contextMenuDisabled"
                (rowAction)="openEntry($event)"
                (rowSelectionAction)="toggleSelection($event)"
                [data]="displayItems()"
                [rowDraggable]="canDragEntry"
                [rowDragging]="isDraggedEntry"
                [rowDropActive]="isActiveDropTarget"
                (rowDragStart)="startEntryDrag($event.event, $event.row)"
                (rowDragEnd)="endEntryDrag()"
                (rowDragOver)="overEntryDrop($event.event, $event.row)"
                (rowDragLeave)="leaveEntryDrop($event.event, $event.row)"
                (rowDrop)="dropEntry($event.event, $event.row)"
                (dragover)="overFileArea($event)"
                (dragleave)="leaveFileArea($event)"
                (drop)="dropFileArea($event)"
                [loading]="data.state() === 'loading' || data.refreshing()"
                [loadingText]="'loading' | t"
                [emptyText]="'filesEmpty' | t"
                [sortColumn]="query.text('sort', 'updatedAt')"
                [sortDirection]="query.direction('desc')"
                (sortChange)="sort($event)"
              />
            } @else {
              <div class="file-storage-grid-sort" role="toolbar" [attr.aria-label]="'sort' | t">
                @for (
                  option of [
                    { column: 'name', label: 'fileName' },
                    { column: 'size', label: 'fileSize' },
                    { column: 'updatedAt', label: 'updatedAt' },
                  ];
                  track option.column
                ) {
                  <button
                    hlmBtn
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="-ms-[calc(var(--spacing)*2.5+1px)]"
                    [attr.aria-pressed]="query.text('sort', 'updatedAt') === option.column"
                    (click)="toggleGridSort(option.column)"
                  >
                    {{ option.label | t }}
                    <ng-icon [name]="gridSortIcon(option.column)" aria-hidden="true" />
                  </button>
                }
              </div>
              <ul
                class="file-storage-grid"
                [class.file-storage-drop-target]="fileAreaDropActive()"
                [attr.aria-label]="'files' | t"
                [attr.aria-busy]="data.refreshing()"
                (dragover)="overFileArea($event)"
                (dragleave)="leaveFileArea($event)"
                (drop)="dropFileArea($event)"
              >
                @for (file of displayItems(); track file.id) {
                  <li
                    class="file-storage-grid-card"
                    [attr.draggable]="canDragEntry(file) ? 'true' : null"
                    [class.opacity-50]="isDraggedEntry(file)"
                    [class.file-storage-drop-target]="isActiveDropTarget(file)"
                    [class.file-storage-selected]="isSelected(file)"
                    [hlmContextMenuTrigger]="itemContextMenu"
                    [hlmContextMenuTriggerData]="{ file }"
                    [disabled]="contextMenuDisabled(file)"
                    (dragstart)="startEntryDrag($event, file)"
                    (dragend)="endEntryDrag()"
                    (dragover)="overEntryDrop($event, file)"
                    (dragleave)="leaveEntryDrop($event, file)"
                    (drop)="dropEntry($event, file)"
                  >
                    <ng-container
                      [ngTemplateOutlet]="fileGridCard"
                      [ngTemplateOutletContext]="{ $implicit: file, selectable: group !== 'trash' }"
                    />
                  </li>
                } @empty {
                  <li class="col-span-full flex h-14">
                    <div hlmEmpty variant="compact" role="status">
                      <div hlmEmptyHeader variant="compact">
                        <p hlmEmptyTitle variant="compact">{{ 'filesEmpty' | t }}</p>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
            <app-list-pager
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
        @if (canManage() && group !== 'trash' && !sharingGroup) {
          <section hlmCard id="upload-panel" class="file-storage-upload-card">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'uploadFiles' | t }}</h2>
              <p hlmCardDescription>{{ 'uploadFilesHelp' | t }}</p>
            </div>
            <div hlmCardContent class="file-storage-upload-content grid gap-3">
              @if (uploading()) {
                <div
                  class="file-storage-upload-progress"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  [attr.aria-valuenow]="progress()"
                  [attr.aria-label]="'uploadProgress' | t"
                  [style.width.%]="progress()"
                ></div>
              }
              <input
                id="file-upload"
                type="file"
                hidden
                multiple
                [disabled]="busy()"
                (change)="choose($event)"
              />
              @if (uploading()) {
                <div
                  class="file-storage-dropzone"
                  (dragover)="$event.preventDefault()"
                  (drop)="$event.preventDefault()"
                >
                  <div role="status" class="grid gap-1 min-w-0 w-full">
                    <span class="font-medium truncate" [title]="currentUpload()?.name">{{
                      currentUpload()?.name
                    }}</span>
                    <span class="workspace-meta"
                      >{{ 'uploadFileNumber' | t }} {{ uploadIndex() }} {{ 'uploadOf' | t }}
                      {{ uploadCount() }} · {{ 'uploading' | t }} {{ progress() }}%</span
                    >
                  </div>
                  <button
                    hlmBtn
                    variant="destructive"
                    type="button"
                    (click)="cancelUpload()"
                    size="xs"
                    [disabled]="uploadCancelled()"
                  >
                    {{ 'cancel' | t }}
                  </button>
                </div>
              } @else {
                <button
                  type="button"
                  class="file-storage-dropzone"
                  [class.file-storage-drop-target]="uploadDragOver()"
                  [disabled]="busy()"
                  (click)="showUpload()"
                  (dragover)="overUpload($event)"
                  (dragleave)="uploadDragOver.set(false)"
                  (drop)="dropUpload($event)"
                >
                  <span class="font-medium">{{ 'dropFileHere' | t }}</span>
                  <span class="workspace-meta">{{ 'browseFileHelp' | t }}</span>
                  <span class="workspace-meta">{{ 'uploadLimits' | t }}</span>
                </button>
              }
              @if (validation()) {
                <hlm-field-error forceShow>{{ validation() | t }}</hlm-field-error>
              }
              @if (!uploading() && uploadCancelled()) {
                <p class="workspace-meta" role="status">{{ 'uploadBatchCancelled' | t }}</p>
              }
              @if (!uploading() && failedUploads().length) {
                <div class="grid gap-2">
                  <p class="workspace-meta" role="status">{{ 'uploadFailedFiles' | t }}</p>
                  <ul class="workspace-meta">
                    @for (upload of failedUploads(); track $index) {
                      <li class="break-all">{{ upload.file.name }}</li>
                    }
                  </ul>
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    [disabled]="busy()"
                    (click)="retryFailedUploads()"
                  >
                    {{ 'retryFailedUploads' | t }}
                  </button>
                </div>
              }
            </div>
          </section>
        }
        <app-storage-usage-card [usage]="data.value()" />
      </aside>
    </div>
    <app-file-storage-action-dialog
      fieldId="page-file-action"
      [mode]="actionMode()"
      [description]="actionDescription()"
      [destinations]="pageMoveDestinations()"
      [busy]="busy()"
      (cancelled)="cancelAction()"
      (createFolder)="createFolder($event)"
      (renameFolder)="renameEntry($event)"
      (move)="move($event)"
      (copy)="copy($event)"
    />
    <hlm-dialog
      [state]="shareOpen() ? 'open' : 'closed'"
      (stateChanged)="!busy() && shareOpen.set($event === 'open')"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header
          ><h2 hlmDialogTitle>{{ 'shareFile' | t }}</h2></hlm-dialog-header
        >
        @if (shareLink()) {
          <div class="grid gap-4">
            <p role="status">{{ 'shareEmailSent' | t }}</p>
            <div hlmField>
              <label hlmFieldLabel for="share-link">{{ 'shareLink' | t }}</label>
              <input hlmInput id="share-link" [value]="shareLink()" readonly />
            </div>
            <hlm-dialog-footer>
              <button hlmBtn variant="outline" type="button" (click)="copyShareLink()">
                {{ 'copyShareLink' | t }}
              </button>
              <button hlmBtn type="button" (click)="shareOpen.set(false)">
                {{ 'done' | t }}
              </button>
            </hlm-dialog-footer>
          </div>
        } @else {
        <form class="grid gap-4" (ngSubmit)="share()">
          <div hlmField>
            <label hlmFieldLabel for="share-email">{{ 'shareEmail' | t }}</label
            ><input
              hlmInput
              type="email"
              id="share-email"
              name="email"
              [(ngModel)]="shareEmail"
              maxlength="254"
              required
              [disabled]="busy()"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="share-role">{{ 'sharePermission' | t }}</label
            ><hlm-select [(value)]="sharePermission"
              ><hlm-select-trigger [buttonId]="'share-role'"
                ><hlm-select-value [placeholder]="'viewer' | t" /></hlm-select-trigger
              ><hlm-select-content *hlmSelectPortal
                ><hlm-select-item value="viewer">{{ 'viewer' | t }}</hlm-select-item
                ><hlm-select-item value="editor">{{
                  'editor' | t
                }}</hlm-select-item></hlm-select-content
              ></hlm-select
            >
          </div>
          <hlm-dialog-footer
            ><button
              hlmBtn
              variant="outline"
              type="button"
              [disabled]="busy()"
              (click)="shareOpen.set(false)"
            >
              {{ 'cancel' | t }}</button
            ><button hlmBtn type="submit" [disabled]="busy() || !shareEmail.trim()">
              {{ 'createShare' | t }}
            </button></hlm-dialog-footer
          >
        </form>
        }
      </hlm-dialog-content>
    </hlm-dialog>
    <hlm-drawer
      direction="right"
      [state]="detailMode() ? 'open' : 'closed'"
      [closeLabel]="'close' | t"
      (stateChanged)="$event === 'closed' && detailMode.set('')"
    >
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-lg">
        <hlm-drawer-header
          ><h2 hlmDrawerTitle>
            {{ (detailMode() === 'fileDetails' ? 'properties' : detailMode()) | t }}
          </h2>
          <p hlmDrawerDescription>
            {{ (detailFile()?.isFolder ? 'manageFolderDetails' : 'manageFileDetails') | t }}
          </p></hlm-drawer-header
        >
        <ng-scrollbar hlm hlmDrawerBody orientation="vertical" class="min-h-0 flex-1">
          <div class="grid content-start gap-4">
            @if (detailMode() === 'fileDetails') {
              @if (detailFile(); as file) {
                <div class="grid gap-4">
                  <div class="flex items-center gap-3">
                    <app-my-file-icon [file]="file" /><span class="font-medium break-all">{{
                      file.name
                    }}</span>
                  </div>
                  <dl class="file-storage-metadata">
                    <dt>{{ 'fileKind' | t }}</dt>
                    <dd>
                      {{
                        (file.isFolder ? 'folder' : 'fileType.' + (file.category || 'other')) | t
                      }}
                    </dd>
                    @if (!file.isFolder) {
                      <dt>{{ 'fileSize' | t }}</dt>
                      <dd>{{ bytes(file.size) }}</dd>
                      <dt>{{ 'fileContentType' | t }}</dt>
                      <dd>{{ file.contentType }}</dd>
                    }
                    <dt>{{ 'fileLocation' | t }}</dt>
                    <dd>{{ fileLocation(file) }}</dd>
                    <dt>{{ 'fileCreatedAt' | t }}</dt>
                    <dd>{{ i18n.date(file.createdAt) }}</dd>
                    <dt>{{ 'updatedAt' | t }}</dt>
                    <dd>{{ i18n.date(file.updatedAt || file.createdAt) }}</dd>
                    <dt>{{ 'sharePermission' | t }}</dt>
                    <dd>
                      {{
                        (file.permission === 'owner' ? 'fileOwner' : file.permission || 'viewer')
                          | t
                      }}
                    </dd>
                  </dl>
                  @if (canEditDetails(file)) {
                    <label
                      hlmFieldLabel
                      for="detail-important"
                      class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          inputId="detail-important"
                          [checked]="file.important ?? false"
                          [disabled]="busy()"
                          (checkedChange)="updateFlag(file, 'important', $event)"
                        /><span>{{ 'important' | t }}</span>
                      </div></label
                    >
                    <label
                      hlmFieldLabel
                      for="detail-starred"
                      class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          inputId="detail-starred"
                          [checked]="file.starred ?? false"
                          [disabled]="busy()"
                          (checkedChange)="updateFlag(file, 'starred', $event)"
                        /><span>{{ 'starred' | t }}</span>
                      </div></label
                    >
                  } @else {
                    <dl class="file-storage-metadata">
                      <dt>{{ 'important' | t }}</dt>
                      <dd>{{ (file.important ? 'fileYes' : 'fileNo') | t }}</dd>
                      <dt>{{ 'starred' | t }}</dt>
                      <dd>{{ (file.starred ? 'fileYes' : 'fileNo') | t }}</dd>
                    </dl>
                  }
                  <button
                    hlmBtn
                    class="w-full"
                    size="lg"
                    type="button"
                    [disabled]="busy()"
                    (click)="download(file)"
                  >
                    <ng-icon name="lucideArrowDownToLine" aria-hidden="true" />{{ 'download' | t }}
                  </button>
                  @if (canShare(file)) {
                    <button
                      hlmBtn
                      class="w-full"
                      variant="outline"
                      type="button"
                      [disabled]="busy()"
                      (click)="openShare(file)"
                    >
                      <ng-icon name="lucideUserPlus" aria-hidden="true" />{{ 'shareFile' | t }}
                    </button>
                    <section class="grid gap-3" aria-labelledby="shared-people-title">
                      <h3 id="shared-people-title" class="font-medium">{{ 'sharedPeople' | t }}</h3>
                      <ul class="grid gap-3">
                        @for (share of peopleShares(); track share.id) {
                          <li class="flex flex-wrap items-center gap-2">
                            <span class="min-w-0 flex-1 break-all">{{ share.recipient }}</span>
                            <span hlmBadge variant="secondary">{{ share.permission | t }}</span>
                            <button
                              hlmBtn
                              variant="outline"
                              size="sm"
                              type="button"
                              [disabled]="busy()"
                              (click)="revoke(share)"
                            >
                              {{ 'revokeShare' | t }}
                            </button>
                          </li>
                        } @empty {
                          <li class="workspace-meta" role="status">{{ 'notSharedYet' | t }}</li>
                        }
                      </ul>
                    </section>
                  }
                  @if (detailActions(file, busy()).length) {
                    <div
                      class="flex flex-wrap gap-2"
                      role="group"
                      [attr.aria-label]="'actions' | t"
                    >
                      @for (action of detailActions(file, busy()); track action.label) {
                        <button
                          hlmBtn
                          type="button"
                          [variant]="action.destructive ? 'destructive' : 'outline'"
                          [disabled]="action.disabled"
                          (click)="action.run()"
                        >
                          {{ action.label | t }}
                        </button>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        </ng-scrollbar>
      </hlm-drawer-content>
    </hlm-drawer>`,
})
export class FileStoragePage {
  readonly auth = inject(Auth);
  readonly canManage = computed(() => this.auth.has('organisation.files.manage'));
  readonly Math = Math;
  readonly navigation = inject(FileStorageNavigation);
  readonly actionMode = signal<'create' | 'rename' | 'move' | 'copy' | ''>('');
  readonly bulkAction = signal(false);
  readonly detailMode = signal('');
  readonly detailFile = signal<FileItem | null>(null);
  readonly shares = signal<FileShareItem[]>([]);
  readonly peopleShares = computed(() => this.shares().filter((share) => !!share.recipient));
  readonly shareOpen = signal(false);
  readonly shareLink = signal('');
  shareEmail = '';
  sharePermission = 'viewer';
  get group() {
    return this.query.text('group', 'file-storage');
  }
  get groupLabel() {
    return fileGroups.find((x) => x.id === this.group)?.label ?? 'files';
  }
  get sharingGroup() {
    return this.group === 'shared' || this.group === 'shared-with-someone';
  }
  readonly selectedEntries = signal<ReadonlyMap<string, FileItem>>(new Map());
  readonly selectedCount = computed(() => this.selectedEntries().size);
  readonly selectedManageable = computed(
    () =>
      this.selectedCount() > 0 &&
      [...this.selectedEntries().values()].every((file) => file.permission === 'owner'),
  );
  readonly visibleSelectableItems = computed(() =>
    this.group === 'trash' ? [] : this.displayItems().filter((file) => !this.isParentEntry(file)),
  );
  readonly allVisibleSelected = computed(() => {
    const items = this.visibleSelectableItems();
    const selected = this.selectedEntries();
    return items.length > 0 && items.every((file) => selected.has(file.id));
  });
  readonly isSelected = (file: FileItem) => this.selectedEntries().has(file.id);
  readonly selectionLabel = (file: FileItem) => {
    return `${this.i18n.text('selectItem')}: ${file.name}`;
  };
  selectionSummary() {
    return this.i18n
      .text(this.selectedCount() === 1 ? 'oneItemSelected' : 'itemsSelected')
      .replace('{count}', this.i18n.number(this.selectedCount()));
  }
  setSelected(file: FileItem, selected: boolean) {
    if (this.busy() || this.isParentEntry(file) || this.group === 'trash') return;
    this.selectedEntries.update((current) => {
      const next = new Map(current);
      if (selected) next.set(file.id, file);
      else next.delete(file.id);
      return next;
    });
  }
  toggleSelection(file: FileItem) {
    this.setSelected(file, !this.isSelected(file));
  }
  activateGridEntry(event: MouseEvent, file: FileItem) {
    if (event.detail < 2) this.openEntry(file);
  }
  selectVisible() {
    if (this.busy()) return;
    this.selectedEntries.update((current) => {
      const next = new Map(current);
      for (const file of this.visibleSelectableItems()) next.set(file.id, file);
      return next;
    });
  }
  clearSelection() {
    if (!this.busy()) this.selectedEntries.set(new Map());
  }
  readonly entryLabel = (file: FileItem) =>
    this.i18n.text(
      this.isParentEntry(file) ? 'parentFolder' : file.isFolder ? 'openFolder' : 'properties',
    ) + (this.isParentEntry(file) ? '' : ': ' + file.name);
  openEntry(file: FileItem) {
    if (this.busy()) return;
    if (this.isParentEntry(file)) this.openFolder(file.parentId ?? null);
    else if (file.isFolder) this.openFolder(file.id);
    else void this.detail(file, 'fileDetails');
  }
  readonly contextMenuDisabled = (file: FileItem) => this.busy() || this.isParentEntry(file);
  canModifyFromContext(file: FileItem) {
    return !this.busy() && this.group !== 'trash' && file.permission === 'owner';
  }
  isParentEntry(file: FileItem) {
    return file.id === parentEntryId;
  }
  fileLocation(file: FileItem) {
    const parent = this.data.value()?.folders?.find((folder) => folder.id === file.parentId);
    return parent
      ? this.folderPath(parent)
      : this.i18n.text(file.parentId ? 'fileSharedLocation' : 'rootFolder');
  }
  canEditDetails(file: FileItem) {
    return file.permission !== 'viewer';
  }
  canShare(file: FileItem) {
    return this.group !== 'trash' && file.permission === 'owner';
  }
  detailActions(file: FileItem, busy: boolean) {
    return this.actions(file, busy).filter(
      (action) =>
        action.label !== 'download' &&
        action.label !== 'openFolder' &&
        action.label !== 'properties' &&
        action.label !== 'shareFile',
    );
  }
  inlineActions(file: FileItem, busy: boolean) {
    if (this.group === 'trash') return [];
    return this.actions(file, busy).filter(
      (action) => action.label === 'download' || action.label === 'delete',
    );
  }
  async restoreFile(file: FileItem) {
    if (await this.mutate(`${file.id}/restore`)) this.detailMode.set('');
  }
  actions(file: FileItem, busy: boolean) {
    if (this.group === 'trash' && file.permission !== 'owner')
      return file.isFolder
        ? [{ label: 'openFolder', disabled: busy, run: () => this.openFolder(file.id) }]
        : [];
    if (this.group === 'trash')
      return [
        { label: 'restore', disabled: busy, run: () => void this.restoreFile(file) },
        {
          label: 'deletePermanently',
          disabled: busy,
          destructive: true,
          run: () => void this.purge(file),
        },
      ];
    return [
      {
        label: file.isFolder ? 'openFolder' : 'download',
        disabled: busy,
        run: () => (file.isFolder ? this.openFolder(file.id) : void this.download(file)),
      },
      ...(file.permission !== 'viewer'
        ? [
            {
              label: 'properties',
              disabled: busy,
              run: () => void this.detail(file, 'fileDetails'),
            },
          ]
        : []),
      ...(file.permission === 'owner'
        ? [
            ...(file.isFolder
              ? [{ label: 'renameFolder', disabled: busy, run: () => this.openRename(file) }]
              : []),
            { label: 'moveFile', disabled: busy, run: () => this.openMove(file) },
            { label: 'shareFile', disabled: busy, run: () => void this.openShare(file) },
            {
              label: 'delete',
              disabled: busy,
              destructive: true,
              run: () => void this.remove(file),
            },
          ]
        : []),
    ];
  }
  moveFolders() {
    const folders = this.data.value()?.folders ?? [];
    const excluded = new Set(
      this.bulkAction()
        ? [...this.selectedEntries().values()]
            .filter((file) => file.isFolder)
            .map((file) => file.id)
        : [this.detailFile()?.id],
    );
    let changed = true;
    while (changed) {
      changed = false;
      for (const f of folders)
        if (excluded.has(f.parentId ?? '') && !excluded.has(f.id)) {
          excluded.add(f.id);
          changed = true;
        }
    }
    return folders.filter((f) => !excluded.has(f.id));
  }
  pageMoveDestinations() {
    const source = this.detailFile();
    const folders = this.data.value()?.folders ?? [];
    const mode = this.actionMode();
    if (mode !== 'move' && mode !== 'copy') return [];
    if (!this.bulkAction() && !source) return [];
    const sources = this.bulkAction() ? [...this.selectedEntries().values()] : [source!];
    const available = (destination: string | null) =>
      mode === 'copy' ||
      sources.every(
        (file) => file.parentId === destination || canMoveEntry(file, destination, folders),
      );
    return [
      {
        value: 'root',
        label: this.i18n.text('files'),
        disabled: !available(null),
      },
      ...this.moveFolders()
        .filter((folder) => available(folder.id))
        .map((folder) => ({ value: folder.id, label: this.folderPath(folder) })),
    ];
  }
  actionDescription() {
    if (this.actionMode() === 'move' || this.actionMode() === 'copy')
      return this.bulkAction() ? this.selectionSummary() : (this.detailFile()?.name ?? '');
    if (this.actionMode() === 'rename') return this.detailFile()?.name ?? '';
    return this.data.value()?.folder?.name ?? this.i18n.text('files');
  }
  folderPath(file: FileItem) {
    let path = file.name;
    let parent = file.parentId;
    const seen = new Set<string>();
    while (parent && !seen.has(parent)) {
      seen.add(parent);
      const folder = this.data.value()?.folders?.find((f) => f.id === parent);
      if (!folder) break;
      path = folder.name + ' / ' + path;
      parent = folder.parentId;
    }
    return path;
  }
  async detail(file: FileItem, mode: string) {
    this.detailFile.set(file);
    this.shares.set([]);
    this.shareEmail = '';
    this.sharePermission = 'viewer';
    this.detailMode.set(mode);
    this.busy.set(true);
    try {
      if (mode === 'fileDetails' && this.canShare(file))
        this.shares.set(await this.api.get<FileShareItem[]>(`file-storage/${file.id}/shares`));
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
  async openShare(file: FileItem, openProperties = true) {
    if (this.busy() || !this.canShare(file)) return;
    if (openProperties) {
      if (this.detailFile()?.id !== file.id || this.detailMode() !== 'fileDetails')
        await this.detail(file, 'fileDetails');
      if (this.detailFile()?.id !== file.id || this.detailMode() !== 'fileDetails') return;
    } else {
      this.detailMode.set('');
      this.detailFile.set(file);
      this.shares.set([]);
      this.busy.set(true);
      try {
        this.shares.set(await this.api.get<FileShareItem[]>(`file-storage/${file.id}/shares`));
      } catch {
        /* Central errors. */
      } finally {
        this.busy.set(false);
      }
    }
    this.shareEmail = '';
    this.sharePermission = 'viewer';
    this.shareLink.set('');
    this.shareOpen.set(true);
  }
  async updateFlag(file: FileItem, flag: 'important' | 'starred', checked: boolean) {
    if (this.busy() || !this.canEditDetails(file)) return;
    const updated = { ...file, [flag]: checked };
    this.detailFile.set(updated);
    this.busy.set(true);
    try {
      await this.api.post(`file-storage/${file.id}/metadata`, {
        important: updated.important ?? false,
        starred: updated.starred ?? false,
      });
      this.toast.success('fileStorageSaved');
      await this.load();
      this.navigation.refresh();
    } catch {
      this.detailFile.set(file);
    } finally {
      this.busy.set(false);
    }
  }
  async mutate(path: string, body: unknown = {}, success = 'fileStorageSaved') {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`file-storage/${path}`, body);
      await this.load();
      this.navigation.refresh();
      this.toast.success(success);
      return true;
    } catch {
      return false;
    } finally {
      this.busy.set(false);
    }
  }
  openMove(file: FileItem) {
    if (this.busy()) return;
    this.bulkAction.set(false);
    this.detailFile.set(file);
    this.actionMode.set('move');
  }
  openCopy(file: FileItem) {
    if (this.busy() || file.permission !== 'owner') return;
    this.bulkAction.set(false);
    this.detailFile.set(file);
    this.actionMode.set('copy');
  }
  openRename(file: FileItem) {
    if (this.busy() || file.permission !== 'owner') return;
    this.bulkAction.set(false);
    this.detailFile.set(file);
    this.actionMode.set('rename');
  }
  async renameEntry(name: string) {
    const file = this.detailFile();
    if (!file || file.permission !== 'owner') return;
    if (await this.mutate(`${file.id}/rename`, { name }, 'fileRenamed')) {
      const updated = { ...file, name };
      this.detailFile.set(updated);
      this.cancelAction();
    }
  }
  openBulkDestination(mode: 'move' | 'copy') {
    if (this.busy() || !this.selectedManageable()) return;
    this.bulkAction.set(true);
    this.actionMode.set(mode);
  }
  cancelAction() {
    this.actionMode.set('');
    this.bulkAction.set(false);
  }
  async move(destination: string) {
    if (this.bulkAction()) {
      if (
        await this.mutate('batch/move', {
          ids: [...this.selectedEntries().keys()],
          parentId: destination === 'root' ? null : destination,
        })
      ) {
        this.clearSelection();
        this.cancelAction();
      }
      return;
    }
    const file = this.detailFile();
    if (!file) return;
    if (
      await this.mutate(`${file.id}/move`, {
        parentId: destination === 'root' ? null : destination,
      })
    ) {
      this.actionMode.set('');
      this.detailMode.set('');
    }
  }
  async copy(destination: string) {
    const ids = this.bulkAction()
      ? [...this.selectedEntries().keys()]
      : this.detailFile()
        ? [this.detailFile()!.id]
        : [];
    if (!ids.length || (this.bulkAction() && !this.selectedManageable())) return;
    if (
      await this.mutate('batch/copy', {
        ids,
        parentId: destination === 'root' ? null : destination,
      })
    ) {
      if (this.bulkAction()) this.clearSelection();
      this.cancelAction();
    }
  }
  async downloadSelected() {
    if (this.busy() || !this.selectedCount()) return;
    this.busy.set(true);
    try {
      await this.api.downloadPost(
        'file-storage/batch/download',
        { ids: [...this.selectedEntries().keys()] },
        'files.zip',
      );
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
  async deleteSelected() {
    if (
      this.busy() ||
      !this.selectedManageable() ||
      !(await this.confirm.ask(
        'deleteSelectedTitle',
        'deleteSelectedHelp',
        this.selectionSummary(),
        true,
        'delete',
      ))
    )
      return;
    if (await this.mutate('batch/delete', { ids: [...this.selectedEntries().keys()] }))
      this.clearSelection();
  }
  async purge(file: FileItem) {
    if (await this.confirm.ask('deletePermanently', 'purgeFileHelp', file.name, true))
      if (await this.mutate(`${file.id}/purge`)) this.detailMode.set('');
  }
  async emptyTrash() {
    if (await this.confirm.ask('emptyTrash', 'purgeFileHelp', '', true))
      await this.mutate('trash/empty');
  }
  async share() {
    if (this.busy() || !this.shareEmail.trim()) return;
    this.busy.set(true);
    try {
      const file = this.detailFile()!;
      const created = await this.api.post<FileShareItem>(`file-storage/${file.id}/shares`, {
        email: this.shareEmail.trim(),
        permission: this.sharePermission,
        expiresAt: null,
      });
      this.shareLink.set(`${location.origin}/shared-files/${file.id}#${created.token}`);
      this.shares.set(await this.api.get<FileShareItem[]>(`file-storage/${file.id}/shares`));
      this.shareEmail = '';
      this.sharePermission = 'viewer';
      this.toast.success('fileStorageSaved');
    } catch {
      /* Preserve inputs. */
    } finally {
      this.busy.set(false);
    }
  }
  async copyShareLink() {
    await navigator.clipboard.writeText(this.shareLink());
    this.toast.success('shareLinkCopied');
  }
  async revoke(share: FileShareItem) {
    await this.mutate(`${this.detailFile()!.id}/shares/${share.id}/revoke`);
    try {
      this.shares.set(
        await this.api.get<FileShareItem[]>(`file-storage/${this.detailFile()!.id}/shares`),
      );
    } catch {
      /* Central errors. */
    }
  }
  readonly basePath = 'file-storage';
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly data = new Resource<FilePage>();
  readonly query = new ListQuery();
  readonly view = signal<ViewMode>(this.savedView());
  private savedView(): ViewMode {
    try {
      return localStorage.getItem('templatev4-file-storage-view') === 'grid' ? 'grid' : 'list';
    } catch {
      return 'list';
    }
  }
  gridSortIcon(column: string) {
    if (column !== this.query.text('sort', 'updatedAt')) return 'lucideChevronsUpDown';
    return this.query.direction('desc') === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown';
  }
  toggleGridSort(column: string) {
    this.sort({
      column,
      direction:
        column === this.query.text('sort', 'updatedAt') && this.query.direction('desc') === 'asc'
          ? 'desc'
          : 'asc',
    });
  }
  setView(value: ViewMode) {
    this.view.set(value);
    try {
      localStorage.setItem('templatev4-file-storage-view', value);
    } catch {
      // Keep the selected view usable when browser storage is unavailable.
    }
  }
  readonly busy = signal(false);
  readonly uploading = signal(false);
  readonly currentUpload = signal<File | null>(null);
  readonly uploadIndex = signal(0);
  readonly uploadCount = signal(0);
  readonly uploadCancelled = signal(false);
  readonly failedUploads = signal<readonly PendingUpload[]>([]);
  private uploadController?: AbortController;
  readonly progress = signal(0);
  readonly validation = signal('');
  readonly search = new DebouncedSearch(this.query);
  readonly draggedEntry = signal<FileItem | null>(null);
  readonly entryDropTarget = signal<string | null>(null);
  readonly fileAreaDropActive = signal(false);
  readonly displayItems = computed(() => {
    const value = this.data.value();
    const items = value?.page?.items ?? [];
    const folder = value?.folder;
    if (!folder) return items;
    const at = folder.updatedAt || folder.createdAt;
    return [
      {
        id: parentEntryId,
        name: this.i18n.text('parentFolder'),
        isFolder: true,
        parentId: folder.parentId,
        size: 0,
        contentType: 'application/octet-stream',
        createdAt: at,
        updatedAt: at,
        permission: 'viewer',
        category: 'other',
      } satisfies FileItem,
      ...items,
    ];
  });
  readonly canDragEntry = (file: FileItem) =>
    !this.busy() &&
    this.group === 'file-storage' &&
    !this.isParentEntry(file) &&
    file.permission === 'owner';
  readonly isDraggedEntry = (file: FileItem) => this.draggedEntry()?.id === file.id;
  readonly isActiveDropTarget = (file: FileItem) => this.entryDropTarget() === file.id;
  private entryDestination(file: FileItem) {
    if (this.isParentEntry(file)) return file.parentId ?? null;
    return file.isFolder && file.permission === 'owner' ? file.id : undefined;
  }
  private canDropEntryOn(file: FileItem) {
    const source = this.draggedEntry();
    const destination = this.entryDestination(file);
    return (
      !!source &&
      destination !== undefined &&
      canMoveEntry(source, destination, this.data.value()?.folders ?? [])
    );
  }
  private canAcceptUploadDrop() {
    return this.canManage() && this.group !== 'trash' && !this.sharingGroup && !this.busy();
  }
  private isUploadDrag(event: DragEvent) {
    return event.dataTransfer?.types.includes('Files') ?? false;
  }
  startEntryDrag(event: DragEvent, file: FileItem) {
    if (!this.canDragEntry(file)) {
      event.preventDefault();
      return;
    }
    this.draggedEntry.set(file);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-file-storage-entry', file.id);
    }
  }
  endEntryDrag() {
    this.draggedEntry.set(null);
    this.entryDropTarget.set(null);
  }
  overEntryDrop(event: DragEvent, file: FileItem) {
    if (this.isUploadDrag(event)) {
      if (!this.canAcceptUploadDrop()) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      this.fileAreaDropActive.set(false);
      this.entryDropTarget.set(file.id);
      return;
    }
    if (!this.canDropEntryOn(file)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.entryDropTarget.set(file.id);
  }
  leaveEntryDrop(event: DragEvent, file: FileItem) {
    const next = event.relatedTarget;
    if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next)) return;
    if (this.entryDropTarget() === file.id) this.entryDropTarget.set(null);
  }
  async dropEntry(event: DragEvent, file: FileItem) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isUploadDrag(event) && event.dataTransfer && this.canAcceptUploadDrop()) {
      const destination = this.isParentEntry(file)
        ? (file.parentId ?? null)
        : file.isFolder
          ? file.id
          : this.query.text('folder') || null;
      const navigateAfter = this.isParentEntry(file) || file.isFolder ? destination : undefined;
      this.entryDropTarget.set(null);
      void this.uploadDropped(droppedItems(event.dataTransfer), destination, navigateAfter);
      return;
    }
    const source = this.draggedEntry();
    const destination = this.entryDestination(file);
    const valid = !!source && destination !== undefined && this.canDropEntryOn(file);
    this.endEntryDrag();
    if (!valid || !source) return;
    if (await this.mutate(`${source.id}/move`, { parentId: destination }))
      this.toast.success('itemMoved');
  }
  overFileArea(event: DragEvent) {
    if (!this.isUploadDrag(event) || !this.canAcceptUploadDrop()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.fileAreaDropActive.set(true);
  }
  leaveFileArea(event: DragEvent) {
    const next = event.relatedTarget;
    if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next)) return;
    this.fileAreaDropActive.set(false);
  }
  dropFileArea(event: DragEvent) {
    if (!this.isUploadDrag(event) || !event.dataTransfer || !this.canAcceptUploadDrop()) return;
    event.preventDefault();
    this.fileAreaDropActive.set(false);
    void this.uploadDropped(
      droppedItems(event.dataTransfer),
      this.query.text('folder') || null,
    );
  }
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.display({
        id: 'selection',
        enableSorting: false,
        header: this.i18n.text('selection'),
        cell: ({ row }) =>
          this.isParentEntry(row.original) || this.group === 'trash'
            ? ''
            : flexRenderComponent(FileStorageSelectionCheckbox, {
                inputs: {
                  inputId: `file-list-select-${row.original.id}`,
                  label: this.selectionLabel(row.original),
                  selected: this.isSelected(row.original),
                  disabled: busy,
                  changed: (selected: boolean) => this.setSelected(row.original, selected),
                },
              }),
      }),
      column.accessor('name', {
        header: this.i18n.text('fileName'),
        cell: ({ row }) =>
          flexRenderComponent(FileStorageFileName, {
            inputs: {
              file: row.original,
              interactive: false,
              back: this.isParentEntry(row.original),
            },
          }),
      }),
      column.accessor('size', {
        header: this.i18n.text('fileSize'),
        cell: (c) =>
          this.isParentEntry(c.row.original)
            ? ''
            : c.row.original.isFolder
              ? '—'
              : this.bytes(c.getValue()),
      }),
      column.accessor('updatedAt', {
        header: this.i18n.text('updatedAt'),
        cell: (c) =>
          this.isParentEntry(c.row.original)
            ? ''
            : this.i18n.date(c.getValue() || c.row.original.createdAt),
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          flexRenderComponent(FileStorageFileActions, {
            inputs: {
              actions: this.isParentEntry(row.original)
                ? []
                : this.inlineActions(row.original, busy),
              name: row.original.name,
            },
          }),
      }),
    ]);
  });
  constructor() {
    let revision = this.navigation.revision();
    effect(() => {
      const next = this.navigation.revision();
      if (next !== revision) {
        revision = next;
        untracked(() => void this.load());
      }
    });
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    });
  }
  hasUnsavedChanges() {
    return (
      this.uploading() ||
      this.actionMode() !== '' ||
      this.shareOpen() ||
      (this.detailMode() !== '' && this.detailMode() !== 'fileDetails')
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
    if (folderChanged) this.selectedEntries.set(new Map());
    const loaded = await this.data.load((signal) =>
      this.api.get(
        this.basePath,
        {
          ...(this.query.text('folder') ? { parentId: this.query.text('folder') } : {}),
          group: this.group,
          pageNumber: this.query.page,
          pageSize: this.pageSize,
          search: this.query.text('search'),
          sort: this.query.text('sort', 'updatedAt'),
          direction: this.query.direction('desc'),
        },
        signal,
      ),
    );
    if (loaded) {
      const visible = this.data.value()?.page.items ?? [];
      this.selectedEntries.update((current) => {
        const next = new Map(current);
        for (const file of visible) if (next.has(file.id)) next.set(file.id, file);
        return next;
      });
      const detail = this.detailFile();
      if (detail) {
        const updated = [
          ...(this.data.value()?.page.items ?? []),
          ...(this.data.value()?.recent ?? []),
          ...(this.data.value()?.folders ?? []),
        ].find((file) => file.id === detail.id);
        if (updated) this.detailFile.set(updated);
      }
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
    if (this.busy()) return;
    const input = document.getElementById('file-upload') as HTMLInputElement | null;
    if (input) input.value = '';
    input?.click();
  }
  readonly uploadDragOver = signal(false);
  overUpload(event: DragEvent) {
    event.preventDefault();
    if (this.busy() || !event.dataTransfer?.types.includes('Files')) return;
    event.dataTransfer.dropEffect = 'copy';
    this.uploadDragOver.set(true);
  }
  dropUpload(event: DragEvent) {
    event.preventDefault();
    this.uploadDragOver.set(false);
    if (this.busy() || !event.dataTransfer) return;
    void this.uploadDropped(
      droppedItems(event.dataTransfer),
      this.query.text('folder') || null,
    );
  }
  choose(event: Event) {
    if (this.busy()) return;
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;
    void this.upload(Array.from(files));
  }
  cancelUpload() {
    this.uploadCancelled.set(true);
    this.uploadController?.abort();
  }
  async upload(files: readonly File[]) {
    const parentId = this.query.text('folder') || null;
    await this.runUploadBatch(
      files,
      async () => files.map((file) => ({ file, parentId })),
    );
  }
  retryFailedUploads() {
    const failed = this.failedUploads();
    void this.runUploadBatch(
      failed.map((upload) => upload.file),
      async () => failed,
    );
  }
  private async uploadDropped(
    dropped: Promise<DroppedItems>,
    destination: string | null,
    navigateAfter?: string | null,
  ) {
    let items: DroppedItems;
    try {
      items = await dropped;
    } catch {
      return;
    }
    await this.runUploadBatch(
      items.files.map(({ file }) => file),
      async () => {
        const folders = new Map<string, string | null>([['[]', destination]]);
        for (const path of items.directories.sort((left, right) => left.length - right.length)) {
          this.uploadController?.signal.throwIfAborted();
          const parentPath = path.slice(0, -1);
          const folder = await this.api.post<FileItem>('file-storage/folders', {
            name: path.at(-1),
            parentId: folders.get(JSON.stringify(parentPath)) ?? destination,
          });
          folders.set(JSON.stringify(path), folder.id);
        }
        return items.files.map(({ file, parentPath }) => ({
          file,
          parentId: folders.get(JSON.stringify(parentPath)) ?? destination,
        }));
      },
      navigateAfter,
      items.directories.length > 0,
    );
  }
  private async runUploadBatch(
    files: readonly File[],
    prepare: () => Promise<readonly PendingUpload[]>,
    navigateAfter?: string | null,
    hasDirectories = false,
  ) {
    if (!this.canManage()) return;
    if ((!files.length && !hasDirectories) || this.busy()) return;
    const maxUploadBytes = this.data.value()?.maxUploadBytes ?? 20 * 1024 * 1024;
    this.validation.set(
      maxUploadBytes > 0 && files.some((file) => file.size > maxUploadBytes)
        ? 'uploadValidation'
        : '',
    );
    if (this.validation()) return;
    this.busy.set(true);
    this.uploading.set(true);
    this.progress.set(0);
    this.failedUploads.set([]);
    this.uploadCancelled.set(false);
    this.uploadCount.set(files.length);
    const controller = new AbortController();
    this.uploadController = controller;
    const slowUpload = this.data.value()?.slowUploadMode;
    let batchFinished = false;
    try {
      const uploads = await prepare();
      for (const [index, task] of uploads.entries()) {
        if (controller.signal.aborted) break;
        const { file, parentId } = task;
        this.currentUpload.set(file);
        this.uploadIndex.set(index + 1);
        const progress = (value: number) =>
          this.progress.set(
            Math.min(99, Math.floor(((index + value / 100) / uploads.length) * 100)),
          );
        const upload = (report: (value: number) => void) =>
          this.api.upload(file, report, parentId ?? '', controller.signal);
        try {
          if (slowUpload) await simulateSlowUpload(upload, progress, controller.signal);
          else await upload(progress);
        } catch {
          if (controller.signal.aborted) break;
          this.failedUploads.update((failed) => [...failed, task]);
        }
      }
      batchFinished = !controller.signal.aborted;
      if (!controller.signal.aborted && !this.failedUploads().length) {
        this.progress.set(100);
        if (files.length)
          this.toast.success(files.length === 1 ? 'fileUploaded' : 'filesUploaded');
      }
    } catch {
      /* Central API errors; the current directory is refreshed below. */
    } finally {
      this.uploadController = undefined;
      this.currentUpload.set(null);
      this.uploading.set(false);
      const input = document.getElementById('file-upload') as HTMLInputElement | null;
      if (input) input.value = '';
      try {
        this.navigation.refresh();
        if (batchFinished && navigateAfter !== undefined) {
          this.busy.set(false);
          this.openFolder(navigateAfter);
        } else {
          await this.load();
        }
      } finally {
        this.busy.set(false);
      }
    }
  }
  async download(file: FileItem) {
    this.busy.set(true);
    try {
      if (file.isFolder)
        await this.api.downloadPost(
          'file-storage/batch/download',
          { ids: [file.id] },
          `${file.name}.zip`,
        );
      else await this.api.download(`${this.basePath}/${file.id}/download`, file.name);
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
  openCreateFolder() {
    if (this.busy()) return;
    this.bulkAction.set(false);
    this.actionMode.set('create');
  }
  async createFolder(name: string) {
    if (this.busy() || !name) return;
    this.busy.set(true);
    try {
      await this.api.post('file-storage/folders', {
        name,
        parentId: this.query.text('folder') || null,
      });
      this.actionMode.set('');
      this.toast.success('folderCreated');
      await this.load();
      this.navigation.refresh();
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
        file.isFolder
          ? this.i18n.text('deleteFolderTitle').replace('{name}', file.name)
          : 'deleteFileTitle',
        file.isFolder ? 'deleteFolderHelp' : 'deleteFileHelp',
        file.isFolder ? '' : file.name,
        true,
        'delete',
      ))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post(`file-storage/${file.id}/delete`);
      this.selectedEntries.update((current) => {
        const next = new Map(current);
        next.delete(file.id);
        return next;
      });
      this.detailMode.set('');
      this.toast.success('fileDeleted');
      await this.load();
      this.navigation.refresh();
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
}
