import { Component, computed, inject, input, signal } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { AuditDetailPanel } from './audit-detail';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, DebouncedSearch, DEFAULT_PAGE_SIZE, } from '../../shared/workspace';
import { DataTable } from '../../shared/data-table';
import { RecordIdentity } from '../../shared/workspace-cells';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n, Translate } from '../../core/i18n';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
import * as i2 from "@spartan-ng/helm/tooltip";
import * as i3 from "../../shared/workspace";
import * as i4 from "@angular/forms";
import * as i5 from "@ng-icons/core";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/badge";
import * as i8 from "@spartan-ng/helm/field";
import * as i9 from "@spartan-ng/helm/input";
import * as i10 from "@spartan-ng/helm/date-picker";
import * as i11 from "@spartan-ng/helm/drawer";
import * as i12 from "../../core/i18n";
const _c0 = () => [];
function AuditPage_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.filterCount());
} }
function AuditPage_hlm_drawer_content_28_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-drawer-content", 23)(1, "hlm-drawer-header")(2, "h2", 24);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 25);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 26)(9, "div", 27)(10, "div", 28)(11, "label", 29);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 30)(15, "hlm-date-picker", 31);
    i0.ɵɵlistener("ngModelChange", function AuditPage_hlm_drawer_content_28_Template_hlm_date_picker_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.fromDraft.set($event)); });
    i0.ɵɵelementStart(16, "hlm-date-picker-trigger", 32);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(19, "button", 33);
    i0.ɵɵlistener("click", function AuditPage_hlm_drawer_content_28_Template_button_click_19_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.fromDraft.set(null)); });
    i0.ɵɵelement(20, "ng-icon", 34);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "div", 28)(22, "label", 35);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 30)(26, "hlm-date-picker", 36);
    i0.ɵɵlistener("ngModelChange", function AuditPage_hlm_drawer_content_28_Template_hlm_date_picker_ngModelChange_26_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.untilDraft.set($event)); });
    i0.ɵɵelementStart(27, "hlm-date-picker-trigger", 37);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(30, "button", 33);
    i0.ɵɵlistener("click", function AuditPage_hlm_drawer_content_28_Template_button_click_30_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.untilDraft.set(null)); });
    i0.ɵɵelement(31, "ng-icon", 34);
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(32, "hlm-drawer-footer")(33, "button", 38);
    i0.ɵɵlistener("click", function AuditPage_hlm_drawer_content_28_Template_button_click_33_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.applyFilters()); });
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 39);
    i0.ɵɵlistener("click", function AuditPage_hlm_drawer_content_28_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.clear()); });
    i0.ɵɵelement(37, "ng-icon", 34);
    i0.ɵɵtext(38);
    i0.ɵɵpipe(39, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 22, "filters"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 24, "auditFiltersHelp"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 26, "fromDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r0.fromDraft())("formatDate", ctx_r0.formatDate)("maxDate", ctx_r0.untilDraft() ?? undefined)("autoCloseOnSelect", true);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 28, "fromDate"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r0.fromDraft());
    i0.ɵɵattribute("aria-label", ctx_r0.i18n.text("clear") + " " + ctx_r0.i18n.text("fromDate"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 30, "untilDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r0.untilDraft())("formatDate", ctx_r0.formatDate)("minDate", ctx_r0.fromDraft() ?? undefined)("autoCloseOnSelect", true);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(29, 32, "untilDate"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r0.untilDraft());
    i0.ɵɵattribute("aria-label", ctx_r0.i18n.text("clear") + " " + ctx_r0.i18n.text("untilDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", !ctx_r0.filtersChanged());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(35, 34, "applyFilters"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r0.hasFilters());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(39, 36, "clearFilters"), " ");
} }
function AuditPage_Conditional_29_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 40)(1, "button", 41);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_1_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.setFiltersOpen(true)); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 42);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_1_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.removeFilter("from")); });
    i0.ɵɵelement(5, "ng-icon", 34);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(3, 3, "fromDate"), ": ", ctx_r0.formatDate(ctx_r0.from), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", ctx_r0.i18n.text("clear") + " " + ctx_r0.i18n.text("fromDate"));
} }
function AuditPage_Conditional_29_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 40)(1, "button", 41);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_2_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.setFiltersOpen(true)); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 42);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_2_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.removeFilter("until")); });
    i0.ɵɵelement(5, "ng-icon", 34);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(3, 3, "untilDate"), ": ", ctx_r0.formatDate(ctx_r0.until), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", ctx_r0.i18n.text("clear") + " " + ctx_r0.i18n.text("untilDate"));
} }
function AuditPage_Conditional_29_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 40)(1, "button", 41);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_3_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.setFiltersOpen(true)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 42);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_3_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.removeFilter("subjectId")); });
    i0.ɵɵelement(4, "ng-icon", 34);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.query.text("subjectName", ctx_r0.i18n.text("relatedRecord")), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", ctx_r0.i18n.text("clear") + " " + ctx_r0.i18n.text("relatedRecord"));
} }
function AuditPage_Conditional_29_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 40)(1, "button", 41);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_4_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.setFiltersOpen(true)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 42);
    i0.ɵɵlistener("click", function AuditPage_Conditional_29_Conditional_4_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.removeFilter("actorId")); });
    i0.ɵɵelement(4, "ng-icon", 34);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.query.text("actorName", ctx_r0.i18n.text("performedBy")), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", ctx_r0.i18n.text("clear") + " " + ctx_r0.i18n.text("performedBy"));
} }
function AuditPage_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵconditionalCreate(1, AuditPage_Conditional_29_Conditional_1_Template, 6, 5, "div", 40);
    i0.ɵɵconditionalCreate(2, AuditPage_Conditional_29_Conditional_2_Template, 6, 5, "div", 40);
    i0.ɵɵconditionalCreate(3, AuditPage_Conditional_29_Conditional_3_Template, 5, 2, "div", 40);
    i0.ɵɵconditionalCreate(4, AuditPage_Conditional_29_Conditional_4_Template, 5, 2, "div", 40);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.from ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.until ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.query.text("subjectId") ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.query.text("actorId") ? 4 : -1);
} }
function AuditPage_hlm_drawer_content_36_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-audit-detail", 45);
} if (rf & 2) {
    i0.ɵɵproperty("id", ctx.id);
} }
function AuditPage_hlm_drawer_content_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-drawer-content", 43)(1, "hlm-drawer-header")(2, "h2", 24);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 25);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 44);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵconditionalCreate(10, AuditPage_hlm_drawer_content_36_Conditional_10_Template, 1, 1, "app-audit-detail", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "hlm-drawer-footer")(12, "button", 46);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "auditDetails"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 7, "auditDetailsHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 9, "auditDetails"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_4_0 = ctx_r0.selected()) ? 10 : -1, tmp_4_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 11, "close"), " ");
} }
const column = createColumnHelper();
class AuditDateCell {
    value = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    static ɵfac = function AuditDateCell_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuditDateCell)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AuditDateCell, selectors: [["app-audit-date-cell"]], inputs: { value: [1, "value"] }, decls: 2, vars: 1, consts: [[1, "inline-block", "min-w-48", "whitespace-nowrap"]], template: function AuditDateCell_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "span", 0);
            i0.ɵɵtext(1);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.value());
        } }, encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuditDateCell, [{
        type: Component,
        args: [{
                selector: 'app-audit-date-cell',
                template: `<span class="inline-block min-w-48 whitespace-nowrap">{{ value() }}</span>`,
            }]
    }], null, { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AuditDateCell, { className: "AuditDateCell", filePath: "src/app/features/audit.ts", lineNumber: 42 }); })();
class RelatedRecordHeader {
    static ɵfac = function RelatedRecordHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RelatedRecordHeader)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RelatedRecordHeader, selectors: [["app-related-record-header"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideInfo })])], decls: 7, vars: 9, consts: [[1, "inline-flex", "items-center", "gap-1"], ["hlmBtn", "", "variant", "ghost", "size", "icon-xs", "type", "button", 3, "hlmTooltip"], ["name", "lucideInfo"]], template: function RelatedRecordHeader_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "span", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "t");
            i0.ɵɵelementStart(3, "button", 1);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelement(6, "ng-icon", 2);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, "relatedRecord"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("hlmTooltip", i0.ɵɵpipeBind1(4, 5, "relatedRecordHelp"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 7, "relatedRecordInfo"));
        } }, dependencies: [NgIcon, i1.HlmButton, i2.HlmTooltip, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RelatedRecordHeader, [{
        type: Component,
        args: [{
                selector: 'app-related-record-header',
                imports: [NgIcon, Translate, HlmButtonImports, HlmTooltipImports],
                providers: [provideIcons({ lucideInfo })],
                template: `
    <span class="inline-flex items-center gap-1">
      {{ 'relatedRecord' | t }}
      <button
        hlmBtn
        variant="ghost"
        size="icon-xs"
        type="button"
        [hlmTooltip]="'relatedRecordHelp' | t"
        [attr.aria-label]="'relatedRecordInfo' | t"
      >
        <ng-icon name="lucideInfo" />
      </button>
    </span>
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RelatedRecordHeader, { className: "RelatedRecordHeader", filePath: "src/app/features/audit.ts", lineNumber: 69 }); })();
export class AuditPage {
    selected = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
    detailsLabel = (entry) => `${this.i18n.text('auditDetails')}: ${this.summary(entry.action)} · ${this.i18n.date(entry.at)}`;
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    data = new Resource();
    query = new ListQuery();
    action = new DebouncedSearch(this.query, 'action');
    filtersOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtersOpen" }] : /* istanbul ignore next */ []));
    fromDraft = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fromDraft" }] : /* istanbul ignore next */ []));
    untilDraft = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "untilDraft" }] : /* istanbul ignore next */ []));
    initialized = false;
    from = null;
    until = null;
    formatDate = (date) => new Intl.DateTimeFormat(this.i18n.culture(), { dateStyle: 'medium' }).format(date);
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor('at', {
                header: this.i18n.text('actionDate'),
                cell: (context) => flexRenderComponent(AuditDateCell, {
                    inputs: { value: this.i18n.date(context.getValue()) },
                }),
            }),
            column.accessor('action', {
                header: this.i18n.text('activity'),
                cell: ({ row }) => flexRenderComponent(RecordIdentity, {
                    inputs: {
                        label: this.summary(row.original.action),
                        constrainWidth: false,
                    },
                }),
            }),
            column.accessor('actorName', {
                header: this.i18n.text('performedBy'),
                cell: ({ row }) => flexRenderComponent(RecordIdentity, {
                    inputs: {
                        label: row.original.actorName ||
                            this.i18n.text(row.original.actorId
                                ? 'deletedAccount'
                                : row.original.action === 'auth.login_failed'
                                    ? 'auditValue.anonymous'
                                    : 'systemActor'),
                        link: row.original.actorId ? '/audit' : null,
                        merge: true,
                        constrainWidth: false,
                        nowrap: true,
                        params: row.original.actorId
                            ? {
                                actorId: row.original.actorId,
                                actorName: row.original.actorName ?? this.i18n.text('deletedAccount'),
                                page: '1',
                            }
                            : {},
                    },
                }),
            }),
            column.accessor('subjectName', {
                header: () => flexRenderComponent(RelatedRecordHeader),
                cell: ({ row }) => flexRenderComponent(RecordIdentity, {
                    inputs: {
                        label: row.original.subjectName || this.i18n.text('systemRecord'),
                        link: row.original.subjectId ? '/audit' : null,
                        merge: true,
                        params: row.original.subjectId
                            ? {
                                subjectId: row.original.subjectId,
                                subjectName: row.original.subjectName ?? this.i18n.text('systemRecord'),
                                page: '1',
                            }
                            : {},
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        this.query.connect(() => {
            this.action.sync(this.query.text('action'));
            if (!this.initialized) {
                this.initialized = true;
                if (!this.query.text('from') && !this.query.text('until')) {
                    const until = new Date();
                    const from = new Date(until);
                    from.setDate(from.getDate() - 7);
                    void this.query.set({
                        from: this.formatQueryDate(from),
                        until: this.formatQueryDate(until),
                        page: 1,
                    });
                    return;
                }
            }
            this.from = this.parseQueryDate(this.query.text('from'));
            this.until = this.parseQueryDate(this.query.text('until'));
            void this.load();
        });
    }
    summary(action) {
        for (const prefix of [
            'role.granted:',
            'role.removed:',
            'user.role_granted:',
            'user.role_removed:',
        ])
            if (action.startsWith(prefix)) {
                const detail = action.slice(prefix.length);
                return (this.i18n.text('audit.' + prefix.slice(0, -1)) +
                    ': ' +
                    (prefix.startsWith('role.') ? this.i18n.text('permission.' + detail) : detail));
            }
        if (action.startsWith('user.security_changed:')) {
            const match = /d:(True|False)>(True|False):r:(.*)>(.*)/.exec(action);
            if (match)
                return `${this.i18n.text('securityChanged')}: ${this.i18n.text(match[2] === 'True' ? 'disabled' : 'active')} · ${match[3] || '—'} → ${match[4] || '—'}`;
        }
        const key = 'audit.' + action;
        const translated = this.i18n.text(key);
        return translated === key ? action.replaceAll('.', ' · ').replaceAll('_', ' ') : translated;
    }
    async load() {
        const params = {
            pageNumber: this.query.page,
            pageSize: DEFAULT_PAGE_SIZE,
            action: this.query.text('action'),
            sort: this.query.text('sort', 'at'),
            direction: this.query.direction('desc'),
        };
        for (const key of ['actorId', 'subjectId'])
            if (this.query.text(key))
                params[key] = this.query.text(key);
        if (this.query.text('from')) {
            const date = new Date(this.query.text('from') + 'T00:00:00');
            if (!Number.isNaN(date.valueOf()))
                params['from'] = date.toISOString();
        }
        if (this.query.text('until')) {
            const date = new Date(this.query.text('until') + 'T23:59:59.999');
            if (!Number.isNaN(date.valueOf()))
                params['until'] = date.toISOString();
        }
        const loaded = await this.data.load((signal) => this.api.get('audit', params, signal));
        if (loaded)
            this.query.clamp(this.data.value()?.total);
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    setFiltersOpen(open) {
        if (open) {
            this.fromDraft.set(this.from);
            this.untilDraft.set(this.until);
        }
        this.filtersOpen.set(open);
    }
    filtersChanged() {
        return (this.formatQueryDate(this.fromDraft()) !== this.query.text('from') ||
            this.formatQueryDate(this.untilDraft()) !== this.query.text('until'));
    }
    applyFilters() {
        if (this.fromDraft() && this.untilDraft() && this.fromDraft() > this.untilDraft())
            return;
        this.filtersOpen.set(false);
        void this.query.set({
            from: this.formatQueryDate(this.fromDraft()),
            until: this.formatQueryDate(this.untilDraft()),
            page: 1,
        });
    }
    filterCount() {
        return (Number(!!this.from) +
            Number(!!this.until) +
            Number(!!this.query.text('actorId')) +
            Number(!!this.query.text('subjectId')));
    }
    hasFilters() {
        return !!this.action.value() || this.filterCount() > 0;
    }
    removeFilter(filter) {
        const values = { [filter]: null, page: 1 };
        if (filter === 'actorId')
            values['actorName'] = null;
        if (filter === 'subjectId')
            values['subjectName'] = null;
        void this.query.set(values);
    }
    parseQueryDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match)
            return null;
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
            ? date
            : null;
    }
    formatQueryDate(date) {
        if (!date)
            return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    clear() {
        this.action.update('');
        this.fromDraft.set(null);
        this.untilDraft.set(null);
        void this.query.set({
            action: null,
            from: null,
            until: null,
            actorName: null,
            subjectName: null,
            actorId: null,
            subjectId: null,
            page: 1,
        });
    }
    static ɵfac = function AuditPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuditPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AuditPage, selectors: [["app-audit"]], features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 37, vars: 41, consts: [["eyebrow", "administration", "title", "auditHistory", "description", "auditIntro"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["name", "lucideRefreshCw"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [1, "workspace-directory-controls"], [1, "workspace-directory-toolbar"], ["hlmField", "", 1, "min-w-0", "flex-1", "sm:max-w-sm"], ["hlmFieldLabel", "", "for", "audit-search", 1, "sr-only"], ["hlmInput", "", "id", "audit-search", "maxlength", "100", 3, "ngModelChange", "ngModel", "placeholder"], ["direction", "right", 3, "stateChanged", "state"], ["hlmBtn", "", "hlmDrawerTrigger", "", "type", "button", "variant", "outline"], ["name", "lucideFunnel", "aria-hidden", "true"], ["hlmBadge", "", "variant", "counter"], ["class", "overflow-hidden sm:max-w-md", 4, "hlmDrawerPortal"], ["aria-live", "polite", 1, "flex", "flex-wrap", "gap-2", "py-3"], [3, "retry", "state", "refreshError"], ["fillColumn", "action", 3, "rowAction", "sortChange", "columns", "rowActionLabel", "data", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "pageChange", "total", "page"], ["class", "overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl", 4, "hlmDrawerPortal"], [1, "overflow-hidden", "sm:max-w-md"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], ["hlmDrawerBody", "", 1, "min-h-0", "flex-1", "overflow-y-auto"], [1, "grid", "gap-4"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "audit-from"], [1, "flex", "items-center", "gap-2"], [1, "min-w-0", "flex-1", 3, "ngModelChange", "ngModel", "formatDate", "maxDate", "autoCloseOnSelect"], ["buttonId", "audit-from", 1, "w-full"], ["hlmBtn", "", "type", "button", "variant", "destructive", "size", "icon", 3, "click", "disabled"], ["name", "lucideFunnelX", "aria-hidden", "true"], ["hlmFieldLabel", "", "for", "audit-until"], [1, "min-w-0", "flex-1", 3, "ngModelChange", "ngModel", "formatDate", "minDate", "autoCloseOnSelect"], ["buttonId", "audit-until", 1, "w-full"], ["hlmBtn", "", "type", "button", 3, "click", "disabled"], ["hlmBtn", "", "type", "button", "variant", "destructive", 3, "click", "disabled"], [1, "inline-flex", "items-center", "gap-1"], ["hlmBtn", "", "variant", "outline", "size", "sm", "type", "button", 3, "click"], ["hlmBtn", "", "variant", "destructive", "size", "icon-sm", "type", "button", 3, "click"], [1, "overflow-hidden", "data-[vaul-drawer-direction=right]:w-full", "data-[vaul-drawer-direction=right]:sm:max-w-2xl"], ["hlmDrawerBody", "", "tabindex", "0", "role", "region", 1, "min-h-0", "flex-1", "overflow-y-auto", "focus-visible:outline-2", "focus-visible:outline-ring", "focus-visible:-outline-offset-2"], [3, "id"], ["hlmBtn", "", "type", "button", "variant", "outline", "hlmDrawerClose", ""]], template: function AuditPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "button", 1);
            i0.ɵɵlistener("click", function AuditPage_Template_button_click_1_listener() { return ctx.load(); });
            i0.ɵɵelement(2, "ng-icon", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "section", 3)(6, "div", 4)(7, "h2", 5);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "p", 6);
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "div", 7)(14, "div", 8)(15, "div", 9)(16, "div", 10)(17, "label", 11);
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "input", 12);
            i0.ɵɵpipe(21, "t");
            i0.ɵɵlistener("ngModelChange", function AuditPage_Template_input_ngModelChange_20_listener($event) { return ctx.action.update($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "hlm-drawer", 13);
            i0.ɵɵlistener("stateChanged", function AuditPage_Template_hlm_drawer_stateChanged_22_listener($event) { return ctx.setFiltersOpen($event === "open"); });
            i0.ɵɵelementStart(23, "button", 14);
            i0.ɵɵelement(24, "ng-icon", 15);
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "t");
            i0.ɵɵconditionalCreate(27, AuditPage_Conditional_27_Template, 2, 1, "span", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(28, AuditPage_hlm_drawer_content_28_Template, 40, 38, "hlm-drawer-content", 17);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(29, AuditPage_Conditional_29_Template, 5, 4, "div", 18);
            i0.ɵɵelementStart(30, "app-page-state", 19);
            i0.ɵɵlistener("retry", function AuditPage_Template_app_page_state_retry_30_listener() { return ctx.load(); });
            i0.ɵɵelementStart(31, "app-data-table", 20);
            i0.ɵɵpipe(32, "t");
            i0.ɵɵpipe(33, "t");
            i0.ɵɵlistener("rowAction", function AuditPage_Template_app_data_table_rowAction_31_listener($event) { return ctx.selected.set($event); })("sortChange", function AuditPage_Template_app_data_table_sortChange_31_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(34, "app-list-pager", 21);
            i0.ɵɵlistener("pageChange", function AuditPage_Template_app_list_pager_pageChange_34_listener($event) { return ctx.query.set({ page: $event }); });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(35, "hlm-drawer", 13);
            i0.ɵɵlistener("stateChanged", function AuditPage_Template_hlm_drawer_stateChanged_35_listener($event) { return $event === "closed" && ctx.selected.set(null); });
            i0.ɵɵtemplate(36, AuditPage_hlm_drawer_content_36_Template, 15, 13, "hlm-drawer-content", 22);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.data.state() === "loading");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(4, 24, "refresh"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 26, "activityLog"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 28, "auditHelp"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 30, "search"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.action.value())("placeholder", i0.ɵɵpipeBind1(21, 32, "auditSearchPlaceholder"));
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.filtersOpen() ? "open" : "closed");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 34, "filters"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.filterCount() ? 27 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.filterCount() ? 29 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("rowActionLabel", ctx.detailsLabel)("data", ctx.data.value()?.items ?? i0.ɵɵpureFunction0(40, _c0))("loading", ctx.data.state() === "loading" || ctx.data.refreshing())("loadingText", i0.ɵɵpipeBind1(32, 36, "loading"))("emptyText", i0.ɵɵpipeBind1(33, 38, "auditEmpty"))("sortColumn", ctx.query.text("sort", "at"))("sortDirection", ctx.query.direction("desc"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("total", ctx.data.value()?.total ?? 0)("page", ctx.query.page);
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.selected() ? "open" : "closed");
        } }, dependencies: [i3.PageHeader, i3.PageState, i3.ListPager, i4.FormsModule, i4.DefaultValueAccessor, i4.NgControlStatus, i4.MaxLengthValidator, i4.NgModel, i5.NgIcon, i1.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmBadge, i8.HlmField, i8.HlmFieldLabel, i9.HlmInput, DataTable, i10.HlmDatePicker, i10.HlmDatePickerTrigger, i11.HlmDrawer, i11.HlmDrawerBody, i11.HlmDrawerClose, i11.HlmDrawerContent, i11.HlmDrawerDescription, i11.HlmDrawerFooter, i11.HlmDrawerHeader, i11.HlmDrawerPortal, i11.HlmDrawerTitle, i11.HlmDrawerTrigger, AuditDetailPanel, i12.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuditPage, [{
        type: Component,
        args: [{
                selector: 'app-audit',
                imports: [WorkspaceUi, DataTable, HlmDatePickerImports, HlmDrawerImports, AuditDetailPanel],
                providers: [workspaceIcons],
                template: ` <app-page-header
      eyebrow="administration"
      title="auditHistory"
      description="auditIntro"
      ><button hlmBtn variant="outline" (click)="load()" [disabled]="data.state() === 'loading'">
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button></app-page-header
    >

    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'activityLog' | t }}</h2>

        <p hlmCardDescription>{{ 'auditHelp' | t }}</p>
      </div>

      <div hlmCardContent>
        <div class="workspace-directory-controls">
          <div class="workspace-directory-toolbar">
            <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
              <label hlmFieldLabel class="sr-only" for="audit-search">{{ 'search' | t }}</label>
              <input
                hlmInput
                id="audit-search"
                [ngModel]="action.value()"
                (ngModelChange)="action.update($event)"
                maxlength="100"
                [placeholder]="'auditSearchPlaceholder' | t"
              />
            </div>
            <hlm-drawer
              direction="right"
              [state]="filtersOpen() ? 'open' : 'closed'"
              (stateChanged)="setFiltersOpen($event === 'open')"
            >
              <button hlmBtn hlmDrawerTrigger type="button" variant="outline">
                <ng-icon name="lucideFunnel" aria-hidden="true" />
                {{ 'filters' | t }}
                @if (filterCount()) {
                  <span hlmBadge variant="counter">{{ filterCount() }}</span>
                }
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'filters' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'auditFiltersHelp' | t }}</p>
                </hlm-drawer-header>
                <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                  <div class="grid gap-4">
                    <div hlmField>
                      <label hlmFieldLabel for="audit-from">{{ 'fromDate' | t }}</label>
                      <div class="flex items-center gap-2">
                        <hlm-date-picker
                          class="min-w-0 flex-1"
                          [ngModel]="fromDraft()"
                          (ngModelChange)="fromDraft.set($event)"
                          [formatDate]="formatDate"
                          [maxDate]="untilDraft() ?? undefined"
                          [autoCloseOnSelect]="true"
                        >
                          <hlm-date-picker-trigger class="w-full" buttonId="audit-from">
                            {{ 'fromDate' | t }}
                          </hlm-date-picker-trigger>
                        </hlm-date-picker>
                        <button
                          hlmBtn
                          type="button"
                          variant="destructive"
                          size="icon"
                          [disabled]="!fromDraft()"
                          [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('fromDate')"
                          (click)="fromDraft.set(null)"
                        >
                          <ng-icon name="lucideFunnelX" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div hlmField>
                      <label hlmFieldLabel for="audit-until">{{ 'untilDate' | t }}</label>
                      <div class="flex items-center gap-2">
                        <hlm-date-picker
                          class="min-w-0 flex-1"
                          [ngModel]="untilDraft()"
                          (ngModelChange)="untilDraft.set($event)"
                          [formatDate]="formatDate"
                          [minDate]="fromDraft() ?? undefined"
                          [autoCloseOnSelect]="true"
                        >
                          <hlm-date-picker-trigger class="w-full" buttonId="audit-until">
                            {{ 'untilDate' | t }}
                          </hlm-date-picker-trigger>
                        </hlm-date-picker>
                        <button
                          hlmBtn
                          type="button"
                          variant="destructive"
                          size="icon"
                          [disabled]="!untilDraft()"
                          [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('untilDate')"
                          (click)="untilDraft.set(null)"
                        >
                          <ng-icon name="lucideFunnelX" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <hlm-drawer-footer>
                  <button
                    hlmBtn
                    type="button"
                    [disabled]="!filtersChanged()"
                    (click)="applyFilters()"
                  >
                    {{ 'applyFilters' | t }}
                  </button>
                  <button
                    hlmBtn
                    type="button"
                    variant="destructive"
                    [disabled]="!hasFilters()"
                    (click)="clear()"
                  >
                    <ng-icon name="lucideFunnelX" aria-hidden="true" />
                    {{ 'clearFilters' | t }}
                  </button>
                </hlm-drawer-footer>
              </hlm-drawer-content>
            </hlm-drawer>
          </div>
        </div>

        @if (filterCount()) {
          <div class="flex flex-wrap gap-2 py-3" aria-live="polite">
            @if (from) {
              <div class="inline-flex items-center gap-1">
                <button
                  hlmBtn
                  variant="outline"
                  size="sm"
                  type="button"
                  (click)="setFiltersOpen(true)"
                >
                  {{ 'fromDate' | t }}: {{ formatDate(from) }}
                </button>
                <button
                  hlmBtn
                  variant="destructive"
                  size="icon-sm"
                  type="button"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('fromDate')"
                  (click)="removeFilter('from')"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            }
            @if (until) {
              <div class="inline-flex items-center gap-1">
                <button
                  hlmBtn
                  variant="outline"
                  size="sm"
                  type="button"
                  (click)="setFiltersOpen(true)"
                >
                  {{ 'untilDate' | t }}: {{ formatDate(until) }}
                </button>
                <button
                  hlmBtn
                  variant="destructive"
                  size="icon-sm"
                  type="button"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('untilDate')"
                  (click)="removeFilter('until')"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            }
            @if (query.text('subjectId')) {
              <div class="inline-flex items-center gap-1">
                <button
                  hlmBtn
                  variant="outline"
                  size="sm"
                  type="button"
                  (click)="setFiltersOpen(true)"
                >
                  {{ query.text('subjectName', i18n.text('relatedRecord')) }}
                </button>
                <button
                  hlmBtn
                  variant="destructive"
                  size="icon-sm"
                  type="button"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('relatedRecord')"
                  (click)="removeFilter('subjectId')"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            }
            @if (query.text('actorId')) {
              <div class="inline-flex items-center gap-1">
                <button
                  hlmBtn
                  variant="outline"
                  size="sm"
                  type="button"
                  (click)="setFiltersOpen(true)"
                >
                  {{ query.text('actorName', i18n.text('performedBy')) }}
                </button>
                <button
                  hlmBtn
                  variant="destructive"
                  size="icon-sm"
                  type="button"
                  [attr.aria-label]="i18n.text('clear') + ' ' + i18n.text('performedBy')"
                  (click)="removeFilter('actorId')"
                >
                  <ng-icon name="lucideFunnelX" aria-hidden="true" />
                </button>
              </div>
            }
          </div>
        }

        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [rowActionLabel]="detailsLabel"
            (rowAction)="selected.set($event)"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            fillColumn="action"
            [emptyText]="'auditEmpty' | t"
            [sortColumn]="query.text('sort', 'at')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)" /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>
    <hlm-drawer
      direction="right"
      [state]="selected() ? 'open' : 'closed'"
      (stateChanged)="$event === 'closed' && selected.set(null)"
    >
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'auditDetails' | t }}</h2>
          <p hlmDrawerDescription>{{ 'auditDetailsHelp' | t }}</p>
        </hlm-drawer-header>
        <div
          hlmDrawerBody
          tabindex="0"
          role="region"
          [attr.aria-label]="'auditDetails' | t"
          class="min-h-0 flex-1 overflow-y-auto focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
        >
          @if (selected(); as entry) {
            <app-audit-detail [id]="entry.id!" />
          }
        </div>
        <hlm-drawer-footer
          ><button hlmBtn type="button" variant="outline" hlmDrawerClose>
            {{ 'close' | t }}
          </button></hlm-drawer-footer
        >
      </hlm-drawer-content>
    </hlm-drawer>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AuditPage, { className: "AuditPage", filePath: "src/app/features/audit.ts", lineNumber: 358 }); })();
