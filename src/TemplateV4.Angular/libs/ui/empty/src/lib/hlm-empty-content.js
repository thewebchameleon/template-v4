import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmEmptyContent {
    constructor() {
        classes(() => 'gap-4 text-sm flex w-full max-w-sm min-w-0 flex-col items-center text-balance');
    }
    static ɵfac = function HlmEmptyContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmEmptyContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmEmptyContent, selectors: [["", "hlmEmptyContent", ""], ["hlm-empty-content"]], hostAttrs: ["data-slot", "empty-content"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmEmptyContent, [{
        type: Directive,
        args: [{
                selector: '[hlmEmptyContent],hlm-empty-content',
                host: { 'data-slot': 'empty-content' },
            }]
    }], () => [], null); })();
