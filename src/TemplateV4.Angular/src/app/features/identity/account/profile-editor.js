import { Component, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, Resource } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Notifications } from '../../notifications/notifications';
import { I18n } from '../../../core/i18n';
import { Auth } from '../../../core/auth';
import { CurrentProfile } from './current-profile';
import { dictionary } from '../../../core/translations';
import { profileDictionary } from './profile-translations';
import * as i0 from "@angular/core";
import * as i1 from "../../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/card";
import * as i5 from "@spartan-ng/helm/field";
import * as i6 from "@spartan-ng/helm/input";
import * as i7 from "@spartan-ng/helm/alert";
import * as i8 from "@spartan-ng/helm/spinner";
import * as i9 from "@spartan-ng/helm/avatar";
import * as i10 from "@spartan-ng/helm/select";
import * as i11 from "../../../core/i18n";
const _c0 = () => [];
function ProfileEditor_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 13);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", ctx_r2.avatarPreview, i0.ɵɵsanitizeUrl)("alt", ctx_r2.draft.displayName);
} }
function ProfileEditor_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "profilePhotoInvalid"));
} }
function ProfileEditor_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 45);
    i0.ɵɵlistener("click", function ProfileEditor_Conditional_29_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.removePhoto()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "removeProfilePhoto"), " ");
} }
function ProfileEditor_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "profileDisplayNameInvalid"));
} }
function ProfileEditor_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "profilePhoneInvalid"));
} }
function ProfileEditor_hlm_select_content_65_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 47);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const culture_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", culture_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.cultureLabel(culture_r5));
} }
function ProfileEditor_hlm_select_content_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 46);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, ProfileEditor_hlm_select_content_65_For_3_Template, 2, 2, "hlm-select-item", 47, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "culture"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.options.value()?.cultures ?? i0.ɵɵpureFunction0(3, _c0));
} }
function ProfileEditor_hlm_select_content_73_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 47);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const zone_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", zone_r6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(zone_r6);
} }
function ProfileEditor_hlm_select_content_73_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 46);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, ProfileEditor_hlm_select_content_73_For_3_Template, 2, 2, "hlm-select-item", 47, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "profileTimeZone"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.options.value()?.timeZones ?? i0.ɵɵpureFunction0(3, _c0));
} }
function ProfileEditor_Conditional_79_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function ProfileEditor_Conditional_85_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 42);
    i0.ɵɵlistener("click", function ProfileEditor_Conditional_85_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.reload()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "profileReload"), " ");
} }
function ProfileEditor_Conditional_86_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "p", 48);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "profileConflict"));
} }
export class ProfileEditor {
    profile = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "profile" }] : /* istanbul ignore next */ []));
    saved = output();
    api = inject(WorkspaceApi);
    toast = inject(Notifications);
    i18n = inject(I18n);
    auth = inject(Auth);
    currentProfile = inject(CurrentProfile);
    options = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    photoError = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "photoError" }] : /* istanbul ignore next */ []));
    conflict = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conflict" }] : /* istanbul ignore next */ []));
    draft = {
        displayName: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        culture: 'en-ZA',
        timeZone: 'UTC',
        version: '',
    };
    avatarPreview = null;
    original = '';
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
        if (!profile)
            return;
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
        return (this.draft.displayName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0] ?? '')
            .join('')
            .toUpperCase() || '?');
    }
    cultureLabel(culture) {
        return culture === 'af-ZA'
            ? 'Afrikaans (Suid-Afrika)'
            : culture === 'en-ZA'
                ? 'English (South Africa)'
                : culture;
    }
    async choosePhoto(event) {
        const input = event.target;
        const file = input.files?.[0];
        input.value = '';
        if (!file || this.busy())
            return;
        this.photoError.set(false);
        this.busy.set(true);
        let bitmap;
        try {
            if (file.size > 5 * 1024 * 1024 ||
                !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
                throw new Error('Invalid photo');
            bitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const context = canvas.getContext('2d');
            if (!context)
                throw new Error('Image unavailable');
            const side = Math.min(bitmap.width, bitmap.height);
            context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
            const preview = canvas.toDataURL('image/png');
            const encoded = preview.split(',')[1];
            if (encoded.length > 349528)
                throw new Error('Photo too large');
            this.draft.avatarBase64 = encoded;
            this.draft.removeAvatar = false;
            this.avatarPreview = preview;
        }
        catch {
            this.photoError.set(true);
        }
        finally {
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
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            this.saved.emit(await this.api.get('profile'));
        }
        catch {
            /* Keep the draft until the reload succeeds. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async save() {
        const current = this.profile();
        if (this.busy() || !current || !this.hasUnsavedChanges())
            return;
        this.busy.set(true);
        this.conflict.set(false);
        try {
            const version = await this.api.post('profile', this.draft);
            const updated = {
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
            this.auth.access.update((access) => access ? { ...access, culture: updated.culture, timeZone: updated.timeZone } : access);
            this.saved.emit(updated);
            this.currentProfile.value.set(updated);
            this.toast.success('profileSaved');
        }
        catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 409)
                this.conflict.set(true);
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function ProfileEditor_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProfileEditor)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProfileEditor, selectors: [["app-profile-editor"]], inputs: { profile: [1, "profile"] }, outputs: { saved: "saved" }, decls: 87, vars: 66, consts: [["form", "ngForm"], ["displayName", "ngModel"], ["phone", "ngModel"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], [3, "retry", "state"], ["hlmCardContent", "", 1, "grid", "gap-5", 3, "ngSubmit"], ["hlmFieldSet", "", 1, "grid", "gap-5", 3, "disabled"], ["hlmFieldLegend", "", 1, "sr-only"], [1, "flex", "items-center", "gap-4"], ["size", "lg"], ["hlmAvatarImage", "", 3, "src", "alt"], ["hlmAvatarFallback", ""], ["hlmField", "", 1, "min-w-0", "flex-1"], ["hlmFieldLabel", "", "for", "profile-photo"], ["hlmInput", "", "id", "profile-photo", "type", "file", "accept", "image/jpeg,image/png,image/webp", "aria-describedby", "profile-photo-help", 3, "change"], ["hlmFieldDescription", "", "id", "profile-photo-help"], ["forceShow", ""], ["hlmBtn", "", "type", "button", "variant", "outline"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "profile-display-name"], ["hlmInput", "", "id", "profile-display-name", "name", "displayName", "autocomplete", "nickname", "required", "", "pattern", ".*\\S.*", "maxlength", "120", 3, "ngModelChange", "ngModel"], [1, "grid", "gap-5", "sm:grid-cols-2"], ["hlmFieldLabel", "", "for", "profile-first-name"], ["hlmInput", "", "id", "profile-first-name", "name", "firstName", "autocomplete", "given-name", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "profile-last-name"], ["hlmInput", "", "id", "profile-last-name", "name", "lastName", "autocomplete", "family-name", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "profile-phone"], ["hlmInput", "", "id", "profile-phone", "name", "phone", "type", "tel", "autocomplete", "tel", "maxlength", "16", "pattern", "\\+[1-9][0-9]{6,14}", "aria-describedby", "profile-phone-help", 3, "ngModelChange", "ngModel"], ["hlmFieldDescription", "", "id", "profile-phone-help"], ["hlmFieldLabel", "", "for", "profile-culture"], ["name", "culture", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["buttonId", "profile-culture", 1, "w-full"], [3, "ariaLabel", 4, "hlmSelectPortal"], ["hlmFieldLabel", "", "for", "profile-time-zone"], ["name", "timeZone", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["buttonId", "profile-time-zone", 1, "w-full"], ["hlmFieldDescription", ""], [1, "flex", "flex-wrap", "gap-3"], ["hlmBtn", "", 3, "disabled"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click", "disabled"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "disabled"], ["hlmAlert", "", "role", "status"], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click"], [3, "ariaLabel"], [3, "value"], ["hlmAlertDescription", ""]], template: function ProfileEditor_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "h2", 5);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p", 6);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "app-page-state", 7);
            i0.ɵɵlistener("retry", function ProfileEditor_Template_app_page_state_retry_8_listener() { return ctx.loadOptions(); });
            i0.ɵɵelementStart(9, "form", 8, 0);
            i0.ɵɵlistener("ngSubmit", function ProfileEditor_Template_form_ngSubmit_9_listener() { i0.ɵɵrestoreView(_r1); const form_r2 = i0.ɵɵreference(10); return i0.ɵɵresetView(form_r2.valid && ctx.save()); });
            i0.ɵɵelementStart(11, "fieldset", 9)(12, "legend", 10);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "div", 11)(16, "hlm-avatar", 12);
            i0.ɵɵconditionalCreate(17, ProfileEditor_Conditional_17_Template, 1, 2, "img", 13);
            i0.ɵɵelementStart(18, "span", 14);
            i0.ɵɵtext(19);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(20, "div", 15)(21, "label", 16);
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "input", 17);
            i0.ɵɵlistener("change", function ProfileEditor_Template_input_change_24_listener($event) { return ctx.choosePhoto($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "p", 18);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(28, ProfileEditor_Conditional_28_Template, 3, 3, "hlm-field-error", 19);
            i0.ɵɵconditionalCreate(29, ProfileEditor_Conditional_29_Template, 3, 3, "button", 20);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(30, "div", 21)(31, "label", 22);
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(34, "input", 23, 1);
            i0.ɵɵtwoWayListener("ngModelChange", function ProfileEditor_Template_input_ngModelChange_34_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.draft.displayName, $event) || (ctx.draft.displayName = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(36, ProfileEditor_Conditional_36_Template, 3, 3, "hlm-field-error", 19);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "div", 24)(38, "div", 21)(39, "label", 25);
            i0.ɵɵtext(40);
            i0.ɵɵpipe(41, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(42, "input", 26);
            i0.ɵɵtwoWayListener("ngModelChange", function ProfileEditor_Template_input_ngModelChange_42_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.draft.firstName, $event) || (ctx.draft.firstName = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "div", 21)(44, "label", 27);
            i0.ɵɵtext(45);
            i0.ɵɵpipe(46, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "input", 28);
            i0.ɵɵtwoWayListener("ngModelChange", function ProfileEditor_Template_input_ngModelChange_47_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.draft.lastName, $event) || (ctx.draft.lastName = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(48, "div", 21)(49, "label", 29);
            i0.ɵɵtext(50);
            i0.ɵɵpipe(51, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "input", 30, 2);
            i0.ɵɵtwoWayListener("ngModelChange", function ProfileEditor_Template_input_ngModelChange_52_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.draft.phoneNumber, $event) || (ctx.draft.phoneNumber = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(54, "p", 31);
            i0.ɵɵtext(55);
            i0.ɵɵpipe(56, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(57, ProfileEditor_Conditional_57_Template, 3, 3, "hlm-field-error", 19);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(58, "div", 21)(59, "label", 32);
            i0.ɵɵtext(60);
            i0.ɵɵpipe(61, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(62, "hlm-select", 33);
            i0.ɵɵtwoWayListener("ngModelChange", function ProfileEditor_Template_hlm_select_ngModelChange_62_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.draft.culture, $event) || (ctx.draft.culture = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementStart(63, "hlm-select-trigger", 34);
            i0.ɵɵelement(64, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(65, ProfileEditor_hlm_select_content_65_Template, 4, 4, "hlm-select-content", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(66, "div", 21)(67, "label", 36);
            i0.ɵɵtext(68);
            i0.ɵɵpipe(69, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(70, "hlm-select", 37);
            i0.ɵɵtwoWayListener("ngModelChange", function ProfileEditor_Template_hlm_select_ngModelChange_70_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.draft.timeZone, $event) || (ctx.draft.timeZone = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementStart(71, "hlm-select-trigger", 38);
            i0.ɵɵelement(72, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(73, ProfileEditor_hlm_select_content_73_Template, 4, 4, "hlm-select-content", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(74, "p", 39);
            i0.ɵɵtext(75);
            i0.ɵɵpipe(76, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(77, "div", 40)(78, "button", 41);
            i0.ɵɵconditionalCreate(79, ProfileEditor_Conditional_79_Template, 1, 0, "hlm-spinner");
            i0.ɵɵtext(80);
            i0.ɵɵpipe(81, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(82, "button", 42);
            i0.ɵɵlistener("click", function ProfileEditor_Template_button_click_82_listener() { i0.ɵɵrestoreView(_r1); const form_r2 = i0.ɵɵreference(10); ctx.reset(); form_r2.form.markAsPristine(); return i0.ɵɵresetView(form_r2.form.markAsUntouched()); });
            i0.ɵɵtext(83);
            i0.ɵɵpipe(84, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(85, ProfileEditor_Conditional_85_Template, 3, 4, "button", 43);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(86, ProfileEditor_Conditional_86_Template, 4, 3, "div", 44);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            const form_r2 = i0.ɵɵreference(10);
            const displayName_r8 = i0.ɵɵreference(35);
            const phone_r9 = i0.ɵɵreference(53);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 36, "profileDetails"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 38, "profileDetailsHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.options.state());
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 40, "profileDetails"));
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.avatarPreview ? 17 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.initials());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 42, "profilePhoto"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 44, "profilePhotoHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.photoError() ? 28 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.avatarPreview ? 29 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 46, "displayName"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.draft.displayName);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(displayName_r8.invalid && (displayName_r8.touched || form_r2.submitted) ? 36 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 48, "profileFirstName"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.draft.firstName);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(46, 50, "profileLastName"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.draft.lastName);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(51, 52, "profilePhone"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.draft.phoneNumber);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(56, 54, "profilePhoneHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(phone_r9.invalid && (phone_r9.touched || form_r2.submitted) ? 57 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(61, 56, "culture"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.draft.culture);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(69, 58, "profileTimeZone"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.draft.timeZone);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(76, 60, "profileTimeZoneHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy() || form_r2.invalid || !ctx.hasUnsavedChanges());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.busy() ? 79 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(81, 62, "save"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || !ctx.hasUnsavedChanges());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(84, 64, "cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.conflict() ? 85 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.conflict() ? 86 : -1);
        } }, dependencies: [i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.PatternValidator, i2.NgModel, i2.NgForm, i3.HlmButton, i4.HlmCard, i4.HlmCardContent, i4.HlmCardDescription, i4.HlmCardHeader, i4.HlmCardTitle, i5.HlmField, i5.HlmFieldDescription, i5.HlmFieldError, i5.HlmFieldLabel, i5.HlmFieldLegend, i5.HlmFieldSet, i6.HlmInput, i7.HlmAlert, i7.HlmAlertDescription, i8.HlmSpinner, i9.HlmAvatar, i9.HlmAvatarFallback, i9.HlmAvatarImage, i10.HlmSelect, i10.HlmSelectContent, i10.HlmSelectItem, i10.HlmSelectPortal, i10.HlmSelectTrigger, i10.HlmSelectValue, i11.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProfileEditor, [{
        type: Component,
        args: [{
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
            }]
    }], () => [], { profile: [{ type: i0.Input, args: [{ isSignal: true, alias: "profile", required: false }] }], saved: [{ type: i0.Output, args: ["saved"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProfileEditor, { className: "ProfileEditor", filePath: "src/app/features/profile-editor.ts", lineNumber: 174 }); })();
