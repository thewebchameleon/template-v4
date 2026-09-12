import { Component, OnInit, inject, signal } from '@angular/core';
import { RuntimeModule } from '../api/models';
import { Features } from '../core/features';
import { Notifications } from '../core/notifications';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-modules',
  imports: [WorkspaceUi],
  template: `<app-page-header title="modules" description="modulesHelp" eyebrow="administration" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="reload()"
    >
      @for (module of data.value(); track module.id) {
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ module.id | t }}</h2>
            <p hlmCardDescription>{{ module.id + 'ModuleHelp' | t }}</p>
          </div>
          <div hlmCardContent class="grid gap-4">
            <label
              hlmFieldLabel
              [for]="module.id + '-enabled'"
              class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
            >
              <div hlmField orientation="horizontal">
                <hlm-switch
                  [inputId]="module.id + '-enabled'"
                  [name]="module.id + 'Enabled'"
                  [ngModel]="enabled[module.id]"
                  (ngModelChange)="save(module, $event)"
                  [disabled]="busy() || data.refreshing() || !module.available"
                  [attr.aria-describedby]="module.id + '-module-help'"
                  class="self-center"
                />
                <div hlmFieldContent>
                  <span hlmFieldTitle>{{
                    (module.id === 'files' ? 'enableFilesModule' : 'enableSupportModule') | t
                  }}</span>
                  <p hlmFieldDescription [id]="module.id + '-module-help'">
                    {{ module.id + 'ModuleDisableHelp' | t }}
                  </p>
                </div>
              </div>
            </label>
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
  readonly data = new Resource<RuntimeModule[]>();
  readonly busy = signal(false);
  readonly api = inject(WorkspaceApi);
  readonly features = inject(Features);
  readonly toast = inject(Notifications);
  enabled: Record<string, boolean> = {};
  ngOnInit() {
    void this.load();
  }
  async load() {
    if (await this.data.load((signal) => this.api.get('administration/modules', {}, signal)))
      this.enabled = Object.fromEntries((this.data.value() ?? []).map((m) => [m.id, m.enabled]));
  }
  async reload() {
    await this.load();
  }
  async save(module: RuntimeModule, enabled: boolean) {
    if (!module?.available || this.busy() || this.data.refreshing() || enabled === module.enabled)
      return;
    this.enabled[module.id] = enabled;
    this.busy.set(true);
    try {
      const saved = await this.api.post<RuntimeModule>('administration/modules', {
        id: module.id,
        enabled,
        version: module.version,
      });
      this.data.value.update((items) => (items ?? []).map((m) => (m.id === saved.id ? saved : m)));
      this.enabled[saved.id] = saved.enabled;
      this.features.reset();
      await this.features.load();
      this.toast.success(
        saved.id === 'files'
          ? saved.enabled
            ? 'filesModuleEnabled'
            : 'filesModuleDisabled'
          : 'supportSaved',
      );
    } catch {
      this.enabled[module.id] = module.enabled;
    } finally {
      this.busy.set(false);
    }
  }
}
