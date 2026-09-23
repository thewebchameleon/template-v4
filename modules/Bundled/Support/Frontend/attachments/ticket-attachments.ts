import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { TicketAttachment } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { WorkspaceUi } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { Notifications } from '../../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';

@Component({
  selector: 'app-ticket-attachments',
  imports: [WorkspaceUi],
  template: ` <section hlmCard>
    <div hlmCardHeader>
      <h2 hlmCardTitle>{{ 'supportAttachments' | t }}</h2>
      <p hlmCardDescription>{{ 'supportAttachmentHelp' | t }}</p>
    </div>
    <div hlmCardContent class="grid gap-4">
      @for (a of attachments(); track a.id) {
        <button hlmBtn variant="outline" class="max-w-full" (click)="download(a.id, a.name)">
          <span class="truncate">{{ a.name }}</span>
        </button>
      } @empty {
        <p>{{ 'supportNoAttachments' | t }}</p>
      }
      @if (canUpload()) {
        <div hlmField>
          <label hlmFieldLabel for="attachment">{{ 'supportAttach' | t }}</label
          ><input
            hlmInput
            id="attachment"
            type="file"
            [disabled]="busy() || disabled()"
            (change)="attach($event)"
          />
          <p hlmFieldDescription>{{ 'supportAttachmentsPublic' | t }}</p>
        </div>
      }
    </div>
  </section>`,
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
  private readonly api = inject(WorkspaceApi);
  private readonly i18n = inject(I18n);
  private readonly toast = inject(Notifications);
  async attach(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.busy() || this.disabled()) return;
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      this.toast.error({ title: this.i18n.text('supportFileSize') });
      input.value = '';
      return;
    }
    if (!(await this.beforeAttach()())) {
      input.value = '';
      return;
    }
    this.busy.set(true);
    this.busyChange.emit(true);
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      await this.api.post('support/attachments', {
        id: this.ticketId(),
        name: file.name,
        content,
        version: this.version(),
      });
      this.toast.success('supportSaved');
      await this.reloadTicket()();
    } catch (error) {
      if (!(error instanceof HttpErrorResponse))
        this.toast.error({ title: this.i18n.text('supportFileReadFailed') });
    } finally {
      input.value = '';
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
