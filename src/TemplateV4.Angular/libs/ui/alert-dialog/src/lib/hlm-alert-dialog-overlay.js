import { Directive, computed, effect, input, untracked } from '@angular/core';
import { BrnAlertDialogOverlay } from '@spartan-ng/brain/alert-dialog';
import { injectCustomClassSettable } from '@spartan-ng/brain/core';
import { hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/alert-dialog";
export class HlmAlertDialogOverlay {
    _classSettable = injectCustomClassSettable({ optional: true, host: true });
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    _computedClass = computed(() => hlm('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 isolate bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs', this.userClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const classValue = this._computedClass();
            untracked(() => this._classSettable?.setClassToCustomElement(classValue));
        });
    }
    static ɵfac = function HlmAlertDialogOverlay_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogOverlay)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogOverlay, selectors: [["", "hlmAlertDialogOverlay", ""], ["hlm-alert-dialog-overlay"]], inputs: { userClass: [1, "class", "userClass"] }, features: [i0.ɵɵHostDirectivesFeature([i1.BrnAlertDialogOverlay])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogOverlay, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogOverlay],hlm-alert-dialog-overlay',
                hostDirectives: [BrnAlertDialogOverlay],
            }]
    }], () => [], { userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }] }); })();
