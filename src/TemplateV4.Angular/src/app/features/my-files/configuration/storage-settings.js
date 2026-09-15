import { Component, viewChild } from '@angular/core';
import { WorkspaceUi, protectUnload } from '../../../shared/workspace';
import { FileQuotaEditor } from './file-quota-editor';
import * as i0 from "@angular/core";
import * as i1 from "../../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "../../../core/i18n";
export class StorageSettingsPage {
    editor = viewChild(FileQuotaEditor, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editor" }] : /* istanbul ignore next */ []));
    hasUnsavedChanges() {
        return this.editor()?.hasUnsavedChanges() ?? false;
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    static ɵfac = function StorageSettingsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || StorageSettingsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: StorageSettingsPage, selectors: [["app-storage-settings"]], viewQuery: function StorageSettingsPage_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.editor, FileQuotaEditor, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostBindings: function StorageSettingsPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function StorageSettingsPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 15, vars: 9, consts: [["title", "storageSettings", "description", "storageSettingsHelp"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [1, "mt-4"], ["hlmBtn", "", "variant", "outline", "routerLink", "/administration/users"]], template: function StorageSettingsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 0);
            i0.ɵɵelementStart(1, "section", 1)(2, "div", 2)(3, "h2", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "div", 5);
            i0.ɵɵelement(10, "app-file-quota-editor");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "p", 6)(12, "a", 7);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "t");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "storageSettings"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "myFilesStorageHelp"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 7, "userManagement"));
        } }, dependencies: [i1.PageHeader, i2.FormsModule, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardHeader, i5.HlmCardTitle, FileQuotaEditor, i6.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(StorageSettingsPage, [{
        type: Component,
        args: [{
                selector: 'app-storage-settings',
                imports: [WorkspaceUi, FileQuotaEditor],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: `<app-page-header title="storageSettings" description="storageSettingsHelp" />
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'storageSettings' | t }}</h2>
        <p hlmCardDescription>{{ 'myFilesStorageHelp' | t }}</p>
      </div>
      <div hlmCardContent><app-file-quota-editor /></div>
    </section>
    <p class="mt-4">
      <a hlmBtn variant="outline" routerLink="/administration/users">{{ 'userManagement' | t }}</a>
    </p>`,
            }]
    }], null, { editor: [{ type: i0.ViewChild, args: [i0.forwardRef(() => FileQuotaEditor), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(StorageSettingsPage, { className: "StorageSettingsPage", filePath: "src/app/features/storage-settings.ts", lineNumber: 21 }); })();
