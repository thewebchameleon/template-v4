import { Component, inject, viewChild } from '@angular/core';
import { ProfileEditor } from './profile-editor';
import { WorkspaceUi, workspaceIcons, Resource, protectUnload } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { ProfileResponse } from '../../../api/models';
@Component({
  selector: 'app-account-home',
  imports: [WorkspaceUi, ProfileEditor],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-state [state]="data.state()" skeleton="form-card" (retry)="load()"
    ><div class="grid gap-6">
      <app-profile-editor [profile]="data.value()" (saved)="data.value.set($event)" /></div
  ></app-page-state>`,
})
export class AccountHomePage {
  readonly editor = viewChild(ProfileEditor);
  readonly api = inject(WorkspaceApi);
  readonly data = new Resource<ProfileResponse>();
  constructor() {
    void this.load();
  }
  load() {
    return this.data.load((signal) => this.api.get('profile', {}, signal));
  }
  hasUnsavedChanges() {
    return !!this.editor()?.hasUnsavedChanges();
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}
