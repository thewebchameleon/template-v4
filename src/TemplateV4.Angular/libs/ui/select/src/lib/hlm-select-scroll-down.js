import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { BrnSelectScrollDown } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectScrollDown {
    constructor() {
        classes(() => "bg-popover z-10 flex cursor-pointer items-center justify-center py-1 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] sticky bottom-0 w-full data-hidden:hidden");
    }
    static ɵfac = function HlmSelectScrollDown_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectScrollDown)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSelectScrollDown, selectors: [["hlm-select-scroll-down"]], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronDown })]), i0.ɵɵHostDirectivesFeature([i1.BrnSelectScrollDown])], decls: 1, vars: 0, consts: [["name", "lucideChevronDown"]], template: function HlmSelectScrollDown_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectScrollDown, [{
        type: Component,
        args: [{
                selector: 'hlm-select-scroll-down',
                imports: [NgIcon],
                providers: [provideIcons({ lucideChevronDown })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [BrnSelectScrollDown],
                template: ` <ng-icon name="lucideChevronDown" /> `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSelectScrollDown, { className: "HlmSelectScrollDown", filePath: "libs/ui/select/src/lib/hlm-select-scroll-down.ts", lineNumber: 15 }); })();
