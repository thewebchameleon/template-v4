import { booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChild, forwardRef, input, linkedSignal, numberAttribute, output, signal, viewChild, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnDatePickerTriggerToken, provideBrnDatePicker, } from '@spartan-ng/brain/date-picker';
import { BrnFieldControl, provideBrnLabelable } from '@spartan-ng/brain/field';
import { BrnPopover } from '@spartan-ng/brain/popover';
import { HlmCalendarMulti } from '@spartan-ng/helm/calendar';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { injectHlmDatePickerMultiConfig } from './hlm-date-picker-multi.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/field";
import * as i2 from "@spartan-ng/helm/popover";
const _c0 = ["*", [["", "hlmDatePickerHeader", ""]], [["", "hlmDatePickerFooter", ""]]];
const _c1 = ["*", "[hlmDatePickerHeader]", "[hlmDatePickerFooter]"];
function HlmDatePickerMulti_hlm_popover_content_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-popover-content", 2);
    i0.ɵɵprojection(1, 1);
    i0.ɵɵelementStart(2, "hlm-calendar-multi", 3);
    i0.ɵɵlistener("dateChange", function HlmDatePickerMulti_hlm_popover_content_2_Template_hlm_calendar_multi_dateChange_2_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1._handleChange($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵprojection(3, 2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("date", ctx_r1._mutableDate())("captionLayout", ctx_r1.captionLayout())("min", ctx_r1.minDate())("max", ctx_r1.maxDate())("minSelection", ctx_r1.minSelection())("maxSelection", ctx_r1.maxSelection())("disabled", ctx_r1._disabled());
} }
export const HLM_DATE_PICKER_MULTI_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HlmDatePickerMulti),
    multi: true,
};
export class HlmDatePickerMulti {
    _config = injectHlmDatePickerMultiConfig();
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
    /** The minimum selectable dates.  */
    minSelection = input(undefined, { ...(ngDevMode ? { debugName: "minSelection" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    /** The maximum selectable dates.  */
    maxSelection = input(undefined, { ...(ngDevMode ? { debugName: "maxSelection" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    /** Determine if the date picker is disabled. */
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** The selected value. */
    date = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "date" }] : /* istanbul ignore next */ []));
    _mutableDate = linkedSignal(this.date, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_mutableDate" }] : /* istanbul ignore next */ []));
    /** If true, the date picker will close when the max selection of dates is reached. */
    autoCloseOnMaxSelection = input(this._config.autoCloseOnMaxSelection, { ...(ngDevMode ? { debugName: "autoCloseOnMaxSelection" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
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
        const dates = this._mutableDate();
        return dates ? this.formatDates()(dates) : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "formattedDate" }] : /* istanbul ignore next */ []));
    dateChange = output();
    labelableId = computed(() => this._trigger()?.triggerId(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "labelableId" }] : /* istanbul ignore next */ []));
    hasDate = computed(() => !!this._mutableDate()?.length, /* @ts-ignore */
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
        if (value === undefined)
            return;
        if (this._disabled())
            return;
        const transformedDate = value !== undefined ? this.transformDates()(value) : value;
        this._mutableDate.set(transformedDate);
        this._onChange?.(transformedDate);
        this.dateChange.emit(transformedDate);
        if (this.autoCloseOnMaxSelection() && this._mutableDate()?.length === this.maxSelection()) {
            this._popoverState.set('closed');
        }
    }
    /**
     * Commit dates to the picker. Updates the internal model, notifies form
     * controls, and emits `dateChange`. Intended to be called from a text input
     * that parses user-entered values. Pass `null` to clear the selection.
     */
    updateDate(value) {
        if (this._disabled())
            return;
        const transformedDate = value ? this.transformDates()(value) : undefined;
        this._mutableDate.set(transformedDate);
        this._onChange?.(transformedDate ?? []);
        this.dateChange.emit(transformedDate ?? []);
    }
    touched() {
        this._onTouched?.();
    }
    /** CONTROL VALUE ACCESSOR */
    writeValue(value) {
        this._mutableDate.set(value ? this.transformDates()(value) : undefined);
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
        this._onChange?.([]);
        this.dateChange.emit([]);
    }
    static ɵfac = function HlmDatePickerMulti_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDatePickerMulti)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmDatePickerMulti, selectors: [["hlm-date-picker-multi"]], contentQueries: function HlmDatePickerMulti_ContentQueries(rf, ctx, dirIndex) { if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx._trigger, BrnDatePickerTriggerToken, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, viewQuery: function HlmDatePickerMulti_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.popover, BrnPopover, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "block"], inputs: { align: [1, "align"], captionLayout: [1, "captionLayout"], minDate: [1, "minDate"], maxDate: [1, "maxDate"], minSelection: [1, "minSelection"], maxSelection: [1, "maxSelection"], disabled: [1, "disabled"], date: [1, "date"], autoCloseOnMaxSelection: [1, "autoCloseOnMaxSelection"], formatDates: [1, "formatDates"], transformDates: [1, "transformDates"] }, outputs: { dateChange: "dateChange" }, features: [i0.ɵɵProvidersFeature([
                HLM_DATE_PICKER_MULTI_VALUE_ACCESSOR,
                provideBrnDatePicker(HlmDatePickerMulti),
                provideBrnLabelable(HlmDatePickerMulti),
            ]), i0.ɵɵHostDirectivesFeature([i1.BrnFieldControl])], ngContentSelectors: _c1, decls: 3, vars: 2, consts: [["sideOffset", "5", 3, "stateChanged", "align", "state"], ["class", "w-fit p-0", 4, "hlmPopoverPortal"], [1, "w-fit", "p-0"], [1, "rounded-none", "border-0", 3, "dateChange", "date", "captionLayout", "min", "max", "minSelection", "maxSelection", "disabled"]], template: function HlmDatePickerMulti_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵelementStart(0, "hlm-popover", 0);
            i0.ɵɵlistener("stateChanged", function HlmDatePickerMulti_Template_hlm_popover_stateChanged_0_listener($event) { return ctx._onStateChange($event); });
            i0.ɵɵprojection(1);
            i0.ɵɵtemplate(2, HlmDatePickerMulti_hlm_popover_content_2_Template, 4, 7, "hlm-popover-content", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("align", ctx.align())("state", ctx._popoverState());
        } }, dependencies: [i2.HlmPopover, i2.HlmPopoverContent, i2.HlmPopoverPortal, HlmCalendarMulti], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDatePickerMulti, [{
        type: Component,
        args: [{
                selector: 'hlm-date-picker-multi',
                imports: [HlmPopoverImports, HlmCalendarMulti],
                providers: [
                    HLM_DATE_PICKER_MULTI_VALUE_ACCESSOR,
                    provideBrnDatePicker(HlmDatePickerMulti),
                    provideBrnLabelable(HlmDatePickerMulti),
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
        <hlm-calendar-multi
          class="rounded-none border-0"
          [date]="_mutableDate()"
          [captionLayout]="captionLayout()"
          [min]="minDate()"
          [max]="maxDate()"
          [minSelection]="minSelection()"
          [maxSelection]="maxSelection()"
          [disabled]="_disabled()"
          (dateChange)="_handleChange($event)"
        />
        <ng-content select="[hlmDatePickerFooter]" />
      </hlm-popover-content>
    </hlm-popover>
  `,
            }]
    }], null, { popover: [{ type: i0.ViewChild, args: [i0.forwardRef(() => BrnPopover), { isSignal: true }] }], _trigger: [{ type: i0.ContentChild, args: [i0.forwardRef(() => BrnDatePickerTriggerToken), { isSignal: true }] }], align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }], captionLayout: [{ type: i0.Input, args: [{ isSignal: true, alias: "captionLayout", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], minSelection: [{ type: i0.Input, args: [{ isSignal: true, alias: "minSelection", required: false }] }], maxSelection: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxSelection", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], date: [{ type: i0.Input, args: [{ isSignal: true, alias: "date", required: false }] }], autoCloseOnMaxSelection: [{ type: i0.Input, args: [{ isSignal: true, alias: "autoCloseOnMaxSelection", required: false }] }], formatDates: [{ type: i0.Input, args: [{ isSignal: true, alias: "formatDates", required: false }] }], transformDates: [{ type: i0.Input, args: [{ isSignal: true, alias: "transformDates", required: false }] }], dateChange: [{ type: i0.Output, args: ["dateChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmDatePickerMulti, { className: "HlmDatePickerMulti", filePath: "libs/ui/date-picker/src/lib/hlm-date-picker-multi.ts", lineNumber: 74 }); })();
