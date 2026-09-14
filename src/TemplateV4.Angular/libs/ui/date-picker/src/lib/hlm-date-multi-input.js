import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideX } from '@ng-icons/lucide';
import { BrnDateInput, provideBrnDatePickerTrigger, } from '@spartan-ng/brain/date-picker';
import { BrnFieldControl } from '@spartan-ng/brain/field';
import { HlmInputGroup, HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { injectHlmDatePickerMultiConfig } from './hlm-date-picker-multi.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/input-group";
function HlmDateMultiInput_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 6);
    i0.ɵɵlistener("click", function HlmDateMultiInput_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1._clear()); });
    i0.ɵɵelement(1, "ng-icon", 7);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1._disabled());
    i0.ɵɵattribute("aria-label", ctx_r1.clearAriaLabel());
} }
export class HlmDateMultiInput extends BrnDateInput {
    _config = injectHlmDatePickerMultiConfig();
    _fieldControl = inject(BrnFieldControl, { optional: true });
    _invalid = this._fieldControl?.invalid;
    _spartanInvalid = computed(() => this.forceInvalid() || this._fieldControl?.spartanInvalid(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_spartanInvalid" }] : /* istanbul ignore next */ []));
    _dirty = this._fieldControl?.dirty;
    _touched = this._fieldControl?.touched;
    _ariaInvalid = computed(() => (this._invalid?.() ? 'true' : null), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_ariaInvalid" }] : /* istanbul ignore next */ []));
    /**
     * Parses input text into dates. Return `null` for invalid input - the
     * picker's dates are cleared while the text is preserved so the user can
     * fix it.
     *
     * Defaults to `parseDate` from `HlmDatePickerMultiConfig`.
     */
    parseDate = input(this._config.parseDate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "parseDate" }] : /* istanbul ignore next */ []));
    /**
     * Formats the current dates into the input/edit format shown while the
     * input is focused. On blur the picker's display format is restored.
     *
     * Defaults to `formatInputDates` from `HlmDatePickerMultiConfig`.
     */
    formatInputDates = input(this._config.formatInputDates, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "formatInputDates" }] : /* istanbul ignore next */ []));
    parseValue(value) {
        return this.parseDate()(value);
    }
    formatInputValue(value) {
        return this.formatInputDates()(value);
    }
    static ɵfac = /*@__PURE__*/ (() => { let ɵHlmDateMultiInput_BaseFactory; return function HlmDateMultiInput_Factory(__ngFactoryType__) { return (ɵHlmDateMultiInput_BaseFactory || (ɵHlmDateMultiInput_BaseFactory = i0.ɵɵgetInheritedFactory(HlmDateMultiInput)))(__ngFactoryType__ || HlmDateMultiInput); }; })();
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDateMultiInput, selectors: [["hlm-date-multi-input"]], inputs: { parseDate: [1, "parseDate"], formatInputDates: [1, "formatInputDates"] }, features: [i0.ɵɵProvidersFeature([
                provideIcons({ lucideCalendar, lucideX }),
                provideBrnDatePickerTrigger(HlmDateMultiInput),
            ]), i0.ɵɵHostDirectivesFeature([i1.HlmInputGroup]), i0.ɵɵInheritDefinitionFeature], decls: 6, vars: 13, consts: [["input", ""], ["hlmInputGroupInput", "", 3, "click", "keydown.arrowDown", "keydown.enter", "input", "focus", "blur", "value", "id", "placeholder", "disabled", "forceInvalid"], ["align", "inline-end"], ["hlmInputGroupButton", "", "size", "icon-xs", "variant", "ghost", 3, "disabled"], ["hlmInputGroupButton", "", "size", "icon-xs", 3, "click", "disabled"], ["name", "lucideCalendar"], ["hlmInputGroupButton", "", "size", "icon-xs", "variant", "ghost", 3, "click", "disabled"], ["name", "lucideX"]], template: function HlmDateMultiInput_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "input", 1, 0);
            i0.ɵɵlistener("click", function HlmDateMultiInput_Template_input_click_0_listener() { return ctx._handleClick(); })("keydown.arrowDown", function HlmDateMultiInput_Template_input_keydown_arrowDown_0_listener() { return ctx._open(); })("keydown.enter", function HlmDateMultiInput_Template_input_keydown_enter_0_listener($event) { return ctx._handleEnter($event); })("input", function HlmDateMultiInput_Template_input_input_0_listener($event) { return ctx._handleInputChange($event); })("focus", function HlmDateMultiInput_Template_input_focus_0_listener() { return ctx._handleFocus(); })("blur", function HlmDateMultiInput_Template_input_blur_0_listener() { return ctx._handleBlur(); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "hlm-input-group-addon", 2);
            i0.ɵɵconditionalCreate(3, HlmDateMultiInput_Conditional_3_Template, 2, 2, "button", 3);
            i0.ɵɵelementStart(4, "button", 4);
            i0.ɵɵlistener("click", function HlmDateMultiInput_Template_button_click_4_listener() { return ctx._popover().open(); });
            i0.ɵɵelement(5, "ng-icon", 5);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵproperty("value", ctx._inputValue())("id", ctx.inputId())("placeholder", ctx.placeholder())("disabled", ctx._disabled())("forceInvalid", ctx.forceInvalid());
            i0.ɵɵattribute("aria-invalid", ctx._ariaInvalid())("data-invalid", ctx._ariaInvalid())("data-touched", ctx._touched?.() ? "true" : null)("data-dirty", ctx._dirty?.() ? "true" : null)("data-matches-spartan-invalid", ctx._spartanInvalid() ? "true" : null);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx._showClearButton() ? 3 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx._disabled());
            i0.ɵɵattribute("aria-label", ctx.calendarAriaLabel());
        } }, dependencies: [i1.HlmInputGroupAddon, i1.HlmInputGroupButton, i1.HlmInputGroupInput, NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDateMultiInput, [{
        type: Component,
        args: [{
                selector: 'hlm-date-multi-input',
                imports: [HlmInputGroupImports, NgIcon],
                providers: [
                    provideIcons({ lucideCalendar, lucideX }),
                    provideBrnDatePickerTrigger(HlmDateMultiInput),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [HlmInputGroup],
                template: `
    <input
      #input
      hlmInputGroupInput
      [value]="_inputValue()"
      [id]="inputId()"
      [placeholder]="placeholder()"
      [disabled]="_disabled()"
      [forceInvalid]="forceInvalid()"
      [attr.aria-invalid]="_ariaInvalid()"
      [attr.data-invalid]="_ariaInvalid()"
      [attr.data-touched]="_touched?.() ? 'true' : null"
      [attr.data-dirty]="_dirty?.() ? 'true' : null"
      [attr.data-matches-spartan-invalid]="_spartanInvalid() ? 'true' : null"
      (click)="_handleClick()"
      (keydown.arrowDown)="_open()"
      (keydown.enter)="_handleEnter($event)"
      (input)="_handleInputChange($event)"
      (focus)="_handleFocus()"
      (blur)="_handleBlur()"
    />
    <hlm-input-group-addon align="inline-end">
      @if (_showClearButton()) {
        <button
          hlmInputGroupButton
          size="icon-xs"
          variant="ghost"
          [attr.aria-label]="clearAriaLabel()"
          (click)="_clear()"
          [disabled]="_disabled()"
        >
          <ng-icon name="lucideX" />
        </button>
      }
      <button
        hlmInputGroupButton
        size="icon-xs"
        [attr.aria-label]="calendarAriaLabel()"
        (click)="_popover().open()"
        [disabled]="_disabled()"
      >
        <ng-icon name="lucideCalendar" />
      </button>
    </hlm-input-group-addon>
  `,
            }]
    }], null, { parseDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "parseDate", required: false }] }], formatInputDates: [{ type: i0.Input, args: [{ isSignal: true, alias: "formatInputDates", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDateMultiInput, { className: "HlmDateMultiInput", filePath: "libs/ui/date-picker/src/lib/hlm-date-multi-input.ts", lineNumber: 68 }); })();
