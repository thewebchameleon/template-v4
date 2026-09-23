import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FileStorageSettings } from '../../../api/models';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../../shared/workspace';
import { Notifications } from '../../notifications/notifications';

@Component({
  selector: 'app-demo-expiry-editor',
  imports: [WorkspaceUi],
  template: `<app-page-state
    [state]="data.state()"
    skeleton="form"
    [refreshError]="data.refreshError()"
    (retry)="load()"
  >
    <form class="grid gap-4" (ngSubmit)="save()">
      <div hlmField>
        <label hlmFieldLabel for="demo-expiry">{{ 'fileStorageDemoExpiry' | t }}</label>
        <input
          hlmInput
          id="demo-expiry"
          name="demoExpiryMinutes"
          type="number"
          min="1"
          max="525600"
          step="1"
          [(ngModel)]="demoExpiryMinutes"
          [disabled]="busy()"
          aria-describedby="demo-expiry-help"
          [attr.aria-invalid]="!valid() ? true : null"
        />
        <p hlmFieldDescription id="demo-expiry-help">{{ 'fileStorageDemoExpiryHelp' | t }}</p>
        @if (!valid()) {
          <hlm-field-error forceShow>{{ 'fileStorageDemoExpiryValidation' | t }}</hlm-field-error>
        }
      </div>
      <button hlmBtn type="submit" [disabled]="busy() || !valid() || !hasUnsavedChanges()">
        {{ 'save' | t }}
      </button>
    </form>
  </app-page-state>`,
})
export class DemoExpiryEditor implements OnInit {
  readonly saved = output<void>();
  readonly api = inject(WorkspaceApi);
  readonly toast = inject(Notifications);
  readonly data = new Resource<FileStorageSettings>();
  readonly busy = signal(false);
  demoExpiryMinutes: number | null = 60;
  private originalExpiry = 60;
  private defaultQuotaBytes = 100 * 1048576;
  private maxUploadBytes = 20 * 1048576;
  private version = '';

  ngOnInit() {
    void this.load();
  }

  async load(preserveDraft = false) {
    const expiryDraft = this.demoExpiryMinutes;
    const loaded = await this.data.load((signal) =>
      this.api.get('file-storage/admin/settings', {}, signal),
    );
    if (!loaded) return;
    const value = this.data.value()!;
    this.demoExpiryMinutes = value.demoExpiryMinutes ?? 60;
    this.originalExpiry = this.demoExpiryMinutes;
    this.defaultQuotaBytes = value.defaultQuotaBytes ?? 100 * 1048576;
    this.maxUploadBytes = value.maxUploadBytes ?? 20 * 1048576;
    this.version = value.version ?? '';
    if (preserveDraft) this.demoExpiryMinutes = expiryDraft;
  }

  valid() {
    return (
      this.demoExpiryMinutes != null &&
      Number.isInteger(this.demoExpiryMinutes) &&
      this.demoExpiryMinutes >= 1 &&
      this.demoExpiryMinutes <= 525600
    );
  }

  hasUnsavedChanges() {
    return this.demoExpiryMinutes !== this.originalExpiry;
  }

  async save() {
    if (this.busy() || !this.valid() || !this.hasUnsavedChanges()) return;
    this.busy.set(true);
    try {
      await this.api.post('file-storage/admin/settings', {
        defaultQuotaBytes: this.defaultQuotaBytes,
        maxUploadBytes: this.maxUploadBytes,
        demoExpiryMinutes: this.demoExpiryMinutes,
        version: this.version,
      });
      this.toast.success('fileStorageSettingsSaved');
      await this.load();
      this.saved.emit();
    } catch {
      /* Central errors; retain the draft. */
    } finally {
      this.busy.set(false);
    }
  }
}
