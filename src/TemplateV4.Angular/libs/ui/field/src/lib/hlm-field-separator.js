import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class HlmFieldSeparator {
    constructor() {
        classes(() => '-my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2 relative');
    }
    static ɵfac = function HlmFieldSeparator_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldSeparator)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmFieldSeparator, selectors: [["hlm-field-separator"]], hostAttrs: ["data-slot", "field-separator"], ngContentSelectors: _c0, decls: 3, vars: 0, consts: [[1, "absolute", "inset-0", "top-1/2"], ["data-slot", "field-separator-content", 1, "text-muted-foreground", "px-2", "bg-background", "relative", "mx-auto", "block", "w-fit"]], template: function HlmFieldSeparator_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelement(0, "hlm-separator", 0);
            i0.ɵɵelementStart(1, "span", 1);
            i0.ɵɵprojection(2);
            i0.ɵɵelementEnd();
        } }, dependencies: [HlmSeparator], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldSeparator, [{
        type: Component,
        args: [{
                selector: 'hlm-field-separator',
                imports: [HlmSeparator],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: { 'data-slot': 'field-separator' },
                template: `
    <hlm-separator class="absolute inset-0 top-1/2" />
    <span
      data-slot="field-separator-content"
      class="text-muted-foreground px-2 bg-background relative mx-auto block w-fit"
    >
      <ng-content />
    </span>
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmFieldSeparator, { className: "HlmFieldSeparator", filePath: "libs/ui/field/src/lib/hlm-field-separator.ts", lineNumber: 20 }); })();
