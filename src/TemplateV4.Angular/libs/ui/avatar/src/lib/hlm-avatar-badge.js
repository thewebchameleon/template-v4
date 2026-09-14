import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAvatarBadge {
    constructor() {
        classes(() => [
            'bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none',
            'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>ng-icon]:hidden',
            'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>ng-icon]:text-[length:--spacing(2)]',
            'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>ng-icon]:text-[length:--spacing(2)]',
        ]);
    }
    static ɵfac = function HlmAvatarBadge_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAvatarBadge)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAvatarBadge, selectors: [["", "hlmAvatarBadge", ""], ["hlm-avatar-badge"]], hostAttrs: ["data-slot", "avatar-badge"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAvatarBadge, [{
        type: Directive,
        args: [{
                selector: '[hlmAvatarBadge],hlm-avatar-badge',
                host: {
                    'data-slot': 'avatar-badge',
                },
            }]
    }], () => [], null); })();
