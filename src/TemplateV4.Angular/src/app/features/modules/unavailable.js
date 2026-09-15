import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../../core/auth';
import { WorkspaceUi } from '../../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "../../core/i18n";
function UnavailablePage_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-page-header", 0);
    i0.ɵɵelementStart(1, "a", 1);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", ctx_r0.auth.access() ? ctx_r0.auth.landing() : "/login");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, ctx_r0.auth.access() ? "backToWorkspace" : "signIn"));
} }
function UnavailablePage_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-page-header", 2);
    i0.ɵɵelementStart(1, "a", 1);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", ctx_r0.auth.access() ? ctx_r0.auth.landing() : "/login");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, ctx_r0.auth.access() ? "backToWorkspace" : "signIn"));
} }
export class UnavailablePage {
    auth = inject(Auth);
    forbidden = inject(ActivatedRoute).snapshot.data['forbidden'] === true;
    static ɵfac = function UnavailablePage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UnavailablePage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: UnavailablePage, selectors: [["app-unavailable"]], decls: 2, vars: 1, consts: [["title", "accessRestricted", "description", "accessRestrictedHelp"], ["hlmBtn", "", 3, "routerLink"], ["title", "pageNotFound", "description", "pageNotFoundHelp"]], template: function UnavailablePage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, UnavailablePage_Conditional_0_Template, 4, 4)(1, UnavailablePage_Conditional_1_Template, 4, 4);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.forbidden ? 0 : 1);
        } }, dependencies: [i1.PageHeader, i2.FormsModule, i3.RouterLink, i4.HlmButton, i5.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UnavailablePage, [{
        type: Component,
        args: [{
                selector: 'app-unavailable',
                imports: [WorkspaceUi],
                template: ` @if (forbidden) {
      <app-page-header title="accessRestricted" description="accessRestrictedHelp" /><a
        hlmBtn
        [routerLink]="auth.access() ? auth.landing() : '/login'"
        >{{ (auth.access() ? 'backToWorkspace' : 'signIn') | t }}</a
      >
    } @else {
      <app-page-header title="pageNotFound" description="pageNotFoundHelp" /><a
        hlmBtn
        [routerLink]="auth.access() ? auth.landing() : '/login'"
        >{{ (auth.access() ? 'backToWorkspace' : 'signIn') | t }}</a
      >
    }`,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(UnavailablePage, { className: "UnavailablePage", filePath: "src/app/features/unavailable.ts", lineNumber: 22 }); })();
