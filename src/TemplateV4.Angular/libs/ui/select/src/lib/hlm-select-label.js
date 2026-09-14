import { Directive } from '@angular/core';
import { BrnSelectLabel } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectLabel {
    constructor() {
        classes(() => 'text-muted-foreground px-2 py-1.5 text-xs flex');
    }
    static ɵfac = function HlmSelectLabel_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectLabel)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectLabel, selectors: [["", "hlmSelectLabel", ""], ["hlm-select-label"]], hostAttrs: ["data-slot", "select-label"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSelectLabel, inputs: ["id", "id"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectLabel, [{
        type: Directive,
        args: [{
                selector: '[hlmSelectLabel],hlm-select-label',
                hostDirectives: [{ directive: BrnSelectLabel, inputs: ['id'] }],
                host: { 'data-slot': 'select-label' },
            }]
    }], () => [], null); })();
