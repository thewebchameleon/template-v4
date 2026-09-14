import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n, Translate } from '../core/i18n';
import { Notifications } from '../core/notifications';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@spartan-ng/helm/button";
import * as i3 from "@spartan-ng/helm/field";
import * as i4 from "@spartan-ng/helm/tabs";
import * as i5 from "@spartan-ng/helm/switch";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/alert";
import * as i8 from "@spartan-ng/helm/spinner";
function AccountSecurityPanel_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "reauthenticationRequired"));
} }
function AccountSecurityPanel_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function AccountSecurityPanel_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 23)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 26);
    i0.ɵɵlistener("click", function AccountSecurityPanel_Conditional_48_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.load(true)); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "settingsConflict"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "discardDraft"), " ");
} }
function AccountSecurityPanel_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 26);
    i0.ɵɵlistener("click", function AccountSecurityPanel_Conditional_49_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r5); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.load(true)); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "loadFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "retry"), " ");
} }
export class AccountSecurityPanel {
    hasUnsavedChanges() {
        const saved = this.settings();
        return (!!saved &&
            (this.policy !== saved.mfaPolicy || this.registrationEnabled !== saved.registrationEnabled));
    }
    auth = inject(Auth);
    http = inject(HttpClient);
    runtime = inject(Runtime);
    i18n = inject(I18n);
    settings = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "settings" }] : /* istanbul ignore next */ []));
    settingsState = signal('loading', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "settingsState" }] : /* istanbul ignore next */ []));
    settingsConflict = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "settingsConflict" }] : /* istanbul ignore next */ []));
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    notifications = inject(Notifications);
    requireEveryone = false;
    requireAdministrators = true;
    get policy() {
        return this.requireEveryone
            ? 'Everyone'
            : this.requireAdministrators
                ? 'Administrators'
                : 'Optional';
    }
    set policy(value) {
        this.requireEveryone = value === 'Everyone';
        this.requireAdministrators = value !== 'Optional';
    }
    reauthenticationRequired = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reauthenticationRequired" }] : /* istanbul ignore next */ []));
    registrationEnabled = false;
    constructor() {
        void this.load();
    }
    async load(applyDraft = true) {
        this.settingsState.set('loading');
        try {
            const value = await firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/auth/settings/security`));
            this.settings.set(value);
            if (applyDraft) {
                this.policy = value.mfaPolicy ?? 'Administrators';
                this.registrationEnabled = value.registrationEnabled ?? false;
                this.settingsConflict.set(false);
            }
            this.settingsState.set('ready');
        }
        catch {
            this.settingsState.set('error');
        }
    }
    async save() {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            this.settings.set(await this.auth.action('settings/security', {
                mfaPolicy: this.policy,
                registrationEnabled: this.registrationEnabled,
                version: this.settings()?.version,
            }));
            this.settingsConflict.set(false);
            this.reauthenticationRequired.set(false);
            this.notifications.success('securitySaved');
            await this.auth.refresh();
        }
        catch (error) {
            if (error instanceof HttpErrorResponse &&
                error.error?.code === 'auth.reauthentication_required')
                this.reauthenticationRequired.set(true);
            if (error instanceof HttpErrorResponse && error.status === 409) {
                this.settingsConflict.set(true);
                await this.load(false);
            }
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function AccountSecurityPanel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AccountSecurityPanel)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AccountSecurityPanel, selectors: [["app-account-security-panel"]], decls: 50, vars: 45, consts: [["form", "ngForm"], ["hlmCard", "", 1, "max-w-(--form-content-width)"], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmAlert", "", "role", "status"], ["hlmCardContent", "", 1, "flex", "flex-col", "gap-5", 3, "ngSubmit"], ["hlmFieldSet", ""], ["hlmFieldLegend", ""], [3, "tabActivated", "tab"], [1, "flex-wrap"], ["hlmTabsTrigger", "Optional", 3, "disabled"], ["hlmTabsTrigger", "Everyone", 3, "disabled"], ["hlmFieldLabel", "", "for", "administrators-mfa-required", 1, "cursor-pointer", "has-[[data-disabled=true]]:cursor-not-allowed"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "administrators-mfa-required", "name", "administratorsMfaRequired", "aria-describedby", "administrators-mfa-help", 1, "self-center", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldContent", ""], ["hlmFieldTitle", ""], ["hlmFieldDescription", "", "id", "administrators-mfa-help"], ["hlmFieldLabel", "", "for", "registration-enabled", 1, "cursor-pointer", "has-[[data-disabled=true]]:cursor-not-allowed"], ["inputId", "registration-enabled", "name", "registrationEnabled", "aria-describedby", "registration-help", 1, "self-center", 3, "ngModelChange", "ngModel", "disabled"], ["hlmFieldDescription", "", "id", "registration-help"], ["hlmBtn", "", 3, "disabled"], ["hlmAlert", "", "role", "alert"], ["hlmAlert", "", "variant", "destructive", "role", "alert"], ["hlmAlertDescription", ""], ["hlmBtn", "", "type", "button", "variant", "outline", 3, "click"]], template: function AccountSecurityPanel_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "section", 1)(1, "div", 2)(2, "h2", 3);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p", 4);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(8, AccountSecurityPanel_Conditional_8_Template, 4, 3, "div", 5);
            i0.ɵɵelementStart(9, "form", 6, 0);
            i0.ɵɵlistener("ngSubmit", function AccountSecurityPanel_Template_form_ngSubmit_9_listener() { i0.ɵɵrestoreView(_r1); const form_r2 = i0.ɵɵreference(10); return i0.ɵɵresetView(form_r2.valid && ctx.save()); });
            i0.ɵɵelementStart(11, "fieldset", 7)(12, "legend", 8);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "hlm-tabs", 9);
            i0.ɵɵlistener("tabActivated", function AccountSecurityPanel_Template_hlm_tabs_tabActivated_15_listener($event) { return ctx.requireEveryone = $event === "Everyone"; });
            i0.ɵɵelementStart(16, "hlm-tabs-list", 10);
            i0.ɵɵpipe(17, "t");
            i0.ɵɵelementStart(18, "button", 11);
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "button", 12);
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "t");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(24, "label", 13)(25, "div", 14)(26, "hlm-switch", 15);
            i0.ɵɵlistener("ngModelChange", function AccountSecurityPanel_Template_hlm_switch_ngModelChange_26_listener($event) { return ctx.requireAdministrators = $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(27, "div", 16)(28, "span", 17);
            i0.ɵɵtext(29);
            i0.ɵɵpipe(30, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(31, "p", 18);
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "t");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(34, "label", 19)(35, "div", 14)(36, "hlm-switch", 20);
            i0.ɵɵtwoWayListener("ngModelChange", function AccountSecurityPanel_Template_hlm_switch_ngModelChange_36_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.registrationEnabled, $event) || (ctx.registrationEnabled = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(37, "div", 16)(38, "span", 17);
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "p", 21);
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "t");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(44, "button", 22);
            i0.ɵɵconditionalCreate(45, AccountSecurityPanel_Conditional_45_Template, 1, 0, "hlm-spinner");
            i0.ɵɵtext(46);
            i0.ɵɵpipe(47, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(48, AccountSecurityPanel_Conditional_48_Template, 7, 6, "div", 23);
            i0.ɵɵconditionalCreate(49, AccountSecurityPanel_Conditional_49_Template, 7, 6, "div", 24);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const form_r2 = i0.ɵɵreference(10);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 23, "security"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 25, "policyHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.reauthenticationRequired() ? 8 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 27, "mfaPolicy"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("tab", ctx.requireEveryone ? "Everyone" : "Optional");
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(17, 29, "mfaPolicy"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || ctx.settingsState() !== "ready");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 31, "policyOptional"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || ctx.settingsState() !== "ready");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(23, 33, "policyEveryone"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngModel", ctx.requireEveryone || ctx.requireAdministrators)("disabled", ctx.busy() || ctx.settingsState() !== "ready" || ctx.requireEveryone);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 35, "policyAdministrators"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(33, 37, "policyAdministratorsHelp"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.registrationEnabled);
            i0.ɵɵproperty("disabled", ctx.busy() || !ctx.settings());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 39, "registrationEnabled"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 41, "registrationHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.busy() || form_r2.invalid || !ctx.settings() || !ctx.hasUnsavedChanges());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.busy() ? 45 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(47, 43, "save"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.settingsConflict() ? 48 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.settingsState() === "error" ? 49 : -1);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.NgControlStatus, i1.NgControlStatusGroup, i1.NgModel, i1.NgForm, i2.HlmButton, i3.HlmField, i3.HlmFieldContent, i3.HlmFieldDescription, i3.HlmFieldLabel, i3.HlmFieldLegend, i3.HlmFieldSet, i3.HlmFieldTitle, i4.HlmTabs, i4.HlmTabsList, i4.HlmTabsTrigger, i5.HlmSwitch, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmAlert, i7.HlmAlertDescription, i8.HlmSpinner, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AccountSecurityPanel, [{
        type: Component,
        args: [{
                selector: 'app-account-security-panel',
                imports: [
                    FormsModule,
                    HlmButtonImports,
                    HlmFieldImports,
                    HlmTabsImports,
                    HlmSwitchImports,
                    HlmCardImports,
                    HlmAlertImports,
                    HlmSpinnerImports,
                    Translate,
                ],
                template: `
    <section hlmCard class="max-w-(--form-content-width)">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'security' | t }}</h2>
        <p hlmCardDescription>{{ 'policyHelp' | t }}</p>
      </div>
      @if (reauthenticationRequired()) {
        <div hlmAlert role="status">
          <p hlmAlertDescription>{{ 'reauthenticationRequired' | t }}</p>
        </div>
      }
      <form
        hlmCardContent
        #form="ngForm"
        (ngSubmit)="form.valid && save()"
        class="flex flex-col gap-5"
      >
        <fieldset hlmFieldSet>
          <legend hlmFieldLegend>{{ 'mfaPolicy' | t }}</legend>
          <hlm-tabs
            [tab]="requireEveryone ? 'Everyone' : 'Optional'"
            (tabActivated)="requireEveryone = $event === 'Everyone'"
          >
            <hlm-tabs-list [attr.aria-label]="'mfaPolicy' | t" class="flex-wrap">
              <button hlmTabsTrigger="Optional" [disabled]="busy() || settingsState() !== 'ready'">
                {{ 'policyOptional' | t }}
              </button>
              <button hlmTabsTrigger="Everyone" [disabled]="busy() || settingsState() !== 'ready'">
                {{ 'policyEveryone' | t }}
              </button>
            </hlm-tabs-list>
          </hlm-tabs>
        </fieldset>
        <label
          hlmFieldLabel
          for="administrators-mfa-required"
          class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
        >
          <div hlmField orientation="horizontal">
            <hlm-switch
              inputId="administrators-mfa-required"
              name="administratorsMfaRequired"
              aria-describedby="administrators-mfa-help"
              [ngModel]="requireEveryone || requireAdministrators"
              (ngModelChange)="requireAdministrators = $event"
              [disabled]="busy() || settingsState() !== 'ready' || requireEveryone"
              class="self-center"
            />
            <div hlmFieldContent>
              <span hlmFieldTitle>{{ 'policyAdministrators' | t }}</span>
              <p hlmFieldDescription id="administrators-mfa-help">
                {{ 'policyAdministratorsHelp' | t }}
              </p>
            </div>
          </div>
        </label>
        <label
          hlmFieldLabel
          for="registration-enabled"
          class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
        >
          <div hlmField orientation="horizontal">
            <hlm-switch
              inputId="registration-enabled"
              name="registrationEnabled"
              [(ngModel)]="registrationEnabled"
              aria-describedby="registration-help"
              [disabled]="busy() || !settings()"
              class="self-center"
            />
            <div hlmFieldContent>
              <span hlmFieldTitle>{{ 'registrationEnabled' | t }}</span>
              <p hlmFieldDescription id="registration-help">{{ 'registrationHelp' | t }}</p>
            </div>
          </div>
        </label>
        <button hlmBtn [disabled]="busy() || form.invalid || !settings() || !hasUnsavedChanges()">
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'save' | t }}
        </button>
        @if (settingsConflict()) {
          <div hlmAlert role="alert">
            <p hlmAlertDescription>{{ 'settingsConflict' | t }}</p>
            <button hlmBtn type="button" variant="outline" (click)="load(true)">
              {{ 'discardDraft' | t }}
            </button>
          </div>
        }
        @if (settingsState() === 'error') {
          <div hlmAlert variant="destructive" role="alert">
            <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
            <button hlmBtn type="button" variant="outline" (click)="load(true)">
              {{ 'retry' | t }}
            </button>
          </div>
        }
      </form>
    </section>
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AccountSecurityPanel, { className: "AccountSecurityPanel", filePath: "src/app/features/account-security.ts", lineNumber: 132 }); })();
