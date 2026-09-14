import { Directive, inject } from '@angular/core';
import { BrnSelectValue } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
export class HlmSelectValue {
    _brnSelectValue = inject(BrnSelectValue);
    _hidden = this._brnSelectValue.hidden;
    constructor() {
        classes(() => 'data-hidden:hidden');
    }
    static ɵfac = function HlmSelectValue_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectValue)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSelectValue, selectors: [["", "hlmSelectValue", ""], ["hlm-select-value"]], hostVars: 1, hostBindings: function HlmSelectValue_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-slot", !ctx._hidden() ? "select-value" : null);
        } }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSelectValue, inputs: ["placeholder", "placeholder"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectValue, [{
        type: Directive,
        args: [{
                selector: '[hlmSelectValue],hlm-select-value',
                hostDirectives: [{ directive: BrnSelectValue, inputs: ['placeholder'] }],
                host: { '[attr.data-slot]': '!_hidden() ? "select-value" : null' },
            }]
    }], () => [], null); })();
