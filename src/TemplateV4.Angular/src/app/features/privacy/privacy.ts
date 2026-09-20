import { Component, OnDestroy, inject, signal } from '@angular/core';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { WorkspaceUi, workspaceIcons, Resource, Confirmations } from '../../shared/workspace';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { PrivacyStatus } from '../../api/models';
import { Auth } from '../../core/auth';
@Component({
  selector: 'app-privacy',
  imports: [WorkspaceUi, HlmDialogImports],
  providers: [workspaceIcons],
  template: ` <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
      ><div class="workspace-columns">
        <div class="workspace-stack">
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
        <aside class="workspace-stack">
          <section hlmCard>
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
              <a routerLink="/me/profile" hlmBtn variant="outline"
                >{{ 'account' | t }}<ng-icon name="lucideArrowUpRight"
              /></a>
            </div>
          </section>
          @if (auth.has('file-storage.purge')) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'purgeAllData' | t }}</h2>
                <p hlmCardDescription>{{ 'purgeAllDataWarning' | t }}</p>
              </div>
              <div hlmCardFooter>
                <button
                  hlmBtn
                  type="button"
                  variant="link"
                  class="h-auto p-0 text-sm text-destructive"
                  [disabled]="purgeBusy()"
                  (click)="openPurge()"
                >
                  {{ 'purgeAllData' | t }}
                </button>
              </div>
            </section>
          }
        </aside>
      </div></app-page-state
    >
    <hlm-dialog
      [state]="purgeOpen() ? 'open' : 'closed'"
      (stateChanged)="$event === 'closed' && closePurge()"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header>
          <h2 hlmDialogTitle>{{ 'purgeAllDataTitle' | t }}</h2>
          <p hlmDialogDescription>{{ 'purgeAllDataWarning' | t }}</p>
        </hlm-dialog-header>
        <form class="grid gap-4" (ngSubmit)="purgeAllData()">
          <div hlmField>
            <label hlmFieldLabel for="purge-confirmation">{{ 'purgeConfirmationLabel' | t }}</label>
            <input
              hlmInput
              id="purge-confirmation"
              name="confirmation"
              autocomplete="off"
              [(ngModel)]="purgeConfirmation"
              required
              [disabled]="purgeBusy()"
              aria-describedby="purge-confirmation-help"
            />
            <p hlmFieldDescription id="purge-confirmation-help">
              {{ 'purgeConfirmationHelp' | t }} <strong>PURGE ALL DATA</strong>
            </p>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="purge-password">{{ 'password' | t }}</label>
            <input
              hlmInput
              id="purge-password"
              name="password"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="purgePassword"
              required
              maxlength="1024"
              [disabled]="purgeBusy()"
            />
          </div>
          @if (purgeFailed()) {
            <div hlmAlert role="alert">
              <p hlmAlertDescription>{{ 'purgeAllDataFailed' | t }}</p>
            </div>
          }
          <hlm-dialog-footer>
            <button
              hlmBtn
              variant="outline"
              type="button"
              [disabled]="purgeBusy()"
              (click)="closePurge()"
            >
              {{ 'cancel' | t }}
            </button>
            <button
              hlmBtn
              variant="destructive"
              type="submit"
              [disabled]="purgeBusy() || purgeConfirmation !== 'PURGE ALL DATA' || !purgePassword"
            >
              {{ 'purgeAllData' | t }}
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>`,
})
export class PrivacyPage implements OnDestroy {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly auth = inject(Auth);
  readonly data = new Resource<PrivacyStatus>();
  readonly busy = signal(false);
  readonly purgeOpen = signal(false);
  readonly purgeBusy = signal(false);
  readonly purgeFailed = signal(false);
  purgeConfirmation = '';
  purgePassword = '';
  constructor() {
    void this.load();
  }
  ngOnDestroy() {
    this.purgePassword = '';
  }
  load() {
    return this.data.load((signal) => this.api.get('privacy', {}, signal));
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
  openPurge() {
    this.purgeConfirmation = '';
    this.purgePassword = '';
    this.purgeFailed.set(false);
    this.purgeOpen.set(true);
  }
  closePurge() {
    if (this.purgeBusy()) return;
    this.purgeConfirmation = '';
    this.purgePassword = '';
    this.purgeOpen.set(false);
  }
  async purgeAllData() {
    if (this.purgeBusy() || this.purgeConfirmation !== 'PURGE ALL DATA' || !this.purgePassword)
      return;
    this.purgeBusy.set(true);
    this.purgeFailed.set(false);
    try {
      await this.api.post('file-storage/admin/purge', {
        confirmation: this.purgeConfirmation,
        password: this.purgePassword,
      });
      this.purgeBusy.set(false);
      this.closePurge();
      this.toast.success('purgeAllDataRequested');
    } catch {
      this.purgePassword = '';
      this.purgeFailed.set(true);
      this.purgeBusy.set(false);
    }
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
