import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDrawerFooter {
    constructor() {
        classes(() => 'gap-2 p-4 mt-auto flex flex-col group-data-[vaul-drawer-direction=right]/drawer-content:rounded-(--panel-content-radius) group-data-[vaul-drawer-direction=right]/drawer-content:rounded-t-none group-data-[vaul-drawer-direction=right]/drawer-content:bg-card group-data-[vaul-drawer-direction=right]/drawer-content:px-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:py-4 group-data-[vaul-drawer-direction=right]/drawer-content:shadow-xs group-data-[vaul-drawer-direction=right]/drawer-content:ring-1 group-data-[vaul-drawer-direction=right]/drawer-content:ring-foreground/10 group-data-[vaul-drawer-direction=right]/drawer-content:-mt-px');
    }
    static ɵfac = function HlmDrawerFooter_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerFooter)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerFooter, selectors: [["", "hlmDrawerFooter", ""], ["hlm-drawer-footer"]], hostAttrs: ["data-slot", "drawer-footer"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerFooter, [{
        type: Directive,
        args: [{
                selector: '[hlmDrawerFooter],hlm-drawer-footer',
                host: { 'data-slot': 'drawer-footer' },
            }]
    }], () => [], null); })();
