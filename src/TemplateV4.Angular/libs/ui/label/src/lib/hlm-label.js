import { Directive } from '@angular/core';
import { BrnLabel } from '@spartan-ng/brain/label';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/label";
export class HlmLabel {
    constructor() {
        classes(() => 'gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed');
    }
    static ɵfac = function HlmLabel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmLabel)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmLabel, selectors: [["", "hlmLabel", ""]], hostAttrs: ["data-slot", "label"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnLabel, inputs: ["id", "id", "for", "for"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmLabel, [{
        type: Directive,
        args: [{
                selector: '[hlmLabel]',
                hostDirectives: [{ directive: BrnLabel, inputs: ['id', 'for'] }],
                host: { 'data-slot': 'label' },
            }]
    }], () => [], null); })();
