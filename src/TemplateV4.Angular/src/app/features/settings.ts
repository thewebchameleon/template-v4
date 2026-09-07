import { protectUnload } from '../shared/confirmation';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n, Translate } from '../core/i18n';
import { SecuritySettings } from '../api/models/security-settings';
import { Notifications } from '../core/notifications';
import { PageHeader } from '../shared/workspace';
@Component({
  selector: 'app-settings',
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmFieldImports,
    HlmTabsImports,
    HlmSwitchImports,
    HlmCardImports,
    HlmAlertImports,
    HlmSpinnerImports,
    Translate,
    PageHeader,
  ],
  template: `
    <app-page-header
      eyebrow="administration"
      title="adminSettings"
      description="adminSettingsIntro"
    />
    <section hlmCard class="max-w-(--form-content-width)">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'security' | t }}</h2>
        <p hlmCardDescription>{{ 'policyHelp' | t }}</p>
      </div>
      <form
        hlmCardContent
        #form="ngForm"
        (ngSubmit)="form.valid && save()"
        class="flex flex-col gap-5"
      >
        <fieldset hlmFieldSet>
          <legend hlmFieldLegend>{{ 'mfaPolicy' | t }}</legend>
          <hlm-tabs [tab]="policy" (tabActivated)="policy = $event">
            <hlm-tabs-list [attr.aria-label]="'mfaPolicy' | t" class="flex-wrap">
              <button hlmTabsTrigger="Optional" [disabled]="busy() || settingsState() !== 'ready'">
                {{ 'policyOptional' | t }}
              </button>
              <button
                hlmTabsTrigger="Administrators"
                [disabled]="busy() || settingsState() !== 'ready'"
              >
                {{ 'policyAdministrators' | t }}
              </button>
              <button hlmTabsTrigger="Everyone" [disabled]="busy() || settingsState() !== 'ready'">
                {{ 'policyEveryone' | t }}
              </button>
            </hlm-tabs-list>
          </hlm-tabs>
        </fieldset>
        <label
          hlmFieldLabel
          for="registration-enabled"
          class="cursor-pointer has-[[data-disabled]]:cursor-not-allowed"
        >
          <div hlmField orientation="horizontal">
            <hlm-switch
              inputId="registration-enabled"
              name="registrationEnabled"
              [(ngModel)]="registrationEnabled"
              aria-describedby="registration-help"
              [disabled]="busy() || !settings()"
              class="self-center"
            />
            <div hlmFieldContent>
              <span hlmFieldTitle>{{ 'registrationEnabled' | t }}</span>
              <p hlmFieldDescription id="registration-help">{{ 'registrationHelp' | t }}</p>
            </div>
          </div>
        </label>
        <button hlmBtn [disabled]="busy() || form.invalid || !settings() || !hasUnsavedChanges()">
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'save' | t }}
        </button>
        @if (settingsConflict()) {
          <div hlmAlert role="alert">
            <p hlmAlertDescription>{{ 'settingsConflict' | t }}</p>
            <button hlmBtn type="button" variant="outline" (click)="load(true)">
              {{ 'discardDraft' | t }}
            </button>
          </div>
        }
        @if (settingsState() === 'error') {
          <div hlmAlert variant="destructive" role="alert">
            <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
            <button hlmBtn type="button" variant="outline" (click)="load(true)">
              {{ 'retry' | t }}
            </button>
          </div>
        }
      </form>
    </section>
  `,
})
export class SettingsPage {
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  hasUnsavedChanges() {
    const saved = this.settings();
    return (
      !!saved &&
      (this.policy !== saved.mfaPolicy || this.registrationEnabled !== saved.registrationEnabled)
    );
  }
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly i18n = inject(I18n);
  readonly settings = signal<SecuritySettings | null>(null);
  readonly settingsState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly settingsConflict = signal(false);
  readonly busy = signal(false);
  private readonly notifications = inject(Notifications);
  policy = 'Administrators';
  registrationEnabled = false;
  constructor() {
    void this.load();
  }
  async load(applyDraft = true) {
    this.settingsState.set('loading');
    try {
      const value = await firstValueFrom(
        this.http.get<SecuritySettings>(`${this.runtime.apiUrl}/api/v1/auth/settings/security`),
      );
      this.settings.set(value);
      if (applyDraft) {
        this.policy = value.mfaPolicy ?? 'Administrators';
        this.registrationEnabled = value.registrationEnabled ?? false;
        this.settingsConflict.set(false);
      }
      this.settingsState.set('ready');
    } catch {
      this.settingsState.set('error');
    }
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      this.settings.set(
        await this.auth.action<SecuritySettings>('settings/security', {
          mfaPolicy: this.policy,
          registrationEnabled: this.registrationEnabled,
          version: this.settings()?.version,
        }),
      );
      this.settingsConflict.set(false);
      this.notifications.success('securitySaved');
      await this.auth.refresh();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.settingsConflict.set(true);
        await this.load(false);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
