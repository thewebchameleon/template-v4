import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmDrawerBody {
    constructor() {
        classes(() => 'group-data-[vaul-drawer-direction=right]/drawer-content:rounded-(--panel-content-radius) group-data-[vaul-drawer-direction=right]/drawer-content:bg-card group-data-[vaul-drawer-direction=right]/drawer-content:px-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pb-(--card-spacing) group-data-[vaul-drawer-direction=right]/drawer-content:shadow-xs group-data-[vaul-drawer-direction=right]/drawer-content:ring-1 group-data-[vaul-drawer-direction=right]/drawer-content:ring-foreground/10 group-data-[vaul-drawer-direction=right]/drawer-content:[&:has(+_[data-slot=drawer-footer])]:rounded-b-none');
    }
    static ɵfac = function HlmDrawerBody_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerBody)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerBody, selectors: [["", "hlmDrawerBody", ""]], hostAttrs: ["data-slot", "drawer-body"], hostVars: 8, hostBindings: function HlmDrawerBody_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵstyleProp("--%NS%_viewport-padding-block-start", "var(--drawer-body-padding-block-start, 0px)")("--%NS%_viewport-padding-block-end", "var(--drawer-body-padding-block-end, 0px)")("--%NS%_viewport-padding-inline-start", "var(--drawer-body-padding-inline, 0px)")("--%NS%_viewport-padding-inline-end", "var(--drawer-body-padding-inline, 0px)");
        } } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerBody, [{
        type: Directive,
        args: [{
                selector: '[hlmDrawerBody]',
                host: {
                    'data-slot': 'drawer-body',
                    '[style.--_viewport-padding-block-start]': '"var(--drawer-body-padding-block-start, 0px)"',
                    '[style.--_viewport-padding-block-end]': '"var(--drawer-body-padding-block-end, 0px)"',
                    '[style.--_viewport-padding-inline-start]': '"var(--drawer-body-padding-inline, 0px)"',
                    '[style.--_viewport-padding-inline-end]': '"var(--drawer-body-padding-inline, 0px)"',
                },
            }]
    }], () => [], null); })();
