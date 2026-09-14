import { Component, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAccessibility, lucideALargeSmall, lucideContrast, lucideLanguages, lucideRows3, lucideSunMoon, } from '@ng-icons/lucide';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { Auth } from './auth';
import { I18n, Translate } from './i18n';
import { Runtime } from './runtime';
import { Theme } from './theme';
import { UiPreferences } from './ui-preferences';
import { UiSounds } from './ui-sounds';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/field";
import * as i2 from "@spartan-ng/helm/select";
import * as i3 from "@spartan-ng/helm/toggle-group";
import * as i4 from "@spartan-ng/helm/switch";
function Preferences_Conditional_0_hlm_select_content_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 8);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "hlm-select-item", 9);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "hlm-select-item", 10);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "hlm-select-item", 11);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 4, "theme"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 6, "themeSystem"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 8, "themeLight"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 10, "themeDark"));
} }
function Preferences_Conditional_0_hlm_select_content_14_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const culture_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", culture_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.cultureLabel(culture_r3));
} }
function Preferences_Conditional_0_hlm_select_content_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 8);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, Preferences_Conditional_0_hlm_select_content_14_For_3_Template, 2, 2, "hlm-select-item", 12, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "culture"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.runtime.supportedCultures);
} }
function Preferences_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 0)(1, "label", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "hlm-select", 3);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_0_Template_hlm_select_valueChange_4_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.theme.set($event)); });
    i0.ɵɵelementStart(5, "hlm-select-trigger", 4);
    i0.ɵɵelement(6, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, Preferences_Conditional_0_hlm_select_content_7_Template, 11, 12, "hlm-select-content", 5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "label", 6);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "hlm-select", 3);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_0_Template_hlm_select_valueChange_11_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.language($event)); });
    i0.ɵɵelementStart(12, "hlm-select-trigger", 7);
    i0.ɵɵelement(13, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(14, Preferences_Conditional_0_hlm_select_content_14_Template, 4, 3, "hlm-select-content", 5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, "theme"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.theme.preference())("itemToString", ctx_r1.themeLabel);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 8, "culture"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.i18n.culture())("itemToString", ctx_r1.cultureLabel);
} }
function Preferences_Conditional_1_hlm_select_content_24_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const culture_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", culture_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.cultureLabel(culture_r5));
} }
function Preferences_Conditional_1_hlm_select_content_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 8);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, Preferences_Conditional_1_hlm_select_content_24_For_3_Template, 2, 2, "hlm-select-item", 12, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("ariaLabel", i0.ɵɵpipeBind1(1, 1, "culture"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.runtime.supportedCultures);
} }
function Preferences_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 1)(1, "div", 13)(2, "span", 14);
    i0.ɵɵelement(3, "ng-icon", 15);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "hlm-toggle-group", 16);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_1_Template_hlm_toggle_group_valueChange_6_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.theme.set(ctx_r1.singleValue($event))); });
    i0.ɵɵelementStart(7, "button", 17);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 18);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 19);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "div", 13)(17, "label", 20);
    i0.ɵɵelement(18, "ng-icon", 21);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "hlm-select", 22);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_1_Template_hlm_select_valueChange_21_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.language($event)); });
    i0.ɵɵelementStart(22, "hlm-select-trigger", 23);
    i0.ɵɵelement(23, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(24, Preferences_Conditional_1_hlm_select_content_24_Template, 4, 3, "hlm-select-content", 5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div", 13)(26, "span", 14);
    i0.ɵɵelement(27, "ng-icon", 24);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "hlm-toggle-group", 16);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_1_Template_hlm_toggle_group_valueChange_30_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.ui.setTextSize(ctx_r1.singleValue($event))); });
    i0.ɵɵelementStart(31, "button", 25);
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "button", 26);
    i0.ɵɵtext(35);
    i0.ɵɵpipe(36, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "button", 27);
    i0.ɵɵtext(38);
    i0.ɵɵpipe(39, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(40, "div", 13)(41, "span", 14);
    i0.ɵɵelement(42, "ng-icon", 28);
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "hlm-toggle-group", 29);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_1_Template_hlm_toggle_group_valueChange_45_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.ui.setContrast(ctx_r1.singleValue($event))); });
    i0.ɵɵelementStart(46, "button", 30);
    i0.ɵɵtext(47);
    i0.ɵɵpipe(48, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "button", 31);
    i0.ɵɵtext(50);
    i0.ɵɵpipe(51, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(52, "div", 13)(53, "span", 14);
    i0.ɵɵelement(54, "ng-icon", 32);
    i0.ɵɵtext(55);
    i0.ɵɵpipe(56, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "hlm-toggle-group", 29);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_1_Template_hlm_toggle_group_valueChange_57_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.ui.setMotion(ctx_r1.singleValue($event))); });
    i0.ɵɵelementStart(58, "button", 17);
    i0.ɵɵtext(59);
    i0.ɵɵpipe(60, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(61, "button", 33);
    i0.ɵɵtext(62);
    i0.ɵɵpipe(63, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(64, "p", 34);
    i0.ɵɵtext(65);
    i0.ɵɵpipe(66, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(67, "div", 13)(68, "span", 14);
    i0.ɵɵelement(69, "ng-icon", 35);
    i0.ɵɵtext(70);
    i0.ɵɵpipe(71, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(72, "hlm-toggle-group", 29);
    i0.ɵɵlistener("valueChange", function Preferences_Conditional_1_Template_hlm_toggle_group_valueChange_72_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.ui.setDensity(ctx_r1.singleValue($event))); });
    i0.ɵɵelementStart(73, "button", 36);
    i0.ɵɵtext(74);
    i0.ɵɵpipe(75, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(76, "button", 37);
    i0.ɵɵtext(77);
    i0.ɵɵpipe(78, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(79, "label", 38)(80, "div", 39)(81, "div", 40)(82, "span", 41);
    i0.ɵɵtext(83);
    i0.ɵɵpipe(84, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(85, "p", 42);
    i0.ɵɵtext(86);
    i0.ɵɵpipe(87, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(88, "hlm-switch", 43);
    i0.ɵɵlistener("checkedChange", function Preferences_Conditional_1_Template_hlm_switch_checkedChange_88_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.sounds.setMuted($event)); });
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 29, "theme"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.theme.preference());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 31, "system"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 33, "light"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 35, "dark"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 37, "culture"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.i18n.culture())("itemToString", ctx_r1.cultureLabel);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(29, 39, "textSize"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.ui.textSize());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 41, "default"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 43, "large"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(39, 45, "extraLarge"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(44, 47, "contrast"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.ui.contrast());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(48, 49, "standard"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(51, 51, "high"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(56, 53, "motion"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.ui.motion());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(60, 55, "system"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(63, 57, "reduced"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(66, 59, "motionHelp"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(71, 61, "interfaceDensity"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.ui.density());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(75, 63, "comfortable"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(78, 65, "compact"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(84, 67, "muteSounds"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(87, 69, "muteSoundsHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.sounds.muted());
} }
export class Preferences {
    expanded = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "expanded" }] : /* istanbul ignore next */ []));
    auth = inject(Auth);
    runtime = inject(Runtime);
    i18n = inject(I18n);
    theme = inject(Theme);
    ui = inject(UiPreferences);
    sounds = inject(UiSounds);
    sidebar = inject(HlmSidebarService);
    resetting = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resetting" }] : /* istanbul ignore next */ []));
    themeLabel = (preference) => this.i18n.text(preference === 'light' ? 'themeLight' : preference === 'dark' ? 'themeDark' : 'themeSystem');
    cultureLabel = (culture) => (culture === 'af-ZA' ? 'Afrikaans' : 'English');
    singleValue = (value) => Array.isArray(value) ? value[0] : value;
    async language(culture) {
        if (!culture)
            return;
        if (this.auth.access())
            await this.auth.action('culture', { culture });
        this.i18n.set(culture);
    }
    async reset() {
        if (this.resetting())
            return;
        this.resetting.set(true);
        try {
            this.theme.set('system');
            this.ui.reset();
            this.sounds.reset();
            this.sidebar.reset();
            await this.language(this.runtime.defaultCulture);
        }
        finally {
            this.resetting.set(false);
        }
    }
    static ɵfac = function Preferences_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Preferences)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: Preferences, selectors: [["app-preferences"]], inputs: { expanded: [1, "expanded"] }, features: [i0.ɵɵProvidersFeature([
                provideIcons({
                    lucideAccessibility,
                    lucideALargeSmall,
                    lucideContrast,
                    lucideLanguages,
                    lucideRows3,
                    lucideSunMoon,
                }),
            ])], decls: 2, vars: 1, consts: [[1, "preferences"], [1, "flex", "flex-col", "gap-5"], ["for", "theme", 1, "sr-only"], [3, "valueChange", "value", "itemToString"], ["buttonId", "theme", 1, "w-40"], [3, "ariaLabel", 4, "hlmSelectPortal"], ["for", "language", 1, "sr-only"], ["buttonId", "language", 1, "w-32"], [3, "ariaLabel"], ["value", "system"], ["value", "light"], ["value", "dark"], [3, "value"], ["hlmField", ""], ["hlmFieldLabel", ""], ["name", "lucideSunMoon", "aria-hidden", "true"], ["type", "single", "variant", "inset", 1, "grid", "w-full", "grid-cols-3", 3, "valueChange", "value"], ["hlmToggleGroupItem", "", "value", "system"], ["hlmToggleGroupItem", "", "value", "light"], ["hlmToggleGroupItem", "", "value", "dark"], ["hlmFieldLabel", "", "for", "settings-language"], ["name", "lucideLanguages", "aria-hidden", "true"], [1, "w-full", 3, "valueChange", "value", "itemToString"], ["buttonId", "settings-language", 1, "w-full"], ["name", "lucideALargeSmall", "aria-hidden", "true"], ["hlmToggleGroupItem", "", "value", "default"], ["hlmToggleGroupItem", "", "value", "large"], ["hlmToggleGroupItem", "", "value", "extra-large"], ["name", "lucideContrast", "aria-hidden", "true"], ["type", "single", "variant", "inset", 1, "grid", "w-full", "grid-cols-2", 3, "valueChange", "value"], ["hlmToggleGroupItem", "", "value", "standard"], ["hlmToggleGroupItem", "", "value", "high"], ["name", "lucideAccessibility", "aria-hidden", "true"], ["hlmToggleGroupItem", "", "value", "reduced"], ["hlmFieldDescription", ""], ["name", "lucideRows3", "aria-hidden", "true"], ["hlmToggleGroupItem", "", "value", "comfortable"], ["hlmToggleGroupItem", "", "value", "compact"], ["hlmFieldLabel", "", "for", "settings-mute-sounds", 1, "cursor-pointer"], ["hlmField", "", "orientation", "horizontal"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""], ["hlmFieldDescription", "", "id", "settings-mute-sounds-help"], ["inputId", "settings-mute-sounds", "aria-describedby", "settings-mute-sounds-help", 3, "checkedChange", "checked"]], template: function Preferences_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, Preferences_Conditional_0_Template, 15, 10, "div", 0)(1, Preferences_Conditional_1_Template, 89, 71, "div", 1);
        } if (rf & 2) {
            i0.ɵɵconditional(!ctx.expanded() ? 0 : 1);
        } }, dependencies: [NgIcon, i1.HlmField, i1.HlmFieldContent, i1.HlmFieldDescription, i1.HlmFieldLabel, i1.HlmFieldTitle, i2.HlmSelect, i2.HlmSelectContent, i2.HlmSelectItem, i2.HlmSelectPortal, i2.HlmSelectTrigger, i2.HlmSelectValue, i3.HlmToggleGroup, i3.HlmToggleGroupItem, i4.HlmSwitch, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Preferences, [{
        type: Component,
        args: [{
                selector: 'app-preferences',
                imports: [
                    NgIcon,
                    HlmFieldImports,
                    HlmSelectImports,
                    HlmToggleGroupImports,
                    HlmSwitchImports,
                    Translate,
                ],
                providers: [
                    provideIcons({
                        lucideAccessibility,
                        lucideALargeSmall,
                        lucideContrast,
                        lucideLanguages,
                        lucideRows3,
                        lucideSunMoon,
                    }),
                ],
                template: `
    @if (!expanded()) {
      <div class="preferences">
        <label class="sr-only" for="theme">{{ 'theme' | t }}</label>
        <hlm-select
          [value]="theme.preference()"
          [itemToString]="themeLabel"
          (valueChange)="theme.set($event)"
        >
          <hlm-select-trigger buttonId="theme" class="w-40">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content *hlmSelectPortal [ariaLabel]="'theme' | t">
            <hlm-select-item value="system">{{ 'themeSystem' | t }}</hlm-select-item>
            <hlm-select-item value="light">{{ 'themeLight' | t }}</hlm-select-item>
            <hlm-select-item value="dark">{{ 'themeDark' | t }}</hlm-select-item>
          </hlm-select-content>
        </hlm-select>

        <label class="sr-only" for="language">{{ 'culture' | t }}</label>
        <hlm-select
          [value]="i18n.culture()"
          [itemToString]="cultureLabel"
          (valueChange)="language($event)"
        >
          <hlm-select-trigger buttonId="language" class="w-32">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
            @for (culture of runtime.supportedCultures; track culture) {
              <hlm-select-item [value]="culture">{{ cultureLabel(culture) }}</hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>
      </div>
    } @else {
      <div class="flex flex-col gap-5">
        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideSunMoon" aria-hidden="true" />
            {{ 'theme' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="inset"
            class="grid w-full grid-cols-3"
            [value]="theme.preference()"
            (valueChange)="theme.set(singleValue($event))"
          >
            <button hlmToggleGroupItem value="system">{{ 'system' | t }}</button>
            <button hlmToggleGroupItem value="light">{{ 'light' | t }}</button>
            <button hlmToggleGroupItem value="dark">{{ 'dark' | t }}</button>
          </hlm-toggle-group>
        </div>

        <div hlmField>
          <label hlmFieldLabel for="settings-language">
            <ng-icon name="lucideLanguages" aria-hidden="true" />
            {{ 'culture' | t }}
          </label>
          <hlm-select
            class="w-full"
            [value]="i18n.culture()"
            [itemToString]="cultureLabel"
            (valueChange)="language($event)"
          >
            <hlm-select-trigger buttonId="settings-language" class="w-full">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
              @for (culture of runtime.supportedCultures; track culture) {
                <hlm-select-item [value]="culture">{{ cultureLabel(culture) }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideALargeSmall" aria-hidden="true" />
            {{ 'textSize' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="inset"
            class="grid w-full grid-cols-3"
            [value]="ui.textSize()"
            (valueChange)="ui.setTextSize(singleValue($event))"
          >
            <button hlmToggleGroupItem value="default">{{ 'default' | t }}</button>
            <button hlmToggleGroupItem value="large">{{ 'large' | t }}</button>
            <button hlmToggleGroupItem value="extra-large">{{ 'extraLarge' | t }}</button>
          </hlm-toggle-group>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideContrast" aria-hidden="true" />
            {{ 'contrast' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="inset"
            class="grid w-full grid-cols-2"
            [value]="ui.contrast()"
            (valueChange)="ui.setContrast(singleValue($event))"
          >
            <button hlmToggleGroupItem value="standard">{{ 'standard' | t }}</button>
            <button hlmToggleGroupItem value="high">{{ 'high' | t }}</button>
          </hlm-toggle-group>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideAccessibility" aria-hidden="true" />
            {{ 'motion' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="inset"
            class="grid w-full grid-cols-2"
            [value]="ui.motion()"
            (valueChange)="ui.setMotion(singleValue($event))"
          >
            <button hlmToggleGroupItem value="system">{{ 'system' | t }}</button>
            <button hlmToggleGroupItem value="reduced">{{ 'reduced' | t }}</button>
          </hlm-toggle-group>
          <p hlmFieldDescription>{{ 'motionHelp' | t }}</p>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideRows3" aria-hidden="true" />
            {{ 'interfaceDensity' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="inset"
            class="grid w-full grid-cols-2"
            [value]="ui.density()"
            (valueChange)="ui.setDensity(singleValue($event))"
          >
            <button hlmToggleGroupItem value="comfortable">{{ 'comfortable' | t }}</button>
            <button hlmToggleGroupItem value="compact">{{ 'compact' | t }}</button>
          </hlm-toggle-group>
        </div>

        <label hlmFieldLabel for="settings-mute-sounds" class="cursor-pointer">
          <div hlmField orientation="horizontal">
            <div hlmFieldContent>
              <span hlmFieldTitle>{{ 'muteSounds' | t }}</span>
              <p hlmFieldDescription id="settings-mute-sounds-help">{{ 'muteSoundsHelp' | t }}</p>
            </div>
            <hlm-switch
              inputId="settings-mute-sounds"
              [checked]="sounds.muted()"
              (checkedChange)="sounds.setMuted($event)"
              aria-describedby="settings-mute-sounds-help"
            />
          </div>
        </label>
      </div>
    }
  `,
            }]
    }], null, { expanded: [{ type: i0.Input, args: [{ isSignal: true, alias: "expanded", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(Preferences, { className: "Preferences", filePath: "src/app/core/preferences.ts", lineNumber: 208 }); })();
