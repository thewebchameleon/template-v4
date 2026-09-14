import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, input, linkedSignal, model, output, viewChild, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { BrnCheckbox } from '@spartan-ng/brain/checkbox';
import { BrnFieldControlDescribedBy } from '@spartan-ng/brain/field';
import { hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/field";
function HlmCheckbox_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 1);
    i0.ɵɵelement(1, "ng-icon", 2);
    i0.ɵɵelementEnd();
} }
export const HLM_CHECKBOX_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HlmCheckbox),
    multi: true,
};
export class HlmCheckbox {
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    _computedClass = computed(() => hlm('border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary data-[matches-spartan-invalid=true]:aria-checked:border-primary data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border shadow-xs transition-shadow group-has-disabled/field:opacity-50 focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 peer shrink-0 outline-none disabled:cursor-not-allowed disabled:opacity-50', this.userClass(), this._errorStateClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    /** Used to set the id on the underlying brn element. */
    inputId = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "inputId" }] : /* istanbul ignore next */ []));
    /** Used to set the aria-label attribute on the underlying brn element. */
    ariaLabel = input(null, { ...(ngDevMode ? { debugName: "ariaLabel" } : /* istanbul ignore next */ {}), alias: 'aria-label' });
    /** Used to set the aria-labelledby attribute on the underlying brn element. */
    ariaLabelledby = input(null, { ...(ngDevMode ? { debugName: "ariaLabelledby" } : /* istanbul ignore next */ {}), alias: 'aria-labelledby' });
    /** Used to set the aria-describedby attribute on the underlying brn element. */
    ariaDescribedby = input(null, { ...(ngDevMode ? { debugName: "ariaDescribedby" } : /* istanbul ignore next */ {}), alias: 'aria-describedby' });
    /** The checked state of the checkbox. */
    checkedInput = input(false, { ...(ngDevMode ? { debugName: "checkedInput" } : /* istanbul ignore next */ {}), alias: 'checked',
        transform: booleanAttribute });
    checked = linkedSignal(this.checkedInput, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checked" }] : /* istanbul ignore next */ []));
    /** Emits when checked state changes. */
    checkedChange = output();
    /**
     * The indeterminate state of the checkbox.
     * For example, a "select all/deselect all" checkbox may be in the indeterminate state when some but not all of its sub-controls are checked.
     */
    indeterminate = model(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "indeterminate" }] : /* istanbul ignore next */ []));
    /** The name attribute of the checkbox. */
    name = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    /** Whether the checkbox is required. */
    required = input(false, { ...(ngDevMode ? { debugName: "required" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Whether the checkbox is disabled. */
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Whether to force the checkbox into an invalid state. */
    forceInvalid = input(false, { ...(ngDevMode ? { debugName: "forceInvalid" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    _disabled = linkedSignal(this.disabled, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_disabled" }] : /* istanbul ignore next */ []));
    _brnCheckbox = viewChild.required(BrnCheckbox, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_brnCheckbox" }] : /* istanbul ignore next */ []));
    _spartanInvalid = computed(() => this.forceInvalid() || this._brnCheckbox().spartanInvalid?.(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_spartanInvalid" }] : /* istanbul ignore next */ []));
    _errorStateClass = computed(() => this._spartanInvalid()
        ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40'
        : '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_errorStateClass" }] : /* istanbul ignore next */ []));
    _onChange;
    _onTouched;
    _handleChange(value) {
        if (this._disabled())
            return;
        this.checked.set(value);
        this.checkedChange.emit(value);
        this._onChange?.(value);
    }
    /** CONTROL VALUE ACCESSOR */
    writeValue(value) {
        this.checked.set(value);
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
    static ɵfac = function HlmCheckbox_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCheckbox)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmCheckbox, selectors: [["hlm-checkbox"]], viewQuery: function HlmCheckbox_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx._brnCheckbox, BrnCheckbox, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: ["data-slot", "checkbox", 1, "contents", "peer"], hostVars: 3, hostBindings: function HlmCheckbox_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("aria-label", null)("aria-labelledby", null)("data-disabled", ctx._disabled() ? "" : null);
        } }, inputs: { userClass: [1, "class", "userClass"], inputId: [1, "inputId"], ariaLabel: [1, "aria-label", "ariaLabel"], ariaLabelledby: [1, "aria-labelledby", "ariaLabelledby"], ariaDescribedby: [1, "aria-describedby", "ariaDescribedby"], checkedInput: [1, "checked", "checkedInput"], indeterminate: [1, "indeterminate"], name: [1, "name"], required: [1, "required"], disabled: [1, "disabled"], forceInvalid: [1, "forceInvalid"] }, outputs: { checkedChange: "checkedChange", indeterminate: "indeterminateChange" }, features: [i0.ɵɵProvidersFeature([HLM_CHECKBOX_VALUE_ACCESSOR], [provideIcons({ lucideCheck })]), i0.ɵɵHostDirectivesFeature([i1.BrnFieldControlDescribedBy])], decls: 2, vars: 13, consts: [[3, "indeterminateChange", "checkedChange", "touched", "id", "name", "checked", "indeterminate", "disabled", "required", "aria-label", "aria-labelledby", "aria-describedby", "forceInvalid"], [1, "[&>ng-icon]:text-[length:--spacing(3.5)]", "flex", "items-center", "justify-center", "text-current", "transition-none"], ["name", "lucideCheck"]], template: function HlmCheckbox_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "brn-checkbox", 0);
            i0.ɵɵtwoWayListener("indeterminateChange", function HlmCheckbox_Template_brn_checkbox_indeterminateChange_0_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.indeterminate, $event) || (ctx.indeterminate = $event); return $event; });
            i0.ɵɵlistener("checkedChange", function HlmCheckbox_Template_brn_checkbox_checkedChange_0_listener($event) { return ctx._handleChange($event); })("touched", function HlmCheckbox_Template_brn_checkbox_touched_0_listener() { return ctx._onTouched?.(); });
            i0.ɵɵconditionalCreate(1, HlmCheckbox_Conditional_1_Template, 2, 0, "span", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassMap(ctx._computedClass());
            i0.ɵɵproperty("id", ctx.inputId())("name", ctx.name())("checked", ctx.checked());
            i0.ɵɵtwoWayProperty("indeterminate", ctx.indeterminate);
            i0.ɵɵproperty("disabled", ctx._disabled())("required", ctx.required());
            i0.ɵɵariaProperty("aria-label", ctx.ariaLabel())("aria-labelledby", ctx.ariaLabelledby())("aria-describedby", ctx.ariaDescribedby());
            i0.ɵɵproperty("forceInvalid", ctx.forceInvalid());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.checked() || ctx.indeterminate() ? 1 : -1);
        } }, dependencies: [BrnCheckbox, NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCheckbox, [{
        type: Component,
        args: [{
                selector: 'hlm-checkbox',
                imports: [BrnCheckbox, NgIcon],
                providers: [HLM_CHECKBOX_VALUE_ACCESSOR],
                viewProviders: [provideIcons({ lucideCheck })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [BrnFieldControlDescribedBy],
                host: {
                    class: 'contents peer',
                    'data-slot': 'checkbox',
                    '[attr.aria-label]': 'null',
                    '[attr.aria-labelledby]': 'null',
                    '[attr.data-disabled]': '_disabled() ? "" : null',
                },
                template: `
    <brn-checkbox
      [id]="inputId()"
      [name]="name()"
      [class]="_computedClass()"
      [checked]="checked()"
      [(indeterminate)]="indeterminate"
      [disabled]="_disabled()"
      [required]="required()"
      [aria-label]="ariaLabel()"
      [aria-labelledby]="ariaLabelledby()"
      [aria-describedby]="ariaDescribedby()"
      [forceInvalid]="forceInvalid()"
      (checkedChange)="_handleChange($event)"
      (touched)="_onTouched?.()"
    >
      @if (checked() || indeterminate()) {
        <span
          class="[&>ng-icon]:text-[length:--spacing(3.5)] flex items-center justify-center text-current transition-none"
        >
          <ng-icon name="lucideCheck" />
        </span>
      }
    </brn-checkbox>
  `,
            }]
    }], null, { userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }], inputId: [{ type: i0.Input, args: [{ isSignal: true, alias: "inputId", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-label", required: false }] }], ariaLabelledby: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-labelledby", required: false }] }], ariaDescribedby: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-describedby", required: false }] }], checkedInput: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }], checkedChange: [{ type: i0.Output, args: ["checkedChange"] }], indeterminate: [{ type: i0.Input, args: [{ isSignal: true, alias: "indeterminate", required: false }] }, { type: i0.Output, args: ["indeterminateChange"] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], forceInvalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "forceInvalid", required: false }] }], _brnCheckbox: [{ type: i0.ViewChild, args: [i0.forwardRef(() => BrnCheckbox), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmCheckbox, { className: "HlmCheckbox", filePath: "libs/ui/checkbox/src/lib/hlm-checkbox.ts", lineNumber: 69 }); })();
