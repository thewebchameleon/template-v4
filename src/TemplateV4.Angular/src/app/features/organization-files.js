import { Component, computed, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../shared/confirmation';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceApi } from '../core/workspace-api';
import { Runtime } from '../core/runtime';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import { Resource, WorkspaceUi, ListQuery, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, Confirmations, } from '../shared/workspace';
import { DataTable } from '../shared/data-table';
import { RowActions } from '../shared/workspace-cells';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "../core/i18n";
const _c0 = a0 => ["/organizations", a0];
const _c1 = () => [];
const column = createColumnHelper();
export class OrganizationFilesPage {
    id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    api = inject(WorkspaceApi);
    auth = inject(Auth);
    http = inject(HttpClient);
    runtime = inject(Runtime);
    i18n = inject(I18n);
    confirm = inject(Confirmations);
    data = new Resource();
    query = new ListQuery();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    file = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "file" }] : /* istanbul ignore next */ []));
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor('name', { header: this.i18n.text('name') }),
            column.accessor('size', {
                header: this.i18n.text('size'),
                cell: (c) => this.bytes(c.getValue()),
            }),
            column.accessor('createdAt', {
                header: this.i18n.text('createdAt'),
                cell: (c) => this.i18n.date(c.getValue()),
            }),
            column.display({
                id: 'actions',
                enableSorting: false,
                cell: ({ row }) => flexRenderComponent(RowActions, {
                    inputs: {
                        actions: [
                            {
                                label: 'download',
                                disabled: this.busy(),
                                run: () => void this.api.download(`customers/${this.id}/files/${row.original.id}`, row.original.name),
                            },
                            ...(row.original.canDelete
                                ? [
                                    {
                                        label: 'delete',
                                        destructive: true,
                                        disabled: this.busy(),
                                        run: () => void this.remove(row.original),
                                    },
                                ]
                                : []),
                        ],
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    hasUnsavedChanges() {
        return this.busy() || this.file() != null;
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    constructor() {
        this.query.connect(() => void this.load());
    }
    bytes(value) {
        return (new Intl.NumberFormat(this.i18n.culture(), { maximumFractionDigits: 2 }).format(value / 1024 / 1024) + ' MiB');
    }
    pageSize() {
        const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
        return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
    }
    async load() {
        if (await this.data.load((signal) => this.api.get(`customers/${this.id}/files`, {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            sort: this.query.text('sort', 'name'),
            direction: this.query.direction('asc'),
        }, signal)))
            this.query.clamp(this.data.value()?.page.total, this.pageSize());
    }
    sort(s) {
        void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
    }
    fileInput = null;
    choose(e) {
        this.fileInput = e.target;
        this.file.set(this.fileInput.files?.[0] ?? null);
    }
    async upload() {
        const file = this.file();
        if (!file || this.busy())
            return;
        this.busy.set(true);
        try {
            const headers = await this.auth.browserHeaders();
            await firstValueFrom(this.http.post(`${this.runtime.apiUrl}/api/v1/auth/customers/${this.id}/files/upload`, file, {
                params: { name: file.name },
                headers: { ...headers, 'Content-Type': 'application/octet-stream' },
                withCredentials: true,
            }));
            this.file.set(null);
            if (this.fileInput)
                this.fileInput.value = '';
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    async remove(file) {
        if (this.busy() ||
            !(await this.confirm.ask('deleteFileTitle', 'deleteFileHelp', file.name, true)))
            return;
        this.busy.set(true);
        try {
            await this.api.post(`customers/${this.id}/files/${file.id}/delete`);
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function OrganizationFilesPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OrganizationFilesPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: OrganizationFilesPage, selectors: [["app-organization-files"]], hostBindings: function OrganizationFilesPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function OrganizationFilesPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 35, vars: 46, consts: [["title", "organizationFiles", "description", "organizationFilesHelp"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], ["hlmCard", "", 1, "mb-6"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "organization-file"], ["hlmInput", "", "id", "organization-file", "type", "file", 3, "change", "disabled"], ["hlmBtn", "", 3, "disabled"], ["hlmCard", ""], ["hlmCardContent", ""], [3, "retry", "state", "refreshError"], [3, "sortChange", "columns", "data", "loading", "emptyText", "loadingText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "total", "page", "size", "showSizePicker"]], template: function OrganizationFilesPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "a", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "section", 2)(5, "div", 3)(6, "h2", 4);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "p", 5);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "form", 6);
            i0.ɵɵlistener("ngSubmit", function OrganizationFilesPage_Template_form_ngSubmit_12_listener() { return ctx.upload(); });
            i0.ɵɵelementStart(13, "div", 7)(14, "label", 8);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "input", 9);
            i0.ɵɵlistener("change", function OrganizationFilesPage_Template_input_change_17_listener($event) { return ctx.choose($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(18, "button", 10);
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(21, "section", 11)(22, "div", 3)(23, "h2", 4);
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "p", 5);
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(29, "div", 12)(30, "app-page-state", 13);
            i0.ɵɵlistener("retry", function OrganizationFilesPage_Template_app_page_state_retry_30_listener() { return ctx.load(); });
            i0.ɵɵelementStart(31, "app-data-table", 14);
            i0.ɵɵpipe(32, "t");
            i0.ɵɵpipe(33, "t");
            i0.ɵɵlistener("sortChange", function OrganizationFilesPage_Template_app_data_table_sortChange_31_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(34, "app-list-pager", 15);
            i0.ɵɵlistener("pageChange", function OrganizationFilesPage_Template_app_list_pager_pageChange_34_listener($event) { return ctx.query.set({ page: $event }); })("sizeChange", function OrganizationFilesPage_Template_app_list_pager_sizeChange_34_listener($event) { return ctx.query.set({ size: $event, page: 1 }); });
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(43, _c0, ctx.id));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 25, "organizationWorkspace"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 27, "uploadFile"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 29, "organizationUploadHelp"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 31, "chooseFile"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.busy() || !ctx.file());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 33, "uploadFile"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 35, "organizationFiles"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate3(" ", i0.ɵɵpipeBind1(28, 37, "storageUsed"), ": ", ctx.bytes(ctx.data.value()?.usedBytes ?? 0), " / ", ctx.bytes(ctx.data.value()?.quotaBytes ?? 0), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("data", ctx.data.value()?.page?.items ?? i0.ɵɵpureFunction0(45, _c1))("loading", ctx.data.refreshing())("emptyText", i0.ɵɵpipeBind1(32, 39, "noResults"))("loadingText", i0.ɵɵpipeBind1(33, 41, "loading"))("sortColumn", ctx.query.text("sort", "name"))("sortDirection", ctx.query.direction("asc"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("total", ctx.data.value()?.page?.total ?? 0)("page", ctx.query.page)("size", ctx.pageSize())("showSizePicker", true);
        } }, dependencies: [i1.PageHeader, i1.PageState, i1.ListPager, i2.FormsModule, i2.ɵNgNoValidate, i2.NgControlStatusGroup, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, DataTable, i8.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OrganizationFilesPage, [{
        type: Component,
        args: [{
                selector: 'app-organization-files',
                imports: [WorkspaceUi, RouterLink, DataTable],
                template: `<app-page-header title="organizationFiles" description="organizationFilesHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organizations', id]">{{
        'organizationWorkspace' | t
      }}</a></app-page-header
    >
    <section hlmCard class="mb-6">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'uploadFile' | t }}</h2>
        <p hlmCardDescription>{{ 'organizationUploadHelp' | t }}</p>
      </div>
      <form hlmCardContent class="grid gap-4" (ngSubmit)="upload()">
        <div hlmField>
          <label hlmFieldLabel for="organization-file">{{ 'chooseFile' | t }}</label
          ><input
            hlmInput
            id="organization-file"
            type="file"
            [disabled]="busy()"
            (change)="choose($event)"
          />
        </div>
        <button hlmBtn [disabled]="busy() || !file()">{{ 'uploadFile' | t }}</button>
      </form>
    </section>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'organizationFiles' | t }}</h2>
        <p hlmCardDescription>
          {{ 'storageUsed' | t }}: {{ bytes(data.value()?.usedBytes ?? 0) }} /
          {{ bytes(data.value()?.quotaBytes ?? 0) }}
        </p>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.page?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'noResults' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'name')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)" />
          <app-list-pager
            [total]="data.value()?.page?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
        /></app-page-state>
      </div>
    </section>`,
            }]
    }], () => [], { beforeUnload: [{
            type: HostListener,
            args: ['window:beforeunload', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(OrganizationFilesPage, { className: "OrganizationFilesPage", filePath: "src/app/features/organization-files.ts", lineNumber: 81 }); })();
