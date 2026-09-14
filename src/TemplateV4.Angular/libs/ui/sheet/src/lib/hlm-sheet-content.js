import { booleanAttribute, ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, Renderer2, signal, } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { injectExposedSideProvider, injectExposesStateProvider } from '@spartan-ng/brain/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { classes } from '@spartan-ng/helm/utils';
import { HlmSheetClose } from './hlm-sheet-close';
import * as i0 from "@angular/core";
const _c0 = ["*"];
function HlmSheetContent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 0)(1, "span", 1);
    i0.ɵɵtext(2, "Close");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "ng-icon", 2);
    i0.ɵɵelementEnd();
} }
export class HlmSheetContent {
    _stateProvider = injectExposesStateProvider({ host: true });
    _sideProvider = injectExposedSideProvider({ host: true });
    state = this._stateProvider.state ?? signal('closed');
    _renderer = inject(Renderer2);
    _element = inject(ElementRef);
    showCloseButton = input(true, { ...(ngDevMode ? { debugName: "showCloseButton" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => [
            'bg-popover text-popover-foreground fixed flex flex-col gap-4 bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',
            'data-open:animate-in data-closed:animate-out',
            'data-[side=top]:data-closed:slide-out-to-top data-[side=top]:data-open:slide-in-from-top',
            'data-[side=bottom]:data-closed:slide-out-to-bottom data-[side=bottom]:data-open:slide-in-from-bottom',
            'data-[side=left]:data-closed:slide-out-to-left data-[side=left]:data-open:slide-in-from-left',
            'data-[side=right]:data-closed:slide-out-to-right data-[side=right]:data-open:slide-in-from-right',
        ]);
        effect(() => {
            this._renderer.setAttribute(this._element.nativeElement, 'data-state', this.state());
        });
    }
    static ɵfac = function HlmSheetContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSheetContent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSheetContent, selectors: [["hlm-sheet-content"]], hostAttrs: ["data-slot", "sheet-content"], hostVars: 2, hostBindings: function HlmSheetContent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-side", ctx._sideProvider.side())("data-state", ctx.state());
        } }, inputs: { showCloseButton: [1, "showCloseButton"] }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideX })])], ngContentSelectors: _c0, decls: 2, vars: 1, consts: [["hlmBtn", "", "variant", "ghost", "size", "icon-sm", "hlmSheetClose", "", 1, "absolute", "end-4", "top-4"], [1, "sr-only"], ["name", "lucideX"]], template: function HlmSheetContent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵprojection(0);
            i0.ɵɵconditionalCreate(1, HlmSheetContent_Conditional_1_Template, 4, 0, "button", 0);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showCloseButton() ? 1 : -1);
        } }, dependencies: [HlmButton, HlmSheetClose, NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheetContent, [{
        type: Component,
        args: [{
                selector: 'hlm-sheet-content',
                imports: [HlmButton, HlmSheetClose, NgIcon],
                providers: [provideIcons({ lucideX })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'sheet-content',
                    '[attr.data-side]': '_sideProvider.side()',
                    '[attr.data-state]': 'state()',
                },
                template: `
    <ng-content />

    @if (showCloseButton()) {
      <button hlmBtn variant="ghost" size="icon-sm" class="absolute end-4 top-4" hlmSheetClose>
        <span class="sr-only">Close</span>
        <ng-icon name="lucideX" />
      </button>
    }
  `,
            }]
    }], () => [], { showCloseButton: [{ type: i0.Input, args: [{ isSignal: true, alias: "showCloseButton", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSheetContent, { className: "HlmSheetContent", filePath: "libs/ui/sheet/src/lib/hlm-sheet-content.ts", lineNumber: 42 }); })();
