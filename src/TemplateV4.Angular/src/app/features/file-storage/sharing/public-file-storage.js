import { Component, computed, inject } from '@angular/core';
import { FileStorageDemoBanner } from '../files/file-storage-demo-banner';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, Resource, ListQuery, DebouncedSearch } from '../../../shared/workspace';
import { DataTable } from '../../../shared/data-table';
import { FileStorageFileName } from '../files/file-storage-components';
import { RowActions } from '../../../shared/workspace-cells';
import { I18n } from '../../../core/i18n';
import { Runtime } from '../../../core/runtime';
import * as i0 from "@angular/core";
import * as i1 from "../../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/card";
import * as i5 from "@spartan-ng/helm/field";
import * as i6 from "@spartan-ng/helm/input";
import * as i7 from "../../../core/i18n";
const _c0 = () => [];
function PublicFileStoragePage_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 9);
    i0.ɵɵlistener("click", function PublicFileStoragePage_Conditional_11_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.query.set({ folder: null, page: 1 })); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 10)(4, "label", 11);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "input", 12);
    i0.ɵɵlistener("ngModelChange", function PublicFileStoragePage_Conditional_11_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.search.update($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "app-page-state", 7);
    i0.ɵɵlistener("retry", function PublicFileStoragePage_Conditional_11_Template_app_page_state_retry_8_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵelementStart(9, "app-data-table", 13);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵpipe(11, "t");
    i0.ɵɵlistener("sortChange", function PublicFileStoragePage_Conditional_11_Template_app_data_table_sortChange_9_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.sort($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "app-list-pager", 14);
    i0.ɵɵlistener("pageChange", function PublicFileStoragePage_Conditional_11_Template_app_list_pager_pageChange_12_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.query.set({ page: $event })); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 15, "sharedRoot"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 17, "search"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.search.value());
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("state", ctx_r1.data.state())("refreshError", ctx_r1.data.refreshError());
    i0.ɵɵadvance();
    i0.ɵɵproperty("columns", ctx_r1.columns())("data", ctx_r1.data.value()?.page?.items ?? i0.ɵɵpureFunction0(23, _c0))("loading", ctx_r1.data.refreshing())("loadingText", i0.ɵɵpipeBind1(10, 19, "loading"))("emptyText", i0.ɵɵpipeBind1(11, 21, "filesEmpty"))("sortColumn", ctx_r1.query.text("sort", "name"))("sortDirection", ctx_r1.query.direction("asc"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("total", ctx_r1.data.value()?.page?.total ?? 0)("page", ctx_r1.query.page)("size", 10);
} }
function PublicFileStoragePage_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 15);
    i0.ɵɵlistener("click", function PublicFileStoragePage_Conditional_12_Template_button_click_0_listener() { const file_r4 = i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.download(file_r4)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(2, 2, "download"), " \u00B7 ", ctx.name);
} }
const column = createColumnHelper();
export class PublicFileStoragePage {
    item = new Resource();
    data = new Resource();
    query = new ListQuery('', true);
    search = new DebouncedSearch(this.query);
    i18n = inject(I18n);
    route = inject(ActivatedRoute);
    http = inject(HttpClient);
    runtime = inject(Runtime);
    root = this.route.snapshot.paramMap.get('id');
    token = this.route.snapshot.fragment ?? '';
    headers = { 'X-File-Share': this.token };
    base = `${this.runtime.apiUrl}/api/v1/auth/file-storage/public`;
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor('name', {
                header: this.i18n.text('fileName'),
                cell: ({ row }) => flexRenderComponent(FileStorageFileName, {
                    inputs: {
                        file: row.original,
                        open: () => row.original.isFolder
                            ? void this.query.set({ folder: row.original.id, page: 1 })
                            : void this.download(row.original),
                    },
                }),
            }),
            column.accessor('size', {
                header: this.i18n.text('fileSize'),
                cell: (c) => this.i18n.number(c.getValue()) + ' B',
            }),
            column.accessor('updatedAt', {
                header: this.i18n.text('updatedAt'),
                cell: (c) => this.i18n.date(c.getValue() || c.row.original.createdAt),
            }),
            column.display({
                id: 'actions',
                enableSorting: false,
                header: this.i18n.text('actions'),
                cell: ({ row }) => flexRenderComponent(RowActions, {
                    inputs: {
                        actions: [
                            {
                                label: row.original.isFolder ? 'openFolder' : 'download',
                                run: () => row.original.isFolder
                                    ? void this.query.set({ folder: row.original.id, page: 1 })
                                    : void this.download(row.original),
                            },
                        ],
                    },
                }),
            }),
        ]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    constructor() {
        this.query.connect(() => {
            this.search.sync(this.query.text('search'));
            void this.load();
        });
    }
    async load() {
        if (await this.item.load(() => firstValueFrom(this.http.get(`${this.base}/${this.root}`, { headers: this.headers })))) {
            if (this.item.value()?.isFolder)
                await this.data.load(() => firstValueFrom(this.http.get(`${this.base}/${this.query.text('folder', this.root)}/children`, {
                    headers: this.headers,
                    params: {
                        pageNumber: this.query.page,
                        pageSize: 10,
                        sort: this.query.text('sort', 'name'),
                        direction: this.query.direction('asc'),
                        search: this.query.text('search'),
                    },
                })));
        }
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    async download(file) {
        try {
            const blob = await firstValueFrom(this.http.get(`${this.base}/${file.id}/download`, {
                headers: this.headers,
                responseType: 'blob',
            }));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        catch {
            /* Central errors. */
        }
    }
    static ɵfac = function PublicFileStoragePage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PublicFileStoragePage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PublicFileStoragePage, selectors: [["app-public-file-storage"]], decls: 13, vars: 9, consts: [["title", "sharedFiles", "description", "publicFilesHelp"], [3, "enabled", "minutes"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [3, "retry", "state", "refreshError"], ["hlmBtn", ""], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmField", "", 1, "my-4"], ["hlmFieldLabel", "", "for", "public-search"], ["hlmInput", "", "id", "public-search", "maxlength", "120", 3, "ngModelChange", "ngModel"], [3, "sortChange", "columns", "data", "loading", "loadingText", "emptyText", "sortColumn", "sortDirection"], [3, "pageChange", "total", "page", "size"], ["hlmBtn", "", 3, "click"]], template: function PublicFileStoragePage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 0)(1, "app-file-storage-demo-banner", 1);
            i0.ɵɵelementStart(2, "section", 2)(3, "div", 3)(4, "h2", 4);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p", 5);
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "div", 6)(10, "app-page-state", 7);
            i0.ɵɵlistener("retry", function PublicFileStoragePage_Template_app_page_state_retry_10_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(11, PublicFileStoragePage_Conditional_11_Template, 13, 24)(12, PublicFileStoragePage_Conditional_12_Template, 3, 4, "button", 8);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            let tmp_6_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("enabled", ctx.item.value()?.demoMode ?? false)("minutes", ctx.item.value()?.demoExpiryMinutes ?? 60);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.item.value()?.name || i0.ɵɵpipeBind1(6, 7, "sharedFiles"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.item.value()?.description);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.item.state())("refreshError", ctx.item.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.item.value()?.isFolder ? 11 : (tmp_6_0 = ctx.item.value()) ? 12 : -1, tmp_6_0);
        } }, dependencies: [i1.PageHeader, i1.PageState, i1.ListPager, i2.FormsModule, i2.DefaultValueAccessor, i2.NgControlStatus, i2.MaxLengthValidator, i2.NgModel, i3.HlmButton, i4.HlmCard, i4.HlmCardContent, i4.HlmCardDescription, i4.HlmCardHeader, i4.HlmCardTitle, i5.HlmField, i5.HlmFieldLabel, i6.HlmInput, DataTable, FileStorageDemoBanner, i7.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PublicFileStoragePage, [{
        type: Component,
        args: [{
                selector: 'app-public-file-storage',
                imports: [WorkspaceUi, DataTable, FileStorageDemoBanner],
                template: `<app-page-header title="sharedFiles" description="publicFilesHelp" />
    <app-file-storage-demo-banner
      [enabled]="item.value()?.demoMode ?? false"
      [minutes]="item.value()?.demoExpiryMinutes ?? 60"
    />
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ item.value()?.name || ('sharedFiles' | t) }}</h2>
        <p hlmCardDescription>{{ item.value()?.description }}</p>
      </div>
      <div hlmCardContent>
        <app-page-state
          [state]="item.state()"
          [refreshError]="item.refreshError()"
          (retry)="load()"
        >
          @if (item.value()?.isFolder) {
            <button hlmBtn variant="outline" (click)="query.set({ folder: null, page: 1 })">
              {{ 'sharedRoot' | t }}
            </button>
            <div hlmField class="my-4">
              <label hlmFieldLabel for="public-search">{{ 'search' | t }}</label
              ><input
                hlmInput
                id="public-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="120"
              />
            </div>
            <app-page-state
              [state]="data.state()"
              [refreshError]="data.refreshError()"
              (retry)="load()"
              ><app-data-table
                [columns]="columns()"
                [data]="data.value()?.page?.items ?? []"
                [loading]="data.refreshing()"
                [loadingText]="'loading' | t"
                [emptyText]="'filesEmpty' | t"
                [sortColumn]="query.text('sort', 'name')"
                [sortDirection]="query.direction('asc')"
                (sortChange)="sort($event)" /><app-list-pager
                [total]="data.value()?.page?.total ?? 0"
                [page]="query.page"
                [size]="10"
                (pageChange)="query.set({ page: $event })"
            /></app-page-state>
          } @else if (item.value(); as file) {
            <button hlmBtn (click)="download(file)">{{ 'download' | t }} · {{ file.name }}</button>
          }
        </app-page-state>
      </div>
    </section>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PublicFileStoragePage, { className: "PublicFileStoragePage", filePath: "src/app/features/public-file-storage.ts", lineNumber: 73 }); })();
