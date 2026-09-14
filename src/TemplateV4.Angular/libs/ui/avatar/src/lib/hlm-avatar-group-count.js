import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAvatarGroupCount {
    constructor() {
        classes(() => 'bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>ng-icon]:text-base group-has-data-[size=lg]/avatar-group:[&>ng-icon]:text-xl group-has-data-[size=sm]/avatar-group:[&>ng-icon]:text-xs');
    }
    static ɵfac = function HlmAvatarGroupCount_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAvatarGroupCount)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAvatarGroupCount, selectors: [["", "hlmAvatarGroupCount", ""], ["hlm-avatar-group-count"]], hostAttrs: ["data-slot", "avatar-group-count"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAvatarGroupCount, [{
        type: Directive,
        args: [{
                selector: '[hlmAvatarGroupCount],hlm-avatar-group-count',
                host: {
                    'data-slot': 'avatar-group-count',
                },
            }]
    }], () => [], null); })();
