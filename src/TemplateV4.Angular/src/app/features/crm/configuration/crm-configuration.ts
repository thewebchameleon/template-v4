import { BusinessDraft } from '../../../shared/business-draft';
import { Component, inject, signal } from '@angular/core';
import { CrmConfiguration, CustomerInfo } from '../../../api/models';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../../shared/workspace';

@Component({
  selector: 'app-crm-configuration',
  imports: [WorkspaceUi],
  template: ` <app-page-header title="crmConfiguration" description="retireHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organisation', 'crm']">{{
        'crm' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="state.state()" [refreshError]="state.refreshError()" (retry)="load()">
      @if (draft; as config) {
        <form class="grid gap-6" (ngSubmit)="save()">
          <fieldset [disabled]="busy() || !canConfigure()" class="grid gap-6">
            @for (section of sections; track section.key) {
              <section hlmCard>
                <div hlmCardHeader>
                  <h2 hlmCardTitle>{{ section.label | t }}</h2>
                </div>
                <div hlmCardContent class="grid gap-4">
                  @for (option of config[section.key]; track option.id) {
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div hlmField>
                        <label hlmFieldLabel [for]="option.id">{{ 'name' | t }}</label
                        ><input
                          hlmInput
                          [id]="option.id"
                          [name]="option.id"
                          [(ngModel)]="option.label"
                          maxlength="150"
                          required
                        />
                      </div>
                      <label hlmFieldLabel [for]="option.id + '-retired'"
                        ><div hlmField orientation="horizontal">
                          <hlm-checkbox
                            [inputId]="option.id + '-retired'"
                            [name]="option.id + '-retired'"
                            [(ngModel)]="option.retired"
                          /><span>{{ 'retired' | t }}</span>
                        </div></label
                      >
                    </div>
                  }
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    (click)="config[section.key].push({ id: uuid(), label: '', retired: false })"
                  >
                    {{ 'addOption' | t }}
                  </button>
                </div>
              </section>
            }
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'pipeline' | t }}</h2>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (pipeline of config.pipelines; track pipeline.id) {
                  <fieldset class="grid gap-3 rounded-lg border p-4">
                    <div hlmField>
                      <label hlmFieldLabel [for]="pipeline.id">{{ 'pipeline' | t }}</label
                      ><input
                        hlmInput
                        [id]="pipeline.id"
                        [name]="pipeline.id"
                        [(ngModel)]="pipeline.label"
                        required
                        maxlength="150"
                      />
                    </div>
                    <label hlmFieldLabel [for]="pipeline.id + '-retired'"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          [inputId]="pipeline.id + '-retired'"
                          [name]="pipeline.id + '-retired'"
                          [(ngModel)]="pipeline.retired"
                        /><span>{{ 'retired' | t }}</span>
                      </div></label
                    >
                    @for (stage of pipeline.stages; track stage.id) {
                      <div class="grid gap-3 sm:grid-cols-2">
                        <div hlmField>
                          <label hlmFieldLabel [for]="stage.id">{{ 'stage' | t }}</label
                          ><input
                            hlmInput
                            [id]="stage.id"
                            [name]="stage.id"
                            [(ngModel)]="stage.label"
                            required
                            maxlength="150"
                          />
                        </div>
                        <label hlmFieldLabel [for]="stage.id + '-retired'"
                          ><div hlmField orientation="horizontal">
                            <hlm-checkbox
                              [inputId]="stage.id + '-retired'"
                              [name]="stage.id + '-retired'"
                              [(ngModel)]="stage.retired"
                            /><span>{{ 'retired' | t }}</span>
                          </div></label
                        >
                      </div>
                    }
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      (click)="pipeline.stages.push({ id: uuid(), label: '', retired: false })"
                    >
                      {{ 'addOption' | t }}
                    </button>
                  </fieldset>
                }
                <button
                  hlmBtn
                  variant="outline"
                  type="button"
                  (click)="
                    config.pipelines.push({
                      id: uuid(),
                      label: '',
                      retired: false,
                      stages: [{ id: uuid(), label: '', retired: false }],
                    })
                  "
                >
                  {{ 'add' | t }} {{ 'pipeline' | t }}
                </button>
              </div>
            </section>
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'customFields' | t }}</h2>
              </div>
              <div hlmCardContent class="grid gap-4">
                @for (field of config.contactFields; track field.id) {
                  <fieldset class="grid gap-3 rounded-lg border p-4">
                    <div hlmField>
                      <label hlmFieldLabel [for]="field.id">{{ 'fieldName' | t }}</label
                      ><input
                        hlmInput
                        [id]="field.id"
                        [name]="field.id"
                        [(ngModel)]="field.label"
                        required
                        maxlength="150"
                      />
                    </div>
                    <label hlmFieldLabel [for]="field.id + '-retired'"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          [inputId]="field.id + '-retired'"
                          [name]="field.id + '-retired'"
                          [(ngModel)]="field.retired"
                        /><span>{{ 'retired' | t }}</span>
                      </div></label
                    >
                    @for (option of field.options; track option.id) {
                      <div class="grid gap-3 sm:grid-cols-2">
                        <div hlmField>
                          <label hlmFieldLabel [for]="option.id">{{ 'name' | t }}</label
                          ><input
                            hlmInput
                            [id]="option.id"
                            [name]="option.id"
                            [(ngModel)]="option.label"
                            required
                            maxlength="150"
                          />
                        </div>
                        <label hlmFieldLabel [for]="option.id + '-retired'"
                          ><div hlmField orientation="horizontal">
                            <hlm-checkbox
                              [inputId]="option.id + '-retired'"
                              [name]="option.id + '-retired'"
                              [(ngModel)]="option.retired"
                            /><span>{{ 'retired' | t }}</span>
                          </div></label
                        >
                      </div>
                    }
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      (click)="field.options.push({ id: uuid(), label: '', retired: false })"
                    >
                      {{ 'addOption' | t }}
                    </button>
                  </fieldset>
                }
                <button
                  hlmBtn
                  variant="outline"
                  type="button"
                  (click)="
                    config.contactFields.push({
                      id: uuid(),
                      label: '',
                      options: [],
                      retired: false,
                    })
                  "
                >
                  {{ 'addField' | t }}
                </button>
              </div>
            </section>
            <button hlmBtn [disabled]="busy() || !canConfigure()">{{ 'save' | t }}</button>
          </fieldset>
        </form>
      }
    </app-page-state>`,
})
export class CrmConfigurationPage extends BusinessDraft {
  protected draftValue() {
    return this.draft;
  }
  private readonly api = inject(WorkspaceApi);
  readonly state = new Resource<CrmConfiguration>();
  readonly busy = signal(false);
  readonly canConfigure = signal(false);
  draft: CrmConfiguration | null = null;
  readonly sections = [
    { key: 'lifecycleStatuses', label: 'lifecycle' },
    { key: 'tags', label: 'tags' },
  ] as const;
  constructor() {
    super();
    void this.load();
  }
  uuid() {
    return crypto.randomUUID();
  }
  async load() {
    await this.state.load(async (signal) => {
      const [config, home] = await Promise.all([
        this.api.get<CrmConfiguration>(`organisation/crm/configuration`, {}, signal),
        this.api.get<CustomerInfo>('organisation/', {}, signal),
      ]);
      this.canConfigure.set(home.canManage);
      this.draft = structuredClone(config);
      this.markSaved();
      return config;
    });
  }
  async save() {
    if (this.busy() || !this.draft) return;
    this.busy.set(true);
    try {
      await this.api.post(`organisation/crm/configuration`, this.draft);
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
}
