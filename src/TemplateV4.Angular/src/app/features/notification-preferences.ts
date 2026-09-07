import { Component, inject, signal } from '@angular/core';
import { NotificationPage } from '../api/models';
import { Notifications } from '../core/notifications';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-notification-preferences',
  imports: [WorkspaceUi],
  template: `
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'notificationPreferences' | t }}</h2>
        <p hlmCardDescription>{{ 'notificationPreferencesHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <app-page-state
          [state]="data.state() === 'loading' ? 'ready' : data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
        >
          <div class="relative min-h-24 overflow-hidden" [class.h-24]="loading()">
            <div [class.blur-sm]="loading()" [attr.inert]="loading() ? '' : null">
              <div hlmField orientation="horizontal" [attr.aria-busy]="loading()">
                <hlm-switch
                  inputId="optional-email"
                  [checked]="data.value()?.optionalEmailEnabled ?? false"
                  [disabled]="busy() || data.state() !== 'ready'"
                  (checkedChange)="preference($event)"
                />
                <div>
                  <label hlmFieldLabel for="optional-email">{{ 'optionalEmail' | t }}</label>
                  <p hlmFieldDescription>{{ 'optionalEmailHelp' | t }}</p>
                </div>
              </div>
            </div>
            @if (loading()) {
              <div class="absolute inset-0 flex items-center justify-center bg-background/30">
                <hlm-spinner [aria-label]="'loading' | t" />
              </div>
            }
          </div>
        </app-page-state>
      </div>
      <div hlmCardFooter>
        <p class="workspace-meta">{{ 'securityEmailRequired' | t }}</p>
      </div>
    </section>
  `,
})
export class NotificationPreferencesPage {
  private readonly api = inject(WorkspaceApi);
  private readonly toast = inject(Notifications);
  readonly data = new Resource<NotificationPage>();
  readonly busy = signal(false);

  constructor() {
    void this.load();
  }

  async load() {
    await this.data.load((signal) => this.api.get('notifications', { pageNumber: 1 }, signal));
  }

  loading() {
    return this.data.state() === 'loading' || this.data.refreshing();
  }

  async preference(enabled: boolean) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('notifications/preferences', { optionalEmailEnabled: enabled });
      this.data.value.update((value) =>
        value ? { ...value, optionalEmailEnabled: enabled } : value,
      );
      this.toast.success('preferencesSaved');
    } catch {
      /* Request errors are already reported centrally. */
    } finally {
      this.busy.set(false);
    }
  }
}
