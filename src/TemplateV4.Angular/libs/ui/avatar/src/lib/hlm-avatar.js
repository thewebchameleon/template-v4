import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BrnAvatar } from '@spartan-ng/brain/avatar';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
const _c0 = ["*", [["", "hlmAvatarImage", ""], ["", "brnAvatarImage", ""]], [["", "hlmAvatarFallback", ""], ["", "brnAvatarFallback", ""]]];
const _c1 = ["*", "[hlmAvatarImage],[brnAvatarImage]", "[hlmAvatarFallback],[brnAvatarFallback]"];
function HlmAvatar_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵprojection(0, 1);
} }
function HlmAvatar_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵprojection(0, 2);
} }
export class HlmAvatar extends BrnAvatar {
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    constructor() {
        super();
        classes(() => 'size-8 rounded-full after:rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6 group/avatar after:border-border relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten');
    }
    static ɵfac = function HlmAvatar_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAvatar)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmAvatar, selectors: [["hlm-avatar"]], hostAttrs: ["data-slot", "avatar"], hostVars: 1, hostBindings: function HlmAvatar_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-size", ctx.size());
        } }, inputs: { size: [1, "size"] }, features: [i0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c1, decls: 3, vars: 1, template: function HlmAvatar_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵconditionalCreate(0, HlmAvatar_Conditional_0_Template, 1, 0)(1, HlmAvatar_Conditional_1_Template, 1, 0);
            i0.ɵɵprojection(2);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx._image()?.canShow() ? 0 : 1);
        } }, encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAvatar, [{
        type: Component,
        args: [{
                selector: 'hlm-avatar',
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'avatar',
                    '[attr.data-size]': 'size()',
                },
                template: `
    @if (_image()?.canShow()) {
      <ng-content select="[hlmAvatarImage],[brnAvatarImage]" />
    } @else {
      <ng-content select="[hlmAvatarFallback],[brnAvatarFallback]" />
    }
    <ng-content />
  `,
            }]
    }], () => [], { size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmAvatar, { className: "HlmAvatar", filePath: "libs/ui/avatar/src/lib/hlm-avatar.ts", lineNumber: 21 }); })();
