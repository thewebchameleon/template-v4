import { StorageUsageCard } from '../../../shared/storage-usage-card';
import { Auth } from '../../../core/auth';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { MyFilesDemoBanner } from './my-files-demo-banner';
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
import {
  MyFileIcon,
  MyFileName,
  MyFileActions,
  MyFilesActionDialog,
  MyFilesNavigation,
  fileGroups,
} from './my-files-components';
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
import { canMoveEntry } from './my-files-ui';
import { simulateSlowUpload } from './my-files-upload';
import { WorkspaceApi } from '../../../core/workspace-api';
import { I18n } from '../../../core/i18n';
import { Notifications } from '../../notifications/notifications';
import { FileItem, FilePage, FileShareItem } from '../../../api/models';
const column = createColumnHelper<DataTableFeatures, FileItem>();
const parentEntryId = '__my-files-parent__';
@Component({
  selector: 'app-my-files',
  imports: [
    WorkspaceUi,
    MyFilesDemoBanner,
    StorageUsageCard,
    DataTable,
    HlmDrawerImports,
    MyFileActions,
    MyFilesActionDialog,
    HlmDialogImports,
    MyFileIcon,
    HlmSelectImports,
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
        <a hlmBtn variant="outline" routerLink="/administration/storage">
          <ng-icon name="lucideSettings" aria-hidden="true" />{{ 'settings' | t }}
        </a>
      }
      @if (data.value()?.folder; as folder) {
        <button hlmBtn variant="ghost" [disabled]="busy()" (click)="detail(folder, 'fileDetails')">
          {{ 'folderDetails' | t }}
        </button>
      }
      @if (canManage() && group !== 'trash' && group !== 'shared') {
        <button hlmBtn [disabled]="busy()" (click)="showUpload()">
          <ng-icon name="lucideArrowUpFromLine" />{{ 'uploadFiles' | t }}</button
        ><button hlmBtn variant="outline" (click)="openCreateFolder()">
          <ng-icon name="lucideFolderPlus" aria-hidden="true" />{{ 'createFolder' | t }}
        </button>
      } @else if (canManage() && group === 'trash') {
        <button hlmBtn variant="destructive" [disabled]="busy()" (click)="emptyTrash()">
          <ng-icon name="lucideTrash2" aria-hidden="true" />{{ 'emptyTrash' | t }}
        </button>
      }
    </app-page-header>
    <app-my-files-demo-banner
      [enabled]="data.value()?.demoMode ?? false"
      [minutes]="data.value()?.demoExpiryMinutes ?? 60"
    />
    <ng-template #fileGridCard let-file>
      <button
        class="my-files-card-open"
        type="button"
        [disabled]="busy()"
        [attr.aria-label]="entryLabel(file)"
        (click)="openEntry(file)"
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
    @if (group === 'my-files' && !query.text('folder')) {
      <section hlmCard collapsible class="mb-4 min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'recentFiles' | t }}</h2>
          <p hlmCardDescription>{{ 'recentScopeHelp' | t }}</p>
        </div>
        <div hlmCardContent class="my-files-recent-content">
          <ul class="my-files-recent" role="region" [attr.aria-label]="'recentFiles' | t">
            @for (file of (data.value()?.recent ?? []).slice(0, 6); track file.id) {
              <li class="my-files-grid-card my-files-recent-card">
                <ng-container
                  [ngTemplateOutlet]="fileGridCard"
                  [ngTemplateOutletContext]="{ $implicit: file }"
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
          <div class="workspace-directory-controls my-files-controls">
            <div class="my-files-view-controls">
              <app-view-mode-toggle
                [value]="view()"
                (valueChange)="setView($event)"
                [ariaLabel]="'fileView' | t"
                [listLabel]="'fileListView' | t"
                [gridLabel]="'fileGridView' | t"
              />
            </div>
            <div class="workspace-directory-toolbar my-files-filter-toolbar">
              <div hlmField class="my-files-search">
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
          <app-page-state
            [state]="data.state()"
            [refreshing]="view() === 'grid' && data.refreshing()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
          >
            @if (view() === 'list') {
              <app-data-table
                [columns]="columns()"
                [rowActionLabel]="entryLabel"
                (rowAction)="openEntry($event)"
                [data]="displayItems()"
                [rowDraggable]="canDragEntry"
                [rowDragging]="isDraggedEntry"
                [rowDropActive]="isActiveDropTarget"
                (rowDragStart)="startEntryDrag($event.event, $event.row)"
                (rowDragEnd)="endEntryDrag()"
                (rowDragOver)="overEntryDrop($event.event, $event.row)"
                (rowDragLeave)="leaveEntryDrop($event.event, $event.row)"
                (rowDrop)="dropEntry($event.event, $event.row)"
                [loading]="data.state() === 'loading' || data.refreshing()"
                [loadingText]="'loading' | t"
                [emptyText]="'filesEmpty' | t"
                [sortColumn]="query.text('sort', 'updatedAt')"
                [sortDirection]="query.direction('desc')"
                (sortChange)="sort($event)"
              />
            } @else {
              <div class="my-files-grid-sort" role="toolbar" [attr.aria-label]="'sort' | t">
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
                class="my-files-grid"
                [attr.aria-label]="'files' | t"
                [attr.aria-busy]="data.refreshing()"
              >
                @for (file of displayItems(); track file.id) {
                  <li
                    class="my-files-grid-card"
                    [attr.draggable]="canDragEntry(file) ? 'true' : null"
                    [class.opacity-50]="isDraggedEntry(file)"
                    [class.my-files-drop-target]="isActiveDropTarget(file)"
                    (dragstart)="startEntryDrag($event, file)"
                    (dragend)="endEntryDrag()"
                    (dragover)="overEntryDrop($event, file)"
                    (dragleave)="leaveEntryDrop($event, file)"
                    (drop)="dropEntry($event, file)"
                  >
                    <ng-container
                      [ngTemplateOutlet]="fileGridCard"
                      [ngTemplateOutletContext]="{ $implicit: file }"
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
        @if (canManage() && group !== 'trash' && group !== 'shared') {
          <section hlmCard id="upload-panel" class="my-files-upload-card">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'uploadFiles' | t }}</h2>
              <p hlmCardDescription>{{ 'uploadFilesHelp' | t }}</p>
            </div>
            <div hlmCardContent class="my-files-upload-content grid gap-3">
              @if (uploading()) {
                <div
                  class="my-files-upload-progress"
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
                  class="my-files-dropzone"
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
                  class="my-files-dropzone"
                  [class.my-files-drop-target]="uploadDragOver()"
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
                    @for (file of failedUploads(); track $index) {
                      <li class="break-all">{{ file.name }}</li>
                    }
                  </ul>
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    [disabled]="busy()"
                    (click)="upload(failedUploads())"
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
    <app-my-files-action-dialog
      fieldId="page-file-action"
      [mode]="actionMode()"
      [description]="actionDescription()"
      [destinations]="pageMoveDestinations()"
      [busy]="busy()"
      (cancelled)="actionMode.set('')"
      (createFolder)="createFolder($event)"
      (move)="move($event)"
    />
    <hlm-dialog
      [state]="shareOpen() ? 'open' : 'closed'"
      (stateChanged)="!busy() && shareOpen.set($event === 'open')"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header
          ><h2 hlmDialogTitle>{{ 'shareFile' | t }}</h2></hlm-dialog-header
        >
        <form class="grid gap-4" (ngSubmit)="share()">
          <div hlmField>
            <label hlmFieldLabel for="share-email">{{ 'shareEmail' | t }}</label
            ><input
              hlmInput
              type="email"
              id="share-email"
              name="email"
              [(ngModel)]="shareEmail"
              maxlength="256"
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
      </hlm-dialog-content>
    </hlm-dialog>
    <hlm-drawer
      direction="right"
      [state]="detailMode() ? 'open' : 'closed'"
      (stateChanged)="!busy() && $event === 'closed' && detailMode.set('')"
    >
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-lg">
        <hlm-drawer-header
          ><h2 hlmDrawerTitle>
            {{
              (detailMode() === 'fileDetails' && detailFile()?.isFolder
                ? 'folderDetails'
                : detailMode()
              ) | t
            }}
          </h2>
          <p hlmDrawerDescription>{{ detailFile()?.name }}</p></hlm-drawer-header
        >
        <div hlmDrawerBody class="min-h-0 flex-1 content-start overflow-y-auto grid gap-4">
          @if (detailMode() === 'fileDetails') {
            @if (detailFile(); as file) {
              <form id="file-details-form" class="grid gap-4" (ngSubmit)="saveDetails()">
                <div class="flex items-center gap-3">
                  <app-my-file-icon [file]="file" /><span class="font-medium break-all">{{
                    file.name
                  }}</span>
                </div>
                <dl class="my-files-metadata">
                  <dt>{{ 'fileKind' | t }}</dt>
                  <dd>
                    {{ (file.isFolder ? 'folder' : 'fileType.' + (file.category || 'other')) | t }}
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
                      (file.permission === 'owner' ? 'fileOwner' : file.permission || 'viewer') | t
                    }}
                  </dd>
                </dl>
                @if (canEditDetails(file)) {
                  <div hlmField>
                    <label hlmFieldLabel for="detail-name">{{ 'entryName' | t }}</label
                    ><input
                      hlmInput
                      id="detail-name"
                      name="detailName"
                      [(ngModel)]="detailName"
                      required
                      maxlength="180"
                      [disabled]="busy()"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="detail-description">{{ 'fileDescription' | t }}</label
                    ><input
                      hlmInput
                      id="detail-description"
                      name="detailDescription"
                      [(ngModel)]="detailDescription"
                      maxlength="4000"
                      [disabled]="busy()"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="detail-tags">{{ 'fileTags' | t }}</label
                    ><input
                      hlmInput
                      id="detail-tags"
                      name="detailTags"
                      [(ngModel)]="detailTags"
                      maxlength="1000"
                      [disabled]="busy()"
                    />
                    <p hlmFieldDescription>{{ 'fileTagsHelp' | t }}</p>
                  </div>
                  <label
                    hlmFieldLabel
                    for="detail-important"
                    class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
                    ><div hlmField orientation="horizontal">
                      <hlm-checkbox
                        inputId="detail-important"
                        name="detailImportant"
                        [(ngModel)]="detailImportant"
                        [disabled]="busy()"
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
                        name="detailStarred"
                        [(ngModel)]="detailStarred"
                        [disabled]="busy()"
                      /><span>{{ 'starred' | t }}</span>
                    </div></label
                  >
                } @else {
                  <dl class="my-files-metadata">
                    <dt>{{ 'fileDescription' | t }}</dt>
                    <dd>{{ file.description || ('fileNotSet' | t) }}</dd>
                    <dt>{{ 'fileTags' | t }}</dt>
                    <dd>{{ file.tags || ('fileNotSet' | t) }}</dd>
                    <dt>{{ 'important' | t }}</dt>
                    <dd>{{ (file.important ? 'fileYes' : 'fileNo') | t }}</dd>
                    <dt>{{ 'starred' | t }}</dt>
                    <dd>{{ (file.starred ? 'fileYes' : 'fileNo') | t }}</dd>
                  </dl>
                }
                @if (!file.isFolder) {
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
                }
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
                  <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="'actions' | t">
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
              </form>
            }
          }
        </div>
        @if (detailMode() === 'fileDetails' && detailFile(); as file) {
          @if (canEditDetails(file)) {
            <hlm-drawer-footer>
              <button
                hlmBtn
                type="submit"
                form="file-details-form"
                [disabled]="busy() || !detailName.trim() || !detailsDirty()"
              >
                {{ 'saveChanges' | t }}
              </button>
            </hlm-drawer-footer>
          }
        }
      </hlm-drawer-content>
    </hlm-drawer>`,
})
export class MyFilesPage {
  readonly auth = inject(Auth);
  readonly canManage = computed(() => this.auth.has('organisation.files.manage'));
  readonly Math = Math;
  readonly navigation = inject(MyFilesNavigation);
  readonly actionMode = signal<'create' | 'move' | ''>('');
  readonly detailMode = signal('');
  readonly detailFile = signal<FileItem | null>(null);
  detailName = '';
  detailDescription = '';
  detailTags = '';
  detailImportant = false;
  detailStarred = false;
  readonly shares = signal<FileShareItem[]>([]);
  readonly peopleShares = computed(() => this.shares().filter((share) => !!share.recipient));
  readonly shareOpen = signal(false);
  shareEmail = '';
  sharePermission = 'viewer';
  get group() {
    return this.query.text('group', 'my-files');
  }
  get groupLabel() {
    return fileGroups.find((x) => x.id === this.group)?.label ?? 'files';
  }
  readonly entryLabel = (file: FileItem) =>
    this.i18n.text(
      this.isParentEntry(file) ? 'parentFolder' : file.isFolder ? 'openFolder' : 'fileDetails',
    ) + (this.isParentEntry(file) ? '' : ': ' + file.name);
  openEntry(file: FileItem) {
    if (this.busy()) return;
    if (this.isParentEntry(file)) this.openFolder(file.parentId ?? null);
    else if (file.isFolder) this.openFolder(file.id);
    else void this.detail(file, 'fileDetails');
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
    return file.permission === 'owner';
  }
  detailActions(file: FileItem, busy: boolean) {
    return this.actions(file, busy).filter(
      (action) =>
        action.label !== 'download' &&
        action.label !== 'editMetadata' &&
        action.label !== 'shareFile',
    );
  }
  private setDetailDraft(file: FileItem) {
    this.detailName = file.name;
    this.detailDescription = file.description ?? '';
    this.detailTags = file.tags ?? '';
    this.detailImportant = file.important ?? false;
    this.detailStarred = file.starred ?? false;
  }
  detailsDirty() {
    const file = this.detailFile();
    return (
      !!file &&
      (this.detailName !== file.name ||
        this.detailDescription !== (file.description ?? '') ||
        this.detailTags !== (file.tags ?? '') ||
        this.detailImportant !== (file.important ?? false) ||
        this.detailStarred !== (file.starred ?? false))
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
              label: 'editMetadata',
              disabled: busy,
              run: () => void this.detail(file, 'fileDetails'),
            },
          ]
        : []),
      ...(file.permission === 'owner'
        ? [
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
    const excluded = new Set([this.detailFile()?.id]);
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
    if (!source || this.actionMode() !== 'move') return [];
    return [
      {
        value: 'root',
        label: this.i18n.text('files'),
        disabled: !canMoveEntry(source, null, folders),
      },
      ...this.moveFolders()
        .filter((folder) => canMoveEntry(source, folder.id, folders))
        .map((folder) => ({ value: folder.id, label: this.folderPath(folder) })),
    ];
  }
  actionDescription() {
    if (this.actionMode() === 'move') return this.detailFile()?.name ?? '';
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
    this.setDetailDraft(file);
    this.shares.set([]);
    this.shareEmail = '';
    this.sharePermission = 'viewer';
    this.detailMode.set(mode);
    this.busy.set(true);
    try {
      if (mode === 'fileDetails' && this.canShare(file))
        this.shares.set(await this.api.get<FileShareItem[]>(`my-files/${file.id}/shares`));
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
  async openShare(file: FileItem) {
    if (this.busy() || !this.canShare(file)) return;
    if (this.detailFile()?.id !== file.id || this.detailMode() !== 'fileDetails')
      await this.detail(file, 'fileDetails');
    if (this.detailFile()?.id !== file.id || this.detailMode() !== 'fileDetails') return;
    this.shareEmail = '';
    this.sharePermission = 'viewer';
    this.shareOpen.set(true);
  }
  async saveDetails() {
    const file = this.detailFile();
    if (this.busy() || !file || !this.canEditDetails(file) || !this.detailName.trim()) return;
    this.busy.set(true);
    try {
      await this.api.post(`my-files/${file.id}/metadata`, {
        name: this.detailName,
        description: this.detailDescription,
        tags: this.detailTags,
        important: this.detailImportant,
        starred: this.detailStarred,
      });
      const updated = {
        ...file,
        name: this.detailName,
        description: this.detailDescription,
        tags: this.detailTags,
        important: this.detailImportant,
        starred: this.detailStarred,
      };
      this.detailFile.set(updated);
      this.setDetailDraft(updated);
      this.toast.success('myFilesSaved');
      await this.load();
      this.navigation.refresh();
    } catch {
      /* Central errors; keep the draft. */
    } finally {
      this.busy.set(false);
    }
  }
  async mutate(path: string, body: unknown = {}) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`my-files/${path}`, body);
      await this.load();
      this.navigation.refresh();
      this.toast.success('myFilesSaved');
      return true;
    } catch {
      return false;
    } finally {
      this.busy.set(false);
    }
  }
  openMove(file: FileItem) {
    if (this.busy()) return;
    this.detailFile.set(file);
    this.actionMode.set('move');
  }
  async move(destination: string) {
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
      await this.api.post<FileShareItem>(`my-files/${file.id}/shares`, {
        email: this.shareEmail.trim(),
        permission: this.sharePermission,
        expiresAt: null,
      });
      this.shares.set(await this.api.get<FileShareItem[]>(`my-files/${file.id}/shares`));
      this.shareOpen.set(false);
      this.shareEmail = '';
      this.sharePermission = 'viewer';
      this.toast.success('myFilesSaved');
    } catch {
      /* Preserve inputs. */
    } finally {
      this.busy.set(false);
    }
  }
  async revoke(share: FileShareItem) {
    await this.mutate(`${this.detailFile()!.id}/shares/${share.id}/revoke`);
    try {
      this.shares.set(
        await this.api.get<FileShareItem[]>(`my-files/${this.detailFile()!.id}/shares`),
      );
    } catch {
      /* Central errors. */
    }
  }
  readonly basePath = 'my-files';
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly data = new Resource<FilePage>();
  readonly query = new ListQuery();
  readonly view = signal<ViewMode>(this.savedView());
  private savedView(): ViewMode {
    try {
      return localStorage.getItem('templatev4-my-files-view') === 'grid' ? 'grid' : 'list';
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
      localStorage.setItem('templatev4-my-files-view', value);
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
  readonly failedUploads = signal<readonly File[]>([]);
  private uploadController?: AbortController;
  readonly progress = signal(0);
  readonly validation = signal('');
  readonly search = new DebouncedSearch(this.query);
  readonly draggedEntry = signal<FileItem | null>(null);
  readonly entryDropTarget = signal<string | null>(null);
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
    this.group === 'my-files' &&
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
  startEntryDrag(event: DragEvent, file: FileItem) {
    if (!this.canDragEntry(file)) {
      event.preventDefault();
      return;
    }
    this.draggedEntry.set(file);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-my-files-entry', file.id);
    }
  }
  endEntryDrag() {
    this.draggedEntry.set(null);
    this.entryDropTarget.set(null);
  }
  overEntryDrop(event: DragEvent, file: FileItem) {
    if (!this.canDropEntryOn(file)) return;
    event.preventDefault();
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
    const source = this.draggedEntry();
    const destination = this.entryDestination(file);
    const valid = !!source && destination !== undefined && this.canDropEntryOn(file);
    this.endEntryDrag();
    if (!valid || !source) return;
    if (await this.mutate(`${source.id}/move`, { parentId: destination }))
      this.toast.success('itemMoved');
  }
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.accessor('name', {
        header: this.i18n.text('fileName'),
        cell: ({ row }) =>
          flexRenderComponent(MyFileName, {
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
          flexRenderComponent(MyFileActions, {
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
      (this.detailMode() === 'fileDetails' && this.detailsDirty()) ||
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
    if (this.busy()) return;
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    void this.upload(Array.from(files));
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
    if (!this.canManage()) return;
    if (!files.length || this.busy()) return;
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
    const folder = this.query.text('folder');
    const slowUpload = this.data.value()?.slowUploadMode;
    try {
      for (const [index, file] of files.entries()) {
        if (controller.signal.aborted) break;
        this.currentUpload.set(file);
        this.uploadIndex.set(index + 1);
        const progress = (value: number) =>
          this.progress.set(Math.min(99, Math.floor(((index + value / 100) / files.length) * 100)));
        const upload = (report: (value: number) => void) =>
          this.api.upload(file, report, folder, controller.signal);
        try {
          if (slowUpload) await simulateSlowUpload(upload, progress, controller.signal);
          else await upload(progress);
        } catch {
          if (controller.signal.aborted) break;
          this.failedUploads.update((failed) => [...failed, file]);
        }
      }
      if (!controller.signal.aborted && !this.failedUploads().length) {
        this.progress.set(100);
        this.toast.success(files.length === 1 ? 'fileUploaded' : 'filesUploaded');
      }
    } finally {
      this.uploadController = undefined;
      this.currentUpload.set(null);
      this.uploading.set(false);
      const input = document.getElementById('file-upload') as HTMLInputElement | null;
      if (input) input.value = '';
      try {
        await this.load();
        this.navigation.refresh();
      } finally {
        this.busy.set(false);
      }
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
  openCreateFolder() {
    if (!this.busy()) this.actionMode.set('create');
  }
  async createFolder(name: string) {
    if (this.busy() || !name) return;
    this.busy.set(true);
    try {
      await this.api.post('my-files/folders', {
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
      await this.api.post(`my-files/${file.id}/delete`);
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
