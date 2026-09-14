import { Directive, input } from '@angular/core';
import { BrnTabs } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/tabs";
export class HlmTabs {
    tab = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tab" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'group/tabs flex gap-2 data-[orientation=horizontal]:flex-col');
    }
    static ɵfac = function HlmTabs_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTabs)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTabs, selectors: [["", "hlmTabs", ""], ["hlm-tabs"]], hostAttrs: ["data-slot", "tabs"], inputs: { tab: [1, "tab"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnTabs, inputs: ["orientation", "orientation", "activationMode", "activationMode", "brnTabs", "tab"], outputs: ["tabActivated", "tabActivated"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTabs, [{
        type: Directive,
        args: [{
                selector: '[hlmTabs],hlm-tabs',
                hostDirectives: [
                    {
                        directive: BrnTabs,
                        inputs: ['orientation', 'activationMode', 'brnTabs: tab'],
                        outputs: ['tabActivated'],
                    },
                ],
                host: {
                    'data-slot': 'tabs',
                },
            }]
    }], () => [], { tab: [{ type: i0.Input, args: [{ isSignal: true, alias: "tab", required: true }] }] }); })();
