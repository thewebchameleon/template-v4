import { Component, Injectable, inject, signal } from '@angular/core';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { Translate } from '../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/alert-dialog";
function Confirmation_hlm_alert_dialog_content_1_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.confirm.current()?.detail);
} }
function Confirmation_hlm_alert_dialog_content_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-alert-dialog-content")(1, "hlm-alert-dialog-header")(2, "h2", 2);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 3);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵconditionalCreate(8, Confirmation_hlm_alert_dialog_content_1_Conditional_8_Template, 2, 1, "span", 4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "hlm-alert-dialog-footer")(10, "button", 5);
    i0.ɵɵlistener("click", function Confirmation_hlm_alert_dialog_content_1_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.confirm.finish(false)); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 6);
    i0.ɵɵlistener("click", function Confirmation_hlm_alert_dialog_content_1_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.confirm.finish(true)); });
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 6, ctx_r1.confirm.current()?.title ?? ""));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 8, ctx_r1.confirm.current()?.description ?? ""), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.confirm.current()?.detail ? 8 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 10, "cancel"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("variant", ctx_r1.confirm.current()?.destructive ? "destructive" : "default");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 12, ctx_r1.confirm.current()?.actionLabel ?? "confirm"), " ");
} }
export class Confirmations {
    current = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "current" }] : /* istanbul ignore next */ []));
    resolve = null;
    ask(title, description, detail = '', destructive = false, actionLabel = 'confirm') {
        this.finish(false);
        this.current.set({ title, description, detail, destructive, actionLabel });
        return new Promise((resolve) => (this.resolve = resolve));
    }
    finish(value) {
        const resolve = this.resolve;
        this.resolve = null;
        this.current.set(null);
        resolve?.(value);
    }
    static ɵfac = function Confirmations_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Confirmations)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Confirmations, factory: Confirmations.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Confirmations, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
export class Confirmation {
    confirm = inject(Confirmations);
    static ɵfac = function Confirmation_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Confirmation)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: Confirmation, selectors: [["app-confirmation"]], decls: 2, vars: 1, consts: [[3, "stateChanged", "state"], [4, "hlmAlertDialogPortal"], ["hlmAlertDialogTitle", ""], ["hlmAlertDialogDescription", ""], [1, "block", "break-words"], ["hlmAlertDialogCancel", "", 3, "click"], ["hlmAlertDialogAction", "", 3, "click", "variant"]], template: function Confirmation_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "hlm-alert-dialog", 0);
            i0.ɵɵlistener("stateChanged", function Confirmation_Template_hlm_alert_dialog_stateChanged_0_listener($event) { return $event === "closed" && ctx.confirm.finish(false); });
            i0.ɵɵtemplate(1, Confirmation_hlm_alert_dialog_content_1_Template, 16, 14, "hlm-alert-dialog-content", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("state", ctx.confirm.current() ? "open" : "closed");
        } }, dependencies: [i1.HlmAlertDialog, i1.HlmAlertDialogAction, i1.HlmAlertDialogCancel, i1.HlmAlertDialogContent, i1.HlmAlertDialogDescription, i1.HlmAlertDialogFooter, i1.HlmAlertDialogHeader, i1.HlmAlertDialogPortal, i1.HlmAlertDialogTitle, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Confirmation, [{
        type: Component,
        args: [{
                selector: 'app-confirmation',
                imports: [HlmAlertDialogImports, Translate],
                template: ` <hlm-alert-dialog
    [state]="confirm.current() ? 'open' : 'closed'"
    (stateChanged)="$event === 'closed' && confirm.finish(false)"
  >
    <hlm-alert-dialog-content *hlmAlertDialogPortal
      ><hlm-alert-dialog-header
        ><h2 hlmAlertDialogTitle>{{ confirm.current()?.title ?? '' | t }}</h2>
        <p hlmAlertDialogDescription>
          {{ confirm.current()?.description ?? '' | t }}
          @if (confirm.current()?.detail) {
            <span class="block break-words">{{ confirm.current()?.detail }}</span>
          }
        </p></hlm-alert-dialog-header
      ><hlm-alert-dialog-footer
        ><button hlmAlertDialogCancel (click)="confirm.finish(false)">{{ 'cancel' | t }}</button
        ><button
          hlmAlertDialogAction
          [variant]="confirm.current()?.destructive ? 'destructive' : 'default'"
          (click)="confirm.finish(true)"
        >
          {{ confirm.current()?.actionLabel ?? 'confirm' | t }}
        </button></hlm-alert-dialog-footer
      >
    </hlm-alert-dialog-content></hlm-alert-dialog
  >`,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(Confirmation, { className: "Confirmation", filePath: "src/app/shared/confirmation.ts", lineNumber: 62 }); })();
export const unsavedGuard = (component) => !component.hasUnsavedChanges() ||
    inject(Confirmations).ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges');
export function protectUnload(event, dirty) {
    if (dirty) {
        event.preventDefault();
        event.returnValue = '';
    }
}
