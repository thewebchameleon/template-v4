import { Component, OnDestroy, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { FileStorageModuleSettings } from '../../../api/models';
import { Notifications } from '../../notifications/notifications';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../../shared/workspace';

@Component({
  selector: 'app-file-storage-settings-editor',
  imports: [WorkspaceUi, HlmDialogImports],
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
        <div class="grid gap-4">
          <label
            hlmFieldLabel
            for="file-storage-demo"
            [attr.aria-label]="'fileStorageDemoMode' | t"
            class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
          >
            <div hlmField orientation="horizontal">
              <hlm-switch
                inputId="file-storage-demo"
                [(ngModel)]="demoMode"
                (ngModelChange)="toggleDemo($event)"
                [disabled]="busy() || data.refreshing() || data.refreshError() || confirming()"
                [aria-label]="'fileStorageDemoMode' | t"
                aria-describedby="file-storage-demo-help"
              />
              <div hlmFieldContent>
                <span hlmFieldTitle>{{ 'fileStorageDemoMode' | t }}</span>
                <p hlmFieldDescription id="file-storage-demo-help">
                  {{ 'fileStorageDemoHelp' | t }}
                </p>
              </div>
            </div>
          </label>
          <label
            hlmFieldLabel
            for="file-storage-slow-upload"
            [attr.aria-label]="'fileStorageSlowUploadMode' | t"
            class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
          >
            <div hlmField orientation="horizontal">
              <hlm-switch
                inputId="file-storage-slow-upload"
                [(ngModel)]="slowUploadMode"
                (ngModelChange)="save(settings.demoMode, $event)"
                [disabled]="busy() || data.refreshing() || data.refreshError() || confirming()"
                [aria-label]="'fileStorageSlowUploadMode' | t"
                aria-describedby="file-storage-slow-help"
              />
              <div hlmFieldContent>
                <span hlmFieldTitle>{{ 'fileStorageSlowUploadMode' | t }}</span>
                <p hlmFieldDescription id="file-storage-slow-help">
                  {{ 'fileStorageSlowUploadHelp' | t }}
                </p>
              </div>
            </div>
          </label>
        </div>
      }
    </app-page-state>
    <hlm-dialog
      [state]="confirming() ? 'open' : 'closed'"
      (stateChanged)="$event === 'closed' && close()"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header
          ><h2 hlmDialogTitle>{{ 'demoConfirmTitle' | t }}</h2>
          <p hlmDialogDescription>{{ 'demoConfirmWarning' | t }}</p></hlm-dialog-header
        >
        <form class="grid gap-4" (ngSubmit)="enableDemo()">
          <p>{{ 'fileStorageDemoExpiry' | t }}: {{ data.value()?.demoExpiryMinutes }}</p>
          <div hlmField>
            <label hlmFieldLabel for="demo-password">{{ 'password' | t }}</label>
            <input
              hlmInput
              id="demo-password"
              name="password"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="password"
              required
              maxlength="1024"
              [disabled]="busy()"
              aria-describedby="demo-password-help"
            />
            <p hlmFieldDescription id="demo-password-help">{{ 'demoPasswordHelp' | t }}</p>
          </div>
          @if (failed()) {
            <div hlmAlert role="alert">
              <p hlmAlertDescription>{{ 'demoEnableFailed' | t }}</p>
            </div>
          }
          <hlm-dialog-footer>
            <button hlmBtn variant="outline" type="button" [disabled]="busy()" (click)="close()">
              {{ 'cancel' | t }}
            </button>
            <button hlmBtn variant="destructive" type="submit" [disabled]="busy() || !password">
              {{ 'demoConfirmTitle' | t }}
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>`,
})
export class FileStorageSettingsEditor implements OnDestroy {
  readonly data = new Resource<FileStorageModuleSettings>();
  private readonly api = inject(WorkspaceApi);
  private readonly toast = inject(Notifications);
  readonly busy = signal(false);
  readonly confirming = signal(false);
  readonly failed = signal(false);
  readonly conflict = signal(false);
  password = '';
  demoMode = false;
  slowUploadMode = false;
  constructor() {
    void this.load();
  }
  ngOnDestroy() {
    this.password = '';
  }
  hasUnsavedChanges() {
    return this.confirming() || !!this.password;
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get<FileStorageModuleSettings>(
        'administration/modules/file-storage/settings',
        {},
        signal,
      ),
    );
    if (loaded) this.sync();
    return loaded;
  }
  private sync() {
    const settings = this.data.value();
    this.demoMode = settings?.demoMode ?? false;
    this.slowUploadMode = settings?.slowUploadMode ?? false;
  }
  toggleDemo(enabled: boolean) {
    if (enabled) {
      this.password = '';
      this.failed.set(false);
      this.confirming.set(true);
    } else {
      const settings = this.data.value();
      if (settings) void this.save(false, settings.slowUploadMode);
    }
  }
  close() {
    this.password = '';
    this.confirming.set(false);
    this.sync();
  }
  async enableDemo() {
    const settings = this.data.value();
    if (!settings || !this.password || this.busy()) return;
    const password = this.password;
    this.password = '';
    if (await this.save(true, settings.slowUploadMode, password)) this.close();
  }
  async save(demoMode: boolean, slowUploadMode: boolean, password?: string) {
    const settings = this.data.value();
    if (!settings || this.busy() || this.data.refreshing() || this.data.refreshError())
      return false;
    this.busy.set(true);
    this.conflict.set(false);
    this.failed.set(false);
    try {
      const saved = await this.api.post<FileStorageModuleSettings>(
        'administration/modules/file-storage/settings',
        { demoMode, slowUploadMode, version: settings.version, password },
      );
      this.data.value.set(saved);
      this.toast.success(
        demoMode !== settings.demoMode ? 'fileStorageDemoSaved' : 'fileStorageSlowUploadSaved',
      );
      return true;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.close();
        this.conflict.set(true);
        await this.load();
      } else this.failed.set(true);
      return false;
    } finally {
      this.sync();
      this.busy.set(false);
    }
  }
}
