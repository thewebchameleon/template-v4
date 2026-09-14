import { Directive, ElementRef, Renderer2, effect, inject, signal } from '@angular/core';
import { injectExposesStateProvider } from '@spartan-ng/brain/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmPopoverContent {
    _stateProvider = injectExposesStateProvider({ host: true });
    state = this._stateProvider.state ?? signal('closed');
    _renderer = inject(Renderer2);
    _element = inject(ElementRef);
    constructor() {
        effect(() => {
            this._renderer.setAttribute(this._element.nativeElement, 'data-state', this.state());
        });
        classes(() => 'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 gap-4 rounded-md p-4 text-sm shadow-md ring-1 duration-100 relative flex w-72 flex-col outline-none');
    }
    static ɵfac = function HlmPopoverContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmPopoverContent)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmPopoverContent, selectors: [["", "hlmPopoverContent", ""], ["hlm-popover-content"]], hostAttrs: ["data-slot", "popover-content"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmPopoverContent, [{
        type: Directive,
        args: [{
                selector: '[hlmPopoverContent],hlm-popover-content',
                host: { 'data-slot': 'popover-content' },
            }]
    }], () => [], null); })();
