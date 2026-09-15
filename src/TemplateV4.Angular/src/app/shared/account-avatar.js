import { Component, inject } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserRound } from '@ng-icons/lucide';
import { CurrentProfile } from '../features/identity/account/current-profile';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/avatar";
function AccountAvatar_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 1);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
export class AccountAvatar {
    profile = inject(CurrentProfile);
    static ɵfac = function AccountAvatar_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AccountAvatar)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AccountAvatar, selectors: [["app-account-avatar"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideUserRound })])], decls: 4, vars: 1, consts: [[1, "size-(--app-sidebar-rail-target-size)", "rounded-(--radius)", "after:rounded-(--radius)"], ["hlmAvatarImage", "", "alt", "", 3, "src"], ["hlmAvatarFallback", "", 1, "rounded-(--radius)", "bg-primary", "text-primary-foreground"], ["name", "lucideUserRound", "size", "1.5rem"]], template: function AccountAvatar_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "hlm-avatar", 0);
            i0.ɵɵconditionalCreate(1, AccountAvatar_Conditional_1_Template, 1, 1, "img", 1);
            i0.ɵɵelementStart(2, "span", 2);
            i0.ɵɵelement(3, "ng-icon", 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_0_0 = ctx.profile.value()?.avatarDataUrl) ? 1 : -1, tmp_0_0);
        } }, dependencies: [i1.HlmAvatar, i1.HlmAvatarFallback, i1.HlmAvatarImage, NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AccountAvatar, [{
        type: Component,
        args: [{
                selector: 'app-account-avatar',
                imports: [HlmAvatarImports, NgIcon],
                providers: [provideIcons({ lucideUserRound })],
                template: `<hlm-avatar
    class="size-(--app-sidebar-rail-target-size) rounded-(--radius) after:rounded-(--radius)"
  >
    @if (profile.value()?.avatarDataUrl; as photo) {
      <img hlmAvatarImage [src]="photo" alt="" />
    }
    <span hlmAvatarFallback class="rounded-(--radius) bg-primary text-primary-foreground"
      ><ng-icon name="lucideUserRound" size="1.5rem"
    /></span>
  </hlm-avatar>`,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AccountAvatar, { className: "AccountAvatar", filePath: "src/app/shared/account-avatar.ts", lineNumber: 22 }); })();
