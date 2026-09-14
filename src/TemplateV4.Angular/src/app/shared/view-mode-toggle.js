import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLayoutGrid, lucideList } from '@ng-icons/lucide';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/toggle-group";
export class ViewModeToggle {
    value = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    ariaLabel = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    listLabel = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listLabel" }] : /* istanbul ignore next */ []));
    gridLabel = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "gridLabel" }] : /* istanbul ignore next */ []));
    disabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    valueChange = output();
    select(value) {
        if ((value === 'list' || value === 'grid') && value !== this.value()) {
            this.valueChange.emit(value);
        }
    }
    static ɵfac = function ViewModeToggle_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ViewModeToggle)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ViewModeToggle, selectors: [["app-view-mode-toggle"]], inputs: { value: [1, "value"], ariaLabel: [1, "ariaLabel"], listLabel: [1, "listLabel"], gridLabel: [1, "gridLabel"], disabled: [1, "disabled"] }, outputs: { valueChange: "valueChange" }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideLayoutGrid, lucideList })])], decls: 8, vars: 7, consts: [["type", "single", "variant", "inset", 1, "view-mode-toggle", 3, "valueChange", "nullable", "value", "disabled"], ["aria-hidden", "true", 1, "view-mode-toggle-indicator"], ["hlmToggleGroupItem", "", "type", "button", "value", "list"], ["name", "lucideList", "aria-hidden", "true"], ["hlmToggleGroupItem", "", "type", "button", "value", "grid"], ["name", "lucideLayoutGrid", "aria-hidden", "true"]], template: function ViewModeToggle_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "hlm-toggle-group", 0);
            i0.ɵɵlistener("valueChange", function ViewModeToggle_Template_hlm_toggle_group_valueChange_0_listener($event) { return ctx.select($event); });
            i0.ɵɵelement(1, "span", 1);
            i0.ɵɵelementStart(2, "button", 2);
            i0.ɵɵelement(3, "ng-icon", 3);
            i0.ɵɵtext(4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "button", 4);
            i0.ɵɵelement(6, "ng-icon", 5);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵproperty("nullable", false)("value", ctx.value())("disabled", ctx.disabled());
            i0.ɵɵattribute("aria-label", ctx.ariaLabel())("data-view", ctx.value());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1("", ctx.listLabel(), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1("", ctx.gridLabel(), " ");
        } }, dependencies: [i1.HlmToggleGroup, i1.HlmToggleGroupItem, NgIcon], styles: [".view-mode-toggle[_ngcontent-%COMP%] {\n      position: relative;\n      display: grid;\n      grid-template-columns: repeat(2, minmax(0, 1fr));\n    }\n\n    .view-mode-toggle-indicator[_ngcontent-%COMP%] {\n      pointer-events: none;\n      position: absolute;\n      inset-block: 3px;\n      inset-inline-start: 3px;\n      inline-size: calc((100% - 6px) / 2);\n      border-radius: calc(var(--%NS%radius) - 2px);\n      background: var(--%NS%primary);\n      box-shadow: var(--%NS%shadow-sm);\n      transform: translateX(0);\n    }\n\n    .view-mode-toggle[data-view='grid'][_ngcontent-%COMP%]   .view-mode-toggle-indicator[_ngcontent-%COMP%] {\n      transform: translateX(100%);\n    }\n\n    .view-mode-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n      position: relative;\n      z-index: 1;\n    }\n\n    .view-mode-toggle[_ngcontent-%COMP%]   button[data-state='on'][_ngcontent-%COMP%] {\n      background: transparent;\n      box-shadow: none;\n    }\n\n    @media (prefers-reduced-motion: no-preference) {\n      .view-mode-toggle-indicator[_ngcontent-%COMP%] {\n        transition: transform 200ms ease-out;\n      }\n    }\n\n    [dir='rtl'][_nghost-%COMP%]   .view-mode-toggle[data-view='grid'][_ngcontent-%COMP%]   .view-mode-toggle-indicator[_ngcontent-%COMP%], [dir='rtl']   [_nghost-%COMP%]   .view-mode-toggle[data-view='grid'][_ngcontent-%COMP%]   .view-mode-toggle-indicator[_ngcontent-%COMP%] {\n      transform: translateX(-100%);\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ViewModeToggle, [{
        type: Component,
        args: [{ selector: 'app-view-mode-toggle', imports: [HlmToggleGroupImports, NgIcon], providers: [provideIcons({ lucideLayoutGrid, lucideList })], template: `
    <hlm-toggle-group
      type="single"
      variant="inset"
      [nullable]="false"
      [value]="value()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.data-view]="value()"
      (valueChange)="select($event)"
      class="view-mode-toggle"
    >
      <span class="view-mode-toggle-indicator" aria-hidden="true"></span>
      <button hlmToggleGroupItem type="button" value="list">
        <ng-icon name="lucideList" aria-hidden="true" />{{ listLabel() }}
      </button>
      <button hlmToggleGroupItem type="button" value="grid">
        <ng-icon name="lucideLayoutGrid" aria-hidden="true" />{{ gridLabel() }}
      </button>
    </hlm-toggle-group>
  `, styles: ["\n    .view-mode-toggle {\n      position: relative;\n      display: grid;\n      grid-template-columns: repeat(2, minmax(0, 1fr));\n    }\n\n    .view-mode-toggle-indicator {\n      pointer-events: none;\n      position: absolute;\n      inset-block: 3px;\n      inset-inline-start: 3px;\n      inline-size: calc((100% - 6px) / 2);\n      border-radius: calc(var(--radius) - 2px);\n      background: var(--primary);\n      box-shadow: var(--shadow-sm);\n      transform: translateX(0);\n    }\n\n    .view-mode-toggle[data-view='grid'] .view-mode-toggle-indicator {\n      transform: translateX(100%);\n    }\n\n    .view-mode-toggle button {\n      position: relative;\n      z-index: 1;\n    }\n\n    .view-mode-toggle button[data-state='on'] {\n      background: transparent;\n      box-shadow: none;\n    }\n\n    @media (prefers-reduced-motion: no-preference) {\n      .view-mode-toggle-indicator {\n        transition: transform 200ms ease-out;\n      }\n    }\n\n    :host-context([dir='rtl']) .view-mode-toggle[data-view='grid'] .view-mode-toggle-indicator {\n      transform: translateX(-100%);\n    }\n  "] }]
    }], null, { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaLabel", required: true }] }], listLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "listLabel", required: true }] }], gridLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "gridLabel", required: true }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ViewModeToggle, { className: "ViewModeToggle", filePath: "src/app/shared/view-mode-toggle.ts", lineNumber: 77 }); })();
