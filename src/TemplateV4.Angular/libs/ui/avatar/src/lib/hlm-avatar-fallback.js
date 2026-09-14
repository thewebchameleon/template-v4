import { Directive } from '@angular/core';
import { BrnAvatarFallback } from '@spartan-ng/brain/avatar';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/avatar";
export class HlmAvatarFallback {
    constructor() {
        classes(() => 'bg-muted text-muted-foreground rounded-full flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs');
    }
    static ɵfac = function HlmAvatarFallback_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAvatarFallback)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAvatarFallback, selectors: [["", "hlmAvatarFallback", ""]], hostAttrs: ["data-slot", "avatar-fallback"], exportAs: ["hlmAvatarFallback"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnAvatarFallback])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAvatarFallback, [{
        type: Directive,
        args: [{
                selector: '[hlmAvatarFallback]',
                exportAs: 'hlmAvatarFallback',
                hostDirectives: [BrnAvatarFallback],
                host: {
                    'data-slot': 'avatar-fallback',
                },
            }]
    }], () => [], null); })();
