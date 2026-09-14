import { Directive } from '@angular/core';
import { BrnSelectValues } from '@spartan-ng/brain/select';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectValues {
    static ɵfac = function HlmSelectValues_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectValues)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectValues, selectors: [["", "hlmSelectValues", ""]], features: [i0.ɵɵHostDirectivesFeature([i1.BrnSelectValues])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectValues, [{
        type: Directive,
        args: [{ selector: '[hlmSelectValues]', hostDirectives: [BrnSelectValues] }]
    }], null, null); })();
