import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDropdownMenuSeparator {
    constructor() {
        classes(() => 'bg-border -mx-1 my-1 h-px block');
    }
    static ɵfac = function HlmDropdownMenuSeparator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuSeparator)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuSeparator, selectors: [["", "hlmDropdownMenuSeparator", ""], ["hlm-dropdown-menu-separator"]], hostAttrs: ["data-slot", "dropdown-menu-separator"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuSeparator, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuSeparator],hlm-dropdown-menu-separator',
                host: { 'data-slot': 'dropdown-menu-separator' },
            }]
    }], () => [], null); })();
