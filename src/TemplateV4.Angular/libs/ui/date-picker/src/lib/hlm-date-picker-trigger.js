import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { injectBrnDatePicker, provideBrnDatePickerTrigger, } from '@spartan-ng/brain/date-picker';
import { BrnFieldControl, BrnFieldControlDescribedBy } from '@spartan-ng/brain/field';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmPopoverTrigger } from '@spartan-ng/helm/popover';
import { hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
const _c0 = ["*"];
function HlmDatePickerTrigger_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", ctx, " ");
} }
function HlmDatePickerTrigger_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵprojection(0);
} }
function HlmDatePickerTrigger_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 2);
} }
export class HlmDatePickerTrigger {
    static _nextId = 0;
    _fieldControl = inject(BrnFieldControl, { optional: true });
    _datePicker = injectBrnDatePicker();
    _invalid = this._fieldControl?.invalid;
    _spartanInvalid = computed(() => this.forceInvalid() || this._fieldControl?.spartanInvalid(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_spartanInvalid" }] : /* istanbul ignore next */ []));
    _dirty = this._fieldControl?.dirty;
    _touched = this._fieldControl?.touched;
    _ariaInvalid = computed(() => (this._invalid?.() ? 'true' : null), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_ariaInvalid" }] : /* istanbul ignore next */ []));
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    _computedClass = computed(() => hlm('data-placeholder:text-muted-foreground justify-between', this.userClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    _isPlaceholder = computed(() => !this._datePicker.hasDate(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_isPlaceholder" }] : /* istanbul ignore next */ []));
    /** The id of the button that opens the date picker. */
    buttonId = input(`hlm-date-picker-${++HlmDatePickerTrigger._nextId}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "buttonId" }] : /* istanbul ignore next */ []));
    /** @internal The id of the button that opens the date picker, used for labeling. */
    triggerId = this.buttonId;
    /** Forces the invalid state visually, regardless of form control state. */
    forceInvalid = input(false, { ...(ngDevMode ? { debugName: "forceInvalid" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    variant = input('outline', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    showTrigger = input(true, { ...(ngDevMode ? { debugName: "showTrigger" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    _popover = this._datePicker.popover;
    _disabled = this._datePicker.disabledState;
    _formattedDate = this._datePicker.formattedDate;
    static ɵfac = function HlmDatePickerTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDatePickerTrigger)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDatePickerTrigger, selectors: [["hlm-date-picker-trigger"]], hostAttrs: ["data-slot", "date-picker-trigger"], inputs: { userClass: [1, "class", "userClass"], buttonId: [1, "buttonId"], forceInvalid: [1, "forceInvalid"], variant: [1, "variant"], showTrigger: [1, "showTrigger"] }, features: [i0.ɵɵProvidersFeature([
                provideIcons({ lucideChevronDown }),
                provideBrnDatePickerTrigger(HlmDatePickerTrigger),
            ])], ngContentSelectors: _c0, decls: 5, vars: 14, consts: [["type", "button", "hlmBtn", "", "hlmPopoverTrigger", "", "brnFieldControlDescribedBy", "", 3, "id", "disabled", "variant", "hlmPopoverTriggerFor"], [1, "truncate"], ["name", "lucideChevronDown"]], template: function HlmDatePickerTrigger_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "button", 0)(1, "span", 1);
            i0.ɵɵconditionalCreate(2, HlmDatePickerTrigger_Conditional_2_Template, 1, 1)(3, HlmDatePickerTrigger_Conditional_3_Template, 1, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, HlmDatePickerTrigger_Conditional_4_Template, 1, 0, "ng-icon", 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_11_0;
            i0.ɵɵclassMap(ctx._computedClass());
            i0.ɵɵproperty("id", ctx.buttonId())("disabled", ctx._disabled())("variant", ctx.variant())("hlmPopoverTriggerFor", ctx._popover());
            i0.ɵɵattribute("aria-invalid", ctx._ariaInvalid())("data-invalid", ctx._ariaInvalid())("data-touched", ctx._touched?.() ? "true" : null)("data-dirty", ctx._dirty?.() ? "true" : null)("data-matches-spartan-invalid", ctx._spartanInvalid() ? "true" : null)("data-placeholder", ctx._isPlaceholder() ? "" : null);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_11_0 = ctx._formattedDate()) ? 2 : 3, tmp_11_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.showTrigger() ? 4 : -1);
        } }, dependencies: [i1.HlmButton, HlmPopoverTrigger, NgIcon, BrnFieldControlDescribedBy], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDatePickerTrigger, [{
        type: Component,
        args: [{
                selector: 'hlm-date-picker-trigger',
                imports: [HlmButtonImports, HlmPopoverTrigger, NgIcon, BrnFieldControlDescribedBy],
                providers: [
                    provideIcons({ lucideChevronDown }),
                    provideBrnDatePickerTrigger(HlmDatePickerTrigger),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: { 'data-slot': 'date-picker-trigger' },
                template: `
    <button
      [id]="buttonId()"
      type="button"
      [class]="_computedClass()"
      [disabled]="_disabled()"
      [attr.aria-invalid]="_ariaInvalid()"
      [attr.data-invalid]="_ariaInvalid()"
      [attr.data-touched]="_touched?.() ? 'true' : null"
      [attr.data-dirty]="_dirty?.() ? 'true' : null"
      [attr.data-matches-spartan-invalid]="_spartanInvalid() ? 'true' : null"
      hlmBtn
      [variant]="variant()"
      hlmPopoverTrigger
      [hlmPopoverTriggerFor]="_popover()"
      brnFieldControlDescribedBy
      [attr.data-placeholder]="_isPlaceholder() ? '' : null"
    >
      <span class="truncate">
        @if (_formattedDate(); as formattedDate) {
          {{ formattedDate }}
        } @else {
          <ng-content />
        }
      </span>

      @if (showTrigger()) {
        <ng-icon name="lucideChevronDown" />
      }
    </button>
  `,
            }]
    }], null, { userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }], buttonId: [{ type: i0.Input, args: [{ isSignal: true, alias: "buttonId", required: false }] }], forceInvalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "forceInvalid", required: false }] }], variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], showTrigger: [{ type: i0.Input, args: [{ isSignal: true, alias: "showTrigger", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDatePickerTrigger, { className: "HlmDatePickerTrigger", filePath: "libs/ui/date-picker/src/lib/hlm-date-picker-trigger.ts", lineNumber: 64 }); })();
