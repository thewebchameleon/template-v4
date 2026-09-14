import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAvatarGroup {
    constructor() {
        classes(() => '*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2');
    }
    static ɵfac = function HlmAvatarGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAvatarGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAvatarGroup, selectors: [["", "hlmAvatarGroup", ""], ["hlm-avatar-group"]], hostAttrs: ["data-slot", "avatar-group"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAvatarGroup, [{
        type: Directive,
        args: [{
                selector: '[hlmAvatarGroup],hlm-avatar-group',
                host: {
                    'data-slot': 'avatar-group',
                },
            }]
    }], () => [], null); })();
