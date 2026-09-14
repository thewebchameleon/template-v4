import { CdkMenu } from '@angular/cdk/menu';
import { Directive, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { deriveMenuSideFromTransformOrigin, MENU_SIDE, } from '@spartan-ng/brain/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/menu";
export class HlmDropdownMenuSub {
    _host = inject(CdkMenu);
    _elementRef = inject((ElementRef));
    // The sub-trigger provides its configured side; CDK parents this content's injector under it.
    _menuSide = inject(MENU_SIDE, { optional: true });
    _state = signal('open', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_state" }] : /* istanbul ignore next */ []));
    _side = signal(this._menuSide?.side() ?? 'right', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_side" }] : /* istanbul ignore next */ []));
    constructor() {
        this.setSideFromTransformOrigin();
        // this is a best effort, but does not seem to work currently
        // TODO: figure out a way for us to know the host is about to be closed. might not be possible with CDK
        this._host.closed.pipe(takeUntilDestroyed()).subscribe(() => this._state.set('closed'));
        classes(() => 'motion-safe:data-open:animate-in motion-safe:data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-[96px] rounded-md p-1 shadow-lg ring-1 duration-100 w-auto');
    }
    setSideFromTransformOrigin() {
        const side = this._menuSide?.side() ?? 'right';
        // CDK sets transform-origin on this element synchronously on attach; read it next tick and derive side
        setTimeout(() => {
            this._side.set(deriveMenuSideFromTransformOrigin(this._elementRef.nativeElement.style.transformOrigin, side));
        });
    }
    static ɵfac = function HlmDropdownMenuSub_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuSub)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuSub, selectors: [["", "hlmDropdownMenuSub", ""], ["hlm-dropdown-menu-sub"]], hostAttrs: ["data-slot", "dropdown-menu-sub"], hostVars: 2, hostBindings: function HlmDropdownMenuSub_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-state", ctx._state())("data-side", ctx._side());
        } }, features: [i0.ɵɵHostDirectivesFeature([i1.CdkMenu])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuSub, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuSub],hlm-dropdown-menu-sub',
                hostDirectives: [CdkMenu],
                host: {
                    'data-slot': 'dropdown-menu-sub',
                    '[attr.data-state]': '_state()',
                    '[attr.data-side]': '_side()',
                },
            }]
    }], () => [], null); })();
