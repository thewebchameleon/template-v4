import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { BrnSelectItem } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
const _c0 = ["*"];
function HlmSelectItem_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 0);
} }
export class HlmSelectItem {
    _brnSelectItem = inject(BrnSelectItem);
    _active = this._brnSelectItem.active;
    constructor() {
        classes(() => 'data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0');
    }
    static ɵfac = function HlmSelectItem_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectItem)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSelectItem, selectors: [["hlm-select-item"]], hostAttrs: ["data-slot", "select-item"], features: [i0.ɵɵProvidersFeature([provideIcons({ lucideCheck })]), i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSelectItem, inputs: ["id", "id", "disabled", "disabled", "value", "value"] }])], ngContentSelectors: _c0, decls: 2, vars: 1, consts: [["name", "lucideCheck", "aria-hidden", "true", 1, "absolute", "end-2", "flex", "items-center", "justify-center", "text-[length:--spacing(4)]"]], template: function HlmSelectItem_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵprojection(0);
            i0.ɵɵconditionalCreate(1, HlmSelectItem_Conditional_1_Template, 1, 0, "ng-icon", 0);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx._active() ? 1 : -1);
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectItem, [{
        type: Component,
        args: [{
                selector: 'hlm-select-item',
                imports: [NgIcon],
                providers: [provideIcons({ lucideCheck })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [{ directive: BrnSelectItem, inputs: ['id', 'disabled', 'value'] }],
                host: { 'data-slot': 'select-item' },
                template: `
    <ng-content />
    @if (_active()) {
      <ng-icon
        name="lucideCheck"
        class="absolute end-2 flex items-center justify-center text-[length:--spacing(4)]"
        aria-hidden="true"
      />
    }
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSelectItem, { className: "HlmSelectItem", filePath: "libs/ui/select/src/lib/hlm-select-item.ts", lineNumber: 25 }); })();
