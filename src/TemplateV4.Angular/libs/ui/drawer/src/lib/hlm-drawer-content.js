import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { injectExposedSideProvider, injectExposesStateProvider } from '@spartan-ng/brain/core';
import { BrnDrawerHandle } from '@spartan-ng/brain/drawer';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/drawer";
const _c0 = ["*"];
export class HlmDrawerContent {
    _stateProvider = injectExposesStateProvider({ host: true });
    _sideProvider = injectExposedSideProvider({ host: true });
    state = this._stateProvider.state ?? signal('closed');
    constructor() {
        classes(() => [
            'bg-background fixed z-50 flex h-auto flex-col border text-sm md:shadow-sm data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl md:data-[vaul-drawer-direction=bottom]:inset-x-2 md:data-[vaul-drawer-direction=bottom]:bottom-2 md:data-[vaul-drawer-direction=bottom]:rounded-xl data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl md:data-[vaul-drawer-direction=left]:inset-y-2 md:data-[vaul-drawer-direction=left]:left-2 md:data-[vaul-drawer-direction=left]:rounded-xl data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-(--panel-radius) data-[vaul-drawer-direction=right]:bg-muted/60 data-[vaul-drawer-direction=right]:p-(--panel-inset) data-[vaul-drawer-direction=right]:[--card-spacing:var(--panel-content-spacing)] md:data-[vaul-drawer-direction=right]:inset-y-2 md:data-[vaul-drawer-direction=right]:right-2 md:data-[vaul-drawer-direction=right]:rounded-(--panel-radius) data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl md:data-[vaul-drawer-direction=top]:inset-x-2 md:data-[vaul-drawer-direction=top]:top-2 md:data-[vaul-drawer-direction=top]:rounded-xl data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm',
            'group/drawer-content',
            'data-open:animate-in data-closed:animate-out',
            'data-[vaul-drawer-direction=bottom]:data-closed:slide-out-to-bottom data-[vaul-drawer-direction=bottom]:data-open:slide-in-from-bottom',
            'data-[vaul-drawer-direction=top]:data-closed:slide-out-to-top data-[vaul-drawer-direction=top]:data-open:slide-in-from-top',
            'data-[vaul-drawer-direction=left]:data-closed:slide-out-to-left data-[vaul-drawer-direction=left]:data-open:slide-in-from-left',
            'data-[vaul-drawer-direction=right]:data-closed:slide-out-to-right data-[vaul-drawer-direction=right]:data-open:slide-in-from-right',
        ]);
    }
    static ɵfac = function HlmDrawerContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDrawerContent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDrawerContent, selectors: [["hlm-drawer-content"]], hostAttrs: ["data-slot", "drawer-content"], hostVars: 2, hostBindings: function HlmDrawerContent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-vaul-drawer-direction", ctx._sideProvider.side())("data-state", ctx.state());
        } }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnDrawerHandle, inputs: ["closeThreshold", "closeThreshold"] }])], ngContentSelectors: _c0, decls: 2, vars: 0, consts: [[1, "bg-muted", "mx-auto", "mt-4", "hidden", "h-1.5", "w-[100px]", "shrink-0", "rounded-full", "group-data-[vaul-drawer-direction=bottom]/drawer-content:block"]], template: function HlmDrawerContent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵdomElement(0, "div", 0);
            i0.ɵɵprojection(1);
        } }, encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawerContent, [{
        type: Component,
        args: [{
                selector: 'hlm-drawer-content',
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [{ directive: BrnDrawerHandle, inputs: ['closeThreshold'] }],
                host: {
                    'data-slot': 'drawer-content',
                    '[attr.data-vaul-drawer-direction]': '_sideProvider.side()',
                    '[attr.data-state]': 'state()',
                },
                template: `
    <div
      class="bg-muted mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
    ></div>
    <ng-content />
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDrawerContent, { className: "HlmDrawerContent", filePath: "libs/ui/drawer/src/lib/hlm-drawer-content.ts", lineNumber: 22 }); })();
