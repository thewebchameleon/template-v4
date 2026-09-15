import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucideFolderOpen, lucideLifeBuoy, lucideBoxes } from '@ng-icons/lucide';
import { Features } from '../../core/features';
import { Notifications } from '../notifications/notifications';
import { WorkspaceApi } from '../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@ng-icons/core";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/field";
import * as i8 from "@spartan-ng/helm/alert";
import * as i9 from "@spartan-ng/helm/switch";
import * as i10 from "../../core/i18n";
const _forTrack0 = ($index, $item) => $item.id;
function ModulesPage_For_3_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 16)(1, "div", 17)(2, "hlm-switch", 18);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵlistener("ngModelChange", function ModulesPage_For_3_Conditional_18_Template_hlm_switch_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r4); const module_r2 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.save(module_r2, !!module_r2.enabled, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(4, "div", 19)(5, "span", 20);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 21);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(11, "label", 22)(12, "div", 17)(13, "hlm-switch", 23);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵlistener("ngModelChange", function ModulesPage_For_3_Conditional_18_Template_hlm_switch_ngModelChange_13_listener($event) { i0.ɵɵrestoreView(_r4); const module_r2 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.save(module_r2, !!module_r2.enabled, undefined, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(15, "div", 19)(16, "span", 20);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "p", 24);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const module_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r2.demoModes[module_r2.id])("disabled", ctx_r2.busy() || ctx_r2.data.refreshing() || !module_r2.available);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 10, "myFilesDemoMode"));
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 12, "myFilesDemoMode"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 14, "myFilesDemoHelp"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r2.slowUploadModes[module_r2.id])("disabled", ctx_r2.busy() || ctx_r2.data.refreshing() || !module_r2.available);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 16, "myFilesSlowUploadMode"));
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 18, "myFilesSlowUploadMode"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(21, 20, "myFilesSlowUploadHelp"), " ");
} }
function ModulesPage_For_3_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "moduleNoFeatures"));
} }
function ModulesPage_For_3_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14)(1, "a", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "storageSettings"), " ");
} }
function ModulesPage_For_3_Conditional_21_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const blocker_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, blocker_r5));
} }
function ModulesPage_For_3_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "p", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(4, ModulesPage_For_3_Conditional_21_For_5_Template, 3, 3, "p", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const module_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "moduleDependencyBlockers"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(module_r2.enabled ? module_r2.disableBlockers : module_r2.enableBlockers);
} }
function ModulesPage_For_3_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "p", 26);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "moduleUnavailable"));
} }
function ModulesPage_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 2)(1, "div", 3)(2, "label", 4)(3, "div", 5);
    i0.ɵɵelement(4, "ng-icon", 6);
    i0.ɵɵelementStart(5, "div", 7)(6, "h2", 8);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 9);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "hlm-switch", 10);
    i0.ɵɵlistener("ngModelChange", function ModulesPage_For_3_Template_hlm_switch_ngModelChange_12_listener($event) { const module_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.save(module_r2, $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "div", 11)(14, "section", 12)(15, "h3", 8);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, ModulesPage_For_3_Conditional_18_Template, 22, 22)(19, ModulesPage_For_3_Conditional_19_Template, 3, 3, "p", 13);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, ModulesPage_For_3_Conditional_20_Template, 4, 3, "div", 14);
    i0.ɵɵconditionalCreate(21, ModulesPage_For_3_Conditional_21_Template, 6, 3, "div", 15);
    i0.ɵɵconditionalCreate(22, ModulesPage_For_3_Conditional_22_Template, 4, 3, "div", 15);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const module_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("collapsibleHeader", false)("expanded", ctx_r2.enabled[module_r2.id] !== false);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", module_r2.id + "-enabled");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("text-primary", ctx_r2.enabled[module_r2.id])("text-muted-foreground", !ctx_r2.enabled[module_r2.id]);
    i0.ɵɵproperty("name", module_r2.id === "my-files" ? "lucideFolderOpen" : module_r2.id === "support" ? "lucideLifeBuoy" : "lucideBoxes");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", module_r2.id + "-module-label");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 28, module_r2.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", module_r2.id + "-module-help");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 30, module_r2.id + "ModuleHelp"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("inputId", module_r2.id + "-enabled")("name", module_r2.id + "Enabled")("ngModel", ctx_r2.enabled[module_r2.id])("disabled", ctx_r2.busy() || ctx_r2.data.refreshing() || !module_r2.available);
    i0.ɵɵattribute("aria-describedby", module_r2.id + "-module-help")("aria-controls", module_r2.id + "-module-content")("aria-expanded", ctx_r2.enabled[module_r2.id] !== false)("aria-labelledby", module_r2.id + "-module-label");
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", module_r2.id + "-module-content");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-labelledby", module_r2.id + "-features-title");
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", module_r2.id + "-features-title");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 32, "moduleFeatures"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(module_r2.id === "my-files" ? 18 : 19);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(module_r2.id === "my-files" ? 20 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((module_r2.enabled ? module_r2.disableBlockers : module_r2.enableBlockers).length ? 21 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!module_r2.available ? 22 : -1);
} }
export class ModulesPage {
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    api = inject(WorkspaceApi);
    features = inject(Features);
    toast = inject(Notifications);
    fileSettings;
    enabled = {};
    demoModes = {};
    slowUploadModes = {};
    ngOnInit() {
        void this.load();
    }
    async load() {
        if (await this.data.load((signal) => Promise.all([
            this.api.get('administration/modules/activation', {}, signal),
            this.api.get('administration/modules/my-files/settings', {}, signal),
        ]).then(([modules, settings]) => {
            this.fileSettings = settings;
            return modules.map((module) => ({
                ...module,
                demoMode: module.id === 'my-files' && settings.demoMode,
                slowUploadMode: module.id === 'my-files' && settings.slowUploadMode,
            }));
        }))) {
            this.enabled = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.enabled]));
            this.demoModes = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.demoMode]));
            this.slowUploadModes = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.slowUploadMode]));
        }
    }
    async reload() {
        await this.load();
    }
    async save(module, enabled, demoMode, slowUploadMode) {
        if (!module?.available ||
            this.busy() ||
            this.data.refreshing() ||
            (enabled === module.enabled &&
                (demoMode === undefined || demoMode === module.demoMode) &&
                (slowUploadMode === undefined || slowUploadMode === module.slowUploadMode)))
            return;
        this.enabled[module.id] = enabled;
        this.demoModes[module.id] = demoMode ?? module.demoMode;
        this.slowUploadModes[module.id] = slowUploadMode ?? module.slowUploadMode;
        this.busy.set(true);
        try {
            let saved;
            if (demoMode !== undefined || slowUploadMode !== undefined) {
                if (!this.fileSettings)
                    return;
                this.fileSettings = await this.api.post('administration/modules/my-files/settings', {
                    demoMode: demoMode ?? this.fileSettings.demoMode,
                    slowUploadMode: slowUploadMode ?? this.fileSettings.slowUploadMode,
                    version: this.fileSettings.version,
                });
                saved = {
                    ...module,
                    demoMode: this.fileSettings.demoMode,
                    slowUploadMode: this.fileSettings.slowUploadMode,
                };
            }
            else {
                const activation = await this.api.post('administration/modules/activation', {
                    id: module.id,
                    enabled,
                    version: module.version,
                });
                saved = { ...activation, demoMode: module.demoMode, slowUploadMode: module.slowUploadMode };
            }
            this.data.value.update((items) => (items ?? []).map((m) => (m.id === saved.id ? saved : m)));
            this.enabled[saved.id] = saved.enabled;
            this.demoModes[saved.id] = saved.demoMode;
            this.slowUploadModes[saved.id] = saved.slowUploadMode;
            this.features.reset();
            await this.features.load();
            this.toast.success(slowUploadMode !== undefined
                ? 'myFilesSlowUploadSaved'
                : demoMode !== undefined
                    ? 'myFilesDemoSaved'
                    : saved.id === 'my-files'
                        ? saved.enabled
                            ? 'filesModuleEnabled'
                            : 'filesModuleDisabled'
                        : 'commercialSaved');
        }
        catch (error) {
            if (error instanceof HttpErrorResponse) {
                const blockers = error.error?.errors?.dependencies;
                if (Array.isArray(blockers) &&
                    blockers.every((id) => typeof id === 'string')) {
                    this.data.value.update((items) => (items ?? []).map((item) => item.id === module.id
                        ? {
                            ...item,
                            ...(enabled ? { enableBlockers: blockers } : { disableBlockers: blockers }),
                        }
                        : item));
                }
            }
            this.enabled[module.id] = module.enabled;
            this.demoModes[module.id] = module.demoMode;
            this.slowUploadModes[module.id] = module.slowUploadMode;
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function ModulesPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ModulesPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ModulesPage, selectors: [["app-modules"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideFolderOpen, lucideLifeBuoy, lucideBoxes })])], decls: 4, vars: 3, consts: [["title", "modules", "description", "modulesHelp", "eyebrow", "administration"], [3, "retry", "state", "refreshing", "refreshError"], ["hlmCard", "", "collapsible", "", 1, "mb-6", 3, "collapsibleHeader", "expanded"], ["hlmCardHeader", ""], ["hlmFieldLabel", "", 1, "bg-transparent", "cursor-pointer", "has-data-checked:border-transparent", "has-data-checked:bg-transparent", "has-[>[data-slot=field]]:border-0", "has-[[data-disabled=true]]:cursor-not-allowed", "dark:has-data-checked:border-transparent", "dark:has-data-checked:bg-transparent", "*:data-[slot=field]:p-0", 3, "for"], ["hlmField", "", "orientation", "horizontal", 1, "items-center"], ["size", "3rem", "aria-hidden", "true", 1, "shrink-0", 3, "name"], ["hlmFieldContent", "", 1, "min-w-0"], ["hlmCardTitle", "", 3, "id"], ["hlmCardDescription", "", 3, "id"], [1, "self-center", 3, "ngModelChange", "inputId", "name", "ngModel", "disabled"], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "id"], [1, "grid", "gap-3"], [1, "workspace-meta"], [1, "flex", "flex-wrap", "gap-2"], ["hlmAlert", ""], ["hlmFieldLabel", "", "for", "my-files-demo", 1, "cursor-pointer", "has-[[data-disabled=true]]:cursor-not-allowed"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "my-files-demo", "name", "myFilesDemoMode", "aria-describedby", "my-files-demo-help", 1, "self-center", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""], ["hlmFieldDescription", "", "id", "my-files-demo-help"], ["hlmFieldLabel", "", "for", "my-files-slow-upload", 1, "cursor-pointer", "has-[[data-disabled=true]]:cursor-not-allowed"], ["inputId", "my-files-slow-upload", "name", "myFilesSlowUploadMode", "aria-describedby", "my-files-slow-upload-help", 1, "self-center", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldDescription", "", "id", "my-files-slow-upload-help"], ["hlmBtn", "", "variant", "outline", "routerLink", "/administration/storage"], ["hlmAlertDescription", ""]], template: function ModulesPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 0);
            i0.ɵɵelementStart(1, "app-page-state", 1);
            i0.ɵɵlistener("retry", function ModulesPage_Template_app_page_state_retry_1_listener() { return ctx.reload(); });
            i0.ɵɵrepeaterCreate(2, ModulesPage_For_3_Template, 23, 34, "section", 2, _forTrack0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshing", ctx.data.refreshing())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.data.value());
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.NgControlStatus, i2.NgModel, i3.RouterLink, i4.NgIcon, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmField, i7.HlmFieldContent, i7.HlmFieldDescription, i7.HlmFieldLabel, i7.HlmFieldTitle, i8.HlmAlert, i8.HlmAlertDescription, i9.HlmSwitch, i10.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ModulesPage, [{
        type: Component,
        args: [{
                selector: 'app-modules',
                imports: [WorkspaceUi],
                providers: [provideIcons({ lucideFolderOpen, lucideLifeBuoy, lucideBoxes })],
                template: `<app-page-header title="modules" description="modulesHelp" eyebrow="administration" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="reload()"
    >
      @for (module of data.value(); track module.id) {
        <section
          hlmCard
          collapsible
          [collapsibleHeader]="false"
          [expanded]="enabled[module.id] !== false"
          class="mb-6"
        >
          <div hlmCardHeader>
            <label
              hlmFieldLabel
              [for]="module.id + '-enabled'"
              class="bg-transparent cursor-pointer has-data-checked:border-transparent has-data-checked:bg-transparent has-[>[data-slot=field]]:border-0 has-[[data-disabled=true]]:cursor-not-allowed dark:has-data-checked:border-transparent dark:has-data-checked:bg-transparent *:data-[slot=field]:p-0"
            >
              <div hlmField orientation="horizontal" class="items-center">
                <ng-icon
                  [name]="
                    module.id === 'my-files'
                      ? 'lucideFolderOpen'
                      : module.id === 'support'
                        ? 'lucideLifeBuoy'
                        : 'lucideBoxes'
                  "
                  size="3rem"
                  class="shrink-0"
                  [class.text-primary]="enabled[module.id]"
                  [class.text-muted-foreground]="!enabled[module.id]"
                  aria-hidden="true"
                />
                <div hlmFieldContent class="min-w-0">
                  <h2 hlmCardTitle [id]="module.id + '-module-label'">{{ module.id | t }}</h2>
                  <p hlmCardDescription [id]="module.id + '-module-help'">
                    {{ module.id + 'ModuleHelp' | t }}
                  </p>
                </div>
                <hlm-switch
                  [inputId]="module.id + '-enabled'"
                  [name]="module.id + 'Enabled'"
                  [ngModel]="enabled[module.id]"
                  (ngModelChange)="save(module, $event)"
                  [disabled]="busy() || data.refreshing() || !module.available"
                  [attr.aria-describedby]="module.id + '-module-help'"
                  [attr.aria-controls]="module.id + '-module-content'"
                  [attr.aria-expanded]="enabled[module.id] !== false"
                  [attr.aria-labelledby]="module.id + '-module-label'"
                  class="self-center"
                />
              </div>
            </label>
          </div>
          <div hlmCardContent [id]="module.id + '-module-content'" class="grid gap-4">
            <section class="grid gap-3" [attr.aria-labelledby]="module.id + '-features-title'">
              <h3 hlmCardTitle [id]="module.id + '-features-title'">{{ 'moduleFeatures' | t }}</h3>
              @if (module.id === 'my-files') {
                <label
                  hlmFieldLabel
                  for="my-files-demo"
                  class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
                >
                  <div hlmField orientation="horizontal">
                    <hlm-switch
                      inputId="my-files-demo"
                      name="myFilesDemoMode"
                      [ngModel]="demoModes[module.id]"
                      (ngModelChange)="save(module, !!module.enabled, $event)"
                      [disabled]="busy() || data.refreshing() || !module.available"
                      [attr.aria-label]="'myFilesDemoMode' | t"
                      aria-describedby="my-files-demo-help"
                      class="self-center"
                    />
                    <div hlmFieldContent>
                      <span hlmFieldTitle>{{ 'myFilesDemoMode' | t }}</span>
                      <p hlmFieldDescription id="my-files-demo-help">
                        {{ 'myFilesDemoHelp' | t }}
                      </p>
                    </div>
                  </div>
                </label>
                <label
                  hlmFieldLabel
                  for="my-files-slow-upload"
                  class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
                >
                  <div hlmField orientation="horizontal">
                    <hlm-switch
                      inputId="my-files-slow-upload"
                      name="myFilesSlowUploadMode"
                      [ngModel]="slowUploadModes[module.id]"
                      (ngModelChange)="save(module, !!module.enabled, undefined, $event)"
                      [disabled]="busy() || data.refreshing() || !module.available"
                      [attr.aria-label]="'myFilesSlowUploadMode' | t"
                      aria-describedby="my-files-slow-upload-help"
                      class="self-center"
                    />
                    <div hlmFieldContent>
                      <span hlmFieldTitle>{{ 'myFilesSlowUploadMode' | t }}</span>
                      <p hlmFieldDescription id="my-files-slow-upload-help">
                        {{ 'myFilesSlowUploadHelp' | t }}
                      </p>
                    </div>
                  </div>
                </label>
              } @else {
                <p class="workspace-meta">{{ 'moduleNoFeatures' | t }}</p>
              }
            </section>
            @if (module.id === 'my-files') {
              <div class="flex flex-wrap gap-2">
                <a hlmBtn variant="outline" routerLink="/administration/storage">
                  {{ 'storageSettings' | t }}
                </a>
              </div>
            }
            @if ((module.enabled ? module.disableBlockers : module.enableBlockers).length) {
              <div hlmAlert>
                <p hlmAlertDescription>{{ 'moduleDependencyBlockers' | t }}</p>
                @for (
                  blocker of module.enabled ? module.disableBlockers : module.enableBlockers;
                  track blocker
                ) {
                  <p>{{ blocker | t }}</p>
                }
              </div>
            }
            @if (!module.available) {
              <div hlmAlert>
                <p hlmAlertDescription>{{ 'moduleUnavailable' | t }}</p>
              </div>
            }
          </div>
        </section>
      }
    </app-page-state>`,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ModulesPage, { className: "ModulesPage", filePath: "src/app/features/modules.ts", lineNumber: 157 }); })();
