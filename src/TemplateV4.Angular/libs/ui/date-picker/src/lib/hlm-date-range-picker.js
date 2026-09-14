import { booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChild, forwardRef, input, linkedSignal, output, signal, untracked, viewChild, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnDatePickerTriggerToken, provideBrnDatePicker, } from '@spartan-ng/brain/date-picker';
import { BrnFieldControl, provideBrnLabelable } from '@spartan-ng/brain/field';
import { BrnPopover } from '@spartan-ng/brain/popover';
import { HlmCalendarRange } from '@spartan-ng/helm/calendar';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { injectHlmDateRangePickerConfig } from './hlm-date-range-picker.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/field";
import * as i2 from "@spartan-ng/helm/popover";
const _c0 = ["*", [["", "hlmDatePickerHeader", ""]], [["", "hlmDatePickerFooter", ""]]];
const _c1 = ["*", "[hlmDatePickerHeader]", "[hlmDatePickerFooter]"];
function HlmDateRangePicker_hlm_popover_content_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-popover-content", 2);
    i0.ɵɵprojection(1, 1);
    i0.ɵɵelementStart(2, "hlm-calendar-range", 3);
    i0.ɵɵlistener("startDateChange", function HlmDateRangePicker_hlm_popover_content_2_Template_hlm_calendar_range_startDateChange_2_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1._handleStartDayChange($event)); })("endDateChange", function HlmDateRangePicker_hlm_popover_content_2_Template_hlm_calendar_range_endDateChange_2_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1._handleEndDateChange($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵprojection(3, 2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("startDate", ctx_r1._start())("captionLayout", ctx_r1.captionLayout())("endDate", ctx_r1._end())("min", ctx_r1.minDate())("max", ctx_r1.maxDate())("disabled", ctx_r1._disabled());
} }
export const HLM_DATE_RANGE_PICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HlmDateRangePicker),
    multi: true,
};
export class HlmDateRangePicker {
    _config = injectHlmDateRangePickerConfig();
    popover = viewChild.required(BrnPopover, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "popover" }] : /* istanbul ignore next */ []));
    _trigger = contentChild(BrnDatePickerTriggerToken, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_trigger" }] : /* istanbul ignore next */ []));
    align = input('center', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "align" }] : /* istanbul ignore next */ []));
    /** Show dropdowns to navigate between months or years. */
    captionLayout = input('label', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "captionLayout" }] : /* istanbul ignore next */ []));
    /** The minimum date that can be selected.*/
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
    _mutableDate = linkedSignal(this.date, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_mutableDate" }] : /* istanbul ignore next */ []));
    _start = linkedSignal(() => this._mutableDate()?.[0], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_start" }] : /* istanbul ignore next */ []));
    _end = linkedSignal(() => this._mutableDate()?.[1], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_end" }] : /* istanbul ignore next */ []));
    /** If true, the date picker will close when the end date is selected */
    autoCloseOnEndSelection = input(this._config.autoCloseOnEndSelection, { ...(ngDevMode ? { debugName: "autoCloseOnEndSelection" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Defines how the date should be displayed in the UI.  */
    formatDates = input(this._config.formatDates, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "formatDates" }] : /* istanbul ignore next */ []));
    /** Defines how the date should be transformed before saving to model/form. */
    transformDates = input(this._config.transformDates, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "transformDates" }] : /* istanbul ignore next */ []));
    _popoverState = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_popoverState" }] : /* istanbul ignore next */ []));
    _disabled = linkedSignal(this.disabled, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_disabled" }] : /* istanbul ignore next */ []));
    /** @internal The disabled state as a readonly signal */
    disabledState = this._disabled.asReadonly();
    formattedDate = computed(() => {
        const start = this._start();
        const end = this._end();
        return start || end ? this.formatDates()([start ?? null, end ?? null]) : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "formattedDate" }] : /* istanbul ignore next */ []));
    dateChange = output();
    labelableId = computed(() => this._trigger()?.triggerId(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "labelableId" }] : /* istanbul ignore next */ []));
    hasDate = computed(() => !!this._start() || !!this._end(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasDate" }] : /* istanbul ignore next */ []));
    /** @internal The current raw value, used by inputs to reformat on focus. */
    value = computed(() => this._mutableDate() ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    _onChange;
    _onTouched;
    _onStateChange(state) {
        this._popoverState.set(state);
        if (state === 'closed') {
            this._onClose();
            this._onTouched?.();
        }
    }
    _handleStartDayChange(value) {
        this._start.set(value);
    }
    _handleEndDateChange(value) {
        this._end.set(value);
        if (this._disabled())
            return;
        const start = this._start();
        if (start && value) {
            const transformedDates = this.transformDates()([start, value]);
            this._mutableDate.set(transformedDates);
            this.dateChange.emit(transformedDates);
            this._onChange?.(transformedDates);
            if (this.autoCloseOnEndSelection()) {
                this._popoverState.set('closed');
            }
        }
    }
    /**
     * Commit a range to the picker. Updates the internal model, notifies form
     * controls, and emits `dateChange`. Intended to be called from a text input
     * that parses user-entered values. Pass `null` to clear the range.
     */
    updateDate(value) {
        if (this._disabled())
            return;
        if (!value) {
            this._mutableDate.set(undefined);
            this._start.set(undefined);
            this._end.set(undefined);
            this._onChange?.(null);
            this.dateChange.emit(null);
            return;
        }
        const transformedDates = this.transformDates()(value);
        this._mutableDate.set(transformedDates);
        this._start.set(transformedDates[0]);
        this._end.set(transformedDates[1]);
        this._onChange?.(transformedDates);
        this.dateChange.emit(transformedDates);
    }
    touched() {
        this._onTouched?.();
    }
    /** CONTROL VALUE ACCESSOR */
    writeValue(value) {
        untracked(() => {
            if (!value) {
                this._mutableDate.set(undefined);
            }
            else {
                this._mutableDate.set(this.transformDates()(value));
            }
        });
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
    open() {
        this._popoverState.set('open');
    }
    close() {
        this._popoverState.set('closed');
    }
    reset() {
        this._mutableDate.set(undefined);
        this._start.set(undefined);
        this._end.set(undefined);
        this._onChange?.(null);
        this.dateChange.emit(null);
    }
    _onClose() {
        const dates = this._mutableDate();
        if (this._start() && !this._end() && dates) {
            this._start.set(dates[0]);
            this._end.set(dates[1]);
        }
    }
    static ɵfac = function HlmDateRangePicker_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDateRangePicker)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDateRangePicker, selectors: [["hlm-date-range-picker"]], contentQueries: function HlmDateRangePicker_ContentQueries(rf, ctx, dirIndex) { if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx._trigger, BrnDatePickerTriggerToken, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, viewQuery: function HlmDateRangePicker_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.popover, BrnPopover, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "block"], inputs: { align: [1, "align"], captionLayout: [1, "captionLayout"], minDate: [1, "minDate"], maxDate: [1, "maxDate"], disabled: [1, "disabled"], date: [1, "date"], autoCloseOnEndSelection: [1, "autoCloseOnEndSelection"], formatDates: [1, "formatDates"], transformDates: [1, "transformDates"] }, outputs: { dateChange: "dateChange" }, features: [i0.ɵɵProvidersFeature([
                HLM_DATE_RANGE_PICKER_VALUE_ACCESSOR,
                provideBrnDatePicker(HlmDateRangePicker),
                provideBrnLabelable(HlmDateRangePicker),
            ]), i0.ɵɵHostDirectivesFeature([i1.BrnFieldControl])], ngContentSelectors: _c1, decls: 3, vars: 2, consts: [["sideOffset", "5", 3, "stateChanged", "align", "state"], ["class", "w-fit p-0", 4, "hlmPopoverPortal"], [1, "w-fit", "p-0"], [1, "rounded-none", "border-0", 3, "startDateChange", "endDateChange", "startDate", "captionLayout", "endDate", "min", "max", "disabled"]], template: function HlmDateRangePicker_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵelementStart(0, "hlm-popover", 0);
            i0.ɵɵlistener("stateChanged", function HlmDateRangePicker_Template_hlm_popover_stateChanged_0_listener($event) { return ctx._onStateChange($event); });
            i0.ɵɵprojection(1);
            i0.ɵɵtemplate(2, HlmDateRangePicker_hlm_popover_content_2_Template, 4, 6, "hlm-popover-content", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("align", ctx.align())("state", ctx._popoverState());
        } }, dependencies: [i2.HlmPopover, i2.HlmPopoverContent, i2.HlmPopoverPortal, HlmCalendarRange], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDateRangePicker, [{
        type: Component,
        args: [{
                selector: 'hlm-date-range-picker',
                imports: [HlmPopoverImports, HlmCalendarRange],
                providers: [
                    HLM_DATE_RANGE_PICKER_VALUE_ACCESSOR,
                    provideBrnDatePicker(HlmDateRangePicker),
                    provideBrnLabelable(HlmDateRangePicker),
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
        <hlm-calendar-range
          class="rounded-none border-0"
          [startDate]="_start()"
          [captionLayout]="captionLayout()"
          [endDate]="_end()"
          [min]="minDate()"
          [max]="maxDate()"
          [disabled]="_disabled()"
          (startDateChange)="_handleStartDayChange($event)"
          (endDateChange)="_handleEndDateChange($event)"
        />
        <ng-content select="[hlmDatePickerFooter]" />
      </hlm-popover-content>
    </hlm-popover>
  `,
            }]
    }], null, { popover: [{ type: i0.ViewChild, args: [i0.forwardRef(() => BrnPopover), { isSignal: true }] }], _trigger: [{ type: i0.ContentChild, args: [i0.forwardRef(() => BrnDatePickerTriggerToken), { isSignal: true }] }], align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }], captionLayout: [{ type: i0.Input, args: [{ isSignal: true, alias: "captionLayout", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], date: [{ type: i0.Input, args: [{ isSignal: true, alias: "date", required: false }] }], autoCloseOnEndSelection: [{ type: i0.Input, args: [{ isSignal: true, alias: "autoCloseOnEndSelection", required: false }] }], formatDates: [{ type: i0.Input, args: [{ isSignal: true, alias: "formatDates", required: false }] }], transformDates: [{ type: i0.Input, args: [{ isSignal: true, alias: "transformDates", required: false }] }], dateChange: [{ type: i0.Output, args: ["dateChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDateRangePicker, { className: "HlmDateRangePicker", filePath: "libs/ui/date-picker/src/lib/hlm-date-range-picker.ts", lineNumber: 74 }); })();
