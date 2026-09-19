import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SupportModuleSettings } from '../../../api/models';
import { Features } from '../../../core/features';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../../shared/workspace';
import { Notifications } from '../../notifications/notifications';

@Component({
  selector: 'app-support-settings-editor',
  imports: [WorkspaceUi],
  template: `<app-page-state
    [state]="data.state()"
    [refreshError]="data.refreshError()"
    (retry)="load()"
  >
    @if (conflict()) {
      <div hlmAlert role="alert">
        <p hlmAlertDescription>{{ 'moduleConflict' | t }}</p>
      </div>
    }
    @if (data.value()) {
      <form #form="ngForm" class="grid gap-4" (ngSubmit)="form.valid && save()">
        <label
          hlmFieldLabel
          for="support-ticketsEnabled"
          class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
        >
          <div hlmField orientation="horizontal">
            <hlm-switch
              inputId="support-ticketsEnabled"
              name="ticketsEnabled"
              [(ngModel)]="draft.ticketsEnabled"
              [disabled]="busy() || data.refreshing() || data.refreshError()"
              [aria-label]="'supportTicketsFeature' | t"
              aria-describedby="support-ticketsEnabled-help"
            />
            <div hlmFieldContent>
              <span hlmFieldTitle>{{ 'supportTicketsFeature' | t }}</span>
              <p hlmFieldDescription id="support-ticketsEnabled-help">
                {{ 'supportTicketsFeatureHelp' | t }}
              </p>
            </div>
          </div>
        </label>
        <div class="flex flex-wrap gap-3">
          <button
            hlmBtn
            type="submit"
            [disabled]="busy() || data.refreshing() || data.refreshError() || !form.valid"
          >
            {{ 'save' | t }}
          </button>
          <a hlmBtn variant="outline" routerLink="/support/contact">{{ 'contactInbox' | t }}</a>
        </div>
      </form>
    }
  </app-page-state>`,
})
export class SupportSettingsEditor {
  readonly data = new Resource<SupportModuleSettings>();
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly api = inject(WorkspaceApi);
  private readonly features = inject(Features);
  private readonly toast = inject(Notifications);
  draft = { ticketsEnabled: false };
  constructor() {
    void this.load();
  }
  async load() {
    if (
      await this.data.load((signal) =>
        this.api.get<SupportModuleSettings>('administration/modules/support/settings', {}, signal),
      )
    ) {
      const settings = this.data.value();
      if (settings) this.draft = { ...settings };
    }
  }
  hasUnsavedChanges() {
    const saved = this.data.value();
    return (
      !!saved &&
      this.draft.ticketsEnabled !== saved.ticketsEnabled
    );
  }
  async save() {
    const settings = this.data.value();
    if (!settings || this.busy() || this.data.refreshing() || this.data.refreshError()) return;
    this.busy.set(true);
    this.conflict.set(false);
    try {
      const saved = await this.api.post<SupportModuleSettings>(
        'administration/modules/support/settings',
        {
          ...settings,
          ticketsEnabled: this.draft.ticketsEnabled,
          version: settings.version,
        },
      );
      this.data.value.set(saved);
      this.draft = { ...saved };
      await this.features.refresh();
      this.toast.success('supportFeaturesSaved');
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
