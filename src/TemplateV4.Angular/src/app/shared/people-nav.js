import { Component, inject, input, output, viewChild } from '@angular/core';
import { BrnTabs } from '@spartan-ng/brain/tabs';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { Auth } from '../core/auth';
import { Translate } from '../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/tabs";
function PeopleNav_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 3);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "users"));
} }
function PeopleNav_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 4);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "invitations"));
} }
function PeopleNav_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "roles"));
} }
function PeopleNav_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 7);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "security"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "privacyRequests"));
} }
export class PeopleNav {
    auth = inject(Auth);
    section = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "section" }] : /* istanbul ignore next */ []));
    sectionChange = output();
    tabs = viewChild.required(BrnTabs, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tabs" }] : /* istanbul ignore next */ []));
    requestSection(section) {
        // Keep selection on the current page until its navigation is confirmed.
        this.tabs().setActiveTab(this.section());
        this.sectionChange.emit(section);
    }
    static ɵfac = function PeopleNav_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PeopleNav)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PeopleNav, selectors: [["app-people-nav"]], viewQuery: function PeopleNav_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.tabs, BrnTabs, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, inputs: { section: [1, "section"] }, outputs: { sectionChange: "sectionChange" }, decls: 8, vars: 8, consts: [[1, "mb-6"], [3, "tabActivated", "tab"], [1, "flex-wrap"], ["hlmTabsTrigger", "users"], ["hlmTabsTrigger", "invitations"], ["hlmTabsTrigger", "roles"], ["hlmTabsTrigger", "security"], ["hlmTabsTrigger", "privacy"]], template: function PeopleNav_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "nav", 0);
            i0.ɵɵpipe(1, "t");
            i0.ɵɵelementStart(2, "hlm-tabs", 1);
            i0.ɵɵlistener("tabActivated", function PeopleNav_Template_hlm_tabs_tabActivated_2_listener($event) { return ctx.requestSection($event); });
            i0.ɵɵelementStart(3, "hlm-tabs-list", 2);
            i0.ɵɵconditionalCreate(4, PeopleNav_Conditional_4_Template, 3, 3, "button", 3);
            i0.ɵɵconditionalCreate(5, PeopleNav_Conditional_5_Template, 3, 3, "button", 4);
            i0.ɵɵconditionalCreate(6, PeopleNav_Conditional_6_Template, 3, 3, "button", 5);
            i0.ɵɵconditionalCreate(7, PeopleNav_Conditional_7_Template, 6, 6);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 6, "people"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("tab", ctx.section());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.auth.has("users.read") ? 4 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.auth.has("users.manage") ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.auth.has("roles.manage") ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.auth.has("settings.manage") ? 7 : -1);
        } }, dependencies: [i1.HlmTabs, i1.HlmTabsList, i1.HlmTabsTrigger, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PeopleNav, [{
        type: Component,
        args: [{
                selector: 'app-people-nav',
                imports: [HlmTabsImports, Translate],
                template: `<nav class="mb-6" [attr.aria-label]="'people' | t">
    <hlm-tabs [tab]="section()" (tabActivated)="requestSection($event)">
      <hlm-tabs-list class="flex-wrap">
        @if (auth.has('users.read')) {
          <button hlmTabsTrigger="users">{{ 'users' | t }}</button>
        }
        @if (auth.has('users.manage')) {
          <button hlmTabsTrigger="invitations">{{ 'invitations' | t }}</button>
        }
        @if (auth.has('roles.manage')) {
          <button hlmTabsTrigger="roles">{{ 'roles' | t }}</button>
        }
        @if (auth.has('settings.manage')) {
          <button hlmTabsTrigger="security">{{ 'security' | t }}</button>
          <button hlmTabsTrigger="privacy">{{ 'privacyRequests' | t }}</button>
        }
      </hlm-tabs-list>
    </hlm-tabs>
  </nav>`,
            }]
    }], null, { section: [{ type: i0.Input, args: [{ isSignal: true, alias: "section", required: true }] }], sectionChange: [{ type: i0.Output, args: ["sectionChange"] }], tabs: [{ type: i0.ViewChild, args: [i0.forwardRef(() => BrnTabs), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PeopleNav, { className: "PeopleNav", filePath: "src/app/shared/people-nav.ts", lineNumber: 29 }); })();
