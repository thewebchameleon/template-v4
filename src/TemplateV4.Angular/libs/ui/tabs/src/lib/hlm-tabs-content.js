import { Directive, input } from '@angular/core';
import { BrnTabsContent } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/tabs";
export class HlmTabsContent {
    contentFor = input.required({ ...(ngDevMode ? { debugName: "contentFor" } : /* istanbul ignore next */ {}), alias: 'hlmTabsContent' });
    constructor() {
        classes(() => 'flex-1 text-sm outline-none');
    }
    static ɵfac = function HlmTabsContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTabsContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTabsContent, selectors: [["", "hlmTabsContent", ""]], hostAttrs: ["data-slot", "tabs-content"], inputs: { contentFor: [1, "hlmTabsContent", "contentFor"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnTabsContent, inputs: ["brnTabsContent", "hlmTabsContent"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTabsContent, [{
        type: Directive,
        args: [{
                selector: '[hlmTabsContent]',
                hostDirectives: [{ directive: BrnTabsContent, inputs: ['brnTabsContent: hlmTabsContent'] }],
                host: {
                    'data-slot': 'tabs-content',
                },
            }]
    }], () => [], { contentFor: [{ type: i0.Input, args: [{ isSignal: true, alias: "hlmTabsContent", required: true }] }] }); })();
