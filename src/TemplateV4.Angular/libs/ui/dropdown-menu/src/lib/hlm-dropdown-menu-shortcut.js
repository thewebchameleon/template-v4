import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDropdownMenuShortcut {
    constructor() {
        classes(() => 'text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest');
    }
    static ɵfac = function HlmDropdownMenuShortcut_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuShortcut)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuShortcut, selectors: [["", "hlmDropdownMenuShortcut", ""], ["hlm-dropdown-menu-shortcut"]], hostAttrs: ["data-slot", "dropdown-menu-shortcut"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuShortcut, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuShortcut],hlm-dropdown-menu-shortcut',
                host: { 'data-slot': 'dropdown-menu-shortcut' },
            }]
    }], () => [], null); })();
