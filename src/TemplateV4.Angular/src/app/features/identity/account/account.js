import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { AuthLayout } from '../authentication/auth-layout';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { Errors } from '../../../core/interceptors';
import { Auth } from '../../../core/auth';
import { Translate } from '../../../core/i18n';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/alert";
import * as i2 from "@spartan-ng/helm/spinner";
import * as i3 from "@angular/forms";
import * as i4 from "@spartan-ng/helm/button";
import * as i5 from "@spartan-ng/helm/input";
import * as i6 from "@spartan-ng/helm/field";
function AccountPage_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "h2", 6);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 7);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "a", 8);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "invalidLink"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 5, "invalidLinkHelp"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 7, "signIn"));
} }
function AccountPage_Conditional_7_Conditional_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.passwordErrors().join(" "));
} }
function AccountPage_Conditional_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 10)(1, "label", 12);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 13);
    i0.ɵɵtwoWayListener("ngModelChange", function AccountPage_Conditional_7_Conditional_2_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.password, $event) || (ctx_r2.password = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(5, "p", 14);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, AccountPage_Conditional_7_Conditional_2_Conditional_8_Template, 2, 1, "hlm-field-error", 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "password"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.password);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "passwordHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.passwordErrors().length ? 8 : -1);
} }
function AccountPage_Conditional_7_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function AccountPage_Conditional_7_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵconditionalCreate(1, AccountPage_Conditional_7_Conditional_3_Conditional_1_Template, 1, 0, "hlm-spinner");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const form_r2 = i0.ɵɵreference(1);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r2.busy() || form_r2.invalid);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.busy() ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 3, ctx_r2.kind === "Verification" || ctx_r2.kind === "EmailChange" ? "confirm" : "newPassword"), " ");
} }
function AccountPage_Conditional_7_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "p", 7);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "a", 17);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, ctx_r2.kind === "EmailChange" ? "emailChanged" : ctx_r2.kind === "Verification" ? "emailVerified" : "passwordSaved"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "signIn"));
} }
function AccountPage_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 9, 0);
    i0.ɵɵlistener("ngSubmit", function AccountPage_Conditional_7_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r1); const form_r2 = i0.ɵɵreference(1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(form_r2.valid && ctx_r2.submit()); });
    i0.ɵɵconditionalCreate(2, AccountPage_Conditional_7_Conditional_2_Template, 9, 8, "div", 10);
    i0.ɵɵconditionalCreate(3, AccountPage_Conditional_7_Conditional_3_Template, 4, 5, "button", 11);
    i0.ɵɵconditionalCreate(4, AccountPage_Conditional_7_Conditional_4_Template, 7, 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r2.done() && ctx_r2.kind !== "Verification" && ctx_r2.kind !== "EmailChange" ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r2.done() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.done() ? 4 : -1);
} }
export class AccountPage {
    auth = inject(Auth);
    errors = inject(Errors);
    parts = this.parseAction();
    parseAction() {
        try {
            const fragment = location.hash.slice(1);
            const firstSlash = fragment.indexOf('/');
            if (firstSlash < 0)
                return [];
            const kind = decodeURIComponent(fragment.slice(0, firstSlash));
            const rest = fragment.slice(firstSlash + 1);
            if (kind === 'EmailChange')
                return [kind, decodeURIComponent(rest)];
            const secondSlash = rest.indexOf('/');
            if (secondSlash < 0)
                return [];
            return [
                kind,
                decodeURIComponent(rest.slice(0, secondSlash)),
                decodeURIComponent(rest.slice(secondSlash + 1)),
            ];
        }
        catch {
            return [];
        }
    }
    kind = this.parts[0];
    invalid = signal(!((['Verification', 'PasswordReset'].includes(this.kind) &&
        this.parts.length === 3 &&
        !!this.parts[1] &&
        !!this.parts[2]) ||
        (this.kind === 'EmailChange' && this.parts.length === 2 && !!this.parts[1])), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
    password = '';
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    done = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "done" }] : /* istanbul ignore next */ []));
    passwordErrors = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "passwordErrors" }] : /* istanbul ignore next */ []));
    async submit() {
        if (this.busy() || this.invalid() || this.done())
            return;
        this.busy.set(true);
        this.passwordErrors.set([]);
        try {
            if (this.kind === 'EmailChange') {
                await this.auth.action('privacy/confirm-email', { challenge: this.parts[1] });
                this.auth.access.set(null);
            }
            else {
                await this.auth.action(this.kind === 'Verification' ? 'confirm-email' : 'reset-password', {
                    userId: this.parts[1],
                    token: this.parts[2],
                    password: this.password,
                });
            }
            history.replaceState(null, '', location.pathname);
            this.password = '';
            this.done.set(true);
        }
        catch (error) {
            if (error instanceof HttpErrorResponse &&
                ['auth.action_invalid', 'auth.challenge_expired'].includes(error.error?.code))
                this.invalid.set(true);
            if (error instanceof HttpErrorResponse)
                this.passwordErrors.set(error.error?.errors?.password ?? []);
            document.getElementById('password')?.focus();
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function AccountPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AccountPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AccountPage, selectors: [["app-account"]], decls: 8, vars: 4, consts: [["form", "ngForm"], ["hlmFieldGroup", ""], [1, "auth-heading"], [1, "auth-title"], ["hlmAlert", "", "role", "alert"], [1, "auth-fields"], ["hlmAlertTitle", ""], ["hlmAlertDescription", ""], ["hlmBtn", "", "variant", "outline", "routerLink", "/login"], [1, "auth-fields", 3, "ngSubmit"], ["hlmField", ""], ["hlmBtn", "", 3, "disabled"], ["hlmFieldLabel", "", "for", "password"], ["hlmInput", "", "id", "password", "name", "password", "type", "password", "autocomplete", "new-password", "minlength", "8", "aria-describedby", "password-help password-errors", "required", "", 3, "ngModelChange", "ngModel"], ["hlmFieldDescription", "", "id", "password-help"], ["forceShow", "", "id", "password-errors"], ["hlmAlert", "", "role", "status"], ["hlmBtn", "", "routerLink", "/login"]], template: function AccountPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-auth-layout")(1, "div", 1)(2, "div", 2)(3, "h1", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(6, AccountPage_Conditional_6_Template, 10, 9, "div", 4)(7, AccountPage_Conditional_7_Template, 5, 3, "form", 5);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 2, ctx.kind === "Verification" ? "verifyEmailTitle" : ctx.kind === "EmailChange" ? "changeEmail" : "newPassword"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.invalid() ? 6 : 7);
        } }, dependencies: [AuthLayout, i1.HlmAlert, i1.HlmAlertDescription, i1.HlmAlertTitle, i2.HlmSpinner, RouterLink,
            FormsModule, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.MinLengthValidator, i3.NgModel, i3.NgForm, i4.HlmButton, i5.HlmInput, i6.HlmField, i6.HlmFieldDescription, i6.HlmFieldError, i6.HlmFieldGroup, i6.HlmFieldLabel, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AccountPage, [{
        type: Component,
        args: [{
                selector: 'app-account',
                imports: [
                    AuthLayout,
                    HlmAlertImports,
                    HlmSpinnerImports,
                    RouterLink,
                    FormsModule,
                    HlmButtonImports,
                    HlmInputImports,
                    HlmFieldImports,
                    Translate,
                ],
                template: `<app-auth-layout
    ><div hlmFieldGroup>
      <div class="auth-heading">
        <h1 class="auth-title">
          {{
            (kind === 'Verification'
              ? 'verifyEmailTitle'
              : kind === 'EmailChange'
                ? 'changeEmail'
                : 'newPassword'
            ) | t
          }}
        </h1>
      </div>
      @if (invalid()) {
        <div hlmAlert role="alert">
          <h2 hlmAlertTitle>{{ 'invalidLink' | t }}</h2>
          <p hlmAlertDescription>{{ 'invalidLinkHelp' | t }}</p>
          <a hlmBtn variant="outline" routerLink="/login">{{ 'signIn' | t }}</a>
        </div>
      } @else {
        <form class="auth-fields" #form="ngForm" (ngSubmit)="form.valid && submit()">
          @if (!done() && kind !== 'Verification' && kind !== 'EmailChange') {
            <div hlmField>
              <label hlmFieldLabel for="password">{{ 'password' | t }}</label
              ><input
                hlmInput
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                minlength="8"
                aria-describedby="password-help password-errors"
                [(ngModel)]="password"
                required
              />
              <p hlmFieldDescription id="password-help">{{ 'passwordHelp' | t }}</p>
              @if (passwordErrors().length) {
                <hlm-field-error forceShow id="password-errors">{{
                  passwordErrors().join(' ')
                }}</hlm-field-error>
              }
            </div>
          }
          @if (!done()) {
            <button hlmBtn [disabled]="busy() || form.invalid">
              @if (busy()) {
                <hlm-spinner />
              }
              {{
                (kind === 'Verification' || kind === 'EmailChange' ? 'confirm' : 'newPassword') | t
              }}
            </button>
          }
          @if (done()) {
            <div hlmAlert role="status">
              <p hlmAlertDescription>
                {{
                  (kind === 'EmailChange'
                    ? 'emailChanged'
                    : kind === 'Verification'
                      ? 'emailVerified'
                      : 'passwordSaved'
                  ) | t
                }}
              </p>
            </div>
            <a hlmBtn routerLink="/login">{{ 'signIn' | t }}</a>
          }
        </form>
      }
    </div></app-auth-layout
  >`,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AccountPage, { className: "AccountPage", filePath: "src/app/features/account.ts", lineNumber: 101 }); })();
