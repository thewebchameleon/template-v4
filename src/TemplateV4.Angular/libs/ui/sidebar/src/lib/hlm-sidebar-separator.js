import { Directive } from '@angular/core';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/separator";
export class HlmSidebarSeparator {
    constructor() {
        classes(() => 'bg-sidebar-border mx-2 w-auto');
    }
    static ɵfac = function HlmSidebarSeparator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarSeparator)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarSeparator, selectors: [["", "hlmSidebarSeparator", ""], ["hlm-sidebar-separator"]], hostAttrs: ["data-slot", "sidebar-separator", "data-sidebar", "separator"], features: [i0.ɵɵHostDirectivesFeature([i1.HlmSeparator])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarSeparator, [{
        type: Directive,
        args: [{
                selector: '[hlmSidebarSeparator],hlm-sidebar-separator',
                hostDirectives: [HlmSeparator],
                host: {
                    'data-slot': 'sidebar-separator',
                    'data-sidebar': 'separator',
                },
            }]
    }], () => [], null); })();
