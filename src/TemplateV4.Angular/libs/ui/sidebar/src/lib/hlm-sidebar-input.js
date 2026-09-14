import { Directive } from '@angular/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/input";
export class HlmSidebarInput {
    constructor() {
        classes(() => 'bg-background h-8 w-full shadow-none');
    }
    static ɵfac = function HlmSidebarInput_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarInput)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarInput, selectors: [["input", "hlmSidebarInput", ""]], hostAttrs: ["data-slot", "sidebar-input", "data-sidebar", "input"], features: [i0.ɵɵHostDirectivesFeature([i1.HlmInput])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarInput, [{
        type: Directive,
        args: [{
                selector: 'input[hlmSidebarInput]',
                hostDirectives: [HlmInput],
                host: {
                    'data-slot': 'sidebar-input',
                    'data-sidebar': 'input',
                },
            }]
    }], () => [], null); })();
