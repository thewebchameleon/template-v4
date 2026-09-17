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
import { ModuleActivation } from '../../api/models';
import { Features } from '../../core/features';
import { FOUNDATION_FEATURES } from '../../core/feature-extensions';
import {
  administrationDestinations,
  Destination,
  organisationDestinations,
  workspaceDestinations,
} from '../../core/destinations';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { WorkspaceApi } from '../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../shared/workspace';

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
    @if (conflict()) {
      <div hlmAlert class="mb-6">
        <p hlmAlertDescription>{{ 'moduleConflict' | t }}</p>
      </div>
    }
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="reload()">
      @for (module of data.value(); track module.id) {
        <section hlmCard class="mb-6 p-0" [id]="'module-' + module.id">
          <div hlmCardHeader>
            <div hlmField orientation="horizontal">
              <label
                hlmFieldLabel
                [for]="module.id + '-enabled'"
                [attr.aria-label]="module.id | t"
                class="min-w-0 flex-1 cursor-pointer bg-transparent has-data-checked:border-transparent has-data-checked:bg-transparent has-[[data-disabled=true]]:cursor-not-allowed dark:has-data-checked:border-transparent dark:has-data-checked:bg-transparent"
              >
                <ng-icon
                  [name]="moduleIcon(module.id)"
                  size="3rem"
                  class="shrink-0 self-center"
                  [class.text-primary]="enabled[module.id]"
                  [class.text-muted-foreground]="!enabled[module.id]"
                  aria-hidden="true"
                />
                <div hlmFieldContent>
                  <h2 hlmCardTitle [id]="module.id + '-label'">{{ module.id | t }}</h2>
                  <p hlmCardDescription [id]="module.id + '-help'">
                    {{ module.id + 'ModuleHelp' | t }}
                  </p>
                </div>
              </label>
              @if (blockers(module).length) {
                <span
                  role="img"
                  tabindex="0"
                  [hlmTooltip]="dependencyTooltip(module)"
                  [attr.aria-label]="dependencyTooltip(module)"
                  class="inline-flex shrink-0 self-center text-[var(--warning)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <ng-icon name="lucideTriangleAlert" size="2.5rem" aria-hidden="true" />
                </span>
              }
              @if (enabled[module.id] !== false && settingsDestination(module.id); as destination) {
                <a hlmBtn variant="outline" [routerLink]="destination.path">{{ 'settings' | t }}</a>
              }
              <hlm-switch
                [inputId]="module.id + '-enabled'"
                [ngModel]="enabled[module.id]"
                (ngModelChange)="save(module, $event)"
                [disabled]="
                  busy() ||
                  data.refreshing() ||
                  data.refreshError() ||
                  !module.available ||
                  blockers(module).length > 0
                "
                [aria-labelledby]="module.id + '-label'"
                [aria-describedby]="module.id + '-help'"
                class="self-center"
              />
            </div>
          </div>
        </section>
      } @empty {
        <p>{{ 'moduleNoSwitches' | t }}</p>
      }
    </app-page-state>`,
})
export class ModulesPage implements OnInit {
  private readonly contributions = inject(FOUNDATION_FEATURES);
  readonly data = new Resource<ModuleActivation[]>();
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly api = inject(WorkspaceApi);
  private readonly features = inject(Features);
  private readonly i18n = inject(I18n);
  private readonly toast = inject(Notifications);
  enabled: Record<string, boolean> = {};
  moduleIcon(id: string) {
    if (id === 'support') return 'lucideLifeBuoy';
    const foundationDestinations: readonly Destination[] = [
      ...Object.values(workspaceDestinations),
      ...organisationDestinations,
      ...Object.values(administrationDestinations),
    ];
    const contribution = this.contributions.find((feature) => feature.id === id);
    const contributedDestinations = [
      ...(contribution?.destinations ?? []),
      ...(contribution?.organisationDestinations ?? []),
    ];
    return (
      [...foundationDestinations, ...contributedDestinations].find(
        (destination) => destination.capability === id,
      )?.icon ?? 'lucideBoxes'
    );
  }
  settingsDestination(id: string) {
    const destinations: Record<string, { path: string; label: string }> = {
      'file-storage': { path: '/administration/file-storage', label: 'storageSettings' },
      support: { path: '/administration/support', label: 'support' },
      crm: { path: '/administration/crm', label: 'crmConfiguration' },
      invoicing: { path: '/administration/invoicing', label: 'issuerSettings' },
    };
    return (
      destinations[id] ??
      this.contributions.find((feature) => feature.id === id)?.moduleSettingsDestination
    );
  }
  blockers(module: ModuleActivation) {
    return module.enabled ? module.disableBlockers : module.enableBlockers;
  }
  dependencyTooltip(module: ModuleActivation) {
    const heading = this.i18n.text(
      module.enabled ? 'moduleDisableBlockers' : 'moduleMissingDependencies',
    );
    return `${heading} ${this.blockers(module)
      .map((dependency) => this.i18n.text(dependency))
      .join(', ')}`;
  }
  ngOnInit() {
    void this.reload();
  }
  async reload() {
    const loaded = await this.data.load((signal) =>
      this.api.get<ModuleActivation[]>('administration/modules/activation', {}, signal),
    );
    if (loaded) this.sync();
    return loaded;
  }
  private sync() {
    this.enabled = Object.fromEntries(
      (this.data.value() ?? []).map((module) => [module.id, module.enabled]),
    );
  }
  async save(module: ModuleActivation, enabled: boolean) {
    if (
      this.busy() ||
      !module.available ||
      this.data.refreshError() ||
      this.blockers(module).length ||
      enabled === module.enabled
    )
      return;
    this.busy.set(true);
    this.conflict.set(false);
    this.enabled[module.id] = enabled;
    try {
      const saved = await this.api.post<ModuleActivation>('administration/modules/activation', {
        id: module.id,
        enabled,
        version: module.version,
      });
      this.data.value.update((items) =>
        (items ?? []).map((item) => (item.id === saved.id ? saved : item)),
      );
      this.sync();
      await this.reload();
      await this.features.refresh();
      this.toast.success('moduleActivationSaved');
    } catch (error) {
      this.sync();
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.conflict.set(true);
        await this.reload();
      }
    } finally {
      this.busy.set(false);
    }
  }
}
