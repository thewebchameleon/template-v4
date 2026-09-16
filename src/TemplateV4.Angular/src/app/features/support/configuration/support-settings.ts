import { Component, viewChild } from '@angular/core';
import { WorkspaceUi, protectUnload } from '../../../shared/workspace';
import { SupportSettingsEditor } from './support-settings-editor';

@Component({
  selector: 'app-support-settings',
  imports: [WorkspaceUi, SupportSettingsEditor],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="supportSettings" description="supportSettingsHelp" />
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'supportNotificationEmail' | t }}</h2>
      </div>
      <div hlmCardContent><app-support-settings-editor [recipientOnly]="true" /></div>
    </section>`,
})
export class SupportSettingsPage {
  private readonly editor = viewChild(SupportSettingsEditor);
  hasUnsavedChanges() {
    return this.editor()?.busy() === true || this.editor()?.hasUnsavedChanges() === true;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}
