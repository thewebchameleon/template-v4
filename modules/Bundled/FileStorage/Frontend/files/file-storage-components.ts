import { fileCategory, fileIconName, canMoveFolder, filterVisibleFileGroups } from './file-storage-ui';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { workspaceIcons } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { RowAction } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace-cells';
import { SidebarSelectionIndicator } from '../../../../../src/TemplateV4.Angular/src/app/shared/sidebar-selection-indicator';
import {
  phosphorFileArchiveDuotone,
  phosphorFileAudioDuotone,
  phosphorFileCDuotone,
  phosphorFileCSharpDuotone,
  phosphorFileCppDuotone,
  phosphorFileCssDuotone,
  phosphorFileCsvDuotone,
  phosphorFileDocDuotone,
  phosphorFileDuotone,
  phosphorFileHtmlDuotone,
  phosphorFileImageDuotone,
  phosphorFileIniDuotone,
  phosphorFileJpgDuotone,
  phosphorFileJsDuotone,
  phosphorFileJsxDuotone,
  phosphorFileMdDuotone,
  phosphorFilePdfDuotone,
  phosphorFilePngDuotone,
  phosphorFilePptDuotone,
  phosphorFilePyDuotone,
  phosphorFileRsDuotone,
  phosphorFileSqlDuotone,
  phosphorFileSvgDuotone,
  phosphorFileTextDuotone,
  phosphorFileTsDuotone,
  phosphorFileTsxDuotone,
  phosphorFileTxtDuotone,
  phosphorFileVideoDuotone,
  phosphorFileVueDuotone,
  phosphorFileXlsDuotone,
  phosphorFileZipDuotone,
  phosphorFolderDuotone,
} from '@ng-icons/phosphor-icons/duotone';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { Notifications } from '../../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';
import {
  Component,
  Injectable,
  computed,
  effect,
  untracked,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsis,
  lucideFolder,
  lucideChevronRight,
  lucideChevronDown,
  lucideStar,
  lucideFlag,
  lucideUsers,
  lucideUserPlus,
  lucideClock,
  lucideTrash2,
  lucideArrowLeft,
  lucidePlus,
} from '@ng-icons/lucide';
import { WorkspaceUi, Resource, Confirmations } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { FileItem, FilePage } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { filterVisibleFileFolders } from './file-storage-ui';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';

export const fileStorageFileIcons = provideIcons({
  lucideEllipsis,
  lucideFolder,
  lucideChevronRight,
  lucideChevronDown,
  lucideStar,
  lucideFlag,
  lucideUsers,
  lucideUserPlus,
  lucideClock,
  lucideTrash2,
  lucidePlus,
});
export const fileGroups = [
  { id: 'recent', label: 'recentFiles', icon: 'lucideClock' },
  { id: 'file-storage', label: 'files', icon: 'lucideFolder' },
  { id: 'important', label: 'important', icon: 'lucideFlag' },
  { id: 'starred', label: 'starred', icon: 'lucideStar' },
  { id: 'shared', label: 'sharedWithMe', icon: 'lucideUsers' },
  { id: 'shared-with-someone', label: 'sharedWithSomeone', icon: 'lucideUserPlus' },
  { id: 'trash', label: 'trash', icon: 'lucideTrash2' },
];
@Component({
  selector: 'app-my-file-icon',
  imports: [NgIcon],
  providers: [
    provideIcons({
      phosphorFileArchiveDuotone,
      phosphorFileAudioDuotone,
      phosphorFileCDuotone,
      phosphorFileCSharpDuotone,
      phosphorFileCppDuotone,
      phosphorFileCssDuotone,
      phosphorFileCsvDuotone,
      phosphorFileDocDuotone,
      phosphorFileDuotone,
      phosphorFileHtmlDuotone,
      phosphorFileImageDuotone,
      phosphorFileIniDuotone,
      phosphorFileJpgDuotone,
      phosphorFileJsDuotone,
      phosphorFileJsxDuotone,
      phosphorFileMdDuotone,
      phosphorFilePdfDuotone,
      phosphorFilePngDuotone,
      phosphorFilePptDuotone,
      phosphorFilePyDuotone,
      phosphorFileRsDuotone,
      phosphorFileSqlDuotone,
      phosphorFileSvgDuotone,
      phosphorFileTextDuotone,
      phosphorFileTsDuotone,
      phosphorFileTsxDuotone,
      phosphorFileTxtDuotone,
      phosphorFileVideoDuotone,
      phosphorFileVueDuotone,
      phosphorFileXlsDuotone,
      phosphorFileZipDuotone,
      phosphorFolderDuotone,
      phosphorWarningCircleFill,
      lucideStar,
      lucideUsers,
    }),
  ],
  host: {
    class: 'my-file-icon',
    '[attr.data-category]': 'category()',
  },
  template: `
    <ng-icon [name]="icon()" size="100%" aria-hidden="true" />
    @if (statusLabel()) {
      <span class="my-file-status-icons" role="img" [attr.aria-label]="statusLabel()">
        @if (file().important) {
          <span class="my-file-status-icon my-file-status-important" aria-hidden="true">
            <ng-icon name="phosphorWarningCircleFill" size="1rem" />
            <span class="my-file-status-important-mark">!</span>
          </span>
        }
        @if (file().starred) {
          <span class="my-file-status-icon my-file-status-starred" aria-hidden="true">
            <ng-icon name="lucideStar" size="0.75rem" />
          </span>
        }
        @if (file().sharedWithSomeone) {
          <span class="my-file-status-icon my-file-status-shared" aria-hidden="true">
            <ng-icon name="lucideUsers" size="0.75rem" />
          </span>
        }
      </span>
    }
  `,
})
export class FileStorageFileIcon {
  private readonly i18n = inject(I18n);
  readonly file = input.required<
    Pick<FileItem, 'name' | 'isFolder' | 'category' | 'important' | 'starred' | 'sharedWithSomeone'>
  >();
  readonly category = computed(() => fileCategory(this.file()));
  readonly icon = computed(() => fileIconName(this.file()));
  readonly statusLabel = computed(() => {
    const file = this.file();
    return [
      file.important ? this.i18n.text('important') : '',
      file.starred ? this.i18n.text('starred') : '',
      file.sharedWithSomeone ? this.i18n.text('sharedWithSomeone') : '',
    ]
      .filter(Boolean)
      .join(', ');
  });
}
@Component({
  selector: 'app-my-file-actions',
  imports: [WorkspaceUi],
  providers: [workspaceIcons],
  template: `<div class="flex justify-end gap-1">
    @for (action of actions(); track action.label) {
      <button
        hlmBtn
        variant="ghost"
        size="icon-sm"
        [disabled]="action.disabled"
        [attr.aria-label]="(action.label | t) + ': ' + name()"
        [attr.title]="action.label | t"
        (click)="$event.stopPropagation(); action.run()"
      >
        <ng-icon
          [name]="action.label === 'download' ? 'lucideArrowDownToLine' : 'lucideTrash2'"
          [class.text-destructive]="action.label === 'delete'"
          aria-hidden="true"
        />
      </button>
    }
  </div>`,
})
export class FileStorageFileActions {
  readonly actions = input.required<RowAction[]>();
  readonly name = input.required<string>();
}

@Component({
  selector: 'app-my-file-name',
  imports: [WorkspaceUi, FileStorageFileIcon],
  providers: [provideIcons({ lucideArrowLeft })],
  template: `<div class="flex w-full min-w-0 items-center gap-3">
    @if (back()) {
      <ng-icon name="lucideArrowLeft" class="my-file-icon" aria-hidden="true" />
    } @else {
      <app-my-file-icon [file]="file()" />
    }
    <div class="min-w-0 flex-1 overflow-hidden">
      @if (interactive()) {
        <button
          hlmBtn
          variant="link"
          (click)="open()?.()"
          class="w-full min-w-0 max-w-full"
          [attr.title]="file().name"
        >
          <span class="block truncate">{{ file().name }}</span>
        </button>
      } @else {
        <span class="block truncate font-medium" [attr.title]="file().name">{{ file().name }}</span>
      }
    </div>
  </div>`,
})
export class FileStorageFileName {
  readonly file = input.required<FileItem>();
  readonly open = input<() => void>();
  readonly interactive = input(true);
  readonly back = input(false);
}
@Component({
  selector: 'app-file-storage-selection-checkbox',
  imports: [WorkspaceUi],
  template: `<hlm-checkbox
      class="file-storage-selection-checkbox"
      [inputId]="inputId()"
      [checked]="selected()"
      [disabled]="disabled()"
      (checkedChange)="changed()($event)"
    /><label class="sr-only" [for]="inputId()">{{ label() }}</label>`,
})
export class FileStorageSelectionCheckbox {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly selected = input(false);
  readonly disabled = input(false);
  readonly changed = input.required<(selected: boolean) => void>();
}
export type FileStorageActionMode = 'create' | 'rename' | 'move' | 'copy' | '';
export interface FileStorageMoveDestination {
  value: string;
  label: string;
  disabled?: boolean;
}
@Component({
  selector: 'app-file-storage-action-dialog',
  imports: [WorkspaceUi, HlmAlertDialogImports, HlmSelectImports],
  template: `<hlm-alert-dialog
    [state]="mode() ? 'open' : 'closed'"
    (stateChanged)="stateChanged($event)"
  >
    <hlm-alert-dialog-content *hlmAlertDialogPortal>
      <hlm-alert-dialog-header
        ><h2 hlmAlertDialogTitle>
          {{
            (mode() === 'create'
              ? 'createFolder'
              : mode() === 'rename'
                ? 'renameFolder'
                : mode() === 'copy'
                  ? 'copyItems'
                  : 'moveFile'
            ) | t
          }}
        </h2>
        <p hlmAlertDialogDescription>{{ description() }}</p></hlm-alert-dialog-header
      >
      @if (mode() === 'create' || mode() === 'rename') {
        <form class="grid gap-4" (ngSubmit)="submitName()">
          <div hlmField>
            <label hlmFieldLabel [for]="fieldId() + '-name'">{{ 'entryName' | t }}</label
            ><input
              hlmInput
              [id]="fieldId() + '-name'"
              name="folderName"
              [(ngModel)]="folderName"
              required
              maxlength="180"
              [disabled]="busy()"
            />
          </div>
          <hlm-alert-dialog-footer>
            <button hlmAlertDialogCancel type="button" [disabled]="busy()">
              {{ 'cancel' | t }}
            </button>
            <button hlmAlertDialogAction type="submit" [disabled]="busy() || !folderName.trim()">
              {{ (mode() === 'rename' ? 'renameFolder' : 'createFolder') | t }}
            </button>
          </hlm-alert-dialog-footer>
        </form>
      } @else if (mode() === 'move' || mode() === 'copy') {
        <div hlmField>
          <label hlmFieldLabel [for]="fieldId() + '-destination'">{{
            'destinationFolder' | t
          }}</label>
          <hlm-select [(value)]="moveTarget" [itemToString]="destinationLabel">
            <hlm-select-trigger [id]="fieldId() + '-destination'"
              ><hlm-select-value
            /></hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              @for (destination of destinations(); track destination.value) {
                <hlm-select-item [value]="destination.value" [disabled]="destination.disabled">{{
                  destination.label
                }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </div>
        <hlm-alert-dialog-footer>
          <button hlmAlertDialogCancel [disabled]="busy()">{{ 'cancel' | t }}</button>
          <button
            hlmAlertDialogAction
            [disabled]="busy() || !selectedDestinationValid()"
            (click)="mode() === 'copy' ? copy.emit(moveTarget) : move.emit(moveTarget)"
          >
            {{ (mode() === 'copy' ? 'copyItems' : 'moveFile') | t }}
          </button>
        </hlm-alert-dialog-footer>
      }
    </hlm-alert-dialog-content>
  </hlm-alert-dialog>`,
})
export class FileStorageActionDialog {
  readonly mode = input<FileStorageActionMode>('');
  readonly description = input('');
  readonly destinations = input<readonly FileStorageMoveDestination[]>([]);
  readonly busy = input(false);
  readonly fieldId = input('file-storage-action');
  readonly cancelled = output<void>();
  readonly createFolder = output<string>();
  readonly renameFolder = output<string>();
  readonly move = output<string>();
  readonly copy = output<string>();
  folderName = '';
  moveTarget = 'root';
  readonly destinationLabel = (value: string) =>
    this.destinations().find((destination) => destination.value === value)?.label ?? value;
  constructor() {
    let wasOpen = false;
    effect(() => {
      const open = !!this.mode();
      if (open && !wasOpen) {
        this.folderName = this.mode() === 'rename' ? this.description() : '';
        this.moveTarget = 'root';
      }
      wasOpen = open;
    });
  }
  stateChanged(state: 'open' | 'closed') {
    if (state === 'closed' && this.mode() && !this.busy()) this.cancelled.emit();
  }
  submitName() {
    const name = this.folderName.trim();
    if (!name || this.busy()) return;
    if (this.mode() === 'rename') this.renameFolder.emit(name);
    else this.createFolder.emit(name);
  }
  selectedDestinationValid() {
    const selected = this.destinations().find(
      (destination) => destination.value === this.moveTarget,
    );
    return !!selected && !selected.disabled;
  }
}
@Injectable({ providedIn: 'root' })
export class FileStorageNavigation {
  readonly revision = signal(0);
  refresh() {
    this.revision.update((x) => x + 1);
  }
}
@Component({
  selector: 'app-file-storage-tree',
  imports: [
    WorkspaceUi,
    HlmSidebarImports,
    FileStorageFileIcon,
    FileStorageActionDialog,
    HlmContextMenuImports,
    HlmDropdownMenuImports,
    SidebarSelectionIndicator,
  ],
  providers: [fileStorageFileIcons],
  template: `<nav
      hlmSidebarGroup
      appSidebarSelectionIndicator
      class="sidebar-submenu"
      [attr.aria-label]="'files' | t"
    >
      <div hlmSidebarGroupLabel>{{ 'files' | t }}</div>
      @if (data.state() === 'error' || data.refreshError()) {
        <button hlmBtn variant="ghost" (click)="load()">{{ 'retry' | t }}</button>
      }
      <ul hlmSidebarMenu>
        @for (group of visibleGroups(); track group.id) {
          <li hlmSidebarMenuItem>
            <div class="flex items-center min-w-0">
              <a
                hlmSidebarMenuButton
                [hlmContextMenuTrigger]="group.id === 'file-storage' ? fileStorageGroupMenu : null"
                [disabled]="busy()"
                routerLink="/file-storage"
                (click)="closeMobile()"
                (contextmenu)="rememberContextTrigger($event)"
                (keydown)="rememberContextTriggerKey($event)"
                (dragover)="dragOver($event, null, group.id)"
                (dragleave)="dropTarget.set(undefined)"
                (drop)="dropFolder($event, null, group.id)"
                [class.file-storage-drop-target]="
                  group.id === 'file-storage' && dropTarget() === null
                "
                [queryParams]="{ group: group.id }"
                [isActive]="selectedGroup() === group.id && !selectedFolder()"
                [attr.aria-current]="
                  selectedGroup() === group.id && !selectedFolder() ? 'page' : null
                "
                ><ng-icon [name]="group.icon" /><span>{{ group.label | t }}</span>
                @if (group.id !== 'recent') {
                  <span
                    class="file-storage-nav-count"
                    [class.file-storage-nav-count-important]="
                      group.id === 'important' && (data.value()?.[group.id]?.fileCount ?? 0) > 0
                    "
                    >{{ count(group.id) }}</span
                  >
                }
                </a
              >
              @if (group.id === 'file-storage') {
                <button
                  hlmBtn
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  [disabled]="busy()"
                  [attr.aria-label]="'createFolder' | t"
                  (click)="rememberContextTrigger($event); beginRootFolderCreation()"
                >
                  <ng-icon name="lucidePlus" aria-hidden="true" />
                </button>
              }
              <ng-template #fileStorageGroupMenu>
                <hlm-dropdown-menu>
                  <button
                    hlmDropdownMenuItem
                    [disabled]="busy()"
                    (triggered)="beginRootFolderCreation()"
                  >
                    {{ 'createFolder' | t }}
                  </button>
                </hlm-dropdown-menu>
              </ng-template>
            </div>
            @if (folders(group.id).length) {
              <ul
                class="file-storage-tree"
                [attr.aria-label]="(group.label | t) + ': ' + ('folderNavigation' | t)"
              >
                @for (node of visibleFolders(group.id); track node.file.id) {
                  <li
                    class="flex items-center min-w-0"
                    [style.padding-inline-start.rem]="node.depth * 1.25"
                    [hlmContextMenuTrigger]="folderMenu"
                    [disabled]="busy() || node.file.permission !== 'owner' || group.id === 'trash'"
                    (contextmenu)="rememberContextTrigger($event)"
                    (keydown)="rememberContextTriggerKey($event)"
                  >
                    @if (node.children) {
                      <button
                        hlmBtn
                        variant="ghost"
                        size="icon-sm"
                        [attr.aria-label]="('expandFolder' | t) + ': ' + node.file.name"
                        [attr.aria-expanded]="!collapsed().has(group.id + node.file.id)"
                        (click)="toggle(group.id + node.file.id)"
                      >
                        <ng-icon
                          [name]="
                            collapsed().has(group.id + node.file.id)
                              ? 'lucideChevronRight'
                              : 'lucideChevronDown'
                          "
                        />
                      </button>
                    } @else {
                      <span class="size-8 shrink-0" aria-hidden="true"></span>
                    }
                    <a
                      hlmSidebarMenuButton
                      routerLink="/file-storage"
                      (click)="closeMobile()"
                      [queryParams]="{ group: group.id, folder: node.file.id }"
                      [isActive]="selectedGroup() === group.id && selectedFolder() === node.file.id"
                      [attr.aria-current]="
                        selectedGroup() === group.id && selectedFolder() === node.file.id
                          ? 'page'
                          : null
                      "
                      [draggable]="
                        group.id !== 'trash' && node.file.permission === 'owner' && !busy()
                      "
                      (dragstart)="startDrag($event, node.file, group.id)"
                      (dragend)="endDrag()"
                      (dragover)="dragOver($event, node.file.id, group.id)"
                      (dragleave)="dropTarget.set(undefined)"
                      (drop)="dropFolder($event, node.file.id, group.id)"
                      [class.file-storage-drop-target]="
                        dropTarget() === node.file.id && group.id !== 'trash'
                      "
                      ><app-my-file-icon [file]="node.file" /><span class="truncate">{{
                        node.file.name
                      }}</span
                      ><span class="file-storage-nav-count">{{
                        i18n.number(node.file.fileCount ?? 0)
                      }}</span></a
                    >
                    @if (node.file.permission === 'owner' && group.id !== 'trash') {
                      <button
                        hlmBtn
                        variant="ghost"
                        size="icon-sm"
                        [disabled]="busy()"
                        [hlmDropdownMenuTrigger]="folderMenu"
                        [attr.aria-label]="('folderActions' | t) + ': ' + node.file.name"
                        (click)="rememberContextTrigger($event)"
                      >
                        <ng-icon name="lucideEllipsis" aria-hidden="true" />
                      </button>
                    }
                    <ng-template #folderMenu>
                      <hlm-dropdown-menu>
                        <button
                          hlmDropdownMenuItem
                          [disabled]="busy()"
                          (triggered)="beginContextAction(node.file, 'move')"
                        >
                          {{ 'moveFile' | t }}
                        </button>
                        <button
                          hlmDropdownMenuItem
                          [disabled]="busy()"
                          (triggered)="beginContextAction(node.file, 'create')"
                        >
                          {{ 'createFolder' | t }}
                        </button>
                        <button
                          hlmDropdownMenuItem
                          [disabled]="busy()"
                          (triggered)="beginContextAction(node.file, 'rename')"
                        >
                          {{ 'renameFolder' | t }}
                        </button>
                        <hlm-dropdown-menu-separator />
                        <button
                          hlmDropdownMenuItem
                          variant="destructive"
                          [disabled]="busy()"
                          (triggered)="deleteFolder(node.file)"
                        >
                          {{ 'delete' | t }}
                        </button>
                      </hlm-dropdown-menu>
                    </ng-template>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    </nav>
    <app-file-storage-action-dialog
      fieldId="submenu-folder-action"
      [mode]="creating() ? 'create' : renaming() ? 'rename' : moving() ? 'move' : ''"
      [description]="target()?.name ?? ''"
      [destinations]="contextMoveDestinations()"
      [busy]="busy()"
      (cancelled)="closeContext()"
      (createFolder)="createFolder($event)"
      (renameFolder)="renameFolder($event)"
      (move)="moveFromContext($event)"
    />`,
})
export class FileStorageTree {
  private readonly sidebar = inject(HlmSidebarService);
  readonly i18n = inject(I18n);
  private readonly notifications = inject(Notifications);
  private readonly navigation = inject(FileStorageNavigation);
  private readonly api = inject(WorkspaceApi);
  private readonly router = inject(Router);
  private readonly confirm = inject(Confirmations);
  readonly groups = fileGroups;
  readonly data = new Resource<Record<string, FilePage>>();
  readonly visibleGroups = computed(() => filterVisibleFileGroups(this.groups));
  readonly selectedGroup = signal('file-storage');
  readonly selectedFolder = signal('');
  readonly collapsed = signal(new Set<string>());
  readonly target = signal<FileItem | null>(null);
  readonly creating = signal(false);
  readonly renaming = signal(false);
  readonly busy = signal(false);
  readonly moving = signal(false);
  readonly dragged = signal<FileItem | null>(null);
  readonly dropTarget = signal<string | null | undefined>(undefined);
  startDrag(event: DragEvent, file: FileItem, group: string) {
    if (this.busy() || group === 'trash' || file.permission !== 'owner') {
      event.preventDefault();
      return;
    }
    this.dragged.set(file);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-file-storage-folder', file.id);
    }
  }
  endDrag() {
    this.dragged.set(null);
    this.dropTarget.set(undefined);
  }
  dragOver(event: DragEvent, parent: string | null, group: string) {
    const source = this.dragged();
    if (
      this.busy() ||
      group === 'trash' ||
      (!parent && group !== 'file-storage') ||
      !source ||
      !canMoveFolder(source, parent, this.folders('file-storage'))
    )
      return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropTarget.set(parent);
  }
  async dropFolder(event: DragEvent, parent: string | null, group: string) {
    event.preventDefault();
    event.stopPropagation();
    const source = this.dragged();
    this.endDrag();
    if (group === 'trash' || (!parent && group !== 'file-storage') || !source) return;
    await this.moveFolder(source, parent);
  }
  contextMoveDestinations(): FileStorageMoveDestination[] {
    const source = this.target();
    const folders = this.folders('file-storage');
    if (!source) return [];
    return [
      {
        value: 'root',
        label: this.i18n.text('files'),
        disabled: !canMoveFolder(source, null, folders),
      },
      ...folders
        .filter((folder) => canMoveFolder(source, folder.id, folders))
        .sort((a, b) => this.folderLocation(a).localeCompare(this.folderLocation(b)))
        .map((folder) => ({ value: folder.id, label: this.folderLocation(folder) })),
    ];
  }
  folderLocation(folder: FileItem) {
    let path = folder.name;
    let parent = folder.parentId;
    const seen = new Set([folder.id]);
    while (parent && !seen.has(parent)) {
      seen.add(parent);
      const entry = this.folders('file-storage').find((item) => item.id === parent);
      if (!entry) break;
      path = entry.name + ' / ' + path;
      parent = entry.parentId;
    }
    return path;
  }
  async moveFromContext(destination: string) {
    const source = this.target();
    if (source) await this.moveFolder(source, destination === 'root' ? null : destination);
  }
  private async moveFolder(source: FileItem, parentId: string | null) {
    if (this.busy() || !canMoveFolder(source, parentId, this.folders('file-storage'))) return;
    this.busy.set(true);
    try {
      await this.api.post(`file-storage/${source.id}/move`, { parentId });
      this.collapsed.update((previous) => {
        const next = new Set(previous);
        if (parentId) for (const group of this.groups) next.delete(group.id + parentId);
        return next;
      });
      this.closeContext();
      this.notifications.success('folderMoved');
      this.navigation.refresh();
    } catch {
      // Keep the hierarchy unchanged; the server revalidates the move.
    } finally {
      this.busy.set(false);
    }
  }
  private contextTrigger: HTMLElement | null = null;
  closeMobile() {
    this.sidebar.setOpenMobile(false);
  }
  folders(group: string) {
    const folders = this.data.value()?.[group]?.folders ?? [];
    return filterVisibleFileFolders(group, folders);
  }
  count(group: string) {
    const page = this.data.value()?.[group];
    return page ? this.i18n.number(page.fileCount ?? 0) : '�';
  }
  visibleFolders(group: string) {
    const files = this.folders(group);
    const ids = new Set(files.map((f) => f.id));
    const result: { file: FileItem; depth: number; children: boolean }[] = [];
    const visited = new Set<string>();
    const visit = (parent: string | null, depth: number) => {
      for (const file of files
        .filter((f) => (ids.has(f.parentId ?? '') ? f.parentId : null) === parent)
        .sort((a, b) => a.name.localeCompare(b.name))) {
        if (visited.has(file.id)) continue;
        visited.add(file.id);
        result.push({ file, depth, children: files.some((f) => f.parentId === file.id) });
        if (!this.collapsed().has(group + file.id)) visit(file.id, depth + 1);
      }
    };
    visit(null, 0);
    return result;
  }
  constructor() {
    effect(() => {
      this.navigation.revision();
      untracked(() => void this.load());
    });
    this.router.events.pipe(takeUntilDestroyed()).subscribe((e) => {
      if (e instanceof NavigationEnd) this.syncRoute();
    });
  }
  toggle(id: string) {
    this.collapsed.update((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  syncRoute() {
    const params = this.router.url.startsWith('/file-storage')
      ? this.router.parseUrl(this.router.url).queryParams
      : {};
    this.selectedGroup.set(params['group'] || 'file-storage');
    this.selectedFolder.set(params['folder'] || '');
  }
  async load() {
    this.syncRoute();
    await this.data.load(async (signal) =>
      Object.fromEntries(
        await Promise.all(
          this.groups.map(async (group) => [
            group.id,
            await this.api.get<FilePage>('file-storage', { group: group.id, pageSize: 1 }, signal),
          ]),
        ),
      ),
    );
  }
  rememberContextTrigger(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    this.contextTrigger = target.closest<HTMLElement>('a, button');
  }
  rememberContextTriggerKey(event: KeyboardEvent) {
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
      this.rememberContextTrigger(event);
  }
  beginContextAction(file: FileItem, action: 'create' | 'rename' | 'move') {
    queueMicrotask(() => {
      this.target.set(file);
      this.creating.set(action === 'create');
      this.renaming.set(action === 'rename');
      this.moving.set(action === 'move');
    });
  }
  beginRootFolderCreation() {
    queueMicrotask(() => {
      this.target.set(null);
      this.creating.set(true);
      this.renaming.set(false);
      this.moving.set(false);
    });
  }
  closeContext() {
    this.target.set(null);
    this.creating.set(false);
    this.renaming.set(false);
    this.moving.set(false);
    this.contextTrigger?.focus();
  }
  async createFolder(name: string) {
    const parent = this.target();
    if (this.busy() || !name) return;
    this.busy.set(true);
    try {
      await this.api.post('file-storage/folders', {
        name,
        parentId: parent?.id ?? null,
      });
      this.notifications.success('folderCreated');
      this.closeContext();
      this.navigation.refresh();
    } catch {
      /* Keep the draft for retry. */
    } finally {
      this.busy.set(false);
    }
  }
  async renameFolder(name: string) {
    const folder = this.target();
    if (this.busy() || !folder || !name) return;
    this.busy.set(true);
    try {
      await this.api.post(`file-storage/${folder.id}/rename`, { name });
      this.notifications.success('folderRenamed');
      this.closeContext();
      this.navigation.refresh();
    } catch {
      /* Keep the draft for retry. */
    } finally {
      this.busy.set(false);
    }
  }
  async deleteFolder(folder: FileItem) {
    if (this.busy()) return;
    if (
      !(await this.confirm.ask(
        this.i18n.text('deleteFolderTitle').replace('{name}', folder.name),
        'deleteFolderHelp',
        '',
        true,
        'delete',
      ))
    )
      return;
    this.busy.set(true);
    try {
      await this.api.post(`file-storage/${folder.id}/delete`);
      if (this.selectedFolder() === folder.id)
        await this.router.navigate(['/file-storage'], {
          queryParams: { group: this.selectedGroup(), folder: folder.parentId },
        });
      this.notifications.success('fileDeleted');
      this.navigation.refresh();
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
}
