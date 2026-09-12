import { Component, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, Resource } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { I18n } from '../core/i18n';
import { Auth } from '../core/auth';
import { CurrentProfile } from '../core/current-profile';
import { dictionary } from '../core/translations';
import { profileDictionary } from '../core/profile-translations';
import { ProfileOptions, ProfileResponse, UpdateProfileRequest } from '../api/models';

@Component({
  selector: 'app-profile-editor',
  imports: [WorkspaceUi, HlmAvatarImports, HlmSelectImports],
  template: `<section hlmCard>
    <div hlmCardHeader>
      <h2 hlmCardTitle>{{ 'profileDetails' | t }}</h2>
      <p hlmCardDescription>{{ 'profileDetailsHelp' | t }}</p>
    </div>
    <app-page-state [state]="options.state()" (retry)="loadOptions()">
      <form hlmCardContent class="grid gap-5" #form="ngForm" (ngSubmit)="form.valid && save()">
        <fieldset hlmFieldSet [disabled]="busy()" class="grid gap-5">
          <legend hlmFieldLegend class="sr-only">{{ 'profileDetails' | t }}</legend>
          <div class="flex items-center gap-4">
            <hlm-avatar size="lg">
              @if (avatarPreview) {
                <img hlmAvatarImage [src]="avatarPreview" [alt]="draft.displayName" />
              }
              <span hlmAvatarFallback>{{ initials() }}</span>
            </hlm-avatar>
            <div hlmField class="min-w-0 flex-1">
              <label hlmFieldLabel for="profile-photo">{{ 'profilePhoto' | t }}</label>
              <input
                hlmInput
                id="profile-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                (change)="choosePhoto($event)"
                aria-describedby="profile-photo-help"
              />
              <p hlmFieldDescription id="profile-photo-help">{{ 'profilePhotoHelp' | t }}</p>
              @if (photoError()) {
                <hlm-field-error forceShow>{{ 'profilePhotoInvalid' | t }}</hlm-field-error>
              }
              @if (avatarPreview) {
                <button hlmBtn type="button" variant="outline" (click)="removePhoto()">
                  {{ 'removeProfilePhoto' | t }}
                </button>
              }
            </div>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="profile-display-name">{{ 'displayName' | t }}</label>
            <input
              hlmInput
              id="profile-display-name"
              name="displayName"
              autocomplete="nickname"
              required
              pattern=".*\\S.*"
              maxlength="120"
              [(ngModel)]="draft.displayName"
              #displayName="ngModel"
            />
            @if (displayName.invalid && (displayName.touched || form.submitted)) {
              <hlm-field-error forceShow>{{ 'profileDisplayNameInvalid' | t }}</hlm-field-error>
            }
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            <div hlmField>
              <label hlmFieldLabel for="profile-first-name">{{ 'profileFirstName' | t }}</label>
              <input
                hlmInput
                id="profile-first-name"
                name="firstName"
                autocomplete="given-name"
                maxlength="100"
                [(ngModel)]="draft.firstName"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="profile-last-name">{{ 'profileLastName' | t }}</label>
              <input
                hlmInput
                id="profile-last-name"
                name="lastName"
                autocomplete="family-name"
                maxlength="100"
                [(ngModel)]="draft.lastName"
              />
            </div>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="profile-phone">{{ 'profilePhone' | t }}</label>
            <input
              hlmInput
              id="profile-phone"
              name="phone"
              type="tel"
              autocomplete="tel"
              maxlength="16"
              pattern="\\+[1-9][0-9]{6,14}"
              [(ngModel)]="draft.phoneNumber"
              #phone="ngModel"
              aria-describedby="profile-phone-help"
            />
            <p hlmFieldDescription id="profile-phone-help">{{ 'profilePhoneHelp' | t }}</p>
            @if (phone.invalid && (phone.touched || form.submitted)) {
              <hlm-field-error forceShow>{{ 'profilePhoneInvalid' | t }}</hlm-field-error>
            }
          </div>
          <div hlmField>
            <label hlmFieldLabel for="profile-culture">{{ 'culture' | t }}</label>
            <hlm-select name="culture" required [(ngModel)]="draft.culture" [disabled]="busy()">
              <hlm-select-trigger buttonId="profile-culture" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
                @for (culture of options.value()?.cultures ?? []; track culture) {
                  <hlm-select-item [value]="culture">{{ cultureLabel(culture) }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="profile-time-zone">{{ 'profileTimeZone' | t }}</label>
            <hlm-select name="timeZone" required [(ngModel)]="draft.timeZone" [disabled]="busy()">
              <hlm-select-trigger buttonId="profile-time-zone" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'profileTimeZone' | t">
                @for (zone of options.value()?.timeZones ?? []; track zone) {
                  <hlm-select-item [value]="zone">{{ zone }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
            <p hlmFieldDescription>{{ 'profileTimeZoneHelp' | t }}</p>
          </div>
        </fieldset>
        <div class="flex flex-wrap gap-3">
          <button hlmBtn [disabled]="busy() || form.invalid || !hasUnsavedChanges()">
            @if (busy()) {
              <hlm-spinner />
            }
            {{ 'save' | t }}
          </button>
          <button
            hlmBtn
            type="button"
            variant="outline"
            [disabled]="busy() || !hasUnsavedChanges()"
            (click)="reset(); form.form.markAsPristine(); form.form.markAsUntouched()"
          >
            {{ 'cancel' | t }}
          </button>
          @if (conflict()) {
            <button hlmBtn type="button" variant="outline" [disabled]="busy()" (click)="reload()">
              {{ 'profileReload' | t }}
            </button>
          }
        </div>
        @if (conflict()) {
          <div hlmAlert role="status">
            <p hlmAlertDescription>{{ 'profileConflict' | t }}</p>
          </div>
        }
      </form>
    </app-page-state>
  </section>`,
})
export class ProfileEditor {
  readonly profile = input<ProfileResponse | null>(null);
  readonly saved = output<ProfileResponse>();
  private readonly api = inject(WorkspaceApi);
  private readonly toast = inject(Notifications);
  private readonly i18n = inject(I18n);
  private readonly auth = inject(Auth);
  private readonly currentProfile = inject(CurrentProfile);
  readonly options = new Resource<ProfileOptions>();
  readonly busy = signal(false);
  readonly photoError = signal(false);
  readonly conflict = signal(false);
  draft: UpdateProfileRequest = {
    displayName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    culture: 'en-ZA',
    timeZone: 'UTC',
    version: '',
  };
  avatarPreview: string | null = null;
  private original = '';
  constructor() {
    Object.assign(dictionary, profileDictionary);
    effect(() => {
      this.profile();
      this.reset();
    });
    void this.loadOptions();
  }
  loadOptions() {
    return this.options.load((signal) => this.api.get('profile/options', {}, signal));
  }
  reset() {
    const profile = this.profile();
    if (!profile) return;
    this.draft = {
      displayName: profile.displayName,
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      culture: profile.culture,
      timeZone: profile.timeZone,
      version: profile.version,
    };
    this.avatarPreview = profile.avatarDataUrl ?? null;
    this.original = JSON.stringify(this.draft);
    this.photoError.set(false);
    this.conflict.set(false);
  }
  hasUnsavedChanges() {
    return this.original !== '' && JSON.stringify(this.draft) !== this.original;
  }
  initials() {
    return (
      this.draft.displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase() || '?'
    );
  }
  cultureLabel(culture: string) {
    return culture === 'af-ZA'
      ? 'Afrikaans (Suid-Afrika)'
      : culture === 'en-ZA'
        ? 'English (South Africa)'
        : culture;
  }
  async choosePhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.busy()) return;
    this.photoError.set(false);
    this.busy.set(true);
    let bitmap: ImageBitmap | undefined;
    try {
      if (
        file.size > 5 * 1024 * 1024 ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      )
        throw new Error('Invalid photo');
      bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image unavailable');
      const side = Math.min(bitmap.width, bitmap.height);
      context.drawImage(
        bitmap,
        (bitmap.width - side) / 2,
        (bitmap.height - side) / 2,
        side,
        side,
        0,
        0,
        256,
        256,
      );
      const preview = canvas.toDataURL('image/png');
      const encoded = preview.split(',')[1];
      if (encoded.length > 349528) throw new Error('Photo too large');
      this.draft.avatarBase64 = encoded;
      this.draft.removeAvatar = false;
      this.avatarPreview = preview;
    } catch {
      this.photoError.set(true);
    } finally {
      bitmap?.close();
      this.busy.set(false);
    }
  }
  removePhoto() {
    this.draft.avatarBase64 = null;
    this.draft.removeAvatar = true;
    this.avatarPreview = null;
    this.photoError.set(false);
  }
  async reload() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      this.saved.emit(await this.api.get<ProfileResponse>('profile'));
    } catch {
      /* Keep the draft until the reload succeeds. */
    } finally {
      this.busy.set(false);
    }
  }
  async save() {
    const current = this.profile();
    if (this.busy() || !current || !this.hasUnsavedChanges()) return;
    this.busy.set(true);
    this.conflict.set(false);
    try {
      const version = await this.api.post<string>('profile', this.draft);
      const updated: ProfileResponse = {
        ...current,
        displayName: this.draft.displayName.trim(),
        firstName: this.draft.firstName?.trim() || null,
        lastName: this.draft.lastName?.trim() || null,
        phoneNumber: this.draft.phoneNumber?.trim() || null,
        culture: this.draft.culture,
        timeZone: this.draft.timeZone,
        avatarDataUrl: this.avatarPreview,
        version,
      };
      this.i18n.set(updated.culture);
      this.i18n.timeZone.set(updated.timeZone);
      this.auth.access.update((access) =>
        access ? { ...access, culture: updated.culture, timeZone: updated.timeZone } : access,
      );
      this.saved.emit(updated);
      this.currentProfile.value.set(updated);
      this.toast.success('profileSaved');
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) this.conflict.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
