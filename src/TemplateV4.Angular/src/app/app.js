import { FOUNDATION_FEATURES } from './core/feature-extensions';
import { workspaceDestinations, organizationDestinations, activeDestinationIndex, destinationAvailable, } from './core/destinations';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCommand, lucideContactRound, lucideReceipt, lucideCar, lucideLayoutDashboard, lucideUserRound, lucideUsersRound, lucideSettings, lucideSettings2, lucidePaintbrush, lucideMonitor, lucideLogOut, lucideBell, lucideFolderOpen, lucideHistory, lucideLifeBuoy, lucideActivity, lucideShieldCheck, lucideMoveHorizontal, } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { AccountAvatar } from './shared/account-avatar';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { AdministrationNavigation } from './core/administration';
import { Auth } from './core/auth';
import { I18n, Translate } from './core/i18n';
import { Theme } from './core/theme';
import { AppBreadcrumbs, Breadcrumbs } from './shared/breadcrumbs';
import { Confirmation } from './shared/confirmation';
import { Features } from './core/features';
import { UnreadNotifications } from './core/unread-notifications';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
import * as i2 from "@spartan-ng/helm/sonner";
import * as i3 from "@spartan-ng/helm/sidebar";
import * as i4 from "@spartan-ng/helm/separator";
import * as i5 from "@spartan-ng/helm/drawer";
const App_Conditional_3_Conditional_20_Defer_1_DepsFn = () => [/* @ts-ignore */
    import("./features/my-files-components").then(m => m.MyFilesTree)];
const App_Conditional_3_Conditional_29_Defer_2_DepsFn = () => [/* @ts-ignore */
    import("./features/notification-drawer").then(m => m.NotificationDrawer)];
const App_Conditional_3_hlm_drawer_content_35_Defer_10_DepsFn = () => [i1.HlmButton, i5.HlmDrawerBody, i5.HlmDrawerFooter, /* @ts-ignore */
    import("./core/preferences").then(m => m.Preferences), Translate];
const _c0 = a0 => ({ paths: a0, queryParams: "ignored", matrixParams: "ignored", fragment: "ignored" });
const _forTrack0 = ($index, $item) => $item.path;
const _forTrack1 = ($index, $item) => $item.label;
function App_Conditional_3_Conditional_3_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 37);
} }
function App_Conditional_3_Conditional_3_For_11_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 40);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵlistener("click", function App_Conditional_3_Conditional_3_For_11_Conditional_0_Template_a_click_0_listener($event) { i0.ɵɵrestoreView(_r3); const item_r4 = i0.ɵɵnextContext().$implicit; const ctx_r4 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r4.selectRailPanel($event, item_r4.path)); });
    i0.ɵɵelement(3, "ng-icon", 41);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("routerLink", item_r4.destination)("queryParams", item_r4.destinationQueryParams)("hlmTooltip", i0.ɵɵpipeBind1(1, 7, item_r4.label));
    i0.ɵɵattribute("data-active", ctx_r4.railPanelActive(item_r4.path))("aria-expanded", ctx_r4.railPanelActive(item_r4.path) && ctx_r4.sidebar.open())("aria-label", i0.ɵɵpipeBind1(2, 9, item_r4.label));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("name", item_r4.icon);
} }
function App_Conditional_3_Conditional_3_For_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 42);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵlistener("click", function App_Conditional_3_Conditional_3_For_11_Conditional_1_Template_a_click_0_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r4 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r4.selectRailDestination($event)); });
    i0.ɵɵelement(3, "ng-icon", 41);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r6 = i0.ɵɵnextContext();
    const item_r4 = ctx_r6.$implicit;
    const ɵ$index_30_r8 = ctx_r6.$index;
    const ctx_r4 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("routerLink", item_r4.path)("hlmTooltip", i0.ɵɵpipeBind1(1, 6, item_r4.label));
    i0.ɵɵattribute("aria-current", ctx_r4.activeRailIndex() === ɵ$index_30_r8 ? "page" : null)("data-active", ctx_r4.activeRailIndex() === ɵ$index_30_r8)("aria-label", i0.ɵɵpipeBind1(2, 8, item_r4.label));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("name", item_r4.icon);
} }
function App_Conditional_3_Conditional_3_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, App_Conditional_3_Conditional_3_For_11_Conditional_0_Template, 4, 11, "a", 39)(1, App_Conditional_3_Conditional_3_For_11_Conditional_1_Template, 4, 10, "a", 33);
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    i0.ɵɵconditional(item_r4.hasPanel ? 0 : 1);
} }
function App_Conditional_3_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 8)(1, "a", 33);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementStart(4, "span", 14);
    i0.ɵɵelement(5, "ng-icon", 34);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "nav", 35);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementStart(8, "div", 36);
    i0.ɵɵconditionalCreate(9, App_Conditional_3_Conditional_3_Conditional_9_Template, 1, 0, "span", 37);
    i0.ɵɵrepeaterCreate(10, App_Conditional_3_Conditional_3_For_11_Template, 2, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "a", 38);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵpipe(14, "t");
    i0.ɵɵlistener("click", function App_Conditional_3_Conditional_3_Template_a_click_12_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r4 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r4.selectAccountPanel($event)); });
    i0.ɵɵelement(15, "app-account-avatar");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", ctx_r4.auth.landing())("hlmTooltip", i0.ɵɵpipeBind1(2, 12, "appBrand"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 14, "appBrand"));
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(7, 16, "destinationNavigation"));
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("--%NS%rail-active-index", ctx_r4.activeRailIndex());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r4.activeRailIndex() >= 0 ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r4.railLinks());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", ctx_r4.accountMenuLinks()[0].path)("hlmTooltip", i0.ɵɵpipeBind1(13, 18, "accountSettings"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 20, "accountSettings"))("aria-expanded", ctx_r4.accountPanelActive() && ctx_r4.sidebar.open())("data-active", ctx_r4.accountPanelActive());
} }
function App_Conditional_3_Conditional_19_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 12)(1, "a", 43);
    i0.ɵɵelement(2, "ng-icon", 44);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r9 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", item_r9.path);
    i0.ɵɵadvance();
    i0.ɵɵproperty("name", item_r9.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, item_r9.label));
} }
function App_Conditional_3_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "nav", 18);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "ul", 11);
    i0.ɵɵrepeaterCreate(3, App_Conditional_3_Conditional_19_For_4_Template, 6, 5, "li", 12, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "destinationNavigation"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r4.railLinks());
} }
function App_Conditional_3_Conditional_20_Defer_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-my-files-tree");
} }
function App_Conditional_3_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomTemplate(0, App_Conditional_3_Conditional_20_Defer_0_Template, 1, 0);
    i0.ɵɵdefer(1, 0, App_Conditional_3_Conditional_20_Defer_1_DepsFn);
    i0.ɵɵdeferOnImmediate();
} }
function App_Conditional_3_Conditional_21_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 12);
    i0.ɵɵanimateEnter("sidebar-item-enter");
    i0.ɵɵelementStart(1, "a", 49, 1);
    i0.ɵɵelement(3, "ng-icon", 44);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r11 = ctx.$implicit;
    const ɵ$index_109_r12 = ctx.$index;
    const active_r13 = i0.ɵɵreference(2);
    i0.ɵɵstyleProp("--%NS%sidebar-item-index", ɵ$index_109_r12);
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", item_r11.path)("routerLinkActiveOptions", i0.ɵɵpureFunction1(9, _c0, item_r11.path === "/security" ? "exact" : "subset"))("isActive", active_r13.isActive);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("name", item_r11.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 7, item_r11.label));
} }
function App_Conditional_3_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nav", 19);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "div", 45);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "ul", 11);
    i0.ɵɵrepeaterCreate(6, App_Conditional_3_Conditional_21_For_7_Template, 7, 11, "li", 46, _forTrack0);
    i0.ɵɵelementStart(8, "li", 12);
    i0.ɵɵanimateEnter("sidebar-item-enter");
    i0.ɵɵelementStart(9, "button", 47);
    i0.ɵɵlistener("click", function App_Conditional_3_Conditional_21_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r10); const ctx_r4 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r4.openThemeDrawer()); });
    i0.ɵɵelement(10, "ng-icon", 48);
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 5, "accountNavigation"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, "accountNavigation"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r4.accountMenuLinks());
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("--%NS%sidebar-item-index", ctx_r4.accountMenuLinks().length);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 9, "themeAccessibility"));
} }
function App_Conditional_3_Conditional_22_For_3_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 12);
    i0.ɵɵanimateEnter("sidebar-item-enter");
    i0.ɵɵelementStart(1, "a", 52, 1);
    i0.ɵɵelement(3, "ng-icon", 44);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r14 = ctx.$implicit;
    const ɵ$index_143_r15 = ctx.$index;
    const active_r16 = i0.ɵɵreference(2);
    i0.ɵɵstyleProp("--%NS%sidebar-item-index", ɵ$index_143_r15);
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", item_r14.path)("isActive", active_r16.isActive);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("name", item_r14.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, item_r14.label));
} }
function App_Conditional_3_Conditional_22_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 50)(1, "div", 51);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul", 11);
    i0.ɵɵrepeaterCreate(5, App_Conditional_3_Conditional_22_For_3_For_6_Template, 7, 8, "li", 46, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const section_r17 = ctx.$implicit;
    i0.ɵɵattribute("aria-labelledby", "admin-section-" + section_r17.label);
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", "admin-section-" + section_r17.label);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 3, section_r17.label), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(section_r17.links);
} }
function App_Conditional_3_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "nav", 20);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵrepeaterCreate(2, App_Conditional_3_Conditional_22_For_3_Template, 7, 5, "div", 50, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "administration"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r4.administrationSections());
} }
function App_Conditional_3_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 21);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵelementStart(2, "span", 53);
    i0.ɵɵelement(3, "span", 54)(4, "ng-icon", 55);
    i0.ɵɵelementStart(5, "span", 56);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "span", 57);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "resizeNavigation"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "dragToResize"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 7, "resizeNavigationHelp"));
} }
function App_Conditional_3_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "button", 58);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelement(3, "hlm-separator", 59);
} if (rf & 2) {
    i0.ɵɵproperty("srOnlyText", i0.ɵɵpipeBind1(1, 2, "toggleNavigation"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "toggleNavigation"));
} }
function App_Conditional_3_Conditional_29_Defer_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-notification-drawer");
} }
function App_Conditional_3_Conditional_29_DeferPlaceholder_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 60);
} }
function App_Conditional_3_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomTemplate(0, App_Conditional_3_Conditional_29_Defer_0_Template, 1, 0)(1, App_Conditional_3_Conditional_29_DeferPlaceholder_1_Template, 1, 0);
    i0.ɵɵdefer(2, 0, App_Conditional_3_Conditional_29_Defer_2_DepsFn, null, 1);
    i0.ɵɵdeferOnImmediate();
} }
function App_Conditional_3_hlm_drawer_content_35_Defer_8_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 64);
    i0.ɵɵelement(1, "app-preferences", 65, 2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "hlm-drawer-footer")(4, "button", 66);
    i0.ɵɵlistener("click", function App_Conditional_3_hlm_drawer_content_35_Defer_8_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r18); const preferences_r19 = i0.ɵɵreference(2); return i0.ɵɵresetView(preferences_r19.reset()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const preferences_r19 = i0.ɵɵreference(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("expanded", true);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", preferences_r19.resetting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 3, "resetSettings"), " ");
} }
function App_Conditional_3_hlm_drawer_content_35_DeferPlaceholder_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 67);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "loading"));
} }
function App_Conditional_3_hlm_drawer_content_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-drawer-content", 61)(1, "hlm-drawer-header")(2, "h2", 62);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 63);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵdomTemplate(8, App_Conditional_3_hlm_drawer_content_35_Defer_8_Template, 7, 5)(9, App_Conditional_3_hlm_drawer_content_35_DeferPlaceholder_9_Template, 3, 3);
    i0.ɵɵdefer(10, 8, App_Conditional_3_hlm_drawer_content_35_Defer_10_DepsFn, null, 9);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, "themeDrawer"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "themeDrawerDescription"));
    i0.ɵɵadvance(4);
    i0.ɵɵdeferWhen(ctx_r4.themeDrawerOpen());
} }
function App_Conditional_3_ng_container_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function App_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "hlm-sidebar", 7);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵconditionalCreate(3, App_Conditional_3_Conditional_3_Template, 16, 22, "div", 8);
    i0.ɵɵelementStart(4, "div", 9)(5, "div", 10)(6, "ul", 11)(7, "li", 12)(8, "a", 13)(9, "span", 14);
    i0.ɵɵelement(10, "ng-icon", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 16)(12, "span");
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "small");
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵelementEnd()()()()()();
    i0.ɵɵelementStart(18, "div", 17);
    i0.ɵɵconditionalCreate(19, App_Conditional_3_Conditional_19_Template, 5, 3, "nav", 18);
    i0.ɵɵconditionalCreate(20, App_Conditional_3_Conditional_20_Template, 3, 0);
    i0.ɵɵconditionalCreate(21, App_Conditional_3_Conditional_21_Template, 14, 11, "nav", 19);
    i0.ɵɵconditionalCreate(22, App_Conditional_3_Conditional_22_Template, 4, 3, "nav", 20);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(23, App_Conditional_3_Conditional_23_Template, 11, 9, "button", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "main", 22)(25, "header", 23)(26, "div", 24);
    i0.ɵɵconditionalCreate(27, App_Conditional_3_Conditional_27_Template, 4, 6);
    i0.ɵɵelement(28, "app-breadcrumbs");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(29, App_Conditional_3_Conditional_29_Template, 4, 0);
    i0.ɵɵelementStart(30, "hlm-drawer", 25);
    i0.ɵɵlistener("stateChanged", function App_Conditional_3_Template_hlm_drawer_stateChanged_30_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.themeDrawerOpen.set($event === "open")); });
    i0.ɵɵelementStart(31, "button", 26);
    i0.ɵɵpipe(32, "t");
    i0.ɵɵpipe(33, "t");
    i0.ɵɵelement(34, "ng-icon", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(35, App_Conditional_3_hlm_drawer_content_35_Template, 12, 7, "hlm-drawer-content", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 29);
    i0.ɵɵlistener("click", function App_Conditional_3_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r1); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.logout()); });
    i0.ɵɵelement(37, "ng-icon", 30);
    i0.ɵɵtext(38);
    i0.ɵɵpipe(39, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "div", 31);
    i0.ɵɵtemplate(41, App_Conditional_3_ng_container_41_Template, 1, 0, "ng-container", 32);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    const page_r20 = i0.ɵɵreference(8);
    i0.ɵɵadvance();
    i0.ɵɵproperty("mobileTitle", i0.ɵɵpipeBind1(2, 21, "toggleNavigation"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r4.sidebar.isMobile() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵattribute("inert", !ctx_r4.sidebar.isMobile() && !ctx_r4.sidebar.open() ? "" : null)("aria-hidden", !ctx_r4.sidebar.isMobile() && !ctx_r4.sidebar.open() ? "true" : null);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("routerLink", ctx_r4.auth.landing());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 23, "appBrand"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 25, "workspace"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r4.sidebar.isMobile() ? 19 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r4.features.enabled("my-files") && (ctx_r4.sidebar.isMobile() || ctx_r4.myFilesPanelActive()) ? 20 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r4.sidebar.isMobile() || ctx_r4.accountPanelActive() ? 21 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r4.availableAdminLinks().length && (ctx_r4.sidebar.isMobile() || ctx_r4.administrationPanelActive()) ? 22 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r4.hasSecondaryNavigation() ? 23 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r4.sidebar.isMobile() || ctx_r4.hasSecondaryNavigation() ? 27 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r4.auth.access()?.setupRequired ? 29 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("state", ctx_r4.themeDrawerOpen() ? "open" : "closed");
    i0.ɵɵadvance();
    i0.ɵɵproperty("hlmTooltip", i0.ɵɵpipeBind1(32, 27, "themeDrawer"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(33, 29, "openThemeDrawer"));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(39, 31, "signOut"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("app-content-enter-alternate", ctx_r4.alternatePageEntrance());
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", page_r20);
} }
function App_Conditional_4_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function App_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "main", 5);
    i0.ɵɵtemplate(1, App_Conditional_4_ng_container_1_Template, 1, 0, "ng-container", 32);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const page_r20 = i0.ɵɵreference(8);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", page_r20);
} }
function App_ng_template_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "router-outlet");
} }
export class App {
    extensions = inject(FOUNDATION_FEATURES);
    themeDrawerOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "themeDrawerOpen" }] : /* istanbul ignore next */ []));
    accountMenuLinks = computed(() => [
        { path: '/me', label: 'accountMenuProfile', icon: 'lucideUserRound', requiresMfa: true },
        { path: '/security', label: 'security', icon: 'lucideShieldCheck' },
        {
            path: '/security/sessions',
            label: 'accountMenuSessions',
            icon: 'lucideMonitor',
            requiresMfa: true,
        },
        {
            path: '/notifications',
            label: 'notificationCentre',
            icon: 'lucideBell',
            requiresMfa: true,
        },
        { path: '/privacy', label: 'privacyAndData', icon: 'lucideShieldCheck', requiresMfa: true },
    ].filter((item) => !item.requiresMfa || !this.auth.access()?.setupRequired), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accountMenuLinks" }] : /* istanbul ignore next */ []));
    openThemeDrawer() {
        this.sidebar.setOpenMobile(false);
        // Let the mobile sheet restore focus before opening the drawer focus trap.
        setTimeout(() => this.themeDrawerOpen.set(true));
    }
    features = inject(Features);
    unread = inject(UnreadNotifications);
    auth = inject(Auth);
    theme = inject(Theme);
    sidebar = inject(HlmSidebarService);
    router = inject(Router);
    navigationEnd = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd)));
    breadcrumbs = inject(Breadcrumbs);
    i18n = inject(I18n);
    dashboardLink = {
        path: '/dashboard',
        label: 'dashboard',
        icon: 'lucideLayoutDashboard',
        requiresMfa: true,
    };
    selectedPanel = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedPanel" }] : /* istanbul ignore next */ []));
    accountPanelActive = computed(() => {
        this.navigationEnd();
        const selectedPanel = this.selectedPanel();
        return (selectedPanel === 'account' ||
            (selectedPanel === null &&
                this.accountMenuLinks().some((item) => this.router.isActive(item.path, {
                    paths: 'subset',
                    queryParams: 'ignored',
                    matrixParams: 'ignored',
                    fragment: 'ignored',
                }))));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accountPanelActive" }] : /* istanbul ignore next */ []));
    selectAccountPanel(event) {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
            return;
        this.selectedPanel.set('account');
        this.sidebar.setPanelAvailable(true);
        this.sidebar.openPanel();
    }
    administration = inject(AdministrationNavigation);
    availableAdminLinks = this.administration.links;
    administrationSections = computed(() => [
        {
            label: 'administration',
            links: this.availableAdminLinks().filter((item) => item.section === 'administration'),
        },
        {
            label: 'modules',
            links: this.availableAdminLinks().filter((item) => item.section === 'modules'),
        },
    ].filter((section) => section.links.length), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "administrationSections" }] : /* istanbul ignore next */ []));
    previousPath = '';
    alternatePageEntrance = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "alternatePageEntrance" }] : /* istanbul ignore next */ []));
    administrationActive = computed(() => {
        this.navigationEnd();
        return this.router.isActive('/administration', {
            paths: 'subset',
            queryParams: 'ignored',
            matrixParams: 'ignored',
            fragment: 'ignored',
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "administrationActive" }] : /* istanbul ignore next */ []));
    administrationPanelActive = computed(() => {
        const selectedPanel = this.selectedPanel();
        return (selectedPanel === '/administration' || (selectedPanel === null && this.administrationActive()));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "administrationPanelActive" }] : /* istanbul ignore next */ []));
    organizationRailLinks = computed(() => {
        this.navigationEnd();
        let route = this.router.routerState.snapshot.root.firstChild;
        let organization = null;
        while (route) {
            if (route.routeConfig?.path?.startsWith('organizations/:id')) {
                organization = route.paramMap.get('id');
                break;
            }
            route = route.firstChild;
        }
        if (!organization)
            return [];
        const prefix = `/organizations/${encodeURIComponent(organization)}/`;
        return [
            ...organizationDestinations,
            ...this.extensions.flatMap((feature) => feature.organizationDestinations ?? []),
        ].map((item) => ({
            ...item,
            path: prefix + item.path,
            activePath: prefix + (item.activePath ?? item.path),
            hasPanel: false,
        }));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "organizationRailLinks" }] : /* istanbul ignore next */ []));
    railLinks = computed(() => [
        ...(!this.auth.access()?.setupRequired
            ? [
                {
                    ...this.dashboardLink,
                    hasPanel: false,
                    destination: this.dashboardLink.path,
                    destinationQueryParams: null,
                },
            ]
            : []),
        ...[
            ...Object.values(workspaceDestinations),
            ...this.organizationRailLinks(),
            ...this.extensions.flatMap((x) => x.destinations ?? []).filter((x) => !x.section),
        ]
            .filter((item) => destinationAvailable(item, this.auth, this.features))
            .map((item) => ({
            ...item,
            destination: item.path,
            destinationQueryParams: item.capability === 'my-files' ? { group: 'my-files' } : null,
        })),
        ...(this.availableAdminLinks().length
            ? [
                {
                    path: '/administration',
                    label: 'administration',
                    icon: 'lucideSettings',
                    hasPanel: true,
                    destination: this.administrationSections()[0]?.links[0]?.path ?? '/administration',
                    destinationQueryParams: null,
                },
            ]
            : []),
    ], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "railLinks" }] : /* istanbul ignore next */ []));
    activeRailIndex = computed(() => {
        this.navigationEnd();
        if (this.accountPanelActive())
            return -1;
        const selectedPanel = this.selectedPanel();
        if (selectedPanel)
            return this.railLinks().findIndex((item) => item.path === selectedPanel);
        return activeDestinationIndex(this.railLinks(), this.router.url.split(/[?#]/)[0]);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeRailIndex" }] : /* istanbul ignore next */ []));
    myFilesPanelActive = computed(() => this.railPanelActive('/my-files'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "myFilesPanelActive" }] : /* istanbul ignore next */ []));
    hasSecondaryNavigation = computed(() => this.accountPanelActive() || this.administrationPanelActive() || this.myFilesPanelActive(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasSecondaryNavigation" }] : /* istanbul ignore next */ []));
    railPanelActive(path) {
        this.navigationEnd();
        const selectedPanel = this.selectedPanel();
        return (selectedPanel === path ||
            (selectedPanel === null &&
                this.router.isActive(path, {
                    paths: 'subset',
                    queryParams: 'ignored',
                    matrixParams: 'ignored',
                    fragment: 'ignored',
                })));
    }
    routeDestination(path) {
        if (this.accountMenuLinks().some((item) => path === item.path || path.startsWith(`${item.path}/`)))
            return 'account';
        return this.railLinks()[activeDestinationIndex(this.railLinks(), path)]?.path ?? path;
    }
    selectRailPanel(event, path) {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
            return;
        this.selectedPanel.set(path);
        this.sidebar.setPanelAvailable(true);
        this.sidebar.openPanel();
    }
    selectRailDestination(event) {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
            return;
        this.selectedPanel.set(null);
    }
    constructor() {
        effect(() => this.sidebar.setPanelAvailable(this.hasSecondaryNavigation()));
        const actor = computed(() => this.auth.access()?.setupRequired ? null : this.auth.access()?.userId, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "actor" }] : /* istanbul ignore next */ []));
        effect(() => {
            untracked(() => this.features.reset());
            if (actor())
                untracked(() => void this.features.load());
        });
        effect(() => {
            const current = this.breadcrumbs.items().at(-1);
            document.title = current
                ? `${this.i18n.text(current.label)} | ${this.i18n.text('appBrand')}`
                : this.i18n.text('appBrand');
        });
        this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (actor())
                    void this.features.load();
                const path = event.urlAfterRedirects.split(/[?#]/)[0];
                if (path !== this.previousPath) {
                    this.selectedPanel.set(null);
                    if (this.previousPath === '/dashboard' && path !== '/dashboard')
                        this.sidebar.openPanel();
                    if (this.routeDestination(path) !== this.routeDestination(this.previousPath)) {
                        this.alternatePageEntrance.update((alternate) => !alternate);
                    }
                    setTimeout(() => document.getElementById('main')?.focus());
                }
                this.previousPath = path;
            }
        });
    }
    async logout() {
        await this.auth.logout();
        this.sidebar.setOpenMobile(false);
        await this.router.navigateByUrl('/login');
    }
    static ɵfac = function App_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || App)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: App, selectors: [["app-root"]], features: [i0.ɵɵProvidersFeature([
                provideIcons({
                    lucideCommand,
                    lucideContactRound,
                    lucideReceipt,
                    lucideCar,
                    lucideLayoutDashboard,
                    lucideUserRound,
                    lucideUsersRound,
                    lucideSettings,
                    lucideSettings2,
                    lucidePaintbrush,
                    lucideMonitor,
                    lucideLogOut,
                    lucideBell,
                    lucideFolderOpen,
                    lucideHistory,
                    lucideLifeBuoy,
                    lucideActivity,
                    lucideShieldCheck,
                    lucideMoveHorizontal,
                }),
            ])], decls: 9, vars: 5, consts: [["page", ""], ["active", "routerLinkActive"], ["preferences", ""], ["href", "#main", 1, "skip-link"], ["hlmSidebarWrapper", "", "sidebarWidth", "var(--app-sidebar-total-width)", "sidebarWidthIcon", "var(--app-sidebar-rail-width)"], ["id", "main", "tabindex", "-1"], ["position", "top-center", "richColors", "", 3, "theme"], ["variant", "inset", "collapsible", "panel", "sidebarWidthMobile", "var(--app-sidebar-mobile-width)", 3, "mobileTitle"], ["data-slot", "sidebar-destination-rail", 1, "sidebar-destination-rail"], ["id", "sidebar-label-panel", 1, "sidebar-label-panel"], ["hlmSidebarHeader", ""], ["hlmSidebarMenu", ""], ["hlmSidebarMenuItem", ""], ["hlmSidebarMenuButton", "", "size", "lg", "closeMobileSidebarOnClick", "", 3, "routerLink"], [1, "brand-mark"], ["name", "lucideCommand"], [1, "brand-copy"], ["hlmSidebarContent", ""], ["hlmSidebarGroup", ""], ["hlmSidebarGroup", "", 1, "sidebar-submenu"], ["hlmSidebarGroup", "", 1, "sidebar-submenu", "gap-4"], ["hlmSidebarRail", "", "aria-controls", "sidebar-label-panel", "aria-describedby", "sidebar-resize-help"], ["hlmSidebarInset", "", "id", "main", "tabindex", "-1", 1, "min-w-0"], [1, "app-header"], [1, "flex", "min-w-0", "flex-1", "items-center", "gap-2"], ["direction", "right", 3, "stateChanged", "state"], ["hlmBtn", "", "hlmDrawerTrigger", "", "size", "icon", "variant", "ghost", "position", "bottom", 3, "hlmTooltip"], ["name", "lucidePaintbrush"], ["class", "overflow-hidden sm:max-w-md", 4, "hlmDrawerPortal"], ["hlmBtn", "", "type", "button", "variant", "destructive", 1, "ml-auto", "shrink-0", 3, "click"], ["name", "lucideLogOut", "aria-hidden", "true"], [1, "app-content"], [4, "ngTemplateOutlet"], ["hlmBtn", "", "variant", "ghost", "size", "icon", "position", "right", 3, "routerLink", "hlmTooltip"], ["name", "lucideCommand", "size", "1.5rem"], [1, "sidebar-rail-links"], [1, "sidebar-rail-items"], ["aria-hidden", "true", 1, "sidebar-rail-indicator"], ["hlmBtn", "", "variant", "ghost", "size", "icon", "position", "right", "aria-controls", "sidebar-label-panel", 3, "click", "routerLink", "hlmTooltip"], ["hlmBtn", "", "variant", "ghost", "size", "icon", "aria-controls", "sidebar-label-panel", "position", "right", 3, "routerLink", "queryParams", "hlmTooltip"], ["hlmBtn", "", "variant", "ghost", "size", "icon", "aria-controls", "sidebar-label-panel", "position", "right", 3, "click", "routerLink", "queryParams", "hlmTooltip"], ["size", "1.5rem", 3, "name"], ["hlmBtn", "", "variant", "ghost", "size", "icon", "position", "right", 3, "click", "routerLink", "hlmTooltip"], ["hlmSidebarMenuButton", "", "closeMobileSidebarOnClick", "", 3, "routerLink"], [3, "name"], ["hlmSidebarGroupLabel", ""], ["hlmSidebarMenuItem", "", 3, "--%NS%sidebar-item-index"], ["hlmSidebarMenuButton", "", "type", "button", 3, "click"], ["name", "lucideSettings2", "aria-hidden", "true"], ["hlmSidebarMenuButton", "", "routerLinkActive", "", "ariaCurrentWhenActive", "page", "closeMobileSidebarOnClick", "", 3, "routerLink", "routerLinkActiveOptions", "isActive"], ["role", "group"], ["hlmSidebarGroupLabel", "", 3, "id"], ["hlmSidebarMenuButton", "", "routerLinkActive", "", "ariaCurrentWhenActive", "page", "closeMobileSidebarOnClick", "", 3, "routerLink", "isActive"], ["aria-hidden", "true", 1, "sidebar-resize-affordance"], [1, "sidebar-resize-guide"], ["name", "lucideMoveHorizontal", "size", "2rem", 1, "sidebar-resize-icon"], [1, "sidebar-resize-tooltip"], ["id", "sidebar-resize-help", 1, "sr-only"], ["hlmSidebarTrigger", "", 3, "srOnlyText"], ["orientation", "vertical", 1, "header-separator", "data-vertical:self-center"], ["aria-hidden", "true", 1, "size-10", "shrink-0"], [1, "overflow-hidden", "sm:max-w-md"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], ["hlmDrawerBody", "", 1, "min-h-0", "flex-1", "overflow-y-auto"], [3, "expanded"], ["hlmBtn", "", "type", "button", "variant", "warning", 3, "click", "disabled"], ["hlmDrawerBody", "", "role", "status"]], template: function App_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "a", 3);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(3, App_Conditional_3_Template, 42, 33, "div", 4)(4, App_Conditional_4_Template, 2, 1, "main", 5);
            i0.ɵɵelement(5, "hlm-toaster", 6)(6, "app-confirmation");
            i0.ɵɵtemplate(7, App_ng_template_7_Template, 1, 0, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "skipContent"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.auth.access() ? 3 : 4);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("theme", ctx.theme.preference());
        } }, dependencies: [NgTemplateOutlet,
            RouterOutlet,
            RouterLink,
            RouterLinkActive,
            NgIcon, i1.HlmButton, i2.HlmToaster, i3.HlmSidebar, i3.HlmSidebarContent, i3.HlmSidebarGroup, i3.HlmSidebarGroupLabel, i3.HlmSidebarHeader, i3.HlmSidebarInset, i3.HlmSidebarMenu, i3.HlmSidebarMenuButton, i3.HlmSidebarMenuItem, i3.HlmSidebarRail, i3.HlmSidebarTrigger, i3.HlmSidebarWrapper, AccountAvatar, i4.HlmSeparator, AppBreadcrumbs, i5.HlmDrawer, i5.HlmDrawerBody, i5.HlmDrawerContent, i5.HlmDrawerDescription, i5.HlmDrawerHeader, i5.HlmDrawerPortal, i5.HlmDrawerTitle, i5.HlmDrawerTrigger, HlmTooltip,
            Confirmation,
            Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadataAsync(App, () => [/* @ts-ignore */
    import("./features/my-files-components").then(m => m.MyFilesTree), /* @ts-ignore */
    import("./features/notification-drawer").then(m => m.NotificationDrawer), /* @ts-ignore */
    import("./core/preferences").then(m => m.Preferences)], (MyFilesTree, NotificationDrawer, Preferences) => { i0.ɵsetClassMetadata(App, [{
        type: Component,
        args: [{
                selector: 'app-root',
                imports: [
                    NgTemplateOutlet,
                    RouterOutlet,
                    RouterLink,
                    RouterLinkActive,
                    NgIcon,
                    HlmButtonImports,
                    HlmToasterImports,
                    HlmSidebarImports,
                    AccountAvatar,
                    HlmSeparatorImports,
                    AppBreadcrumbs,
                    HlmDrawerImports,
                    HlmTooltip,
                    Preferences,
                    MyFilesTree,
                    Translate,
                    Confirmation,
                    NotificationDrawer,
                ],
                providers: [
                    provideIcons({
                        lucideCommand,
                        lucideContactRound,
                        lucideReceipt,
                        lucideCar,
                        lucideLayoutDashboard,
                        lucideUserRound,
                        lucideUsersRound,
                        lucideSettings,
                        lucideSettings2,
                        lucidePaintbrush,
                        lucideMonitor,
                        lucideLogOut,
                        lucideBell,
                        lucideFolderOpen,
                        lucideHistory,
                        lucideLifeBuoy,
                        lucideActivity,
                        lucideShieldCheck,
                        lucideMoveHorizontal,
                    }),
                ],
                template: `
    <a href="#main" class="skip-link">{{ 'skipContent' | t }}</a>
    @if (auth.access()) {
      <div
        hlmSidebarWrapper
        sidebarWidth="var(--app-sidebar-total-width)"
        sidebarWidthIcon="var(--app-sidebar-rail-width)"
      >
        <hlm-sidebar
          [mobileTitle]="'toggleNavigation' | t"
          variant="inset"
          collapsible="panel"
          sidebarWidthMobile="var(--app-sidebar-mobile-width)"
        >
          @if (!sidebar.isMobile()) {
            <div class="sidebar-destination-rail" data-slot="sidebar-destination-rail">
              <a
                hlmBtn
                variant="ghost"
                size="icon"
                [routerLink]="auth.landing()"
                [attr.aria-label]="'appBrand' | t"
                [hlmTooltip]="'appBrand' | t"
                position="right"
              >
                <span class="brand-mark"><ng-icon name="lucideCommand" size="1.5rem" /></span>
              </a>
              <nav class="sidebar-rail-links" [attr.aria-label]="'destinationNavigation' | t">
                <div class="sidebar-rail-items" [style.--rail-active-index]="activeRailIndex()">
                  @if (activeRailIndex() >= 0) {
                    <span class="sidebar-rail-indicator" aria-hidden="true"></span>
                  }
                  @for (item of railLinks(); track item.path; let index = $index) {
                    @if (item.hasPanel) {
                      <a
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        [routerLink]="item.destination"
                        [queryParams]="item.destinationQueryParams"
                        [attr.data-active]="railPanelActive(item.path)"
                        [attr.aria-expanded]="railPanelActive(item.path) && sidebar.open()"
                        aria-controls="sidebar-label-panel"
                        [attr.aria-label]="item.label | t"
                        [hlmTooltip]="item.label | t"
                        position="right"
                        (click)="selectRailPanel($event, item.path)"
                      >
                        <ng-icon [name]="item.icon" size="1.5rem" />
                      </a>
                    } @else {
                      <a
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        [routerLink]="item.path"
                        [attr.aria-current]="activeRailIndex() === index ? 'page' : null"
                        [attr.data-active]="activeRailIndex() === index"
                        [attr.aria-label]="item.label | t"
                        [hlmTooltip]="item.label | t"
                        position="right"
                        (click)="selectRailDestination($event)"
                      >
                        <ng-icon [name]="item.icon" size="1.5rem" />
                      </a>
                    }
                  }
                </div>
              </nav>
              <a
                hlmBtn
                variant="ghost"
                size="icon"
                [routerLink]="accountMenuLinks()[0].path"
                [attr.aria-label]="'accountSettings' | t"
                [hlmTooltip]="'accountSettings' | t"
                position="right"
                [attr.aria-expanded]="accountPanelActive() && sidebar.open()"
                aria-controls="sidebar-label-panel"
                [attr.data-active]="accountPanelActive()"
                (click)="selectAccountPanel($event)"
              >
                <app-account-avatar />
              </a>
            </div>
          }
          <div
            id="sidebar-label-panel"
            class="sidebar-label-panel"
            [attr.inert]="!sidebar.isMobile() && !sidebar.open() ? '' : null"
            [attr.aria-hidden]="!sidebar.isMobile() && !sidebar.open() ? 'true' : null"
          >
            <div hlmSidebarHeader>
              <ul hlmSidebarMenu>
                <li hlmSidebarMenuItem>
                  <a
                    hlmSidebarMenuButton
                    size="lg"
                    [routerLink]="auth.landing()"
                    closeMobileSidebarOnClick
                  >
                    <span class="brand-mark"><ng-icon name="lucideCommand" /></span>
                    <span class="brand-copy"
                      ><span>{{ 'appBrand' | t }}</span
                      ><small>{{ 'workspace' | t }}</small></span
                    >
                  </a>
                </li>
              </ul>
            </div>
            <div hlmSidebarContent>
              @if (sidebar.isMobile()) {
                <nav hlmSidebarGroup [attr.aria-label]="'destinationNavigation' | t">
                  <ul hlmSidebarMenu>
                    @for (item of railLinks(); track item.path) {
                      <li hlmSidebarMenuItem>
                        <a hlmSidebarMenuButton [routerLink]="item.path" closeMobileSidebarOnClick
                          ><ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span></a
                        >
                      </li>
                    }
                  </ul>
                </nav>
              }
              @if (features.enabled('my-files') && (sidebar.isMobile() || myFilesPanelActive())) {
                @defer (on immediate) {
                  <app-my-files-tree />
                }
              }
              @if (sidebar.isMobile() || accountPanelActive()) {
                <nav
                  hlmSidebarGroup
                  class="sidebar-submenu"
                  [attr.aria-label]="'accountNavigation' | t"
                >
                  <div hlmSidebarGroupLabel>{{ 'accountNavigation' | t }}</div>
                  <ul hlmSidebarMenu>
                    @for (item of accountMenuLinks(); track item.path; let itemIndex = $index) {
                      <li
                        hlmSidebarMenuItem
                        animate.enter="sidebar-item-enter"
                        [style.--sidebar-item-index]="itemIndex"
                      >
                        <a
                          hlmSidebarMenuButton
                          [routerLink]="item.path"
                          routerLinkActive
                          [routerLinkActiveOptions]="{
                            paths: item.path === '/security' ? 'exact' : 'subset',
                            queryParams: 'ignored',
                            matrixParams: 'ignored',
                            fragment: 'ignored',
                          }"
                          #active="routerLinkActive"
                          [isActive]="active.isActive"
                          ariaCurrentWhenActive="page"
                          closeMobileSidebarOnClick
                        >
                          <ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span>
                        </a>
                      </li>
                    }
                    <li
                      hlmSidebarMenuItem
                      animate.enter="sidebar-item-enter"
                      [style.--sidebar-item-index]="accountMenuLinks().length"
                    >
                      <button hlmSidebarMenuButton type="button" (click)="openThemeDrawer()">
                        <ng-icon name="lucideSettings2" aria-hidden="true" /><span>{{
                          'themeAccessibility' | t
                        }}</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              }
              @if (
                availableAdminLinks().length && (sidebar.isMobile() || administrationPanelActive())
              ) {
                <nav
                  hlmSidebarGroup
                  class="sidebar-submenu gap-4"
                  [attr.aria-label]="'administration' | t"
                >
                  @for (section of administrationSections(); track section.label) {
                    <div role="group" [attr.aria-labelledby]="'admin-section-' + section.label">
                      <div hlmSidebarGroupLabel [id]="'admin-section-' + section.label">
                        {{ section.label | t }}
                      </div>
                      <ul hlmSidebarMenu>
                        @for (item of section.links; track item.path; let itemIndex = $index) {
                          <li
                            hlmSidebarMenuItem
                            animate.enter="sidebar-item-enter"
                            [style.--sidebar-item-index]="itemIndex"
                          >
                            <a
                              hlmSidebarMenuButton
                              [routerLink]="item.path"
                              routerLinkActive
                              #active="routerLinkActive"
                              [isActive]="active.isActive"
                              ariaCurrentWhenActive="page"
                              closeMobileSidebarOnClick
                              ><ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span></a
                            >
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </nav>
              }
            </div>
          </div>
          @if (hasSecondaryNavigation()) {
            <button
              hlmSidebarRail
              aria-controls="sidebar-label-panel"
              [attr.aria-label]="'resizeNavigation' | t"
              aria-describedby="sidebar-resize-help"
            >
              <span class="sidebar-resize-affordance" aria-hidden="true">
                <span class="sidebar-resize-guide"></span>
                <ng-icon class="sidebar-resize-icon" name="lucideMoveHorizontal" size="2rem" />
                <span class="sidebar-resize-tooltip">{{ 'dragToResize' | t }}</span>
              </span>
              <span id="sidebar-resize-help" class="sr-only">{{ 'resizeNavigationHelp' | t }}</span>
            </button>
          }
        </hlm-sidebar>
        <main hlmSidebarInset id="main" tabindex="-1" class="min-w-0">
          <header class="app-header">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              @if (sidebar.isMobile() || hasSecondaryNavigation()) {
                <button
                  hlmSidebarTrigger
                  [srOnlyText]="'toggleNavigation' | t"
                  [attr.aria-label]="'toggleNavigation' | t"
                ></button>
                <hlm-separator
                  orientation="vertical"
                  class="header-separator data-vertical:self-center"
                />
              }
              <app-breadcrumbs />
            </div>
            @if (!auth.access()?.setupRequired) {
              @defer (on immediate) {
                <app-notification-drawer />
              } @placeholder {
                <span class="size-10 shrink-0" aria-hidden="true"></span>
              }
            }
            <hlm-drawer
              direction="right"
              [state]="themeDrawerOpen() ? 'open' : 'closed'"
              (stateChanged)="themeDrawerOpen.set($event === 'open')"
            >
              <button
                hlmBtn
                hlmDrawerTrigger
                size="icon"
                variant="ghost"
                [attr.aria-label]="'openThemeDrawer' | t"
                [hlmTooltip]="'themeDrawer' | t"
                position="bottom"
              >
                <ng-icon name="lucidePaintbrush" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'themeDrawer' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'themeDrawerDescription' | t }}</p>
                </hlm-drawer-header>
                @defer (when themeDrawerOpen()) {
                  <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                    <app-preferences #preferences [expanded]="true" />
                  </div>
                  <hlm-drawer-footer>
                    <button
                      hlmBtn
                      type="button"
                      variant="warning"
                      [disabled]="preferences.resetting()"
                      (click)="preferences.reset()"
                    >
                      {{ 'resetSettings' | t }}
                    </button>
                  </hlm-drawer-footer>
                } @placeholder {
                  <div hlmDrawerBody role="status">{{ 'loading' | t }}</div>
                }
              </hlm-drawer-content>
            </hlm-drawer>
            <button
              hlmBtn
              type="button"
              variant="destructive"
              class="ml-auto shrink-0"
              (click)="logout()"
            >
              <ng-icon name="lucideLogOut" aria-hidden="true" />{{ 'signOut' | t }}
            </button>
          </header>
          <div class="app-content" [class.app-content-enter-alternate]="alternatePageEntrance()">
            <ng-container *ngTemplateOutlet="page" />
          </div>
        </main>
      </div>
    } @else {
      <main id="main" tabindex="-1"><ng-container *ngTemplateOutlet="page" /></main>
    }
    <hlm-toaster [theme]="theme.preference()" position="top-center" richColors />
    <app-confirmation />
    <ng-template #page>
      <router-outlet />
    </ng-template>
  `,
            }]
    }], () => [], null); }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 418 }); })();
