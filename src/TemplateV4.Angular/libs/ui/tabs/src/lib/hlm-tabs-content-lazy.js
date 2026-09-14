import { Directive } from '@angular/core';
import { BrnTabsContentLazy } from '@spartan-ng/brain/tabs';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/tabs";
export class HlmTabsContentLazy {
    static ɵfac = function HlmTabsContentLazy_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTabsContentLazy)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTabsContentLazy, selectors: [["ng-template", "hlmTabsContentLazy", ""]], features: [i0.ɵɵHostDirectivesFeature([i1.BrnTabsContentLazy])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTabsContentLazy, [{
        type: Directive,
        args: [{
                selector: 'ng-template[hlmTabsContentLazy]',
                hostDirectives: [BrnTabsContentLazy],
            }]
    }], null, null); })();
