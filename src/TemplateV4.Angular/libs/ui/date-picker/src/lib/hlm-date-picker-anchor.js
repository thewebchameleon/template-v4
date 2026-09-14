import { Directive, effect, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { BrnOverlay } from '@spartan-ng/brain/overlay';
import * as i0 from "@angular/core";
export class HlmDatePickerAnchor {
    _host = inject(ElementRef, { host: true });
    _brnOverlay = inject(BrnOverlay, { optional: true });
    hlmDatePickerAnchorForInput = input(undefined, { ...(ngDevMode ? { debugName: "hlmDatePickerAnchorForInput" } : /* istanbul ignore next */ {}), alias: 'hlmDatePickerAnchorFor' });
    hlmDatePickerAnchorFor = linkedSignal(this.hlmDatePickerAnchorForInput, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hlmDatePickerAnchorFor" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            this.hlmDatePickerAnchorFor()?.setOrigin(this._host.nativeElement);
        });
        this._brnOverlay?.setOrigin(this._host.nativeElement);
    }
    static ɵfac = function HlmDatePickerAnchor_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDatePickerAnchor)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDatePickerAnchor, selectors: [["", "hlmDatePickerAnchor", ""]], inputs: { hlmDatePickerAnchorForInput: [1, "hlmDatePickerAnchorFor", "hlmDatePickerAnchorForInput"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDatePickerAnchor, [{
        type: Directive,
        args: [{ selector: '[hlmDatePickerAnchor]' }]
    }], () => [], { hlmDatePickerAnchorForInput: [{ type: i0.Input, args: [{ isSignal: true, alias: "hlmDatePickerAnchorFor", required: false }] }] }); })();
