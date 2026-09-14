import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Resource, WorkspaceUi, ListQuery, DebouncedSearch, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, } from '../shared/workspace';
import { DataTable } from '../shared/data-table';
import { RowActions } from '../shared/workspace-cells';
import { BusinessSelect } from '../shared/business-select';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "@spartan-ng/helm/checkbox";
import * as i9 from "../core/i18n";
const _c0 = a0 => ["/organizations", a0, "crm", "configuration"];
const _c1 = a0 => ["/organizations", a0, "crm", "new"];
const _c2 = a0 => ({ kind: a0 });
const _c3 = () => [];
const _c4 = (a0, a1) => ["/organizations", a0, "crm", a1];
const _forTrack0 = ($index, $item) => $item.id;
function CrmPage_Conditional_7_For_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 21);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const record_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction2(3, _c4, ctx_r1.organization, record_r1.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(record_r1.data.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \uFFFD ", ctx_r1.i18n.date(record_r1.updatedAt), " ");
} }
function CrmPage_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 3)(1, "div", 5)(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 20)(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "ul");
    i0.ɵɵrepeaterCreate(13, CrmPage_Conditional_7_For_14_Template, 4, 6, "li", null, _forTrack0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const overview_r3 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "crmOverview"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(8, 7, "openDeals"), ": ", overview_r3.openDeals);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(11, 9, "openValue"), ": ", ctx_r1.i18n.currency(overview_r3.openValue));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(overview_r3.recent);
} }
const column = createColumnHelper();
export class CrmPage {
    organization = inject(ActivatedRoute).snapshot.paramMap.get('id');
    query = new ListQuery();
    search = new DebouncedSearch(this.query);
    i18n = inject(I18n);
    api = inject(WorkspaceApi);
    router = inject(Router);
    data = new Resource();
    overview = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    kinds = [
        { id: '0', label: 'contacts' },
        { id: '1', label: 'companies' },
        { id: '2', label: 'deals' },
    ];
    columns = computed(() => {
        this.i18n.culture();
        return column.columns([
            column.accessor((x) => x.data.name, { id: 'name', header: this.i18n.text('name') }),
            column.accessor((x) => x.data.email, { id: 'email', header: this.i18n.text('email') }),
            column.accessor((x) => x.data.phone, { id: 'phone', header: this.i18n.text('phone') }),
            ...(this.query.text('kind', '0') === '2'
                ? [
                    column.accessor((x) => x.data.value ?? 0, {
                        id: 'value',
                        header: this.i18n.text('value'),
                        cell: (c) => this.i18n.currency(c.getValue()),
                    }),
                ]
                : []),
            column.accessor('updatedAt', {
                header: this.i18n.text('updatedAt'),
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
                                    'crm',
                                    row.original.id,
                                ]),
                            },
                            {
                                label: row.original.archived ? 'restore' : 'archive',
                                disabled: this.busy(),
                                run: () => void this.archive(row.original),
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
        void this.overview.load((signal) => this.api.get(`organizations/${this.organization}/crm/overview`, {}, signal));
    }
    size() {
        const value = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
        return PAGE_SIZE_OPTIONS.includes(value) ? value : DEFAULT_PAGE_SIZE;
    }
    sort(value) {
        void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
    }
    async load() {
        if (await this.data.load((signal) => this.api.get(`organizations/${this.organization}/crm`, {
            kind: Number(this.query.text('kind', '0')),
            search: this.query.text('search'),
            archived: this.query.text('archived') === 'true',
            pageNumber: this.query.page,
            pageSize: this.size(),
            sort: this.query.text('sort', 'name'),
            direction: this.query.direction('asc'),
        }, signal)))
            this.query.clamp(this.data.value()?.total, this.size());
    }
    async archive(record) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`organizations/${this.organization}/crm/${record.id}/archive`, {
                version: record.version,
                archived: !record.archived,
            });
            await this.load();
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function CrmPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CrmPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CrmPage, selectors: [["app-crm"]], decls: 36, vars: 51, consts: [["title", "crm", "description", "crmHelp"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], ["hlmBtn", "", 3, "routerLink", "queryParams"], ["hlmCard", "", 1, "mb-6"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], [1, "grid", "gap-4", "sm:grid-cols-3"], ["controlId", "crm-kind", "label", "crmKind", 3, "valueChange", "options", "allowEmpty", "value"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "crm-search"], ["hlmInput", "", "id", "crm-search", "type", "search", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "crm-archived"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "crm-archived", 3, "ngModelChange", "ngModel"], ["hlmFieldDescription", ""], ["hlmCardContent", ""], [3, "retry", "state", "refreshError"], [3, "sortChange", "columns", "data", "loading", "emptyText", "loadingText", "sortColumn", "sortDirection"], [3, "pageChange", "sizeChange", "total", "page", "size", "showSizePicker"], ["hlmCardContent", "", 1, "flex", "flex-wrap", "gap-8"], [3, "routerLink"]], template: function CrmPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-page-header", 0)(1, "a", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "a", 2);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(7, CrmPage_Conditional_7_Template, 15, 11, "section", 3);
            i0.ɵɵelementStart(8, "section", 4)(9, "div", 5)(10, "h2", 6);
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "div", 7)(14, "app-business-select", 8);
            i0.ɵɵlistener("valueChange", function CrmPage_Template_app_business_select_valueChange_14_listener($event) { return ctx.query.set({ kind: $event, page: 1 }); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "div", 9)(16, "label", 10);
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "input", 11);
            i0.ɵɵlistener("ngModelChange", function CrmPage_Template_input_ngModelChange_19_listener($event) { return ctx.search.update($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "label", 12)(21, "div", 13)(22, "hlm-checkbox", 14);
            i0.ɵɵlistener("ngModelChange", function CrmPage_Template_hlm_checkbox_ngModelChange_22_listener($event) { return ctx.query.set({ archived: $event ? "true" : null, page: 1 }); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(23, "div")(24, "span");
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "p", 15);
            i0.ɵɵtext(28);
            i0.ɵɵpipe(29, "t");
            i0.ɵɵelementEnd()()()()()();
            i0.ɵɵelementStart(30, "div", 16)(31, "app-page-state", 17);
            i0.ɵɵlistener("retry", function CrmPage_Template_app_page_state_retry_31_listener() { return ctx.load(); });
            i0.ɵɵelementStart(32, "app-data-table", 18);
            i0.ɵɵpipe(33, "t");
            i0.ɵɵpipe(34, "t");
            i0.ɵɵlistener("sortChange", function CrmPage_Template_app_data_table_sortChange_32_listener($event) { return ctx.sort($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(35, "app-list-pager", 19);
            i0.ɵɵlistener("pageChange", function CrmPage_Template_app_list_pager_pageChange_35_listener($event) { return ctx.query.set({ page: $event }); })("sizeChange", function CrmPage_Template_app_list_pager_sizeChange_35_listener($event) { return ctx.query.set({ size: $event, page: 1 }); });
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            let tmp_5_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(44, _c0, ctx.organization));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 28, "crmConfiguration"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(46, _c1, ctx.organization))("queryParams", i0.ɵɵpureFunction1(48, _c2, ctx.query.text("kind", "0")));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 30, "crmNew"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_5_0 = ctx.overview.value()) ? 7 : -1, tmp_5_0);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 32, "crm"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("options", ctx.kinds)("allowEmpty", false)("value", ctx.query.text("kind", "0"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 34, "search"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.search.value());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngModel", ctx.query.text("archived") === "true");
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 36, "archived"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 38, "archivedHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", ctx.columns())("data", ctx.data.value()?.items ?? i0.ɵɵpureFunction0(50, _c3))("loading", ctx.data.refreshing())("emptyText", i0.ɵɵpipeBind1(33, 40, "noResults"))("loadingText", i0.ɵɵpipeBind1(34, 42, "loading"))("sortColumn", ctx.query.text("sort", "name"))("sortDirection", ctx.query.direction("asc"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("total", ctx.data.value()?.total ?? 0)("page", ctx.query.page)("size", ctx.size())("showSizePicker", true);
        } }, dependencies: [i1.PageHeader, i1.PageState, i1.ListPager, i2.FormsModule, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgModel, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldDescription, i6.HlmFieldLabel, i7.HlmInput, i8.HlmCheckbox, DataTable, BusinessSelect, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CrmPage, [{
        type: Component,
        args: [{
                selector: 'app-crm',
                imports: [WorkspaceUi, DataTable, BusinessSelect],
                template: `<app-page-header title="crm" description="crmHelp">
      <a
        hlmBtn
        variant="outline"
        [routerLink]="['/organizations', organization, 'crm', 'configuration']"
        >{{ 'crmConfiguration' | t }}</a
      >
      <a
        hlmBtn
        [routerLink]="['/organizations', organization, 'crm', 'new']"
        [queryParams]="{ kind: query.text('kind', '0') }"
        >{{ 'crmNew' | t }}</a
      >
    </app-page-header>
    @if (overview.value(); as overview) {
      <section hlmCard class="mb-6">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'crmOverview' | t }}</h2>
        </div>
        <div hlmCardContent class="flex flex-wrap gap-8">
          <p>{{ 'openDeals' | t }}: {{ overview.openDeals }}</p>
          <p>{{ 'openValue' | t }}: {{ i18n.currency(overview.openValue) }}</p>
          <ul>
            @for (record of overview.recent; track record.id) {
              <li>
                <a [routerLink]="['/organizations', organization, 'crm', record.id]">{{
                  record.data.name
                }}</a>
                � {{ i18n.date(record.updatedAt) }}
              </li>
            }
          </ul>
        </div>
      </section>
    }
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'crm' | t }}</h2>
        <div class="grid gap-4 sm:grid-cols-3">
          <app-business-select
            controlId="crm-kind"
            label="crmKind"
            [options]="kinds"
            [allowEmpty]="false"
            [value]="query.text('kind', '0')"
            (valueChange)="query.set({ kind: $event, page: 1 })"
          />
          <div hlmField>
            <label hlmFieldLabel for="crm-search">{{ 'search' | t }}</label
            ><input
              hlmInput
              id="crm-search"
              type="search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
            />
          </div>
          <label hlmFieldLabel for="crm-archived"
            ><div hlmField orientation="horizontal">
              <hlm-checkbox
                inputId="crm-archived"
                [ngModel]="query.text('archived') === 'true'"
                (ngModelChange)="query.set({ archived: $event ? 'true' : null, page: 1 })"
              />
              <div>
                <span>{{ 'archived' | t }}</span>
                <p hlmFieldDescription>{{ 'archivedHelp' | t }}</p>
              </div>
            </div></label
          >
        </div>
      </div>
      <div hlmCardContent>
        <app-page-state
          [state]="data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
        >
          <app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'noResults' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'name')"
            [sortDirection]="query.direction('asc')"
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
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CrmPage, { className: "CrmPage", filePath: "src/app/features/crm.ts", lineNumber: 123 }); })();
