import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronUp } from '@ng-icons/lucide';
import { BrnSelectScrollUp } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectScrollUp {
    constructor() {
        classes(() => "bg-popover z-10 flex cursor-pointer items-center justify-center py-1 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] sticky top-0 w-full data-hidden:hidden");
    }
    static ɵfac = function HlmSelectScrollUp_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectScrollUp)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSelectScrollUp, selectors: [["hlm-select-scroll-up"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronUp })]), i0.ɵɵHostDirectivesFeature([i1.BrnSelectScrollUp])], decls: 1, vars: 0, consts: [["name", "lucideChevronUp"]], template: function HlmSelectScrollUp_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectScrollUp, [{
        type: Component,
        args: [{
                selector: 'hlm-select-scroll-up',
                imports: [NgIcon],
                providers: [provideIcons({ lucideChevronUp })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [BrnSelectScrollUp],
                template: ` <ng-icon name="lucideChevronUp" /> `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSelectScrollUp, { className: "HlmSelectScrollUp", filePath: "libs/ui/select/src/lib/hlm-select-scroll-up.ts", lineNumber: 15 }); })();
