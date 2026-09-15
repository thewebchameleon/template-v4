import { FOUNDATION_FEATURES } from '../../core/feature-extensions';
import { workspaceDestinations, destinationAvailable } from '../../core/destinations';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import { Features } from '../../core/features';
import { UnreadNotifications } from '../notifications/unread-notifications';
import { AdministrationNavigation } from '../../core/administration';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Translate } from '../../core/i18n';
import { PageHeader } from '../../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/card";
import * as i2 from "@spartan-ng/helm/button";
const _forTrack0 = ($index, $item) => $item.path;
function DashboardPage_For_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 2)(1, "div", 3)(2, "h2", 4);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 5);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 9)(9, "a", 11);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const action_r1 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, action_r1.label));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, action_r1.help ?? ""));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("routerLink", action_r1.path);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 8, action_r1.label));
} }
export class DashboardPage {
    extensions = inject(FOUNDATION_FEATURES);
    auth = inject(Auth);
    features = inject(Features);
    unread = inject(UnreadNotifications);
    administration = inject(AdministrationNavigation);
    actions = computed(() => [
        ...[
            ...Object.values(workspaceDestinations),
            ...this.extensions.flatMap((x) => x.destinations ?? []).filter((x) => !x.section),
        ].filter((item) => destinationAvailable(item, this.auth, this.features)),
        ...(this.administration.links().length
            ? [{ path: '/administration', label: 'administration', help: 'dashboardAdministrationHelp' }]
            : []),
    ], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actions" }] : /* istanbul ignore next */ []));
    static ɵfac = function DashboardPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DashboardPage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DashboardPage, selectors: [["app-dashboard"]], decls: 31, vars: 22, consts: [["eyebrow", "workspace", "title", "dashboard", "description", "dashboardActionsHelp"], [1, "grid", "gap-6", "md:grid-cols-2"], ["hlmCard", ""], ["hlmCardHeader", ""], ["hlmCardTitle", ""], ["hlmCardDescription", ""], ["hlmCardContent", "", 1, "flex", "flex-wrap", "gap-2"], ["hlmBtn", "", "routerLink", "/me"], ["hlmBtn", "", "variant", "outline", "routerLink", "/security"], ["hlmCardContent", ""], ["hlmBtn", "", "variant", "outline", "routerLink", "/notifications"], ["hlmBtn", "", "variant", "outline", 3, "routerLink"]], template: function DashboardPage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 0);
            i0.ɵɵelementStart(1, "div", 1)(2, "section", 2)(3, "div", 3)(4, "h2", 4);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p", 5);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "div", 6)(11, "a", 7);
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "a", 8);
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(17, "section", 2)(18, "div", 3)(19, "h2", 4);
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "p", 5);
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "t");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "div", 9)(26, "a", 10);
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵrepeaterCreate(29, DashboardPage_For_30_Template, 12, 10, "section", 2, _forTrack0);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 8, "account"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 10, "dashboardAccountHelp"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 12, "account"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 14, "security"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 16, "notificationCentre"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind1(24, 18, "dashboardUnread"), ": ", ctx.unread.count());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 20, "inbox"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.actions());
        } }, dependencies: [RouterLink, i1.HlmCard, i1.HlmCardContent, i1.HlmCardDescription, i1.HlmCardHeader, i1.HlmCardTitle, i2.HlmButton, PageHeader, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DashboardPage, [{
        type: Component,
        args: [{
                selector: 'app-dashboard',
                imports: [RouterLink, HlmCardImports, HlmButtonImports, Translate, PageHeader],
                template: `
    <app-page-header eyebrow="workspace" title="dashboard" description="dashboardActionsHelp" />
    <div class="grid gap-6 md:grid-cols-2">
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'account' | t }}</h2>
          <p hlmCardDescription>{{ 'dashboardAccountHelp' | t }}</p>
        </div>
        <div hlmCardContent class="flex flex-wrap gap-2">
          <a hlmBtn routerLink="/me">{{ 'account' | t }}</a>
          <a hlmBtn variant="outline" routerLink="/security">{{ 'security' | t }}</a>
        </div>
      </section>
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'notificationCentre' | t }}</h2>
          <p hlmCardDescription>{{ 'dashboardUnread' | t }}: {{ unread.count() }}</p>
        </div>
        <div hlmCardContent>
          <a hlmBtn variant="outline" routerLink="/notifications">{{ 'inbox' | t }}</a>
        </div>
      </section>
      @for (action of actions(); track action.path) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ action.label | t }}</h2>
            <p hlmCardDescription>{{ action.help ?? '' | t }}</p>
          </div>
          <div hlmCardContent>
            <a hlmBtn variant="outline" [routerLink]="action.path">{{ action.label | t }}</a>
          </div>
        </section>
      }
    </div>
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DashboardPage, { className: "DashboardPage", filePath: "src/app/features/dashboard.ts", lineNumber: 53 }); })();
