import { BusinessDraft } from '../shared/business-draft';
import { FOUNDATION_FEATURES } from '../core/feature-extensions';
import { Features } from '../core/features';
import { RecordAttachments } from '../shared/record-attachments';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { CrmConfiguration, CrmDetail, CrmRecord, CrmRecordInput } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Resource, WorkspaceUi } from '../shared/workspace';
import { BusinessSelect } from '../shared/business-select';
import { BusinessDate } from '../shared/business-date';
import { CrmCustomerPicker } from '../shared/crm-customer-picker';

@Component({
  selector: 'app-crm-detail',
  imports: [
    RecordAttachments,
    WorkspaceUi,
    BusinessSelect,
    BusinessDate,
    CrmCustomerPicker,
    HlmTextareaImports,
  ],
  template: `<app-page-header title="crmEdit" description="crmHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organisations', organisation, 'crm']">{{
        'crm' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()">
      @if (configuration(); as config) {
        <section hlmCard class="mb-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ draft.name || ('crmNew' | t) }}</h2>
          </div>
          <form hlmCardContent class="grid gap-5" (ngSubmit)="save()" #form="ngForm">
            <fieldset [disabled]="busy() || archived()" class="grid gap-5">
              @for (key of textFields; track key) {
                <div hlmField>
                  <label hlmFieldLabel [for]="'crm-' + key">{{ key | t }}</label
                  ><input
                    hlmInput
                    [id]="'crm-' + key"
                    [name]="key"
                    [(ngModel)]="draft[key]"
                    [required]="key === 'name'"
                    [maxlength]="key === 'address' ? 2000 : 250"
                  />
                </div>
              }
              <app-business-select
                controlId="crm-owner"
                label="recordOwner"
                [options]="owners()"
                [value]="draft.ownerId ?? ''"
                (valueChange)="draft.ownerId = $event || null"
              />
              <app-business-select
                controlId="crm-lifecycle"
                label="lifecycle"
                [options]="config.lifecycleStatuses"
                [value]="draft.lifecycleStatusId ?? ''"
                (valueChange)="draft.lifecycleStatusId = $event || null"
              />
              <div class="flex flex-wrap gap-4">
                @for (tag of config.tags; track tag.id) {
                  @if (!tag.retired || draft.tags.includes(tag.id)) {
                    <label hlmFieldLabel [for]="'tag-' + tag.id"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          [inputId]="'tag-' + tag.id"
                          [name]="'tag-' + tag.id"
                          [ngModel]="draft.tags.includes(tag.id)"
                          (ngModelChange)="toggleTag(tag.id, $event)"
                        /><span>{{ tag.label }}</span>
                      </div></label
                    >
                  }
                }
              </div>
              @if (draft.kind === 0) {
                <h3>{{ 'companyRelationships' | t }}</h3>
                @for (relation of draft.companies; track $index; let index = $index) {
                  <div class="grid gap-3 rounded-lg border p-4">
                    <app-crm-customer-picker
                      [organisation]="organisation"
                      [controlId]="'company-' + index"
                      label="companies"
                      fixedKind="1"
                      [(value)]="relation.companyId"
                    />
                    <div hlmField>
                      <label hlmFieldLabel [for]="'role-' + index">{{
                        'relationshipRole' | t
                      }}</label
                      ><input
                        hlmInput
                        [id]="'role-' + index"
                        [name]="'role-' + index"
                        [(ngModel)]="relation.role"
                        maxlength="100"
                      />
                    </div>
                    <button
                      hlmBtn
                      variant="outline"
                      type="button"
                      (click)="draft.companies.splice(index, 1)"
                    >
                      {{ 'remove' | t }}
                    </button>
                  </div>
                }
                <button
                  hlmBtn
                  variant="outline"
                  type="button"
                  (click)="draft.companies.push({ companyId: '', role: '' })"
                >
                  {{ 'addRelationship' | t }}
                </button>
                @for (field of config.contactFields; track field.id) {
                  @if (!field.retired || fieldValue(field.id)) {
                    <app-business-select
                      [controlId]="'field-' + field.id"
                      [label]="field.label"
                      [options]="field.options"
                      [value]="fieldValue(field.id)"
                      (valueChange)="setField(field.id, $event)"
                    />
                  }
                }
              }
              @if (draft.kind === 2) {
                <app-crm-customer-picker
                  [organisation]="organisation"
                  controlId="deal-customer"
                  [value]="draft.customerId ?? ''"
                  (valueChange)="draft.customerId = $event || null"
                />
                <app-crm-customer-picker
                  [organisation]="organisation"
                  controlId="deal-contact"
                  label="contacts"
                  fixedKind="0"
                  [value]="draft.contactId ?? ''"
                  (valueChange)="draft.contactId = $event || null"
                />
                <div hlmField>
                  <label hlmFieldLabel for="deal-value">{{ 'value' | t }}</label
                  ><input
                    hlmInput
                    id="deal-value"
                    name="value"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    [(ngModel)]="draft.value"
                  />
                </div>
                <app-business-date
                  controlId="deal-close"
                  label="expectedClose"
                  [(value)]="draft.expectedCloseDate"
                />
                <app-business-select
                  controlId="deal-pipeline"
                  label="pipeline"
                  [options]="pipelines()"
                  [allowEmpty]="false"
                  [value]="draft.pipelineId ?? ''"
                  (valueChange)="pipeline($event)"
                />
                <app-business-select
                  controlId="deal-stage"
                  label="stage"
                  [options]="stages()"
                  [allowEmpty]="false"
                  [value]="draft.stageId ?? ''"
                  (valueChange)="draft.stageId = $event"
                />
                <app-business-select
                  controlId="deal-outcome"
                  label="outcome"
                  [options]="outcomes"
                  [allowEmpty]="false"
                  [value]="'' + draft.outcome"
                  (valueChange)="setOutcome($event)"
                />
              }
            </fieldset>
            @if (!archived()) {
              <button hlmBtn [disabled]="busy() || form.invalid">{{ 'save' | t }}</button>
            }
          </form>
        </section>
        @if (draft.kind === 2 && recordId !== 'new' && !archived()) {
          @for (feature of extensions; track feature.id) {
            @for (action of feature.crmDealActions ?? []; track action.segment) {
              @if (features.enabled(action.capability)) {
                <a
                  hlmBtn
                  variant="outline"
                  [routerLink]="['/organisations', organisation, action.segment]"
                  [queryParams]="{ deal: recordId, customer: draft.customerId }"
                  >{{ action.label | t }}</a
                >
              }
            }
          }
        }
        @if (data.value(); as detail) {
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'notes' | t }}</h2>
            </div>
            <div hlmCardContent class="grid gap-4">
              @for (note of detail.notes; track note.id) {
                <article class="border-b pb-4">
                  <p class="whitespace-pre-wrap break-words">{{ note.text }}</p>
                  <small class="text-muted-foreground">{{ i18n.date(note.at) }}</small>
                </article>
              }
              @if (!archived()) {
                <form class="grid gap-3" (ngSubmit)="addNote()">
                  <label hlmFieldLabel for="crm-note">{{ 'addNote' | t }}</label
                  ><textarea
                    hlmTextarea
                    id="crm-note"
                    name="note"
                    [(ngModel)]="note"
                    maxlength="8000"
                    required
                  ></textarea
                  ><button hlmBtn [disabled]="busy() || !note.trim()">{{ 'addNote' | t }}</button>
                </form>
              }
            </div>
          </section>
        }
        @if (recordId !== 'new' && features.enabled('crm-files')) {
          <app-record-attachments [organisation]="organisation" [record]="recordId" kind="crm" />
        }
      }
    </app-page-state>`,
})
export class CrmDetailPage extends BusinessDraft {
  protected draftValue() {
    return this.draft;
  }
  readonly features = inject(Features);
  readonly extensions = inject(FOUNDATION_FEATURES);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly organisation = this.route.snapshot.paramMap.get('id')!;
  readonly recordId = this.route.snapshot.paramMap.get('recordId')!;
  readonly owners = signal<{ id: string; label: string }[]>([]);
  readonly data = new Resource<CrmDetail | null>();
  readonly configuration = signal<CrmConfiguration | null>(null);
  readonly busy = signal(false);
  note = '';
  readonly textFields = ['name', 'email', 'phone', 'address', 'vatNumber'] as const;
  readonly outcomes = [
    { id: '0', label: 'dealOpen' },
    { id: '1', label: 'dealWon' },
    { id: '2', label: 'dealLost' },
  ];
  draft: CrmRecordInput = {
    kind: Number(this.route.snapshot.queryParamMap.get('kind') ?? 0),
    name: '',
    email: '',
    phone: '',
    address: '',
    companies: [],
    customFields: [],
    tags: [],
    ownerId: null,
    lifecycleStatusId: null,
    customerId: null,
    contactId: null,
    value: null,
    expectedCloseDate: null,
    pipelineId: null,
    stageId: null,
    outcome: 0,
  };
  constructor() {
    super();
    void this.load();
    void this.api
      .get<{ items: { userId: string; name: string }[] }>(
        `organisations/${this.organisation}/members`,
        { pageSize: 100 },
      )
      .then((page) => this.owners.set(page.items.map((x) => ({ id: x.userId, label: x.name }))))
      .catch(() => {
        /* The HTTP interceptor reports the error. */
      });
  }
  archived() {
    return this.data.value()?.record.archived ?? false;
  }
  async load() {
    await this.data.load(async (signal) => {
      const [config, detail] = await Promise.all([
        this.api.get<CrmConfiguration>(
          `organisations/${this.organisation}/crm/configuration`,
          {},
          signal,
        ),
        this.recordId === 'new'
          ? Promise.resolve(null)
          : this.api.get<CrmDetail>(
              `organisations/${this.organisation}/crm/${this.recordId}`,
              {},
              signal,
            ),
      ]);
      this.configuration.set(config);
      if (detail) this.draft = structuredClone(detail.record.data);
      else if (this.draft.kind === 2) {
        this.draft.value = 0;
        this.pipeline(config.pipelines[0].id);
      }
      this.markSaved();
      return detail;
    });
  }
  pipelines() {
    return (this.configuration()?.pipelines ?? []).map((x) => ({
      id: x.id,
      label: x.label,
      retired: x.retired,
    }));
  }
  stages() {
    return (
      this.configuration()?.pipelines.find((x) => x.id === this.draft.pipelineId)?.stages ?? []
    );
  }
  pipeline(id: string) {
    this.draft.pipelineId = id;
    this.draft.stageId = this.stages().find((x) => !x.retired)?.id ?? null;
  }
  setOutcome(value: string) {
    this.draft.outcome = Number(value);
  }
  fieldValue(id: string) {
    return this.draft.customFields.find((x) => x.fieldId === id)?.optionId ?? '';
  }
  setField(id: string, value: string) {
    this.draft.customFields = this.draft.customFields.filter((x) => x.fieldId !== id);
    if (value) this.draft.customFields.push({ fieldId: id, optionId: value });
  }
  toggleTag(id: string, value: boolean) {
    this.draft.tags = this.draft.tags.filter((x) => x !== id);
    if (value) this.draft.tags.push(id);
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const record = await this.api.post<CrmRecord>(`organisations/${this.organisation}/crm`, {
        id: this.recordId === 'new' ? null : this.recordId,
        version: this.data.value()?.record.version ?? null,
        data: this.draft,
      });
      if (this.recordId === 'new') {
        this.markSaved();
        await this.router.navigate(['/organisations', this.organisation, 'crm', record.id]);
      } else await this.load();
    } finally {
      this.busy.set(false);
    }
  }
  async addNote() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`organisations/${this.organisation}/crm/${this.recordId}/notes`, {
        text: this.note,
      });
      this.note = '';
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
}
