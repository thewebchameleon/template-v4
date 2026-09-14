import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, input, linkedSignal, output, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnSwitch, BrnSwitchThumb } from '@spartan-ng/brain/switch';
import { hlm } from '@spartan-ng/helm/utils';
import { HlmSwitchThumb } from './hlm-switch-thumb';
import * as i0 from "@angular/core";
export const HLM_SWITCH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HlmSwitch),
    multi: true,
};
export class HlmSwitch {
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    // Padding preserves the fractional inset that CSS border widths round to device pixels.
    _computedClass = computed(() => hlm('data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 dark:data-unchecked:bg-input/80 rounded-full border border-transparent p-[calc(0.125rem-1px)] shadow-xs focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 data-[size=default]:h-[1.25rem] data-[size=default]:w-[2.25rem] data-[size=sm]:h-[1rem] data-[size=sm]:w-[1.75rem] group/switch inline-flex shrink-0 items-center transition-all outline-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50', this.userClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    /** The checked state of the switch. */
    checkedInput = input(false, { ...(ngDevMode ? { debugName: "checkedInput" } : /* istanbul ignore next */ {}), alias: 'checked',
        transform: booleanAttribute });
    checked = linkedSignal(this.checkedInput, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checked" }] : /* istanbul ignore next */ []));
    /** Emits when the checked state of the switch changes. */
    checkedChange = output();
    /** The disabled state of the switch. */
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** The size of the switch. */
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    /** Used to set the id on the underlying brn element. */
    inputId = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    /** Used to set the aria-label attribute on the underlying brn element. */
    ariaLabel = input(null, { ...(ngDevMode ? { debugName: "ariaLabel" } : /* istanbul ignore next */ {}), alias: 'aria-label' });
    /** Used to set the aria-labelledby attribute on the underlying brn element. */
    ariaLabelledby = input(null, { ...(ngDevMode ? { debugName: "ariaLabelledby" } : /* istanbul ignore next */ {}), alias: 'aria-labelledby' });
    /** Used to set the aria-describedby attribute on the underlying brn element. */
    ariaDescribedby = input(null, { ...(ngDevMode ? { debugName: "ariaDescribedby" } : /* istanbul ignore next */ {}), alias: 'aria-describedby' });
    _disabled = linkedSignal(this.disabled, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_disabled" }] : /* istanbul ignore next */ []));
    _onChange;
    _onTouched;
    handleChange(value) {
        this.checked.set(value);
        this._onChange?.(value);
        this.checkedChange.emit(value);
    }
    /** CONTROL VALUE ACCESSOR */
    writeValue(value) {
        this.checked.set(Boolean(value));
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this._disabled.set(isDisabled);
    }
    static ɵfac = function HlmSwitch_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSwitch)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSwitch, selectors: [["hlm-switch"]], hostAttrs: ["data-slot", "switch", 1, "contents"], hostVars: 3, hostBindings: function HlmSwitch_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("aria-label", null)("aria-labelledby", null)("aria-describedby", null);
        } }, inputs: { userClass: [1, "class", "userClass"], checkedInput: [1, "checked", "checkedInput"], disabled: [1, "disabled"], size: [1, "size"], inputId: [1, "inputId"], ariaLabel: [1, "aria-label", "ariaLabel"], ariaLabelledby: [1, "aria-labelledby", "ariaLabelledby"], ariaDescribedby: [1, "aria-describedby", "ariaDescribedby"] }, outputs: { checkedChange: "checkedChange" }, features: [i0.ɵɵProvidersFeature([HLM_SWITCH_VALUE_ACCESSOR])], decls: 2, vars: 9, consts: [[3, "checkedChange", "touched", "size", "checked", "disabled", "id", "aria-label", "aria-labelledby", "aria-describedby"], ["hlm", ""]], template: function HlmSwitch_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "brn-switch", 0);
            i0.ɵɵlistener("checkedChange", function HlmSwitch_Template_brn_switch_checkedChange_0_listener($event) { return ctx.handleChange($event); })("touched", function HlmSwitch_Template_brn_switch_touched_0_listener() { return ctx._onTouched?.(); });
            i0.ɵɵelement(1, "brn-switch-thumb", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassMap(ctx._computedClass());
            i0.ɵɵproperty("size", ctx.size())("checked", ctx.checked())("disabled", ctx._disabled())("id", ctx.inputId());
            i0.ɵɵariaProperty("aria-label", ctx.ariaLabel())("aria-labelledby", ctx.ariaLabelledby())("aria-describedby", ctx.ariaDescribedby());
        } }, dependencies: [BrnSwitchThumb, BrnSwitch, HlmSwitchThumb], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSwitch, [{
        type: Component,
        args: [{
                selector: 'hlm-switch',
                imports: [BrnSwitchThumb, BrnSwitch, HlmSwitchThumb],
                providers: [HLM_SWITCH_VALUE_ACCESSOR],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    'data-slot': 'switch',
                    class: 'contents',
                    '[attr.aria-label]': 'null',
                    '[attr.aria-labelledby]': 'null',
                    '[attr.aria-describedby]': 'null',
                },
                template: `
    <brn-switch
      [class]="_computedClass()"
      [size]="size()"
      [checked]="checked()"
      (checkedChange)="handleChange($event)"
      (touched)="_onTouched?.()"
      [disabled]="_disabled()"
      [id]="inputId()"
      [aria-label]="ariaLabel()"
      [aria-labelledby]="ariaLabelledby()"
      [aria-describedby]="ariaDescribedby()"
    >
      <brn-switch-thumb hlm />
    </brn-switch>
  `,
            }]
    }], null, { userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }], checkedInput: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }], checkedChange: [{ type: i0.Output, args: ["checkedChange"] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], inputId: [{ type: i0.Input, args: [{ isSignal: true, alias: "inputId", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-label", required: false }] }], ariaLabelledby: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-labelledby", required: false }] }], ariaDescribedby: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-describedby", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSwitch, { className: "HlmSwitch", filePath: "libs/ui/switch/src/lib/hlm-switch.ts", lineNumber: 54 }); })();
