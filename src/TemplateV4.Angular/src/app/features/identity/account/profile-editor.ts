import {
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, Resource } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Notifications } from '../../notifications/notifications';
import { I18n, browserTimeZone } from '../../../core/i18n';
import { Auth } from '../../../core/auth';
import { CurrentProfile } from './current-profile';
import { Confirmations } from '../../../shared/confirmation';
import { dictionary } from '../../../core/translations';
import { profileDictionary } from './profile-translations';
import { ProfileOptions, ProfileResponse, UpdateProfileRequest } from '../../../api/models';
import { TimeZoneSelect } from '../../../shared/time-zone-select';

@Component({
  selector: 'app-profile-editor',
  imports: [
    WorkspaceUi,
    HlmAvatarImports,
    HlmDialogImports,
    HlmInputGroupImports,
    HlmSelectImports,
    TimeZoneSelect,
  ],
  providers: [provideIcons({ lucidePencil })],
  styles: `
    .profile-photo-dropzone {
      min-block-size: 16rem;
      block-size: 100%;
    }

    @media (min-width: 64rem) {
      .profile-photo-dropzone {
        min-block-size: 12rem;
        block-size: 12rem;
      }
    }
  `,
  template: `<section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'profileDetails' | t }}</h2>
        <p hlmCardDescription>{{ 'profileDetailsHelp' | t }}</p>
      </div>
      <app-page-state [state]="options.state()" skeleton="form" (retry)="loadOptions()">
        <form #form="ngForm" (ngSubmit)="form.valid && save()">
          <div hlmCardContent>
            <fieldset
              hlmFieldSet
              [disabled]="busy()"
              class="grid gap-6 lg:grid-cols-3 lg:items-start"
            >
              <legend hlmFieldLegend class="sr-only">{{ 'profileDetails' | t }}</legend>
              <section
                aria-labelledby="profile-photo-title"
                class="grid gap-4 lg:col-start-3 lg:row-start-1 lg:border-s lg:ps-6"
              >
                <div class="grid gap-1">
                  <h3 id="profile-photo-title" class="font-semibold">{{ 'profilePhoto' | t }}</h3>
                  <p id="profile-photo-help" class="text-muted-foreground text-sm">
                    {{ 'profilePhotoHelp' | t }}
                  </p>
                </div>
                <div hlmField class="min-h-0">
                  <label hlmFieldLabel for="profile-photo" class="sr-only">{{
                    'profilePhoto' | t
                  }}</label>
                  <input
                    #photoInput
                    id="profile-photo"
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    [disabled]="busy()"
                    (change)="choosePhoto($event)"
                    aria-describedby="profile-photo-help"
                  />
                  @if (photoBusy()) {
                    <div
                      class="file-storage-dropzone profile-photo-dropzone"
                      role="status"
                      aria-live="polite"
                    >
                      <hlm-spinner />
                      <span class="font-medium">{{ 'profilePhotoProcessing' | t }}</span>
                    </div>
                  } @else {
                    <button
                      type="button"
                      class="file-storage-dropzone profile-photo-dropzone"
                      [class.file-storage-drop-target]="photoDragOver()"
                      [disabled]="busy()"
                      (click)="showPhotoPicker()"
                      (dragover)="overPhoto($event)"
                      (dragleave)="photoDragOver.set(false)"
                      (drop)="dropPhoto($event)"
                    >
                      <hlm-avatar class="size-24">
                        @if (avatarPreview) {
                          <img hlmAvatarImage [src]="avatarPreview" [alt]="draft.displayName" />
                        }
                        <span hlmAvatarFallback>{{ initials() }}</span>
                      </hlm-avatar>
                      <span class="font-medium">{{ 'dropProfilePhotoHere' | t }}</span>
                      <span class="workspace-meta">{{ 'browseProfilePhotoHelp' | t }}</span>
                    </button>
                  }
                  @if (photoError()) {
                    <hlm-field-error forceShow>{{ 'profilePhotoInvalid' | t }}</hlm-field-error>
                  }
                </div>
                @if (avatarPreview) {
                  <button
                    hlmBtn
                    type="button"
                    variant="outline"
                    [disabled]="busy()"
                    (click)="removePhoto()"
                  >
                    {{ 'removeProfilePhoto' | t }}
                  </button>
                }
              </section>
              <section
                aria-labelledby="profile-details-title"
                class="grid content-start gap-4 lg:col-span-2 lg:col-start-1 lg:row-start-1"
              >
                <h3 id="profile-details-title" class="font-semibold">
                  {{ 'profileDetails' | t }}
                </h3>
                <div class="grid content-start gap-5 sm:grid-cols-2">
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
                      <hlm-field-error forceShow>{{
                        'profileDisplayNameInvalid' | t
                      }}</hlm-field-error>
                    }
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="profile-username">{{ 'username' | t }}</label>
                    <hlm-input-group>
                      <input
                        hlmInputGroupInput
                        id="profile-username"
                        autocomplete="username"
                        disabled
                        [value]="profile()?.username ?? ''"
                      />
                      <hlm-input-group-addon align="inline-end">
                        <button
                          hlmInputGroupButton
                          size="icon-sm"
                          type="button"
                          [attr.aria-label]="'changeUsername' | t"
                          (click)="openUsernameDialog()"
                        >
                          <ng-icon name="lucidePencil" />
                        </button>
                      </hlm-input-group-addon>
                    </hlm-input-group>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="profile-first-name">{{
                      'profileFirstName' | t
                    }}</label>
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
                    <label hlmFieldLabel for="profile-email">{{ 'emailAddress' | t }}</label>
                    <hlm-input-group>
                      <input
                        hlmInputGroupInput
                        id="profile-email"
                        type="email"
                        autocomplete="email"
                        disabled
                        [value]="profile()?.email ?? ''"
                      />
                      <hlm-input-group-addon align="inline-end">
                        <button
                          hlmInputGroupButton
                          size="icon-sm"
                          type="button"
                          [attr.aria-label]="'changeEmail' | t"
                          (click)="openEmailDialog()"
                        >
                          <ng-icon name="lucidePencil" />
                        </button>
                      </hlm-input-group-addon>
                    </hlm-input-group>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="profile-culture">{{ 'culture' | t }}</label>
                    <hlm-select
                      name="culture"
                      required
                      [(ngModel)]="draft.culture"
                      [disabled]="busy()"
                      [itemToString]="cultureLabel"
                    >
                      <hlm-select-trigger buttonId="profile-culture" class="w-full"
                        ><hlm-select-value
                      /></hlm-select-trigger>
                      <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
                        @for (culture of options.value()?.cultures ?? []; track culture) {
                          <hlm-select-item [value]="culture">{{
                            cultureLabel(culture)
                          }}</hlm-select-item>
                        }
                      </hlm-select-content>
                    </hlm-select>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="profile-time-zone">{{ 'profileTimeZone' | t }}</label>
                    <app-time-zone-select
                      name="timeZone"
                      required
                      [(ngModel)]="draft.timeZone"
                      [disabled]="busy()"
                      [timeZones]="options.value()?.timeZones ?? []"
                      buttonId="profile-time-zone"
                      [ariaLabel]="'profileTimeZone' | t"
                    />
                    <p hlmFieldDescription>{{ 'profileTimeZoneHelp' | t }}</p>
                  </div>
                </div>
              </section>
            </fieldset>
          </div>
          <div hlmCardFooter class="-mt-px grid gap-3 rounded-t-none py-4">
            <div class="flex w-full flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap gap-3">
                <button hlmBtn [disabled]="busy() || form.invalid || !hasProfileChanges()">
                  @if (busy()) {
                    <hlm-spinner />
                  }
                  {{ 'saveChanges' | t }}
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  [disabled]="busy() || !hasProfileChanges()"
                  (click)="reset(); form.form.markAsPristine(); form.form.markAsUntouched()"
                >
                  {{ 'cancel' | t }}
                </button>
                @if (conflict()) {
                  <button
                    hlmBtn
                    type="button"
                    variant="outline"
                    [disabled]="busy()"
                    (click)="reload()"
                  >
                    {{ 'profileReload' | t }}
                  </button>
                }
              </div>
              <div class="flex flex-wrap gap-3">
                <button hlmBtn type="button" variant="outline" (click)="openUsernameDialog()">
                  {{ 'changeUsername' | t }}
                </button>
                <button hlmBtn type="button" variant="outline" (click)="openEmailDialog()">
                  {{ 'changeEmail' | t }}
                </button>
              </div>
            </div>
            @if (conflict()) {
              <div hlmAlert role="status">
                <p hlmAlertDescription>{{ 'profileConflict' | t }}</p>
              </div>
            }
          </div>
        </form>
      </app-page-state>
    </section>

    <hlm-dialog
      [state]="usernameDialogOpen() ? 'open' : 'closed'"
      [closeOnOutsidePointerEvents]="false"
      (stateChanged)="$event === 'closed' && closeUsernameDialog()"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header>
          <h2 hlmDialogTitle>{{ 'changeUsername' | t }}</h2>
          <p hlmDialogDescription>{{ 'changeUsernameHelp' | t }}</p>
        </hlm-dialog-header>
        <form
          class="grid gap-5"
          #usernameForm="ngForm"
          (ngSubmit)="usernameForm.valid && changeUsername()"
        >
          <div hlmField>
            <label hlmFieldLabel for="new-username">{{ 'newUsername' | t }}</label>
            <input
              hlmInput
              id="new-username"
              name="username"
              autocomplete="username"
              required
              minlength="3"
              maxlength="64"
              pattern="[A-Za-z0-9._-]+"
              [(ngModel)]="username"
              #usernameControl="ngModel"
            />
            @if (usernameDialogOpen() && usernameControl.invalid && usernameControl.touched) {
              <hlm-field-error forceShow>{{ 'usernameInvalid' | t }}</hlm-field-error>
            }
          </div>
          <div hlmField>
            <label hlmFieldLabel for="username-password">{{ 'currentPassword' | t }}</label>
            <input
              hlmInput
              id="username-password"
              name="usernamePassword"
              type="password"
              autocomplete="current-password"
              required
              maxlength="1024"
              [(ngModel)]="usernamePassword"
            />
          </div>
          <p class="workspace-meta">{{ 'profileChangeProofHelp' | t }}</p>
          <hlm-dialog-footer>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="usernameBusy()"
              (pointerdown)="$event.preventDefault()"
              (click)="closeUsernameDialog()"
            >
              {{ 'cancel' | t }}
            </button>
            <button hlmBtn [disabled]="usernameBusy() || usernameForm.invalid">
              @if (usernameBusy()) {
                <hlm-spinner />
              }
              {{ 'changeUsername' | t }}
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>

    <hlm-dialog
      [state]="emailDialogOpen() ? 'open' : 'closed'"
      [closeOnOutsidePointerEvents]="false"
      (stateChanged)="$event === 'closed' && closeEmailDialog()"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header>
          <h2 hlmDialogTitle>{{ 'changeEmail' | t }}</h2>
          <p hlmDialogDescription>{{ 'changeEmailHelp' | t }}</p>
        </hlm-dialog-header>
        @if (emailSent()) {
          <div class="grid gap-5">
            <div hlmAlert role="status">
              <h3 hlmAlertTitle>{{ 'emailChangeSent' | t }}</h3>
              <p hlmAlertDescription>{{ 'emailChangeSentHelp' | t }}</p>
            </div>
            <hlm-dialog-footer>
              <button hlmBtn type="button" (click)="closeEmailDialog()">{{ 'close' | t }}</button>
            </hlm-dialog-footer>
          </div>
        } @else {
          <form
            class="grid gap-5"
            #emailForm="ngForm"
            (ngSubmit)="emailForm.valid && changeEmail()"
          >
            <div hlmField>
              <label hlmFieldLabel for="new-email">{{ 'newEmail' | t }}</label>
              <input
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
              @if (emailDialogOpen() && emailControl.invalid && emailControl.touched) {
                <hlm-field-error forceShow>{{ 'emailInvalid' | t }}</hlm-field-error>
              }
            </div>
            <div hlmField>
              <label hlmFieldLabel for="email-password">{{ 'currentPassword' | t }}</label>
              <input
                hlmInput
                id="email-password"
                name="emailPassword"
                type="password"
                autocomplete="current-password"
                required
                maxlength="1024"
                [(ngModel)]="emailPassword"
              />
            </div>
            <p class="workspace-meta">{{ 'profileChangeProofHelp' | t }}</p>
            <hlm-dialog-footer>
              <button
                hlmBtn
                type="button"
                variant="outline"
                [disabled]="emailBusy()"
                (pointerdown)="$event.preventDefault()"
                (click)="closeEmailDialog()"
              >
                {{ 'cancel' | t }}
              </button>
              <button hlmBtn [disabled]="emailBusy() || emailForm.invalid">
                @if (emailBusy()) {
                  <hlm-spinner />
                }
                {{ 'sendVerification' | t }}
              </button>
            </hlm-dialog-footer>
          </form>
        }
      </hlm-dialog-content>
    </hlm-dialog>`,
})
export class ProfileEditor {
  readonly profile = input<ProfileResponse | null>(null);
  readonly saved = output<ProfileResponse>();
  private readonly api = inject(WorkspaceApi);
  private readonly toast = inject(Notifications);
  private readonly i18n = inject(I18n);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly confirmations = inject(Confirmations);
  private readonly currentProfile = inject(CurrentProfile);
  readonly options = new Resource<ProfileOptions>();
  readonly busy = signal(false);
  readonly photoBusy = signal(false);
  readonly photoDragOver = signal(false);
  readonly photoError = signal(false);
  readonly conflict = signal(false);
  readonly usernameDialogOpen = signal(false);
  readonly usernameBusy = signal(false);
  readonly emailDialogOpen = signal(false);
  readonly emailBusy = signal(false);
  readonly emailSent = signal(false);
  draft: UpdateProfileRequest = {
    displayName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    culture: 'en-ZA',
    timeZone: browserTimeZone(),
    version: '',
  };
  avatarPreview: string | null = null;
  username = '';
  usernamePassword = '';
  email = '';
  emailPassword = '';
  private original = '';
  private readonly photoInput = viewChild<ElementRef<HTMLInputElement>>('photoInput');
  private readonly usernameFormRef = viewChild<NgForm>('usernameForm');
  private readonly emailFormRef = viewChild<NgForm>('emailForm');
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
      timeZone: profile.timeZone?.trim() || browserTimeZone(),
      version: profile.version,
    };
    this.avatarPreview = profile.avatarDataUrl ?? null;
    this.original = JSON.stringify(this.draft);
    this.photoError.set(false);
    this.conflict.set(false);
  }
  hasProfileChanges() {
    return this.original !== '' && JSON.stringify(this.draft) !== this.original;
  }
  hasUnsavedChanges() {
    return !!(
      this.hasProfileChanges() ||
      this.username ||
      this.usernamePassword ||
      this.email ||
      this.emailPassword
    );
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
  readonly cultureLabel = (culture: string) =>
    culture === 'af-ZA'
      ? 'Afrikaans (Suid-Afrika)'
      : culture === 'en-ZA'
        ? 'English (South Africa)'
        : culture;
  async choosePhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) await this.processPhoto(file);
  }
  showPhotoPicker() {
    if (!this.busy()) this.photoInput()?.nativeElement.click();
  }
  overPhoto(event: DragEvent) {
    event.preventDefault();
    if (this.busy() || !event.dataTransfer?.types.includes('Files')) return;
    event.dataTransfer.dropEffect = 'copy';
    this.photoDragOver.set(true);
  }
  dropPhoto(event: DragEvent) {
    event.preventDefault();
    this.photoDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) void this.processPhoto(file);
  }
  private async processPhoto(file: File) {
    if (this.busy()) return;
    this.photoError.set(false);
    this.busy.set(true);
    this.photoBusy.set(true);
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
      this.photoBusy.set(false);
      this.busy.set(false);
    }
  }
  removePhoto() {
    this.draft.avatarBase64 = null;
    this.draft.removeAvatar = true;
    this.avatarPreview = null;
    this.photoError.set(false);
  }
  openUsernameDialog() {
    this.resetUsernameDialog();
    this.usernameDialogOpen.set(true);
  }
  closeUsernameDialog() {
    if (this.usernameBusy()) return;
    this.resetUsernameDialog();
    this.usernameDialogOpen.set(false);
  }
  openEmailDialog() {
    this.resetEmailDialog();
    this.emailSent.set(false);
    this.emailDialogOpen.set(true);
  }
  closeEmailDialog() {
    if (this.emailBusy()) return;
    this.resetEmailDialog();
    this.emailDialogOpen.set(false);
    this.emailSent.set(false);
  }
  async changeUsername() {
    const current = this.profile();
    if (!current || this.usernameBusy()) return;
    this.usernameBusy.set(true);
    try {
      const username = await this.api.post<string>('profile/username', {
        username: this.username.trim(),
        proof: { password: this.usernamePassword },
      });
      const updated = { ...current, username };
      this.saved.emit(updated);
      this.currentProfile.value.set(updated);
      this.toast.success('usernameChanged');
      this.resetUsernameDialog();
      this.usernameDialogOpen.set(false);
    } catch (error) {
      if (this.reauthenticationRequired(error)) await this.redirectForReauthentication();
      // Otherwise retain the form so the user can correct the proof or username.
    } finally {
      this.usernameBusy.set(false);
    }
  }
  async changeEmail() {
    if (this.emailBusy()) return;
    this.emailBusy.set(true);
    try {
      await this.api.post('privacy/email', {
        email: this.email.trim(),
        proof: { password: this.emailPassword },
      });
      this.resetEmailDialog();
      this.emailSent.set(true);
      this.toast.success('emailChangeSent');
    } catch (error) {
      if (this.reauthenticationRequired(error)) await this.redirectForReauthentication();
      // Otherwise retain the form so the user can correct the proof or email.
    } finally {
      this.emailBusy.set(false);
    }
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
    if (this.busy() || !current || !this.hasProfileChanges()) return;
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
      this.i18n.timeZone.set(this.draft.timeZone);
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
  private clearUsernameDialog() {
    this.username = '';
    this.usernamePassword = '';
  }
  private resetUsernameDialog() {
    this.usernameFormRef()?.resetForm();
    this.clearUsernameDialog();
  }
  private clearEmailDialog() {
    this.email = '';
    this.emailPassword = '';
  }
  private resetEmailDialog() {
    this.emailFormRef()?.resetForm();
    this.clearEmailDialog();
  }
  private reauthenticationRequired(error: unknown) {
    return error instanceof HttpErrorResponse && error.error?.code === 'auth.reauthentication_required';
  }
  private async redirectForReauthentication() {
    if (
      this.hasProfileChanges() &&
      !(await this.confirmations.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'))
    )
      return;
    const returnUrl = this.router.url;
    this.reset();
    this.resetUsernameDialog();
    this.resetEmailDialog();
    this.usernameDialogOpen.set(false);
    this.emailDialogOpen.set(false);
    await this.auth.logout();
    await this.router.navigate(['/login'], { queryParams: { returnUrl } });
    this.toast.info('reauthenticationRedirected');
  }
}
