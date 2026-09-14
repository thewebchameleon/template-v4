import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmFieldSet {
    constructor() {
        classes(() => 'gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3 flex flex-col');
    }
    static ɵfac = function HlmFieldSet_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldSet)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmFieldSet, selectors: [["fieldset", "hlmFieldSet", ""]], hostAttrs: ["data-slot", "field-set"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldSet, [{
        type: Directive,
        args: [{
                selector: 'fieldset[hlmFieldSet]',
                host: { 'data-slot': 'field-set' },
            }]
    }], () => [], null); })();
