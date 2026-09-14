import { Router } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n, Translate } from '../core/i18n';
import { Confirmations } from '../shared/confirmation';
import { Notifications } from '../core/notifications';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/spinner";
import * as i2 from "@spartan-ng/helm/badge";
import * as i3 from "@spartan-ng/helm/empty";
import * as i4 from "@spartan-ng/helm/card";
import * as i5 from "@spartan-ng/helm/button";
import * as i6 from "@spartan-ng/helm/alert";
const _forTrack0 = ($index, $item) => $item.id;
function SessionsPage_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 1)(1, "p", 3);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 4);
    i0.ɵɵlistener("click", function SessionsPage_Conditional_3_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.load()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "loadFailed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "retry"));
} }
function SessionsPage_Conditional_4_For_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 8);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "currentSession"));
} }
function SessionsPage_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 5)(1, "div", 6)(2, "div")(3, "h2", 7);
    i0.ɵɵtext(4);
    i0.ɵɵconditionalCreate(5, SessionsPage_Conditional_4_For_2_Conditional_5_Template, 3, 3, "span", 8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 9);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "t");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 10)(10, "button", 11);
    i0.ɵɵlistener("click", function SessionsPage_Conditional_4_For_2_Template_button_click_10_listener() { const session_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.revoke(session_r4.id, session_r4.current)); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const session_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", session_r4.device, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(session_r4.current ? 5 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3(" ", ctx_r1.i18n.date(session_r4.createdAt), " \u00B7 ", i0.ɵɵpipeBind1(8, 7, "expiresAt"), " ", ctx_r1.i18n.date(session_r4.expiresAt), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 9, session_r4.current ? "signOutThisDevice" : "signOutDevice"), " ");
} }
function SessionsPage_Conditional_4_ForEmpty_3_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-spinner");
} }
function SessionsPage_Conditional_4_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "div", 12)(2, "div", 13);
    i0.ɵɵconditionalCreate(3, SessionsPage_Conditional_4_ForEmpty_3_Conditional_3_Template, 1, 0, "hlm-spinner");
    i0.ɵɵelementStart(4, "p", 14);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.busy() ? 3 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 2, ctx_r1.busy() ? "loading" : "noSessions"));
} }
function SessionsPage_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 2);
    i0.ɵɵrepeaterCreate(1, SessionsPage_Conditional_4_For_2_Template, 13, 11, "li", 5, _forTrack0, false, SessionsPage_Conditional_4_ForEmpty_3_Template, 7, 4, "li");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.sessions());
} }
export class SessionsPage {
    router = inject(Router);
    confirm = inject(Confirmations);
    busy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    i18n = inject(I18n);
    auth = inject(Auth);
    http = inject(HttpClient);
    runtime = inject(Runtime);
    notifications = inject(Notifications);
    sessions = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sessions" }] : /* istanbul ignore next */ []));
    loadState = signal('loading', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadState" }] : /* istanbul ignore next */ []));
    constructor() {
        void this.load();
    }
    async load() {
        this.busy.set(true);
        this.loadState.set('loading');
        try {
            this.sessions.set(await firstValueFrom(this.http.get(`${this.runtime.apiUrl}/api/v1/auth/sessions`)));
            this.loadState.set('ready');
        }
        catch {
            this.loadState.set('error');
        }
        finally {
            this.busy.set(false);
        }
    }
    async revoke(id, current) {
        if (this.busy())
            return;
        if (current && !(await this.confirm.ask('signOutThisDevice', 'signOutDeviceHelp')))
            return;
        this.busy.set(true);
        try {
            await this.auth.revoke(id);
            this.notifications.success('sessionRevoked');
            if (current) {
                this.auth.access.set(null);
                await this.router.navigateByUrl('/login');
            }
            else
                await this.load();
        }
        catch {
            /* Central error UI. */
        }
        finally {
            this.busy.set(false);
        }
    }
    static ɵfac = function SessionsPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SessionsPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SessionsPage, selectors: [["app-sessions"]], decls: 5, vars: 4, consts: [[1, "page-title"], ["hlmAlert", "", "variant", "destructive", "role", "alert", 1, "mt-6"], [1, "mt-6", "flex", "flex-col", "gap-4"], ["hlmAlertDescription", ""], ["hlmBtn", "", "variant", "outline", 3, "click"], ["hlmCard", "", 1, "flex-row", "items-center", "justify-between", "flex-wrap"], ["hlmCardHeader", ""], ["hlmCardTitle", "", 1, "break-all"], ["hlmBadge", "", "variant", "secondary"], ["hlmCardDescription", ""], ["hlmCardFooter", ""], ["hlmBtn", "", "variant", "outline", 3, "click", "disabled"], ["hlmEmpty", "", "role", "status"], ["hlmEmptyHeader", ""], ["hlmEmptyTitle", ""]], template: function SessionsPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h1", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(3, SessionsPage_Conditional_3_Template, 7, 6, "div", 1)(4, SessionsPage_Conditional_4_Template, 4, 1, "ul", 2);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "sessions"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loadState() === "error" ? 3 : 4);
        } }, dependencies: [i1.HlmSpinner, i2.HlmBadge, i3.HlmEmpty, i3.HlmEmptyHeader, i3.HlmEmptyTitle, i4.HlmCard, i4.HlmCardDescription, i4.HlmCardFooter, i4.HlmCardHeader, i4.HlmCardTitle, i5.HlmButton, i6.HlmAlert, i6.HlmAlertDescription, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SessionsPage, [{
        type: Component,
        args: [{
                selector: 'app-sessions',
                imports: [
                    HlmSpinnerImports,
                    HlmBadgeImports,
                    HlmEmptyImports,
                    HlmCardImports,
                    HlmButtonImports,
                    HlmAlertImports,
                    Translate,
                ],
                template: `<h1 class="page-title">{{ 'sessions' | t }}</h1>

    @if (loadState() === 'error') {
      <div hlmAlert variant="destructive" class="mt-6" role="alert">
        <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>

        <button hlmBtn variant="outline" (click)="load()">{{ 'retry' | t }}</button>
      </div>
    } @else {
      <ul class="mt-6 flex flex-col gap-4">
        @for (session of sessions(); track session.id) {
          <li hlmCard class="flex-row items-center justify-between flex-wrap">
            <div hlmCardHeader>
              <div>
                <h2 hlmCardTitle class="break-all">
                  {{ session.device }}

                  @if (session.current) {
                    <span hlmBadge variant="secondary">{{ 'currentSession' | t }}</span>
                  }
                </h2>

                <p hlmCardDescription>
                  {{ i18n.date(session.createdAt) }} · {{ 'expiresAt' | t }}
                  {{ i18n.date(session.expiresAt) }}
                </p>
              </div>
            </div>

            <div hlmCardFooter>
              <button
                hlmBtn
                variant="outline"
                [disabled]="busy()"
                (click)="revoke(session.id, session.current)"
              >
                {{ (session.current ? 'signOutThisDevice' : 'signOutDevice') | t }}
              </button>
            </div>
          </li>
        } @empty {
          <li>
            <div hlmEmpty role="status">
              <div hlmEmptyHeader>
                @if (busy()) {
                  <hlm-spinner />
                }

                <p hlmEmptyTitle>{{ (busy() ? 'loading' : 'noSessions') | t }}</p>
              </div>
            </div>
          </li>
        }
      </ul>
    }`,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SessionsPage, { className: "SessionsPage", filePath: "src/app/features/sessions.ts", lineNumber: 118 }); })();
