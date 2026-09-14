import { Directive } from '@angular/core';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/textarea";
export class HlmInputGroupTextarea {
    constructor() {
        classes(() => 'rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 data-[matches-spartan-invalid=true]:ring-0 dark:bg-transparent flex-1 resize-none');
    }
    static ɵfac = function HlmInputGroupTextarea_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInputGroupTextarea)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInputGroupTextarea, selectors: [["textarea", "hlmInputGroupTextarea", ""]], hostAttrs: ["data-slot", "input-group-control"], features: [i0.ɵɵHostDirectivesFeature([i1.HlmTextarea])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInputGroupTextarea, [{
        type: Directive,
        args: [{
                selector: 'textarea[hlmInputGroupTextarea]',
                hostDirectives: [HlmTextarea],
                host: { 'data-slot': 'input-group-control' },
            }]
    }], () => [], null); })();
