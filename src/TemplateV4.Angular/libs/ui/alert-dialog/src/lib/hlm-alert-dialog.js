import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { BRN_ALERT_DIALOG_DEFAULT_OPTIONS, BrnAlertDialog } from '@spartan-ng/brain/alert-dialog';
import { BrnDialog, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogOverlay } from './hlm-alert-dialog-overlay';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class HlmAlertDialog extends BrnAlertDialog {
    static ɵfac = /*@__PURE__*/ (() => { let ɵHlmAlertDialog_BaseFactory; return function HlmAlertDialog_Factory(__ngFactoryType__) { return (ɵHlmAlertDialog_BaseFactory || (ɵHlmAlertDialog_BaseFactory = i0.ɵɵgetInheritedFactory(HlmAlertDialog)))(__ngFactoryType__ || HlmAlertDialog); }; })();
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmAlertDialog, selectors: [["hlm-alert-dialog"]], exportAs: ["hlmAlertDialog"], features: [i0.ɵɵProvidersFeature([
                {
                    provide: BrnDialog,
                    useExisting: forwardRef(() => HlmAlertDialog),
                },
                provideBrnDialogDefaultOptions({
                    ...BRN_ALERT_DIALOG_DEFAULT_OPTIONS,
                }),
            ]), i0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c0, decls: 2, vars: 0, template: function HlmAlertDialog_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelement(0, "hlm-alert-dialog-overlay");
            i0.ɵɵprojection(1);
        } }, dependencies: [HlmAlertDialogOverlay], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmAlertDialog, [{
        type: Component,
        args: [{
                selector: 'hlm-alert-dialog',
                exportAs: 'hlmAlertDialog',
                imports: [HlmAlertDialogOverlay],
                providers: [
                    {
                        provide: BrnDialog,
                        useExisting: forwardRef(() => HlmAlertDialog),
                    },
                    provideBrnDialogDefaultOptions({
                        ...BRN_ALERT_DIALOG_DEFAULT_OPTIONS,
                    }),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <hlm-alert-dialog-overlay />
    <ng-content />
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmAlertDialog, { className: "HlmAlertDialog", filePath: "libs/ui/alert-dialog/src/lib/hlm-alert-dialog.ts", lineNumber: 25 }); })();
