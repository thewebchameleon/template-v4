import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { BrnDialog, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { HlmDialogOverlay } from './hlm-dialog-overlay';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class HlmDialog extends BrnDialog {
    static ɵfac = /*@__PURE__*/ (() => { let ɵHlmDialog_BaseFactory; return function HlmDialog_Factory(__ngFactoryType__) { return (ɵHlmDialog_BaseFactory || (ɵHlmDialog_BaseFactory = i0.ɵɵgetInheritedFactory(HlmDialog)))(__ngFactoryType__ || HlmDialog); }; })();
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDialog, selectors: [["hlm-dialog"]], exportAs: ["hlmDialog"], features: [i0.ɵɵProvidersFeature([
                {
                    provide: BrnDialog,
                    useExisting: forwardRef(() => HlmDialog),
                },
                provideBrnDialogDefaultOptions({
                // add custom options here
                }),
            ]), i0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c0, decls: 2, vars: 0, template: function HlmDialog_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelement(0, "hlm-dialog-overlay");
            i0.ɵɵprojection(1);
        } }, dependencies: [HlmDialogOverlay], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialog, [{
        type: Component,
        args: [{
                selector: 'hlm-dialog',
                exportAs: 'hlmDialog',
                imports: [HlmDialogOverlay],
                providers: [
                    {
                        provide: BrnDialog,
                        useExisting: forwardRef(() => HlmDialog),
                    },
                    provideBrnDialogDefaultOptions({
                    // add custom options here
                    }),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <hlm-dialog-overlay />
    <ng-content />
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDialog, { className: "HlmDialog", filePath: "libs/ui/dialog/src/lib/hlm-dialog.ts", lineNumber: 24 }); })();
