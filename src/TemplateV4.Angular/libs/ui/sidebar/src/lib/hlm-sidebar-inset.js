import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSidebarInset {
    constructor() {
        classes(() => 'bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2 md:peer-data-[variant=inset]:peer-data-[layout=rail-panel]:peer-data-[state=collapsed]:ms-0 relative flex w-full flex-1 flex-col');
    }
    static ɵfac = function HlmSidebarInset_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarInset)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarInset, selectors: [["main", "hlmSidebarInset", ""]], hostAttrs: ["data-slot", "sidebar-inset"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarInset, [{
        type: Directive,
        args: [{
                selector: 'main[hlmSidebarInset]',
                host: { 'data-slot': 'sidebar-inset' },
            }]
    }], () => [], null); })();
