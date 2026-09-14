import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmBreadcrumbList {
    constructor() {
        classes(() => 'text-muted-foreground gap-1.5 text-sm sm:gap-2.5 flex flex-wrap items-center wrap-break-word');
    }
    static ɵfac = function HlmBreadcrumbList_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmBreadcrumbList)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmBreadcrumbList, selectors: [["", "hlmBreadcrumbList", ""]], hostAttrs: ["data-slot", "breadcrumb-list"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmBreadcrumbList, [{
        type: Directive,
        args: [{
                selector: '[hlmBreadcrumbList]',
                host: {
                    'data-slot': 'breadcrumb-list',
                },
            }]
    }], () => [], null); })();
