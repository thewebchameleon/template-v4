import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { firstValueFrom } from 'rxjs';
import { CustomerInfo } from '../../api/models';
import { Auth } from '../../core/auth';
import { PlatformAppearanceTheme } from '../../core/platform-appearance';
import { Runtime } from '../../core/runtime';
import { WorkspaceApi } from '../../core/workspace-api';
import { Resource, WorkspaceUi, protectUnload } from '../../shared/workspace';
import { Notifications } from '../notifications/notifications';

type OrganisationDraft = Pick<
  CustomerInfo,
  'name' | 'websiteUrl' | 'contactEmail' | 'timeZone' | 'country' | 'version' | 'logoUrl'
>;

@Component({
  selector: 'app-organisation-settings-editor',
  imports: [WorkspaceUi, HlmSelectImports],
  template: `<app-page-state
    [state]="state.state()"
    [refreshing]="state.refreshing()"
    [refreshError]="state.refreshError()"
    (retry)="reload()"
  >
    @if (draft; as draft) {
      <form (ngSubmit)="save()" #form="ngForm">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'organisation' | t }}</h2>
            <p hlmCardDescription>{{ 'organisationConfigurationHelp' | t }}</p>
          </div>
          <div hlmCardContent class="grid gap-6">
            <fieldset
              hlmFieldSet
              [disabled]="busy() || state.refreshing() || !state.value()?.canManage"
              class="grid gap-6"
            >
              <legend hlmFieldLegend class="sr-only">{{ 'organisation' | t }}</legend>
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span class="brand-logo-preview">
                  @if (draft.logoUrl) {
                    <img [src]="logoSource(draft.logoUrl)" [alt]="draft.name" />
                  } @else {
                    <span aria-hidden="true">{{ initials() }}</span>
                  }
                </span>
                <div hlmField class="min-w-0 flex-1">
                  <label hlmFieldLabel for="organisation-logo">{{ 'organisationLogo' | t }}</label>
                  <input
                    #logoInput
                    id="organisation-logo"
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    [disabled]="busy() || !state.value()?.canManage"
                    (change)="chooseLogo($event)"
                    aria-describedby="organisation-logo-help"
                  />
                  @if (busyLogo()) {
                    <div class="file-storage-dropzone" role="status" aria-live="polite">
                      <hlm-spinner />
                      <span class="font-medium">{{ 'organisationLogoUploading' | t }}</span>
                    </div>
                  } @else {
                    <button
                      type="button"
                      class="file-storage-dropzone"
                      [class.file-storage-drop-target]="logoDragOver()"
                      [disabled]="busy() || !state.value()?.canManage"
                      (click)="showLogoPicker()"
                      (dragover)="overLogo($event)"
                      (dragleave)="logoDragOver.set(false)"
                      (drop)="dropLogo($event)"
                    >
                      <span class="font-medium">{{ 'dropOrganisationLogoHere' | t }}</span>
                      <span class="workspace-meta">{{ 'browseOrganisationLogoHelp' | t }}</span>
                    </button>
                  }
                  <p hlmFieldDescription id="organisation-logo-help">
                    {{ 'organisationLogoHelp' | t }}
                  </p>
                  @if (logoError()) {
                    <hlm-field-error forceShow>{{ 'organisationLogoInvalid' | t }}</hlm-field-error>
                  }
                  @if (draft.logoUrl) {
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      [disabled]="busy() || !state.value()?.canManage"
                      (click)="removeLogo()"
                    >
                      {{ 'removeOrganisationLogo' | t }}
                    </button>
                  }
                </div>
              </div>
              <div class="grid gap-5 sm:grid-cols-2">
                <div hlmField>
                  <label hlmFieldLabel for="organisation-name">{{ 'organisationName' | t }}</label>
                  <input
                    hlmInput
                    id="organisation-name"
                    name="name"
                    [(ngModel)]="draft.name"
                    required
                    pattern=".*\\S.*"
                    maxlength="120"
                    #organisationName="ngModel"
                  />
                  @if (organisationName.invalid && (organisationName.touched || form.submitted)) {
                    <hlm-field-error forceShow>{{ 'nameRequired' | t }}</hlm-field-error>
                  }
                </div>
                <div hlmField>
                  <label hlmFieldLabel for="organisation-website">{{
                    'organisationWebsite' | t
                  }}</label>
                  <input
                    hlmInput
                    id="organisation-website"
                    name="websiteUrl"
                    [(ngModel)]="draft.websiteUrl"
                    type="url"
                    maxlength="2048"
                    pattern="https?://.+"
                    placeholder="https://example.com"
                    #organisationWebsite="ngModel"
                  />
                  @if (
                    organisationWebsite.invalid && (organisationWebsite.touched || form.submitted)
                  ) {
                    <hlm-field-error forceShow>{{
                      'organisationWebsiteInvalid' | t
                    }}</hlm-field-error>
                  }
                </div>
                <div hlmField>
                  <label hlmFieldLabel for="organisation-contact">{{
                    'organisationContactEmail' | t
                  }}</label>
                  <input
                    hlmInput
                    id="organisation-contact"
                    name="contactEmail"
                    [(ngModel)]="draft.contactEmail"
                    type="email"
                    maxlength="254"
                    autocomplete="email"
                    #organisationContact="ngModel"
                  />
                  @if (
                    organisationContact.invalid && (organisationContact.touched || form.submitted)
                  ) {
                    <hlm-field-error forceShow>{{ 'emailInvalid' | t }}</hlm-field-error>
                  }
                </div>
                <div hlmField>
                  <label hlmFieldLabel for="organisation-country">{{
                    'organisationCountry' | t
                  }}</label>
                  <input
                    hlmInput
                    id="organisation-country"
                    name="country"
                    [(ngModel)]="draft.country"
                    maxlength="100"
                    autocomplete="country-name"
                  />
                </div>
              </div>
              <div hlmField>
                <label hlmFieldLabel for="organisation-time-zone">{{
                  'organisationTimeZone' | t
                }}</label>
                <hlm-select
                  name="timeZone"
                  required
                  [(ngModel)]="draft.timeZone"
                  [disabled]="busy()"
                >
                  <hlm-select-trigger buttonId="organisation-time-zone" class="w-full"
                    ><hlm-select-value
                  /></hlm-select-trigger>
                  <hlm-select-content *hlmSelectPortal [ariaLabel]="'organisationTimeZone' | t">
                    @for (zone of state.value()?.timeZones ?? []; track zone) {
                      <hlm-select-item [value]="zone">{{ zone }}</hlm-select-item>
                    }
                  </hlm-select-content>
                </hlm-select>
              </div>
            </fieldset>
          </div>
          @if (state.value()?.canManage) {
            <div hlmCardFooter class="flex-wrap gap-2">
              <button
                hlmBtn
                [disabled]="busy() || state.refreshing() || form.invalid || !hasUnsavedChanges()"
              >
                @if (busy()) {
                  <hlm-spinner />
                }
                {{ 'save' | t }}
              </button>
              @if (hasUnsavedChanges()) {
                <button
                  hlmBtn
                  type="button"
                  variant="destructive"
                  [disabled]="busy()"
                  (click)="reset()"
                >
                  {{ 'undoChanges' | t }}
                </button>
              }
            </div>
          }
        </section>
      </form>
    }
  </app-page-state>`,
})
export class OrganisationSettingsEditor {
  readonly state = new Resource<CustomerInfo>();
  readonly busy = signal(false);
  readonly busyLogo = signal(false);
  readonly logoDragOver = signal(false);
  readonly logoError = signal(false);
  draft: OrganisationDraft | null = null;
  private baseline = '';
  private readonly api = inject(WorkspaceApi);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly auth = inject(Auth);
  private readonly appearance = inject(PlatformAppearanceTheme);
  private readonly toast = inject(Notifications);
  private readonly logoInput = viewChild<ElementRef<HTMLInputElement>>('logoInput');

  constructor() {
    void this.load();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }

  hasUnsavedChanges() {
    return this.busy() || (!!this.draft && this.textValue(this.draft) !== this.baseline);
  }
  initials() {
    return (
      this.draft?.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase() || 'O'
    );
  }
  logoSource(url: string) {
    return new URL(url, this.runtime.apiUrl || location.origin).toString();
  }
  reset() {
    if (this.state.value()) this.accept(this.state.value()!);
  }
  reload() {
    if (!this.busy()) return this.load();
    return Promise.resolve(false);
  }

  async save() {
    if (this.busy() || !this.draft || !this.state.value()?.canManage || !this.hasUnsavedChanges())
      return;
    this.busy.set(true);
    try {
      const saved = await this.api.post<CustomerInfo>('organisation/settings', {
        name: this.draft.name,
        websiteUrl: this.draft.websiteUrl || null,
        contactEmail: this.draft.contactEmail || null,
        timeZone: this.draft.timeZone,
        country: this.draft.country || null,
        version: this.draft.version,
      });
      this.state.value.set(saved);
      this.accept(saved);
      this.toast.success('organisationSaved');
    } finally {
      this.busy.set(false);
    }
  }

  async chooseLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) await this.uploadLogo(file);
  }

  showLogoPicker() {
    if (!this.busy() && this.state.value()?.canManage) this.logoInput()?.nativeElement.click();
  }

  overLogo(event: DragEvent) {
    event.preventDefault();
    if (this.busy() || !event.dataTransfer?.types.includes('Files')) return;
    event.dataTransfer.dropEffect = 'copy';
    this.logoDragOver.set(true);
  }

  dropLogo(event: DragEvent) {
    event.preventDefault();
    this.logoDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) void this.uploadLogo(file);
  }

  private async uploadLogo(file: File) {
    if (this.busy() || !this.draft || !this.state.value()?.canManage) return;
    this.logoError.set(false);
    this.busy.set(true);
    this.busyLogo.set(true);
    let bitmap: ImageBitmap | undefined;
    try {
      if (
        file.size > 5 * 1024 * 1024 ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      )
        throw new Error();
      bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error();
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob || blob.size > 1048576) throw new Error();
      const saved = await firstValueFrom(
        this.http.post<CustomerInfo>(
          `${this.runtime.apiUrl}/api/v1/auth/organisation/logo?version=${this.draft.version}`,
          blob,
          {
            withCredentials: true,
            headers: { ...(await this.auth.browserHeaders()), 'Content-Type': 'image/png' },
          },
        ),
      );
      this.logoSaved(saved);
    } catch (error) {
      if (!(error instanceof HttpErrorResponse) || [400, 413].includes(error.status))
        this.logoError.set(true);
    } finally {
      bitmap?.close();
      this.busyLogo.set(false);
      this.busy.set(false);
    }
  }

  async removeLogo() {
    if (this.busy() || !this.draft || !this.state.value()?.canManage) return;
    this.busy.set(true);
    this.logoError.set(false);
    try {
      const saved = await firstValueFrom(
        this.http.delete<CustomerInfo>(
          `${this.runtime.apiUrl}/api/v1/auth/organisation/logo?version=${this.draft.version}`,
          { withCredentials: true, headers: await this.auth.browserHeaders() },
        ),
      );
      this.logoSaved(saved);
    } catch {
      /* Central errors retain the current brand and draft. */
    } finally {
      this.busy.set(false);
    }
  }

  private async load() {
    const loaded = await this.state.load((signal) =>
      this.api.get<CustomerInfo>('organisation', {}, signal),
    );
    if (loaded) this.accept(this.state.value()!);
    return loaded;
  }
  private accept(value: CustomerInfo) {
    this.draft = {
      name: value.name,
      websiteUrl: value.websiteUrl,
      contactEmail: value.contactEmail,
      timeZone: value.timeZone,
      country: value.country,
      version: value.version,
      logoUrl: value.logoUrl,
    };
    this.baseline = this.textValue(this.draft);
    this.logoError.set(false);
    this.appearance.brand(value.name, value.logoUrl);
  }
  private logoSaved(value: CustomerInfo) {
    this.state.value.set(value);
    if (this.draft) {
      this.draft.version = value.version;
      this.draft.logoUrl = value.logoUrl;
    }
    this.appearance.brand(value.name, value.logoUrl);
    this.toast.success('organisationLogoSaved');
  }
  private textValue(value: OrganisationDraft) {
    return JSON.stringify([
      value.name,
      value.websiteUrl ?? '',
      value.contactEmail ?? '',
      value.timeZone,
      value.country ?? '',
    ]);
  }
}
