import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { BrnDialog, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { BrnDrawer } from '@spartan-ng/brain/drawer';
import { HlmDrawerOverlay } from './hlm-drawer-overlay';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class HlmDrawer extends BrnDrawer {
    static ɵfac = /*@__PURE__*/ (() => { let ɵHlmDrawer_BaseFactory; return function HlmDrawer_Factory(__ngFactoryType__) { return (ɵHlmDrawer_BaseFactory || (ɵHlmDrawer_BaseFactory = i0.ɵɵgetInheritedFactory(HlmDrawer)))(__ngFactoryType__ || HlmDrawer); }; })();
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDrawer, selectors: [["hlm-drawer"]], exportAs: ["hlmDrawer"], features: [i0.ɵɵProvidersFeature([
                {
                    provide: BrnDialog,
                    useExisting: forwardRef(() => HlmDrawer),
                },
                {
                    provide: BrnDrawer,
                    useExisting: forwardRef(() => HlmDrawer),
                },
                provideBrnDialogDefaultOptions({
                // add custom options here
                }),
            ]), i0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c0, decls: 2, vars: 0, template: function HlmDrawer_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelement(0, "hlm-drawer-overlay");
            i0.ɵɵprojection(1);
        } }, dependencies: [HlmDrawerOverlay], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDrawer, [{
        type: Component,
        args: [{
                selector: 'hlm-drawer',
                exportAs: 'hlmDrawer',
                imports: [HlmDrawerOverlay],
                providers: [
                    {
                        provide: BrnDialog,
                        useExisting: forwardRef(() => HlmDrawer),
                    },
                    {
                        provide: BrnDrawer,
                        useExisting: forwardRef(() => HlmDrawer),
                    },
                    provideBrnDialogDefaultOptions({
                    // add custom options here
                    }),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <hlm-drawer-overlay />
    <ng-content />
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDrawer, { className: "HlmDrawer", filePath: "libs/ui/drawer/src/lib/hlm-drawer.ts", lineNumber: 29 }); })();
