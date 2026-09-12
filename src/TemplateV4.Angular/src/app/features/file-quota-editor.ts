import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { WorkspaceUi, Resource, Confirmations } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { FilePage, FileStorageSettings } from '../api/models';

@Component({
  selector: 'app-file-quota-editor',
  imports: [WorkspaceUi],
  template: `<app-page-state
    [state]="data.state()"
    [refreshError]="data.refreshError()"
    (retry)="load()"
  >
    <form class="grid gap-4 mt-4" (ngSubmit)="save()">
      <div hlmField>
        <label hlmFieldLabel [for]="owner() ? 'user-quota' : 'default-quota'">{{
          (owner() ? 'userQuota' : 'defaultQuota') | t
        }}</label>
        <input
          hlmInput
          [id]="owner() ? 'user-quota' : 'default-quota'"
          name="quota"
          type="number"
          min="0"
          max="102400"
          step="any"
          [(ngModel)]="quotaMb"
          [disabled]="busy()"
          aria-describedby="quota-help"
          [attr.aria-invalid]="!valid() ? true : null"
        />
        <p hlmFieldDescription id="quota-help">
          {{ (owner() ? 'userQuotaHelp' : 'defaultQuotaHelp') | t }}
        </p>
        @if (!valid()) {
          <hlm-field-error forceShow>{{ 'quotaValidation' | t }}</hlm-field-error>
        }
      </div>
      <p class="workspace-meta">{{ 'quotaReductionHelp' | t }}</p>
      <button hlmBtn variant="outline" type="button" [disabled]="busy()" (click)="reload()">
        {{ 'reloadQuota' | t }}
      </button>
      <button hlmBtn type="submit" [disabled]="busy() || !valid() || !hasUnsavedChanges()">
        {{ 'save' | t }}
      </button>
    </form>
  </app-page-state>`,
})
export class FileQuotaEditor implements OnInit {
  readonly owner = input<string | null>(null);
  readonly saved = output<void>();
  readonly api = inject(WorkspaceApi);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly data = new Resource<FilePage | FileStorageSettings>();
  readonly busy = signal(false);
  quotaMb: number | null = null;
  private original: number | null = null;
  private version = '';
  ngOnInit() {
    void this.load();
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        this.owner() ? `files/admin/users/${this.owner()}` : 'files/admin/settings',
        {},
        signal,
      ),
    );
    if (!loaded) return;
    const value = this.data.value()!;
    const bytes =
      'quotaOverrideBytes' in value ? value.quotaOverrideBytes : value.defaultQuotaBytes;
    this.quotaMb = bytes == null ? null : bytes / 1048576;
    this.original = this.quotaMb;
    this.version = 'version' in value ? (value.version ?? '') : '';
  }
  valid() {
    return this.quotaMb == null
      ? !!this.owner()
      : Number.isFinite(this.quotaMb) && this.quotaMb >= 0 && this.quotaMb <= 102400;
  }
  hasUnsavedChanges() {
    return this.quotaMb !== this.original;
  }
  async reload() {
    if (!this.hasUnsavedChanges() || (await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
      await this.load();
  }
  async save() {
    if (this.busy() || !this.valid() || !this.hasUnsavedChanges()) return;
    this.busy.set(true);
    try {
      const bytes = this.quotaMb == null ? null : Math.round(this.quotaMb * 1048576);
      await this.api.post(
        this.owner() ? `files/admin/users/${this.owner()}/quota` : 'files/admin/settings',
        this.owner() ? { quotaBytes: bytes } : { defaultQuotaBytes: bytes, version: this.version },
      );
      this.toast.success('quotaSaved');
      await this.load();
      this.saved.emit();
    } catch {
      /* Central errors; retain the draft. */
    } finally {
      this.busy.set(false);
    }
  }
}
