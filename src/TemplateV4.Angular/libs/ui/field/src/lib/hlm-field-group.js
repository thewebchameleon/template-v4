import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmFieldGroup {
    constructor() {
        classes(() => 'gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4 group/field-group @container/field-group flex w-full flex-col');
    }
    static ɵfac = function HlmFieldGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmFieldGroup, selectors: [["", "hlmFieldGroup", ""], ["hlm-field-group"]], hostAttrs: ["data-slot", "field-group"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldGroup, [{
        type: Directive,
        args: [{
                selector: '[hlmFieldGroup],hlm-field-group',
                host: { 'data-slot': 'field-group' },
            }]
    }], () => [], null); })();
