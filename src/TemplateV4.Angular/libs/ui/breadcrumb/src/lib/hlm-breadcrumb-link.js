import { Directive, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
export class HlmBreadcrumbLink {
    /** The link to navigate to the page. */
    link = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "link" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'hover:text-foreground transition-colors');
    }
    static ɵfac = function HlmBreadcrumbLink_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmBreadcrumbLink)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmBreadcrumbLink, selectors: [["", "hlmBreadcrumbLink", ""]], hostAttrs: ["data-slot", "breadcrumb-link"], inputs: { link: [1, "link"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.RouterLink, inputs: ["target", "target", "queryParams", "queryParams", "fragment", "fragment", "queryParamsHandling", "queryParamsHandling", "state", "state", "info", "info", "relativeTo", "relativeTo", "preserveFragment", "preserveFragment", "skipLocationChange", "skipLocationChange", "replaceUrl", "replaceUrl", "routerLink", "link"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmBreadcrumbLink, [{
        type: Directive,
        args: [{
                selector: '[hlmBreadcrumbLink]',
                hostDirectives: [
                    {
                        directive: RouterLink,
                        inputs: [
                            'target',
                            'queryParams',
                            'fragment',
                            'queryParamsHandling',
                            'state',
                            'info',
                            'relativeTo',
                            'preserveFragment',
                            'skipLocationChange',
                            'replaceUrl',
                            'routerLink: link',
                        ],
                    },
                ],
                host: {
                    'data-slot': 'breadcrumb-link',
                },
            }]
    }], () => [], { link: [{ type: i0.Input, args: [{ isSignal: true, alias: "link", required: false }] }] }); })();
