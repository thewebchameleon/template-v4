import { Component, computed, inject, signal, viewChild, ElementRef, Injector, afterNextRender, } from '@angular/core';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { CustomColorEditor } from '../shared/custom-color-editor';
import { DEFAULT_PRIMARY_COLOR, validPrimaryColor } from '../core/brand-palette';
import { PlatformAppearanceTheme } from '../core/platform-appearance';
import { LoginBackgroundPicker } from '../shared/login-background-picker';
import { DEFAULT_LOGIN_BACKGROUND, loginBackground } from '../core/login-backgrounds';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@ng-icons/core";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/spinner";
import * as i8 from "@spartan-ng/helm/toggle-group";
import * as i9 from "../core/i18n";
const _c0 = ["addColor"];
const _forTrack0 = ($index, $item) => $item.color;
const _forTrack1 = ($index, $item) => $item.id;
function ConfigurationPage_For_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵelement(1, "span", 24);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const preset_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", preset_r2.color);
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("background-color", preset_r2.color);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 4, preset_r2.label), " ");
} }
function ConfigurationPage_For_30_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 17)(1, "button", 25);
    i0.ɵɵlistener("click", function ConfigurationPage_For_30_Template_button_click_1_listener() { const item_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.selectCustom(item_r4)); });
    i0.ɵɵelement(2, "span", 26);
    i0.ɵɵelementStart(3, "span", 27);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "app-custom-color-editor", 28);
    i0.ɵɵlistener("changed", function ConfigurationPage_For_30_Template_app_custom_color_editor_changed_5_listener($event) { const item_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.upsertCustom($event, item_r4.id)); })("preview", function ConfigurationPage_For_30_Template_app_custom_color_editor_preview_5_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.preview($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 29);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵpipe(8, "t");
    i0.ɵɵlistener("click", function ConfigurationPage_For_30_Template_button_click_6_listener() { const item_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.removeCustom(item_r4.id)); });
    i0.ɵɵelement(9, "ng-icon", 30);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("variant", ctx_r4.selectedId() === item_r4.id ? "default" : "outline")("disabled", ctx_r4.busy() || ctx_r4.data.refreshing())("title", item_r4.name);
    i0.ɵɵattribute("aria-pressed", ctx_r4.selectedId() === item_r4.id);
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("background-color", item_r4.color);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r4.name);
    i0.ɵɵadvance();
    i0.ɵɵproperty("item", item_r4)("usedNames", ctx_r4.otherNames(item_r4.id))("disabled", ctx_r4.busy() || ctx_r4.data.refreshing());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r4.busy() || ctx_r4.data.refreshing())("title", i0.ɵɵpipeBind1(7, 13, "removeCustomColor") + ": " + item_r4.name);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 15, "removeCustomColor") + ": " + item_r4.name);
} }
function ConfigurationPage_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "noCustomColors"));
} }
function ConfigurationPage_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function ConfigurationPage_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 31);
    i0.ɵɵlistener("click", function ConfigurationPage_Conditional_43_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.reload()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r4.busy() || ctx_r4.data.refreshing());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "undoChanges"), " ");
} }
export class ConfigurationPage {
    api = inject(WorkspaceApi);
    appearance = inject(PlatformAppearanceTheme);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    injector = inject(Injector);
    addColor = viewChild('addColor', { ...(ngDevMode ? { debugName: "addColor" } : /* istanbul ignore next */ {}), read: ElementRef });
    savedColor = null;
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    color = signal(DEFAULT_PRIMARY_COLOR, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    background = signal(DEFAULT_LOGIN_BACKGROUND, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "background" }] : /* istanbul ignore next */ []));
    customColors = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "customColors" }] : /* istanbul ignore next */ []));
    selectedId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedId" }] : /* istanbul ignore next */ []));
    previewColor = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "previewColor" }] : /* istanbul ignore next */ []));
    removalNotice = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "removalNotice" }] : /* istanbul ignore next */ []));
    defaultColor = DEFAULT_PRIMARY_COLOR;
    valid = computed(() => validPrimaryColor(this.color()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "valid" }] : /* istanbul ignore next */ []));
    presets = [
        { color: '#2563EB', label: 'colorBlue' },
        { color: '#7C3AED', label: 'colorViolet' },
        { color: '#C026D3', label: 'colorMagenta' },
        { color: '#EA580C', label: 'colorOrange' },
        { color: '#059669', label: 'colorEmerald' },
        { color: '#0891B2', label: 'colorCyan' },
        { color: '#65A30D', label: 'colorLime' },
        { color: '#EAB308', label: 'colorYellow' },
        { color: '#DC2626', label: 'colorRed' },
    ];
    ngOnInit() {
        void this.load();
    }
    ngOnDestroy() {
        if (this.savedColor)
            this.appearance.apply(this.savedColor);
    }
    selectPreset(value) {
        if (typeof value === 'string' && validPrimaryColor(value)) {
            this.color.set(value);
            this.selectedId.set(null);
            this.appearance.apply(value);
        }
    }
    selectCustom(item) {
        this.color.set(item.color);
        this.selectedId.set(item.id);
        this.appearance.apply(item.color);
    }
    preview(value) {
        this.previewColor.set(value);
        this.appearance.apply(value ?? this.color());
    }
    otherNames(except) {
        return this.customColors()
            .filter((item) => item.id !== except)
            .map((item) => item.name);
    }
    upsertCustom(value, id) {
        if (this.busy() || this.data.refreshing() || (!id && this.customColors().length >= 24))
            return;
        const item = { ...value, id: id ?? crypto.randomUUID() };
        this.customColors.update((items) => id ? items.map((existing) => (existing.id === id ? item : existing)) : [...items, item]);
        this.selectCustom(item);
        this.removalNotice.set('');
    }
    async removeCustom(id) {
        if (this.busy() || this.data.refreshing())
            return;
        const item = this.customColors().find((color) => color.id === id);
        if (!item ||
            !(await this.confirm.ask('removeCustomColorTitle', 'removeCustomColorHelp', item.name, true, 'removeCustomColor')))
            return;
        const active = this.selectedId() === id;
        this.customColors.update((items) => items.filter((item) => item.id !== id));
        if (active)
            this.selectPreset(this.defaultColor);
        this.removalNotice.set(active ? 'activeCustomColorRemoved' : 'customColorRemoved');
        afterNextRender(() => this.addColor()?.nativeElement.querySelector('button')?.focus(), {
            injector: this.injector,
        });
    }
    hasUnsavedChanges() {
        return (this.data.value() !== null &&
            (this.color().toUpperCase() !== this.data.value().primaryColor.toUpperCase() ||
                this.background() !== loginBackground(this.data.value().loginBackground).id ||
                this.selectedId() !== (this.data.value().selectedCustomColorId ?? null) ||
                JSON.stringify(this.customColors()) !==
                    JSON.stringify(this.data.value().customColors ?? [])));
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    async load() {
        const loaded = await this.data.load((signal) => this.api.get('configuration/appearance', {}, signal));
        if (loaded) {
            this.accept(this.data.value());
            this.removalNotice.set('');
        }
        return loaded;
    }
    accept(value) {
        this.background.set(loginBackground(value.loginBackground).id);
        this.appearance.loginBackground.set(this.background());
        this.savedColor = value.primaryColor;
        this.color.set(value.primaryColor);
        this.customColors.set(value.customColors ?? []);
        this.selectedId.set(value.selectedCustomColorId ?? null);
        this.appearance.apply(value.primaryColor);
    }
    async reload() {
        if (this.busy() || this.data.refreshing())
            return;
        if (!this.hasUnsavedChanges() ||
            (await this.confirm.ask('undoChangesTitle', 'undoChangesHelp', '', true, 'undoChanges')))
            await this.load();
    }
    async save() {
        if (this.busy() || this.data.refreshing() || !this.valid() || !this.hasUnsavedChanges())
            return;
        this.busy.set(true);
        try {
            const saved = await this.api.post('configuration/appearance', {
                primaryColor: this.color().toUpperCase(),
                version: this.data.value().version,
                customColors: this.customColors(),
                selectedCustomColorId: this.selectedId(),
                loginBackground: this.background(),
            });
            this.data.value.set(saved);
            this.accept(saved);
            this.toast.success('appearanceSaved');
        }
        catch {
            /* Central errors retain the draft, including stale-version conflicts. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function ConfigurationPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ConfigurationPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ConfigurationPage, selectors: [["app-configuration"]], viewQuery: function ConfigurationPage_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.addColor, _c0, 5, ElementRef);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostBindings: function ConfigurationPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function ConfigurationPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucidePencil, lucideTrash2 })])], decls: 44, vars: 44, consts: [["addColor", ""], ["title", "configuration", "description", "configurationHelp"], [3, "retry", "state", "refreshing", "refreshError"], [3, "ngSubmit"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "grid", "gap-6"], ["hlmFieldSet", "", 3, "disabled"], ["hlmFieldLegend", ""], ["type", "single", 1, "flex-wrap", 3, "valueChange", "value", "nullable", "disabled", "spacing"], ["hlmToggleGroupItem", "", "type", "button", 3, "value"], ["aria-labelledby", "custom-colors-title", 1, "grid", "gap-3"], ["id", "custom-colors-title", 1, "font-semibold"], [1, "text-muted-foreground", "text-sm"], ["role", "group", 1, "flex", "flex-wrap", "items-center", "gap-3"], [1, "flex", "max-w-full", "flex-wrap", "items-center", "gap-2", "rounded-md", "border", "border-border", "p-2"], [3, "changed", "preview", "initialColor", "usedNames", "disabled"], ["role", "status", "aria-live", "polite", 1, "text-sm"], [3, "valueChange", "value", "disabled"], ["hlmCardFooter", "", 1, "flex-wrap", "gap-2"], ["hlmBtn", "", "type", "submit", 3, "disabled"], ["hlmBtn", "", "variant", "destructive", "type", "button", 3, "disabled"], ["aria-hidden", "true", 1, "size-4", "rounded-full", "border", "border-current"], ["hlmBtn", "", "type", "button", 3, "click", "variant", "disabled", "title"], ["aria-hidden", "true", 1, "size-4", "shrink-0", "rounded-full", "border", "border-current"], [1, "max-w-40", "truncate"], [3, "changed", "preview", "item", "usedNames", "disabled"], ["hlmBtn", "", "variant", "destructive", "size", "icon-sm", "type", "button", 3, "click", "disabled", "title"], ["name", "lucideTrash2", "aria-hidden", "true"], ["hlmBtn", "", "variant", "destructive", "type", "button", 3, "click", "disabled"]], template: function ConfigurationPage_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelement(0, "app-page-header", 1);
            i0.ɵɵelementStart(1, "app-page-state", 2);
            i0.ɵɵlistener("retry", function ConfigurationPage_Template_app_page_state_retry_1_listener() { return ctx.reload(); });
            i0.ɵɵelementStart(2, "form", 3);
            i0.ɵɵlistener("ngSubmit", function ConfigurationPage_Template_form_ngSubmit_2_listener() { return ctx.save(); });
            i0.ɵɵelementStart(3, "section", 4)(4, "div", 5)(5, "h2", 6);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p", 7);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "div", 8)(12, "fieldset", 9)(13, "legend", 10);
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "hlm-toggle-group", 11);
            i0.ɵɵpipe(17, "t");
            i0.ɵɵlistener("valueChange", function ConfigurationPage_Template_hlm_toggle_group_valueChange_16_listener($event) { return ctx.selectPreset($event); });
            i0.ɵɵrepeaterCreate(18, ConfigurationPage_For_19_Template, 4, 6, "button", 12, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(20, "section", 13)(21, "h3", 14);
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "p", 15);
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "div", 16);
            i0.ɵɵpipe(28, "t");
            i0.ɵɵrepeaterCreate(29, ConfigurationPage_For_30_Template, 10, 17, "div", 17, _forTrack1);
            i0.ɵɵelementStart(31, "app-custom-color-editor", 18, 0);
            i0.ɵɵlistener("changed", function ConfigurationPage_Template_app_custom_color_editor_changed_31_listener($event) { return ctx.upsertCustom($event); })("preview", function ConfigurationPage_Template_app_custom_color_editor_preview_31_listener($event) { return ctx.preview($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(33, ConfigurationPage_Conditional_33_Template, 3, 3, "p", 15);
            i0.ɵɵelementStart(34, "p", 19);
            i0.ɵɵtext(35);
            i0.ɵɵpipe(36, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(37, "app-login-background-picker", 20);
            i0.ɵɵtwoWayListener("valueChange", function ConfigurationPage_Template_app_login_background_picker_valueChange_37_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.background, $event) || (ctx.background = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(38, "div", 21)(39, "button", 22);
            i0.ɵɵconditionalCreate(40, ConfigurationPage_Conditional_40_Template, 1, 0, "hlm-spinner");
            i0.ɵɵtext(41);
            i0.ɵɵpipe(42, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(43, ConfigurationPage_Conditional_43_Template, 3, 4, "button", 23);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshing", ctx.data.refreshing())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 26, "platformAppearance"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 28, "platformAppearanceHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy() || ctx.data.refreshing());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 30, "primaryColor"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.selectedId() ? "" : ctx.color().toUpperCase())("nullable", false)("disabled", ctx.busy() || ctx.data.refreshing())("spacing", 2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(17, 32, "colorPresets"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.presets);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 34, "customColors"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 36, "customColorsHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(28, 38, "customColors"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.customColors());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("initialColor", ctx.color())("usedNames", ctx.otherNames())("disabled", ctx.busy() || ctx.data.refreshing() || ctx.customColors().length >= 24);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.customColors().length ? 33 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 40, ctx.removalNotice()));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("value", ctx.background);
            i0.ɵɵproperty("disabled", ctx.busy() || ctx.data.refreshing());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || ctx.data.refreshing() || !ctx.valid() || !ctx.hasUnsavedChanges());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.busy() ? 40 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(42, 42, "save"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.hasUnsavedChanges() ? 43 : -1);
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.NgControlStatusGroup, i2.NgForm, i3.NgIcon, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardFooter, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmFieldLegend, i6.HlmFieldSet, i7.HlmSpinner, i8.HlmToggleGroup, i8.HlmToggleGroupItem, CustomColorEditor, LoginBackgroundPicker, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ConfigurationPage, [{
        type: Component,
        args: [{
                selector: 'app-configuration',
                imports: [WorkspaceUi, HlmToggleGroupImports, CustomColorEditor, LoginBackgroundPicker],
                providers: [provideIcons({ lucidePencil, lucideTrash2 })],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: ` <app-page-header title="configuration" description="configurationHelp" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="reload()"
    >
      <form (ngSubmit)="save()">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'platformAppearance' | t }}</h2>
            <p hlmCardDescription>{{ 'platformAppearanceHelp' | t }}</p>
          </div>
          <div hlmCardContent class="grid gap-6">
            <fieldset hlmFieldSet [disabled]="busy() || data.refreshing()">
              <legend hlmFieldLegend>{{ 'primaryColor' | t }}</legend>
              <hlm-toggle-group
                type="single"
                [value]="selectedId() ? '' : color().toUpperCase()"
                [nullable]="false"
                [disabled]="busy() || data.refreshing()"
                (valueChange)="selectPreset($event)"
                class="flex-wrap"
                [spacing]="2"
                [attr.aria-label]="'colorPresets' | t"
              >
                @for (preset of presets; track preset.color) {
                  <button hlmToggleGroupItem type="button" [value]="preset.color">
                    <span
                      class="size-4 rounded-full border border-current"
                      [style.background-color]="preset.color"
                      aria-hidden="true"
                    ></span>
                    {{ preset.label | t }}
                  </button>
                }
              </hlm-toggle-group>
            </fieldset>
            <section aria-labelledby="custom-colors-title" class="grid gap-3">
              <h3 id="custom-colors-title" class="font-semibold">{{ 'customColors' | t }}</h3>
              <p class="text-muted-foreground text-sm">{{ 'customColorsHelp' | t }}</p>
              <div
                class="flex flex-wrap items-center gap-3"
                role="group"
                [attr.aria-label]="'customColors' | t"
              >
                @for (item of customColors(); track item.id) {
                  <div
                    class="flex max-w-full flex-wrap items-center gap-2 rounded-md border border-border p-2"
                  >
                    <button
                      hlmBtn
                      type="button"
                      [variant]="selectedId() === item.id ? 'default' : 'outline'"
                      [disabled]="busy() || data.refreshing()"
                      [attr.aria-pressed]="selectedId() === item.id"
                      (click)="selectCustom(item)"
                      [title]="item.name"
                    >
                      <span
                        class="size-4 shrink-0 rounded-full border border-current"
                        [style.background-color]="item.color"
                        aria-hidden="true"
                      ></span>
                      <span class="max-w-40 truncate">{{ item.name }}</span>
                    </button>
                    <app-custom-color-editor
                      [item]="item"
                      [usedNames]="otherNames(item.id)"
                      [disabled]="busy() || data.refreshing()"
                      (changed)="upsertCustom($event, item.id)"
                      (preview)="preview($event)"
                    />
                    <button
                      hlmBtn
                      variant="destructive"
                      size="icon-sm"
                      type="button"
                      [disabled]="busy() || data.refreshing()"
                      [attr.aria-label]="('removeCustomColor' | t) + ': ' + item.name"
                      [title]="('removeCustomColor' | t) + ': ' + item.name"
                      (click)="removeCustom(item.id)"
                    >
                      <ng-icon name="lucideTrash2" aria-hidden="true" />
                    </button>
                  </div>
                }
                <app-custom-color-editor
                  #addColor
                  [initialColor]="color()"
                  [usedNames]="otherNames()"
                  [disabled]="busy() || data.refreshing() || customColors().length >= 24"
                  (changed)="upsertCustom($event)"
                  (preview)="preview($event)"
                />
              </div>
              @if (!customColors().length) {
                <p class="text-muted-foreground text-sm">{{ 'noCustomColors' | t }}</p>
              }
              <p role="status" aria-live="polite" class="text-sm">{{ removalNotice() | t }}</p>
            </section>
            <app-login-background-picker
              [(value)]="background"
              [disabled]="busy() || data.refreshing()"
            />
          </div>
          <div hlmCardFooter class="flex-wrap gap-2">
            <button
              hlmBtn
              type="submit"
              [disabled]="busy() || data.refreshing() || !valid() || !hasUnsavedChanges()"
            >
              @if (busy()) {
                <hlm-spinner />
              }
              {{ 'save' | t }}
            </button>
            @if (hasUnsavedChanges()) {
              <button
                hlmBtn
                variant="destructive"
                type="button"
                [disabled]="busy() || data.refreshing()"
                (click)="reload()"
              >
                {{ 'undoChanges' | t }}
              </button>
            }
          </div>
        </section>
      </form>
    </app-page-state>`,
            }]
    }], null, { addColor: [{ type: i0.ViewChild, args: ['addColor', { ...{
                        read: ElementRef,
                    }, isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ConfigurationPage, { className: "ConfigurationPage", filePath: "src/app/features/configuration.ts", lineNumber: 164 }); })();
