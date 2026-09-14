import { Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class HlmBreadcrumb {
    ariaLabel = input('breadcrumb', { ...(ngDevMode ? { debugName: "ariaLabel" } : /* istanbul ignore next */ {}), alias: 'aria-label' });
    static ɵfac = function HlmBreadcrumb_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmBreadcrumb)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmBreadcrumb, selectors: [["", "hlmBreadcrumb", ""]], hostAttrs: ["data-slot", "breadcrumb", "role", "navigation"], hostVars: 1, hostBindings: function HlmBreadcrumb_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.ariaLabel());
        } }, inputs: { ariaLabel: [1, "aria-label", "ariaLabel"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmBreadcrumb, [{
        type: Directive,
        args: [{
                selector: '[hlmBreadcrumb]',
                host: {
                    'data-slot': 'breadcrumb',
                    role: 'navigation',
                    '[attr.aria-label]': 'ariaLabel()',
                },
            }]
    }], null, { ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-label", required: false }] }] }); })();
