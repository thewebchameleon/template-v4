import { Component, effect, inject, input, signal } from '@angular/core';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from './workspace';
import { AttachmentPicker } from './attachment-picker';
import * as i0 from "@angular/core";
import * as i1 from "./workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/card";
import * as i5 from "../core/i18n";
const _forTrack0 = ($index, $item) => $item.fileId;
function RecordAttachments_For_8_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 10);
    i0.ɵɵlistener("click", function RecordAttachments_For_8_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const file_r3 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.download(file_r3)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(file_r3.name);
} }
function RecordAttachments_For_8_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "attachmentUnavailable"));
} }
function RecordAttachments_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵconditionalCreate(1, RecordAttachments_For_8_Conditional_1_Template, 2, 1, "button", 8)(2, RecordAttachments_For_8_Conditional_2_Template, 3, 3, "span");
    i0.ɵɵelementStart(3, "button", 9);
    i0.ɵɵlistener("click", function RecordAttachments_For_8_Template_button_click_3_listener() { const file_r3 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.change(file_r3.fileId, false)); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const file_r3 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(file_r3.available ? 1 : 2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 3, "remove"), " ");
} }
export class RecordAttachments {
    organization = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "organization" }] : /* istanbul ignore next */ []));
    record = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "record" }] : /* istanbul ignore next */ []));
    kind = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "kind" }] : /* istanbul ignore next */ []));
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    selected = '';
    api = inject(WorkspaceApi);
    constructor() {
        effect(() => {
            this.organization();
            this.record();
            this.kind();
            void this.load();
        });
    }
    path() {
        return `organizations/${this.organization()}/${this.kind()}/${this.record()}/attachments`;
    }
    async load() {
        await this.data.load((signal) => this.api.get(this.path(), {}, signal));
    }
    async change(fileId, attached) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(this.path(), { fileId, attached });
            this.selected = '';
            await this.load();
        }
        catch {
            /* Interceptor reports failures. */
        }
        finally {
            this.busy.set(false);
        }
    }
    download(file) {
        void this.api.download(`organizations/${this.organization()}/files/${file.fileId}`, file.name ?? 'document');
    }
    static ɵfac = function RecordAttachments_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RecordAttachments)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RecordAttachments, selectors: [["app-record-attachments"]], inputs: { organization: [1, "organization"], record: [1, "record"], kind: [1, "kind"] }, decls: 13, vars: 10, consts: [["hlmCard", "", 1, "mt-6"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardContent", "", 1, "grid", "gap-4"], [3, "retry", "state"], [1, "flex", "flex-wrap", "items-center", "gap-3"], ["controlId", "record-file", 3, "valueChange", "organization", "value"], ["hlmBtn", "", 3, "click", "disabled"], ["hlmBtn", "", "variant", "link"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["hlmBtn", "", "variant", "link", 3, "click"]], template: function RecordAttachments_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "h2", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "div", 3)(6, "app-page-state", 4);
            i0.ɵɵlistener("retry", function RecordAttachments_Template_app_page_state_retry_6_listener() { return ctx.load(); });
            i0.ɵɵrepeaterCreate(7, RecordAttachments_For_8_Template, 6, 5, "div", 5, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "app-attachment-picker", 6);
            i0.ɵɵtwoWayListener("valueChange", function RecordAttachments_Template_app_attachment_picker_valueChange_9_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.selected, $event) || (ctx.selected = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "button", 7);
            i0.ɵɵlistener("click", function RecordAttachments_Template_button_click_10_listener() { return ctx.change(ctx.selected, true); });
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "t");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 6, "attachments"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("state", ctx.data.state());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.data.value());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("organization", ctx.organization());
            i0.ɵɵtwoWayProperty("value", ctx.selected);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.busy() || !ctx.selected);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 8, "attachFile"), " ");
        } }, dependencies: [i1.PageState, i2.FormsModule, i3.HlmButton, i4.HlmCard, i4.HlmCardContent, i4.HlmCardHeader, i4.HlmCardTitle, AttachmentPicker, i5.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RecordAttachments, [{
        type: Component,
        args: [{
                selector: 'app-record-attachments',
                imports: [WorkspaceUi, AttachmentPicker],
                template: ` <section hlmCard class="mt-6">
    <div hlmCardHeader>
      <h2 hlmCardTitle>{{ 'attachments' | t }}</h2>
    </div>
    <div hlmCardContent class="grid gap-4">
      <app-page-state [state]="data.state()" (retry)="load()">
        @for (file of data.value(); track file.fileId) {
          <div class="flex flex-wrap items-center gap-3">
            @if (file.available) {
              <button hlmBtn variant="link" (click)="download(file)">{{ file.name }}</button>
            } @else {
              <span>{{ 'attachmentUnavailable' | t }}</span>
            }
            <button
              hlmBtn
              variant="outline"
              [disabled]="busy()"
              (click)="change(file.fileId, false)"
            >
              {{ 'remove' | t }}
            </button>
          </div>
        }
      </app-page-state>
      <app-attachment-picker
        [organization]="organization()"
        controlId="record-file"
        [(value)]="selected"
      />
      <button hlmBtn [disabled]="busy() || !selected" (click)="change(selected, true)">
        {{ 'attachFile' | t }}
      </button>
    </div>
  </section>`,
            }]
    }], () => [], { organization: [{ type: i0.Input, args: [{ isSignal: true, alias: "organization", required: true }] }], record: [{ type: i0.Input, args: [{ isSignal: true, alias: "record", required: true }] }], kind: [{ type: i0.Input, args: [{ isSignal: true, alias: "kind", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RecordAttachments, { className: "RecordAttachments", filePath: "src/app/shared/record-attachments.ts", lineNumber: 48 }); })();
