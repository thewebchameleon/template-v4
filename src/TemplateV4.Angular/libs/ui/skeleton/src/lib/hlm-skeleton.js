import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmSkeleton {
    constructor() {
        classes(() => 'bg-muted rounded-md block motion-safe:animate-pulse');
    }
    static ɵfac = function HlmSkeleton_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSkeleton)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSkeleton, selectors: [["", "hlmSkeleton", ""], ["hlm-skeleton"]], hostAttrs: ["data-slot", "skeleton"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSkeleton, [{
        type: Directive,
        args: [{
                selector: '[hlmSkeleton],hlm-skeleton',
                host: {
                    'data-slot': 'skeleton',
                },
            }]
    }], () => [], null); })();
