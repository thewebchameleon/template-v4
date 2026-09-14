import { Directive } from '@angular/core';
import { HlmInput } from '@spartan-ng/helm/input';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/input";
export class HlmInputGroupInput {
    constructor() {
        classes(() => `rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 data-[matches-spartan-invalid=true]:ring-0 dark:bg-transparent flex-1`);
    }
    static ɵfac = function HlmInputGroupInput_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputGroupInput)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInputGroupInput, selectors: [["input", "hlmInputGroupInput", ""]], hostAttrs: ["data-slot", "input-group-control"], features: [i0.ɵɵHostDirectivesFeature([i1.HlmInput])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputGroupInput, [{
        type: Directive,
        args: [{
                selector: 'input[hlmInputGroupInput]',
                hostDirectives: [HlmInput],
                host: { 'data-slot': 'input-group-control' },
            }]
    }], () => [], null); })();
