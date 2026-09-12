import { Component, OnInit, inject, signal } from '@angular/core';
import { RuntimeModule } from '../api/models';
import { Features } from '../core/features';
import { Notifications } from '../core/notifications';
import { WorkspaceApi } from '../core/workspace-api';
import { Confirmations, Resource, WorkspaceUi, protectUnload } from '../shared/workspace';

@Component({
  selector: 'app-modules',
  imports: [WorkspaceUi],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="modules" description="modulesHelp" eyebrow="administration" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="reload()"
    >
      @for (module of data.value(); track module.id) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ module.id | t }}</h2>
            <p hlmCardDescription>{{ 'filesModuleHelp' | t }}</p>
          </div>
          <form (ngSubmit)="save()">
            <div hlmCardContent class="grid gap-4">
              <div hlmField orientation="horizontal">
                <div hlmFieldContent>
                  <label hlmFieldLabel id="files-enabled-label" for="files-enabled">{{
                    'enableFilesModule' | t
                  }}</label>
                  <p hlmFieldDescription id="files-module-help">
                    {{ 'filesModuleDisableHelp' | t }}
                  </p>
                </div>
                <hlm-switch
                  inputId="files-enabled"
                  name="filesEnabled"
                  [(ngModel)]="enabled"
                  [disabled]="busy() || data.refreshing() || !module.available"
                  aria-describedby="files-module-help"
                  aria-labelledby="files-enabled-label"
                />
              </div>
              @if (!module.available) {
                <div hlmAlert>
                  <p hlmAlertDescription>{{ 'moduleUnavailable' | t }}</p>
                </div>
              }
              <p class="workspace-meta" role="status">
                {{ (module.enabled && module.available ? 'moduleEnabled' : 'moduleDisabled') | t }}
              </p>
            </div>
            <div hlmCardFooter class="flex flex-wrap gap-2">
              <button
                hlmBtn
                type="submit"
                [disabled]="
                  busy() || data.refreshing() || !module.available || !hasUnsavedChanges()
                "
              >
                @if (busy()) {
                  <hlm-spinner />
                }
                {{ 'save' | t }}
              </button>
              <button
                hlmBtn
                variant="outline"
                type="button"
                [disabled]="busy() || data.refreshing()"
                (click)="reload()"
              >
                {{ 'reloadModules' | t }}
              </button>
            </div>
          </form>
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
  readonly confirm = inject(Confirmations);
  enabled = true;
  ngOnInit() {
    void this.load();
  }
  async load() {
    if (await this.data.load((signal) => this.api.get('administration/modules', {}, signal)))
      this.enabled = this.data.value()?.[0]?.enabled ?? true;
  }
  hasUnsavedChanges() {
    const module = this.data.value()?.[0];
    return !!module && this.enabled !== module.enabled;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async reload() {
    if (!this.hasUnsavedChanges() || (await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
      await this.load();
  }
  async save() {
    const module = this.data.value()?.[0];
    if (!module?.available || this.busy() || this.data.refreshing() || !this.hasUnsavedChanges())
      return;
    this.busy.set(true);
    try {
      const saved = await this.api.post<RuntimeModule>('administration/modules', {
        id: module.id,
        enabled: this.enabled,
        version: module.version,
      });
      this.data.value.set([saved]);
      this.enabled = saved.enabled;
      this.features.reset();
      await this.features.load();
      this.toast.success(saved.enabled ? 'filesModuleEnabled' : 'filesModuleDisabled');
    } catch {
      /* Central errors; preserve the draft for retry or reload. */
    } finally {
      this.busy.set(false);
    }
  }
}
