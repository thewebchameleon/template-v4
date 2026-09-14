import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
const _c0 = ["*"];
function HlmBreadcrumbSeparator_ProjectionFallback_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 0);
} }
export class HlmBreadcrumbSeparator {
    constructor() {
        classes(() => '[&>ng-icon]:text-[length:--spacing(3.5)] [&>ng-icon]:flex');
    }
    static ɵfac = function HlmBreadcrumbSeparator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmBreadcrumbSeparator)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmBreadcrumbSeparator, selectors: [["", "hlmBreadcrumbSeparator", ""]], hostAttrs: ["data-slot", "breadcrumb-separator", "role", "presentation", "aria-hidden", "true"], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronRight })])], ngContentSelectors: _c0, decls: 2, vars: 0, consts: [["name", "lucideChevronRight"]], template: function HlmBreadcrumbSeparator_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵprojection(0, 0, null, HlmBreadcrumbSeparator_ProjectionFallback_0_Template, 1, 0);
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmBreadcrumbSeparator, [{
        type: Component,
        args: [{
                // eslint-disable-next-line @angular-eslint/component-selector
                selector: '[hlmBreadcrumbSeparator]',
                imports: [NgIcon],
                providers: [provideIcons({ lucideChevronRight })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'breadcrumb-separator',
                    role: 'presentation',
                    'aria-hidden': 'true',
                },
                template: `
    <ng-content>
      <ng-icon name="lucideChevronRight" />
    </ng-content>
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmBreadcrumbSeparator, { className: "HlmBreadcrumbSeparator", filePath: "libs/ui/breadcrumb/src/lib/hlm-breadcrumb-separator.ts", lineNumber: 23 }); })();
