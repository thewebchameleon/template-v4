import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronsUpDown, lucideChevronUp } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { FlexRender, injectTable, rowSortingFeature, tableFeatures, } from '@tanstack/angular-table';
import * as i0 from "@angular/core";
import * as i1 from "@tanstack/angular-table";
import * as i2 from "@spartan-ng/helm/button";
import * as i3 from "@spartan-ng/helm/empty";
import * as i4 from "@spartan-ng/helm/spinner";
import * as i5 from "@spartan-ng/helm/table";
const _forTrack0 = ($index, $item) => $item.id;
function DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_0_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtext(1);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const headerContent_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", headerContent_r4, " ");
} }
function DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵlistener("click", function DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const header_r2 = i0.ɵɵnextContext(2).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.toggleSort(header_r2.column.id)); });
    i0.ɵɵtemplate(1, DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_0_ng_container_1_Template, 2, 1, "ng-container", 13);
    i0.ɵɵelement(2, "ng-icon", 14);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const header_r2 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("flexRender", header_r2.column.columnDef.header)("flexRenderProps", header_r2.getContext());
    i0.ɵɵadvance();
    i0.ɵɵproperty("name", ctx_r2.sortIcon(header_r2.column.id));
} }
function DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_1_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const headerContent_r5 = ctx.$implicit;
    const header_r2 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵclassProp("sr-only", header_r2.column.id === "actions");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", headerContent_r5, " ");
} }
function DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_1_ng_container_0_Template, 3, 3, "ng-container", 13);
} if (rf & 2) {
    const header_r2 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵproperty("flexRender", header_r2.column.columnDef.header)("flexRenderProps", header_r2.getContext());
} }
function DataTable_Conditional_3_For_2_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_0_Template, 3, 3, "button", 11)(1, DataTable_Conditional_3_For_2_For_2_Conditional_1_Conditional_1_Template, 1, 2, "ng-container");
} if (rf & 2) {
    const header_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵconditional(header_r2.column.getCanSort() ? 0 : 1);
} }
function DataTable_Conditional_3_For_2_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 10);
    i0.ɵɵconditionalCreate(1, DataTable_Conditional_3_For_2_For_2_Conditional_1_Template, 2, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const header_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("w-full", header_r2.column.id === ctx_r2.fillColumn());
    i0.ɵɵattribute("colspan", header_r2.colSpan)("aria-sort", ctx_r2.ariaSort(header_r2.column.id));
    i0.ɵɵadvance();
    i0.ɵɵconditional(!header_r2.isPlaceholder ? 1 : -1);
} }
function DataTable_Conditional_3_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr", 7);
    i0.ɵɵrepeaterCreate(1, DataTable_Conditional_3_For_2_For_2_Template, 2, 5, "th", 9, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const headerGroup_r6 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵrepeater(headerGroup_r6.headers);
} }
function DataTable_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "thead", 4);
    i0.ɵɵrepeaterCreate(1, DataTable_Conditional_3_For_2_Template, 3, 0, "tr", 7, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.table.getHeaderGroups());
} }
function DataTable_For_6_For_2_ng_template_1_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtext(1);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const cellContent_r9 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", cellContent_r9, " ");
} }
function DataTable_For_6_For_2_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, DataTable_For_6_For_2_ng_template_1_ng_container_0_Template, 2, 1, "ng-container", 13);
} if (rf & 2) {
    const cell_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("flexRender", cell_r10.column.columnDef.cell)("flexRenderProps", cell_r10.getContext());
} }
function DataTable_For_6_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 20);
    i0.ɵɵlistener("click", function DataTable_For_6_For_2_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const row_r8 = i0.ɵɵnextContext(2).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.rowAction.emit(row_r8.original)); });
    i0.ɵɵelementContainer(1, 19);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const renderedCell_r12 = i0.ɵɵreference(2);
    const row_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", ctx_r2.rowActionLabel()?.(row_r8.original));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", renderedCell_r12);
} }
function DataTable_For_6_For_2_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 19);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const renderedCell_r12 = i0.ɵɵreference(2);
    i0.ɵɵproperty("ngTemplateOutlet", renderedCell_r12);
} }
function DataTable_For_6_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 17);
    i0.ɵɵtemplate(1, DataTable_For_6_For_2_ng_template_1_Template, 1, 2, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵconditionalCreate(3, DataTable_For_6_For_2_Conditional_3_Template, 2, 2, "button", 18)(4, DataTable_For_6_For_2_Conditional_4_Template, 1, 1, "ng-container", 19);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cell_r10 = ctx.$implicit;
    const ɵ$index_40_r13 = ctx.$index;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("w-full", cell_r10.column.id === ctx_r2.fillColumn())("text-end", cell_r10.column.id === "actions");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.rowActionLabel() && ɵ$index_40_r13 === 0 ? 3 : 4);
} }
function DataTable_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 15);
    i0.ɵɵlistener("click", function DataTable_For_6_Template_tr_click_0_listener($event) { const row_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.activateRow($event, row_r8.original)); })("keydown", function DataTable_For_6_Template_tr_keydown_0_listener($event) { const row_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.rowKeydown($event, row_r8.original)); })("dragstart", function DataTable_For_6_Template_tr_dragstart_0_listener($event) { const row_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.rowDragStart.emit({ event: $event, row: row_r8.original })); })("dragend", function DataTable_For_6_Template_tr_dragend_0_listener($event) { const row_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.rowDragEnd.emit({ event: $event, row: row_r8.original })); })("dragover", function DataTable_For_6_Template_tr_dragover_0_listener($event) { const row_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.rowDragOver.emit({ event: $event, row: row_r8.original })); })("dragleave", function DataTable_For_6_Template_tr_dragleave_0_listener($event) { const row_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.rowDragLeave.emit({ event: $event, row: row_r8.original })); })("drop", function DataTable_For_6_Template_tr_drop_0_listener($event) { const row_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.rowDrop.emit({ event: $event, row: row_r8.original })); });
    i0.ɵɵrepeaterCreate(1, DataTable_For_6_For_2_Template, 5, 5, "td", 16, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r8 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("cursor-pointer", !!ctx_r2.rowActionLabel())("opacity-50", ctx_r2.rowDragging()?.(row_r8.original))("file-storage-drop-target", ctx_r2.rowDropActive()?.(row_r8.original));
    i0.ɵɵattribute("draggable", ctx_r2.rowDraggable()?.(row_r8.original) ? "true" : null);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(row_r8.getAllCells());
} }
function DataTable_ForEmpty_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr", 7)(1, "td", 21)(2, "div", 22)(3, "div", 23)(4, "p", 24);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("colspan", ctx_r2.columns().length);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.emptyText());
} }
function DataTable_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵelement(1, "hlm-spinner", 25);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵariaProperty("aria-label", ctx_r2.loadingText());
} }
export const dataTableFeatures = tableFeatures({ rowSortingFeature });
export class DataTable {
    columns = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    data = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []));
    emptyText = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyText" }] : /* istanbul ignore next */ []));
    loading = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    loadingText = input('Loading…', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingText" }] : /* istanbul ignore next */ []));
    fillColumn = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "fillColumn" }] : /* istanbul ignore next */ []));
    hideHeader = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hideHeader" }] : /* istanbul ignore next */ []));
    ariaLabel = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    getRowId = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "getRowId" }] : /* istanbul ignore next */ []));
    sortColumn = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortColumn" }] : /* istanbul ignore next */ []));
    sortDirection = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortDirection" }] : /* istanbul ignore next */ []));
    sortChange = output();
    rowActionLabel = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "rowActionLabel" }] : /* istanbul ignore next */ []));
    rowAction = output();
    rowDraggable = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "rowDraggable" }] : /* istanbul ignore next */ []));
    rowDragging = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "rowDragging" }] : /* istanbul ignore next */ []));
    rowDropActive = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "rowDropActive" }] : /* istanbul ignore next */ []));
    rowDragStart = output();
    rowDragEnd = output();
    rowDragOver = output();
    rowDragLeave = output();
    rowDrop = output();
    activateRow(event, row) {
        if (!this.rowActionLabel() ||
            this.loading() ||
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            window.getSelection()?.toString())
            return;
        const target = event.target;
        if (!(target instanceof Element) ||
            target.closest('button, a, input, select, textarea, [role="button"], [role="checkbox"]'))
            return;
        event.currentTarget
            .querySelector('[data-row-action]')
            ?.focus();
        this.rowAction.emit(row);
    }
    rowKeydown(event, row) {
        if (event.target !== event.currentTarget || !this.rowActionLabel() || this.loading())
            return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.rowAction.emit(row);
        }
    }
    table = injectTable(() => ({
        features: dataTableFeatures,
        columns: this.columns(),
        data: this.data(),
        manualSorting: true,
        getRowId: this.getRowId() ??
            ((row, index) => String(row.id ?? index)),
    }));
    ariaSort(column) {
        return column === this.sortColumn()
            ? this.sortDirection() === 'asc'
                ? 'ascending'
                : 'descending'
            : null;
    }
    sortIcon(column) {
        if (column !== this.sortColumn())
            return 'lucideChevronsUpDown';
        return this.sortDirection() === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown';
    }
    toggleSort(column) {
        this.sortChange.emit({
            column,
            direction: column === this.sortColumn() && this.sortDirection() === 'asc' ? 'desc' : 'asc',
        });
    }
    static ɵfac = function DataTable_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DataTable)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DataTable, selectors: [["app-data-table"]], inputs: { columns: [1, "columns"], data: [1, "data"], emptyText: [1, "emptyText"], loading: [1, "loading"], loadingText: [1, "loadingText"], fillColumn: [1, "fillColumn"], hideHeader: [1, "hideHeader"], ariaLabel: [1, "ariaLabel"], getRowId: [1, "getRowId"], sortColumn: [1, "sortColumn"], sortDirection: [1, "sortDirection"], rowActionLabel: [1, "rowActionLabel"], rowDraggable: [1, "rowDraggable"], rowDragging: [1, "rowDragging"], rowDropActive: [1, "rowDropActive"] }, outputs: { sortChange: "sortChange", rowAction: "rowAction", rowDragStart: "rowDragStart", rowDragEnd: "rowDragEnd", rowDragOver: "rowDragOver", rowDragLeave: "rowDragLeave", rowDrop: "rowDrop" }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronDown, lucideChevronsUpDown, lucideChevronUp })])], decls: 9, vars: 10, consts: [["renderedCell", ""], [1, "relative", "-mx-(--card-spacing)", "w-[calc(100%+var(--card-spacing)+var(--card-spacing))]", "overflow-hidden", "rounded-t-[var(--data-table-top-radius,0px)]", "border-y"], ["hlmTableContainer", ""], ["hlmTable", ""], ["hlmTHead", ""], ["hlmTBody", ""], ["hlmTr", "", 3, "cursor-pointer", "opacity-50", "file-storage-drop-target"], ["hlmTr", ""], [1, "absolute", "inset-0", "flex", "items-center", "justify-center", "bg-background/30"], ["hlmTh", "", 1, "first:ps-(--card-spacing)", "last:pe-(--card-spacing)", 3, "w-full"], ["hlmTh", "", 1, "first:ps-(--card-spacing)", "last:pe-(--card-spacing)"], ["hlmBtn", "", "type", "button", "variant", "ghost", "size", "sm", 1, "-ms-[calc(var(--spacing)*2.5+1px)]"], ["hlmBtn", "", "type", "button", "variant", "ghost", "size", "sm", 1, "-ms-[calc(var(--spacing)*2.5+1px)]", 3, "click"], [4, "flexRender", "flexRenderProps"], ["aria-hidden", "true", 3, "name"], ["hlmTr", "", 3, "click", "keydown", "dragstart", "dragend", "dragover", "dragleave", "drop"], ["hlmTd", "", 1, "first:ps-(--card-spacing)", "last:pe-(--card-spacing)", 3, "w-full", "text-end"], ["hlmTd", "", 1, "first:ps-(--card-spacing)", "last:pe-(--card-spacing)"], ["hlmBtn", "", "type", "button", "variant", "link", "data-row-action", "", "aria-haspopup", "dialog", 1, "h-auto", "whitespace-normal", "p-0", "text-start"], [3, "ngTemplateOutlet"], ["hlmBtn", "", "type", "button", "variant", "link", "data-row-action", "", "aria-haspopup", "dialog", 1, "h-auto", "whitespace-normal", "p-0", "text-start", 3, "click"], ["hlmTd", "", 1, "h-14", "ps-(--card-spacing)", "pe-(--card-spacing)", "text-center"], ["hlmEmpty", "", "variant", "compact", "role", "status"], ["hlmEmptyHeader", "", "variant", "compact"], ["hlmEmptyTitle", "", "variant", "compact"], [3, "aria-label"]], template: function DataTable_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 1)(1, "div", 2)(2, "table", 3);
            i0.ɵɵconditionalCreate(3, DataTable_Conditional_3_Template, 3, 0, "thead", 4);
            i0.ɵɵelementStart(4, "tbody", 5);
            i0.ɵɵrepeaterCreate(5, DataTable_For_6_Template, 3, 7, "tr", 6, _forTrack0, false, DataTable_ForEmpty_7_Template, 6, 2, "tr", 7);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(8, DataTable_Conditional_8_Template, 2, 1, "div", 8);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassProp("min-h-24", ctx.loading());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("blur-sm", ctx.loading());
            i0.ɵɵattribute("inert", ctx.loading() ? "" : null);
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-busy", ctx.loading())("aria-label", ctx.ariaLabel() || null);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.hideHeader() ? 3 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.table.getRowModel().rows);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.loading() ? 8 : -1);
        } }, dependencies: [i1.FlexRenderDirective, NgTemplateOutlet,
            NgIcon, i2.HlmButton, i3.HlmEmpty, i3.HlmEmptyHeader, i3.HlmEmptyTitle, i4.HlmSpinner, i5.HlmTableContainer, i5.HlmTable, i5.HlmTBody, i5.HlmTd, i5.HlmTh, i5.HlmTHead, i5.HlmTr], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DataTable, [{
        type: Component,
        args: [{
                selector: 'app-data-table',
                imports: [
                    FlexRender,
                    NgTemplateOutlet,
                    NgIcon,
                    HlmButtonImports,
                    HlmEmptyImports,
                    HlmSpinnerImports,
                    HlmTableImports,
                ],
                providers: [provideIcons({ lucideChevronDown, lucideChevronsUpDown, lucideChevronUp })],
                template: `
    <div
      class="relative -mx-(--card-spacing) w-[calc(100%+var(--card-spacing)+var(--card-spacing))] overflow-hidden rounded-t-[var(--data-table-top-radius,0px)] border-y"
      [class.min-h-24]="loading()"
    >
      <div hlmTableContainer [class.blur-sm]="loading()" [attr.inert]="loading() ? '' : null">
        <table hlmTable [attr.aria-busy]="loading()" [attr.aria-label]="ariaLabel() || null">
          @if (!hideHeader()) {
            <thead hlmTHead>
              @for (headerGroup of table.getHeaderGroups(); track headerGroup.id) {
                <tr hlmTr>
                  @for (header of headerGroup.headers; track header.id) {
                    <th
                      hlmTh
                      class="first:ps-(--card-spacing) last:pe-(--card-spacing)"
                      [class.w-full]="header.column.id === fillColumn()"
                      [attr.colspan]="header.colSpan"
                      [attr.aria-sort]="ariaSort(header.column.id)"
                    >
                      @if (!header.isPlaceholder) {
                        @if (header.column.getCanSort()) {
                          <button
                            hlmBtn
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="-ms-[calc(var(--spacing)*2.5+1px)]"
                            (click)="toggleSort(header.column.id)"
                          >
                            <ng-container
                              *flexRender="
                                header.column.columnDef.header;
                                props: header.getContext();
                                let headerContent
                              "
                            >
                              {{ headerContent }}
                            </ng-container>
                            <ng-icon [name]="sortIcon(header.column.id)" aria-hidden="true" />
                          </button>
                        } @else {
                          <ng-container
                            *flexRender="
                              header.column.columnDef.header;
                              props: header.getContext();
                              let headerContent
                            "
                          >
                            <span [class.sr-only]="header.column.id === 'actions'">
                              {{ headerContent }}
                            </span>
                          </ng-container>
                        }
                      }
                    </th>
                  }
                </tr>
              }
            </thead>
          }
          <tbody hlmTBody>
            @for (row of table.getRowModel().rows; track row.id) {
              <tr
                hlmTr
                [class.cursor-pointer]="!!rowActionLabel()"
                [attr.draggable]="rowDraggable()?.(row.original) ? 'true' : null"
                [class.opacity-50]="rowDragging()?.(row.original)"
                [class.file-storage-drop-target]="rowDropActive()?.(row.original)"
                (click)="activateRow($event, row.original)"
                (keydown)="rowKeydown($event, row.original)"
                (dragstart)="rowDragStart.emit({ event: $event, row: row.original })"
                (dragend)="rowDragEnd.emit({ event: $event, row: row.original })"
                (dragover)="rowDragOver.emit({ event: $event, row: row.original })"
                (dragleave)="rowDragLeave.emit({ event: $event, row: row.original })"
                (drop)="rowDrop.emit({ event: $event, row: row.original })"
              >
                @for (cell of row.getAllCells(); track cell.id; let first = $first) {
                  <td
                    hlmTd
                    class="first:ps-(--card-spacing) last:pe-(--card-spacing)"
                    [class.w-full]="cell.column.id === fillColumn()"
                    [class.text-end]="cell.column.id === 'actions'"
                  >
                    <ng-template #renderedCell
                      ><ng-container
                        *flexRender="
                          cell.column.columnDef.cell;
                          props: cell.getContext();
                          let cellContent
                        "
                      >
                        {{ cellContent }}
                      </ng-container></ng-template
                    >
                    @if (rowActionLabel() && first) {
                      <button
                        hlmBtn
                        type="button"
                        variant="link"
                        class="h-auto whitespace-normal p-0 text-start"
                        data-row-action
                        aria-haspopup="dialog"
                        [attr.aria-label]="rowActionLabel()?.(row.original)"
                        (click)="rowAction.emit(row.original)"
                      >
                        <ng-container [ngTemplateOutlet]="renderedCell" />
                      </button>
                    } @else {
                      <ng-container [ngTemplateOutlet]="renderedCell" />
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr hlmTr>
                <td
                  hlmTd
                  class="h-14 ps-(--card-spacing) pe-(--card-spacing) text-center"
                  [attr.colspan]="columns().length"
                >
                  <div hlmEmpty variant="compact" role="status">
                    <div hlmEmptyHeader variant="compact">
                      <p hlmEmptyTitle variant="compact">{{ emptyText() }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (loading()) {
        <div class="absolute inset-0 flex items-center justify-center bg-background/30">
          <hlm-spinner [aria-label]="loadingText()" />
        </div>
      }
    </div>
  `,
            }]
    }], null, { columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], data: [{ type: i0.Input, args: [{ isSignal: true, alias: "data", required: true }] }], emptyText: [{ type: i0.Input, args: [{ isSignal: true, alias: "emptyText", required: true }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], loadingText: [{ type: i0.Input, args: [{ isSignal: true, alias: "loadingText", required: false }] }], fillColumn: [{ type: i0.Input, args: [{ isSignal: true, alias: "fillColumn", required: false }] }], hideHeader: [{ type: i0.Input, args: [{ isSignal: true, alias: "hideHeader", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaLabel", required: false }] }], getRowId: [{ type: i0.Input, args: [{ isSignal: true, alias: "getRowId", required: false }] }], sortColumn: [{ type: i0.Input, args: [{ isSignal: true, alias: "sortColumn", required: true }] }], sortDirection: [{ type: i0.Input, args: [{ isSignal: true, alias: "sortDirection", required: true }] }], sortChange: [{ type: i0.Output, args: ["sortChange"] }], rowActionLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowActionLabel", required: false }] }], rowAction: [{ type: i0.Output, args: ["rowAction"] }], rowDraggable: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowDraggable", required: false }] }], rowDragging: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowDragging", required: false }] }], rowDropActive: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowDropActive", required: false }] }], rowDragStart: [{ type: i0.Output, args: ["rowDragStart"] }], rowDragEnd: [{ type: i0.Output, args: ["rowDragEnd"] }], rowDragOver: [{ type: i0.Output, args: ["rowDragOver"] }], rowDragLeave: [{ type: i0.Output, args: ["rowDragLeave"] }], rowDrop: [{ type: i0.Output, args: ["rowDrop"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DataTable, { className: "DataTable", filePath: "src/app/shared/data-table.ts", lineNumber: 181 }); })();
