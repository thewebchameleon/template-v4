import { booleanAttribute, Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDropdownMenuLabel {
    inset = input(false, { ...(ngDevMode ? { debugName: "inset" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => 'text-muted-foreground px-2 py-1.5 text-xs font-medium data-inset:ps-8 block');
    }
    static ɵfac = function HlmDropdownMenuLabel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuLabel)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuLabel, selectors: [["", "hlmDropdownMenuLabel", ""], ["hlm-dropdown-menu-label"]], hostAttrs: ["data-slot", "dropdown-menu-label"], hostVars: 1, hostBindings: function HlmDropdownMenuLabel_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-inset", ctx.inset() ? "" : null);
        } }, inputs: { inset: [1, "inset"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuLabel, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuLabel],hlm-dropdown-menu-label',
                host: {
                    'data-slot': 'dropdown-menu-label',
                    '[attr.data-inset]': 'inset() ? "" : null',
                },
            }]
    }], () => [], { inset: [{ type: i0.Input, args: [{ isSignal: true, alias: "inset", required: false }] }] }); })();
