import { Directive, input, signal } from '@angular/core';
import { injectExposesStateProvider } from '@spartan-ng/brain/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmAlertDialogContent {
    _stateProvider = injectExposesStateProvider({ optional: true, host: true });
    state = this._stateProvider?.state ?? signal('closed');
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-popover text-popover-foreground ring-foreground/10 gap-6 rounded-xl p-6 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg group/alert-dialog-content grid w-full outline-none');
    }
    static ɵfac = function HlmAlertDialogContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmAlertDialogContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmAlertDialogContent, selectors: [["", "hlmAlertDialogContent", ""], ["hlm-alert-dialog-content"]], hostAttrs: ["data-slot", "alert-dialog-content"], hostVars: 2, hostBindings: function HlmAlertDialogContent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-state", ctx.state())("data-size", ctx.size());
        } }, inputs: { size: [1, "size"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialogContent, [{
        type: Directive,
        args: [{
                selector: '[hlmAlertDialogContent],hlm-alert-dialog-content',
                host: {
                    'data-slot': 'alert-dialog-content',
                    '[attr.data-state]': 'state()',
                    '[attr.data-size]': 'size()',
                },
            }]
    }], () => [], { size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] }); })();
