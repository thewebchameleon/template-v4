import { Component, inject, signal } from '@angular/core';
import { NotificationPage } from '../../api/models';
import { Notifications } from './notifications';
import { WorkspaceApi } from '../../core/workspace-api';
import { WebPush, WebPushStatus } from './web-push';
import { Resource, WorkspaceUi } from '../../shared/workspace';

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
      <div hlmCardContent>
        <app-page-state
          [state]="pushData.state()"
          [refreshError]="pushData.refreshError()"
          (retry)="loadPush()"
        >
          <div class="grid gap-4" [attr.aria-busy]="pushBusy()">
            <label hlmFieldLabel for="web-push">
              <div hlmField orientation="horizontal">
                <hlm-switch
                  inputId="web-push"
                  [checked]="pushData.value()?.enabled ?? false"
                  [disabled]="
                    pushBusy() ||
                    (!pushData.value()?.enabled &&
                      (!push.supported || !pushData.value()?.publicKey))
                  "
                  (checkedChange)="pushPreference($event)"
                />
                <div>
                  <span>{{ 'webPush' | t }}</span>
                  <p hlmFieldDescription>{{ 'webPushHelp' | t }}</p>
                </div>
              </div>
            </label>
            <label hlmFieldLabel for="push-preview">
              <div hlmField orientation="horizontal">
                <hlm-switch
                  inputId="push-preview"
                  [checked]="pushData.value()?.showPreview ?? false"
                  [disabled]="pushBusy()"
                  (checkedChange)="previewPreference($event)"
                />
                <div>
                  <span>{{ 'pushPreview' | t }}</span>
                  <p hlmFieldDescription>{{ 'pushPreviewHelp' | t }}</p>
                </div>
              </div>
            </label>
            @if (pushData.value()?.enabled && push.supported && pushData.value()?.publicKey) {
              <button hlmBtn variant="outline" [disabled]="pushBusy()" (click)="registerBrowser()">
                {{ 'pushRegisterBrowser' | t }}
              </button>
            }
            @if (!push.supported || !pushData.value()?.publicKey || pushMessage()) {
              <div hlmAlert role="status">
                <p hlmAlertDescription>
                  {{
                    pushMessage() || (!push.supported ? 'pushUnsupported' : 'pushUnavailable') | t
                  }}
                </p>
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
  readonly push = inject(WebPush);
  readonly pushData = new Resource<WebPushStatus>();
  readonly pushBusy = signal(false);
  readonly pushMessage = signal('');

  constructor() {
    void this.load();
    void this.loadPush();
  }

  async load() {
    await this.data.load((signal) => this.api.get('notifications', { pageNumber: 1 }, signal));
  }

  async loadPush() {
    await this.pushData.load((signal) => this.api.get('notifications/push', {}, signal));
  }

  async pushPreference(enabled: boolean) {
    await this.savePush(enabled, this.pushData.value()?.showPreview ?? false, enabled);
  }

  async previewPreference(showPreview: boolean) {
    await this.savePush(this.pushData.value()?.enabled ?? false, showPreview, false);
  }

  async registerBrowser() {
    await this.savePush(true, this.pushData.value()?.showPreview ?? false, true);
  }

  private async savePush(enabled: boolean, showPreview: boolean, register: boolean) {
    if (this.pushBusy() || !this.pushData.value()) return;
    this.pushBusy.set(true);
    this.pushMessage.set('');
    try {
      if (
        register &&
        (!this.pushData.value()?.publicKey ||
          !(await this.push.register(this.pushData.value()!.publicKey!)))
      ) {
        this.pushMessage.set('pushPermission');
        return;
      }
      await this.api.post('notifications/push/preferences', { enabled, showPreview });
      this.pushData.value.update((value) => (value ? { ...value, enabled, showPreview } : value));
      this.toast.success('preferencesSaved');
    } catch {
      this.pushMessage.set('pushFailed');
    } finally {
      this.pushBusy.set(false);
    }
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
