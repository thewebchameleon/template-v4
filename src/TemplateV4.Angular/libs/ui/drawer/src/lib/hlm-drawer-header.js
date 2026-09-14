import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDrawerHeader {
    constructor() {
        classes(() => 'bg-muted border-border gap-0.5 border-b p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-start flex flex-col group-data-[vaul-drawer-direction=right]/drawer-content:border-b-0 group-data-[vaul-drawer-direction=right]/drawer-content:bg-transparent group-data-[vaul-drawer-direction=right]/drawer-content:ps-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pe-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-header-padding-block) group-data-[vaul-drawer-direction=right]/drawer-content:pb-(--panel-header-padding-block)');
    }
    static ɵfac = function HlmDrawerHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerHeader, selectors: [["", "hlmDrawerHeader", ""], ["hlm-drawer-header"]], hostAttrs: ["data-slot", "drawer-header"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmDrawerHeader],hlm-drawer-header',
                host: { 'data-slot': 'drawer-header' },
            }]
    }], () => [], null); })();
