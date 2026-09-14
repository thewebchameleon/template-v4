import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmBreadcrumbPage {
    constructor() {
        classes(() => 'text-foreground font-normal');
    }
    static ɵfac = function HlmBreadcrumbPage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmBreadcrumbPage)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmBreadcrumbPage, selectors: [["", "hlmBreadcrumbPage", ""]], hostAttrs: ["data-slot", "breadcrumb-page", "role", "link", "aria-disabled", "true", "aria-current", "page"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmBreadcrumbPage, [{
        type: Directive,
        args: [{
                selector: '[hlmBreadcrumbPage]',
                host: {
                    'data-slot': 'breadcrumb-page',
                    role: 'link',
                    'aria-disabled': 'true',
                    'aria-current': 'page',
                },
            }]
    }], () => [], null); })();
