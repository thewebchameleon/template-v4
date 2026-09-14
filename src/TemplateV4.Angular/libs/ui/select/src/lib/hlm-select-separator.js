import { Directive } from '@angular/core';
import { BrnSelectSeparator } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectSeparator {
    constructor() {
        classes(() => 'bg-border -mx-1 my-1 h-px pointer-events-none');
    }
    static ɵfac = function HlmSelectSeparator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectSeparator)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectSeparator, selectors: [["", "hlmSelectSeparator", ""], ["hlm-select-separator"]], hostAttrs: ["data-slot", "select-separator"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSelectSeparator, inputs: ["orientation", "orientation"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectSeparator, [{
        type: Directive,
        args: [{
                selector: '[hlmSelectSeparator],hlm-select-separator',
                hostDirectives: [{ directive: BrnSelectSeparator, inputs: ['orientation'] }],
                host: { 'data-slot': 'select-separator' },
            }]
    }], () => [], null); })();
