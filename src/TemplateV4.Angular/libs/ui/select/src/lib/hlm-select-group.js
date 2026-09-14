import { Directive } from '@angular/core';
import { BrnSelectGroup } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectGroup {
    constructor() {
        classes(() => 'scroll-my-1 p-1');
    }
    static ɵfac = function HlmSelectGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectGroup, selectors: [["", "hlmSelectGroup", ""], ["hlm-select-group"]], hostAttrs: ["data-slot", "select-group"], features: [i0.ɵɵHostDirectivesFeature([i1.BrnSelectGroup])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectGroup, [{
        type: Directive,
        args: [{
                selector: '[hlmSelectGroup],hlm-select-group',
                hostDirectives: [{ directive: BrnSelectGroup }],
                host: { 'data-slot': 'select-group' },
            }]
    }], () => [], null); })();
