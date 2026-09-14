import { Component, effect, inject, input, model, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from './workspace';
import { BusinessSelect } from './business-select';
interface FileInfo {
  id: string;
  name: string;
  size: number;
}
@Component({
  selector: 'app-attachment-picker',
  imports: [WorkspaceUi, BusinessSelect],
  template: ` <div class="grid gap-3">
    <app-page-state [state]="files.state()" (retry)="load()">
      <app-business-select
        [controlId]="controlId()"
        label="existingAttachment"
        [options]="options()"
        [(value)]="value"
      />
      <app-list-pager
        [total]="files.value()?.total ?? 0"
        [page]="page()"
        [size]="10"
        (pageChange)="page.set($event); load()"
      />
    </app-page-state>
    <div hlmField>
      <label hlmFieldLabel [for]="controlId() + '-upload'">{{ 'uploadAttachment' | t }}</label
      ><input
        hlmInput
        type="file"
        [id]="controlId() + '-upload'"
        [disabled]="busy()"
        (change)="upload($event)"
      />
      <p hlmFieldDescription>{{ 'attachmentUploadHelp' | t }}</p>
    </div>
  </div>`,
})
export class AttachmentPicker {
  readonly organisation = input.required<string>();
  readonly controlId = input.required<string>();
  readonly value = model('');
  readonly page = signal(1);
  readonly busy = signal(false);
  readonly files = new Resource<{ items: FileInfo[]; total: number }>();
  readonly uploaded = signal<FileInfo | null>(null);
  private readonly api = inject(WorkspaceApi);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly runtime = inject(Runtime);
  constructor() {
    effect(() => {
      this.organisation();
      void this.load();
    });
  }
  options() {
    const files = this.files.value()?.items ?? [];
    const uploaded = this.uploaded();
    return [
      ...(uploaded && !files.some((x) => x.id === uploaded.id) ? [uploaded] : []),
      ...files,
    ].map((x) => ({ id: x.id, label: x.name }));
  }
  async load() {
    await this.files.load((signal) =>
      this.api.get(
        `organisations/${this.organisation()}/attachments`,
        { pageNumber: this.page(), pageSize: 10 },
        signal,
      ),
    );
  }
  async upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.busy()) return;
    this.busy.set(true);
    try {
      const headers = await this.auth.browserHeaders();
      const result = await firstValueFrom(
        this.http.post<FileInfo>(
          `${this.runtime.apiUrl}/api/v1/auth/organisations/${this.organisation()}/attachments/upload`,
          file,
          {
            params: { name: file.name },
            headers: { ...headers, 'Content-Type': 'application/octet-stream' },
            withCredentials: true,
          },
        ),
      );
      this.uploaded.set(result);
      this.value.set(result.id);
      await this.load();
    } catch {
      /* HTTP interceptor reports failures. */
    } finally {
      this.busy.set(false);
      input.value = '';
    }
  }
}
