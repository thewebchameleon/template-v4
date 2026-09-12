import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AuditDetail } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Resource, WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-audit-detail',
  imports: [WorkspaceUi, HlmTableImports],
  template: `
    <app-page-state [state]="data.state()" (retry)="load()">
      @if (data.value(); as detail) {
        <div class="flex flex-col gap-6">
          @if (!detail.schemaVersion) {
            <p hlmAlert>{{ 'auditLegacyHelp' | t }}</p>
          }
          <section class="flex flex-col gap-3" aria-labelledby="audit-summary">
            <h3 id="audit-summary" class="font-semibold">{{ 'auditSummary' | t }}</h3>
            <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              @for (field of fields(); track field.label) {
                <div class="min-w-0">
                  <dt class="text-muted-foreground">{{ field.label | t }}</dt>
                  <dd class="break-words whitespace-pre-wrap">{{ field.value }}</dd>
                </div>
              }
            </dl>
          </section>
          <section class="flex flex-col gap-3" aria-labelledby="audit-changes">
            <h3 id="audit-changes" class="font-semibold">{{ 'auditChanges' | t }}</h3>
            @if (detail.changes.length) {
              <div hlmTableContainer>
                <table hlmTable class="table-fixed" [attr.aria-label]="'auditChanges' | t">
                  <thead hlmTHead>
                    <tr hlmTr>
                      <th hlmTh>{{ 'auditField' | t }}</th>
                      <th hlmTh>{{ 'auditBefore' | t }}</th>
                      <th hlmTh>{{ 'auditAfter' | t }}</th>
                    </tr>
                  </thead>
                  <tbody hlmTBody>
                    @for (change of detail.changes; track $index) {
                      <tr hlmTr>
                        <td hlmTd class="whitespace-normal break-words">
                          {{ label(change.field) }}
                        </td>
                        <td hlmTd class="whitespace-pre-wrap break-words">
                          {{ value(change.before) }}
                        </td>
                        <td hlmTd class="whitespace-pre-wrap break-words">
                          {{ value(change.after) }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-muted-foreground">{{ 'auditNoChanges' | t }}</p>
            }
          </section>
          @if (detail.relatedEntities.length) {
            <section class="flex flex-col gap-3" aria-labelledby="audit-related">
              <h3 id="audit-related" class="font-semibold">{{ 'auditRelated' | t }}</h3>
              @for (entity of detail.relatedEntities; track $index) {
                <p class="break-words">{{ label(entity.type) }} · {{ entity.name || entity.id }}</p>
              }
            </section>
          }
          @if (metadata().length) {
            <section class="flex flex-col gap-3" aria-labelledby="audit-metadata">
              <h3 id="audit-metadata" class="font-semibold">{{ 'auditMetadata' | t }}</h3>
              <dl class="flex flex-col gap-3">
                @for (item of metadata(); track item[0]) {
                  <div>
                    <dt class="text-muted-foreground">{{ label(item[0]) }}</dt>
                    <dd class="break-words whitespace-pre-wrap">{{ item[1] }}</dd>
                  </div>
                }
              </dl>
            </section>
          }
        </div>
      }
    </app-page-state>
  `,
})
export class AuditDetailPanel {
  readonly id = input.required<number>();
  readonly data = new Resource<AuditDetail>();
  readonly i18n = inject(I18n);
  private readonly api = inject(WorkspaceApi);
  readonly metadata = computed(() => Object.entries(this.data.value()?.metadata ?? {}));
  readonly fields = computed(() => {
    this.i18n.culture();
    const detail = this.data.value();
    const entry = detail?.entry;
    return [
      { label: 'auditEventId', value: String(entry?.id ?? '') },
      { label: 'activity', value: this.action(entry?.action) },
      {
        label: 'actionDate',
        value: entry?.at
          ? new Intl.DateTimeFormat(this.i18n.culture(), {
              dateStyle: 'full',
              timeStyle: 'long',
              timeZone: this.i18n.timeZone(),
            }).format(new Date(entry.at))
          : this.missing(),
      },
      { label: 'auditOutcome', value: this.label(detail?.outcome) },
      { label: 'performedBy', value: entry?.actorName || this.label(detail?.actorType) },
      { label: 'auditActorId', value: entry?.actorId || this.missing() },
      { label: 'auditActorType', value: this.label(detail?.actorType) },
      { label: 'relatedRecord', value: entry?.subjectName || this.missing() },
      { label: 'auditSubjectId', value: entry?.subjectId || this.missing() },
      { label: 'auditSubjectType', value: this.label(detail?.subjectType) },
      { label: 'auditSource', value: this.label(detail?.source) },
      { label: 'auditReason', value: detail?.reason || this.missing() },
      {
        label: 'auditFailureCode',
        value: detail?.failureCode || this.i18n.text('auditNotApplicable'),
      },
      { label: 'auditTrace', value: detail?.traceParent || this.missing() },
      {
        label: 'auditSchema',
        value: detail?.schemaVersion ? String(detail.schemaVersion) : this.missing(),
      },
    ];
  });
  constructor() {
    effect(() => {
      this.id();
      untracked(() => void this.load());
    });
  }
  load() {
    this.data.value.set(null);
    return this.data.load((signal) => this.api.get<AuditDetail>(`audit/${this.id()}`, {}, signal));
  }
  missing() {
    return this.i18n.text('auditNotCaptured');
  }
  label(value: string | null | undefined) {
    if (!value) return this.missing();
    const key = 'auditValue.' + value;
    const translated = this.i18n.text(key);
    return translated === key ? value : translated;
  }
  value(value: string | null | undefined) {
    if (value == null) return this.i18n.text('auditNotSet');
    return value === 'True' || value === 'False' ? this.label(value) : value;
  }
  private action(value: string | null | undefined) {
    if (!value) return this.missing();
    const translated = this.i18n.text('audit.' + value);
    return translated === 'audit.' + value ? value : translated;
  }
}
