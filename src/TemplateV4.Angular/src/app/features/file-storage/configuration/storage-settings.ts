import { Component, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { WorkspaceUi, Resource, protectUnload } from '../../../shared/workspace';
import { StorageUsageCard } from '../../../shared/storage-usage-card';
import { WorkspaceApi } from '../../../core/workspace-api';
import { FilePage } from '../../../api/models';
import { FileQuotaEditor } from './file-quota-editor';
import { DemoExpiryEditor } from './demo-expiry-editor';
import { FileStorageSettingsEditor } from './file-storage-settings-editor';
import { Auth } from '../../../core/auth';
import { Notifications } from '../../notifications/notifications';

@Component({
  selector: 'app-storage-settings',
  imports: [
    WorkspaceUi,
    FileQuotaEditor,
    StorageUsageCard,
    DemoExpiryEditor,
    FileStorageSettingsEditor,
    HlmDialogImports,
  ],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="storageSettings" description="storageSettingsHelp" />
    <div class="workspace-columns">
      <div class="workspace-stack min-w-0">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'storageSettings' | t }}</h2>
            <p hlmCardDescription>{{ 'fileStorageSettingsHelp' | t }}</p>
          </div>
          <div hlmCardContent><app-file-quota-editor (saved)="storageSaved()" /></div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'moduleFeatures' | t }}</h2>
          </div>
          <div hlmCardContent><app-file-storage-settings-editor /></div>
        </section>
      </div>
      <aside class="workspace-stack min-w-0">
        <app-page-state
          [state]="usage.state()"
          [refreshError]="usage.refreshError()"
          (retry)="loadUsage()"
        >
          <app-storage-usage-card
            [usage]="usage.value()"
            [allowPurge]="auth.has('file-storage.purge')"
            (purge)="openPurge()"
          />
        </app-page-state>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'fileStorageDemoMode' | t }}</h2>
            <p hlmCardDescription>{{ 'fileStorageDemoExpiryHelp' | t }}</p>
          </div>
          <div hlmCardContent><app-demo-expiry-editor (saved)="demoExpirySaved()" /></div>
        </section>
      </aside>
    </div>
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
export class StorageSettingsPage implements OnInit, OnDestroy {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  private readonly toast = inject(Notifications);
  readonly usage = new Resource<FilePage>();
  readonly editor = viewChild(FileQuotaEditor);
  readonly demoEditor = viewChild(DemoExpiryEditor);
  readonly settingsEditor = viewChild(FileStorageSettingsEditor);
  readonly purgeOpen = signal(false);
  readonly purgeBusy = signal(false);
  readonly purgeFailed = signal(false);
  purgeConfirmation = '';
  purgePassword = '';
  ngOnInit() {
    void this.loadUsage();
  }
  ngOnDestroy() {
    this.purgePassword = '';
  }
  loadUsage() {
    return this.usage.load((signal) =>
      this.api.get('file-storage', { pageNumber: 1, pageSize: 1 }, signal),
    );
  }
  storageSaved() {
    void this.loadUsage();
    void this.demoEditor()?.load(true);
  }
  demoExpirySaved() {
    void this.editor()?.load(true);
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
      await this.loadUsage();
    } catch {
      this.purgePassword = '';
      this.purgeFailed.set(true);
      this.purgeBusy.set(false);
    }
  }
  hasUnsavedChanges() {
    return (
      (this.editor()?.hasUnsavedChanges() ?? false) ||
      (this.demoEditor()?.hasUnsavedChanges() ?? false) ||
      (this.settingsEditor()?.hasUnsavedChanges() ?? false) ||
      this.purgeOpen() ||
      !!this.purgeConfirmation ||
      !!this.purgePassword
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}
