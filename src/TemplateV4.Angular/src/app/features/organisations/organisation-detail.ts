import { Component, viewChild } from '@angular/core';
import { WorkspaceUi } from '../../shared/workspace';
import { OrganisationSettingsEditor } from './organisation-settings-editor';

@Component({
  selector: 'app-organisation-detail',
  imports: [WorkspaceUi, OrganisationSettingsEditor],
  template: `<app-page-header title="organisation" description="organisationManagementHelp" />
    <app-organisation-settings-editor />`,
})
export class OrganisationDetailPage {
  private readonly editor = viewChild(OrganisationSettingsEditor);
  hasUnsavedChanges() {
    return !!this.editor()?.hasUnsavedChanges();
  }
}
