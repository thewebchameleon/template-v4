import { Component, effect, inject, input, model, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from './workspace';
import { BusinessSelect } from './business-select';
import * as i0 from "@angular/core";
import * as i1 from "./workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/field";
import * as i4 from "@spartan-ng/helm/input";
import * as i5 from "../core/i18n";
export class AttachmentPicker {
    organization = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "organization" }] : /* istanbul ignore next */ []));
    controlId = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controlId" }] : /* istanbul ignore next */ []));
    value = model('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    page = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "page" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    files = new Resource();
    uploaded = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uploaded" }] : /* istanbul ignore next */ []));
    api = inject(WorkspaceApi);
    http = inject(HttpClient);
    auth = inject(Auth);
    runtime = inject(Runtime);
    constructor() {
        effect(() => {
            this.organization();
            void this.load();
        });
    }
    options() {
        const files = this.files.value()?.items ?? [];
        const uploaded = this.uploaded();
        return [
            ...(uploaded && !files.some((x) => x.id === uploaded.id) ? [uploaded] : []),
            ...files,
        ].map((x) => ({ id: x.id, label: x.name }));
    }
    async load() {
        await this.files.load((signal) => this.api.get(`organizations/${this.organization()}/attachments`, { pageNumber: this.page(), pageSize: 10 }, signal));
    }
    async upload(event) {
        const input = event.target;
        const file = input.files?.[0];
        if (!file || this.busy())
            return;
        this.busy.set(true);
        try {
            const headers = await this.auth.browserHeaders();
            const result = await firstValueFrom(this.http.post(`${this.runtime.apiUrl}/api/v1/auth/organizations/${this.organization()}/attachments/upload`, file, {
                params: { name: file.name },
                headers: { ...headers, 'Content-Type': 'application/octet-stream' },
                withCredentials: true,
            }));
            this.uploaded.set(result);
            this.value.set(result.id);
            await this.load();
        }
        catch {
            /* HTTP interceptor reports failures. */
        }
        finally {
            this.busy.set(false);
            input.value = '';
        }
    }
    static ɵfac = function AttachmentPicker_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AttachmentPicker)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AttachmentPicker, selectors: [["app-attachment-picker"]], inputs: { organization: [1, "organization"], controlId: [1, "controlId"], value: [1, "value"] }, outputs: { value: "valueChange" }, decls: 12, vars: 16, consts: [[1, "grid", "gap-3"], [3, "retry", "state"], ["label", "existingAttachment", 3, "valueChange", "controlId", "options", "value"], [3, "pageChange", "total", "page", "size"], ["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", "type", "file", 3, "change", "id", "disabled"], ["hlmFieldDescription", ""]], template: function AttachmentPicker_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "app-page-state", 1);
            i0.ɵɵlistener("retry", function AttachmentPicker_Template_app_page_state_retry_1_listener() { return ctx.load(); });
            i0.ɵɵelementStart(2, "app-business-select", 2);
            i0.ɵɵtwoWayListener("valueChange", function AttachmentPicker_Template_app_business_select_valueChange_2_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "app-list-pager", 3);
            i0.ɵɵlistener("pageChange", function AttachmentPicker_Template_app_list_pager_pageChange_3_listener($event) { ctx.page.set($event); return ctx.load(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "div", 4)(5, "label", 5);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "input", 6);
            i0.ɵɵlistener("change", function AttachmentPicker_Template_input_change_8_listener($event) { return ctx.upload($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "p", 7);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "t");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.files.state());
            i0.ɵɵadvance();
            i0.ɵɵproperty("controlId", ctx.controlId())("options", ctx.options());
            i0.ɵɵtwoWayProperty("value", ctx.value);
            i0.ɵɵadvance();
            i0.ɵɵproperty("total", ctx.files.value()?.total ?? 0)("page", ctx.page())("size", 10);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("for", ctx.controlId() + "-upload");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 12, "uploadAttachment"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("id", ctx.controlId() + "-upload")("disabled", ctx.busy());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 14, "attachmentUploadHelp"));
        } }, dependencies: [i1.PageState, i1.ListPager, i2.FormsModule, i3.HlmField, i3.HlmFieldDescription, i3.HlmFieldLabel, i4.HlmInput, BusinessSelect, i5.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AttachmentPicker, [{
        type: Component,
        args: [{
                selector: 'app-attachment-picker',
                imports: [WorkspaceUi, BusinessSelect],
                template: ` <div class="grid gap-3">
    <app-page-state [state]="files.state()" (retry)="load()">
      <app-business-select
        [controlId]="controlId()"
        label="existingAttachment"
        [options]="options()"
        [(value)]="value"
      />
      <app-list-pager
        [total]="files.value()?.total ?? 0"
        [page]="page()"
        [size]="10"
        (pageChange)="page.set($event); load()"
      />
    </app-page-state>
    <div hlmField>
      <label hlmFieldLabel [for]="controlId() + '-upload'">{{ 'uploadAttachment' | t }}</label
      ><input
        hlmInput
        type="file"
        [id]="controlId() + '-upload'"
        [disabled]="busy()"
        (change)="upload($event)"
      />
      <p hlmFieldDescription>{{ 'attachmentUploadHelp' | t }}</p>
    </div>
  </div>`,
            }]
    }], () => [], { organization: [{ type: i0.Input, args: [{ isSignal: true, alias: "organization", required: true }] }], controlId: [{ type: i0.Input, args: [{ isSignal: true, alias: "controlId", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AttachmentPicker, { className: "AttachmentPicker", filePath: "src/app/shared/attachment-picker.ts", lineNumber: 45 }); })();
