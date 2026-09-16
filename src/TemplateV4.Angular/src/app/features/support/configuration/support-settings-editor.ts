import { Component, inject, signal, input } from '@angular/core';
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
        @if (!recipientOnly()) {
          @for (feature of toggles; track feature.key) {
            <label
              hlmFieldLabel
              [for]="'support-' + feature.key"
              class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
            >
              <div hlmField orientation="horizontal">
                <hlm-switch
                  [inputId]="'support-' + feature.key"
                  [name]="feature.key"
                  [(ngModel)]="draft[feature.key]"
                  [disabled]="busy() || data.refreshing() || data.refreshError()"
                  [aria-label]="feature.label | t"
                  [aria-describedby]="'support-' + feature.key + '-help'"
                />
                <div hlmFieldContent>
                  <span hlmFieldTitle>{{ feature.label | t }}</span>
                  <p hlmFieldDescription [id]="'support-' + feature.key + '-help'">
                    {{ feature.help | t }}
                  </p>
                </div>
              </div>
            </label>
          }
        }
        @if (recipientOnly()) {
          <div hlmField>
            <label hlmFieldLabel for="support-notification-email">{{
              'supportNotificationEmail' | t
            }}</label>
            <input
              hlmInput
              id="support-notification-email"
              name="notificationEmail"
              type="email"
              email
              maxlength="254"
              [(ngModel)]="draft.notificationEmail"
              [disabled]="busy()"
              aria-describedby="support-notification-help"
            />
            <p hlmFieldDescription id="support-notification-help">
              {{ 'supportNotificationHelp' | t }}
            </p>
          </div>
        }
        @if (draft.enquiriesEnabled && !draft.notificationEmail) {
          <div hlmAlert>
            <p hlmAlertDescription>{{ 'supportRecipientRequired' | t }}</p>
          </div>
        }
        <div class="flex flex-wrap gap-3">
          <button
            hlmBtn
            type="submit"
            [disabled]="busy() || data.refreshing() || data.refreshError() || !form.valid"
          >
            {{ 'save' | t }}
          </button>
          <a hlmBtn variant="outline" routerLink="/administration/contact">{{
            'contactInbox' | t
          }}</a>
        </div>
      </form>
    }
  </app-page-state>`,
})
export class SupportSettingsEditor {
  readonly recipientOnly = input(false);
  readonly data = new Resource<SupportModuleSettings>();
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly api = inject(WorkspaceApi);
  private readonly features = inject(Features);
  private readonly toast = inject(Notifications);
  draft = {
    enquiriesEnabled: false,
    ticketsEnabled: false,
    notificationEmail: '',
  };
  readonly toggles = [
    {
      key: 'enquiriesEnabled',
      label: 'supportEnquiriesFeature',
      help: 'supportEnquiriesFeatureHelp',
    },
    { key: 'ticketsEnabled', label: 'supportTicketsFeature', help: 'supportTicketsFeatureHelp' },
  ] as const;
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
      (this.draft.enquiriesEnabled !== saved.enquiriesEnabled ||
        this.draft.ticketsEnabled !== saved.ticketsEnabled ||
        this.draft.notificationEmail !== saved.notificationEmail)
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
          ...(this.recipientOnly()
            ? { notificationEmail: this.draft.notificationEmail.trim() }
            : {
                enquiriesEnabled: this.draft.enquiriesEnabled,
                ticketsEnabled: this.draft.ticketsEnabled,
              }),
          version: settings.version,
        },
      );
      this.data.value.set(saved);
      this.draft = { ...saved };
      this.features.reset();
      await this.features.load();
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
