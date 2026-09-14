import { Component, computed, inject, input, model, signal } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBlend, lucidePalette } from '@ng-icons/lucide';
import { I18n, Translate } from '../core/i18n';
import { GRADIENT_TYPES, LOGIN_BACKGROUNDS, loginBackground } from '../core/login-backgrounds';
import { LoginBackgroundArtwork } from './login-background';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/drawer";
import * as i2 from "@spartan-ng/helm/button";
import * as i3 from "@spartan-ng/helm/badge";
import * as i4 from "@spartan-ng/helm/checkbox";
import * as i5 from "@spartan-ng/helm/input";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/select";
import * as i8 from "@spartan-ng/helm/switch";
const _forTrack0 = ($index, $item) => $item.id;
function LoginBackgroundPicker_hlm_select_content_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 36);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 37);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "hlm-select-item", 38);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 3, "previewRole"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "previewAdministrator"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 7, "previewMember"));
} }
function LoginBackgroundPicker_hlm_drawer_content_68_For_15_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 46)(1, "input", 47);
    i0.ɵɵlistener("click", function LoginBackgroundPicker_hlm_drawer_content_68_For_15_Template_input_click_1_listener() { const item_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.selectType(item_r2.id)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "span", 48);
    i0.ɵɵelement(3, "app-login-background", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 50);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", item_r2.id)("checked", ctx_r2.type() === item_r2.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", item_r2.preview)("thumbnail", true);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 5, item_r2.label));
} }
function LoginBackgroundPicker_hlm_drawer_content_68_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-drawer-content", 39)(1, "hlm-drawer-header")(2, "h2", 40);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 41);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 42)(9, "fieldset", 43)(10, "legend", 44);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 45);
    i0.ɵɵrepeaterCreate(14, LoginBackgroundPicker_hlm_drawer_content_68_For_15_Template, 7, 7, "label", 46, _forTrack0);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "gradientType"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "gradientDrawerHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r2.disabled());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, "gradientType"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.types);
} }
function LoginBackgroundPicker_hlm_drawer_content_74_For_15_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 46)(1, "input", 52);
    i0.ɵɵlistener("click", function LoginBackgroundPicker_hlm_drawer_content_74_For_15_Template_input_click_1_listener() { const preset_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.selectColorPreset(preset_r5.id)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "span", 48);
    i0.ɵɵelement(3, "app-login-background", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 50);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const preset_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", preset_r5.id)("checked", ctx_r2.value() === preset_r5.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", preset_r5.id)("thumbnail", true);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(preset_r5.name);
} }
function LoginBackgroundPicker_hlm_drawer_content_74_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-drawer-content", 39)(1, "hlm-drawer-header")(2, "h2", 40);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 41);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 42)(9, "fieldset", 51)(10, "legend", 44);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 45);
    i0.ɵɵrepeaterCreate(14, LoginBackgroundPicker_hlm_drawer_content_74_For_15_Template, 6, 5, "label", 46, _forTrack0);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "gradientColorPreset"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "gradientDrawerHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r2.disabled());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, "gradientColorPreset"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.presets());
} }
export class LoginBackgroundPicker {
    i18n = inject(I18n);
    roleLabel = (value) => this.i18n.text(value === 'member' ? 'previewMember' : 'previewAdministrator');
    value = model('blue-sky', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    disabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    typeState = signal('closed', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "typeState" }] : /* istanbul ignore next */ []));
    presetState = signal('closed', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "presetState" }] : /* istanbul ignore next */ []));
    selectedPreset = computed(() => loginBackground(this.value()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedPreset" }] : /* istanbul ignore next */ []));
    selectedType = computed(() => GRADIENT_TYPES.find((type) => type.id === this.type()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedType" }] : /* istanbul ignore next */ []));
    types = GRADIENT_TYPES.map((type) => ({
        ...type,
        preview: LOGIN_BACKGROUNDS.find((preset) => preset.type === type.id).id,
    }));
    type = computed(() => loginBackground(this.value()).type, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "type" }] : /* istanbul ignore next */ []));
    presets = computed(() => LOGIN_BACKGROUNDS.filter((preset) => preset.type === this.type()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "presets" }] : /* istanbul ignore next */ []));
    selectType(value) {
        if (this.disabled())
            return;
        this.typeState.set('closed');
        if (value === this.type())
            return;
        const first = LOGIN_BACKGROUNDS.find((preset) => preset.type === value);
        if (first)
            this.value.set(first.id);
    }
    selectColorPreset(value) {
        if (this.disabled())
            return;
        this.value.set(value);
        this.presetState.set('closed');
    }
    static ɵfac = function LoginBackgroundPicker_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LoginBackgroundPicker)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LoginBackgroundPicker, selectors: [["app-login-background-picker"]], inputs: { value: [1, "value"], disabled: [1, "disabled"] }, outputs: { value: "valueChange" }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideBlend, lucidePalette })])], decls: 78, vars: 67, consts: [[1, "grid", "gap-4"], [1, "font-semibold"], ["data-testid", "login-preview", 1, "preview"], [1, "control-preview"], [1, "flex", "flex-wrap", "items-center", "gap-2"], [1, "text-xl", "font-semibold"], ["hlmBadge", ""], ["hlmBadge", "", "variant", "secondary"], [1, "text-sm", "text-muted-foreground"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "preview-name"], ["hlmInput", "", "id", "preview-name", "type", "text", 3, "placeholder"], ["hlmFieldLabel", "", "for", "preview-role"], ["value", "administrator", 3, "itemToString"], ["buttonId", "preview-role", 1, "w-full"], [3, "ariaLabel", 4, "hlmSelectPortal"], [1, "grid", "gap-3", "sm:grid-cols-2"], ["hlmFieldLabel", "", "for", "preview-updates", 1, "cursor-pointer"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "preview-updates", "checked", ""], ["hlmFieldTitle", ""], ["hlmFieldLabel", "", "for", "preview-enabled", 1, "cursor-pointer"], ["inputId", "preview-enabled", "checked", ""], [1, "flex", "flex-wrap", "gap-2"], ["hlmBtn", "", "type", "button"], ["hlmBtn", "", "variant", "secondary", "type", "button"], ["hlmBtn", "", "variant", "outline", "type", "button"], [1, "preview-artwork"], [3, "value"], [1, "absolute", "top-3", "right-3", "flex", "gap-2"], ["direction", "right", 3, "stateChanged", "state"], ["hlmBtn", "", "variant", "secondary", "size", "icon-sm", "type", "button", "hlmDrawerTrigger", "", "data-testid", "choose-gradient-type", 3, "disabled", "title"], ["name", "lucideBlend", "aria-hidden", "true"], ["class", "overflow-hidden sm:max-w-xl", 4, "hlmDrawerPortal"], ["hlmBtn", "", "variant", "secondary", "size", "icon-sm", "type", "button", "hlmDrawerTrigger", "", "data-testid", "choose-gradient-preset", 3, "disabled", "title"], ["name", "lucidePalette", "aria-hidden", "true"], [3, "ariaLabel"], ["value", "administrator"], ["value", "member"], [1, "overflow-hidden", "sm:max-w-xl"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], ["hlmDrawerBody", "", 1, "min-h-0", "flex-1", "overflow-y-auto"], ["hlmFieldSet", "", "data-testid", "gradient-types", 3, "disabled"], ["hlmFieldLegend", ""], [1, "presets"], [1, "preset"], ["type", "radio", "name", "loginBackgroundType", 3, "click", "value", "checked"], ["aria-hidden", "true", 1, "thumbnail"], [3, "value", "thumbnail"], [1, "name"], ["hlmFieldSet", "", "data-testid", "gradient-presets", 3, "disabled"], ["type", "radio", "name", "loginBackground", 3, "click", "value", "checked"]], template: function LoginBackgroundPicker_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0);
            i0.ɵɵpipe(1, "t");
            i0.ɵɵelementStart(2, "h4", 1);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "div", 2)(6, "div", 3)(7, "div")(8, "div", 4)(9, "h5", 5);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "span", 6);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "span", 7);
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(18, "p", 8);
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "div", 9)(22, "label", 10);
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(25, "input", 11);
            i0.ɵɵpipe(26, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "div", 9)(28, "label", 12);
            i0.ɵɵtext(29);
            i0.ɵɵpipe(30, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(31, "hlm-select", 13)(32, "hlm-select-trigger", 14);
            i0.ɵɵelement(33, "hlm-select-value");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(34, LoginBackgroundPicker_hlm_select_content_34_Template, 8, 9, "hlm-select-content", 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(35, "div", 16)(36, "label", 17)(37, "div", 18);
            i0.ɵɵelement(38, "hlm-checkbox", 19);
            i0.ɵɵelementStart(39, "span", 20);
            i0.ɵɵtext(40);
            i0.ɵɵpipe(41, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(42, "label", 21)(43, "div", 18);
            i0.ɵɵelement(44, "hlm-switch", 22);
            i0.ɵɵelementStart(45, "span", 20);
            i0.ɵɵtext(46);
            i0.ɵɵpipe(47, "t");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(48, "div", 23)(49, "button", 24);
            i0.ɵɵtext(50);
            i0.ɵɵpipe(51, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "button", 25);
            i0.ɵɵtext(53);
            i0.ɵɵpipe(54, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(55, "button", 26);
            i0.ɵɵtext(56);
            i0.ɵɵpipe(57, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(58, "div", 27);
            i0.ɵɵelement(59, "app-login-background", 28);
            i0.ɵɵelementStart(60, "div", 29)(61, "hlm-drawer", 30);
            i0.ɵɵlistener("stateChanged", function LoginBackgroundPicker_Template_hlm_drawer_stateChanged_61_listener($event) { return ctx.typeState.set($event); });
            i0.ɵɵelementStart(62, "button", 31);
            i0.ɵɵpipe(63, "t");
            i0.ɵɵpipe(64, "t");
            i0.ɵɵpipe(65, "t");
            i0.ɵɵpipe(66, "t");
            i0.ɵɵelement(67, "ng-icon", 32);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(68, LoginBackgroundPicker_hlm_drawer_content_68_Template, 16, 10, "hlm-drawer-content", 33);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(69, "hlm-drawer", 30);
            i0.ɵɵlistener("stateChanged", function LoginBackgroundPicker_Template_hlm_drawer_stateChanged_69_listener($event) { return ctx.presetState.set($event); });
            i0.ɵɵelementStart(70, "button", 34);
            i0.ɵɵpipe(71, "t");
            i0.ɵɵpipe(72, "t");
            i0.ɵɵelement(73, "ng-icon", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(74, LoginBackgroundPicker_hlm_drawer_content_74_Template, 16, 10, "hlm-drawer-content", 33);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(75, "p", 8);
            i0.ɵɵtext(76);
            i0.ɵɵpipe(77, "t");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 25, "loginBackground"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 27, "loginPreview"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 29, "themeControlPreview"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 31, "previewActive"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 33, "previewNew"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 35, "themeControlPreviewHelp"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 37, "previewName"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(26, 39, "previewNamePlaceholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 41, "previewRole"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("itemToString", ctx.roleLabel);
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(41, 43, "previewUpdates"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 45, "previewEnabled"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(51, 47, "previewPrimaryAction"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(54, 49, "previewSecondaryAction"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(57, 51, "previewOutlineAction"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("value", ctx.value());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.typeState());
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.disabled())("title", i0.ɵɵpipeBind1(63, 53, "gradientType") + ": " + i0.ɵɵpipeBind1(64, 55, ctx.selectedType().label));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(65, 57, "gradientType") + ": " + i0.ɵɵpipeBind1(66, 59, ctx.selectedType().label));
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("state", ctx.presetState());
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.disabled())("title", i0.ɵɵpipeBind1(71, 61, "gradientColorPreset") + ": " + ctx.selectedPreset().name);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(72, 63, "gradientColorPreset") + ": " + ctx.selectedPreset().name);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(77, 65, "loginBackgroundPreviewHelp"));
        } }, dependencies: [i1.HlmDrawer, i1.HlmDrawerBody, i1.HlmDrawerContent, i1.HlmDrawerDescription, i1.HlmDrawerHeader, i1.HlmDrawerPortal, i1.HlmDrawerTitle, i1.HlmDrawerTrigger, i2.HlmButton, i3.HlmBadge, i4.HlmCheckbox, i5.HlmInput, i6.HlmField, i6.HlmFieldLabel, i6.HlmFieldLegend, i6.HlmFieldSet, i6.HlmFieldTitle, i7.HlmSelect, i7.HlmSelectContent, i7.HlmSelectItem, i7.HlmSelectPortal, i7.HlmSelectTrigger, i7.HlmSelectValue, i8.HlmSwitch, NgIcon,
            LoginBackgroundArtwork,
            Translate], styles: [".presets[_ngcontent-%COMP%] {\n      display: grid;\n      grid-template-columns: repeat(2, minmax(0, 1fr));\n      gap: 1rem;\n    }\n    .preset[_ngcontent-%COMP%] {\n      position: relative;\n      display: grid;\n      gap: 0.5rem;\n      min-width: 0;\n      cursor: pointer;\n    }\n    .preset[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n      position: absolute;\n      opacity: 0;\n      inset: 0;\n      width: 100%;\n      height: 100%;\n      margin: 0;\n      z-index: 1;\n      cursor: inherit;\n    }\n    .thumbnail[_ngcontent-%COMP%] {\n      display: block;\n      aspect-ratio: 16 / 10;\n      overflow: hidden;\n      border: 2px solid var(--%NS%border);\n      border-radius: var(--%NS%radius);\n    }\n    .preset[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:checked    + .thumbnail[_ngcontent-%COMP%] {\n      border-color: var(--%NS%primary);\n      box-shadow: 0 0 0 2px var(--%NS%primary);\n    }\n    .preset[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus-visible    + .thumbnail[_ngcontent-%COMP%] {\n      outline: 3px solid var(--%NS%ring);\n      outline-offset: 4px;\n    }\n    .preset[_ngcontent-%COMP%]:has(input:disabled) {\n      opacity: 0.6;\n      cursor: default;\n    }\n    .name[_ngcontent-%COMP%] {\n      font-size: var(--%NS%text-sm);\n      font-weight: var(--%NS%font-weight-medium);\n    }\n    .preview[_ngcontent-%COMP%] {\n      display: grid;\n      overflow: hidden;\n      border: 1px solid var(--%NS%border);\n      border-radius: var(--%NS%radius);\n      background: var(--%NS%background);\n    }\n    .control-preview[_ngcontent-%COMP%] {\n      display: grid;\n      align-content: center;\n      gap: 1rem;\n      padding: 2rem;\n      min-width: 0;\n    }\n    .preview-artwork[_ngcontent-%COMP%] {\n      min-height: 22rem;\n      position: relative;\n    }\n    .preview-artwork[_ngcontent-%COMP%]   app-login-background[_ngcontent-%COMP%] {\n      position: absolute;\n      inset: 0;\n    }\n    @media (min-width: 40rem) {\n      .presets[_ngcontent-%COMP%] {\n        grid-template-columns: repeat(4, minmax(0, 1fr));\n      }\n      .preview[_ngcontent-%COMP%] {\n        grid-template-columns: 1fr 1fr;\n      }\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LoginBackgroundPicker, [{
        type: Component,
        args: [{ selector: 'app-login-background-picker', imports: [
                    HlmDrawerImports,
                    HlmButtonImports,
                    HlmBadgeImports,
                    HlmCheckboxImports,
                    HlmInputImports,
                    HlmFieldImports,
                    HlmSelectImports,
                    HlmSwitchImports,
                    NgIcon,
                    Translate,
                    LoginBackgroundArtwork,
                ], providers: [provideIcons({ lucideBlend, lucidePalette })], template: `
    <section class="grid gap-4" [attr.aria-label]="'loginBackground' | t">
      <h4 class="font-semibold">{{ 'loginPreview' | t }}</h4>
      <div class="preview" data-testid="login-preview">
        <div class="control-preview">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h5 class="text-xl font-semibold">{{ 'themeControlPreview' | t }}</h5>
              <span hlmBadge>{{ 'previewActive' | t }}</span>
              <span hlmBadge variant="secondary">{{ 'previewNew' | t }}</span>
            </div>
            <p class="text-sm text-muted-foreground">{{ 'themeControlPreviewHelp' | t }}</p>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="preview-name">{{ 'previewName' | t }}</label>
            <input
              hlmInput
              id="preview-name"
              type="text"
              [placeholder]="'previewNamePlaceholder' | t"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="preview-role">{{ 'previewRole' | t }}</label>
            <hlm-select value="administrator" [itemToString]="roleLabel">
              <hlm-select-trigger buttonId="preview-role" class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'previewRole' | t">
                <hlm-select-item value="administrator">{{
                  'previewAdministrator' | t
                }}</hlm-select-item>
                <hlm-select-item value="member">{{ 'previewMember' | t }}</hlm-select-item>
              </hlm-select-content>
            </hlm-select>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label hlmFieldLabel for="preview-updates" class="cursor-pointer">
              <div hlmField orientation="horizontal">
                <hlm-checkbox inputId="preview-updates" checked />
                <span hlmFieldTitle>{{ 'previewUpdates' | t }}</span>
              </div>
            </label>
            <label hlmFieldLabel for="preview-enabled" class="cursor-pointer">
              <div hlmField orientation="horizontal">
                <hlm-switch inputId="preview-enabled" checked />
                <span hlmFieldTitle>{{ 'previewEnabled' | t }}</span>
              </div>
            </label>
          </div>
          <div class="flex flex-wrap gap-2">
            <button hlmBtn type="button">{{ 'previewPrimaryAction' | t }}</button>
            <button hlmBtn variant="secondary" type="button">
              {{ 'previewSecondaryAction' | t }}
            </button>
            <button hlmBtn variant="outline" type="button">
              {{ 'previewOutlineAction' | t }}
            </button>
          </div>
        </div>
        <div class="preview-artwork">
          <app-login-background [value]="value()" />
          <div class="absolute top-3 right-3 flex gap-2">
            <hlm-drawer
              direction="right"
              [state]="typeState()"
              (stateChanged)="typeState.set($event)"
            >
              <button
                hlmBtn
                variant="secondary"
                size="icon-sm"
                type="button"
                hlmDrawerTrigger
                [disabled]="disabled()"
                [attr.aria-label]="('gradientType' | t) + ': ' + (selectedType().label | t)"
                [title]="('gradientType' | t) + ': ' + (selectedType().label | t)"
                data-testid="choose-gradient-type"
              >
                <ng-icon name="lucideBlend" aria-hidden="true" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-xl">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'gradientType' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'gradientDrawerHelp' | t }}</p>
                </hlm-drawer-header>
                <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                  <fieldset hlmFieldSet [disabled]="disabled()" data-testid="gradient-types">
                    <legend hlmFieldLegend>{{ 'gradientType' | t }}</legend>
                    <div class="presets">
                      @for (item of types; track item.id) {
                        <label class="preset">
                          <input
                            type="radio"
                            name="loginBackgroundType"
                            [value]="item.id"
                            [checked]="type() === item.id"
                            (click)="selectType(item.id)"
                          />
                          <span class="thumbnail" aria-hidden="true"
                            ><app-login-background [value]="item.preview" [thumbnail]="true"
                          /></span>
                          <span class="name">{{ item.label | t }}</span>
                        </label>
                      }
                    </div>
                  </fieldset>
                </div>
              </hlm-drawer-content>
            </hlm-drawer>
            <hlm-drawer
              direction="right"
              [state]="presetState()"
              (stateChanged)="presetState.set($event)"
            >
              <button
                hlmBtn
                variant="secondary"
                size="icon-sm"
                type="button"
                hlmDrawerTrigger
                [disabled]="disabled()"
                [attr.aria-label]="('gradientColorPreset' | t) + ': ' + selectedPreset().name"
                [title]="('gradientColorPreset' | t) + ': ' + selectedPreset().name"
                data-testid="choose-gradient-preset"
              >
                <ng-icon name="lucidePalette" aria-hidden="true" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-xl">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'gradientColorPreset' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'gradientDrawerHelp' | t }}</p>
                </hlm-drawer-header>
                <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                  <fieldset hlmFieldSet [disabled]="disabled()" data-testid="gradient-presets">
                    <legend hlmFieldLegend>{{ 'gradientColorPreset' | t }}</legend>
                    <div class="presets">
                      @for (preset of presets(); track preset.id) {
                        <label class="preset">
                          <input
                            type="radio"
                            name="loginBackground"
                            [value]="preset.id"
                            [checked]="value() === preset.id"
                            (click)="selectColorPreset(preset.id)"
                          />
                          <span class="thumbnail" aria-hidden="true"
                            ><app-login-background [value]="preset.id" [thumbnail]="true"
                          /></span>
                          <span class="name">{{ preset.name }}</span>
                        </label>
                      }
                    </div>
                  </fieldset>
                </div>
              </hlm-drawer-content>
            </hlm-drawer>
          </div>
        </div>
      </div>
      <p class="text-sm text-muted-foreground">{{ 'loginBackgroundPreviewHelp' | t }}</p>
    </section>
  `, styles: ["\n    .presets {\n      display: grid;\n      grid-template-columns: repeat(2, minmax(0, 1fr));\n      gap: 1rem;\n    }\n    .preset {\n      position: relative;\n      display: grid;\n      gap: 0.5rem;\n      min-width: 0;\n      cursor: pointer;\n    }\n    .preset input {\n      position: absolute;\n      opacity: 0;\n      inset: 0;\n      width: 100%;\n      height: 100%;\n      margin: 0;\n      z-index: 1;\n      cursor: inherit;\n    }\n    .thumbnail {\n      display: block;\n      aspect-ratio: 16 / 10;\n      overflow: hidden;\n      border: 2px solid var(--border);\n      border-radius: var(--radius);\n    }\n    .preset input:checked + .thumbnail {\n      border-color: var(--primary);\n      box-shadow: 0 0 0 2px var(--primary);\n    }\n    .preset input:focus-visible + .thumbnail {\n      outline: 3px solid var(--ring);\n      outline-offset: 4px;\n    }\n    .preset:has(input:disabled) {\n      opacity: 0.6;\n      cursor: default;\n    }\n    .name {\n      font-size: var(--text-sm);\n      font-weight: var(--font-weight-medium);\n    }\n    .preview {\n      display: grid;\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--background);\n    }\n    .control-preview {\n      display: grid;\n      align-content: center;\n      gap: 1rem;\n      padding: 2rem;\n      min-width: 0;\n    }\n    .preview-artwork {\n      min-height: 22rem;\n      position: relative;\n    }\n    .preview-artwork app-login-background {\n      position: absolute;\n      inset: 0;\n    }\n    @media (min-width: 40rem) {\n      .presets {\n        grid-template-columns: repeat(4, minmax(0, 1fr));\n      }\n      .preview {\n        grid-template-columns: 1fr 1fr;\n      }\n    }\n  "] }]
    }], null, { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LoginBackgroundPicker, { className: "LoginBackgroundPicker", filePath: "src/app/shared/login-background-picker.ts", lineNumber: 273 }); })();
