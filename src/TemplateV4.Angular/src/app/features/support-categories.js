import { Component, inject, signal } from '@angular/core';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
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
const _c0 = () => [];
const _forTrack0 = ($index, $item) => $item.id;
function SupportCategoriesPage_For_16_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 25);
    i0.ɵɵlistener("click", function SupportCategoriesPage_For_16_Template_button_click_0_listener() { const c_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.edit(c_r3)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r3 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r3.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", c_r3.name, " \u00B7 ", i0.ɵɵpipeBind1(2, 3, c_r3.active ? "enabled" : "disabled"), " ");
} }
export class SupportCategoriesPage {
    api = inject(WorkspaceApi);
    confirm = inject(Confirmations);
    toast = inject(Notifications);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    selected = null;
    name = '';
    active = true;
    constructor() {
        void this.load();
    }
    load() {
        return this.data.load((signal) => this.api.get('support/options', {}, signal));
    }
    async edit(c) {
        if (this.hasUnsavedChanges() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
            return;
        this.selected = c;
        this.name = c.name;
        this.active = c.active;
    }
    clear() {
        this.selected = null;
        this.name = '';
        this.active = true;
    }
    hasUnsavedChanges() {
        return this.selected
            ? this.name !== this.selected.name || this.active !== this.selected.active
            : !!this.name;
    }
    beforeUnload(e) {
        protectUnload(e, this.hasUnsavedChanges());
    }
    async save() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post('support/categories', {
                id: this.selected?.id ?? null,
                name: this.name,
                active: this.active,
                version: this.selected?.version ?? '00000000-0000-0000-0000-000000000000',
            });
            this.clear();
            this.toast.success('supportSaved');
            await this.load();
        }
        catch {
            /* Central errors retain the draft. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function SupportCategoriesPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SupportCategoriesPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SupportCategoriesPage, selectors: [["app-support-categories"]], hostBindings: function SupportCategoriesPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function SupportCategoriesPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 50, vars: 37, consts: [["form", "ngForm"], ["title", "supportCategories", "description", "supportCategoriesHelp"], ["hlmBtn", "", "variant", "outline", "routerLink", "/support"], [3, "retry", "state", "refreshError"], [1, "grid", "gap-6", "lg:grid-cols-2"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "grid", "gap-2"], ["hlmBtn", "", "variant", "outline", 3, "disabled"], [3, "ngSubmit"], ["hlmCardContent", "", 1, "grid", "gap-4"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "category-name"], ["hlmInput", "", "id", "category-name", "name", "name", "maxlength", "80", "required", "", 3, "ngModelChange", "ngModel"], ["hlmFieldLabel", "", "for", "category-active"], ["hlmField", "", "orientation", "horizontal"], ["id", "category-active", "name", "active", 3, "ngModelChange", "ngModel"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""], ["hlmFieldDescription", ""], ["hlmCardFooter", "", 1, "flex", "gap-2"], ["hlmBtn", "", "type", "submit", 3, "disabled"], ["hlmBtn", "", "variant", "outline", "type", "button", 3, "click", "disabled"], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"]], template: function SupportCategoriesPage_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "app-page-header", 1)(1, "a", 2);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "app-page-state", 3);
            i0.ɵɵlistener("retry", function SupportCategoriesPage_Template_app_page_state_retry_4_listener() { return ctx.load(); });
            i0.ɵɵelementStart(5, "div", 4)(6, "section", 5)(7, "div", 6)(8, "h2", 7);
            i0.ɵɵtext(9);
            i0.ɵɵpipe(10, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "p", 8);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "div", 9);
            i0.ɵɵrepeaterCreate(15, SupportCategoriesPage_For_16_Template, 3, 5, "button", 10, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "section", 5)(18, "div", 6)(19, "h2", 7);
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "p", 8);
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "form", 11, 0);
            i0.ɵɵlistener("ngSubmit", function SupportCategoriesPage_Template_form_ngSubmit_25_listener() { i0.ɵɵrestoreView(_r1); const form_r5 = i0.ɵɵreference(26); return i0.ɵɵresetView(form_r5.valid && ctx.save()); });
            i0.ɵɵelementStart(27, "div", 12)(28, "div", 13)(29, "label", 14);
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "input", 15);
            i0.ɵɵtwoWayListener("ngModelChange", function SupportCategoriesPage_Template_input_ngModelChange_32_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.name, $event) || (ctx.name = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "label", 16)(34, "div", 17)(35, "hlm-checkbox", 18);
            i0.ɵɵtwoWayListener("ngModelChange", function SupportCategoriesPage_Template_hlm_checkbox_ngModelChange_35_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.active, $event) || (ctx.active = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(36, "div", 19)(37, "span", 20);
            i0.ɵɵtext(38);
            i0.ɵɵpipe(39, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(40, "p", 21);
            i0.ɵɵtext(41);
            i0.ɵɵpipe(42, "t");
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(43, "div", 22)(44, "button", 23);
            i0.ɵɵtext(45);
            i0.ɵɵpipe(46, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "button", 24);
            i0.ɵɵlistener("click", function SupportCategoriesPage_Template_button_click_47_listener() { return ctx.clear(); });
            i0.ɵɵtext(48);
            i0.ɵɵpipe(49, "t");
            i0.ɵɵelementEnd()()()()()();
        } if (rf & 2) {
            const form_r5 = i0.ɵɵreference(26);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 16, "support"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("state", ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 18, "supportCategories"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 20, "supportCategoryLimit"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.data.value()?.categories ?? i0.ɵɵpureFunction0(36, _c0));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(21, 22, ctx.selected ? "supportEditCategory" : "supportAddCategory"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 24, "supportCategoryRetain"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 26, "name"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.name);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("ngModel", ctx.active);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(39, 28, "enabled"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(42, 30, "supportCategoryRetain"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy() || !form_r5.valid || !ctx.name.trim());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(46, 32, "save"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(49, 34, "cancel"), " ");
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardFooter, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldContent, i6.HlmFieldDescription, i6.HlmFieldLabel, i6.HlmFieldTitle, i7.HlmInput, i8.HlmCheckbox, i9.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SupportCategoriesPage, [{
        type: Component,
        args: [{
                selector: 'app-support-categories',
                imports: [WorkspaceUi],
                host: { '(window:beforeunload)': 'beforeUnload($event)' },
                template: `<app-page-header title="supportCategories" description="supportCategoriesHelp"
      ><a hlmBtn variant="outline" routerLink="/support">{{ 'support' | t }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
      ><div class="grid gap-6 lg:grid-cols-2">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'supportCategories' | t }}</h2>
            <p hlmCardDescription>{{ 'supportCategoryLimit' | t }}</p>
          </div>
          <div hlmCardContent class="grid gap-2">
            @for (c of data.value()?.categories ?? []; track c.id) {
              <button hlmBtn variant="outline" [disabled]="busy()" (click)="edit(c)">
                {{ c.name }} · {{ (c.active ? 'enabled' : 'disabled') | t }}
              </button>
            }
          </div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>
              {{ (selected ? 'supportEditCategory' : 'supportAddCategory') | t }}
            </h2>
            <p hlmCardDescription>{{ 'supportCategoryRetain' | t }}</p>
          </div>
          <form #form="ngForm" (ngSubmit)="form.valid && save()">
            <div hlmCardContent class="grid gap-4">
              <div hlmField>
                <label hlmFieldLabel for="category-name">{{ 'name' | t }}</label
                ><input
                  hlmInput
                  id="category-name"
                  name="name"
                  [(ngModel)]="name"
                  maxlength="80"
                  required
                />
              </div>
              <label hlmFieldLabel for="category-active"
                ><div hlmField orientation="horizontal">
                  <hlm-checkbox id="category-active" name="active" [(ngModel)]="active" />
                  <div hlmFieldContent>
                    <span hlmFieldTitle>{{ 'enabled' | t }}</span>
                    <p hlmFieldDescription>{{ 'supportCategoryRetain' | t }}</p>
                  </div>
                </div></label
              >
            </div>
            <div hlmCardFooter class="flex gap-2">
              <button hlmBtn type="submit" [disabled]="busy() || !form.valid || !name.trim()">
                {{ 'save' | t }}</button
              ><button hlmBtn variant="outline" type="button" (click)="clear()" [disabled]="busy()">
                {{ 'cancel' | t }}
              </button>
            </div>
          </form>
        </section>
      </div></app-page-state
    >`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SupportCategoriesPage, { className: "SupportCategoriesPage", filePath: "src/app/features/support-categories.ts", lineNumber: 71 }); })();
