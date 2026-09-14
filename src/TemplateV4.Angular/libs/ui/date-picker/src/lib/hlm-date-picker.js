import { booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChild, forwardRef, input, linkedSignal, output, signal, viewChild, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnDatePickerTriggerToken, provideBrnDatePicker, } from '@spartan-ng/brain/date-picker';
import { BrnFieldControl, provideBrnLabelable } from '@spartan-ng/brain/field';
import { BrnPopover } from '@spartan-ng/brain/popover';
import { HlmCalendar } from '@spartan-ng/helm/calendar';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { injectHlmDatePickerConfig } from './hlm-date-picker.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/field";
import * as i2 from "@spartan-ng/helm/popover";
const _c0 = ["*", [["", "hlmDatePickerHeader", ""]], [["", "hlmDatePickerFooter", ""]]];
const _c1 = ["*", "[hlmDatePickerHeader]", "[hlmDatePickerFooter]"];
function HlmDatePicker_hlm_popover_content_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-popover-content", 2);
    i0.ɵɵprojection(1, 1);
    i0.ɵɵelementStart(2, "hlm-calendar", 3);
    i0.ɵɵlistener("dateChange", function HlmDatePicker_hlm_popover_content_2_Template_hlm_calendar_dateChange_2_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1._handleChange($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵprojection(3, 2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("captionLayout", ctx_r1.captionLayout())("date", ctx_r1._mutableDate())("defaultFocusedDate", ctx_r1._mutableDate() ?? ctx_r1.defaultFocusedDate())("min", ctx_r1.minDate())("max", ctx_r1.maxDate())("disabled", ctx_r1._disabled());
} }
export const HLM_DATE_PICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HlmDatePicker),
    multi: true,
};
export class HlmDatePicker {
    _config = injectHlmDatePickerConfig();
    popover = viewChild.required(BrnPopover, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "popover" }] : /* istanbul ignore next */ []));
    _trigger = contentChild(BrnDatePickerTriggerToken, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_trigger" }] : /* istanbul ignore next */ []));
    align = input('center', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "align" }] : /* istanbul ignore next */ []));
    /** Show dropdowns to navigate between months or years. */
    captionLayout = input('label', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "captionLayout" }] : /* istanbul ignore next */ []));
    /** The minimum date that can be selected. */
    minDate = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "minDate" }] : /* istanbul ignore next */ []));
    /** The maximum date that can be selected. */
    maxDate = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "maxDate" }] : /* istanbul ignore next */ []));
    /** Determine if the date picker is disabled. */
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** The selected value. */
    date = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "date" }] : /* istanbul ignore next */ []));
    /** The date the calendar focuses on first open when no date is selected. */
    defaultFocusedDate = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "defaultFocusedDate" }] : /* istanbul ignore next */ []));
    _mutableDate = linkedSignal(this.date, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_mutableDate" }] : /* istanbul ignore next */ []));
    /** If true, the date picker will close when a date is selected. */
    autoCloseOnSelect = input(this._config.autoCloseOnSelect, { ...(ngDevMode ? { debugName: "autoCloseOnSelect" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Defines how the date should be displayed in the UI.  */
    formatDate = input(this._config.formatDate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "formatDate" }] : /* istanbul ignore next */ []));
    /** Defines how the date should be transformed before saving to model/form. */
    transformDate = input(this._config.transformDate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "transformDate" }] : /* istanbul ignore next */ []));
    _popoverState = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_popoverState" }] : /* istanbul ignore next */ []));
    _disabled = linkedSignal(this.disabled, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_disabled" }] : /* istanbul ignore next */ []));
    /** @internal The disabled state as a readonly signal */
    disabledState = this._disabled.asReadonly();
    formattedDate = computed(() => {
        const date = this._mutableDate();
        return date ? this.formatDate()(date) : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "formattedDate" }] : /* istanbul ignore next */ []));
    dateChange = output();
    labelableId = computed(() => this._trigger()?.triggerId(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "labelableId" }] : /* istanbul ignore next */ []));
    hasDate = computed(() => !!this._mutableDate(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasDate" }] : /* istanbul ignore next */ []));
    /** @internal The current raw value, used by inputs to reformat on focus. */
    value = computed(() => this._mutableDate() ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    _onChange;
    _onTouched;
    _onStateChange(state) {
        this._popoverState.set(state);
        if (state === 'closed')
            this._onTouched?.();
    }
    _handleChange(value) {
        if (this._disabled())
            return;
        this.updateDate(value ?? null);
        if (this.autoCloseOnSelect()) {
            this._popoverState.set('closed');
        }
    }
    /**
     * Commit a date to the picker. Updates the internal model, notifies form
     * controls, and emits `dateChange`. Unlike `_handleChange`, this does not
     * close the popover - it's intended to be called from a text input that
     * is parsing user-entered values while typing.
     */
    updateDate(value) {
        if (this._disabled())
            return;
        const transformedDate = value != null ? this.transformDate()(value) : undefined;
        this._mutableDate.set(transformedDate);
        this._onChange?.(transformedDate ?? null);
        this.dateChange.emit(transformedDate ?? null);
    }
    /** CONTROL VALUE ACCESSOR */
    writeValue(value) {
        this._mutableDate.set(value ? this.transformDate()(value) : undefined);
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    touched() {
        this._onTouched?.();
    }
    setDisabledState(isDisabled) {
        this._disabled.set(isDisabled);
    }
    open() {
        this._popoverState.set('open');
    }
    close() {
        this._popoverState.set('closed');
    }
    reset() {
        this._mutableDate.set(undefined);
        this._onChange?.(null);
        this.dateChange.emit(null);
    }
    static ɵfac = function HlmDatePicker_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDatePicker)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDatePicker, selectors: [["hlm-date-picker"]], contentQueries: function HlmDatePicker_ContentQueries(rf, ctx, dirIndex) { if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx._trigger, BrnDatePickerTriggerToken, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, viewQuery: function HlmDatePicker_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.popover, BrnPopover, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "block"], inputs: { align: [1, "align"], captionLayout: [1, "captionLayout"], minDate: [1, "minDate"], maxDate: [1, "maxDate"], disabled: [1, "disabled"], date: [1, "date"], defaultFocusedDate: [1, "defaultFocusedDate"], autoCloseOnSelect: [1, "autoCloseOnSelect"], formatDate: [1, "formatDate"], transformDate: [1, "transformDate"] }, outputs: { dateChange: "dateChange" }, features: [i0.ɵɵProvidersFeature([
                HLM_DATE_PICKER_VALUE_ACCESSOR,
                provideBrnDatePicker(HlmDatePicker),
                provideBrnLabelable(HlmDatePicker),
            ]), i0.ɵɵHostDirectivesFeature([i1.BrnFieldControl])], ngContentSelectors: _c1, decls: 3, vars: 2, consts: [["sideOffset", "5", 3, "stateChanged", "align", "state"], ["class", "w-fit p-0", 4, "hlmPopoverPortal"], [1, "w-fit", "p-0"], [1, "rounded-none", "border-0", 3, "dateChange", "captionLayout", "date", "defaultFocusedDate", "min", "max", "disabled"]], template: function HlmDatePicker_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵelementStart(0, "hlm-popover", 0);
            i0.ɵɵlistener("stateChanged", function HlmDatePicker_Template_hlm_popover_stateChanged_0_listener($event) { return ctx._onStateChange($event); });
            i0.ɵɵprojection(1);
            i0.ɵɵtemplate(2, HlmDatePicker_hlm_popover_content_2_Template, 4, 6, "hlm-popover-content", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("align", ctx.align())("state", ctx._popoverState());
        } }, dependencies: [i2.HlmPopover, i2.HlmPopoverContent, i2.HlmPopoverPortal, HlmCalendar], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDatePicker, [{
        type: Component,
        args: [{
                selector: 'hlm-date-picker',
                imports: [HlmPopoverImports, HlmCalendar],
                providers: [
                    HLM_DATE_PICKER_VALUE_ACCESSOR,
                    provideBrnDatePicker(HlmDatePicker),
                    provideBrnLabelable(HlmDatePicker),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [BrnFieldControl],
                host: { class: 'block' },
                template: `
    <hlm-popover
      [align]="align()"
      sideOffset="5"
      [state]="_popoverState()"
      (stateChanged)="_onStateChange($event)"
    >
      <ng-content />

      <hlm-popover-content class="w-fit p-0" *hlmPopoverPortal="let ctx">
        <ng-content select="[hlmDatePickerHeader]" />
        <hlm-calendar
          class="rounded-none border-0"
          [captionLayout]="captionLayout()"
          [date]="_mutableDate()"
          [defaultFocusedDate]="_mutableDate() ?? defaultFocusedDate()"
          [min]="minDate()"
          [max]="maxDate()"
          [disabled]="_disabled()"
          (dateChange)="_handleChange($event)"
        />
        <ng-content select="[hlmDatePickerFooter]" />
      </hlm-popover-content>
    </hlm-popover>
  `,
            }]
    }], null, { popover: [{ type: i0.ViewChild, args: [i0.forwardRef(() => BrnPopover), { isSignal: true }] }], _trigger: [{ type: i0.ContentChild, args: [i0.forwardRef(() => BrnDatePickerTriggerToken), { isSignal: true }] }], align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }], captionLayout: [{ type: i0.Input, args: [{ isSignal: true, alias: "captionLayout", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], date: [{ type: i0.Input, args: [{ isSignal: true, alias: "date", required: false }] }], defaultFocusedDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "defaultFocusedDate", required: false }] }], autoCloseOnSelect: [{ type: i0.Input, args: [{ isSignal: true, alias: "autoCloseOnSelect", required: false }] }], formatDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "formatDate", required: false }] }], transformDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "transformDate", required: false }] }], dateChange: [{ type: i0.Output, args: ["dateChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDatePicker, { className: "HlmDatePicker", filePath: "libs/ui/date-picker/src/lib/hlm-date-picker.ts", lineNumber: 72 }); })();
