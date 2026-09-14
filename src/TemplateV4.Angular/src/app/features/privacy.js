import { Component, inject, signal } from '@angular/core';
import { WorkspaceUi, workspaceIcons, Resource, Confirmations } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/router";
import * as i4 from "@ng-icons/core";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/card";
import * as i7 from "@spartan-ng/helm/badge";
import * as i8 from "../core/i18n";
function PrivacyPage_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "span", 22);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 12);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r1 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, request_r1.state));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.i18n.date(request_r1.requestedAt));
} }
function PrivacyPage_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 14);
    i0.ɵɵlistener("click", function PrivacyPage_Conditional_37_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.withdraw()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "withdrawRequest"), " ");
} }
function PrivacyPage_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 23);
    i0.ɵɵlistener("click", function PrivacyPage_Conditional_38_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.requestDeletion()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "requestDeletion"), " ");
} }
export class PrivacyPage {
    api = inject(WorkspaceApi);
    i18n = inject(I18n);
    toast = inject(Notifications);
    confirm = inject(Confirmations);
    data = new Resource();
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    constructor() {
        void this.load();
    }
    load() {
        return this.data.load((signal) => this.api.get('privacy', {}, signal));
    }
    async export() {
        this.busy.set(true);
        try {
            await this.api.download('privacy/export', 'account-data.json');
            this.toast.success('exportReady');
        }
        catch {
            /* Central error UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    async requestDeletion() {
        if (!(await this.confirm.ask('requestDeletion', 'requestDeletionConfirm')))
            return;
        await this.act('privacy/deletion', 'deletionRequested');
    }
    withdraw() {
        return this.act('privacy/withdraw', 'deletionWithdrawn');
    }
    async act(path, message) {
        if (this.busy())
            return;
        this.busy.set(true);
        try {
            await this.api.post(path);
            this.toast.success(message);
            await this.load();
        }
        catch {
            /* Central error UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function PrivacyPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PrivacyPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PrivacyPage, selectors: [["app-privacy"]], features: [i0.ɵɵProvidersFeature([workspaceIcons])], decls: 78, vars: 59, consts: [["title", "privacyAndData", "description", "privacyIntro"], [3, "retry", "state", "refreshing", "refreshError"], [1, "workspace-columns"], [1, "workspace-stack"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", ""], [1, "flex", "items-start", "gap-4"], ["aria-hidden", "true", 1, "workspace-icon"], ["name", "lucideArrowDownToLine"], [1, "workspace-meta"], ["hlmCardFooter", ""], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], [1, "flex", "flex-wrap", "items-center", "gap-3", "mb-4"], ["hlmBtn", "", "variant", "outline", 3, "disabled"], ["hlmBtn", "", "variant", "destructive", 3, "disabled"], [1, "workspace-detail-list"], [1, "workspace-meta", "mt-5"], ["routerLink", "/me", "hlmBtn", "", "variant", "outline"], ["name", "lucideArrowUpRight"], ["hlmBadge", "", "variant", "outline"], ["hlmBtn", "", "variant", "destructive", 3, "click", "disabled"]], template: function PrivacyPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 0);
            i0.ɵɵelementStart(1, "app-page-state", 1);
            i0.ɵɵlistener("retry", function PrivacyPage_Template_app_page_state_retry_1_listener() { return ctx.load(); });
            i0.ɵɵelementStart(2, "div", 2)(3, "div", 3)(4, "section", 4)(5, "div", 5)(6, "h2", 6);
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "p", 7);
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "div", 8)(13, "div", 9)(14, "span", 10);
            i0.ɵɵelement(15, "ng-icon", 11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "p", 12);
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(19, "div", 13)(20, "button", 14);
            i0.ɵɵlistener("click", function PrivacyPage_Template_button_click_20_listener() { return ctx.export(); });
            i0.ɵɵtext(21);
            i0.ɵɵpipe(22, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(23, "section", 4)(24, "div", 5)(25, "h2", 6);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "p", 7);
            i0.ɵɵtext(29);
            i0.ɵɵpipe(30, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(31, "div", 8);
            i0.ɵɵconditionalCreate(32, PrivacyPage_Conditional_32_Template, 6, 4, "div", 15);
            i0.ɵɵelementStart(33, "p", 12);
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(36, "div", 13);
            i0.ɵɵconditionalCreate(37, PrivacyPage_Conditional_37_Template, 3, 4, "button", 16)(38, PrivacyPage_Conditional_38_Template, 3, 4, "button", 17);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(39, "aside", 4)(40, "div", 5)(41, "h2", 6);
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(44, "p", 7);
            i0.ɵɵtext(45);
            i0.ɵɵpipe(46, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(47, "div", 8)(48, "dl", 18)(49, "div")(50, "dt");
            i0.ɵɵtext(51);
            i0.ɵɵpipe(52, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(53, "dd");
            i0.ɵɵtext(54);
            i0.ɵɵpipe(55, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(56, "div")(57, "dt");
            i0.ɵɵtext(58);
            i0.ɵɵpipe(59, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(60, "dd");
            i0.ɵɵtext(61);
            i0.ɵɵpipe(62, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(63, "div")(64, "dt");
            i0.ɵɵtext(65);
            i0.ɵɵpipe(66, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(67, "dd");
            i0.ɵɵtext(68);
            i0.ɵɵpipe(69, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(70, "p", 19);
            i0.ɵɵtext(71);
            i0.ɵɵpipe(72, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(73, "div", 13)(74, "a", 20);
            i0.ɵɵtext(75);
            i0.ɵɵpipe(76, "t");
            i0.ɵɵelement(77, "ng-icon", 21);
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            let tmp_10_0;
            i0.ɵɵadvance();
            i0.ɵɵproperty("state", ctx.data.state())("refreshing", ctx.data.refreshing())("refreshError", ctx.data.refreshError());
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 25, "exportData"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 27, "exportDataHelp"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 29, "exportContents"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.busy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 31, "downloadExport"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(27, 33, "deleteAccount"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 35, "deleteAccountHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_10_0 = ctx.data.value()?.request) ? 32 : -1, tmp_10_0);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 37, "deletionReviewHelp"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.data.value()?.request?.state === "Pending" ? 37 : 38);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 39, "dataRetention"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(46, 41, "dataRetentionHelp"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(52, 43, "deletedFiles"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate2("", ctx.data.value()?.deletedFileRetentionDays, " ", i0.ɵɵpipeBind1(55, 45, "days"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(59, 47, "notificationCentre"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate2("", ctx.data.value()?.notificationRetentionDays, " ", i0.ɵɵpipeBind1(62, 49, "days"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(66, 51, "auditHistory"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(69, 53, "auditRetained"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(72, 55, "retentionExplanation"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(76, 57, "account"));
        } }, dependencies: [i1.PageHeader, i1.PageState, i2.FormsModule, i3.RouterLink, i4.NgIcon, i5.HlmButton, i6.HlmCard, i6.HlmCardContent, i6.HlmCardDescription, i6.HlmCardFooter, i6.HlmCardHeader, i6.HlmCardTitle, i7.HlmBadge, i8.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PrivacyPage, [{
        type: Component,
        args: [{
                selector: 'app-privacy',
                imports: [WorkspaceUi],
                providers: [workspaceIcons],
                template: ` <app-page-header title="privacyAndData" description="privacyIntro" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
      ><div class="workspace-columns">
        <div class="workspace-stack">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'exportData' | t }}</h2>
              <p hlmCardDescription>{{ 'exportDataHelp' | t }}</p>
            </div>
            <div hlmCardContent>
              <div class="flex items-start gap-4">
                <span class="workspace-icon" aria-hidden="true"
                  ><ng-icon name="lucideArrowDownToLine"
                /></span>
                <p class="workspace-meta">{{ 'exportContents' | t }}</p>
              </div>
            </div>
            <div hlmCardFooter>
              <button hlmBtn variant="outline" [disabled]="busy()" (click)="export()">
                {{ 'downloadExport' | t }}
              </button>
            </div>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'deleteAccount' | t }}</h2>
              <p hlmCardDescription>{{ 'deleteAccountHelp' | t }}</p>
            </div>
            <div hlmCardContent>
              @if (data.value()?.request; as request) {
                <div class="flex flex-wrap items-center gap-3 mb-4">
                  <span hlmBadge variant="outline">{{ request.state | t }}</span
                  ><span class="workspace-meta">{{ i18n.date(request.requestedAt) }}</span>
                </div>
              }
              <p class="workspace-meta">{{ 'deletionReviewHelp' | t }}</p>
            </div>
            <div hlmCardFooter>
              @if (data.value()?.request?.state === 'Pending') {
                <button hlmBtn variant="outline" [disabled]="busy()" (click)="withdraw()">
                  {{ 'withdrawRequest' | t }}
                </button>
              } @else {
                <button
                  hlmBtn
                  variant="destructive"
                  [disabled]="busy()"
                  (click)="requestDeletion()"
                >
                  {{ 'requestDeletion' | t }}
                </button>
              }
            </div>
          </section>
        </div>
        <aside hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'dataRetention' | t }}</h2>
            <p hlmCardDescription>{{ 'dataRetentionHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            <dl class="workspace-detail-list">
              <div>
                <dt>{{ 'deletedFiles' | t }}</dt>
                <dd>{{ data.value()?.deletedFileRetentionDays }} {{ 'days' | t }}</dd>
              </div>
              <div>
                <dt>{{ 'notificationCentre' | t }}</dt>
                <dd>{{ data.value()?.notificationRetentionDays }} {{ 'days' | t }}</dd>
              </div>
              <div>
                <dt>{{ 'auditHistory' | t }}</dt>
                <dd>{{ 'auditRetained' | t }}</dd>
              </div>
            </dl>
            <p class="workspace-meta mt-5">{{ 'retentionExplanation' | t }}</p>
          </div>
          <div hlmCardFooter>
            <a routerLink="/me" hlmBtn variant="outline"
              >{{ 'account' | t }}<ng-icon name="lucideArrowUpRight"
            /></a>
          </div>
        </aside></div
    ></app-page-state>`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PrivacyPage, { className: "PrivacyPage", filePath: "src/app/features/privacy.ts", lineNumber: 100 }); })();
