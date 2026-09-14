import { Directive } from '@angular/core';
import { BrnSelectValueTemplate } from '@spartan-ng/brain/select';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectValueTemplate {
    static ɵfac = function HlmSelectValueTemplate_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectValueTemplate)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectValueTemplate, selectors: [["", "hlmSelectValueTemplate", ""]], features: [i0.ɵɵHostDirectivesFeature([i1.BrnSelectValueTemplate])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectValueTemplate, [{
        type: Directive,
        args: [{ selector: '[hlmSelectValueTemplate]', hostDirectives: [BrnSelectValueTemplate] }]
    }], null, null); })();
