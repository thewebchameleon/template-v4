import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CustomerInfo } from '../../api/models';
import { Auth } from '../../core/auth';
import { PlatformAppearanceTheme } from '../../core/platform-appearance';
import { Runtime } from '../../core/runtime';
import { WorkspaceApi } from '../../core/workspace-api';
import { Resource, WorkspaceUi, protectUnload } from '../../shared/workspace';
import { Notifications } from '../notifications/notifications';
import { TimeZoneSelect } from '../../shared/time-zone-select';

type OrganisationDraft = Pick<
  CustomerInfo,
  'name' | 'websiteUrl' | 'contactEmail' | 'timeZone' | 'country' | 'version' | 'logoUrl'
>;

@Component({
  selector: 'app-organisation-settings-editor',
  imports: [WorkspaceUi, TimeZoneSelect],
  styles: `
    .organisation-logo-dropzone {
      min-block-size: 16rem;
      block-size: 100%;
    }

    .organisation-logo-dropzone img {
      inline-size: 100%;
      min-block-size: 0;
      flex: 1;
      object-fit: contain;
    }

    @media (min-width: 64rem) {
      .organisation-logo-dropzone {
        min-block-size: 12rem;
        block-size: 12rem;
      }
    }
  `,
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
          <div hlmCardContent>
            <fieldset
              hlmFieldSet
              [disabled]="busy() || state.refreshing() || !state.value()?.canManage"
              class="grid gap-6 lg:grid-cols-3 lg:items-start"
            >
              <legend hlmFieldLegend class="sr-only">{{ 'organisation' | t }}</legend>
              <section
                aria-labelledby="organisation-logo-title"
                class="grid gap-4 lg:col-start-3 lg:row-start-1 lg:border-s lg:ps-6"
              >
                <div class="grid gap-1">
                  <h3 id="organisation-logo-title" class="font-semibold">
                    {{ 'organisationLogo' | t }}
                  </h3>
                  <p id="organisation-logo-help" class="text-muted-foreground text-sm">
                    {{ 'organisationLogoHelp' | t }}
                  </p>
                </div>
                <div hlmField class="min-h-0">
                  <label hlmFieldLabel for="organisation-logo" class="sr-only">{{
                    'organisationLogo' | t
                  }}</label>
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
                    <div
                      class="file-storage-dropzone organisation-logo-dropzone"
                      role="status"
                      aria-live="polite"
                    >
                      <hlm-spinner />
                      <span class="font-medium">{{ 'organisationLogoUploading' | t }}</span>
                    </div>
                  } @else {
                    <button
                      type="button"
                      class="file-storage-dropzone organisation-logo-dropzone"
                      [class.file-storage-drop-target]="logoDragOver()"
                      [disabled]="busy() || !state.value()?.canManage"
                      (click)="showLogoPicker()"
                      (dragover)="overLogo($event)"
                      (dragleave)="logoDragOver.set(false)"
                      (drop)="dropLogo($event)"
                    >
                      @if (currentLogoUrl(); as logoUrl) {
                        <img [src]="logoSource(logoUrl)" [alt]="draft.name" />
                      }
                      <span class="font-medium">{{ 'dropOrganisationLogoHere' | t }}</span>
                      <span class="workspace-meta">{{ 'browseOrganisationLogoHelp' | t }}</span>
                    </button>
                  }
                  @if (logoError()) {
                    <hlm-field-error forceShow>{{ 'organisationLogoInvalid' | t }}</hlm-field-error>
                  }
                </div>
                @if (currentLogoUrl()) {
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
              </section>
              <section
                aria-labelledby="organisation-details-title"
                class="grid content-start gap-4 lg:col-span-2 lg:col-start-1 lg:row-start-1"
              >
                <h3 id="organisation-details-title" class="font-semibold">
                  {{ 'organisationDetails' | t }}
                </h3>
                <div class="grid content-start gap-5 sm:grid-cols-2">
                  <div hlmField>
                    <label hlmFieldLabel for="organisation-name">{{
                      'organisationName' | t
                    }}</label>
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
                  <div hlmField>
                    <label hlmFieldLabel for="organisation-time-zone">{{
                      'organisationTimeZone' | t
                    }}</label>
                    <app-time-zone-select
                      name="timeZone"
                      required
                      [(ngModel)]="draft.timeZone"
                      [disabled]="busy()"
                      [timeZones]="state.value()?.timeZones ?? []"
                      buttonId="organisation-time-zone"
                      [ariaLabel]="'organisationTimeZone' | t"
                    />
                  </div>
                </div>
              </section>
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
export class OrganisationSettingsEditor implements OnDestroy {
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
  private pendingLogo: Blob | null | undefined;
  private pendingLogoUrl: string | null = null;

  constructor() {
    void this.load();
  }

  ngOnDestroy() {
    this.revokePendingLogoUrl();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }

  hasUnsavedChanges() {
    return (
      this.busy() ||
      this.pendingLogo !== undefined ||
      (!!this.draft && this.textValue(this.draft) !== this.baseline)
    );
  }
  currentLogoUrl() {
    return this.pendingLogo === undefined ? this.draft?.logoUrl : this.pendingLogoUrl;
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
      let saved = this.state.value()!;
      if (this.textValue(this.draft) !== this.baseline) {
        saved = await this.api.post<CustomerInfo>('organisation/settings', {
          name: this.draft.name,
          websiteUrl: this.draft.websiteUrl || null,
          contactEmail: this.draft.contactEmail || null,
          timeZone: this.draft.timeZone,
          country: this.draft.country || null,
          version: this.draft.version,
        });
        this.acceptSavedDetails(saved);
      }
      if (this.pendingLogo !== undefined)
        saved = await this.persistLogo(saved.version, this.pendingLogo);
      this.accept(saved);
      this.toast.success('organisationSaved');
    } catch {
      /* Central errors retain any unpersisted draft values for a retry. */
    } finally {
      this.busy.set(false);
    }
  }

  async chooseLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) await this.stageLogo(file);
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
    if (file) void this.stageLogo(file);
  }

  private async stageLogo(file: File) {
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
      this.setPendingLogo(blob);
    } catch {
      this.logoError.set(true);
    } finally {
      bitmap?.close();
      this.busyLogo.set(false);
      this.busy.set(false);
    }
  }

  removeLogo() {
    if (this.busy() || !this.draft || !this.state.value()?.canManage) return;
    this.logoError.set(false);
    this.revokePendingLogoUrl();
    this.pendingLogo = this.state.value()?.logoUrl ? null : undefined;
  }

  private async load() {
    const loaded = await this.state.load((signal) =>
      this.api.get<CustomerInfo>('organisation', {}, signal),
    );
    if (loaded) this.accept(this.state.value()!);
    return loaded;
  }
  private accept(value: CustomerInfo) {
    this.clearPendingLogo();
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
  private acceptSavedDetails(value: CustomerInfo) {
    this.state.value.set(value);
    if (this.draft) {
      this.draft.name = value.name;
      this.draft.websiteUrl = value.websiteUrl;
      this.draft.contactEmail = value.contactEmail;
      this.draft.timeZone = value.timeZone;
      this.draft.country = value.country;
      this.draft.version = value.version;
      this.draft.logoUrl = value.logoUrl;
      this.baseline = this.textValue(this.draft);
    }
    this.appearance.brand(value.name, value.logoUrl);
  }
  private async persistLogo(version: string, logo: Blob | null) {
    const url = `${this.runtime.apiUrl}/api/v1/auth/organisation/logo?version=${version}`;
    if (logo === null)
      return firstValueFrom(
        this.http.delete<CustomerInfo>(url, {
          withCredentials: true,
          headers: await this.auth.browserHeaders(),
        }),
      );
    return firstValueFrom(
      this.http.post<CustomerInfo>(url, logo, {
        withCredentials: true,
        headers: { ...(await this.auth.browserHeaders()), 'Content-Type': 'image/png' },
      }),
    );
  }
  private setPendingLogo(logo: Blob) {
    this.revokePendingLogoUrl();
    this.pendingLogo = logo;
    this.pendingLogoUrl = URL.createObjectURL(logo);
  }
  private clearPendingLogo() {
    this.revokePendingLogoUrl();
    this.pendingLogo = undefined;
  }
  private revokePendingLogoUrl() {
    if (this.pendingLogoUrl) URL.revokeObjectURL(this.pendingLogoUrl);
    this.pendingLogoUrl = null;
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
