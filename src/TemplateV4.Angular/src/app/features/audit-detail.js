import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Resource, WorkspaceUi } from '../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/alert";
import * as i4 from "@spartan-ng/helm/table";
import * as i5 from "../core/i18n";
const _forTrack0 = ($index, $item) => $item.label;
const _forTrack1 = ($index, $item) => $item[0];
function AuditDetailPanel_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "auditLegacyHelp"));
} }
function AuditDetailPanel_Conditional_1_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 10);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 13);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const field_r1 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, field_r1.label));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(field_r1.value);
} }
function AuditDetailPanel_Conditional_1_Conditional_13_For_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr", 16)(1, "td", 19);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td", 20);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td", 20);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const change_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.label(change_r2.field), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.value(change_r2.before), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.value(change_r2.after), " ");
} }
function AuditDetailPanel_Conditional_1_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9)(1, "table", 14);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementStart(3, "thead", 15)(4, "tr", 16)(5, "th", 17);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th", 17);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "th", 17);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "tbody", 18);
    i0.ɵɵrepeaterCreate(15, AuditDetailPanel_Conditional_1_Conditional_13_For_16_Template, 7, 3, "tr", 16, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const detail_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "auditChanges"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "auditField"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 8, "auditBefore"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 10, "auditAfter"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(detail_r4.changes);
} }
function AuditDetailPanel_Conditional_1_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "auditNoChanges"));
} }
function AuditDetailPanel_Conditional_1_Conditional_15_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entity_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r2.label(entity_r5.type), " \u00B7 ", entity_r5.name || entity_r5.id);
} }
function AuditDetailPanel_Conditional_1_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 11)(1, "h3", 21);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(4, AuditDetailPanel_Conditional_1_Conditional_15_For_5_Template, 2, 2, "p", 22, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "auditRelated"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(detail_r4.relatedEntities);
} }
function AuditDetailPanel_Conditional_1_Conditional_16_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt", 10);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd", 13);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r6 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.label(item_r6[0]));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r6[1]);
} }
function AuditDetailPanel_Conditional_1_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 12)(1, "h3", 23);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dl", 24);
    i0.ɵɵrepeaterCreate(5, AuditDetailPanel_Conditional_1_Conditional_16_For_6_Template, 5, 2, "div", null, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "auditMetadata"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.metadata());
} }
function AuditDetailPanel_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵconditionalCreate(1, AuditDetailPanel_Conditional_1_Conditional_1_Template, 3, 3, "p", 2);
    i0.ɵɵelementStart(2, "section", 3)(3, "h3", 4);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "dl", 5);
    i0.ɵɵrepeaterCreate(7, AuditDetailPanel_Conditional_1_For_8_Template, 6, 4, "div", 6, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "section", 7)(10, "h3", 8);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, AuditDetailPanel_Conditional_1_Conditional_13_Template, 17, 12, "div", 9)(14, AuditDetailPanel_Conditional_1_Conditional_14_Template, 3, 3, "p", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, AuditDetailPanel_Conditional_1_Conditional_15_Template, 6, 3, "section", 11);
    i0.ɵɵconditionalCreate(16, AuditDetailPanel_Conditional_1_Conditional_16_Template, 7, 3, "section", 12);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r4 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(!detail_r4.schemaVersion ? 1 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "auditSummary"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.fields());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, "auditChanges"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(detail_r4.changes.length ? 13 : 14);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(detail_r4.relatedEntities.length ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.metadata().length ? 16 : -1);
} }
export class AuditDetailPanel {
    id = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "id" }] : /* istanbul ignore next */ []));
    data = new Resource();
    i18n = inject(I18n);
    api = inject(WorkspaceApi);
    metadata = computed(() => Object.entries(this.data.value()?.metadata ?? {}), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "metadata" }] : /* istanbul ignore next */ []));
    fields = computed(() => {
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
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fields" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            this.id();
            untracked(() => void this.load());
        });
    }
    load() {
        this.data.value.set(null);
        return this.data.load((signal) => this.api.get(`audit/${this.id()}`, {}, signal));
    }
    missing() {
        return this.i18n.text('auditNotCaptured');
    }
    label(value) {
        if (!value)
            return this.missing();
        const key = 'auditValue.' + value;
        const translated = this.i18n.text(key);
        return translated === key ? value : translated;
    }
    value(value) {
        if (value == null)
            return this.i18n.text('auditNotSet');
        return value === 'True' || value === 'False' ? this.label(value) : value;
    }
    action(value) {
        if (!value)
            return this.missing();
        const translated = this.i18n.text('audit.' + value);
        return translated === 'audit.' + value ? value : translated;
    }
    static ɵfac = function AuditDetailPanel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuditDetailPanel)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AuditDetailPanel, selectors: [["app-audit-detail"]], inputs: { id: [1, "id"] }, decls: 2, vars: 2, consts: [[3, "retry", "state"], [1, "flex", "flex-col", "gap-6"], ["hlmAlert", ""], ["aria-labelledby", "audit-summary", 1, "flex", "flex-col", "gap-3"], ["id", "audit-summary", 1, "font-semibold"], [1, "grid", "grid-cols-1", "gap-3", "sm:grid-cols-2"], [1, "min-w-0"], ["aria-labelledby", "audit-changes", 1, "flex", "flex-col", "gap-3"], ["id", "audit-changes", 1, "font-semibold"], ["hlmTableContainer", ""], [1, "text-muted-foreground"], ["aria-labelledby", "audit-related", 1, "flex", "flex-col", "gap-3"], ["aria-labelledby", "audit-metadata", 1, "flex", "flex-col", "gap-3"], [1, "break-words", "whitespace-pre-wrap"], ["hlmTable", "", 1, "table-fixed"], ["hlmTHead", ""], ["hlmTr", ""], ["hlmTh", ""], ["hlmTBody", ""], ["hlmTd", "", 1, "whitespace-normal", "break-words"], ["hlmTd", "", 1, "whitespace-pre-wrap", "break-words"], ["id", "audit-related", 1, "font-semibold"], [1, "break-words"], ["id", "audit-metadata", 1, "font-semibold"], [1, "flex", "flex-col", "gap-3"]], template: function AuditDetailPanel_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-state", 0);
            i0.ɵɵlistener("retry", function AuditDetailPanel_Template_app_page_state_retry_0_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(1, AuditDetailPanel_Conditional_1_Template, 17, 10, "div", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵproperty("state", ctx.data.state());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_1_0 = ctx.data.value()) ? 1 : -1, tmp_1_0);
        } }, dependencies: [i1.PageState, i2.FormsModule, i3.HlmAlert, i4.HlmTableContainer, i4.HlmTable, i4.HlmTBody, i4.HlmTd, i4.HlmTh, i4.HlmTHead, i4.HlmTr, i5.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuditDetailPanel, [{
        type: Component,
        args: [{
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
            }]
    }], () => [], { id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AuditDetailPanel, { className: "AuditDetailPanel", filePath: "src/app/features/audit-detail.ts", lineNumber: 88 }); })();
