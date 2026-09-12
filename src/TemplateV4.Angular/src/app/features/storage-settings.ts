import { Component, viewChild } from '@angular/core';
import { WorkspaceUi, protectUnload } from '../shared/workspace';
import { FileQuotaEditor } from './file-quota-editor';

@Component({
  selector: 'app-storage-settings',
  imports: [WorkspaceUi, FileQuotaEditor],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="storageSettings" description="storageSettingsHelp" />
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'defaultQuota' | t }}</h2>
        <p hlmCardDescription>{{ 'defaultQuotaHelp' | t }}</p>
      </div>
      <div hlmCardContent><app-file-quota-editor /></div>
    </section>
    <p class="mt-4">
      <a hlmBtn variant="outline" routerLink="/administration/users">{{ 'userManagement' | t }}</a>
    </p>`,
})
export class StorageSettingsPage {
  readonly editor = viewChild(FileQuotaEditor);
  hasUnsavedChanges() {
    return this.editor()?.hasUnsavedChanges() ?? false;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}
