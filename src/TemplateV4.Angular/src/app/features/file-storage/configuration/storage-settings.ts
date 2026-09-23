import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { WorkspaceUi, Resource, protectUnload, Confirmations } from '../../../shared/workspace';
import { StorageUsageCard } from '../../../shared/storage-usage-card';
import { WorkspaceApi } from '../../../core/workspace-api';
import { FilePage } from '../../../api/models';
import { FileQuotaEditor } from './file-quota-editor';
import { DemoExpiryEditor } from './demo-expiry-editor';
import { FileStorageSettingsEditor } from './file-storage-settings-editor';
import { Auth } from '../../../core/auth';
import { Notifications } from '../../notifications/notifications';

@Component({
  selector: 'app-storage-settings',
  imports: [
    WorkspaceUi,
    FileQuotaEditor,
    StorageUsageCard,
    DemoExpiryEditor,
    FileStorageSettingsEditor,
  ],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="storageSettings" description="storageSettingsHelp" />
    @if (quotaReached()) {
      <div hlmAlert variant="destructive" class="mb-6">
        <h2 hlmAlertTitle>{{ 'quotaReached' | t }}</h2>
        <p hlmAlertDescription>{{ 'quotaReachedHelp' | t }}</p>
      </div>
    }
    <div class="workspace-columns">
      <div class="workspace-stack min-w-0">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'storageSettings' | t }}</h2>
            <p hlmCardDescription>{{ 'fileStorageSettingsHelp' | t }}</p>
          </div>
          <div hlmCardContent><app-file-quota-editor (saved)="storageSaved()" /></div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'moduleFeatures' | t }}</h2>
          </div>
          <div hlmCardContent><app-file-storage-settings-editor /></div>
        </section>
      </div>
      <aside class="workspace-stack min-w-0">
        <app-page-state
          [state]="usage.state()"
          skeleton="card"
          [refreshError]="usage.refreshError()"
          (retry)="loadUsage()"
        >
          <app-storage-usage-card
            [usage]="usage.value()"
            [includeTrash]="true"
            [showQuotaAlert]="false"
            [allowEmptyTrash]="auth.has('organisation.files.manage')"
            [emptyTrashBusy]="emptyTrashBusy()"
            (emptyTrash)="emptyTrash()"
          />
        </app-page-state>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'fileStorageDemoMode' | t }}</h2>
            <p hlmCardDescription>{{ 'fileStorageDemoExpiryHelp' | t }}</p>
          </div>
          <div hlmCardContent><app-demo-expiry-editor (saved)="demoExpirySaved()" /></div>
        </section>
      </aside>
    </div>`,
})
export class StorageSettingsPage implements OnInit {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  private readonly toast = inject(Notifications);
  private readonly confirm = inject(Confirmations);
  readonly usage = new Resource<FilePage>();
  readonly editor = viewChild(FileQuotaEditor);
  readonly demoEditor = viewChild(DemoExpiryEditor);
  readonly settingsEditor = viewChild(FileStorageSettingsEditor);
  readonly emptyTrashBusy = signal(false);
  readonly quotaReached = computed(() => {
    const value = this.usage.value();
    return value !== null && value.quotaBytes >= 0 && value.usedBytes >= value.quotaBytes;
  });
  ngOnInit() {
    void this.loadUsage();
  }
  loadUsage() {
    return this.usage.load((signal) =>
      this.api.get('file-storage', { pageNumber: 1, pageSize: 1 }, signal),
    );
  }
  storageSaved() {
    void this.loadUsage();
    void this.demoEditor()?.load(true);
  }
  demoExpirySaved() {
    void this.editor()?.load(true);
  }
  async emptyTrash() {
    if (this.emptyTrashBusy() || !(await this.confirm.ask('emptyTrash', 'purgeFileHelp', '', true)))
      return;
    this.emptyTrashBusy.set(true);
    try {
      await this.api.post('file-storage/trash/empty');
      this.toast.success('fileStorageSaved');
      await this.loadUsage();
    } catch {
      /* Central error UI. */
    } finally {
      this.emptyTrashBusy.set(false);
    }
  }
  hasUnsavedChanges() {
    return (
      (this.editor()?.hasUnsavedChanges() ?? false) ||
      (this.demoEditor()?.hasUnsavedChanges() ?? false) ||
      (this.settingsEditor()?.hasUnsavedChanges() ?? false)
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}
