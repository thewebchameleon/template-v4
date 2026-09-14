import { computed, Directive, effect, input, untracked } from '@angular/core';
import { injectCustomClassSettable } from '@spartan-ng/brain/core';
import { BrnDialogOverlay } from '@spartan-ng/brain/dialog';
import { hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/dialog";
export const hlmDialogOverlayClass = hlm('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 isolate bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs');
export class HlmDialogOverlay {
    _classSettable = injectCustomClassSettable({ optional: true, host: true });
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    _computedClass = computed(() => hlm(hlmDialogOverlayClass, this.userClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const newClass = this._computedClass();
            untracked(() => this._classSettable?.setClassToCustomElement(newClass));
        });
    }
    static ɵfac = function HlmDialogOverlay_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogOverlay)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDialogOverlay, selectors: [["", "hlmDialogOverlay", ""], ["hlm-dialog-overlay"]], inputs: { userClass: [1, "class", "userClass"] }, features: [i0.ɵɵHostDirectivesFeature([i1.BrnDialogOverlay])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogOverlay, [{
        type: Directive,
        args: [{
                selector: '[hlmDialogOverlay],hlm-dialog-overlay',
                hostDirectives: [BrnDialogOverlay],
            }]
    }], () => [], { userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }] }); })();
