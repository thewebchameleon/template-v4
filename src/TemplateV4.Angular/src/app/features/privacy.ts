import { Component, inject, signal } from '@angular/core';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  Confirmations,
  protectUnload,
} from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { PrivacyStatus } from '../api/models';
@Component({
  selector: 'app-privacy',
  imports: [WorkspaceUi],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="privacyAndData" description="privacyIntro" />
    <app-page-state [state]="data.state()" (retry)="load()"
      ><div class="workspace-columns">
        <div class="workspace-stack">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'changeEmail' | t }}</h2>
              <p hlmCardDescription>{{ 'changeEmailHelp' | t }}</p>
            </div>
            <form
              hlmCardContent
              class="grid gap-5"
              #emailForm="ngForm"
              (ngSubmit)="emailForm.valid && changeEmail()"
            >
              <div hlmField>
                <label hlmFieldLabel for="new-email">{{ 'newEmail' | t }}</label
                ><input
                  hlmInput
                  id="new-email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  email
                  required
                  maxlength="254"
                  [(ngModel)]="email"
                  #emailControl="ngModel"
                />
                @if (emailControl.invalid && emailControl.touched) {
                  <hlm-field-error forceShow>{{ 'emailInvalid' | t }}</hlm-field-error>
                }
              </div>
              <div class="grid gap-5 sm:grid-cols-2">
                <div hlmField>
                  <label hlmFieldLabel for="email-password">{{ 'currentPassword' | t }}</label
                  ><input
                    hlmInput
                    id="email-password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    maxlength="1024"
                    [(ngModel)]="password"
                  />
                </div>
                <div hlmField>
                  <label hlmFieldLabel for="email-code">{{ 'authenticatorCodeOptional' | t }}</label
                  ><input
                    hlmInput
                    id="email-code"
                    name="code"
                    autocomplete="one-time-code"
                    inputmode="numeric"
                    maxlength="64"
                    [(ngModel)]="code"
                  />
                </div>
              </div>
              <p class="workspace-meta">{{ 'emailProofHelp' | t }}</p>
              <div>
                <button hlmBtn [disabled]="busy() || emailForm.invalid">
                  @if (busy()) {
                    <hlm-spinner />
                  }
                  {{ 'sendVerification' | t }}
                </button>
              </div>
              @if (emailSent()) {
                <div hlmAlert role="status">
                  <h3 hlmAlertTitle>{{ 'emailChangeSent' | t }}</h3>
                  <p hlmAlertDescription>{{ 'emailChangeSentHelp' | t }}</p>
                </div>
              }
            </form>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'exportData' | t }}</h2>
              <p hlmCardDescription>{{ 'exportDataHelp' | t }}</p>
            </div>
            <div hlmCardContent>
              <div class="flex items-start gap-4">
                <span class="workspace-icon" aria-hidden="true"
                  ><ng-icon name="lucideArrowDownToLine"
                /></span>
                <p class="workspace-meta">{{ 'exportContents' | t }}</p>
              </div>
            </div>
            <div hlmCardFooter>
              <button hlmBtn variant="outline" [disabled]="busy()" (click)="export()">
                {{ 'downloadExport' | t }}
              </button>
            </div>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'deleteAccount' | t }}</h2>
              <p hlmCardDescription>{{ 'deleteAccountHelp' | t }}</p>
            </div>
            <div hlmCardContent>
              @if (data.value()?.request; as request) {
                <div class="flex flex-wrap items-center gap-3 mb-4">
                  <span hlmBadge variant="outline">{{ request.state | t }}</span
                  ><span class="workspace-meta">{{ i18n.date(request.requestedAt) }}</span>
                </div>
              }
              <p class="workspace-meta">{{ 'deletionReviewHelp' | t }}</p>
            </div>
            <div hlmCardFooter>
              @if (data.value()?.request?.state === 'Pending') {
                <button hlmBtn variant="outline" [disabled]="busy()" (click)="withdraw()">
                  {{ 'withdrawRequest' | t }}
                </button>
              } @else {
                <button
                  hlmBtn
                  variant="destructive"
                  [disabled]="busy()"
                  (click)="requestDeletion()"
                >
                  {{ 'requestDeletion' | t }}
                </button>
              }
            </div>
          </section>
        </div>
        <aside hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'dataRetention' | t }}</h2>
            <p hlmCardDescription>{{ 'dataRetentionHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            <dl class="workspace-detail-list">
              <div>
                <dt>{{ 'deletedFiles' | t }}</dt>
                <dd>{{ data.value()?.deletedFileRetentionDays }} {{ 'days' | t }}</dd>
              </div>
              <div>
                <dt>{{ 'notificationCentre' | t }}</dt>
                <dd>{{ data.value()?.notificationRetentionDays }} {{ 'days' | t }}</dd>
              </div>
              <div>
                <dt>{{ 'auditHistory' | t }}</dt>
                <dd>{{ 'auditRetained' | t }}</dd>
              </div>
            </dl>
            <p class="workspace-meta mt-5">{{ 'retentionExplanation' | t }}</p>
          </div>
          <div hlmCardFooter>
            <a routerLink="/files" hlmBtn variant="outline"
              >{{ 'manageFiles' | t }}<ng-icon name="lucideArrowUpRight"
            /></a>
          </div>
        </aside></div
    ></app-page-state>`,
})
export class PrivacyPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly data = new Resource<PrivacyStatus>();
  readonly busy = signal(false);
  readonly emailSent = signal(false);
  email = '';
  password = '';
  code = '';
  constructor() {
    void this.load();
  }
  hasUnsavedChanges() {
    return !!(this.email || this.password || this.code);
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  load() {
    return this.data.load(() => this.api.get('privacy'));
  }
  async changeEmail() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('privacy/email', {
        email: this.email,
        proof: { password: this.password, code: this.code },
      });
      this.email = '';
      this.password = '';
      this.code = '';
      this.emailSent.set(true);
      this.toast.success('emailChangeSent');
    } catch {
      /* Keep form input for correction. */
    } finally {
      this.busy.set(false);
    }
  }
  async export() {
    this.busy.set(true);
    try {
      await this.api.download('privacy/export', 'account-data.json');
      this.toast.success('exportReady');
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async requestDeletion() {
    if (!(await this.confirm.ask('requestDeletion', 'requestDeletionConfirm'))) return;
    await this.act('privacy/deletion', 'deletionRequested');
  }
  withdraw() {
    return this.act('privacy/withdraw', 'deletionWithdrawn');
  }
  private async act(path: string, message: string) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(path);
      this.toast.success(message);
      await this.load();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}
