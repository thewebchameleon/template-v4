import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { FileStorageDemoBanner } from './file-storage-demo-banner';
import { NgTemplateOutlet } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronsUpDown, lucideChevronUp, lucideUserPlus, } from '@ng-icons/lucide';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { FileStorageFileIcon, FileStorageFileName, FileStorageFileActions, FileStorageActionDialog, FileStorageNavigation, fileGroups, } from './file-storage-components';
import { ActivatedRoute } from '@angular/router';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { FileQuotaEditor } from '../../../../../src/TemplateV4.Angular/src/app/features/file-storage/configuration/file-quota-editor';
import { Component, computed, effect, untracked, inject, signal, viewChild } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery, DebouncedSearch, Confirmations, protectUnload, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { DataTable } from '../../../../../src/TemplateV4.Angular/src/app/shared/data-table';
import { canMoveEntry } from './file-storage-ui';
import { simulateSlowUpload } from './file-storage-upload';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { Notifications } from '../../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';
import * as i0 from "@angular/core";
import * as i1 from "../../../../../src/TemplateV4.Angular/src/app/shared/workspace";
import * as i2 from "../../../../../src/TemplateV4.Angular/src/app/shared/view-mode-toggle";
import * as i3 from "@angular/forms";
import * as i4 from "@angular/router";
import * as i5 from "@ng-icons/core";
import * as i6 from "@spartan-ng/helm/button";
import * as i7 from "@spartan-ng/helm/card";
import * as i8 from "@spartan-ng/helm/badge";
import * as i9 from "@spartan-ng/helm/field";
import * as i10 from "@spartan-ng/helm/input";
import * as i11 from "@spartan-ng/helm/empty";
import * as i12 from "@spartan-ng/helm/alert";
import * as i13 from "@spartan-ng/helm/checkbox";
import * as i14 from "@spartan-ng/helm/drawer";
import * as i15 from "@spartan-ng/helm/dialog";
import * as i16 from "@spartan-ng/helm/select";
import * as i17 from "../../../../../src/TemplateV4.Angular/src/app/core/i18n";
const _c0 = () => [];
const _c1 = a0 => ({ $implicit: a0 });
const _c2 = () => ({ column: "name", label: "fileName" });
const _c3 = () => ({ column: "size", label: "fileSize" });
const _c4 = () => ({ column: "updatedAt", label: "updatedAt" });
const _c5 = (a0, a1, a2) => [a0, a1, a2];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.column;
const _forTrack2 = ($index, $item) => $item.category;
const _forTrack3 = ($index, $item) => $item.label;
function FileStoragePage_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 35);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_1_Template_button_click_0_listener() { const folder_r2 = i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.detail(folder_r2, "fileDetails")); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "folderDetails"), " ");
} }
function FileStoragePage_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.showUpload()); });
    i0.ɵɵelement(1, "ng-icon", 37);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 38);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_2_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openCreateFolder()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "uploadFiles"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 5, "createFolder"), " ");
} }
function FileStoragePage_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 39);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.emptyTrash()); });
    i0.ɵɵelement(1, "ng-icon", 40);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 2, "emptyTrash"), " ");
} }
function FileStoragePage_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(2, 2, "viewingUserFiles"), ": ", ctx_r2.data.value()?.ownerName, " ");
} }
function FileStoragePage_ng_template_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 42);
} }
function FileStoragePage_ng_template_6_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-my-file-icon", 43);
} if (rf & 2) {
    const file_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("file", file_r7);
} }
function FileStoragePage_ng_template_6_Conditional_6_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 48);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "important"));
} }
function FileStoragePage_ng_template_6_Conditional_6_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 48);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "starred"));
} }
function FileStoragePage_ng_template_6_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 47);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, FileStoragePage_ng_template_6_Conditional_6_Conditional_3_Template, 3, 3, "span", 48);
    i0.ɵɵconditionalCreate(4, FileStoragePage_ng_template_6_Conditional_6_Conditional_4_Template, 3, 3, "span", 48);
} if (rf & 2) {
    const file_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", file_r7.isFolder ? i0.ɵɵpipeBind1(2, 4, "folder") : ctx_r2.bytes(file_r7.size), " \u00B7 ", ctx_r2.i18n.date(file_r7.updatedAt || file_r7.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(file_r7.important ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(file_r7.starred ? 4 : -1);
} }
function FileStoragePage_ng_template_6_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-my-file-actions", 46);
} if (rf & 2) {
    const file_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("name", file_r7.name)("actions", ctx_r2.inlineActions(file_r7, ctx_r2.busy()));
} }
function FileStoragePage_ng_template_6_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 41);
    i0.ɵɵlistener("click", function FileStoragePage_ng_template_6_Template_button_click_0_listener() { const file_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openEntry(file_r7)); });
    i0.ɵɵconditionalCreate(1, FileStoragePage_ng_template_6_Conditional_1_Template, 1, 0, "ng-icon", 42)(2, FileStoragePage_ng_template_6_Conditional_2_Template, 1, 1, "app-my-file-icon", 43);
    i0.ɵɵelementStart(3, "span", 44)(4, "span", 45);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, FileStoragePage_ng_template_6_Conditional_6_Template, 5, 6);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, FileStoragePage_ng_template_6_Conditional_7_Template, 1, 2, "app-my-file-actions", 46);
} if (rf & 2) {
    const file_r7 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵattribute("aria-label", ctx_r2.entryLabel(file_r7));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isParentEntry(file_r7) ? 1 : 2);
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("title", file_r7.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(file_r7.name);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r2.isParentEntry(file_r7) ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r2.isParentEntry(file_r7) ? 7 : -1);
} }
function FileStoragePage_Conditional_8_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 51);
    i0.ɵɵelementContainer(1, 53);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r8 = ctx.$implicit;
    i0.ɵɵnextContext(2);
    const fileGridCard_r9 = i0.ɵɵreference(7);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", fileGridCard_r9)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c1, file_r8));
} }
function FileStoragePage_Conditional_8_ForEmpty_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 52);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "filesEmpty"));
} }
function FileStoragePage_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 6)(1, "div", 9)(2, "h2", 26);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 11);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 49)(9, "ul", 50);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵrepeaterCreate(11, FileStoragePage_Conditional_8_For_12_Template, 2, 4, "li", 51, _forTrack0, false, FileStoragePage_Conditional_8_ForEmpty_13_Template, 3, 3, "li", 52);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "recentFiles"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "recentScopeHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(10, 8, "recentFiles"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater((ctx_r2.data.value()?.recent ?? i0.ɵɵpureFunction0(10, _c0)).slice(0, 6));
} }
function FileStoragePage_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-data-table", 54);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵlistener("rowAction", function FileStoragePage_Conditional_33_Template_app_data_table_rowAction_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openEntry($event)); })("rowDragStart", function FileStoragePage_Conditional_33_Template_app_data_table_rowDragStart_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.startEntryDrag($event.event, $event.row)); })("rowDragEnd", function FileStoragePage_Conditional_33_Template_app_data_table_rowDragEnd_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.endEntryDrag()); })("rowDragOver", function FileStoragePage_Conditional_33_Template_app_data_table_rowDragOver_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.overEntryDrop($event.event, $event.row)); })("rowDragLeave", function FileStoragePage_Conditional_33_Template_app_data_table_rowDragLeave_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.leaveEntryDrop($event.event, $event.row)); })("rowDrop", function FileStoragePage_Conditional_33_Template_app_data_table_rowDrop_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.dropEntry($event.event, $event.row)); })("sortChange", function FileStoragePage_Conditional_33_Template_app_data_table_sortChange_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.sort($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("columns", ctx_r2.columns())("rowActionLabel", ctx_r2.entryLabel)("data", ctx_r2.displayItems())("rowDraggable", ctx_r2.canDragEntry)("rowDragging", ctx_r2.isDraggedEntry)("rowDropActive", ctx_r2.isActiveDropTarget)("loading", ctx_r2.data.state() === "loading" || ctx_r2.data.refreshing())("loadingText", i0.ɵɵpipeBind1(1, 11, "loading"))("emptyText", i0.ɵɵpipeBind1(2, 13, "filesEmpty"))("sortColumn", ctx_r2.query.text("sort", "updatedAt"))("sortDirection", ctx_r2.query.direction("desc"));
} }
function FileStoragePage_Conditional_34_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 60);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_34_For_3_Template_button_click_0_listener() { const option_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.toggleGridSort(option_r12.column)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelement(3, "ng-icon", 61);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r12 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-pressed", ctx_r2.query.text("sort", "updatedAt") === option_r12.column);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, option_r12.label), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("name", ctx_r2.gridSortIcon(option_r12.column));
} }
function FileStoragePage_Conditional_34_For_7_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 62);
    i0.ɵɵlistener("dragstart", function FileStoragePage_Conditional_34_For_7_Template_li_dragstart_0_listener($event) { const file_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.startEntryDrag($event, file_r14)); })("dragend", function FileStoragePage_Conditional_34_For_7_Template_li_dragend_0_listener() { i0.ɵɵrestoreView(_r13); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.endEntryDrag()); })("dragover", function FileStoragePage_Conditional_34_For_7_Template_li_dragover_0_listener($event) { const file_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.overEntryDrop($event, file_r14)); })("dragleave", function FileStoragePage_Conditional_34_For_7_Template_li_dragleave_0_listener($event) { const file_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.leaveEntryDrop($event, file_r14)); })("drop", function FileStoragePage_Conditional_34_For_7_Template_li_drop_0_listener($event) { const file_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.dropEntry($event, file_r14)); });
    i0.ɵɵelementContainer(1, 53);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r14 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    const fileGridCard_r9 = i0.ɵɵreference(7);
    i0.ɵɵclassProp("opacity-50", ctx_r2.isDraggedEntry(file_r14))("file-storage-drop-target", ctx_r2.isActiveDropTarget(file_r14));
    i0.ɵɵattribute("draggable", ctx_r2.canDragEntry(file_r14) ? "true" : null);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", fileGridCard_r9)("ngTemplateOutletContext", i0.ɵɵpureFunction1(7, _c1, file_r14));
} }
function FileStoragePage_Conditional_34_ForEmpty_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 59)(1, "div", 63)(2, "div", 64)(3, "p", 65);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "filesEmpty"));
} }
function FileStoragePage_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 55);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, FileStoragePage_Conditional_34_For_3_Template, 4, 5, "button", 56, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul", 57);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵrepeaterCreate(6, FileStoragePage_Conditional_34_For_7_Template, 2, 9, "li", 58, _forTrack0, false, FileStoragePage_Conditional_34_ForEmpty_8_Template, 6, 3, "li", 59);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 4, "sort"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(i0.ɵɵpureFunction3(11, _c5, i0.ɵɵpureFunction0(8, _c2), i0.ɵɵpureFunction0(9, _c3), i0.ɵɵpureFunction0(10, _c4)));
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 6, "files"))("aria-busy", ctx_r2.data.refreshing());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.displayItems());
} }
function FileStoragePage_Conditional_37_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 74);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("width", ctx_r2.progress(), "%");
    i0.ɵɵattribute("aria-valuenow", ctx_r2.progress())("aria-label", i0.ɵɵpipeBind1(1, 4, "uploadProgress"));
} }
function FileStoragePage_Conditional_37_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 75);
    i0.ɵɵlistener("dragover", function FileStoragePage_Conditional_37_Conditional_11_Template_div_dragover_0_listener($event) { return $event.preventDefault(); })("drop", function FileStoragePage_Conditional_37_Conditional_11_Template_div_drop_0_listener($event) { return $event.preventDefault(); });
    i0.ɵɵelementStart(1, "div", 76)(2, "span", 77);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 52);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵpipe(7, "t");
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 78);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_37_Conditional_11_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r16); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.cancelUpload()); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", ctx_r2.currentUpload()?.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.currentUpload()?.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate6("", i0.ɵɵpipeBind1(6, 10, "uploadFileNumber"), " ", ctx_r2.uploadIndex(), " ", i0.ɵɵpipeBind1(7, 12, "uploadOf"), " ", ctx_r2.uploadCount(), " \u00B7 ", i0.ɵɵpipeBind1(8, 14, "uploading"), " ", ctx_r2.progress(), "%");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r2.uploadCancelled());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 16, "cancel"), " ");
} }
function FileStoragePage_Conditional_37_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 79);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_37_Conditional_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.showUpload()); })("dragover", function FileStoragePage_Conditional_37_Conditional_12_Template_button_dragover_0_listener($event) { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.overUpload($event)); })("dragleave", function FileStoragePage_Conditional_37_Conditional_12_Template_button_dragleave_0_listener() { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.uploadDragOver.set(false)); })("drop", function FileStoragePage_Conditional_37_Conditional_12_Template_button_drop_0_listener($event) { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.dropUpload($event)); });
    i0.ɵɵelementStart(1, "span", 80);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 52);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 52);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("file-storage-drop-target", ctx_r2.uploadDragOver());
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, "dropFileHere"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "browseFileHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 10, "uploadLimits"));
} }
function FileStoragePage_Conditional_37_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 71);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx_r2.validation()));
} }
function FileStoragePage_Conditional_37_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 72);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "uploadBatchCancelled"));
} }
function FileStoragePage_Conditional_37_Conditional_15_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 81);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r19 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(file_r19.name);
} }
function FileStoragePage_Conditional_37_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 73)(1, "p", 72);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul", 52);
    i0.ɵɵrepeaterCreate(5, FileStoragePage_Conditional_37_Conditional_15_For_6_Template, 2, 1, "li", 81, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 82);
    i0.ɵɵlistener("click", function FileStoragePage_Conditional_37_Conditional_15_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r18); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.upload(ctx_r2.failedUploads())); });
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "uploadFailedFiles"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.failedUploads());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 5, "retryFailedUploads"), " ");
} }
function FileStoragePage_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 24)(1, "div", 9)(2, "h2", 26);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 11);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 66);
    i0.ɵɵconditionalCreate(9, FileStoragePage_Conditional_37_Conditional_9_Template, 2, 6, "div", 67);
    i0.ɵɵelementStart(10, "input", 68);
    i0.ɵɵlistener("change", function FileStoragePage_Conditional_37_Template_input_change_10_listener($event) { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.choose($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, FileStoragePage_Conditional_37_Conditional_11_Template, 12, 18, "div", 69)(12, FileStoragePage_Conditional_37_Conditional_12_Template, 10, 12, "button", 70);
    i0.ɵɵconditionalCreate(13, FileStoragePage_Conditional_37_Conditional_13_Template, 3, 3, "hlm-field-error", 71);
    i0.ɵɵconditionalCreate(14, FileStoragePage_Conditional_37_Conditional_14_Template, 3, 3, "p", 72);
    i0.ɵɵconditionalCreate(15, FileStoragePage_Conditional_37_Conditional_15_Template, 10, 7, "div", 73);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 8, "uploadFiles"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 10, "uploadFilesHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.uploading() ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.uploading() ? 11 : 12);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.validation() ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r2.uploading() && ctx_r2.uploadCancelled() ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r2.uploading() && ctx_r2.failedUploads().length ? 15 : -1);
} }
function FileStoragePage_Conditional_47_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 88);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    const segment_r20 = ctx.$implicit;
    const value_r21 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("width", 100 * segment_r20.bytes / ctx_r2.Math.max(value_r21.usedBytes, value_r21.quotaBytes > 0 ? value_r21.quotaBytes : 0, 1), "%");
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(1, 4, "fileType." + segment_r20.category) + ": " + ctx_r2.bytes(segment_r20.bytes));
    i0.ɵɵattribute("data-category", segment_r20.category);
} }
function FileStoragePage_Conditional_47_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵelement(1, "span", 89);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementStart(5, "small");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const segment_r22 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵattribute("data-category", segment_r22.category);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(4, 4, "fileType." + segment_r22.category), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("(", ctx_r2.i18n.number(segment_r22.count), ")");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.bytes(segment_r22.bytes));
} }
function FileStoragePage_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 83);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 84);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵpipe(5, "t");
    i0.ɵɵrepeaterCreate(6, FileStoragePage_Conditional_47_For_7_Template, 2, 6, "span", 85, _forTrack2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "ul", 86);
    i0.ɵɵrepeaterCreate(9, FileStoragePage_Conditional_47_For_10_Template, 9, 6, "li", null, _forTrack2);
    i0.ɵɵelementStart(11, "li");
    i0.ɵɵelement(12, "span", 87);
    i0.ɵɵelementStart(13, "span");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "strong");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const value_r21 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", ctx_r2.bytes(value_r21.usedBytes), " / ", value_r21.quotaBytes === -1 ? i0.ɵɵpipeBind1(2, 5, "maxUploadNoLimit") : ctx_r2.bytes(value_r21.quotaBytes), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 7, "storageUsage") + ": " + ctx_r2.bytes(value_r21.usedBytes) + " / " + (value_r21.quotaBytes === -1 ? i0.ɵɵpipeBind1(5, 9, "maxUploadNoLimit") : ctx_r2.bytes(value_r21.quotaBytes)));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(value_r21.usage);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(value_r21.usage);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 11, "remainingStorage"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(value_r21.quotaBytes === -1 ? i0.ɵɵpipeBind1(18, 13, "maxUploadNoLimit") : ctx_r2.bytes(ctx_r2.Math.max(0, value_r21.quotaBytes - value_r21.usedBytes)));
} }
function FileStoragePage_Conditional_48_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 90)(1, "h3", 91);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 92);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "quotaReached"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "quotaReachedHelp"));
} }
function FileStoragePage_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, FileStoragePage_Conditional_48_Conditional_0_Template, 7, 6, "div", 90);
} if (rf & 2) {
    const value_r23 = ctx;
    i0.ɵɵconditional(value_r23.quotaBytes >= 0 && value_r23.usedBytes >= value_r23.quotaBytes ? 0 : -1);
} }
function FileStoragePage_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-file-quota-editor", 93);
    i0.ɵɵlistener("saved", function FileStoragePage_Conditional_49_Template_app_file_quota_editor_saved_0_listener() { i0.ɵɵrestoreView(_r24); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.load()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("owner", ctx_r2.adminOwner);
} }
function FileStoragePage_hlm_dialog_content_58_hlm_select_content_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content")(1, "hlm-select-item", 105);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "hlm-select-item", 106);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "viewer"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "editor"));
} }
function FileStoragePage_hlm_dialog_content_58_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-dialog-content")(1, "hlm-dialog-header")(2, "h2", 94);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 95);
    i0.ɵɵlistener("ngSubmit", function FileStoragePage_hlm_dialog_content_58_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r25); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.share()); });
    i0.ɵɵelementStart(6, "div", 96)(7, "label", 97);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "input", 98);
    i0.ɵɵtwoWayListener("ngModelChange", function FileStoragePage_hlm_dialog_content_58_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r25); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.shareEmail, $event) || (ctx_r2.shareEmail = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 96)(12, "label", 99);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "hlm-select", 100);
    i0.ɵɵtwoWayListener("valueChange", function FileStoragePage_hlm_dialog_content_58_Template_hlm_select_valueChange_15_listener($event) { i0.ɵɵrestoreView(_r25); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.sharePermission, $event) || (ctx_r2.sharePermission = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(16, "hlm-select-trigger", 101);
    i0.ɵɵelement(17, "hlm-select-value", 102);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(19, FileStoragePage_hlm_dialog_content_58_hlm_select_content_19_Template, 7, 6, "hlm-select-content", 103);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "hlm-dialog-footer")(21, "button", 82);
    i0.ɵɵlistener("click", function FileStoragePage_hlm_dialog_content_58_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r25); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.shareOpen.set(false)); });
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "button", 104);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 12, "shareFile"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 14, "shareEmail"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.shareEmail);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 16, "sharePermission"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("value", ctx_r2.sharePermission);
    i0.ɵɵadvance();
    i0.ɵɵproperty("buttonId", "share-role");
    i0.ɵɵadvance();
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(18, 18, "viewer"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(23, 20, "cancel"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy() || !ctx_r2.shareEmail.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 22, "createShare"), " ");
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dt");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "dt");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "dd");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r27 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 4, "fileSize"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.bytes(file_r27.size));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "fileContentType"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(file_r27.contentType);
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 96)(1, "label", 118);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 119);
    i0.ɵɵtwoWayListener("ngModelChange", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_34_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r28); const ctx_r2 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r2.detailName, $event) || (ctx_r2.detailName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 96)(6, "label", 120);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "input", 121);
    i0.ɵɵtwoWayListener("ngModelChange", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_34_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r28); const ctx_r2 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r2.detailDescription, $event) || (ctx_r2.detailDescription = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 96)(11, "label", 122);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "input", 123);
    i0.ɵɵtwoWayListener("ngModelChange", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_34_Template_input_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r28); const ctx_r2 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r2.detailTags, $event) || (ctx_r2.detailTags = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(15, "p", 124);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "label", 125)(19, "div", 126)(20, "hlm-checkbox", 127);
    i0.ɵɵtwoWayListener("ngModelChange", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_34_Template_hlm_checkbox_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r28); const ctx_r2 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r2.detailImportant, $event) || (ctx_r2.detailImportant = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(21, "span");
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(24, "label", 128)(25, "div", 126)(26, "hlm-checkbox", 129);
    i0.ɵɵtwoWayListener("ngModelChange", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_34_Template_hlm_checkbox_ngModelChange_26_listener($event) { i0.ɵɵrestoreView(_r28); const ctx_r2 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r2.detailStarred, $event) || (ctx_r2.detailStarred = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(27, "span");
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 16, "entryName"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.detailName);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 18, "fileDescription"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.detailDescription);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 20, "fileTags"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.detailTags);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 22, "fileTagsHelp"));
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.detailImportant);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 24, "important"));
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.detailStarred);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 26, "starred"));
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 115)(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "dt");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "dd");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "dt");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "dd");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "dt");
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "dd");
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const file_r27 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 8, "fileDescription"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(file_r27.description || i0.ɵɵpipeBind1(6, 10, "fileNotSet"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 12, "fileTags"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(file_r27.tags || i0.ɵɵpipeBind1(12, 14, "fileNotSet"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 16, "important"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 18, file_r27.important ? "fileYes" : "fileNo"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 20, "starred"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 22, file_r27.starred ? "fileYes" : "fileNo"));
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 130);
    i0.ɵɵlistener("click", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_36_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r29); const file_r27 = i0.ɵɵnextContext(); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.download(file_r27)); });
    i0.ɵɵelement(1, "ng-icon", 131);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 2, "download"), " ");
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_For_10_Template(rf, ctx) { if (rf & 1) {
    const _r31 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 137)(1, "span", 138);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 139);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 140);
    i0.ɵɵlistener("click", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_For_10_Template_button_click_6_listener() { const share_r32 = i0.ɵɵrestoreView(_r31).$implicit; const ctx_r2 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r2.revoke(share_r32)); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const share_r32 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(share_r32.recipient);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, share_r32.permission));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 6, "revokeShare"), " ");
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_ForEmpty_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 72);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "notSharedYet"));
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 132);
    i0.ɵɵlistener("click", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r30); const file_r27 = i0.ɵɵnextContext(); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.openShare(file_r27)); });
    i0.ɵɵelement(1, "ng-icon", 133);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "section", 134)(5, "h3", 135);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "ul", 136);
    i0.ɵɵrepeaterCreate(9, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_For_10_Template, 9, 8, "li", 137, _forTrack0, false, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_ForEmpty_11_Template, 3, 3, "li", 72);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 4, "shareFile"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "sharedPeople"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.peopleShares());
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_38_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 142);
    i0.ɵɵlistener("click", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_38_For_3_Template_button_click_0_listener() { const action_r34 = i0.ɵɵrestoreView(_r33).$implicit; return i0.ɵɵresetView(action_r34.run()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r34 = ctx.$implicit;
    i0.ɵɵproperty("variant", action_r34.destructive ? "destructive" : "outline")("disabled", action_r34.disabled);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, action_r34.label), " ");
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_38_For_3_Template, 3, 5, "button", 141, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r27 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "actions"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.detailActions(file_r27, ctx_r2.busy()));
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 112);
    i0.ɵɵlistener("ngSubmit", function FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r26); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.saveDetails()); });
    i0.ɵɵelementStart(1, "div", 113);
    i0.ɵɵelement(2, "app-my-file-icon", 43);
    i0.ɵɵelementStart(3, "span", 114);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "dl", 115)(6, "dt");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "dd");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(12, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_12_Template, 10, 8);
    i0.ɵɵelementStart(13, "dt");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "dd");
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "dt");
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "dd");
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "dt");
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "dd");
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "dt");
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "dd");
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(34, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_34_Template, 30, 28)(35, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_35_Template, 25, 24, "dl", 115);
    i0.ɵɵconditionalCreate(36, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_36_Template, 4, 4, "button", 116);
    i0.ɵɵconditionalCreate(37, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_37_Template, 12, 8);
    i0.ɵɵconditionalCreate(38, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Conditional_38_Template, 4, 3, "div", 117);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r27 = ctx;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("file", file_r27);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(file_r27.name);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 17, "fileKind"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 19, file_r27.isFolder ? "folder" : "fileType." + (file_r27.category || "other")), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!file_r27.isFolder ? 12 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 21, "fileLocation"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.fileLocation(file_r27));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 23, "fileCreatedAt"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.i18n.date(file_r27.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 25, "updatedAt"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.i18n.date(file_r27.updatedAt || file_r27.createdAt));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 27, "sharePermission"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(33, 29, ctx_r2.adminOwner ? "fileAdminAccess" : file_r27.permission === "owner" ? "fileOwner" : file_r27.permission || "viewer"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.canEditDetails(file_r27) ? 34 : 35);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(36);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.canShare(file_r27) ? 37 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.detailActions(file_r27, ctx_r2.busy()).length ? 38 : -1);
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, FileStoragePage_hlm_drawer_content_60_Conditional_8_Conditional_0_Template, 39, 31, "form", 111);
} if (rf & 2) {
    let tmp_3_0;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_3_0 = ctx_r2.detailFile()) ? 0 : -1, tmp_3_0);
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_9_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-drawer-footer")(1, "button", 143);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.busy() || !ctx_r2.detailName.trim() || !ctx_r2.detailsDirty());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "saveChanges"), " ");
} }
function FileStoragePage_hlm_drawer_content_60_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, FileStoragePage_hlm_drawer_content_60_Conditional_9_Conditional_0_Template, 4, 4, "hlm-drawer-footer");
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r2.canEditDetails(ctx) ? 0 : -1);
} }
function FileStoragePage_hlm_drawer_content_60_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-drawer-content", 107)(1, "hlm-drawer-header")(2, "h2", 108);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 109);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 110);
    i0.ɵɵconditionalCreate(8, FileStoragePage_hlm_drawer_content_60_Conditional_8_Template, 1, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, FileStoragePage_hlm_drawer_content_60_Conditional_9_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_5_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, ctx_r2.detailMode() === "fileDetails" && ctx_r2.detailFile()?.isFolder ? "folderDetails" : ctx_r2.detailMode()), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r2.detailFile()?.name);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.detailMode() === "fileDetails" ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_5_0 = ctx_r2.detailMode() === "fileDetails" && ctx_r2.detailFile()) ? 9 : -1, tmp_5_0);
} }
const column = createColumnHelper();
const parentEntryId = '__file-storage-parent__';
export class FileStoragePage {
    Math = Math;
    navigation = inject(FileStorageNavigation);
    actionMode = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actionMode" }] : /* istanbul ignore next */ []));
    detailMode = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "detailMode" }] : /* istanbul ignore next */ []));
    detailFile = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "detailFile" }] : /* istanbul ignore next */ []));
    detailName = '';
    detailDescription = '';
    detailTags = '';
    detailImportant = false;
    detailStarred = false;
    shares = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "shares" }] : /* istanbul ignore next */ []));
    peopleShares = computed(() => this.shares().filter((share) => !!share.recipient), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "peopleShares" }] : /* istanbul ignore next */ []));
    shareOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "shareOpen" }] : /* istanbul ignore next */ []));
    shareEmail = '';
    sharePermission = 'viewer';
    get group() {
        return this.query.text('group', 'file-storage');
    }
    get groupLabel() {
        return fileGroups.find((x) => x.id === this.group)?.label ?? 'files';
    }
    entryLabel = (file) => this.i18n.text(this.isParentEntry(file) ? 'parentFolder' : file.isFolder ? 'openFolder' : 'fileDetails') + (this.isParentEntry(file) ? '' : ': ' + file.name);
    openEntry(file) {
        if (this.busy())
            return;
        if (this.isParentEntry(file))
            this.openFolder(file.parentId ?? null);
        else if (file.isFolder)
            this.openFolder(file.id);
        else
            void this.detail(file, 'fileDetails');
    }
    isParentEntry(file) {
        return file.id === parentEntryId;
    }
    fileLocation(file) {
        const parent = this.data.value()?.folders?.find((folder) => folder.id === file.parentId);
        return parent
            ? this.folderPath(parent)
            : this.i18n.text(file.parentId ? 'fileSharedLocation' : 'rootFolder');
    }
    canEditDetails(file) {
        return !this.adminOwner && file.permission !== 'viewer';
    }
    canShare(file) {
        return !this.adminOwner && file.permission === 'owner';
    }
    detailActions(file, busy) {
        return this.actions(file, busy).filter((action) => action.label !== 'download' &&
            action.label !== 'editMetadata' &&
            action.label !== 'shareFile');
    }
    setDetailDraft(file) {
        this.detailName = file.name;
        this.detailDescription = file.description ?? '';
        this.detailTags = file.tags ?? '';
        this.detailImportant = file.important ?? false;
        this.detailStarred = file.starred ?? false;
    }
    detailsDirty() {
        const file = this.detailFile();
        return (!!file &&
            (this.detailName !== file.name ||
                this.detailDescription !== (file.description ?? '') ||
                this.detailTags !== (file.tags ?? '') ||
                this.detailImportant !== (file.important ?? false) ||
                this.detailStarred !== (file.starred ?? false)));
    }
    inlineActions(file, busy) {
        if (this.group === 'trash')
            return [];
        return this.actions(file, busy).filter((action) => action.label === 'download' || action.label === 'delete');
    }
    async restoreFile(file) {
        if (await this.mutate(`${file.id}/restore`))
            this.detailMode.set('');
    }
    actions(file, busy) {
        if (this.group === 'trash' && this.adminOwner)
            return file.isFolder
                ? [{ label: 'openFolder', disabled: busy, run: () => this.openFolder(file.id) }]
                : [];
        if (this.group === 'trash')
            return [
                { label: 'restore', disabled: busy, run: () => void this.restoreFile(file) },
                {
                    label: 'deletePermanently',
                    disabled: busy,
                    destructive: true,
                    run: () => void this.purge(file),
                },
            ];
        return [
            {
                label: file.isFolder ? 'openFolder' : 'download',
                disabled: busy,
                run: () => (file.isFolder ? this.openFolder(file.id) : void this.download(file)),
            },
            ...(!this.adminOwner && file.permission !== 'viewer'
                ? [
                    {
                        label: 'editMetadata',
                        disabled: busy,
                        run: () => void this.detail(file, 'fileDetails'),
                    },
                ]
                : []),
            ...(!this.adminOwner && file.permission === 'owner'
                ? [
                    { label: 'moveFile', disabled: busy, run: () => this.openMove(file) },
                    { label: 'shareFile', disabled: busy, run: () => void this.openShare(file) },
                    {
                        label: 'delete',
                        disabled: busy,
                        destructive: true,
                        run: () => void this.remove(file),
                    },
                ]
                : []),
        ];
    }
    moveFolders() {
        const folders = this.data.value()?.folders ?? [];
        const excluded = new Set([this.detailFile()?.id]);
        let changed = true;
        while (changed) {
            changed = false;
            for (const f of folders)
                if (excluded.has(f.parentId ?? '') && !excluded.has(f.id)) {
                    excluded.add(f.id);
                    changed = true;
                }
        }
        return folders.filter((f) => !excluded.has(f.id));
    }
    pageMoveDestinations() {
        const source = this.detailFile();
        const folders = this.data.value()?.folders ?? [];
        if (!source || this.actionMode() !== 'move')
            return [];
        return [
            {
                value: 'root',
                label: this.i18n.text('files'),
                disabled: !canMoveEntry(source, null, folders),
            },
            ...this.moveFolders()
                .filter((folder) => canMoveEntry(source, folder.id, folders))
                .map((folder) => ({ value: folder.id, label: this.folderPath(folder) })),
        ];
    }
    actionDescription() {
        if (this.actionMode() === 'move')
            return this.detailFile()?.name ?? '';
        return this.data.value()?.folder?.name ?? this.i18n.text('files');
    }
    folderPath(file) {
        let path = file.name;
        let parent = file.parentId;
        const seen = new Set();
        while (parent && !seen.has(parent)) {
            seen.add(parent);
            const folder = this.data.value()?.folders?.find((f) => f.id === parent);
            if (!folder)
                break;
            path = folder.name + ' / ' + path;
            parent = folder.parentId;
        }
        return path;
    }
    async detail(file, mode) {
        this.detailFile.set(file);
        this.setDetailDraft(file);
        this.shares.set([]);
        this.shareEmail = '';
        this.sharePermission = 'viewer';
        this.detailMode.set(mode);
        this.busy.set(true);
        try {
            if (mode === 'fileDetails' && this.canShare(file))
                this.shares.set(await this.api.get(`file-storage/${file.id}/shares`));
        }
        catch {
            /* Central errors. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async openShare(file) {
        if (this.busy() || !this.canShare(file))
            return;
        if (this.detailFile()?.id !== file.id || this.detailMode() !== 'fileDetails')
            await this.detail(file, 'fileDetails');
        if (this.detailFile()?.id !== file.id || this.detailMode() !== 'fileDetails')
            return;
        this.shareEmail = '';
        this.sharePermission = 'viewer';
        this.shareOpen.set(true);
    }
    async saveDetails() {
        const file = this.detailFile();
        if (this.busy() || !file || !this.canEditDetails(file) || !this.detailName.trim())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`file-storage/${file.id}/metadata`, {
                name: this.detailName,
                description: this.detailDescription,
                tags: this.detailTags,
                important: this.detailImportant,
                starred: this.detailStarred,
            });
            const updated = {
                ...file,
                name: this.detailName,
                description: this.detailDescription,
                tags: this.detailTags,
                important: this.detailImportant,
                starred: this.detailStarred,
            };
            this.detailFile.set(updated);
            this.setDetailDraft(updated);
            this.toast.success('fileStorageSaved');
            await this.load();
            this.navigation.refresh();
        }
        catch {
            /* Central errors; keep the draft. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async mutate(path, body = {}) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`file-storage/${path}`, body);
            await this.load();
            this.navigation.refresh();
            this.toast.success('fileStorageSaved');
            return true;
        }
        catch {
            return false;
        }
        finally {
            this.busy.set(false);
        }
    }
    openMove(file) {
        if (this.busy())
            return;
        this.detailFile.set(file);
        this.actionMode.set('move');
    }
    async move(destination) {
        const file = this.detailFile();
        if (!file)
            return;
        if (await this.mutate(`${file.id}/move`, {
            parentId: destination === 'root' ? null : destination,
        })) {
            this.actionMode.set('');
            this.detailMode.set('');
        }
    }
    async purge(file) {
        if (await this.confirm.ask('deletePermanently', 'purgeFileHelp', file.name, true))
            if (await this.mutate(`${file.id}/purge`))
                this.detailMode.set('');
    }
    async emptyTrash() {
        if (await this.confirm.ask('emptyTrash', 'purgeFileHelp', '', true))
            await this.mutate('trash/empty');
    }
    async share() {
        if (this.busy() || !this.shareEmail.trim())
            return;
        this.busy.set(true);
        try {
            const file = this.detailFile();
            await this.api.post(`file-storage/${file.id}/shares`, {
                email: this.shareEmail.trim(),
                permission: this.sharePermission,
                expiresAt: null,
            });
            this.shares.set(await this.api.get(`file-storage/${file.id}/shares`));
            this.shareOpen.set(false);
            this.shareEmail = '';
            this.sharePermission = 'viewer';
            this.toast.success('fileStorageSaved');
        }
        catch {
            /* Preserve inputs. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async revoke(share) {
        await this.mutate(`${this.detailFile().id}/shares/${share.id}/revoke`);
        try {
            this.shares.set(await this.api.get(`file-storage/${this.detailFile().id}/shares`));
        }
        catch {
            /* Central errors. */
        }
    }
    quotaEditor = viewChild(FileQuotaEditor, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "quotaEditor" }] : /* istanbul ignore next */ []));
    adminOwner = inject(ActivatedRoute).snapshot.paramMap.get('ownerId');
    basePath = this.adminOwner ? `file-storage/admin/users/${this.adminOwner}` : 'file-storage';
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    data = new Resource();
    query = new ListQuery();
    view = signal(this.savedView(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "view" }] : /* istanbul ignore next */ []));
    savedView() {
        try {
            return localStorage.getItem('templatev4-file-storage-view') === 'grid' ? 'grid' : 'list';
        }
        catch {
            return 'list';
        }
    }
    gridSortIcon(column) {
        if (column !== this.query.text('sort', 'updatedAt'))
            return 'lucideChevronsUpDown';
        return this.query.direction('desc') === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown';
    }
    toggleGridSort(column) {
        this.sort({
            column,
            direction: column === this.query.text('sort', 'updatedAt') && this.query.direction('desc') === 'asc'
                ? 'desc'
                : 'asc',
        });
    }
    setView(value) {
        this.view.set(value);
        try {
            localStorage.setItem('templatev4-file-storage-view', value);
        }
        catch {
            // Keep the selected view usable when browser storage is unavailable.
        }
    }
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    uploading = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uploading" }] : /* istanbul ignore next */ []));
    currentUpload = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentUpload" }] : /* istanbul ignore next */ []));
    uploadIndex = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uploadIndex" }] : /* istanbul ignore next */ []));
    uploadCount = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uploadCount" }] : /* istanbul ignore next */ []));
    uploadCancelled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uploadCancelled" }] : /* istanbul ignore next */ []));
    failedUploads = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "failedUploads" }] : /* istanbul ignore next */ []));
    uploadController;
    progress = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "progress" }] : /* istanbul ignore next */ []));
    validation = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "validation" }] : /* istanbul ignore next */ []));
    search = new DebouncedSearch(this.query);
    draggedEntry = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "draggedEntry" }] : /* istanbul ignore next */ []));
    entryDropTarget = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "entryDropTarget" }] : /* istanbul ignore next */ []));
    displayItems = computed(() => {
        const value = this.data.value();
        const items = value?.page?.items ?? [];
        const folder = value?.folder;
        if (!folder)
            return items;
        const at = folder.updatedAt || folder.createdAt;
        return [
            {
                id: parentEntryId,
                name: this.i18n.text('parentFolder'),
                isFolder: true,
                parentId: folder.parentId,
                size: 0,
                contentType: 'application/octet-stream',
                createdAt: at,
                updatedAt: at,
                permission: 'viewer',
                category: 'other',
            },
            ...items,
        ];
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "displayItems" }] : /* istanbul ignore next */ []));
    canDragEntry = (file) => !this.busy() &&
        !this.adminOwner &&
        this.group === 'file-storage' &&
        !this.isParentEntry(file) &&
        file.permission === 'owner';
    isDraggedEntry = (file) => this.draggedEntry()?.id === file.id;
    isActiveDropTarget = (file) => this.entryDropTarget() === file.id;
    entryDestination(file) {
        if (this.isParentEntry(file))
            return file.parentId ?? null;
        return file.isFolder && file.permission === 'owner' ? file.id : undefined;
    }
    canDropEntryOn(file) {
        const source = this.draggedEntry();
        const destination = this.entryDestination(file);
        return (!!source &&
            destination !== undefined &&
            canMoveEntry(source, destination, this.data.value()?.folders ?? []));
    }
    startEntryDrag(event, file) {
        if (!this.canDragEntry(file)) {
            event.preventDefault();
            return;
        }
        this.draggedEntry.set(file);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('application/x-file-storage-entry', file.id);
        }
    }
    endEntryDrag() {
        this.draggedEntry.set(null);
        this.entryDropTarget.set(null);
    }
    overEntryDrop(event, file) {
        if (!this.canDropEntryOn(file))
            return;
        event.preventDefault();
        if (event.dataTransfer)
            event.dataTransfer.dropEffect = 'move';
        this.entryDropTarget.set(file.id);
    }
    leaveEntryDrop(event, file) {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next))
            return;
        if (this.entryDropTarget() === file.id)
            this.entryDropTarget.set(null);
    }
    async dropEntry(event, file) {
        event.preventDefault();
        event.stopPropagation();
        const source = this.draggedEntry();
        const destination = this.entryDestination(file);
        const valid = !!source && destination !== undefined && this.canDropEntryOn(file);
        this.endEntryDrag();
        if (!valid || !source)
            return;
        if (await this.mutate(`${source.id}/move`, { parentId: destination }))
            this.toast.success('itemMoved');
    }
    columns = computed(() => {
        this.i18n.culture();
        const busy = this.busy();
        return column.columns([
            column.accessor('name', {
                header: this.i18n.text('fileName'),
                cell: ({ row }) => flexRenderComponent(FileStorageFileName, {
                    inputs: {
                        file: row.original,
                        interactive: false,
                        back: this.isParentEntry(row.original),
                    },
                }),
            }),
            column.accessor('size', {
                header: this.i18n.text('fileSize'),
                cell: (c) => this.isParentEntry(c.row.original)
                    ? ''
                    : c.row.original.isFolder
                        ? '—'
                        : this.bytes(c.getValue()),
            }),
            column.accessor('updatedAt', {
                header: this.i18n.text('updatedAt'),
                cell: (c) => this.isParentEntry(c.row.original)
                    ? ''
                    : this.i18n.date(c.getValue() || c.row.original.createdAt),
            }),
            column.display({
                id: 'actions',
                enableSorting: false,
                header: this.i18n.text('actions'),
                cell: ({ row }) => flexRenderComponent(FileStorageFileActions, {
                    inputs: {
                        actions: this.isParentEntry(row.original)
                            ? []
                            : this.inlineActions(row.original, busy),
                        name: row.original.name,
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        let revision = this.navigation.revision();
        effect(() => {
            const next = this.navigation.revision();
            if (next !== revision) {
                revision = next;
                untracked(() => void this.load());
            }
        });
        this.query.connect(() => {
            this.search.sync(this.query.text('search'));
            void this.load();
        });
    }
    hasUnsavedChanges() {
        return (this.uploading() ||
            this.actionMode() !== '' ||
            this.shareOpen() ||
            (this.detailMode() === 'fileDetails' && this.detailsDirty()) ||
            (this.detailMode() !== '' && this.detailMode() !== 'fileDetails') ||
            (this.quotaEditor()?.hasUnsavedChanges() ?? false));
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    bytes(value) {
        if (value < 1024)
            return this.i18n.number(value) + ' B';
        if (value < 1048576)
            return this.i18n.number(Math.round(value / 1024)) + ' KB';
        return this.i18n.number(Math.round((value / 1048576) * 10) / 10) + ' MB';
    }
    loadedFolder;
    async load() {
        const folder = this.query.text('folder');
        const folderChanged = this.loadedFolder !== undefined && this.loadedFolder !== folder;
        const loaded = await this.data.load((signal) => this.api.get(this.basePath, {
            ...(this.query.text('folder') ? { parentId: this.query.text('folder') } : {}),
            group: this.group,
            pageNumber: this.query.page,
            pageSize: this.pageSize,
            search: this.query.text('search'),
            sort: this.query.text('sort', 'updatedAt'),
            direction: this.query.direction('desc'),
        }, signal));
        if (loaded) {
            const detail = this.detailFile();
            if (detail) {
                const updated = [
                    ...(this.data.value()?.page.items ?? []),
                    ...(this.data.value()?.recent ?? []),
                    ...(this.data.value()?.folders ?? []),
                ].find((file) => file.id === detail.id);
                if (updated)
                    this.detailFile.set(updated);
            }
            this.query.clamp(this.data.value()?.page.total, this.pageSize);
            this.loadedFolder = folder;
            if (folderChanged)
                document.getElementById('file-library-title')?.focus();
        }
    }
    get pageSize() {
        const size = Number(this.query.text('size'));
        return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    showUpload() {
        if (this.busy())
            return;
        const input = document.getElementById('file-upload');
        if (input)
            input.value = '';
        input?.click();
    }
    uploadDragOver = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uploadDragOver" }] : /* istanbul ignore next */ []));
    overUpload(event) {
        event.preventDefault();
        if (this.busy() || !event.dataTransfer?.types.includes('Files'))
            return;
        event.dataTransfer.dropEffect = 'copy';
        this.uploadDragOver.set(true);
    }
    dropUpload(event) {
        event.preventDefault();
        this.uploadDragOver.set(false);
        if (this.busy())
            return;
        const files = event.dataTransfer?.files;
        if (!files?.length)
            return;
        void this.upload(Array.from(files));
    }
    choose(event) {
        if (this.busy())
            return;
        const files = event.target.files;
        if (!files?.length)
            return;
        void this.upload(Array.from(files));
    }
    cancelUpload() {
        this.uploadCancelled.set(true);
        this.uploadController?.abort();
    }
    async upload(files) {
        if (!files.length || this.busy())
            return;
        const maxUploadBytes = this.data.value()?.maxUploadBytes ?? 20 * 1024 * 1024;
        this.validation.set(maxUploadBytes > 0 && files.some((file) => file.size > maxUploadBytes)
            ? 'uploadValidation'
            : '');
        if (this.validation())
            return;
        this.busy.set(true);
        this.uploading.set(true);
        this.progress.set(0);
        this.failedUploads.set([]);
        this.uploadCancelled.set(false);
        this.uploadCount.set(files.length);
        const controller = new AbortController();
        this.uploadController = controller;
        const folder = this.query.text('folder');
        const slowUpload = this.data.value()?.slowUploadMode;
        try {
            for (const [index, file] of files.entries()) {
                if (controller.signal.aborted)
                    break;
                this.currentUpload.set(file);
                this.uploadIndex.set(index + 1);
                const progress = (value) => this.progress.set(Math.min(99, Math.floor(((index + value / 100) / files.length) * 100)));
                const upload = (report) => this.api.upload(file, report, folder, controller.signal);
                try {
                    if (slowUpload)
                        await simulateSlowUpload(upload, progress, controller.signal);
                    else
                        await upload(progress);
                }
                catch {
                    if (controller.signal.aborted)
                        break;
                    this.failedUploads.update((failed) => [...failed, file]);
                }
            }
            if (!controller.signal.aborted && !this.failedUploads().length) {
                this.progress.set(100);
                this.toast.success(files.length === 1 ? 'fileUploaded' : 'filesUploaded');
            }
        }
        finally {
            this.uploadController = undefined;
            this.currentUpload.set(null);
            this.uploading.set(false);
            const input = document.getElementById('file-upload');
            if (input)
                input.value = '';
            try {
                await this.load();
                this.navigation.refresh();
            }
            finally {
                this.busy.set(false);
            }
        }
    }
    async download(file) {
        this.busy.set(true);
        try {
            if (file.isFolder)
                await this.api.downloadPost('file-storage/batch/download', { ids: [file.id] }, `${file.name}.zip`);
            else
                await this.api.download(`${this.basePath}/${file.id}/download`, file.name);
        }
        catch {
            /* Central errors. */
        }
        finally {
            this.busy.set(false);
        }
    }
    openFolder(id) {
        if (this.busy())
            return;
        this.data.value.set(null);
        void this.query.set({ folder: id, search: null, page: 1 });
    }
    openCreateFolder() {
        if (!this.busy())
            this.actionMode.set('create');
    }
    async createFolder(name) {
        if (this.busy() || !name)
            return;
        this.busy.set(true);
        try {
            await this.api.post('file-storage/folders', {
                name,
                parentId: this.query.text('folder') || null,
            });
            this.actionMode.set('');
            this.toast.success('folderCreated');
            await this.load();
            this.navigation.refresh();
        }
        catch {
            /* Central errors; keep the draft. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async remove(file) {
        if (this.busy() ||
            !(await this.confirm.ask(file.isFolder
                ? this.i18n.text('deleteFolderTitle').replace('{name}', file.name)
                : 'deleteFileTitle', file.isFolder ? 'deleteFolderHelp' : 'deleteFileHelp', file.isFolder ? '' : file.name, true, 'delete')))
            return;
        this.busy.set(true);
        try {
            await this.api.post(`file-storage/${file.id}/delete`);
            this.detailMode.set('');
            this.toast.success('fileDeleted');
            await this.load();
            this.navigation.refresh();
        }
        catch {
            /* Central errors. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function FileStoragePage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStoragePage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FileStoragePage, selectors: [["app-file-storage"]], viewQuery: function FileStoragePage_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.quotaEditor, FileQuotaEditor, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostBindings: function FileStoragePage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function FileStoragePage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, features: [i0.ɵɵProvidersFeature([
                workspaceIcons,
                provideIcons({
                    lucideChevronDown,
                    lucideChevronsUpDown,
                    lucideChevronUp,
                    lucideUserPlus,
                }),
            ])], decls: 61, vars: 60, consts: [["fileGridCard", ""], ["title", "files", "description", "filesIntro"], ["hlmBtn", "", "variant", "ghost", 3, "disabled"], ["hlmBtn", "", "variant", "destructive", 3, "disabled"], [3, "enabled", "minutes"], ["role", "status", 1, "mb-4", "break-words"], ["hlmCard", "", "collapsible", "", 1, "mb-4", "min-w-0"], [1, "workspace-columns"], ["hlmCard", "", 1, "min-w-0"], ["hlmCardHeader", ""], ["hlmCardTitle", "", "id", "file-library-title", "tabindex", "-1"], ["hlmCardDescription", ""], ["hlmCardContent", ""], [1, "workspace-directory-controls", "file-storage-controls"], [1, "file-storage-view-controls"], [3, "valueChange", "value", "ariaLabel", "listLabel", "gridLabel"], [1, "workspace-directory-toolbar", "file-storage-filter-toolbar"], ["hlmField", "", 1, "file-storage-search"], ["hlmFieldLabel", "", "for", "file-search", 1, "sr-only"], ["hlmInput", "", "id", "file-search", "maxlength", "120", 3, "ngModelChange", "ngModel", "placeholder"], [3, "retry", "state", "refreshing", "refreshError"], [3, "columns", "rowActionLabel", "data", "rowDraggable", "rowDragging", "rowDropActive", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "sizeChange", "pageChange", "total", "page", "size", "showSizePicker", "busy"], [1, "workspace-stack"], ["hlmCard", "", "id", "upload-panel", 1, "file-storage-upload-card"], ["hlmCard", ""], ["hlmCardTitle", ""], [3, "owner"], [1, "workspace-meta", "mt-4"], ["routerLink", "/privacy", 1, "workspace-link", "text-sm", "mt-3", "inline-block"], ["fieldId", "page-file-action", 3, "cancelled", "createFolder", "move", "mode", "description", "destinations", "busy"], [3, "stateChanged", "state"], [4, "hlmDialogPortal"], ["direction", "right", 3, "stateChanged", "state"], ["class", "overflow-hidden sm:max-w-lg", 4, "hlmDrawerPortal"], ["hlmBtn", "", "variant", "ghost", 3, "click", "disabled"], ["hlmBtn", "", 3, "click", "disabled"], ["name", "lucideArrowUpFromLine"], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmBtn", "", "variant", "destructive", 3, "click", "disabled"], ["name", "lucideTrash2", "aria-hidden", "true"], ["type", "button", 1, "file-storage-card-open", 3, "click", "disabled"], ["name", "lucideArrowLeft", "aria-hidden", "true", 1, "my-file-icon"], [3, "file"], [1, "min-w-0", "flex-1"], [1, "block", "truncate", "font-medium"], [3, "name", "actions"], [1, "workspace-meta", "block", "truncate"], ["hlmBadge", "", "variant", "outline"], ["hlmCardContent", "", 1, "file-storage-recent-content"], ["role", "region", 1, "file-storage-recent"], [1, "file-storage-grid-card", "file-storage-recent-card"], [1, "workspace-meta"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], [3, "rowAction", "rowDragStart", "rowDragEnd", "rowDragOver", "rowDragLeave", "rowDrop", "sortChange", "columns", "rowActionLabel", "data", "rowDraggable", "rowDragging", "rowDropActive", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], ["role", "toolbar", 1, "file-storage-grid-sort"], ["hlmBtn", "", "type", "button", "variant", "ghost", "size", "sm", 1, "-ms-[calc(var(--spacing)*2.5+1px)]"], [1, "file-storage-grid"], [1, "file-storage-grid-card", 3, "opacity-50", "file-storage-drop-target"], [1, "col-span-full", "flex", "h-14"], ["hlmBtn", "", "type", "button", "variant", "ghost", "size", "sm", 1, "-ms-[calc(var(--spacing)*2.5+1px)]", 3, "click"], ["aria-hidden", "true", 3, "name"], [1, "file-storage-grid-card", 3, "dragstart", "dragend", "dragover", "dragleave", "drop"], ["hlmEmpty", "", "variant", "compact", "role", "status"], ["hlmEmptyHeader", "", "variant", "compact"], ["hlmEmptyTitle", "", "variant", "compact"], ["hlmCardContent", "", 1, "file-storage-upload-content", "grid", "gap-3"], ["role", "progressbar", "aria-valuemin", "0", "aria-valuemax", "100", 1, "file-storage-upload-progress", 3, "width"], ["id", "file-upload", "type", "file", "hidden", "", "multiple", "", 3, "change", "disabled"], [1, "file-storage-dropzone"], ["type", "button", 1, "file-storage-dropzone", 3, "file-storage-drop-target", "disabled"], ["forceShow", ""], ["role", "status", 1, "workspace-meta"], [1, "grid", "gap-2"], ["role", "progressbar", "aria-valuemin", "0", "aria-valuemax", "100", 1, "file-storage-upload-progress"], [1, "file-storage-dropzone", 3, "dragover", "drop"], ["role", "status", 1, "grid", "gap-1", "min-w-0", "w-full"], [1, "font-medium", "truncate", 3, "title"], ["hlmBtn", "", "variant", "destructive", "type", "button", "size", "xs", 3, "click", "disabled"], ["type", "button", 1, "file-storage-dropzone", 3, "click", "dragover", "dragleave", "drop", "disabled"], [1, "font-medium"], [1, "break-all"], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click", "disabled"], [1, "font-medium", "mb-3"], ["role", "img", 1, "file-storage-quota"], [3, "width", "title"], [1, "file-storage-quota-legend"], ["data-category", "remaining", 1, "file-storage-swatch"], [3, "title"], [1, "file-storage-swatch"], ["hlmAlert", "", "role", "status", 1, "mt-4"], ["hlmAlertTitle", ""], ["hlmAlertDescription", ""], [3, "saved", "owner"], ["hlmDialogTitle", ""], [1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "share-email"], ["hlmInput", "", "type", "email", "id", "share-email", "name", "email", "maxlength", "256", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldLabel", "", "for", "share-role"], [3, "valueChange", "value"], [3, "buttonId"], [3, "placeholder"], [4, "hlmSelectPortal"], ["hlmBtn", "", "type", "submit", 3, "disabled"], ["value", "viewer"], ["value", "editor"], [1, "overflow-hidden", "sm:max-w-lg"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], ["hlmDrawerBody", "", 1, "min-h-0", "flex-1", "content-start", "overflow-y-auto", "grid", "gap-4"], ["id", "file-details-form", 1, "grid", "gap-4"], ["id", "file-details-form", 1, "grid", "gap-4", 3, "ngSubmit"], [1, "flex", "items-center", "gap-3"], [1, "font-medium", "break-all"], [1, "file-storage-metadata"], ["hlmBtn", "", "size", "lg", "type", "button", 1, "w-full", 3, "disabled"], ["role", "group", 1, "flex", "flex-wrap", "gap-2"], ["hlmFieldLabel", "", "for", "detail-name"], ["hlmInput", "", "id", "detail-name", "name", "detailName", "required", "", "maxlength", "180", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldLabel", "", "for", "detail-description"], ["hlmInput", "", "id", "detail-description", "name", "detailDescription", "maxlength", "4000", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldLabel", "", "for", "detail-tags"], ["hlmInput", "", "id", "detail-tags", "name", "detailTags", "maxlength", "1000", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldDescription", ""], ["hlmFieldLabel", "", "for", "detail-important", 1, "cursor-pointer", "has-[[data-disabled=true]]:cursor-not-allowed"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "detail-important", "name", "detailImportant", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldLabel", "", "for", "detail-starred", 1, "cursor-pointer", "has-[[data-disabled=true]]:cursor-not-allowed"], ["inputId", "detail-starred", "name", "detailStarred", 3, "ngModelChange", "ngModel", "disabled"], ["hlmBtn", "", "size", "lg", "type", "button", 1, "w-full", 3, "click", "disabled"], ["name", "lucideArrowDownToLine", "aria-hidden", "true"], ["hlmBtn", "", "variant", "outline", "type", "button", 1, "w-full", 3, "click", "disabled"], ["name", "lucideUserPlus", "aria-hidden", "true"], ["aria-labelledby", "shared-people-title", 1, "grid", "gap-3"], ["id", "shared-people-title", 1, "font-medium"], [1, "grid", "gap-3"], [1, "flex", "flex-wrap", "items-center", "gap-2"], [1, "min-w-0", "flex-1", "break-all"], ["hlmBadge", "", "variant", "secondary"], ["hlmBtn", "", "variant", "outline", "size", "sm", "type", "button", 3, "click", "disabled"], ["hlmBtn", "", "type", "button", 3, "variant", "disabled"], ["hlmBtn", "", "type", "button", 3, "click", "variant", "disabled"], ["hlmBtn", "", "type", "submit", "form", "file-details-form", 3, "disabled"]], template: function FileStoragePage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 1);
            i0.ɵɵconditionalCreate(1, FileStoragePage_Conditional_1_Template, 3, 4, "button", 2);
            i0.ɵɵconditionalCreate(2, FileStoragePage_Conditional_2_Template, 7, 7)(3, FileStoragePage_Conditional_3_Template, 4, 4, "button", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelement(4, "app-file-storage-demo-banner", 4);
            i0.ɵɵconditionalCreate(5, FileStoragePage_Conditional_5_Template, 3, 4, "p", 5);
            i0.ɵɵtemplate(6, FileStoragePage_ng_template_6_Template, 8, 7, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵconditionalCreate(8, FileStoragePage_Conditional_8_Template, 14, 11, "section", 6);
            i0.ɵɵelementStart(9, "div", 7)(10, "section", 8)(11, "div", 9)(12, "h2", 10);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "p", 11);
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(18, "div", 12)(19, "div", 13)(20, "div", 14)(21, "app-view-mode-toggle", 15);
            i0.ɵɵpipe(22, "t");
            i0.ɵɵpipe(23, "t");
            i0.ɵɵpipe(24, "t");
            i0.ɵɵlistener("valueChange", function FileStoragePage_Template_app_view_mode_toggle_valueChange_21_listener($event) { return ctx.setView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "div", 16)(26, "div", 17)(27, "label", 18);
            i0.ɵɵtext(28);
            i0.ɵɵpipe(29, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "input", 19);
            i0.ɵɵpipe(31, "t");
            i0.ɵɵlistener("ngModelChange", function FileStoragePage_Template_input_ngModelChange_30_listener($event) { return ctx.search.update($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(32, "app-page-state", 20);
            i0.ɵɵlistener("retry", function FileStoragePage_Template_app_page_state_retry_32_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(33, FileStoragePage_Conditional_33_Template, 3, 15, "app-data-table", 21)(34, FileStoragePage_Conditional_34_Template, 9, 15);
            i0.ɵɵelementStart(35, "app-list-pager", 22);
            i0.ɵɵlistener("sizeChange", function FileStoragePage_Template_app_list_pager_sizeChange_35_listener($event) { return ctx.query.set({ size: $event, page: 1 }); })("pageChange", function FileStoragePage_Template_app_list_pager_pageChange_35_listener($event) { return ctx.query.set({ page: $event }); });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(36, "aside", 23);
            i0.ɵɵconditionalCreate(37, FileStoragePage_Conditional_37_Template, 16, 12, "section", 24);
            i0.ɵɵelementStart(38, "section", 25)(39, "div", 9)(40, "h2", 26);
            i0.ɵɵtext(41);
            i0.ɵɵpipe(42, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "p", 11);
            i0.ɵɵtext(44);
            i0.ɵɵpipe(45, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(46, "div", 12);
            i0.ɵɵconditionalCreate(47, FileStoragePage_Conditional_47_Template, 19, 15);
            i0.ɵɵconditionalCreate(48, FileStoragePage_Conditional_48_Template, 1, 1);
            i0.ɵɵconditionalCreate(49, FileStoragePage_Conditional_49_Template, 1, 1, "app-file-quota-editor", 27);
            i0.ɵɵelementStart(50, "p", 28);
            i0.ɵɵtext(51);
            i0.ɵɵpipe(52, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(53, "a", 29);
            i0.ɵɵtext(54);
            i0.ɵɵpipe(55, "t");
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(56, "app-file-storage-action-dialog", 30);
            i0.ɵɵlistener("cancelled", function FileStoragePage_Template_app_my_files_action_dialog_cancelled_56_listener() { return ctx.actionMode.set(""); })("createFolder", function FileStoragePage_Template_app_my_files_action_dialog_createFolder_56_listener($event) { return ctx.createFolder($event); })("move", function FileStoragePage_Template_app_my_files_action_dialog_move_56_listener($event) { return ctx.move($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(57, "hlm-dialog", 31);
            i0.ɵɵlistener("stateChanged", function FileStoragePage_Template_hlm_dialog_stateChanged_57_listener($event) { return !ctx.busy() && ctx.shareOpen.set($event === "open"); });
            i0.ɵɵtemplate(58, FileStoragePage_hlm_dialog_content_58_Template, 27, 24, "hlm-dialog-content", 32);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "hlm-drawer", 33);
            i0.ɵɵlistener("stateChanged", function FileStoragePage_Template_hlm_drawer_stateChanged_59_listener($event) { return !ctx.busy() && $event === "closed" && ctx.detailMode.set(""); });
            i0.ɵɵtemplate(60, FileStoragePage_hlm_drawer_content_60_Template, 10, 6, "hlm-drawer-content", 34);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_1_0;
            let tmp_29_0;
            let tmp_30_0;
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_1_0 = ctx.data.value()?.folder) ? 1 : -1, tmp_1_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.adminOwner && ctx.group !== "trash" && ctx.group !== "shared" ? 2 : !ctx.adminOwner && ctx.group === "trash" ? 3 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("enabled", ctx.data.value()?.demoMode ?? false)("minutes", ctx.data.value()?.demoExpiryMinutes ?? 60);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.adminOwner ? 5 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.adminOwner && ctx.group === "file-storage" && !ctx.query.text("folder") ? 8 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", ctx.data.value()?.folder?.name || i0.ɵɵpipeBind1(14, 38, ctx.groupLabel), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 40, "fileLibraryHelp"));
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("value", ctx.view())("ariaLabel", i0.ɵɵpipeBind1(22, 42, "fileView"))("listLabel", i0.ɵɵpipeBind1(23, 44, "fileListView"))("gridLabel", i0.ɵɵpipeBind1(24, 46, "fileGridView"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 48, "fileSearchLabel"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.search.value())("placeholder", i0.ɵɵpipeBind1(31, 50, "fileSearch"));
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshing", ctx.view() === "grid" && ctx.data.refreshing())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.view() === "list" ? 33 : 34);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("total", ctx.data.value()?.page?.total ?? 0)("page", ctx.query.page)("size", ctx.pageSize)("showSizePicker", true)("busy", ctx.busy() || ctx.data.refreshing());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.adminOwner && ctx.group !== "trash" && ctx.group !== "shared" ? 37 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(42, 52, "storageUsage"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(45, 54, "storageUsageHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_29_0 = ctx.data.value()) ? 47 : -1, tmp_29_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_30_0 = ctx.data.value()) ? 48 : -1, tmp_30_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.adminOwner ? 49 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(52, 56, "fileStorageRetentionHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(55, 58, "privacyAndData"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("mode", ctx.actionMode())("description", ctx.actionDescription())("destinations", ctx.pageMoveDestinations())("busy", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.shareOpen() ? "open" : "closed");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.detailMode() ? "open" : "closed");
        } }, dependencies: [i1.PageHeader, i1.PageState, i1.ListPager, i2.ViewModeToggle, i3.FormsModule, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.MaxLengthValidator, i3.NgModel, i3.NgForm, i4.RouterLink, i5.NgIcon, i6.HlmButton, i7.HlmCard, i7.HlmCardContent, i7.HlmCardDescription, i7.HlmCardHeader, i7.HlmCardTitle, i8.HlmBadge, i9.HlmField, i9.HlmFieldDescription, i9.HlmFieldError, i9.HlmFieldLabel, i10.HlmInput, i11.HlmEmpty, i11.HlmEmptyHeader, i11.HlmEmptyTitle, i12.HlmAlert, i12.HlmAlertDescription, i12.HlmAlertTitle, i13.HlmCheckbox, FileStorageDemoBanner,
            DataTable, i14.HlmDrawer, i14.HlmDrawerBody, i14.HlmDrawerContent, i14.HlmDrawerDescription, i14.HlmDrawerFooter, i14.HlmDrawerHeader, i14.HlmDrawerPortal, i14.HlmDrawerTitle, FileStorageFileActions,
            FileStorageActionDialog, i15.HlmDialog, i15.HlmDialogContent, i15.HlmDialogFooter, i15.HlmDialogHeader, i15.HlmDialogPortal, i15.HlmDialogTitle, FileQuotaEditor,
            FileStorageFileIcon, i16.HlmSelect, i16.HlmSelectContent, i16.HlmSelectItem, i16.HlmSelectPortal, i16.HlmSelectTrigger, i16.HlmSelectValue, NgTemplateOutlet, i17.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStoragePage, [{
        type: Component,
        args: [{
                selector: 'app-file-storage',
                imports: [
                    WorkspaceUi,
                    FileStorageDemoBanner,
                    DataTable,
                    HlmDrawerImports,
                    FileStorageFileActions,
                    FileStorageActionDialog,
                    HlmDialogImports,
                    FileQuotaEditor,
                    FileStorageFileIcon,
                    HlmSelectImports,
                    NgTemplateOutlet,
                ],
                providers: [
                    workspaceIcons,
                    provideIcons({
                        lucideChevronDown,
                        lucideChevronsUpDown,
                        lucideChevronUp,
                        lucideUserPlus,
                    }),
                ],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: ` <app-page-header title="files" description="filesIntro">
      @if (data.value()?.folder; as folder) {
        <button hlmBtn variant="ghost" [disabled]="busy()" (click)="detail(folder, 'fileDetails')">
          {{ 'folderDetails' | t }}
        </button>
      }
      @if (!adminOwner && group !== 'trash' && group !== 'shared') {
        <button hlmBtn [disabled]="busy()" (click)="showUpload()">
          <ng-icon name="lucideArrowUpFromLine" />{{ 'uploadFiles' | t }}</button
        ><button hlmBtn variant="outline" (click)="openCreateFolder()">
          {{ 'createFolder' | t }}
        </button>
      } @else if (!adminOwner && group === 'trash') {
        <button hlmBtn variant="destructive" [disabled]="busy()" (click)="emptyTrash()">
          <ng-icon name="lucideTrash2" aria-hidden="true" />{{ 'emptyTrash' | t }}
        </button>
      }
    </app-page-header>
    <app-file-storage-demo-banner
      [enabled]="data.value()?.demoMode ?? false"
      [minutes]="data.value()?.demoExpiryMinutes ?? 60"
    />
    @if (adminOwner) {
      <p class="mb-4 break-words" role="status">
        {{ 'viewingUserFiles' | t }}: {{ data.value()?.ownerName }}
      </p>
    }
    <ng-template #fileGridCard let-file>
      <button
        class="file-storage-card-open"
        type="button"
        [disabled]="busy()"
        [attr.aria-label]="entryLabel(file)"
        (click)="openEntry(file)"
      >
        @if (isParentEntry(file)) {
          <ng-icon name="lucideArrowLeft" class="my-file-icon" aria-hidden="true" />
        } @else {
          <app-my-file-icon [file]="file" />
        }
        <span class="min-w-0 flex-1">
          <span class="block truncate font-medium" [attr.title]="file.name">{{ file.name }}</span>
          @if (!isParentEntry(file)) {
            <span class="workspace-meta block truncate"
              >{{ file.isFolder ? ('folder' | t) : bytes(file.size) }} &middot;
              {{ i18n.date(file.updatedAt || file.createdAt) }}</span
            >
            @if (file.important) {
              <span hlmBadge variant="outline">{{ 'important' | t }}</span>
            }
            @if (file.starred) {
              <span hlmBadge variant="outline">{{ 'starred' | t }}</span>
            }
          }
        </span>
      </button>
      @if (!isParentEntry(file)) {
        <app-my-file-actions [name]="file.name" [actions]="inlineActions(file, busy())" />
      }
    </ng-template>
    @if (!adminOwner && group === 'file-storage' && !query.text('folder')) {
      <section hlmCard collapsible class="mb-4 min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'recentFiles' | t }}</h2>
          <p hlmCardDescription>{{ 'recentScopeHelp' | t }}</p>
        </div>
        <div hlmCardContent class="file-storage-recent-content">
          <ul class="file-storage-recent" role="region" [attr.aria-label]="'recentFiles' | t">
            @for (file of (data.value()?.recent ?? []).slice(0, 6); track file.id) {
              <li class="file-storage-grid-card file-storage-recent-card">
                <ng-container
                  [ngTemplateOutlet]="fileGridCard"
                  [ngTemplateOutletContext]="{ $implicit: file }"
                />
              </li>
            } @empty {
              <li class="workspace-meta">{{ 'filesEmpty' | t }}</li>
            }
          </ul>
        </div>
      </section>
    }
    <div class="workspace-columns">
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle id="file-library-title" tabindex="-1">
            {{ data.value()?.folder?.name || (groupLabel | t) }}
          </h2>
          <p hlmCardDescription>{{ 'fileLibraryHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <div class="workspace-directory-controls file-storage-controls">
            <div class="file-storage-view-controls">
              <app-view-mode-toggle
                [value]="view()"
                (valueChange)="setView($event)"
                [ariaLabel]="'fileView' | t"
                [listLabel]="'fileListView' | t"
                [gridLabel]="'fileGridView' | t"
              />
            </div>
            <div class="workspace-directory-toolbar file-storage-filter-toolbar">
              <div hlmField class="file-storage-search">
                <label hlmFieldLabel class="sr-only" for="file-search">{{
                  'fileSearchLabel' | t
                }}</label
                ><input
                  hlmInput
                  id="file-search"
                  [ngModel]="search.value()"
                  (ngModelChange)="search.update($event)"
                  maxlength="120"
                  [placeholder]="'fileSearch' | t"
                />
              </div>
            </div>
          </div>
          <app-page-state
            [state]="data.state()"
            [refreshing]="view() === 'grid' && data.refreshing()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
          >
            @if (view() === 'list') {
              <app-data-table
                [columns]="columns()"
                [rowActionLabel]="entryLabel"
                (rowAction)="openEntry($event)"
                [data]="displayItems()"
                [rowDraggable]="canDragEntry"
                [rowDragging]="isDraggedEntry"
                [rowDropActive]="isActiveDropTarget"
                (rowDragStart)="startEntryDrag($event.event, $event.row)"
                (rowDragEnd)="endEntryDrag()"
                (rowDragOver)="overEntryDrop($event.event, $event.row)"
                (rowDragLeave)="leaveEntryDrop($event.event, $event.row)"
                (rowDrop)="dropEntry($event.event, $event.row)"
                [loading]="data.state() === 'loading' || data.refreshing()"
                [loadingText]="'loading' | t"
                [emptyText]="'filesEmpty' | t"
                [sortColumn]="query.text('sort', 'updatedAt')"
                [sortDirection]="query.direction('desc')"
                (sortChange)="sort($event)"
              />
            } @else {
              <div class="file-storage-grid-sort" role="toolbar" [attr.aria-label]="'sort' | t">
                @for (
                  option of [
                    { column: 'name', label: 'fileName' },
                    { column: 'size', label: 'fileSize' },
                    { column: 'updatedAt', label: 'updatedAt' },
                  ];
                  track option.column
                ) {
                  <button
                    hlmBtn
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="-ms-[calc(var(--spacing)*2.5+1px)]"
                    [attr.aria-pressed]="query.text('sort', 'updatedAt') === option.column"
                    (click)="toggleGridSort(option.column)"
                  >
                    {{ option.label | t }}
                    <ng-icon [name]="gridSortIcon(option.column)" aria-hidden="true" />
                  </button>
                }
              </div>
              <ul
                class="file-storage-grid"
                [attr.aria-label]="'files' | t"
                [attr.aria-busy]="data.refreshing()"
              >
                @for (file of displayItems(); track file.id) {
                  <li
                    class="file-storage-grid-card"
                    [attr.draggable]="canDragEntry(file) ? 'true' : null"
                    [class.opacity-50]="isDraggedEntry(file)"
                    [class.file-storage-drop-target]="isActiveDropTarget(file)"
                    (dragstart)="startEntryDrag($event, file)"
                    (dragend)="endEntryDrag()"
                    (dragover)="overEntryDrop($event, file)"
                    (dragleave)="leaveEntryDrop($event, file)"
                    (drop)="dropEntry($event, file)"
                  >
                    <ng-container
                      [ngTemplateOutlet]="fileGridCard"
                      [ngTemplateOutletContext]="{ $implicit: file }"
                    />
                  </li>
                } @empty {
                  <li class="col-span-full flex h-14">
                    <div hlmEmpty variant="compact" role="status">
                      <div hlmEmptyHeader variant="compact">
                        <p hlmEmptyTitle variant="compact">{{ 'filesEmpty' | t }}</p>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
            <app-list-pager
              [total]="data.value()?.page?.total ?? 0"
              [page]="query.page"
              [size]="pageSize"
              [showSizePicker]="true"
              [busy]="busy() || data.refreshing()"
              (sizeChange)="query.set({ size: $event, page: 1 })"
              (pageChange)="query.set({ page: $event })"
          /></app-page-state>
        </div>
      </section>
      <aside class="workspace-stack">
        @if (!adminOwner && group !== 'trash' && group !== 'shared') {
          <section hlmCard id="upload-panel" class="file-storage-upload-card">
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'uploadFiles' | t }}</h2>
              <p hlmCardDescription>{{ 'uploadFilesHelp' | t }}</p>
            </div>
            <div hlmCardContent class="file-storage-upload-content grid gap-3">
              @if (uploading()) {
                <div
                  class="file-storage-upload-progress"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  [attr.aria-valuenow]="progress()"
                  [attr.aria-label]="'uploadProgress' | t"
                  [style.width.%]="progress()"
                ></div>
              }
              <input
                id="file-upload"
                type="file"
                hidden
                multiple
                [disabled]="busy()"
                (change)="choose($event)"
              />
              @if (uploading()) {
                <div
                  class="file-storage-dropzone"
                  (dragover)="$event.preventDefault()"
                  (drop)="$event.preventDefault()"
                >
                  <div role="status" class="grid gap-1 min-w-0 w-full">
                    <span class="font-medium truncate" [title]="currentUpload()?.name">{{
                      currentUpload()?.name
                    }}</span>
                    <span class="workspace-meta"
                      >{{ 'uploadFileNumber' | t }} {{ uploadIndex() }} {{ 'uploadOf' | t }}
                      {{ uploadCount() }} · {{ 'uploading' | t }} {{ progress() }}%</span
                    >
                  </div>
                  <button
                    hlmBtn
                    variant="destructive"
                    type="button"
                    (click)="cancelUpload()"
                    size="xs"
                    [disabled]="uploadCancelled()"
                  >
                    {{ 'cancel' | t }}
                  </button>
                </div>
              } @else {
                <button
                  type="button"
                  class="file-storage-dropzone"
                  [class.file-storage-drop-target]="uploadDragOver()"
                  [disabled]="busy()"
                  (click)="showUpload()"
                  (dragover)="overUpload($event)"
                  (dragleave)="uploadDragOver.set(false)"
                  (drop)="dropUpload($event)"
                >
                  <span class="font-medium">{{ 'dropFileHere' | t }}</span>
                  <span class="workspace-meta">{{ 'browseFileHelp' | t }}</span>
                  <span class="workspace-meta">{{ 'uploadLimits' | t }}</span>
                </button>
              }
              @if (validation()) {
                <hlm-field-error forceShow>{{ validation() | t }}</hlm-field-error>
              }
              @if (!uploading() && uploadCancelled()) {
                <p class="workspace-meta" role="status">{{ 'uploadBatchCancelled' | t }}</p>
              }
              @if (!uploading() && failedUploads().length) {
                <div class="grid gap-2">
                  <p class="workspace-meta" role="status">{{ 'uploadFailedFiles' | t }}</p>
                  <ul class="workspace-meta">
                    @for (file of failedUploads(); track $index) {
                      <li class="break-all">{{ file.name }}</li>
                    }
                  </ul>
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    [disabled]="busy()"
                    (click)="upload(failedUploads())"
                  >
                    {{ 'retryFailedUploads' | t }}
                  </button>
                </div>
              }
            </div>
          </section>
        }
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'storageUsage' | t }}</h2>
            <p hlmCardDescription>{{ 'storageUsageHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            @if (data.value(); as value) {
              <p class="font-medium mb-3">
                {{ bytes(value.usedBytes) }} /
                {{ value.quotaBytes === -1 ? ('maxUploadNoLimit' | t) : bytes(value.quotaBytes) }}
              </p>
              <div
                class="file-storage-quota"
                role="img"
                [attr.aria-label]="
                  ('storageUsage' | t) +
                  ': ' +
                  bytes(value.usedBytes) +
                  ' / ' +
                  (value.quotaBytes === -1 ? ('maxUploadNoLimit' | t) : bytes(value.quotaBytes))
                "
              >
                @for (segment of value.usage; track segment.category) {
                  <span
                    [attr.data-category]="segment.category"
                    [style.width.%]="
                      (100 * segment.bytes) /
                      Math.max(value.usedBytes, value.quotaBytes > 0 ? value.quotaBytes : 0, 1)
                    "
                    [title]="('fileType.' + segment.category | t) + ': ' + bytes(segment.bytes)"
                  ></span>
                }
              </div>
              <ul class="file-storage-quota-legend">
                @for (segment of value.usage; track segment.category) {
                  <li>
                    <span class="file-storage-swatch" [attr.data-category]="segment.category"></span
                    ><span
                      >{{ 'fileType.' + segment.category | t }}
                      <small>({{ i18n.number(segment.count) }})</small></span
                    ><strong>{{ bytes(segment.bytes) }}</strong>
                  </li>
                }
                <li>
                  <span class="file-storage-swatch" data-category="remaining"></span
                  ><span>{{ 'remainingStorage' | t }}</span
                  ><strong>{{
                    value.quotaBytes === -1
                      ? ('maxUploadNoLimit' | t)
                      : bytes(Math.max(0, value.quotaBytes - value.usedBytes))
                  }}</strong>
                </li>
              </ul>
            }
            @if (data.value(); as value) {
              @if (value.quotaBytes >= 0 && value.usedBytes >= value.quotaBytes) {
                <div hlmAlert class="mt-4" role="status">
                  <h3 hlmAlertTitle>{{ 'quotaReached' | t }}</h3>
                  <p hlmAlertDescription>{{ 'quotaReachedHelp' | t }}</p>
                </div>
              }
            }
            @if (adminOwner) {
              <app-file-quota-editor [owner]="adminOwner" (saved)="load()" />
            }
            <p class="workspace-meta mt-4">{{ 'fileStorageRetentionHelp' | t }}</p>
            <a routerLink="/privacy" class="workspace-link text-sm mt-3 inline-block">{{
              'privacyAndData' | t
            }}</a>
          </div>
        </section>
      </aside>
    </div>
    <app-file-storage-action-dialog
      fieldId="page-file-action"
      [mode]="actionMode()"
      [description]="actionDescription()"
      [destinations]="pageMoveDestinations()"
      [busy]="busy()"
      (cancelled)="actionMode.set('')"
      (createFolder)="createFolder($event)"
      (move)="move($event)"
    />
    <hlm-dialog
      [state]="shareOpen() ? 'open' : 'closed'"
      (stateChanged)="!busy() && shareOpen.set($event === 'open')"
    >
      <hlm-dialog-content *hlmDialogPortal>
        <hlm-dialog-header
          ><h2 hlmDialogTitle>{{ 'shareFile' | t }}</h2></hlm-dialog-header
        >
        <form class="grid gap-4" (ngSubmit)="share()">
          <div hlmField>
            <label hlmFieldLabel for="share-email">{{ 'shareEmail' | t }}</label
            ><input
              hlmInput
              type="email"
              id="share-email"
              name="email"
              [(ngModel)]="shareEmail"
              maxlength="256"
              required
              [disabled]="busy()"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="share-role">{{ 'sharePermission' | t }}</label
            ><hlm-select [(value)]="sharePermission"
              ><hlm-select-trigger [buttonId]="'share-role'"
                ><hlm-select-value [placeholder]="'viewer' | t" /></hlm-select-trigger
              ><hlm-select-content *hlmSelectPortal
                ><hlm-select-item value="viewer">{{ 'viewer' | t }}</hlm-select-item
                ><hlm-select-item value="editor">{{
                  'editor' | t
                }}</hlm-select-item></hlm-select-content
              ></hlm-select
            >
          </div>
          <hlm-dialog-footer
            ><button
              hlmBtn
              variant="outline"
              type="button"
              [disabled]="busy()"
              (click)="shareOpen.set(false)"
            >
              {{ 'cancel' | t }}</button
            ><button hlmBtn type="submit" [disabled]="busy() || !shareEmail.trim()">
              {{ 'createShare' | t }}
            </button></hlm-dialog-footer
          >
        </form>
      </hlm-dialog-content>
    </hlm-dialog>
    <hlm-drawer
      direction="right"
      [state]="detailMode() ? 'open' : 'closed'"
      (stateChanged)="!busy() && $event === 'closed' && detailMode.set('')"
    >
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-lg">
        <hlm-drawer-header
          ><h2 hlmDrawerTitle>
            {{
              (detailMode() === 'fileDetails' && detailFile()?.isFolder
                ? 'folderDetails'
                : detailMode()
              ) | t
            }}
          </h2>
          <p hlmDrawerDescription>{{ detailFile()?.name }}</p></hlm-drawer-header
        >
        <div hlmDrawerBody class="min-h-0 flex-1 content-start overflow-y-auto grid gap-4">
          @if (detailMode() === 'fileDetails') {
            @if (detailFile(); as file) {
              <form id="file-details-form" class="grid gap-4" (ngSubmit)="saveDetails()">
                <div class="flex items-center gap-3">
                  <app-my-file-icon [file]="file" /><span class="font-medium break-all">{{
                    file.name
                  }}</span>
                </div>
                <dl class="file-storage-metadata">
                  <dt>{{ 'fileKind' | t }}</dt>
                  <dd>
                    {{ (file.isFolder ? 'folder' : 'fileType.' + (file.category || 'other')) | t }}
                  </dd>
                  @if (!file.isFolder) {
                    <dt>{{ 'fileSize' | t }}</dt>
                    <dd>{{ bytes(file.size) }}</dd>
                    <dt>{{ 'fileContentType' | t }}</dt>
                    <dd>{{ file.contentType }}</dd>
                  }
                  <dt>{{ 'fileLocation' | t }}</dt>
                  <dd>{{ fileLocation(file) }}</dd>
                  <dt>{{ 'fileCreatedAt' | t }}</dt>
                  <dd>{{ i18n.date(file.createdAt) }}</dd>
                  <dt>{{ 'updatedAt' | t }}</dt>
                  <dd>{{ i18n.date(file.updatedAt || file.createdAt) }}</dd>
                  <dt>{{ 'sharePermission' | t }}</dt>
                  <dd>
                    {{
                      (adminOwner
                        ? 'fileAdminAccess'
                        : file.permission === 'owner'
                          ? 'fileOwner'
                          : file.permission || 'viewer'
                      ) | t
                    }}
                  </dd>
                </dl>
                @if (canEditDetails(file)) {
                  <div hlmField>
                    <label hlmFieldLabel for="detail-name">{{ 'entryName' | t }}</label
                    ><input
                      hlmInput
                      id="detail-name"
                      name="detailName"
                      [(ngModel)]="detailName"
                      required
                      maxlength="180"
                      [disabled]="busy()"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="detail-description">{{ 'fileDescription' | t }}</label
                    ><input
                      hlmInput
                      id="detail-description"
                      name="detailDescription"
                      [(ngModel)]="detailDescription"
                      maxlength="4000"
                      [disabled]="busy()"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="detail-tags">{{ 'fileTags' | t }}</label
                    ><input
                      hlmInput
                      id="detail-tags"
                      name="detailTags"
                      [(ngModel)]="detailTags"
                      maxlength="1000"
                      [disabled]="busy()"
                    />
                    <p hlmFieldDescription>{{ 'fileTagsHelp' | t }}</p>
                  </div>
                  <label
                    hlmFieldLabel
                    for="detail-important"
                    class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
                    ><div hlmField orientation="horizontal">
                      <hlm-checkbox
                        inputId="detail-important"
                        name="detailImportant"
                        [(ngModel)]="detailImportant"
                        [disabled]="busy()"
                      /><span>{{ 'important' | t }}</span>
                    </div></label
                  >
                  <label
                    hlmFieldLabel
                    for="detail-starred"
                    class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
                    ><div hlmField orientation="horizontal">
                      <hlm-checkbox
                        inputId="detail-starred"
                        name="detailStarred"
                        [(ngModel)]="detailStarred"
                        [disabled]="busy()"
                      /><span>{{ 'starred' | t }}</span>
                    </div></label
                  >
                } @else {
                  <dl class="file-storage-metadata">
                    <dt>{{ 'fileDescription' | t }}</dt>
                    <dd>{{ file.description || ('fileNotSet' | t) }}</dd>
                    <dt>{{ 'fileTags' | t }}</dt>
                    <dd>{{ file.tags || ('fileNotSet' | t) }}</dd>
                    <dt>{{ 'important' | t }}</dt>
                    <dd>{{ (file.important ? 'fileYes' : 'fileNo') | t }}</dd>
                    <dt>{{ 'starred' | t }}</dt>
                    <dd>{{ (file.starred ? 'fileYes' : 'fileNo') | t }}</dd>
                  </dl>
                }
                @if (!file.isFolder) {
                  <button
                    hlmBtn
                    class="w-full"
                    size="lg"
                    type="button"
                    [disabled]="busy()"
                    (click)="download(file)"
                  >
                    <ng-icon name="lucideArrowDownToLine" aria-hidden="true" />{{ 'download' | t }}
                  </button>
                }
                @if (canShare(file)) {
                  <button
                    hlmBtn
                    class="w-full"
                    variant="outline"
                    type="button"
                    [disabled]="busy()"
                    (click)="openShare(file)"
                  >
                    <ng-icon name="lucideUserPlus" aria-hidden="true" />{{ 'shareFile' | t }}
                  </button>
                  <section class="grid gap-3" aria-labelledby="shared-people-title">
                    <h3 id="shared-people-title" class="font-medium">{{ 'sharedPeople' | t }}</h3>
                    <ul class="grid gap-3">
                      @for (share of peopleShares(); track share.id) {
                        <li class="flex flex-wrap items-center gap-2">
                          <span class="min-w-0 flex-1 break-all">{{ share.recipient }}</span>
                          <span hlmBadge variant="secondary">{{ share.permission | t }}</span>
                          <button
                            hlmBtn
                            variant="outline"
                            size="sm"
                            type="button"
                            [disabled]="busy()"
                            (click)="revoke(share)"
                          >
                            {{ 'revokeShare' | t }}
                          </button>
                        </li>
                      } @empty {
                        <li class="workspace-meta" role="status">{{ 'notSharedYet' | t }}</li>
                      }
                    </ul>
                  </section>
                }
                @if (detailActions(file, busy()).length) {
                  <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="'actions' | t">
                    @for (action of detailActions(file, busy()); track action.label) {
                      <button
                        hlmBtn
                        type="button"
                        [variant]="action.destructive ? 'destructive' : 'outline'"
                        [disabled]="action.disabled"
                        (click)="action.run()"
                      >
                        {{ action.label | t }}
                      </button>
                    }
                  </div>
                }
              </form>
            }
          }
        </div>
        @if (detailMode() === 'fileDetails' && detailFile(); as file) {
          @if (canEditDetails(file)) {
            <hlm-drawer-footer>
              <button
                hlmBtn
                type="submit"
                form="file-details-form"
                [disabled]="busy() || !detailName.trim() || !detailsDirty()"
              >
                {{ 'saveChanges' | t }}
              </button>
            </hlm-drawer-footer>
          }
        }
      </hlm-drawer-content>
    </hlm-drawer>`,
            }]
    }], () => [], { quotaEditor: [{ type: i0.ViewChild, args: [i0.forwardRef(() => FileQuotaEditor), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FileStoragePage, { className: "FileStoragePage", filePath: "src/app/features/file-storage.ts", lineNumber: 726 }); })();
