import { Component, inject, signal } from '@angular/core';
import { HostListener } from '@angular/core';
import { protectUnload } from '../../shared/confirmation';
import { RouterLink } from '@angular/router';
import { WorkspaceApi } from '../../core/workspace-api';
import { Notifications } from '../notifications/notifications';
import { Resource, WorkspaceUi } from '../../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/card";
import * as i6 from "@spartan-ng/helm/field";
import * as i7 from "@spartan-ng/helm/input";
import * as i8 from "../../core/i18n";
const _c0 = a0 => ["/organizations", a0, "billing"];
const _c1 = a0 => ["/organizations", a0];
const _forTrack0 = ($index, $item) => $item.id;
function OrganizationsPage_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 5)(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 7);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 8)(9, "button", 9);
    i0.ɵɵlistener("click", function OrganizationsPage_Conditional_2_For_2_Template_button_click_9_listener() { const invite_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.accept(invite_r2.id)); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const invite_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(invite_r2.customerName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(6, 5, "organizationInvitation"), " \u00B7 ", i0.ɵɵpipeBind1(7, 7, "customer." + invite_r2.role), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r2.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 9, "acceptInvitation"), " ");
} }
function OrganizationsPage_Conditional_2_For_4_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 11);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const account_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(4, _c1, account_r4.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "openWorkspace"));
} }
function OrganizationsPage_Conditional_2_For_4_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 12);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "files"));
} }
function OrganizationsPage_Conditional_2_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 5)(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 7);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 10);
    i0.ɵɵconditionalCreate(9, OrganizationsPage_Conditional_2_For_4_Conditional_9_Template, 3, 6, "a", 11)(10, OrganizationsPage_Conditional_2_For_4_Conditional_10_Template, 3, 3, "a", 12);
    i0.ɵɵelementStart(11, "a", 13);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const account_r4 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(account_r4.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(6, 6, "customer." + account_r4.kind), " \u00B7 ", i0.ɵɵpipeBind1(7, 8, "customer." + account_r4.role), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(account_r4.kind === "Organization" ? 9 : 10);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(12, _c0, account_r4.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 10, "billing"));
} }
function OrganizationsPage_Conditional_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 5)(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "form", 14, 0);
    i0.ɵɵlistener("ngSubmit", function OrganizationsPage_Conditional_2_Conditional_5_Template_form_ngSubmit_5_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.create()); });
    i0.ɵɵelementStart(7, "div", 15)(8, "label", 16);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "input", 17);
    i0.ɵɵtwoWayListener("ngModelChange", function OrganizationsPage_Conditional_2_Conditional_5_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.name, $event) || (ctx_r2.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 18);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const form_r6 = i0.ɵɵreference(6);
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "createOrganization"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 7, "organizationName"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.name);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.busy() || form_r6.invalid || !ctx_r2.name.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 9, "createOrganization"), " ");
} }
function OrganizationsPage_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵrepeaterCreate(1, OrganizationsPage_Conditional_2_For_2_Template, 12, 11, "section", 4, _forTrack0);
    i0.ɵɵrepeaterCreate(3, OrganizationsPage_Conditional_2_For_4_Template, 14, 14, "section", 4, _forTrack0);
    i0.ɵɵconditionalCreate(5, OrganizationsPage_Conditional_2_Conditional_5_Template, 15, 11, "section", 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const home_r7 = ctx;
    i0.ɵɵadvance();
    i0.ɵɵrepeater(home_r7.invitations);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(home_r7.accounts);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(home_r7.mode !== "Personal" ? 5 : -1);
} }
export class OrganizationsPage {
    data = new Resource();
    api = inject(WorkspaceApi);
    toast = inject(Notifications);
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    name = '';
    hasUnsavedChanges() {
        return this.busy() || !!this.name.trim();
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    constructor() {
        void this.load();
    }
    load() {
        return this.data.load((signal) => this.api.get('customers/', {}, signal));
    }
    async create() {
        if (this.busy() || !this.name.trim())
            return;
        this.busy.set(true);
        try {
            await this.api.post('customers/', { name: this.name });
            this.name = '';
            await this.load();
            this.toast.success('customerSaved');
        }
        finally {
            this.busy.set(false);
        }
    }
    async accept(id) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(`customers/invitations/${id}/accept`);
            await this.load();
            this.toast.success('customerSaved');
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function OrganizationsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || OrganizationsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: OrganizationsPage, selectors: [["app-organizations"]], hostBindings: function OrganizationsPage_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function OrganizationsPage_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } }, decls: 3, vars: 4, consts: [["form", "ngForm"], ["title", "organizations", "description", "organizationsHelp"], [3, "retry", "state", "refreshing", "refreshError"], [1, "grid", "gap-6"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardFooter", ""], ["hlmBtn", "", 3, "click", "disabled"], ["hlmCardFooter", "", 1, "flex-wrap", "gap-2"], ["hlmBtn", "", 3, "routerLink"], ["hlmBtn", "", "routerLink", "/my-files"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"], ["hlmCardContent", "", 1, "grid", "gap-4", 3, "ngSubmit"], ["hlmField", ""], ["hlmFieldLabel", "", "for", "organization-name"], ["hlmInput", "", "id", "organization-name", "name", "name", "required", "", "maxlength", "120", 3, "ngModelChange", "ngModel"], ["hlmBtn", "", 3, "disabled"]], template: function OrganizationsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 1);
            i0.ɵɵelementStart(1, "app-page-state", 2);
            i0.ɵɵlistener("retry", function OrganizationsPage_Template_app_page_state_retry_1_listener() { return ctx.load(); });
            i0.ɵɵconditionalCreate(2, OrganizationsPage_Conditional_2_Template, 6, 1, "div", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_3_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshing", ctx.data.refreshing())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.data.value()) ? 2 : -1, tmp_3_0);
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i2.ɵNgNoValidate, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MaxLengthValidator, i2.NgModel, i2.NgForm, i3.RouterLink, i4.HlmButton, i5.HlmCard, i5.HlmCardContent, i5.HlmCardDescription, i5.HlmCardFooter, i5.HlmCardHeader, i5.HlmCardTitle, i6.HlmField, i6.HlmFieldLabel, i7.HlmInput, i8.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OrganizationsPage, [{
        type: Component,
        args: [{
                selector: 'app-organizations',
                imports: [WorkspaceUi, RouterLink],
                template: `<app-page-header title="organizations" description="organizationsHelp" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
    >
      @if (data.value(); as home) {
        <div class="grid gap-6">
          @for (invite of home.invitations; track invite.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ invite.customerName }}</h2>
                <p hlmCardDescription>
                  {{ 'organizationInvitation' | t }} · {{ 'customer.' + invite.role | t }}
                </p>
              </div>
              <div hlmCardFooter>
                <button hlmBtn [disabled]="busy()" (click)="accept(invite.id)">
                  {{ 'acceptInvitation' | t }}
                </button>
              </div>
            </section>
          }
          @for (account of home.accounts; track account.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ account.name }}</h2>
                <p hlmCardDescription>
                  {{ 'customer.' + account.kind | t }} · {{ 'customer.' + account.role | t }}
                </p>
              </div>
              <div hlmCardFooter class="flex-wrap gap-2">
                @if (account.kind === 'Organization') {
                  <a hlmBtn [routerLink]="['/organizations', account.id]">{{
                    'openWorkspace' | t
                  }}</a>
                } @else {
                  <a hlmBtn routerLink="/my-files">{{ 'files' | t }}</a>
                }
                <a
                  hlmBtn
                  variant="outline"
                  [routerLink]="['/organizations', account.id, 'billing']"
                  >{{ 'billing' | t }}</a
                >
              </div>
            </section>
          }
          @if (home.mode !== 'Personal') {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'createOrganization' | t }}</h2>
              </div>
              <form hlmCardContent class="grid gap-4" (ngSubmit)="create()" #form="ngForm">
                <div hlmField>
                  <label hlmFieldLabel for="organization-name">{{ 'organizationName' | t }}</label
                  ><input
                    hlmInput
                    id="organization-name"
                    name="name"
                    [(ngModel)]="name"
                    required
                    maxlength="120"
                  />
                </div>
                <button hlmBtn [disabled]="busy() || form.invalid || !name.trim()">
                  {{ 'createOrganization' | t }}
                </button>
              </form>
            </section>
          }
        </div>
      }
    </app-page-state>`,
            }]
    }], () => [], { beforeUnload: [{
            type: HostListener,
            args: ['window:beforeunload', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(OrganizationsPage, { className: "OrganizationsPage", filePath: "src/app/features/organizations.ts", lineNumber: 89 }); })();
