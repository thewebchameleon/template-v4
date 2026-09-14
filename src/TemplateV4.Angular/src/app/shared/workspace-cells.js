import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Translate } from '../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
import * as i2 from "@spartan-ng/helm/avatar";
import * as i3 from "@spartan-ng/helm/badge";
const _forTrack0 = ($index, $item) => $item.label;
function RowActions_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 2);
    i0.ɵɵlistener("click", function RowActions_For_2_Template_button_click_0_listener() { const action_r2 = i0.ɵɵrestoreView(_r1).$implicit; return i0.ɵɵresetView(action_r2.run()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r2 = ctx.$implicit;
    i0.ɵɵproperty("variant", action_r2.destructive ? "destructive" : "secondary")("disabled", action_r2.disabled);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, action_r2.label), " ");
} }
function RecordIdentity_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", ctx_r0.link())("queryParams", ctx_r0.params())("queryParamsHandling", ctx_r0.merge() ? "merge" : "replace");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.label());
} }
function RecordIdentity_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.label(), " ");
} }
function RecordIdentity_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("max-w-72", ctx_r0.constrainWidth());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.description(), " ");
} }
export class RowActions {
    actions = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actions" }] : /* istanbul ignore next */ []));
    static ɵfac = function RowActions_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RowActions)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RowActions, selectors: [["app-row-actions"]], inputs: { actions: [1, "actions"] }, decls: 3, vars: 0, consts: [[1, "flex", "flex-wrap", "justify-end", "gap-1"], ["hlmBtn", "", "size", "sm", 3, "variant", "disabled"], ["hlmBtn", "", "size", "sm", 3, "click", "variant", "disabled"]], template: function RowActions_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵrepeaterCreate(1, RowActions_For_2_Template, 3, 5, "button", 1, _forTrack0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.actions());
        } }, dependencies: [i1.HlmButton, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RowActions, [{
        type: Component,
        args: [{
                selector: 'app-row-actions',
                imports: [HlmButtonImports, Translate],
                template: `<div class="flex flex-wrap justify-end gap-1">
    @for (action of actions(); track action.label) {
      <button
        hlmBtn
        [variant]="action.destructive ? 'destructive' : 'secondary'"
        size="sm"
        [disabled]="action.disabled"
        (click)="action.run()"
      >
        {{ action.label | t }}
      </button>
    }
  </div>`,
            }]
    }], null, { actions: [{ type: i0.Input, args: [{ isSignal: true, alias: "actions", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RowActions, { className: "RowActions", filePath: "src/app/shared/workspace-cells.ts", lineNumber: 31 }); })();
export class RecordIdentity {
    label = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    description = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "description" }] : /* istanbul ignore next */ []));
    constrainWidth = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "constrainWidth" }] : /* istanbul ignore next */ []));
    nowrap = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nowrap" }] : /* istanbul ignore next */ []));
    link = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "link" }] : /* istanbul ignore next */ []));
    params = input({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "params" }] : /* istanbul ignore next */ []));
    merge = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "merge" }] : /* istanbul ignore next */ []));
    static ɵfac = function RecordIdentity_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RecordIdentity)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RecordIdentity, selectors: [["app-record-identity"]], inputs: { label: [1, "label"], description: [1, "description"], constrainWidth: [1, "constrainWidth"], nowrap: [1, "nowrap"], link: [1, "link"], params: [1, "params"], merge: [1, "merge"] }, decls: 4, vars: 10, consts: [[1, "font-medium"], [1, "workspace-link", 3, "routerLink", "queryParams", "queryParamsHandling"], [1, "workspace-meta", "whitespace-normal", "break-words", 3, "max-w-72"], [1, "workspace-meta", "whitespace-normal", "break-words"]], template: function RecordIdentity_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, RecordIdentity_Conditional_1_Template, 2, 4, "a", 1)(2, RecordIdentity_Conditional_2_Template, 1, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(3, RecordIdentity_Conditional_3_Template, 2, 3, "div", 2);
        } if (rf & 2) {
            i0.ɵɵclassProp("whitespace-normal", !ctx.nowrap())("break-words", !ctx.nowrap())("whitespace-nowrap", ctx.nowrap())("max-w-72", ctx.constrainWidth());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.link() ? 1 : 2);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.description() ? 3 : -1);
        } }, dependencies: [RouterLink], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RecordIdentity, [{
        type: Component,
        args: [{
                selector: 'app-record-identity',
                imports: [RouterLink],
                template: `<div
      class="font-medium"
      [class.whitespace-normal]="!nowrap()"
      [class.break-words]="!nowrap()"
      [class.whitespace-nowrap]="nowrap()"
      [class.max-w-72]="constrainWidth()"
    >
      @if (link()) {
        <a
          class="workspace-link"
          [routerLink]="link()"
          [queryParams]="params()"
          [queryParamsHandling]="merge() ? 'merge' : 'replace'"
          >{{ label() }}</a
        >
      } @else {
        {{ label() }}
      }
    </div>
    @if (description()) {
      <div class="workspace-meta whitespace-normal break-words" [class.max-w-72]="constrainWidth()">
        {{ description() }}
      </div>
    }`,
            }]
    }], null, { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], description: [{ type: i0.Input, args: [{ isSignal: true, alias: "description", required: false }] }], constrainWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "constrainWidth", required: false }] }], nowrap: [{ type: i0.Input, args: [{ isSignal: true, alias: "nowrap", required: false }] }], link: [{ type: i0.Input, args: [{ isSignal: true, alias: "link", required: false }] }], params: [{ type: i0.Input, args: [{ isSignal: true, alias: "params", required: false }] }], merge: [{ type: i0.Input, args: [{ isSignal: true, alias: "merge", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RecordIdentity, { className: "RecordIdentity", filePath: "src/app/shared/workspace-cells.ts", lineNumber: 62 }); })();
export class RecordUserIdentity {
    username = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "username" }] : /* istanbul ignore next */ []));
    displayName = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "displayName" }] : /* istanbul ignore next */ []));
    initials() {
        return this.displayName()
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('');
    }
    static ɵfac = function RecordUserIdentity_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RecordUserIdentity)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RecordUserIdentity, selectors: [["app-record-user-identity"]], inputs: { username: [1, "username"], displayName: [1, "displayName"] }, decls: 9, vars: 3, consts: [[1, "flex", "min-w-48", "items-center", "gap-3"], ["hlmAvatarFallback", ""], [1, "min-w-0"], [1, "truncate", "font-medium"], [1, "workspace-meta", "truncate"]], template: function RecordUserIdentity_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "hlm-avatar")(2, "span", 1);
            i0.ɵɵtext(3);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "div", 2)(5, "div", 3);
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 4);
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.initials());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.username());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.displayName());
        } }, dependencies: [i2.HlmAvatar, i2.HlmAvatarFallback], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RecordUserIdentity, [{
        type: Component,
        args: [{
                selector: 'app-record-user-identity',
                imports: [HlmAvatarImports],
                template: `<div class="flex min-w-48 items-center gap-3">
    <hlm-avatar>
      <span hlmAvatarFallback>{{ initials() }}</span>
    </hlm-avatar>
    <div class="min-w-0">
      <div class="truncate font-medium">{{ username() }}</div>
      <div class="workspace-meta truncate">{{ displayName() }}</div>
    </div>
  </div>`,
            }]
    }], null, { username: [{ type: i0.Input, args: [{ isSignal: true, alias: "username", required: true }] }], displayName: [{ type: i0.Input, args: [{ isSignal: true, alias: "displayName", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RecordUserIdentity, { className: "RecordUserIdentity", filePath: "src/app/shared/workspace-cells.ts", lineNumber: 84 }); })();
export class RecordStatus {
    value = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    danger = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "danger" }] : /* istanbul ignore next */ []));
    static ɵfac = function RecordStatus_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RecordStatus)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RecordStatus, selectors: [["app-record-status"]], inputs: { value: [1, "value"], danger: [1, "danger"] }, decls: 3, vars: 4, consts: [["hlmBadge", "", 3, "variant"]], template: function RecordStatus_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "span", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "t");
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("variant", ctx.danger() ? "destructive" : "secondary");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, ctx.value()));
        } }, dependencies: [i3.HlmBadge, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RecordStatus, [{
        type: Component,
        args: [{
                selector: 'app-record-status',
                imports: [HlmBadgeImports, Translate],
                template: `<span hlmBadge [variant]="danger() ? 'destructive' : 'secondary'">{{
    value() | t
  }}</span>`,
            }]
    }], null, { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }], danger: [{ type: i0.Input, args: [{ isSignal: true, alias: "danger", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RecordStatus, { className: "RecordStatus", filePath: "src/app/shared/workspace-cells.ts", lineNumber: 103 }); })();
