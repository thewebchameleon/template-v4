import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { BrnFieldControlDescribedBy } from '@spartan-ng/brain/field';
import { BrnSelectTrigger } from '@spartan-ng/brain/select';
import { hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
const _c0 = ["*"];
export class HlmSelectTrigger {
    static _id = 0;
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    _computedClass = computed(() => hlm('border-input data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 gap-1.5 rounded-md border bg-transparent py-2 ps-2.5 pe-2 text-sm shadow-xs transition-[color,box-shadow] focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:gap-1.5 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0', this.userClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    buttonId = input(`hlm-select-trigger-${HlmSelectTrigger._id++}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "buttonId" }] : /* istanbul ignore next */ []));
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    /** Whether to force the trigger into an invalid state. */
    forceInvalid = input(false, { ...(ngDevMode ? { debugName: "forceInvalid" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    static ɵfac = function HlmSelectTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSelectTrigger)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSelectTrigger, selectors: [["hlm-select-trigger"]], inputs: { userClass: [1, "class", "userClass"], buttonId: [1, "buttonId"], size: [1, "size"], forceInvalid: [1, "forceInvalid"] }, features: [i0.ɵɵProvidersFeature([provideIcons({ lucideChevronDown })])], ngContentSelectors: _c0, decls: 3, vars: 5, consts: [["brnSelectTrigger", "", "brnFieldControlDescribedBy", "", "data-slot", "select-trigger", 3, "forceInvalid", "id"], ["name", "lucideChevronDown", 1, "text-muted-foreground", "text-[length:--spacing(4)]", "ms-auto"]], template: function HlmSelectTrigger_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "button", 0);
            i0.ɵɵprojection(1);
            i0.ɵɵelement(2, "ng-icon", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassMap(ctx._computedClass());
            i0.ɵɵproperty("forceInvalid", ctx.forceInvalid())("id", ctx.buttonId());
            i0.ɵɵattribute("data-size", ctx.size());
        } }, dependencies: [NgIcon, BrnSelectTrigger, BrnFieldControlDescribedBy], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSelectTrigger, [{
        type: Component,
        args: [{
                selector: 'hlm-select-trigger',
                imports: [NgIcon, BrnSelectTrigger, BrnFieldControlDescribedBy],
                providers: [provideIcons({ lucideChevronDown })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <button
      brnSelectTrigger
      brnFieldControlDescribedBy
      [forceInvalid]="forceInvalid()"
      [id]="buttonId()"
      [class]="_computedClass()"
      [attr.data-size]="size()"
      data-slot="select-trigger"
    >
      <ng-content />
      <ng-icon
        name="lucideChevronDown"
        class="text-muted-foreground text-[length:--spacing(4)] ms-auto"
      />
    </button>
  `,
            }]
    }], null, { userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }], buttonId: [{ type: i0.Input, args: [{ isSignal: true, alias: "buttonId", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], forceInvalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "forceInvalid", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSelectTrigger, { className: "HlmSelectTrigger", filePath: "libs/ui/select/src/lib/hlm-select-trigger.ts", lineNumber: 39 }); })();
