import { Directive } from '@angular/core';
import { BrnSelectPlaceholder } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectPlaceholder {
    constructor() {
        classes(() => "gap-2 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] flex items-center data-hidden:hidden [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0");
    }
    static ɵfac = function HlmSelectPlaceholder_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectPlaceholder)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectPlaceholder, selectors: [["", "hlmSelectPlaceholder", ""], ["hlm-select-placeholder"]], hostAttrs: ["data-slot", "select-placeholder"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnSelectPlaceholder])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectPlaceholder, [{
        type: Directive,
        args: [{
                selector: '[hlmSelectPlaceholder],hlm-select-placeholder',
                hostDirectives: [BrnSelectPlaceholder],
                host: { 'data-slot': 'select-placeholder' },
            }]
    }], () => [], null); })();
