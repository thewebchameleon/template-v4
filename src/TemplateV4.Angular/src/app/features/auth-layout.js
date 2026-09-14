import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide';
import { Translate } from '../core/i18n';
import { Preferences } from '../core/preferences';
import { PlatformAppearanceTheme } from '../core/platform-appearance';
import { LoginBackgroundArtwork } from '../shared/login-background';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class AuthLayout {
    appearance = inject(PlatformAppearanceTheme);
    static ɵfac = function AuthLayout_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthLayout)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AuthLayout, selectors: [["app-auth-layout"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideGalleryVerticalEnd })])], ngContentSelectors: _c0, decls: 14, vars: 4, consts: [[1, "auth-layout"], [1, "auth-main"], ["routerLink", "/", 1, "auth-brand"], [1, "auth-brand-mark"], ["name", "lucideGalleryVerticalEnd"], [1, "auth-content"], [1, "auth-form"], [1, "auth-preferences"], [1, "auth-artwork"], [3, "value"]], template: function AuthLayout_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "a", 2)(3, "span", 3);
            i0.ɵɵelement(4, "ng-icon", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "t");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 5)(8, "div", 6);
            i0.ɵɵprojection(9);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "footer", 7);
            i0.ɵɵelement(11, "app-preferences");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "div", 8);
            i0.ɵɵelement(13, "app-login-background", 9);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 2, "appBrand"), " ");
            i0.ɵɵadvance(8);
            i0.ɵɵproperty("value", ctx.appearance.loginBackground());
        } }, dependencies: [RouterLink, NgIcon, Preferences, LoginBackgroundArtwork, Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthLayout, [{
        type: Component,
        args: [{
                selector: 'app-auth-layout',
                imports: [RouterLink, NgIcon, Translate, Preferences, LoginBackgroundArtwork],
                providers: [provideIcons({ lucideGalleryVerticalEnd })],
                template: `
    <div class="auth-layout">
      <div class="auth-main">
        <a routerLink="/" class="auth-brand">
          <span class="auth-brand-mark"><ng-icon name="lucideGalleryVerticalEnd" /></span>
          {{ 'appBrand' | t }}
        </a>
        <div class="auth-content">
          <div class="auth-form"><ng-content /></div>
        </div>
        <footer class="auth-preferences"><app-preferences /></footer>
      </div>
      <div class="auth-artwork">
        <app-login-background [value]="appearance.loginBackground()" />
      </div>
    </div>
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AuthLayout, { className: "AuthLayout", filePath: "src/app/features/auth-layout.ts", lineNumber: 32 }); })();
