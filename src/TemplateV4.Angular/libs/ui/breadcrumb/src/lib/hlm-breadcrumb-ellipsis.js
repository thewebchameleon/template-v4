import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmBreadcrumbEllipsis {
    /** Screen reader only text for the ellipsis */
    srOnlyText = input('More', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "srOnlyText" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'size-5 [&>ng-icon]:text-[length:--spacing(4)] flex items-center justify-center');
    }
    static ɵfac = function HlmBreadcrumbEllipsis_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmBreadcrumbEllipsis)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmBreadcrumbEllipsis, selectors: [["hlm-breadcrumb-ellipsis"]], hostAttrs: ["data-slot", "breadcrumb-ellipsis", "role", "presentation"], inputs: { srOnlyText: [1, "srOnlyText"] }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideEllipsis })])], decls: 3, vars: 1, consts: [["name", "lucideEllipsis"], [1, "sr-only"]], template: function HlmBreadcrumbEllipsis_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
            i0.ɵɵelementStart(1, "span", 1);
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.srOnlyText());
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmBreadcrumbEllipsis, [{
        type: Component,
        args: [{
                selector: 'hlm-breadcrumb-ellipsis',
                imports: [NgIcon],
                providers: [provideIcons({ lucideEllipsis })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'breadcrumb-ellipsis',
                    role: 'presentation',
                },
                template: `
    <ng-icon name="lucideEllipsis" />
    <span class="sr-only">{{ srOnlyText() }}</span>
  `,
            }]
    }], () => [], { srOnlyText: [{ type: i0.Input, args: [{ isSignal: true, alias: "srOnlyText", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmBreadcrumbEllipsis, { className: "HlmBreadcrumbEllipsis", filePath: "libs/ui/breadcrumb/src/lib/hlm-breadcrumb-ellipsis.ts", lineNumber: 20 }); })();
