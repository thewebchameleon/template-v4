import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { BrnDialog, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { BrnSheet } from '@spartan-ng/brain/sheet';
import { HlmSheetOverlay } from './hlm-sheet-overlay';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class HlmSheet extends BrnSheet {
    static ɵfac = /*@__PURE__*/ (() => { let ɵHlmSheet_BaseFactory; return function HlmSheet_Factory(__ngFactoryType__) { return (ɵHlmSheet_BaseFactory || (ɵHlmSheet_BaseFactory = i0.ɵɵgetInheritedFactory(HlmSheet)))(__ngFactoryType__ || HlmSheet); }; })();
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSheet, selectors: [["hlm-sheet"]], exportAs: ["hlmSheet"], features: [i0.ɵɵProvidersFeature([
                {
                    provide: BrnDialog,
                    useExisting: forwardRef(() => BrnSheet),
                },
                {
                    provide: BrnSheet,
                    useExisting: forwardRef(() => HlmSheet),
                },
                provideBrnDialogDefaultOptions({
                // add custom options here
                }),
            ]), i0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c0, decls: 2, vars: 0, template: function HlmSheet_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelement(0, "hlm-sheet-overlay");
            i0.ɵɵprojection(1);
        } }, dependencies: [HlmSheetOverlay], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSheet, [{
        type: Component,
        args: [{
                selector: 'hlm-sheet',
                exportAs: 'hlmSheet',
                imports: [HlmSheetOverlay],
                providers: [
                    {
                        provide: BrnDialog,
                        useExisting: forwardRef(() => BrnSheet),
                    },
                    {
                        provide: BrnSheet,
                        useExisting: forwardRef(() => HlmSheet),
                    },
                    provideBrnDialogDefaultOptions({
                    // add custom options here
                    }),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <hlm-sheet-overlay />
    <ng-content />
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSheet, { className: "HlmSheet", filePath: "libs/ui/sheet/src/lib/hlm-sheet.ts", lineNumber: 29 }); })();
