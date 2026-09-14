import { inject, Injectable } from '@angular/core';
import { BrnDialogService, cssClassesToArray, } from '@spartan-ng/brain/dialog';
import { HlmDialogContent } from './hlm-dialog-content';
import { hlmDialogOverlayClass } from './hlm-dialog-overlay';
import * as i0 from "@angular/core";
export class HlmDialogService {
    _brnDialogService = inject(BrnDialogService);
    open(component, options) {
        const mergedOptions = {
            ...(options ?? {}),
            backdropClass: cssClassesToArray(`${hlmDialogOverlayClass} ${options?.backdropClass ?? ''}`),
            context: {
                ...(options?.context && typeof options.context === 'object' ? options.context : {}),
                $component: component,
                $dynamicComponentClass: options?.contentClass,
                $showCloseButton: options?.showCloseButton,
            },
        };
        return this._brnDialogService.open(HlmDialogContent, undefined, mergedOptions.context, mergedOptions);
    }
    static ɵfac = function HlmDialogService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: HlmDialogService, factory: HlmDialogService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogService, [{
        type: Injectable,
        args: [{
                providedIn: 'root',
            }]
    }], null, null); })();
