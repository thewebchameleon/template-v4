import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmBreadcrumbItem {
    constructor() {
        classes(() => 'gap-1.5 inline-flex items-center');
    }
    static ɵfac = function HlmBreadcrumbItem_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmBreadcrumbItem)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmBreadcrumbItem, selectors: [["", "hlmBreadcrumbItem", ""]], hostAttrs: ["data-slot", "breadcrumb-item"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmBreadcrumbItem, [{
        type: Directive,
        args: [{
                selector: '[hlmBreadcrumbItem]',
                host: {
                    'data-slot': 'breadcrumb-item',
                },
            }]
    }], () => [], null); })();
