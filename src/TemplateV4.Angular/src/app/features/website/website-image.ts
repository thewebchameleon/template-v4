import { HttpClient } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../core/auth';
import { Translate } from '../../core/i18n';
import { Runtime } from '../../core/runtime';

@Component({
  selector: 'app-website-image',
  imports: [HlmButtonImports, HlmFieldImports, HlmSpinnerImports, Translate],
  template: `
    <div hlmField>
      <label hlmFieldLabel [for]="controlId()">{{ 'websiteLogo' | t }}</label>
      <div
        class="relative rounded-lg border border-dashed border-input bg-muted/40 transition-colors focus-within:ring-2 focus-within:ring-ring"
        [class.bg-accent]="dragging()"
        (dragenter)="startDrag($event)"
        (dragover)="startDrag($event)"
        (dragleave)="endDrag($event)"
        (drop)="drop($event)"
      >
        <input
          class="sr-only"
          [id]="controlId()"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          [disabled]="busy()"
          (change)="select($event)"
        />
        <label
          class="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 px-4 py-6 text-center"
          [for]="controlId()"
        >
          @if (busy()) {
            <hlm-spinner />
            <span>{{ 'websiteLogoUploading' | t }}</span>
          } @else {
            <span class="font-medium">{{ 'websiteLogoDropzone' | t }}</span>
            <span class="text-sm text-muted-foreground">{{ 'websiteUploadHelp' | t }}</span>
          }
        </label>
      </div>

      @if (value()) {
        <div class="flex items-center gap-3">
          <img
            class="size-12 rounded-md border border-border object-contain"
            [src]="value()"
            alt=""
            width="48"
            height="48"
          />
          <span class="min-w-0 flex-1 truncate text-sm">{{ 'websiteLogoSelected' | t }}</span>
          <button hlmBtn type="button" size="sm" variant="ghost" (click)="uploaded.emit('')">
            {{ 'websiteRemoveLogo' | t }}
          </button>
        </div>
      }

      @if (failed()) {
        <hlm-field-error forceShow>{{ 'websiteLogoInvalid' | t }}</hlm-field-error>
      }
    </div>
  `,
})
export class WebsiteImageUpload {
  readonly controlId = input.required<string>();
  readonly value = input('');
  readonly uploaded = output<string>();
  readonly busy = signal(false);
  readonly failed = signal(false);
  readonly dragging = signal(false);
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);

  select(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) void this.upload(file);
  }

  startDrag(event: DragEvent) {
    event.preventDefault();
    if (!this.busy()) this.dragging.set(true);
  }

  endDrag(event: DragEvent) {
    event.preventDefault();
    if (event.currentTarget === event.target) this.dragging.set(false);
  }

  drop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && !this.busy()) void this.upload(file);
  }

  private async upload(file: File) {
    this.failed.set(false);
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1048576) {
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
