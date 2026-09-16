import { Component, OnInit, inject, output, signal } from '@angular/core';
import { WorkspaceUi, Resource } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Notifications } from '../../notifications/notifications';
import { FileStorageSettings } from '../../../api/models';
import { HlmSliderImports } from '@spartan-ng/helm/slider';
import { I18n } from '../../../core/i18n';

const storageSizeOptionsMb = [
  ...Array.from({ length: 20 }, (_, index) => (index + 1) * 5),
  ...Array.from({ length: 10 }, (_, index) => 110 + index * 10),
  ...Array.from({ length: 6 }, (_, index) => 250 + index * 50),
  ...Array.from({ length: 5 }, (_, index) => 600 + index * 100),
];
const maxUploadOptionsMb = [...storageSizeOptionsMb, 0];
const defaultQuotaOptionsMb = [
  ...storageSizeOptionsMb.filter((value) => value >= 50),
  ...Array.from({ length: 40 }, (_, index) => 1100 + index * 100),
  ...Array.from({ length: 15 }, (_, index) => 6000 + index * 1000),
  -1,
];

@Component({
  selector: 'app-file-quota-editor',
  imports: [WorkspaceUi, HlmSliderImports],
  template: `<app-page-state
    [state]="data.state()"
    [refreshError]="data.refreshError()"
    (retry)="load()"
  >
    <form class="grid gap-4 mt-4" (ngSubmit)="save()">
      <div hlmField>
        <div class="flex items-center justify-between gap-3">
          <span hlmFieldLabel id="default-quota-label">{{ 'defaultQuota' | t }}</span>
          <output id="default-quota-value" for="default-quota" class="text-sm tabular-nums">
            @if (quotaMb === -1) {
              {{ 'maxUploadNoLimit' | t }}
            } @else {
              {{ storageSize(quotaMb) }}
            }
          </output>
        </div>
        <hlm-slider
          id="default-quota"
          [value]="[defaultQuotaPosition()]"
          [min]="0"
          [max]="defaultQuotaOptionsMb.length - 1"
          [step]="1"
          [disabled]="busy()"
          aria-labelledby="default-quota-label default-quota-value"
          aria-describedby="quota-help"
          (valueChange)="setDefaultQuotaPosition($event)"
        ></hlm-slider>
        <p hlmFieldDescription id="quota-help">{{ 'defaultQuotaHelp' | t }}</p>
      </div>
      <p class="workspace-meta">{{ 'quotaReductionHelp' | t }}</p>
      <div hlmField>
        <div class="flex items-center justify-between gap-3">
          <span hlmFieldLabel id="max-upload-label">{{ 'maxUploadSize' | t }}</span>
          <output id="max-upload-value" for="max-upload" class="text-sm tabular-nums">
            @if (maxUploadMb === 0) {
              {{ 'maxUploadNoLimit' | t }}
            } @else {
              {{ storageSize(maxUploadMb) }}
            }
          </output>
        </div>
        <hlm-slider
          id="max-upload"
          [value]="[maxUploadPosition()]"
          [min]="0"
          [max]="maxUploadOptionsMb.length - 1"
          [step]="1"
          [disabled]="busy()"
          aria-labelledby="max-upload-label max-upload-value"
          aria-describedby="max-upload-help"
          (valueChange)="setMaxUploadPosition($event)"
        ></hlm-slider>
        <p hlmFieldDescription id="max-upload-help">{{ 'maxUploadSizeHelp' | t }}</p>
      </div>
      <button
        hlmBtn
        type="submit"
        [disabled]="busy() || !valid() || !validMaxUpload() || !hasUnsavedChanges()"
      >
        {{ 'save' | t }}
      </button>
    </form>
  </app-page-state>`,
})
export class FileQuotaEditor implements OnInit {
  readonly saved = output<void>();
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly data = new Resource<FileStorageSettings>();
  readonly busy = signal(false);
  readonly maxUploadOptionsMb = maxUploadOptionsMb;
  readonly defaultQuotaOptionsMb = defaultQuotaOptionsMb;
  quotaMb: number | null = null;
  maxUploadMb: number | null = 20;
  private demoExpiryMinutes = 60;
  private originalMaxUpload = 20;
  private original: number | null = null;
  private version = '';
  ngOnInit() {
    void this.load();
  }
  async load(preserveDraft = false) {
    const quotaDraft = this.quotaMb;
    const maxUploadDraft = this.maxUploadMb;
    const loaded = await this.data.load((signal) =>
      this.api.get('my-files/admin/settings', {}, signal),
    );
    if (!loaded) return;
    const value = this.data.value()!;
    const bytes = value.defaultQuotaBytes;
    this.quotaMb = bytes == null ? null : bytes === -1 ? -1 : bytes / 1048576;
    this.original = this.quotaMb;
    this.version = 'version' in value ? (value.version ?? '') : '';
    const maxUploadBytes =
      'maxUploadBytes' in value ? (value.maxUploadBytes ?? 20 * 1048576) : 20 * 1048576;
    this.maxUploadMb = maxUploadBytes / 1048576;
    this.originalMaxUpload = this.maxUploadMb;
    this.demoExpiryMinutes = value.demoExpiryMinutes ?? 60;
    if (preserveDraft) {
      this.quotaMb = quotaDraft;
      this.maxUploadMb = maxUploadDraft;
    }
  }
  valid() {
    return this.quotaMb != null && defaultQuotaOptionsMb.includes(this.quotaMb);
  }
  defaultQuotaPosition() {
    const position = defaultQuotaOptionsMb.indexOf(this.quotaMb ?? 100);
    return position >= 0 ? position : defaultQuotaOptionsMb.indexOf(100);
  }
  setDefaultQuotaPosition(value: number[]) {
    const position = Math.round(value[0] ?? this.defaultQuotaPosition());
    this.quotaMb = defaultQuotaOptionsMb[position] ?? this.quotaMb;
  }
  storageSize(megabytes: number | null) {
    if (megabytes == null) return '';
    return megabytes >= 1000
      ? `${this.i18n.number(megabytes / 1000)} GB`
      : `${this.i18n.number(megabytes)} MB`;
  }
  hasUnsavedChanges() {
    return this.quotaMb !== this.original || this.maxUploadMb !== this.originalMaxUpload;
  }
  validMaxUpload() {
    return this.maxUploadMb != null && maxUploadOptionsMb.includes(this.maxUploadMb);
  }
  maxUploadPosition() {
    const position = maxUploadOptionsMb.indexOf(this.maxUploadMb ?? 20);
    return position >= 0 ? position : maxUploadOptionsMb.indexOf(20);
  }
  setMaxUploadPosition(value: number[]) {
    const position = Math.round(value[0] ?? this.maxUploadPosition());
    this.maxUploadMb = maxUploadOptionsMb[position] ?? this.maxUploadMb;
  }
  async save() {
    if (this.busy() || !this.valid() || !this.validMaxUpload() || !this.hasUnsavedChanges()) return;
    this.busy.set(true);
    try {
      const bytes =
        this.quotaMb == null ? null : this.quotaMb === -1 ? -1 : Math.round(this.quotaMb * 1048576);
      await this.api.post('my-files/admin/settings', {
        defaultQuotaBytes: bytes,
        maxUploadBytes: Math.round(this.maxUploadMb! * 1048576),
        version: this.version,
        demoExpiryMinutes: this.demoExpiryMinutes,
      });
      this.toast.success('myFilesStorageSaved');
      await this.load();
      this.saved.emit();
    } catch {
      /* Central errors; retain the draft. */
    } finally {
      this.busy.set(false);
    }
  }
}
