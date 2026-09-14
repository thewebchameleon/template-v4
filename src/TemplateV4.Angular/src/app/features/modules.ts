import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBoxes,
  lucideCar,
  lucideContactRound,
  lucideFileSpreadsheet,
  lucideFolderOpen,
  lucideLifeBuoy,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { ModuleActivation, MyFilesModuleSettings } from '../api/models';
type ModuleEditor = ModuleActivation & { demoMode: boolean; slowUploadMode: boolean };
import { Features } from '../core/features';
import { FOUNDATION_FEATURES } from '../core/feature-extensions';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-modules',
  imports: [WorkspaceUi, HlmTooltip],
  providers: [
    provideIcons({
      lucideBoxes,
      lucideCar,
      lucideContactRound,
      lucideFileSpreadsheet,
      lucideFolderOpen,
      lucideLifeBuoy,
      lucideTriangleAlert,
    }),
  ],
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
                        : module.id === 'crm'
                          ? 'lucideContactRound'
                          : module.id === 'invoicing'
                            ? 'lucideFileSpreadsheet'
                            : moduleIcon(module.id)
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
                @if (hasMissingDependencies(module)) {
                  <span
                    role="img"
                    tabindex="0"
                    [hlmTooltip]="dependencyTooltip(module)"
                    [attr.aria-label]="dependencyTooltip(module)"
                    class="inline-flex shrink-0 text-[var(--warning)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <ng-icon name="lucideTriangleAlert" size="2.5rem" aria-hidden="true" />
                  </span>
                }
                <hlm-switch
                  [inputId]="module.id + '-enabled'"
                  [name]="module.id + 'Enabled'"
                  [ngModel]="enabled[module.id]"
                  (ngModelChange)="save(module, $event)"
                  [disabled]="
                    busy() ||
                    data.refreshing() ||
                    !module.available ||
                    hasMissingDependencies(module)
                  "
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
})
export class ModulesPage implements OnInit {
  private readonly contributions = inject(FOUNDATION_FEATURES);
  moduleIcon(id: string) {
    return this.contributions.find((feature) => feature.id === id)?.moduleIcon ?? 'lucideBoxes';
  }
  readonly data = new Resource<ModuleEditor[]>();
  readonly busy = signal(false);
  readonly api = inject(WorkspaceApi);
  readonly features = inject(Features);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  private fileSettings?: MyFilesModuleSettings;
  enabled: Record<string, boolean> = {};
  demoModes: Record<string, boolean> = {};
  slowUploadModes: Record<string, boolean> = {};
  ngOnInit() {
    void this.load();
  }
  async load() {
    if (
      await this.data.load((signal) =>
        Promise.all([
          this.api.get<ModuleActivation[]>('administration/modules/activation', {}, signal),
          this.api.get<MyFilesModuleSettings>(
            'administration/modules/my-files/settings',
            {},
            signal,
          ),
        ]).then(([modules, settings]) => {
          this.fileSettings = settings;
          return modules.map((module) => ({
            ...module,
            demoMode: module.id === 'my-files' && settings.demoMode,
            slowUploadMode: module.id === 'my-files' && settings.slowUploadMode,
          }));
        }),
      )
    ) {
      this.enabled = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.enabled]));
      this.demoModes = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.demoMode]));
      this.slowUploadModes = Object.fromEntries(
        (this.data.value() ?? []).map((m) => [m.id, m.slowUploadMode]),
      );
    }
  }
  async reload() {
    await this.load();
  }
  hasMissingDependencies(module: ModuleActivation) {
    return !module.enabled && module.enableBlockers.length > 0;
  }
  dependencyTooltip(module: ModuleActivation) {
    return `${this.i18n.text('moduleMissingDependencies')} ${module.enableBlockers
      .map((dependency) => this.i18n.text(dependency))
      .join(', ')}`;
  }
  async save(module: ModuleEditor, enabled: boolean, demoMode?: boolean, slowUploadMode?: boolean) {
    if (
      !module?.available ||
      (enabled && module.enableBlockers.length > 0) ||
      this.busy() ||
      this.data.refreshing() ||
      (enabled === module.enabled &&
        (demoMode === undefined || demoMode === module.demoMode) &&
        (slowUploadMode === undefined || slowUploadMode === module.slowUploadMode))
    )
      return;
    this.enabled[module.id] = enabled;
    this.demoModes[module.id] = demoMode ?? module.demoMode;
    this.slowUploadModes[module.id] = slowUploadMode ?? module.slowUploadMode;
    this.busy.set(true);
    try {
      let saved: ModuleEditor;
      let activationSnapshot: ModuleActivation[] | undefined;
      if (demoMode !== undefined || slowUploadMode !== undefined) {
        if (!this.fileSettings) return;
        this.fileSettings = await this.api.post<MyFilesModuleSettings>(
          'administration/modules/my-files/settings',
          {
            demoMode: demoMode ?? this.fileSettings.demoMode,
            slowUploadMode: slowUploadMode ?? this.fileSettings.slowUploadMode,
            version: this.fileSettings.version,
          },
        );
        saved = {
          ...module,
          demoMode: this.fileSettings.demoMode,
          slowUploadMode: this.fileSettings.slowUploadMode,
        };
      } else {
        const activation = await this.api.post<ModuleActivation>(
          'administration/modules/activation',
          {
            id: module.id,
            enabled,
            version: module.version,
          },
        );
        saved = { ...activation, demoMode: module.demoMode, slowUploadMode: module.slowUploadMode };
        this.data.refreshError.set(false);
        try {
          activationSnapshot = await this.api.get<ModuleActivation[]>(
            'administration/modules/activation',
          );
        } catch {
          this.data.refreshError.set(true);
        }
      }
      this.data.value.update((items) => {
        const current = new Map((items ?? []).map((item) => [item.id, item]));
        return activationSnapshot
          ? activationSnapshot.map((activation) => ({
              ...activation,
              demoMode: current.get(activation.id)?.demoMode ?? false,
              slowUploadMode: current.get(activation.id)?.slowUploadMode ?? false,
            }))
          : (items ?? []).map((item) => (item.id === saved.id ? saved : item));
      });
      this.enabled = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.enabled]));
      this.demoModes = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.demoMode]));
      this.slowUploadModes = Object.fromEntries(
        (this.data.value() ?? []).map((m) => [m.id, m.slowUploadMode]),
      );
      this.features.reset();
      await this.features.load();
      this.toast.success(
        slowUploadMode !== undefined
          ? 'myFilesSlowUploadSaved'
          : demoMode !== undefined
            ? 'myFilesDemoSaved'
            : saved.id === 'my-files'
              ? saved.enabled
                ? 'filesModuleEnabled'
                : 'filesModuleDisabled'
              : 'commercialSaved',
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const blockers: unknown = error.error?.errors?.dependencies;
        if (
          Array.isArray(blockers) &&
          blockers.every((id): id is string => typeof id === 'string')
        ) {
          this.data.value.update((items) =>
            (items ?? []).map((item) =>
              item.id === module.id
                ? {
                    ...item,
                    ...(enabled ? { enableBlockers: blockers } : { disableBlockers: blockers }),
                  }
                : item,
            ),
          );
        }
      }
      this.enabled[module.id] = module.enabled;
      this.demoModes[module.id] = module.demoMode;
      this.slowUploadModes[module.id] = module.slowUploadMode;
    } finally {
      this.busy.set(false);
    }
  }
}
