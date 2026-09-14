import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarGroupLabel {
    constructor() {
        classes(() => 'text-sidebar-foreground/70 ring-sidebar-ring h-8 rounded-md px-2 text-xs font-semibold tracking-[0.12em] uppercase transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>ng-icon]:text-[length:--spacing(4)] flex shrink-0 items-center outline-hidden [&>ng-icon]:shrink-0');
    }
    static ɵfac = function HlmSidebarGroupLabel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarGroupLabel)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarGroupLabel, selectors: [["div", "hlmSidebarGroupLabel", ""], ["button", "hlmSidebarGroupLabel", ""]], hostAttrs: ["data-slot", "sidebar-group-label", "data-sidebar", "group-label"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarGroupLabel, [{
        type: Directive,
        args: [{
                selector: 'div[hlmSidebarGroupLabel], button[hlmSidebarGroupLabel]',
                host: {
                    'data-slot': 'sidebar-group-label',
                    'data-sidebar': 'group-label',
                },
            }]
    }], () => [], null); })();
