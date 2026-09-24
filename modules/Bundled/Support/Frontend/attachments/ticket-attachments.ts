import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { TicketAttachment, TicketDetail } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { WorkspaceUi, ListQuery, workspaceIcons } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { DataTable, DataTableFeatures } from '../../../../../src/TemplateV4.Angular/src/app/shared/data-table';
import { Notifications } from '../../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';
import { FileStorageFileIcon } from '../../../FileStorage/Frontend/files/file-storage-components';
import { fileCategory } from '../../../FileStorage/Frontend/files/file-storage-ui';

const column = createColumnHelper<DataTableFeatures, TicketAttachment>();

@Component({
  selector: 'app-ticket-attachment-name',
  imports: [WorkspaceUi, FileStorageFileIcon],
  template: `<div class="flex min-w-0 items-center gap-3">
    <app-my-file-icon [file]="{ name: attachment().name, isFolder: false }" />
    <div class="min-w-0 flex-1">
      <span class="block truncate font-medium" [attr.title]="attachment().name">{{ attachment().name }}</span>
      <span class="workspace-meta block truncate"><span class="sr-only">{{ 'fileSize' | t }}: </span>{{ size() }}</span>
    </div>
  </div>`,
})
export class TicketAttachmentName {
  readonly attachment = input.required<TicketAttachment>();
  readonly size = input.required<string>();
}

@Component({
  selector: 'app-ticket-attachment-date',
  template: `<time [attr.datetime]="value()">
    <span class="block">{{ date() }}</span>
    <span class="workspace-meta block">{{ time() }}</span>
  </time>`,
})
export class TicketAttachmentDate {
  readonly value = input.required<string>();
  private readonly i18n = inject(I18n);
  readonly date = computed(() => new Intl.DateTimeFormat(this.i18n.culture(), {
    dateStyle: 'medium', timeZone: this.i18n.timeZone(),
  }).format(new Date(this.value())));
  readonly time = computed(() => new Intl.DateTimeFormat(this.i18n.culture(), {
    timeStyle: 'short', timeZone: this.i18n.timeZone(),
  }).format(new Date(this.value())));
}

@Component({
  selector: 'app-ticket-attachments',
  imports: [WorkspaceUi, DataTable, HlmDrawerImports, FileStorageFileIcon],
  providers: [workspaceIcons],
  template: `<section hlmCard>
    <div hlmCardHeader>
      <h2 hlmCardTitle>{{ 'supportAttachments' | t }}</h2>
      <p hlmCardDescription>{{ 'supportAttachmentHelp' | t }}</p>
    </div>
    <div hlmCardContent>
      @if (canUpload()) {
        <div class="grid gap-3 pb-4">
          <input #attachmentInput type="file" hidden multiple [disabled]="busy() || disabled()" (change)="choose($event)" />
          <button
            type="button"
            class="file-storage-dropzone w-full"
            [class.file-storage-drop-target]="dragOver()"
            [disabled]="busy() || disabled()"
            (click)="attachmentInput.click()"
            (dragover)="over($event)"
            (dragleave)="leave($event)"
            (drop)="drop($event)"
          >
            <span class="font-medium" role="status">{{ (busy() ? 'supportUploading' : 'supportDropFiles') | t }}</span>
            <span class="workspace-meta">{{ 'supportBrowseFiles' | t }}</span>
          </button>
          <p hlmFieldDescription>{{ 'supportAttachmentsPublic' | t }}</p>
        </div>
      }
      <app-data-table
        class="support-attachment-list"
        [columns]="columns()"
        [data]="sortedAttachments()"
        [emptyText]="'supportNoAttachments' | t"
        [sortColumn]="sortColumn()"
        [sortDirection]="query.direction('desc')"
        (sortChange)="query.set({ sort: $event.column, direction: $event.direction })"
        [ariaLabel]="'supportAttachments' | t"
        [rowActionLabel]="propertiesLabel"
        (rowAction)="selected.set($event)"
        fillColumn="name"
      />
    </div>
  </section>
  <hlm-drawer
    direction="right"
    [state]="selected() ? 'open' : 'closed'"
    [closeLabel]="'close' | t"
    (stateChanged)="$event === 'closed' && selected.set(null)"
  >
    <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-lg">
      <hlm-drawer-header>
        <h2 hlmDrawerTitle>{{ 'properties' | t }}</h2>
        <p hlmDrawerDescription>{{ 'supportAttachmentPropertiesHelp' | t }}</p>
      </hlm-drawer-header>
      @if (selected(); as file) {
        <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
          <div class="grid content-start gap-4">
            <div class="flex items-center gap-3">
              <app-my-file-icon [file]="{ name: file.name, isFolder: false }" />
              <span class="font-medium break-all">{{ file.name }}</span>
            </div>
            <dl class="file-storage-metadata">
              <dt>{{ 'fileKind' | t }}</dt>
              <dd>{{ 'fileType.' + fileCategory({ name: file.name, isFolder: false }) | t }}</dd>
              <dt>{{ 'fileSize' | t }}</dt>
              <dd>{{ bytes(file.size) }}</dd>
              <dt>{{ 'supportAttachmentUploadedAt' | t }}</dt>
              <dd><time [attr.datetime]="file.at">{{ i18n.date(file.at) }}</time></dd>
            </dl>
          </div>
        </div>
        <hlm-drawer-footer role="group" [attr.aria-label]="'actions' | t">
          <button hlmBtn type="button" [disabled]="busy() || disabled()" (click)="download(file.id, file.name)">
            <ng-icon name="lucideArrowDownToLine" aria-hidden="true" />{{ 'download' | t }}
          </button>
        </hlm-drawer-footer>
      }
    </hlm-drawer-content>
  </hlm-drawer>`,
})
export class TicketAttachments {
  readonly ticketId = input.required<string>();
  readonly version = input.required<string>();
  readonly attachments = input.required<TicketAttachment[]>();
  readonly canUpload = input(false);
  readonly disabled = input(false);
  readonly beforeAttach = input<() => Promise<boolean>>(async () => true);
  readonly reloadTicket = input.required<() => Promise<void>>();
  readonly busyChange = output<boolean>();
  readonly busy = signal(false);
  readonly dragOver = signal(false);
  readonly selected = signal<TicketAttachment | null>(null);
  readonly query = new ListQuery('attachment');
  readonly fileCategory = fileCategory;
  private readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  private readonly toast = inject(Notifications);
  readonly propertiesLabel = (file: TicketAttachment) => `${this.i18n.text('properties')}: ${file.name}`;
  readonly sortColumn = computed(() => {
    const value = this.query.text('sort', 'at');
    return value === 'name' ? value : 'at';
  });
  readonly sortedAttachments = computed(() => {
    const sort = this.sortColumn();
    const direction = this.query.direction('desc') === 'asc' ? 1 : -1;
    const culture = this.i18n.culture();
    return [...this.attachments()].sort((a, b) => {
      const order = sort === 'name'
        ? a.name.localeCompare(b.name, culture)
        : Date.parse(a.at) - Date.parse(b.at);
      return direction * (order || a.id.localeCompare(b.id));
    });
  });
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('name', {
        header: this.i18n.text('fileName'),
        cell: ({ row }) => flexRenderComponent(TicketAttachmentName, {
          inputs: {
            attachment: row.original,
            size: this.bytes(row.original.size),
          },
        }),
      }),
      column.accessor('at', {
        header: this.i18n.text('updatedAt'),
        cell: (cell) => flexRenderComponent(TicketAttachmentDate, {
          inputs: { value: cell.getValue() },
        }),
      }),
    ]);
  });
  bytes(value: number) {
    if (value < 1024) return this.i18n.number(value) + ' B';
    if (value < 1048576) return this.i18n.number(Math.round(value / 1024)) + ' KB';
    return this.i18n.number(Math.round((value / 1048576) * 10) / 10) + ' MB';
  }
  choose(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    void this.attach(files);
  }
  over(event: DragEvent) {
    event.preventDefault();
    if (this.busy() || this.disabled()) return;
    this.dragOver.set(true);
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }
  leave(event: DragEvent) {
    const next = event.relatedTarget;
    if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next)) return;
    this.dragOver.set(false);
  }
  drop(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.busy() || this.disabled()) return;
    void this.attach(Array.from(event.dataTransfer?.files ?? []));
  }
  async attach(files: File[]) {
    if (!files.length || this.busy() || this.disabled() || !this.canUpload()) return;
    if (files.some((file) => file.size === 0 || file.size > 5 * 1024 * 1024)) {
      this.toast.error({ title: this.i18n.text('supportFileSize') });
      return;
    }
    if (this.attachments().length + files.length > 10 ||
        this.attachments().reduce((sum, file) => sum + file.size, 0) + files.reduce((sum, file) => sum + file.size, 0) > 20 * 1024 * 1024) {
      this.toast.error({ title: this.i18n.text('supportAttachmentHelp') });
      return;
    }
    if (!(await this.beforeAttach()())) return;
    this.busy.set(true);
    this.busyChange.emit(true);
    let uploaded = 0;
    let version = this.version();
    try {
      for (const file of files) {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        await this.api.post('support/attachments', {
          id: this.ticketId(), name: file.name, content, version,
        });
        uploaded++;
        if (uploaded < files.length) {
          const detail = await this.api.get<TicketDetail>(`support/${this.ticketId()}`, { pageNumber: 1 });
          version = detail.ticket.version;
        }
      }
      this.toast.success('supportSaved');
    } catch (error) {
      if (!(error instanceof HttpErrorResponse))
        this.toast.error({ title: this.i18n.text('supportFileReadFailed') });
    } finally {
      if (uploaded) await this.reloadTicket()();
      this.busy.set(false);
      this.busyChange.emit(false);
    }
  }
  async download(id: string, name: string) {
    try {
      await this.api.download(`support/${this.ticketId()}/attachments/${id}`, name);
    } catch {
      /* Central error UI. */
    }
  }
}
