import { Component, inject, signal } from '@angular/core';
import { Notifications } from './notifications';
import { WorkspaceApi } from '../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/card";
import * as i4 from "@spartan-ng/helm/field";
import * as i5 from "@spartan-ng/helm/spinner";
import * as i6 from "@spartan-ng/helm/switch";
import * as i7 from "../../core/i18n";
function NotificationPreferencesPage_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵelement(1, "hlm-spinner", 14);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind1(2, 1, "loading"));
} }
export class NotificationPreferencesPage {
    api = inject(WorkspaceApi);
    toast = inject(Notifications);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    constructor() {
        void this.load();
    }
    async load() {
        await this.data.load((signal) => this.api.get('notifications', { pageNumber: 1 }, signal));
    }
    loading() {
        return this.data.state() === 'loading' || this.data.refreshing();
    }
    async preference(enabled) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post('notifications/preferences', { optionalEmailEnabled: enabled });
            this.data.value.update((value) => value ? { ...value, optionalEmailEnabled: enabled } : value);
            this.toast.success('preferencesSaved');
        }
        catch {
            /* Request errors are already reported centrally. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function NotificationPreferencesPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationPreferencesPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationPreferencesPage, selectors: [["app-notification-preferences"]], decls: 26, vars: 26, consts: [["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [3, "retry", "state", "refreshError"], [1, "relative", "min-h-24", "overflow-hidden"], ["hlmField", "", "orientation", "horizontal"], ["inputId", "optional-email", 3, "checkedChange", "checked", "disabled"], ["hlmFieldLabel", "", "for", "optional-email"], ["hlmFieldDescription", ""], [1, "absolute", "inset-0", "flex", "items-center", "justify-center", "bg-background/30"], ["hlmCardFooter", ""], [1, "workspace-meta"], [3, "aria-label"]], template: function NotificationPreferencesPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "h2", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p", 3);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "div", 4)(9, "app-page-state", 5);
            i0.ɵɵlistener("retry", function NotificationPreferencesPage_Template_app_page_state_retry_9_listener() { return ctx.load(); });
            i0.ɵɵelementStart(10, "div", 6)(11, "div")(12, "div", 7)(13, "hlm-switch", 8);
            i0.ɵɵlistener("checkedChange", function NotificationPreferencesPage_Template_hlm_switch_checkedChange_13_listener($event) { return ctx.preference($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "div")(15, "label", 9);
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "p", 10);
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "t");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(21, NotificationPreferencesPage_Conditional_21_Template, 3, 3, "div", 11);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(22, "div", 12)(23, "p", 13);
            i0.ɵɵtext(24);
            i0.ɵɵpipe(25, "t");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 16, "notificationPreferences"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 18, "notificationPreferencesHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("state", ctx.data.state() === "loading" ? "ready" : ctx.data.state())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("h-24", ctx.loading());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("blur-sm", ctx.loading());
            i0.ɵɵattribute("inert", ctx.loading() ? "" : null);
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-busy", ctx.loading());
            i0.ɵɵadvance();
            i0.ɵɵproperty("checked", ctx.data.value()?.optionalEmailEnabled ?? false)("disabled", ctx.busy() || ctx.data.state() !== "ready");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 20, "optionalEmail"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 22, "optionalEmailHelp"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 21 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 24, "securityEmailRequired"));
        } }, dependencies: [i1.PageState, i2.FormsModule, i3.HlmCard, i3.HlmCardContent, i3.HlmCardDescription, i3.HlmCardFooter, i3.HlmCardHeader, i3.HlmCardTitle, i4.HlmField, i4.HlmFieldDescription, i4.HlmFieldLabel, i5.HlmSpinner, i6.HlmSwitch, i7.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationPreferencesPage, [{
        type: Component,
        args: [{
                selector: 'app-notification-preferences',
                imports: [WorkspaceUi],
                template: `
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'notificationPreferences' | t }}</h2>
        <p hlmCardDescription>{{ 'notificationPreferencesHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <app-page-state
          [state]="data.state() === 'loading' ? 'ready' : data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
        >
          <div class="relative min-h-24 overflow-hidden" [class.h-24]="loading()">
            <div [class.blur-sm]="loading()" [attr.inert]="loading() ? '' : null">
              <div hlmField orientation="horizontal" [attr.aria-busy]="loading()">
                <hlm-switch
                  inputId="optional-email"
                  [checked]="data.value()?.optionalEmailEnabled ?? false"
                  [disabled]="busy() || data.state() !== 'ready'"
                  (checkedChange)="preference($event)"
                />
                <div>
                  <label hlmFieldLabel for="optional-email">{{ 'optionalEmail' | t }}</label>
                  <p hlmFieldDescription>{{ 'optionalEmailHelp' | t }}</p>
                </div>
              </div>
            </div>
            @if (loading()) {
              <div class="absolute inset-0 flex items-center justify-center bg-background/30">
                <hlm-spinner [aria-label]="'loading' | t" />
              </div>
            }
          </div>
        </app-page-state>
      </div>
      <div hlmCardFooter>
        <p class="workspace-meta">{{ 'securityEmailRequired' | t }}</p>
      </div>
    </section>
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationPreferencesPage, { className: "NotificationPreferencesPage", filePath: "src/app/features/notification-preferences.ts", lineNumber: 51 }); })();
