import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { I18n } from '../core/i18n';
import { Features } from '../core/features';
import { WorkspaceApi } from '../core/workspace-api';
import { WorkspaceUi, Resource, ListQuery, DebouncedSearch, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, } from '../shared/workspace';
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
const _c0 = () => [];
const _c1 = a0 => ["/organizations", a0, "invoicing", "settings"];
const _c2 = a0 => ["/organizations", a0, "invoicing", "new"];
function InvoicingPage_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 11);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 12);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(8, _c1, ctx_r0.organization));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 4, "issuerSettings"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(10, _c2, ctx_r0.organization));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "issueDocument"));
} }
const column = createColumnHelper();
export const commercialKinds = ['quotation', 'invoice', 'receipt', 'creditNote'];
export class InvoicingPage {
    organization = inject(ActivatedRoute).snapshot.paramMap.get('id');
    query = new ListQuery();
    search = new DebouncedSearch(this.query);
    i18n = inject(I18n);
    features = inject(Features);
    api = inject(WorkspaceApi);
    router = inject(Router);
    data = new Resource();
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor('number', { header: this.i18n.text('documentNumber') }),
            column.accessor((x) => x.snapshot.customer.name, {
                id: 'customer',
                header: this.i18n.text('billTo'),
            }),
            column.accessor('kind', {
                header: this.i18n.text('type'),
                cell: (c) => this.i18n.text(commercialKinds[c.getValue()]),
            }),
            column.accessor('amount', {
                id: 'total',
                header: this.i18n.text('total'),
                cell: (c) => this.i18n.currency(c.getValue()),
            }),
            column.accessor('issuedAt', {
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
                                label: 'view',
                                run: () => void this.router.navigate([
                                    '/organizations',
                                    this.organization,
                                    'invoicing',
                                    row.original.id,
                                ]),
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
    size() {
        const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
        return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
    }
    sort(s) {
        void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
    }
    async load() {
        if (await this.data.load((signal) => this.api.get(`organizations/${this.organization}/invoicing`, {
            search: this.query.text('search'),
            pageNumber: this.query.page,
            pageSize: this.size(),
            sort: this.query.text('sort', 'issuedAt'),
            direction: this.query.direction('desc'),
        }, signal)))
            this.query.clamp(this.data.value()?.total, this.size());
    }
    static ɵfac = function InvoicingPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || InvoicingPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: InvoicingPage, selectors: [["app-invoicing"]], decls: 18, vars: 26, consts: [["title", "invoicing", "description", "invoicingHelp"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmField", ""], ["hlmFieldLabel", "", "for", "invoice-search"], ["hlmInput", "", "id", "invoice-search", "type", "search", 3, "ngModelChange", "ngModel"], ["hlmCardContent", ""], [3, "retry", "state", "refreshError"], [3, "sortChange", "columns", "data", "loading", "emptyText", "loadingText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "total", "page", "size", "showSizePicker"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], ["hlmBtn", "", 3, "routerLink"]], template: function InvoicingPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0);
            i0.ɵɵconditionalCreate(1, InvoicingPage_Conditional_1_Template, 6, 12);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "section", 1)(3, "div", 2)(4, "h2", 3);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 4)(8, "label", 5);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "input", 6);
            i0.ɵɵlistener("ngModelChange", function InvoicingPage_Template_input_ngModelChange_11_listener($event) { return ctx.search.update($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "div", 7)(13, "app-page-state", 8);
            i0.ɵɵlistener("retry", function InvoicingPage_Template_app_page_state_retry_13_listener() { return ctx.load(); });
            i0.ɵɵelementStart(14, "app-data-table", 9);
            i0.ɵɵpipe(15, "t");
            i0.ɵɵpipe(16, "t");
            i0.ɵɵlistener("sortChange", function InvoicingPage_Template_app_data_table_sortChange_14_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "app-list-pager", 10);
            i0.ɵɵlistener("pageChange", function InvoicingPage_Template_app_list_pager_pageChange_17_listener($event) { return ctx.query.set({ page: $event }); })("sizeChange", function InvoicingPage_Template_app_list_pager_sizeChange_17_listener($event) { return ctx.query.set({ size: $event, page: 1 }); });
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.features.enabled("invoicing") ? 1 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 17, "invoicing"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 19, "search"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.search.value());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("data", ctx.data.value()?.items ?? i0.ɵɵpureFunction0(25, _c0))("loading", ctx.data.refreshing())("emptyText", i0.ɵɵpipeBind1(15, 21, "noResults"))("loadingText", i0.ɵɵpipeBind1(16, 23, "loading"))("sortColumn", ctx.query.text("sort", "issuedAt"))("sortDirection", ctx.query.direction("desc"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("total", ctx.data.value()?.total ?? 0)("page", ctx.query.page)("size", ctx.size())("showSizePicker", true);
        } }, dependencies: [i1.PageHeader, i1.PageState, i1.ListPager, i2.FormsModule, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgModel, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, DataTable, i8.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(InvoicingPage, [{
        type: Component,
        args: [{
                selector: 'app-invoicing',
                imports: [WorkspaceUi, DataTable],
                template: ` <app-page-header title="invoicing" description="invoicingHelp">
      @if (features.enabled('invoicing')) {
        <a
          hlmBtn
          variant="outline"
          [routerLink]="['/organizations', organization, 'invoicing', 'settings']"
          >{{ 'issuerSettings' | t }}</a
        ><a hlmBtn [routerLink]="['/organizations', organization, 'invoicing', 'new']">{{
          'issueDocument' | t
        }}</a>
      }
    </app-page-header>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'invoicing' | t }}</h2>
        <div hlmField>
          <label hlmFieldLabel for="invoice-search">{{ 'search' | t }}</label
          ><input
            hlmInput
            id="invoice-search"
            type="search"
            [ngModel]="search.value()"
            (ngModelChange)="search.update($event)"
          />
        </div>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'noResults' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'issuedAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="size()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
          />
        </app-page-state>
      </div>
    </section>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(InvoicingPage, { className: "InvoicingPage", filePath: "src/app/features/invoicing.ts", lineNumber: 73 }); })();
