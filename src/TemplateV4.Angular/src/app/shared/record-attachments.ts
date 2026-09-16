import { Auth } from '../core/auth';
import { Component, effect, inject, input, signal } from '@angular/core';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from './workspace';
import { AttachmentPicker } from './attachment-picker';
interface Attachment {
  fileId: string;
  name: string | null;
  available: boolean;
}
@Component({
  selector: 'app-record-attachments',
  imports: [WorkspaceUi, AttachmentPicker],
  template: ` <section hlmCard class="mt-6">
    <div hlmCardHeader>
      <h2 hlmCardTitle>{{ 'attachments' | t }}</h2>
    </div>
    <div hlmCardContent class="grid gap-4">
      <app-page-state [state]="data.state()" (retry)="load()">
        @for (file of data.value(); track file.fileId) {
          <div class="flex flex-wrap items-center gap-3">
            @if (file.available) {
              <button hlmBtn variant="link" (click)="download(file)">{{ file.name }}</button>
            } @else {
              <span>{{ 'attachmentUnavailable' | t }}</span>
            }
            <button
              hlmBtn
              variant="outline"
              [disabled]="busy() || !canManage()"
              (click)="change(file.fileId, false)"
            >
              {{ 'remove' | t }}
            </button>
          </div>
        }
      </app-page-state>
      <app-attachment-picker controlId="record-file" [(value)]="selected" />
      <button
        hlmBtn
        [disabled]="busy() || !selected || !canManage()"
        (click)="change(selected, true)"
      >
        {{ 'attachFile' | t }}
      </button>
    </div>
  </section>`,
})
export class RecordAttachments {
  private readonly auth = inject(Auth);
  canManage() {
    return this.auth.has(this.kind() === 'crm' ? 'crm.manage' : 'invoicing.issue');
  }
  readonly record = input.required<string>();
  readonly kind = input.required<'crm' | 'invoicing'>();
  readonly data = new Resource<Attachment[]>();
  readonly busy = signal(false);
  selected = '';
  private readonly api = inject(WorkspaceApi);
  constructor() {
    effect(() => {
      this.record();
      this.kind();
      void this.load();
    });
  }
  path() {
    return `organisation/${this.kind()}/${this.record()}/attachments`;
  }
  async load() {
    await this.data.load((signal) => this.api.get(this.path(), {}, signal));
  }
  async change(fileId: string, attached: boolean) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(this.path(), { fileId, attached });
      this.selected = '';
      await this.load();
    } catch {
      /* Interceptor reports failures. */
    } finally {
      this.busy.set(false);
    }
  }
  download(file: Attachment) {
    void this.api.download(`organisation/files/${file.fileId}`, file.name ?? 'document');
  }
}
