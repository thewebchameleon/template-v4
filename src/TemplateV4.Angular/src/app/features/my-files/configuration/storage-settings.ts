import { Component, OnInit, inject, viewChild } from '@angular/core';
import { WorkspaceUi, Resource, protectUnload } from '../../../shared/workspace';
import { StorageUsageCard } from '../../../shared/storage-usage-card';
import { WorkspaceApi } from '../../../core/workspace-api';
import { FilePage } from '../../../api/models';
import { FileQuotaEditor } from './file-quota-editor';
import { DemoExpiryEditor } from './demo-expiry-editor';

@Component({
  selector: 'app-storage-settings',
  imports: [WorkspaceUi, FileQuotaEditor, StorageUsageCard, DemoExpiryEditor],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="storageSettings" description="storageSettingsHelp" />
    <div class="workspace-columns">
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'storageSettings' | t }}</h2>
          <p hlmCardDescription>{{ 'myFilesStorageHelp' | t }}</p>
        </div>
        <div hlmCardContent><app-file-quota-editor (saved)="storageSaved()" /></div>
      </section>
      <aside class="workspace-stack min-w-0">
        <app-page-state
          [state]="usage.state()"
          [refreshError]="usage.refreshError()"
          (retry)="loadUsage()"
        >
          <app-storage-usage-card [usage]="usage.value()" />
        </app-page-state>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'myFilesDemoMode' | t }}</h2>
            <p hlmCardDescription>{{ 'myFilesDemoExpiryHelp' | t }}</p>
          </div>
          <div hlmCardContent><app-demo-expiry-editor (saved)="demoExpirySaved()" /></div>
        </section>
      </aside>
    </div>`,
})
export class StorageSettingsPage implements OnInit {
  readonly api = inject(WorkspaceApi);
  readonly usage = new Resource<FilePage>();
  readonly editor = viewChild(FileQuotaEditor);
  readonly demoEditor = viewChild(DemoExpiryEditor);
  ngOnInit() {
    void this.loadUsage();
  }
  loadUsage() {
    return this.usage.load((signal) =>
      this.api.get('my-files', { pageNumber: 1, pageSize: 1 }, signal),
    );
  }
  storageSaved() {
    void this.loadUsage();
    void this.demoEditor()?.load(true);
  }
  demoExpirySaved() {
    void this.editor()?.load(true);
  }
  hasUnsavedChanges() {
    return (
      (this.editor()?.hasUnsavedChanges() ?? false) ||
      (this.demoEditor()?.hasUnsavedChanges() ?? false)
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}
