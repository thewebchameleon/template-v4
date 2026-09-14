import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, linkedSignal, output, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { BrnFieldControl, provideBrnLabelable } from '@spartan-ng/brain/field';
import { classes, hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/field";
const _c0 = ["*"];
export const HLM_NATIVE_SELECT_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HlmNativeSelect),
    multi: true,
};
export class HlmNativeSelect {
    _fieldControl = inject(BrnFieldControl, { optional: true });
    static _id = 0;
    selectId = input(`hlm-native-select-${HlmNativeSelect._id++}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectId" }] : /* istanbul ignore next */ []));
    selectClass = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectClass" }] : /* istanbul ignore next */ []));
    _computedSelectClass = computed(() => hlm('border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent py-1 ps-2.5 pe-8 text-sm shadow-xs transition-[color,box-shadow] select-none focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 data-[size=sm]:h-8 outline-none disabled:pointer-events-none disabled:cursor-not-allowed', this.selectClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedSelectClass" }] : /* istanbul ignore next */ []));
    selectIconClass = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectIconClass" }] : /* istanbul ignore next */ []));
    _computedSelectIconClass = computed(() => hlm('text-muted-foreground end-2.5 top-1/2 -translate-y-1/2 text-[length:--spacing(4)] pointer-events-none absolute select-none', this.selectIconClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedSelectIconClass" }] : /* istanbul ignore next */ []));
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    _disabled = linkedSignal(this.disabled, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_disabled" }] : /* istanbul ignore next */ []));
    /** Whether to force the input into an invalid state. */
    forceInvalid = input(false, { ...(ngDevMode ? { debugName: "forceInvalid" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Manual override for aria-invalid. When not set, auto-detects from the parent autocomplete error state. */
    ariaInvalidOverride = input(undefined, { ...(ngDevMode ? { debugName: "ariaInvalidOverride" } : /* istanbul ignore next */ {}), transform: (v) => (v === '' || v === undefined ? undefined : booleanAttribute(v)),
        alias: 'aria-invalid' });
    _ariaInvalid = computed(() => this.ariaInvalidOverride() ?? this._invalid?.(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_ariaInvalid" }] : /* istanbul ignore next */ []));
    valueInput = input('', { ...(ngDevMode ? { debugName: "valueInput" } : /* istanbul ignore next */ {}), alias: 'value' });
    value = linkedSignal(this.valueInput, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    valueChange = output();
    _onChange;
    _onTouched;
    labelableId = this.selectId;
    _invalid = this._fieldControl?.invalid;
    _touched = this._fieldControl?.touched;
    _dirty = this._fieldControl?.dirty;
    _spartanInvalid = computed(() => this.forceInvalid() || this._fieldControl?.spartanInvalid(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_spartanInvalid" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'group/native-select relative w-fit has-[select:disabled]:opacity-50');
    }
    _valueChanged(event) {
        const value = event.target.value;
        this.value.set(value);
        this.valueChange.emit(value);
        this._onChange?.(value);
        this._onTouched?.();
    }
    _blur() {
        this._onTouched?.();
    }
    /** CONTROL VALUE ACCESSOR */
    writeValue(value) {
        this.value.set(value);
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
    static ɵfac = function HlmNativeSelect_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmNativeSelect)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmNativeSelect, selectors: [["hlm-native-select"]], hostAttrs: ["data-slot", "native-select-wrapper"], hostVars: 1, hostBindings: function HlmNativeSelect_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-size", ctx.size());
        } }, inputs: { selectId: [1, "selectId"], selectClass: [1, "selectClass"], selectIconClass: [1, "selectIconClass"], size: [1, "size"], disabled: [1, "disabled"], forceInvalid: [1, "forceInvalid"], ariaInvalidOverride: [1, "aria-invalid", "ariaInvalidOverride"], valueInput: [1, "value", "valueInput"] }, outputs: { valueChange: "valueChange" }, features: [i0.ɵɵProvidersFeature([
                HLM_NATIVE_SELECT_VALUE_ACCESSOR,
                provideIcons({ lucideChevronDown }),
                provideBrnLabelable(HlmNativeSelect),
            ]), i0.ɵɵHostDirectivesFeature([i1.BrnFieldControl])], ngContentSelectors: _c0, decls: 3, vars: 13, consts: [["data-slot", "native-select", 3, "change", "blur", "id", "value", "disabled"], ["name", "lucideChevronDown", "aria-hidden", "true", "data-slot", "native-select-icon"]], template: function HlmNativeSelect_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "select", 0);
            i0.ɵɵlistener("change", function HlmNativeSelect_Template_select_change_0_listener($event) { return ctx._valueChanged($event); })("blur", function HlmNativeSelect_Template_select_blur_0_listener() { return ctx._blur(); });
            i0.ɵɵprojection(1);
            i0.ɵɵelementEnd();
            i0.ɵɵelement(2, "ng-icon", 1);
        } if (rf & 2) {
            i0.ɵɵclassMap(ctx._computedSelectClass());
            i0.ɵɵproperty("id", ctx.selectId())("value", ctx.value())("disabled", ctx._disabled());
            i0.ɵɵattribute("data-size", ctx.size())("aria-invalid", ctx._ariaInvalid() ? "true" : null)("data-invalid", ctx._ariaInvalid() ? "true" : null)("data-dirty", ctx._dirty?.() ? "true" : null)("data-touched", ctx._touched?.() ? "true" : null)("data-matches-spartan-invalid", ctx._spartanInvalid() ? "true" : null);
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap(ctx._computedSelectIconClass());
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmNativeSelect, [{
        type: Component,
        args: [{
                selector: 'hlm-native-select',
                imports: [NgIcon],
                providers: [
                    HLM_NATIVE_SELECT_VALUE_ACCESSOR,
                    provideIcons({ lucideChevronDown }),
                    provideBrnLabelable(HlmNativeSelect),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [BrnFieldControl],
                host: {
                    'data-slot': 'native-select-wrapper',
                    '[attr.data-size]': 'size()',
                },
                template: `
    <select
      data-slot="native-select"
      [id]="selectId()"
      [class]="_computedSelectClass()"
      [attr.data-size]="size()"
      [attr.aria-invalid]="_ariaInvalid() ? 'true' : null"
      [attr.data-invalid]="_ariaInvalid() ? 'true' : null"
      [attr.data-dirty]="_dirty?.() ? 'true' : null"
      [attr.data-touched]="_touched?.() ? 'true' : null"
      [attr.data-matches-spartan-invalid]="_spartanInvalid() ? 'true' : null"
      [value]="value()"
      [disabled]="_disabled()"
      (change)="_valueChanged($event)"
      (blur)="_blur()"
    >
      <ng-content />
    </select>

    <ng-icon
      name="lucideChevronDown"
      [class]="_computedSelectIconClass()"
      aria-hidden="true"
      data-slot="native-select-icon"
    />
  `,
            }]
    }], () => [], { selectId: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectId", required: false }] }], selectClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectClass", required: false }] }], selectIconClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectIconClass", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], forceInvalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "forceInvalid", required: false }] }], ariaInvalidOverride: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-invalid", required: false }] }], valueInput: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmNativeSelect, { className: "HlmNativeSelect", filePath: "libs/ui/native-select/src/lib/hlm-native-select.ts", lineNumber: 68 }); })();
