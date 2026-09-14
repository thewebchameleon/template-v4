import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { WorkspaceUi } from '../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "../shared/workspace";
import * as i2 from "@angular/forms";
import * as i3 from "@spartan-ng/helm/tabs";
import * as i4 from "../core/i18n";
export class NotificationCentrePage {
    router = inject(Router);
    tab = signal('inbox', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tab" }] : /* istanbul ignore next */ []));
    constructor() {
        this.syncTab();
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
            .subscribe(() => this.syncTab());
    }
    select(value) {
        if (value === 'inbox')
            void this.router.navigateByUrl('/notifications');
        if (value === 'preferences')
            void this.router.navigateByUrl('/notifications/preferences');
    }
    syncTab() {
        this.tab.set(this.router.url.split(/[?#]/, 1)[0] === '/notifications/preferences'
            ? 'preferences'
            : 'inbox');
    }
    static ɵfac = function NotificationCentrePage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NotificationCentrePage)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NotificationCentrePage, selectors: [["app-notification-centre"]], decls: 11, vars: 10, consts: [["title", "notificationCentre", "description", "notificationIntro"], [1, "mb-5", 3, "tabActivated", "tab"], ["hlmTabsTrigger", "inbox"], ["hlmTabsTrigger", "preferences"]], template: function NotificationCentrePage_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-page-header", 0);
            i0.ɵɵelementStart(1, "hlm-tabs", 1);
            i0.ɵɵlistener("tabActivated", function NotificationCentrePage_Template_hlm_tabs_tabActivated_1_listener($event) { return ctx.select($event); });
            i0.ɵɵelementStart(2, "hlm-tabs-list");
            i0.ɵɵpipe(3, "t");
            i0.ɵɵelementStart(4, "button", 2);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "button", 3);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "t");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelement(10, "router-outlet");
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("tab", ctx.tab());
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "notificationCentre"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "inbox"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 8, "notificationPreferences"));
        } }, dependencies: [i1.PageHeader, i2.FormsModule, i3.HlmTabs, i3.HlmTabsList, i3.HlmTabsTrigger, RouterOutlet, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NotificationCentrePage, [{
        type: Component,
        args: [{
                selector: 'app-notification-centre',
                imports: [WorkspaceUi, RouterOutlet],
                template: `
    <app-page-header title="notificationCentre" description="notificationIntro" />
    <hlm-tabs [tab]="tab()" (tabActivated)="select($event)" class="mb-5">
      <hlm-tabs-list [attr.aria-label]="'notificationCentre' | t">
        <button hlmTabsTrigger="inbox">{{ 'inbox' | t }}</button>
        <button hlmTabsTrigger="preferences">{{ 'notificationPreferences' | t }}</button>
      </hlm-tabs-list>
    </hlm-tabs>
    <router-outlet />
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NotificationCentrePage, { className: "NotificationCentrePage", filePath: "src/app/features/notification-centre.ts", lineNumber: 21 }); })();
