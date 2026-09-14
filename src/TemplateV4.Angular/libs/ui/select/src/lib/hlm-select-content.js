import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, } from '@angular/core';
import { BrnSelectContent } from '@spartan-ng/brain/select';
import { classes, hlm } from '@spartan-ng/helm/utils';
import { HlmSelectScrollDown } from './hlm-select-scroll-down';
import { HlmSelectScrollUp } from './hlm-select-scroll-up';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/select";
const _c0 = ["*"];
function HlmSelectContent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-select-scroll-up");
} }
function HlmSelectContent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "hlm-select-scroll-down");
} }
export class HlmSelectContent {
    _computedListboxClasses = computed(() => hlm('flex flex-col'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedListboxClasses" }] : /* istanbul ignore next */ []));
    ariaLabel = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    showScroll = input(false, { ...(ngDevMode ? { debugName: "showScroll" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    constructor() {
        classes(() => 'bg-popover no-scrollbar text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 max-h-72 min-w-36 flex-col rounded-md shadow-md ring-1 duration-100 relative flex w-(--brn-select-width) overflow-x-hidden overflow-y-auto');
    }
    static ɵfac = function HlmSelectContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectContent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSelectContent, selectors: [["hlm-select-content"]], inputs: { ariaLabel: [1, "ariaLabel"], showScroll: [1, "showScroll"] }, features: [i0.ɵɵHostDirectivesFeature([i1.BrnSelectContent])], ngContentSelectors: _c0, decls: 4, vars: 5, consts: [["role", "listbox"]], template: function HlmSelectContent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵconditionalCreate(0, HlmSelectContent_Conditional_0_Template, 1, 0, "hlm-select-scroll-up");
            i0.ɵɵelementStart(1, "div", 0);
            i0.ɵɵprojection(2);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(3, HlmSelectContent_Conditional_3_Template, 1, 0, "hlm-select-scroll-down");
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.showScroll() ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassMap(ctx._computedListboxClasses());
            i0.ɵɵattribute("aria-label", ctx.ariaLabel());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.showScroll() ? 3 : -1);
        } }, dependencies: [HlmSelectScrollUp, HlmSelectScrollDown], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectContent, [{
        type: Component,
        args: [{
                selector: 'hlm-select-content',
                imports: [HlmSelectScrollUp, HlmSelectScrollDown],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [BrnSelectContent],
                template: `
    @if (showScroll()) {
      <hlm-select-scroll-up />
    }

    <div role="listbox" [attr.aria-label]="ariaLabel()" [class]="_computedListboxClasses()">
      <ng-content />
    </div>

    @if (showScroll()) {
      <hlm-select-scroll-down />
    }
  `,
            }]
    }], () => [], { ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaLabel", required: false }] }], showScroll: [{ type: i0.Input, args: [{ isSignal: true, alias: "showScroll", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSelectContent, { className: "HlmSelectContent", filePath: "libs/ui/select/src/lib/hlm-select-content.ts", lineNumber: 33 }); })();
