import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FileStorageModuleSettings } from '../../../api/models';
import { Notifications } from '../../notifications/notifications';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../../shared/workspace';

@Component({
  selector: 'app-file-storage-settings-editor',
  imports: [WorkspaceUi],
  template: `<app-page-state
    [state]="data.state()"
    skeleton="form"
    [refreshError]="data.refreshError()"
    (retry)="load()"
  >
    @if (conflict()) {
      <div hlmAlert>
        <p hlmAlertDescription>{{ 'moduleConflict' | t }}</p>
      </div>
    }
    @if (data.value(); as settings) {
      @if (settings.demoMode) {
        <div hlmAlert class="mb-4">
          <p hlmAlertDescription>{{ 'demoActiveWarning' | t }}</p>
        </div>
      }
      <label
        hlmFieldLabel
        for="file-storage-slow-upload"
        [attr.aria-label]="'fileStorageSlowUploadMode' | t"
        class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
      >
        <div hlmField orientation="horizontal">
          <hlm-switch
            inputId="file-storage-slow-upload"
            [ngModel]="settings.slowUploadMode"
            (ngModelChange)="save($event)"
            [disabled]="busy() || data.refreshing() || data.refreshError()"
            [aria-label]="'fileStorageSlowUploadMode' | t"
            aria-describedby="file-storage-slow-help"
          />
          <div hlmFieldContent>
            <span hlmFieldTitle>{{ 'fileStorageSlowUploadMode' | t }}</span>
            <p hlmFieldDescription id="file-storage-slow-help">{{ 'fileStorageSlowUploadHelp' | t }}</p>
          </div>
        </div>
      </label>
    }
  </app-page-state>`,
})
export class FileStorageSettingsEditor {
  readonly data = new Resource<FileStorageModuleSettings>();
  private readonly api = inject(WorkspaceApi);
  private readonly toast = inject(Notifications);
  readonly busy = signal(false);
  readonly conflict = signal(false);

  constructor() {
    void this.load();
  }
  hasUnsavedChanges() {
    return false;
  }
  load() {
    return this.data.load((signal) =>
      this.api.get<FileStorageModuleSettings>('administration/modules/file-storage/settings', {}, signal),
    );
  }
  async save(slowUploadMode: boolean) {
    const settings = this.data.value();
    if (!settings || this.busy() || this.data.refreshing() || this.data.refreshError()) return;
    this.busy.set(true);
    this.conflict.set(false);
    try {
      const saved = await this.api.post<FileStorageModuleSettings>(
        'administration/modules/file-storage/settings',
        { demoMode: settings.demoMode, slowUploadMode, version: settings.version },
      );
      this.data.value.set(saved);
      this.toast.success('fileStorageSlowUploadSaved');
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.conflict.set(true);
        await this.load();
      }
    } finally {
      this.busy.set(false);
    }
  }
}
