import { Directive, computed, effect, input, untracked } from '@angular/core';
import { injectCustomClassSettable } from '@spartan-ng/brain/core';
import { BrnDrawerOverlay } from '@spartan-ng/brain/drawer';
import { hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/drawer";
export class HlmDrawerOverlay {
    _classSettable = injectCustomClassSettable({ optional: true, host: true });
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    _computedClass = computed(() => hlm('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0', this.userClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const classValue = this._computedClass();
            untracked(() => this._classSettable?.setClassToCustomElement(classValue));
        });
    }
    static ɵfac = function HlmDrawerOverlay_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerOverlay)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDrawerOverlay, selectors: [["", "hlmDrawerOverlay", ""], ["hlm-drawer-overlay"]], inputs: { userClass: [1, "class", "userClass"] }, features: [i0.ɵɵHostDirectivesFeature([i1.BrnDrawerOverlay])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerOverlay, [{
        type: Directive,
        args: [{
                selector: '[hlmDrawerOverlay],hlm-drawer-overlay',
                hostDirectives: [BrnDrawerOverlay],
            }]
    }], () => [], { userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }] }); })();
