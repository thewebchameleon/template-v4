import { CdkMenu } from '@angular/cdk/menu';
import { Directive, ElementRef, inject, input, numberAttribute, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { deriveMenuSideFromTransformOrigin, MENU_SIDE, } from '@spartan-ng/brain/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/menu";
export class HlmDropdownMenu {
    _host = inject(CdkMenu);
    _elementRef = inject((ElementRef));
    // The trigger provides its configured side; CDK parents this content's injector under the trigger's.
    _menuSide = inject(MENU_SIDE, { optional: true });
    _state = signal('open', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_state" }] : /* istanbul ignore next */ []));
    _side = signal(this._menuSide?.side() ?? 'bottom', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_side" }] : /* istanbul ignore next */ []));
    sideOffset = input(1, { ...(ngDevMode ? { debugName: "sideOffset" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    constructor() {
        classes(() => 'motion-safe:data-open:animate-in motion-safe:data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-md p-1 shadow-md ring-1 duration-100 my-[--spacing(var(--side-offset))] overflow-x-hidden overflow-y-auto outline-none');
        this.setSideFromTransformOrigin();
        // this is a best effort, but does not seem to work currently
        // TODO: figure out a way for us to know the host is about to be closed. might not be possible with CDK
        this._host.closed.pipe(takeUntilDestroyed()).subscribe(() => this._state.set('closed'));
    }
    setSideFromTransformOrigin() {
        const side = this._menuSide?.side() ?? 'bottom';
        // CDK sets transform-origin on this element synchronously on attach; read it next tick and derive side
        setTimeout(() => {
            this._side.set(deriveMenuSideFromTransformOrigin(this._elementRef.nativeElement.style.transformOrigin, side));
        });
    }
    static ɵfac = function HlmDropdownMenu_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenu)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenu, selectors: [["", "hlmDropdownMenu", ""], ["hlm-dropdown-menu"]], hostAttrs: ["data-slot", "dropdown-menu"], hostVars: 4, hostBindings: function HlmDropdownMenu_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-state", ctx._state())("data-side", ctx._side());
            i0.ɵɵstyleProp("--%NS%side-offset", ctx.sideOffset());
        } }, inputs: { sideOffset: [1, "sideOffset"] }, features: [i0.ɵɵHostDirectivesFeature([i1.CdkMenu])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenu, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenu],hlm-dropdown-menu',
                hostDirectives: [CdkMenu],
                host: {
                    'data-slot': 'dropdown-menu',
                    '[attr.data-state]': '_state()',
                    '[attr.data-side]': '_side()',
                    '[style.--side-offset]': 'sideOffset()',
                },
            }]
    }], () => [], { sideOffset: [{ type: i0.Input, args: [{ isSignal: true, alias: "sideOffset", required: false }] }] }); })();
