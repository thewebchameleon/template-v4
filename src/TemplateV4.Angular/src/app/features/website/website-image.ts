import { Component, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../core/auth';
import { Runtime } from '../../core/runtime';
import { WorkspaceUi } from '../../shared/workspace';
@Component({
  selector: 'app-website-image',
  imports: [WorkspaceUi],
  template: `<div hlmField>
    <label hlmFieldLabel [for]="controlId()">{{ 'websiteUpload' | t }}</label
    ><input
      hlmInput
      [id]="controlId()"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      [disabled]="busy()"
      (change)="upload($event)"
    />
    <p hlmFieldDescription>{{ 'websiteUploadHelp' | t }}</p>
    @if (failed()) {
      <p role="alert">{{ 'websiteFailure' | t }}</p>
    }
  </div>`,
})
export class WebsiteImageUpload {
  readonly controlId = input.required<string>();
  readonly uploaded = output<string>();
  readonly busy = signal(false);
  readonly failed = signal(false);
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  async upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.failed.set(false);
    if (file.size > 1048576) {
      this.failed.set(true);
      return;
    }
    this.busy.set(true);
    try {
      const result = await firstValueFrom(
        this.http.post<{ url: string }>(this.runtime.apiUrl + '/api/v1/auth/website-images', file, {
          withCredentials: true,
          headers: {
            ...(await this.auth.browserHeaders()),
            'Content-Type': 'application/octet-stream',
          },
        }),
      );
      this.uploaded.emit(result.url);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
