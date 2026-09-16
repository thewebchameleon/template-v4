import { fileIconName, canMoveFolder, filterVisibleFileGroups } from './file-storage-ui';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { workspaceIcons } from '../../../shared/workspace';
import { phosphorFileArchiveDuotone, phosphorFileAudioDuotone, phosphorFileCDuotone, phosphorFileCSharpDuotone, phosphorFileCppDuotone, phosphorFileCssDuotone, phosphorFileCsvDuotone, phosphorFileDocDuotone, phosphorFileDuotone, phosphorFileHtmlDuotone, phosphorFileImageDuotone, phosphorFileIniDuotone, phosphorFileJpgDuotone, phosphorFileJsDuotone, phosphorFileJsxDuotone, phosphorFileMdDuotone, phosphorFilePdfDuotone, phosphorFilePngDuotone, phosphorFilePptDuotone, phosphorFilePyDuotone, phosphorFileRsDuotone, phosphorFileSqlDuotone, phosphorFileSvgDuotone, phosphorFileTextDuotone, phosphorFileTsDuotone, phosphorFileTsxDuotone, phosphorFileTxtDuotone, phosphorFileVideoDuotone, phosphorFileVueDuotone, phosphorFileXlsDuotone, phosphorFileZipDuotone, phosphorFolderDuotone, } from '@ng-icons/phosphor-icons/duotone';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { I18n } from '../../../core/i18n';
import { Notifications } from '../../notifications/notifications';
import { Component, Injectable, computed, effect, untracked, inject, input, output, signal, } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucideFolder, lucideChevronRight, lucideChevronDown, lucideStar, lucideFlag, lucideUsers, lucideClock, lucideTrash2, lucideArrowLeft, } from '@ng-icons/lucide';
import { WorkspaceUi, Resource, Confirmations } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { filterVisibleFileFolders } from './file-storage-ui';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@ng-icons/core";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "../../../core/i18n";
import * as i5 from "@spartan-ng/helm/badge";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/alert-dialog";
import * as i9 from "@spartan-ng/helm/select";
import * as i10 from "@angular/router";
import * as i11 from "@spartan-ng/helm/sidebar";
import * as i12 from "@spartan-ng/helm/context-menu";
import * as i13 from "@spartan-ng/helm/dropdown-menu";
const _forTrack0 = ($index, $item) => $item.label;
function FileStorageFileActions_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 2);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵlistener("click", function FileStorageFileActions_For_2_Template_button_click_0_listener($event) { const action_r2 = i0.ɵɵrestoreView(_r1).$implicit; $event.stopPropagation(); return i0.ɵɵresetView(action_r2.run()); });
    i0.ɵɵelement(3, "ng-icon", 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", action_r2.disabled);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 6, action_r2.label) + ": " + ctx_r2.name())("title", i0.ɵɵpipeBind1(2, 8, action_r2.label));
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("text-destructive", action_r2.label === "delete");
    i0.ɵɵproperty("name", action_r2.label === "download" ? "lucideArrowDownToLine" : "lucideTrash2");
} }
function FileStorageFileName_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 1);
} }
function FileStorageFileName_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-my-file-icon", 2);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("file", ctx_r0.file());
} }
function FileStorageFileName_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 8);
    i0.ɵɵlistener("click", function FileStorageFileName_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.open()?.()); });
    i0.ɵɵelementStart(1, "span", 9);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.file().name);
} }
function FileStorageFileName_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.file().name);
} }
function FileStorageFileName_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "important"));
} }
function FileStorageFileName_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "starred"));
} }
const _forTrack1 = ($index, $item) => $item.value;
function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 5);
    i0.ɵɵlistener("ngSubmit", function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_7_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.submitCreate()); });
    i0.ɵɵelementStart(1, "div", 6)(2, "label", 7);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 8);
    i0.ɵɵtwoWayListener("ngModelChange", function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_7_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.folderName, $event) || (ctx_r1.folderName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "hlm-alert-dialog-footer")(7, "button", 9);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 10);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", ctx_r1.fieldId() + "-name");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 9, "entryName"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.fieldId() + "-name");
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.folderName);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 11, "cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.folderName.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 13, "createFolder"), " ");
} }
function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_hlm_select_content_7_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const destination_r4 = ctx.$implicit;
    i0.ɵɵproperty("value", destination_r4.value)("disabled", destination_r4.disabled);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(destination_r4.label);
} }
function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_hlm_select_content_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content");
    i0.ɵɵrepeaterCreate(1, FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_hlm_select_content_7_For_2_Template, 2, 3, "hlm-select-item", 16, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.destinations());
} }
function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "label", 7);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "hlm-select", 11);
    i0.ɵɵtwoWayListener("valueChange", function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_Template_hlm_select_valueChange_4_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.moveTarget, $event) || (ctx_r1.moveTarget = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(5, "hlm-select-trigger", 12);
    i0.ɵɵelement(6, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_hlm_select_content_7_Template, 3, 0, "hlm-select-content", 13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "hlm-alert-dialog-footer")(9, "button", 14);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 15);
    i0.ɵɵlistener("click", function FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.move.emit(ctx_r1.moveTarget)); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", ctx_r1.fieldId() + "-destination");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 9, "destinationFolder"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("value", ctx_r1.moveTarget);
    i0.ɵɵproperty("itemToString", ctx_r1.destinationLabel);
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.fieldId() + "-destination");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 11, "cancel"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.selectedDestinationValid());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 13, "moveFile"), " ");
} }
function FileStorageActionDialog_hlm_alert_dialog_content_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-alert-dialog-content")(1, "hlm-alert-dialog-header")(2, "h2", 2);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 3);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_7_Template, 13, 15, "form", 4)(8, FileStorageActionDialog_hlm_alert_dialog_content_1_Conditional_8_Template, 15, 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, ctx_r1.mode() === "create" ? "createFolder" : "moveFile"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.description());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.mode() === "create" ? 7 : ctx_r1.mode() === "move" ? 8 : -1);
} }
const _c0 = a0 => ({ group: a0 });
const _c1 = (a0, a1) => ({ group: a0, folder: a1 });
const _forTrack2 = ($index, $item) => $item.id;
const _forTrack3 = ($index, $item) => $item.file.id;
function FileStorageTree_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 8);
    i0.ɵɵlistener("click", function FileStorageTree_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "retry"));
} }
function FileStorageTree_For_8_ng_template_9_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-dropdown-menu")(1, "button", 14);
    i0.ɵɵlistener("triggered", function FileStorageTree_For_8_ng_template_9_Template_button_triggered_1_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.beginRootFolderCreation()); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "createFolder"), " ");
} }
function FileStorageTree_For_8_Conditional_11_For_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 23);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵlistener("click", function FileStorageTree_For_8_Conditional_11_For_4_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const node_r8 = i0.ɵɵnextContext().$implicit; const group_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggle(group_r4.id + node_r8.file.id)); });
    i0.ɵɵelement(2, "ng-icon", 11);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r8 = i0.ɵɵnextContext().$implicit;
    const group_r4 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "expandFolder") + ": " + node_r8.file.name)("aria-expanded", !ctx_r1.collapsed().has(group_r4.id + node_r8.file.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("name", ctx_r1.collapsed().has(group_r4.id + node_r8.file.id) ? "lucideChevronRight" : "lucideChevronDown");
} }
function FileStorageTree_For_8_Conditional_11_For_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 18);
} }
function FileStorageTree_For_8_Conditional_11_For_4_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 24);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵlistener("click", function FileStorageTree_For_8_Conditional_11_For_4_Conditional_9_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.rememberContextTrigger($event)); });
    i0.ɵɵelement(2, "ng-icon", 25);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r8 = i0.ɵɵnextContext().$implicit;
    const folderMenu_r10 = i0.ɵɵreference(11);
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.busy())("hlmDropdownMenuTrigger", folderMenu_r10);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "folderActions") + ": " + node_r8.file.name);
} }
function FileStorageTree_For_8_Conditional_11_For_4_ng_template_10_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-dropdown-menu")(1, "button", 14);
    i0.ɵɵlistener("triggered", function FileStorageTree_For_8_Conditional_11_For_4_ng_template_10_Template_button_triggered_1_listener() { i0.ɵɵrestoreView(_r11); const node_r8 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.beginContextAction(node_r8.file, "move")); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 14);
    i0.ɵɵlistener("triggered", function FileStorageTree_For_8_Conditional_11_For_4_ng_template_10_Template_button_triggered_4_listener() { i0.ɵɵrestoreView(_r11); const node_r8 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.beginContextAction(node_r8.file, "create")); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "hlm-dropdown-menu-separator");
    i0.ɵɵelementStart(8, "button", 26);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵlistener("triggered", function FileStorageTree_For_8_Conditional_11_For_4_ng_template_10_Template_button_triggered_8_listener() { i0.ɵɵrestoreView(_r11); const node_r8 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.deleteFolder(node_r8.file)); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const node_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 7, "moveFile"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 9, "createFolder"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !!node_r8.file.itemCount);
    i0.ɵɵattribute("title", node_r8.file.itemCount ? i0.ɵɵpipeBind1(9, 11, "emptyFolderRequired") : null);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 13, "delete"), " ");
} }
function FileStorageTree_For_8_Conditional_11_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 16);
    i0.ɵɵanimateEnter("sidebar-item-enter");
    i0.ɵɵlistener("contextmenu", function FileStorageTree_For_8_Conditional_11_For_4_Template_li_contextmenu_0_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.rememberContextTrigger($event)); })("keydown", function FileStorageTree_For_8_Conditional_11_For_4_Template_li_keydown_0_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.rememberContextTriggerKey($event)); });
    i0.ɵɵconditionalCreate(1, FileStorageTree_For_8_Conditional_11_For_4_Conditional_1_Template, 3, 5, "button", 17)(2, FileStorageTree_For_8_Conditional_11_For_4_Conditional_2_Template, 1, 0, "span", 18);
    i0.ɵɵelementStart(3, "a", 19);
    i0.ɵɵlistener("click", function FileStorageTree_For_8_Conditional_11_For_4_Template_a_click_3_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.closeMobile()); })("dragstart", function FileStorageTree_For_8_Conditional_11_For_4_Template_a_dragstart_3_listener($event) { const node_r8 = i0.ɵɵrestoreView(_r6).$implicit; const group_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.startDrag($event, node_r8.file, group_r4.id)); })("dragend", function FileStorageTree_For_8_Conditional_11_For_4_Template_a_dragend_3_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.endDrag()); })("dragover", function FileStorageTree_For_8_Conditional_11_For_4_Template_a_dragover_3_listener($event) { const node_r8 = i0.ɵɵrestoreView(_r6).$implicit; const group_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.dragOver($event, node_r8.file.id, group_r4.id)); })("dragleave", function FileStorageTree_For_8_Conditional_11_For_4_Template_a_dragleave_3_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.dropTarget.set(undefined)); })("drop", function FileStorageTree_For_8_Conditional_11_For_4_Template_a_drop_3_listener($event) { const node_r8 = i0.ɵɵrestoreView(_r6).$implicit; const group_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.dropFolder($event, node_r8.file.id, group_r4.id)); });
    i0.ɵɵelement(4, "app-my-file-icon", 20);
    i0.ɵɵelementStart(5, "span", 21);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 12);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, FileStorageTree_For_8_Conditional_11_For_4_Conditional_9_Template, 3, 5, "button", 22);
    i0.ɵɵtemplate(10, FileStorageTree_For_8_Conditional_11_For_4_ng_template_10_Template, 12, 15, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r8 = ctx.$implicit;
    const ɵ$index_44_r12 = ctx.$index;
    const folderMenu_r10 = i0.ɵɵreference(11);
    const group_r4 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("--%NS%sidebar-item-index", ɵ$index_44_r12)("padding-inline-start", node_r8.depth * 1.25, "rem");
    i0.ɵɵproperty("hlmContextMenuTrigger", folderMenu_r10)("disabled", ctx_r1.busy() || node_r8.file.permission !== "owner" || group_r4.id === "trash");
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r8.children ? 1 : 2);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("file-storage-drop-target", ctx_r1.dropTarget() === node_r8.file.id && group_r4.id !== "trash");
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction2(17, _c1, group_r4.id, node_r8.file.id))("isActive", ctx_r1.selectedGroup() === group_r4.id && ctx_r1.selectedFolder() === node_r8.file.id)("draggable", group_r4.id !== "trash" && node_r8.file.permission === "owner" && !ctx_r1.busy());
    i0.ɵɵattribute("aria-current", ctx_r1.selectedGroup() === group_r4.id && ctx_r1.selectedFolder() === node_r8.file.id ? "page" : null);
    i0.ɵɵadvance();
    i0.ɵɵproperty("file", node_r8.file);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(node_r8.file.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.number(node_r8.file.fileCount ?? 0));
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r8.file.permission === "owner" && group_r4.id !== "trash" ? 9 : -1);
} }
function FileStorageTree_For_8_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 13);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵrepeaterCreate(3, FileStorageTree_For_8_Conditional_11_For_4_Template, 12, 20, "li", 15, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, group_r4.label) + ": " + i0.ɵɵpipeBind1(2, 3, "folderNavigation"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.visibleFolders(group_r4.id));
} }
function FileStorageTree_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 6)(1, "div", 9);
    i0.ɵɵanimateEnter("sidebar-item-enter");
    i0.ɵɵelementStart(2, "a", 10);
    i0.ɵɵlistener("click", function FileStorageTree_For_8_Template_a_click_2_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeMobile()); })("contextmenu", function FileStorageTree_For_8_Template_a_contextmenu_2_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.rememberContextTrigger($event)); })("keydown", function FileStorageTree_For_8_Template_a_keydown_2_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.rememberContextTriggerKey($event)); })("dragover", function FileStorageTree_For_8_Template_a_dragover_2_listener($event) { const group_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.dragOver($event, null, group_r4.id)); })("dragleave", function FileStorageTree_For_8_Template_a_dragleave_2_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.dropTarget.set(undefined)); })("drop", function FileStorageTree_For_8_Template_a_drop_2_listener($event) { const group_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.dropFolder($event, null, group_r4.id)); });
    i0.ɵɵelement(3, "ng-icon", 11);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 12);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(9, FileStorageTree_For_8_ng_template_9_Template, 4, 4, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, FileStorageTree_For_8_Conditional_11_Template, 5, 5, "ul", 13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r4 = ctx.$implicit;
    const ɵ$index_15_r13 = ctx.$index;
    const fileStorageGroupMenu_r14 = i0.ɵɵreference(10);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("--%NS%sidebar-item-index", ɵ$index_15_r13);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("file-storage-drop-target", group_r4.id === "file-storage" && ctx_r1.dropTarget() === null);
    i0.ɵɵproperty("hlmContextMenuTrigger", group_r4.id === "file-storage" ? fileStorageGroupMenu_r14 : null)("disabled", ctx_r1.busy())("queryParams", i0.ɵɵpureFunction1(15, _c0, group_r4.id))("isActive", ctx_r1.selectedGroup() === group_r4.id && !ctx_r1.selectedFolder());
    i0.ɵɵattribute("aria-current", ctx_r1.selectedGroup() === group_r4.id && !ctx_r1.selectedFolder() ? "page" : null);
    i0.ɵɵadvance();
    i0.ɵɵproperty("name", group_r4.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 13, group_r4.label));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.count(group_r4.id));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.folders(group_r4.id).length ? 11 : -1);
} }
export const fileStorageFileIcons = provideIcons({
    lucideEllipsis,
    lucideFolder,
    lucideChevronRight,
    lucideChevronDown,
    lucideStar,
    lucideFlag,
    lucideUsers,
    lucideClock,
    lucideTrash2,
});
export const fileGroups = [
    { id: 'file-storage', label: 'files', icon: 'lucideFolder' },
    { id: 'important', label: 'important', icon: 'lucideFlag' },
    { id: 'shared', label: 'sharedWithMe', icon: 'lucideUsers' },
    { id: 'recent', label: 'recentFiles', icon: 'lucideClock' },
    { id: 'starred', label: 'starred', icon: 'lucideStar' },
    { id: 'trash', label: 'trash', icon: 'lucideTrash2' },
];
export class FileStorageFileIcon {
    file = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "file" }] : /* istanbul ignore next */ []));
    icon = computed(() => fileIconName(this.file()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "icon" }] : /* istanbul ignore next */ []));
    static ɵfac = function FileStorageFileIcon_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStorageFileIcon)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FileStorageFileIcon, selectors: [["app-my-file-icon"]], hostAttrs: [1, "my-file-icon"], hostVars: 1, hostBindings: function FileStorageFileIcon_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-category", ctx.file().isFolder ? "folders" : ctx.file().category || "other");
        } }, inputs: { file: [1, "file"] }, features: [i0.ɵɵProvidersFeature([
                provideIcons({
                    phosphorFileArchiveDuotone,
                    phosphorFileAudioDuotone,
                    phosphorFileCDuotone,
                    phosphorFileCSharpDuotone,
                    phosphorFileCppDuotone,
                    phosphorFileCssDuotone,
                    phosphorFileCsvDuotone,
                    phosphorFileDocDuotone,
                    phosphorFileDuotone,
                    phosphorFileHtmlDuotone,
                    phosphorFileImageDuotone,
                    phosphorFileIniDuotone,
                    phosphorFileJpgDuotone,
                    phosphorFileJsDuotone,
                    phosphorFileJsxDuotone,
                    phosphorFileMdDuotone,
                    phosphorFilePdfDuotone,
                    phosphorFilePngDuotone,
                    phosphorFilePptDuotone,
                    phosphorFilePyDuotone,
                    phosphorFileRsDuotone,
                    phosphorFileSqlDuotone,
                    phosphorFileSvgDuotone,
                    phosphorFileTextDuotone,
                    phosphorFileTsDuotone,
                    phosphorFileTsxDuotone,
                    phosphorFileTxtDuotone,
                    phosphorFileVideoDuotone,
                    phosphorFileVueDuotone,
                    phosphorFileXlsDuotone,
                    phosphorFileZipDuotone,
                    phosphorFolderDuotone,
                }),
            ])], decls: 1, vars: 1, consts: [["size", "100%", "aria-hidden", "true", 3, "name"]], template: function FileStorageFileIcon_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
        } if (rf & 2) {
            i0.ɵɵproperty("name", ctx.icon());
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStorageFileIcon, [{
        type: Component,
        args: [{
                selector: 'app-my-file-icon',
                imports: [NgIcon],
                providers: [
                    provideIcons({
                        phosphorFileArchiveDuotone,
                        phosphorFileAudioDuotone,
                        phosphorFileCDuotone,
                        phosphorFileCSharpDuotone,
                        phosphorFileCppDuotone,
                        phosphorFileCssDuotone,
                        phosphorFileCsvDuotone,
                        phosphorFileDocDuotone,
                        phosphorFileDuotone,
                        phosphorFileHtmlDuotone,
                        phosphorFileImageDuotone,
                        phosphorFileIniDuotone,
                        phosphorFileJpgDuotone,
                        phosphorFileJsDuotone,
                        phosphorFileJsxDuotone,
                        phosphorFileMdDuotone,
                        phosphorFilePdfDuotone,
                        phosphorFilePngDuotone,
                        phosphorFilePptDuotone,
                        phosphorFilePyDuotone,
                        phosphorFileRsDuotone,
                        phosphorFileSqlDuotone,
                        phosphorFileSvgDuotone,
                        phosphorFileTextDuotone,
                        phosphorFileTsDuotone,
                        phosphorFileTsxDuotone,
                        phosphorFileTxtDuotone,
                        phosphorFileVideoDuotone,
                        phosphorFileVueDuotone,
                        phosphorFileXlsDuotone,
                        phosphorFileZipDuotone,
                        phosphorFolderDuotone,
                    }),
                ],
                host: {
                    class: 'my-file-icon',
                    '[attr.data-category]': 'file().isFolder ? "folders" : file().category || "other"',
                },
                template: '<ng-icon [name]="icon()" size="100%" aria-hidden="true" />',
            }]
    }], null, { file: [{ type: i0.Input, args: [{ isSignal: true, alias: "file", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FileStorageFileIcon, { className: "FileStorageFileIcon", filePath: "src/app/features/file-storage-components.ts", lineNumber: 140 }); })();
export class FileStorageFileActions {
    actions = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actions" }] : /* istanbul ignore next */ []));
    name = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    static ɵfac = function FileStorageFileActions_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStorageFileActions)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FileStorageFileActions, selectors: [["app-my-file-actions"]], inputs: { actions: [1, "actions"], name: [1, "name"] }, features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 3, vars: 0, consts: [[1, "flex", "justify-end", "gap-1"], ["hlmBtn", "", "variant", "ghost", "size", "icon-sm", 3, "disabled"], ["hlmBtn", "", "variant", "ghost", "size", "icon-sm", 3, "click", "disabled"], ["aria-hidden", "true", 3, "name"]], template: function FileStorageFileActions_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵrepeaterCreate(1, FileStorageFileActions_For_2_Template, 4, 10, "button", 1, _forTrack0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.actions());
        } }, dependencies: [i1.FormsModule, i2.NgIcon, i3.HlmButton, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStorageFileActions, [{
        type: Component,
        args: [{
                selector: 'app-my-file-actions',
                imports: [WorkspaceUi],
                providers: [workspaceIcons],
                template: `<div class="flex justify-end gap-1">
    @for (action of actions(); track action.label) {
      <button
        hlmBtn
        variant="ghost"
        size="icon-sm"
        [disabled]="action.disabled"
        [attr.aria-label]="(action.label | t) + ': ' + name()"
        [attr.title]="action.label | t"
        (click)="$event.stopPropagation(); action.run()"
      >
        <ng-icon
          [name]="action.label === 'download' ? 'lucideArrowDownToLine' : 'lucideTrash2'"
          [class.text-destructive]="action.label === 'delete'"
          aria-hidden="true"
        />
      </button>
    }
  </div>`,
            }]
    }], null, { actions: [{ type: i0.Input, args: [{ isSignal: true, alias: "actions", required: true }] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FileStorageFileActions, { className: "FileStorageFileActions", filePath: "src/app/features/file-storage-components.ts", lineNumber: 168 }); })();
export class FileStorageFileName {
    file = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "file" }] : /* istanbul ignore next */ []));
    open = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "open" }] : /* istanbul ignore next */ []));
    interactive = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "interactive" }] : /* istanbul ignore next */ []));
    back = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "back" }] : /* istanbul ignore next */ []));
    static ɵfac = function FileStorageFileName_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStorageFileName)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FileStorageFileName, selectors: [["app-my-file-name"]], inputs: { file: [1, "file"], open: [1, "open"], interactive: [1, "interactive"], back: [1, "back"] }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideArrowLeft })])], decls: 10, vars: 5, consts: [[1, "flex", "items-center", "gap-3", "min-w-0"], ["name", "lucideArrowLeft", "aria-hidden", "true", 1, "my-file-icon"], [3, "file"], [1, "min-w-0"], ["hlmBtn", "", "variant", "link", 1, "max-w-full"], [1, "block", "truncate", "font-medium"], [1, "workspace-meta", "truncate"], ["hlmBadge", "", "variant", "outline"], ["hlmBtn", "", "variant", "link", 1, "max-w-full", 3, "click"], [1, "truncate"]], template: function FileStorageFileName_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, FileStorageFileName_Conditional_1_Template, 1, 0, "ng-icon", 1)(2, FileStorageFileName_Conditional_2_Template, 1, 1, "app-my-file-icon", 2);
            i0.ɵɵelementStart(3, "div", 3);
            i0.ɵɵconditionalCreate(4, FileStorageFileName_Conditional_4_Template, 3, 1, "button", 4)(5, FileStorageFileName_Conditional_5_Template, 2, 1, "span", 5);
            i0.ɵɵelementStart(6, "p", 6);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, FileStorageFileName_Conditional_8_Template, 3, 3, "span", 7);
            i0.ɵɵconditionalCreate(9, FileStorageFileName_Conditional_9_Template, 3, 3, "span", 7);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.back() ? 1 : 2);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.interactive() ? 4 : 5);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.file().description || ctx.file().tags);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.file().important ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.file().starred ? 9 : -1);
        } }, dependencies: [i1.FormsModule, i2.NgIcon, i3.HlmButton, i5.HlmBadge, FileStorageFileIcon, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStorageFileName, [{
        type: Component,
        args: [{
                selector: 'app-my-file-name',
                imports: [WorkspaceUi, FileStorageFileIcon],
                providers: [provideIcons({ lucideArrowLeft })],
                template: `<div class="flex items-center gap-3 min-w-0">
    @if (back()) {
      <ng-icon name="lucideArrowLeft" class="my-file-icon" aria-hidden="true" />
    } @else {
      <app-my-file-icon [file]="file()" />
    }
    <div class="min-w-0">
      @if (interactive()) {
        <button hlmBtn variant="link" (click)="open()?.()" class="max-w-full">
          <span class="truncate">{{ file().name }}</span>
        </button>
      } @else {
        <span class="block truncate font-medium">{{ file().name }}</span>
      }
      <p class="workspace-meta truncate">{{ file().description || file().tags }}</p>
      @if (file().important) {
        <span hlmBadge variant="outline">{{ 'important' | t }}</span>
      }
      @if (file().starred) {
        <span hlmBadge variant="outline">{{ 'starred' | t }}</span>
      }
    </div>
  </div>`,
            }]
    }], null, { file: [{ type: i0.Input, args: [{ isSignal: true, alias: "file", required: true }] }], open: [{ type: i0.Input, args: [{ isSignal: true, alias: "open", required: false }] }], interactive: [{ type: i0.Input, args: [{ isSignal: true, alias: "interactive", required: false }] }], back: [{ type: i0.Input, args: [{ isSignal: true, alias: "back", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FileStorageFileName, { className: "FileStorageFileName", filePath: "src/app/features/file-storage-components.ts", lineNumber: 201 }); })();
export class FileStorageActionDialog {
    mode = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mode" }] : /* istanbul ignore next */ []));
    description = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "description" }] : /* istanbul ignore next */ []));
    destinations = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "destinations" }] : /* istanbul ignore next */ []));
    busy = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    fieldId = input('file-storage-action', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fieldId" }] : /* istanbul ignore next */ []));
    cancelled = output();
    createFolder = output();
    move = output();
    folderName = '';
    moveTarget = 'root';
    destinationLabel = (value) => this.destinations().find((destination) => destination.value === value)?.label ?? value;
    constructor() {
        let wasOpen = false;
        effect(() => {
            const open = !!this.mode();
            if (open && !wasOpen) {
                this.folderName = '';
                this.moveTarget = 'root';
            }
            wasOpen = open;
        });
    }
    stateChanged(state) {
        if (state === 'closed' && this.mode() && !this.busy())
            this.cancelled.emit();
    }
    submitCreate() {
        const name = this.folderName.trim();
        if (name && !this.busy())
            this.createFolder.emit(name);
    }
    selectedDestinationValid() {
        const selected = this.destinations().find((destination) => destination.value === this.moveTarget);
        return !!selected && !selected.disabled;
    }
    static ɵfac = function FileStorageActionDialog_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStorageActionDialog)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FileStorageActionDialog, selectors: [["app-file-storage-action-dialog"]], inputs: { mode: [1, "mode"], description: [1, "description"], destinations: [1, "destinations"], busy: [1, "busy"], fieldId: [1, "fieldId"] }, outputs: { cancelled: "cancelled", createFolder: "createFolder", move: "move" }, decls: 2, vars: 1, consts: [[3, "stateChanged", "state"], [4, "hlmAlertDialogPortal"], ["hlmAlertDialogTitle", ""], ["hlmAlertDialogDescription", ""], [1, "grid", "gap-4"], [1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", "name", "folderName", "required", "", "maxlength", "180", 3, "ngModelChange", "id", "ngModel", "disabled"], ["hlmAlertDialogCancel", "", "type", "button", 3, "disabled"], ["hlmAlertDialogAction", "", "type", "submit", 3, "disabled"], [3, "valueChange", "value", "itemToString"], [3, "id"], [4, "hlmSelectPortal"], ["hlmAlertDialogCancel", "", 3, "disabled"], ["hlmAlertDialogAction", "", 3, "click", "disabled"], [3, "value", "disabled"]], template: function FileStorageActionDialog_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "hlm-alert-dialog", 0);
            i0.ɵɵlistener("stateChanged", function FileStorageActionDialog_Template_hlm_alert_dialog_stateChanged_0_listener($event) { return ctx.stateChanged($event); });
            i0.ɵɵtemplate(1, FileStorageActionDialog_hlm_alert_dialog_content_1_Template, 9, 5, "hlm-alert-dialog-content", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("state", ctx.mode() ? "open" : "closed");
        } }, dependencies: [i1.FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MaxLengthValidator, i1.NgModel, i1.NgForm, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.HlmAlertDialog, i8.HlmAlertDialogAction, i8.HlmAlertDialogCancel, i8.HlmAlertDialogContent, i8.HlmAlertDialogDescription, i8.HlmAlertDialogFooter, i8.HlmAlertDialogHeader, i8.HlmAlertDialogPortal, i8.HlmAlertDialogTitle, i9.HlmSelect, i9.HlmSelectContent, i9.HlmSelectItem, i9.HlmSelectPortal, i9.HlmSelectTrigger, i9.HlmSelectValue, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStorageActionDialog, [{
        type: Component,
        args: [{
                selector: 'app-file-storage-action-dialog',
                imports: [WorkspaceUi, HlmAlertDialogImports, HlmSelectImports],
                template: `<hlm-alert-dialog
    [state]="mode() ? 'open' : 'closed'"
    (stateChanged)="stateChanged($event)"
  >
    <hlm-alert-dialog-content *hlmAlertDialogPortal>
      <hlm-alert-dialog-header
        ><h2 hlmAlertDialogTitle>{{ (mode() === 'create' ? 'createFolder' : 'moveFile') | t }}</h2>
        <p hlmAlertDialogDescription>{{ description() }}</p></hlm-alert-dialog-header
      >
      @if (mode() === 'create') {
        <form class="grid gap-4" (ngSubmit)="submitCreate()">
          <div hlmField>
            <label hlmFieldLabel [for]="fieldId() + '-name'">{{ 'entryName' | t }}</label
            ><input
              hlmInput
              [id]="fieldId() + '-name'"
              name="folderName"
              [(ngModel)]="folderName"
              required
              maxlength="180"
              [disabled]="busy()"
            />
          </div>
          <hlm-alert-dialog-footer>
            <button hlmAlertDialogCancel type="button" [disabled]="busy()">
              {{ 'cancel' | t }}
            </button>
            <button hlmAlertDialogAction type="submit" [disabled]="busy() || !folderName.trim()">
              {{ 'createFolder' | t }}
            </button>
          </hlm-alert-dialog-footer>
        </form>
      } @else if (mode() === 'move') {
        <div hlmField>
          <label hlmFieldLabel [for]="fieldId() + '-destination'">{{
            'destinationFolder' | t
          }}</label>
          <hlm-select [(value)]="moveTarget" [itemToString]="destinationLabel">
            <hlm-select-trigger [id]="fieldId() + '-destination'"
              ><hlm-select-value
            /></hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              @for (destination of destinations(); track destination.value) {
                <hlm-select-item [value]="destination.value" [disabled]="destination.disabled">{{
                  destination.label
                }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </div>
        <hlm-alert-dialog-footer>
          <button hlmAlertDialogCancel [disabled]="busy()">{{ 'cancel' | t }}</button>
          <button
            hlmAlertDialogAction
            [disabled]="busy() || !selectedDestinationValid()"
            (click)="move.emit(moveTarget)"
          >
            {{ 'moveFile' | t }}
          </button>
        </hlm-alert-dialog-footer>
      }
    </hlm-alert-dialog-content>
  </hlm-alert-dialog>`,
            }]
    }], () => [], { mode: [{ type: i0.Input, args: [{ isSignal: true, alias: "mode", required: false }] }], description: [{ type: i0.Input, args: [{ isSignal: true, alias: "description", required: false }] }], destinations: [{ type: i0.Input, args: [{ isSignal: true, alias: "destinations", required: false }] }], busy: [{ type: i0.Input, args: [{ isSignal: true, alias: "busy", required: false }] }], fieldId: [{ type: i0.Input, args: [{ isSignal: true, alias: "fieldId", required: false }] }], cancelled: [{ type: i0.Output, args: ["cancelled"] }], createFolder: [{ type: i0.Output, args: ["createFolder"] }], move: [{ type: i0.Output, args: ["move"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FileStorageActionDialog, { className: "FileStorageActionDialog", filePath: "src/app/features/file-storage-components.ts", lineNumber: 280 }); })();
export class FileStorageNavigation {
    revision = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "revision" }] : /* istanbul ignore next */ []));
    refresh() {
        this.revision.update((x) => x + 1);
    }
    static ɵfac = function FileStorageNavigation_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStorageNavigation)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: FileStorageNavigation, factory: FileStorageNavigation.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStorageNavigation, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
export class FileStorageTree {
    sidebar = inject(HlmSidebarService);
    i18n = inject(I18n);
    notifications = inject(Notifications);
    navigation = inject(FileStorageNavigation);
    api = inject(WorkspaceApi);
    router = inject(Router);
    confirm = inject(Confirmations);
    groups = fileGroups;
    data = new Resource();
    visibleGroups = computed(() => filterVisibleFileGroups(this.groups), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleGroups" }] : /* istanbul ignore next */ []));
    selectedGroup = signal('file-storage', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedGroup" }] : /* istanbul ignore next */ []));
    selectedFolder = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedFolder" }] : /* istanbul ignore next */ []));
    collapsed = signal(new Set(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "collapsed" }] : /* istanbul ignore next */ []));
    target = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "target" }] : /* istanbul ignore next */ []));
    creating = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "creating" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    moving = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "moving" }] : /* istanbul ignore next */ []));
    dragged = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dragged" }] : /* istanbul ignore next */ []));
    dropTarget = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dropTarget" }] : /* istanbul ignore next */ []));
    startDrag(event, file, group) {
        if (this.busy() || group === 'trash' || file.permission !== 'owner') {
            event.preventDefault();
            return;
        }
        this.dragged.set(file);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('application/x-file-storage-folder', file.id);
        }
    }
    endDrag() {
        this.dragged.set(null);
        this.dropTarget.set(undefined);
    }
    dragOver(event, parent, group) {
        const source = this.dragged();
        if (this.busy() ||
            group === 'trash' ||
            (!parent && group !== 'file-storage') ||
            !source ||
            !canMoveFolder(source, parent, this.folders('file-storage')))
            return;
        event.preventDefault();
        if (event.dataTransfer)
            event.dataTransfer.dropEffect = 'move';
        this.dropTarget.set(parent);
    }
    async dropFolder(event, parent, group) {
        event.preventDefault();
        event.stopPropagation();
        const source = this.dragged();
        this.endDrag();
        if (group === 'trash' || (!parent && group !== 'file-storage') || !source)
            return;
        await this.moveFolder(source, parent);
    }
    contextMoveDestinations() {
        const source = this.target();
        const folders = this.folders('file-storage');
        if (!source)
            return [];
        return [
            {
                value: 'root',
                label: this.i18n.text('files'),
                disabled: !canMoveFolder(source, null, folders),
            },
            ...folders
                .filter((folder) => canMoveFolder(source, folder.id, folders))
                .sort((a, b) => this.folderLocation(a).localeCompare(this.folderLocation(b)))
                .map((folder) => ({ value: folder.id, label: this.folderLocation(folder) })),
        ];
    }
    folderLocation(folder) {
        let path = folder.name;
        let parent = folder.parentId;
        const seen = new Set([folder.id]);
        while (parent && !seen.has(parent)) {
            seen.add(parent);
            const entry = this.folders('file-storage').find((item) => item.id === parent);
            if (!entry)
                break;
            path = entry.name + ' / ' + path;
            parent = entry.parentId;
        }
        return path;
    }
    async moveFromContext(destination) {
        const source = this.target();
        if (source)
            await this.moveFolder(source, destination === 'root' ? null : destination);
    }
    async moveFolder(source, parentId) {
        if (this.busy() || !canMoveFolder(source, parentId, this.folders('file-storage')))
            return;
        this.busy.set(true);
        try {
            await this.api.post(`file-storage/${source.id}/move`, { parentId });
            this.collapsed.update((previous) => {
                const next = new Set(previous);
                if (parentId)
                    for (const group of this.groups)
                        next.delete(group.id + parentId);
                return next;
            });
            this.closeContext();
            this.notifications.success('folderMoved');
            this.navigation.refresh();
        }
        catch {
            // Keep the hierarchy unchanged; the server revalidates the move.
        }
        finally {
            this.busy.set(false);
        }
    }
    contextTrigger = null;
    closeMobile() {
        this.sidebar.setOpenMobile(false);
    }
    folders(group) {
        const folders = this.data.value()?.[group]?.folders ?? [];
        return filterVisibleFileFolders(group, folders);
    }
    count(group) {
        const page = this.data.value()?.[group];
        return page ? this.i18n.number(page.fileCount ?? 0) : '�';
    }
    visibleFolders(group) {
        const files = this.folders(group);
        const ids = new Set(files.map((f) => f.id));
        const result = [];
        const visited = new Set();
        const visit = (parent, depth) => {
            for (const file of files
                .filter((f) => (ids.has(f.parentId ?? '') ? f.parentId : null) === parent)
                .sort((a, b) => a.name.localeCompare(b.name))) {
                if (visited.has(file.id))
                    continue;
                visited.add(file.id);
                result.push({ file, depth, children: files.some((f) => f.parentId === file.id) });
                if (!this.collapsed().has(group + file.id))
                    visit(file.id, depth + 1);
            }
        };
        visit(null, 0);
        return result;
    }
    constructor() {
        effect(() => {
            this.navigation.revision();
            untracked(() => void this.load());
        });
        this.router.events.pipe(takeUntilDestroyed()).subscribe((e) => {
            if (e instanceof NavigationEnd)
                this.syncRoute();
        });
    }
    toggle(id) {
        this.collapsed.update((old) => {
            const next = new Set(old);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }
    syncRoute() {
        const params = this.router.url.startsWith('/file-storage')
            ? this.router.parseUrl(this.router.url).queryParams
            : {};
        this.selectedGroup.set(params['group'] || 'file-storage');
        this.selectedFolder.set(params['folder'] || '');
    }
    async load() {
        this.syncRoute();
        await this.data.load(async (signal) => Object.fromEntries(await Promise.all(this.groups.map(async (group) => [
            group.id,
            await this.api.get('file-storage', { group: group.id, pageSize: 1 }, signal),
        ]))));
    }
    rememberContextTrigger(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        this.contextTrigger = target.closest('a, button');
    }
    rememberContextTriggerKey(event) {
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
            this.rememberContextTrigger(event);
    }
    beginContextAction(file, action) {
        queueMicrotask(() => {
            this.target.set(file);
            this.creating.set(action === 'create');
            this.moving.set(action === 'move');
        });
    }
    beginRootFolderCreation() {
        queueMicrotask(() => {
            this.target.set(null);
            this.creating.set(true);
            this.moving.set(false);
        });
    }
    closeContext() {
        this.target.set(null);
        this.creating.set(false);
        this.moving.set(false);
        this.contextTrigger?.focus();
    }
    async createFolder(name) {
        const parent = this.target();
        if (this.busy() || !name)
            return;
        this.busy.set(true);
        try {
            await this.api.post('file-storage/folders', {
                name,
                parentId: parent?.id ?? null,
            });
            this.notifications.success('folderCreated');
            this.closeContext();
            this.navigation.refresh();
        }
        catch {
            /* Keep the draft for retry. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async deleteFolder(folder) {
        if (this.busy() || !!folder.itemCount)
            return;
        if (!(await this.confirm.ask(this.i18n.text('deleteFolderTitle').replace('{name}', folder.name), 'deleteFolderHelp', '', true, 'delete')))
            return;
        this.busy.set(true);
        try {
            await this.api.post(`file-storage/${folder.id}/delete`);
            if (this.selectedFolder() === folder.id)
                await this.router.navigate(['/file-storage'], {
                    queryParams: { group: this.selectedGroup(), folder: folder.parentId },
                });
            this.notifications.success('fileDeleted');
            this.navigation.refresh();
        }
        catch {
            /* Server validates emptiness again. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function FileStorageTree_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FileStorageTree)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FileStorageTree, selectors: [["app-file-storage-tree"]], features: [i0.ɵɵProvidersFeature([fileStorageFileIcons])], decls: 10, vars: 11, consts: [["fileStorageGroupMenu", ""], ["folderMenu", ""], ["hlmSidebarGroup", "", 1, "sidebar-submenu"], ["hlmSidebarGroupLabel", ""], ["hlmBtn", "", "variant", "ghost"], ["hlmSidebarMenu", ""], ["hlmSidebarMenuItem", ""], ["fieldId", "submenu-folder-action", 3, "cancelled", "createFolder", "move", "mode", "description", "destinations", "busy"], ["hlmBtn", "", "variant", "ghost", 3, "click"], [1, "flex", "items-center", "min-w-0"], ["hlmSidebarMenuButton", "", "routerLink", "/file-storage", 3, "click", "contextmenu", "keydown", "dragover", "dragleave", "drop", "hlmContextMenuTrigger", "disabled", "queryParams", "isActive"], [3, "name"], [1, "file-storage-nav-count"], [1, "file-storage-tree"], ["hlmDropdownMenuItem", "", 3, "triggered", "disabled"], [1, "flex", "items-center", "min-w-0", 3, "--%NS%sidebar-item-index", "padding-inline-start", "hlmContextMenuTrigger", "disabled"], [1, "flex", "items-center", "min-w-0", 3, "contextmenu", "keydown", "hlmContextMenuTrigger", "disabled"], ["hlmBtn", "", "variant", "ghost", "size", "icon-sm"], ["aria-hidden", "true", 1, "size-8", "shrink-0"], ["hlmSidebarMenuButton", "", "routerLink", "/file-storage", 3, "click", "dragstart", "dragend", "dragover", "dragleave", "drop", "queryParams", "isActive", "draggable"], [3, "file"], [1, "truncate"], ["hlmBtn", "", "variant", "ghost", "size", "icon-sm", 3, "disabled", "hlmDropdownMenuTrigger"], ["hlmBtn", "", "variant", "ghost", "size", "icon-sm", 3, "click"], ["hlmBtn", "", "variant", "ghost", "size", "icon-sm", 3, "click", "disabled", "hlmDropdownMenuTrigger"], ["name", "lucideEllipsis", "aria-hidden", "true"], ["hlmDropdownMenuItem", "", "variant", "destructive", 3, "triggered", "disabled"]], template: function FileStorageTree_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "nav", 2);
            i0.ɵɵpipe(1, "t");
            i0.ɵɵelementStart(2, "div", 3);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, FileStorageTree_Conditional_5_Template, 3, 3, "button", 4);
            i0.ɵɵelementStart(6, "ul", 5);
            i0.ɵɵrepeaterCreate(7, FileStorageTree_For_8_Template, 12, 17, "li", 6, _forTrack2);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "app-file-storage-action-dialog", 7);
            i0.ɵɵlistener("cancelled", function FileStorageTree_Template_app_my_files_action_dialog_cancelled_9_listener() { return ctx.closeContext(); })("createFolder", function FileStorageTree_Template_app_my_files_action_dialog_createFolder_9_listener($event) { return ctx.createFolder($event); })("move", function FileStorageTree_Template_app_my_files_action_dialog_move_9_listener($event) { return ctx.moveFromContext($event); });
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 7, "files"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 9, "files"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.data.state() === "error" || ctx.data.refreshError() ? 5 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.visibleGroups());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("mode", ctx.creating() ? "create" : ctx.moving() ? "move" : "")("description", ctx.target()?.name ?? "")("destinations", ctx.contextMoveDestinations())("busy", ctx.busy());
        } }, dependencies: [i1.FormsModule, i10.RouterLink, i2.NgIcon, i3.HlmButton, i11.HlmSidebarGroup, i11.HlmSidebarGroupLabel, i11.HlmSidebarMenu, i11.HlmSidebarMenuButton, i11.HlmSidebarMenuItem, FileStorageFileIcon, FileStorageActionDialog, i12.HlmContextMenuTrigger, i13.HlmDropdownMenu, i13.HlmDropdownMenuItem, i13.HlmDropdownMenuSeparator, i13.HlmDropdownMenuTrigger, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FileStorageTree, [{
        type: Component,
        args: [{
                selector: 'app-file-storage-tree',
                imports: [
                    WorkspaceUi,
                    HlmSidebarImports,
                    FileStorageFileIcon,
                    FileStorageActionDialog,
                    HlmContextMenuImports,
                    HlmDropdownMenuImports,
                ],
                providers: [fileStorageFileIcons],
                template: `<nav hlmSidebarGroup class="sidebar-submenu" [attr.aria-label]="'files' | t">
      <div hlmSidebarGroupLabel>{{ 'files' | t }}</div>
      @if (data.state() === 'error' || data.refreshError()) {
        <button hlmBtn variant="ghost" (click)="load()">{{ 'retry' | t }}</button>
      }
      <ul hlmSidebarMenu>
        @for (group of visibleGroups(); track group.id; let groupIndex = $index) {
          <li hlmSidebarMenuItem>
            <div
              class="flex items-center min-w-0"
              animate.enter="sidebar-item-enter"
              [style.--sidebar-item-index]="groupIndex"
            >
              <a
                hlmSidebarMenuButton
                [hlmContextMenuTrigger]="group.id === 'file-storage' ? fileStorageGroupMenu : null"
                [disabled]="busy()"
                routerLink="/file-storage"
                (click)="closeMobile()"
                (contextmenu)="rememberContextTrigger($event)"
                (keydown)="rememberContextTriggerKey($event)"
                (dragover)="dragOver($event, null, group.id)"
                (dragleave)="dropTarget.set(undefined)"
                (drop)="dropFolder($event, null, group.id)"
                [class.file-storage-drop-target]="group.id === 'file-storage' && dropTarget() === null"
                [queryParams]="{ group: group.id }"
                [isActive]="selectedGroup() === group.id && !selectedFolder()"
                [attr.aria-current]="
                  selectedGroup() === group.id && !selectedFolder() ? 'page' : null
                "
                ><ng-icon [name]="group.icon" /><span>{{ group.label | t }}</span
                ><span class="file-storage-nav-count">{{ count(group.id) }}</span></a
              >
              <ng-template #fileStorageGroupMenu>
                <hlm-dropdown-menu>
                  <button
                    hlmDropdownMenuItem
                    [disabled]="busy()"
                    (triggered)="beginRootFolderCreation()"
                  >
                    {{ 'createFolder' | t }}
                  </button>
                </hlm-dropdown-menu>
              </ng-template>
            </div>
            @if (folders(group.id).length) {
              <ul
                class="file-storage-tree"
                [attr.aria-label]="(group.label | t) + ': ' + ('folderNavigation' | t)"
              >
                @for (
                  node of visibleFolders(group.id);
                  track node.file.id;
                  let folderIndex = $index
                ) {
                  <li
                    class="flex items-center min-w-0"
                    animate.enter="sidebar-item-enter"
                    [style.--sidebar-item-index]="folderIndex"
                    [style.padding-inline-start.rem]="node.depth * 1.25"
                    [hlmContextMenuTrigger]="folderMenu"
                    [disabled]="busy() || node.file.permission !== 'owner' || group.id === 'trash'"
                    (contextmenu)="rememberContextTrigger($event)"
                    (keydown)="rememberContextTriggerKey($event)"
                  >
                    @if (node.children) {
                      <button
                        hlmBtn
                        variant="ghost"
                        size="icon-sm"
                        [attr.aria-label]="('expandFolder' | t) + ': ' + node.file.name"
                        [attr.aria-expanded]="!collapsed().has(group.id + node.file.id)"
                        (click)="toggle(group.id + node.file.id)"
                      >
                        <ng-icon
                          [name]="
                            collapsed().has(group.id + node.file.id)
                              ? 'lucideChevronRight'
                              : 'lucideChevronDown'
                          "
                        />
                      </button>
                    } @else {
                      <span class="size-8 shrink-0" aria-hidden="true"></span>
                    }
                    <a
                      hlmSidebarMenuButton
                      routerLink="/file-storage"
                      (click)="closeMobile()"
                      [queryParams]="{ group: group.id, folder: node.file.id }"
                      [isActive]="selectedGroup() === group.id && selectedFolder() === node.file.id"
                      [attr.aria-current]="
                        selectedGroup() === group.id && selectedFolder() === node.file.id
                          ? 'page'
                          : null
                      "
                      [draggable]="
                        group.id !== 'trash' && node.file.permission === 'owner' && !busy()
                      "
                      (dragstart)="startDrag($event, node.file, group.id)"
                      (dragend)="endDrag()"
                      (dragover)="dragOver($event, node.file.id, group.id)"
                      (dragleave)="dropTarget.set(undefined)"
                      (drop)="dropFolder($event, node.file.id, group.id)"
                      [class.file-storage-drop-target]="
                        dropTarget() === node.file.id && group.id !== 'trash'
                      "
                      ><app-my-file-icon [file]="node.file" /><span class="truncate">{{
                        node.file.name
                      }}</span
                      ><span class="file-storage-nav-count">{{
                        i18n.number(node.file.fileCount ?? 0)
                      }}</span></a
                    >
                    @if (node.file.permission === 'owner' && group.id !== 'trash') {
                      <button
                        hlmBtn
                        variant="ghost"
                        size="icon-sm"
                        [disabled]="busy()"
                        [hlmDropdownMenuTrigger]="folderMenu"
                        [attr.aria-label]="('folderActions' | t) + ': ' + node.file.name"
                        (click)="rememberContextTrigger($event)"
                      >
                        <ng-icon name="lucideEllipsis" aria-hidden="true" />
                      </button>
                    }
                    <ng-template #folderMenu>
                      <hlm-dropdown-menu>
                        <button
                          hlmDropdownMenuItem
                          [disabled]="busy()"
                          (triggered)="beginContextAction(node.file, 'move')"
                        >
                          {{ 'moveFile' | t }}
                        </button>
                        <button
                          hlmDropdownMenuItem
                          [disabled]="busy()"
                          (triggered)="beginContextAction(node.file, 'create')"
                        >
                          {{ 'createFolder' | t }}
                        </button>
                        <hlm-dropdown-menu-separator />
                        <button
                          hlmDropdownMenuItem
                          variant="destructive"
                          [disabled]="busy() || !!node.file.itemCount"
                          [attr.title]="node.file.itemCount ? ('emptyFolderRequired' | t) : null"
                          (triggered)="deleteFolder(node.file)"
                        >
                          {{ 'delete' | t }}
                        </button>
                      </hlm-dropdown-menu>
                    </ng-template>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    </nav>
    <app-file-storage-action-dialog
      fieldId="submenu-folder-action"
      [mode]="creating() ? 'create' : moving() ? 'move' : ''"
      [description]="target()?.name ?? ''"
      [destinations]="contextMoveDestinations()"
      [busy]="busy()"
      (cancelled)="closeContext()"
      (createFolder)="createFolder($event)"
      (move)="moveFromContext($event)"
    />`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FileStorageTree, { className: "FileStorageTree", filePath: "src/app/features/file-storage-components.ts", lineNumber: 510 }); })();
