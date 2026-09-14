import { Directive, inject } from '@angular/core';
import { BrnAvatarImage } from '@spartan-ng/brain/avatar';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/avatar";
export class HlmAvatarImage {
    canShow = inject(BrnAvatarImage).canShow;
    constructor() {
        classes(() => 'rounded-full aspect-square size-full object-cover');
    }
    static ɵfac = function HlmAvatarImage_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAvatarImage)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAvatarImage, selectors: [["img", "hlmAvatarImage", ""]], hostAttrs: ["data-slot", "avatar-image"], exportAs: ["hlmAvatarImage"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnAvatarImage])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAvatarImage, [{
        type: Directive,
        args: [{
                selector: 'img[hlmAvatarImage]',
                exportAs: 'hlmAvatarImage',
                hostDirectives: [BrnAvatarImage],
                host: {
                    'data-slot': 'avatar-image',
                },
            }]
    }], () => [], null); })();
