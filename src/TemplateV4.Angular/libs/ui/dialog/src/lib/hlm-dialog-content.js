import { NgComponentOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { classes } from '@spartan-ng/helm/utils';
import { HlmDialogClose } from './hlm-dialog-close';
import * as i0 from "@angular/core";
const _c0 = ["*"];
function HlmDialogContent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 0);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngComponentOutlet", ctx_r0.component);
} }
function HlmDialogContent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵprojection(0);
} }
function HlmDialogContent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 1)(1, "span", 2);
    i0.ɵɵtext(2, "close");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "ng-icon", 3);
    i0.ɵɵelementEnd();
} }
export class HlmDialogContent {
    _dialogRef = inject(BrnDialogRef);
    _dialogContext = injectBrnDialogContext({
        optional: true,
    });
    showCloseButton = input(this._dialogContext?.$showCloseButton ?? true, { ...(ngDevMode ? { debugName: "showCloseButton" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    state = computed(() => this._dialogRef?.state() ?? 'closed', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    component = this._dialogContext?.$component;
    _dynamicComponentClass = this._dialogContext?.$dynamicComponentClass;
    constructor() {
        classes(() => [
            'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-6 rounded-xl p-6 text-sm ring-1 duration-100 sm:max-w-md relative mx-auto w-full outline-none sm:mx-0',
            this._dynamicComponentClass,
        ]);
    }
    static ɵfac = function HlmDialogContent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDialogContent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDialogContent, selectors: [["hlm-dialog-content"]], hostAttrs: ["data-slot", "dialog-content"], hostVars: 1, hostBindings: function HlmDialogContent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-state", ctx.state());
        } }, inputs: { showCloseButton: [1, "showCloseButton"] }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideX })])], ngContentSelectors: _c0, decls: 3, vars: 2, consts: [[3, "ngComponentOutlet"], ["hlmBtn", "", "variant", "ghost", "size", "icon-sm", "hlmDialogClose", "", 1, "absolute", "end-4", "top-4"], [1, "sr-only"], ["name", "lucideX"]], template: function HlmDialogContent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵconditionalCreate(0, HlmDialogContent_Conditional_0_Template, 1, 1, "ng-container", 0)(1, HlmDialogContent_Conditional_1_Template, 1, 0);
            i0.ɵɵconditionalCreate(2, HlmDialogContent_Conditional_2_Template, 4, 0, "button", 1);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.component ? 0 : 1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.showCloseButton() ? 2 : -1);
        } }, dependencies: [NgComponentOutlet, HlmButton, HlmDialogClose, NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDialogContent, [{
        type: Component,
        args: [{
                selector: 'hlm-dialog-content',
                imports: [NgComponentOutlet, HlmButton, HlmDialogClose, NgIcon],
                providers: [provideIcons({ lucideX })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'dialog-content',
                    '[attr.data-state]': 'state()',
                },
                template: `
    @if (component) {
      <ng-container [ngComponentOutlet]="component" />
    } @else {
      <ng-content />
    }

    @if (showCloseButton()) {
      <button hlmBtn variant="ghost" size="icon-sm" class="absolute end-4 top-4" hlmDialogClose>
        <span class="sr-only">close</span>
        <ng-icon name="lucideX" />
      </button>
    }
  `,
            }]
    }], () => [], { showCloseButton: [{ type: i0.Input, args: [{ isSignal: true, alias: "showCloseButton", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDialogContent, { className: "HlmDialogContent", filePath: "libs/ui/dialog/src/lib/hlm-dialog-content.ts", lineNumber: 50 }); })();
