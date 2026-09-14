import { Directive } from '@angular/core';
import { HlmLabel } from '@spartan-ng/helm/label';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/label";
export class HlmFieldLabel {
    constructor() {
        classes(() => [
            'has-data-checked:bg-primary/5 has-data-checked:border-primary/30 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-3 group/field-label peer/field-label flex w-fit',
            'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        ]);
    }
    static ɵfac = function HlmFieldLabel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldLabel)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmFieldLabel, selectors: [["", "hlmFieldLabel", ""], ["hlm-field-label"]], hostAttrs: ["data-slot", "field-label"], features: [i0.ɵɵHostDirectivesFeature([i1.HlmLabel])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldLabel, [{
        type: Directive,
        args: [{
                selector: '[hlmFieldLabel],hlm-field-label',
                hostDirectives: [HlmLabel],
                host: { 'data-slot': 'field-label' },
            }]
    }], () => [], null); })();
