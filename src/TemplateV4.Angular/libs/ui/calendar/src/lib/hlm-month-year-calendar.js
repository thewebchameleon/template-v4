import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { BrnCalendarImports, BrnMonthYearCalendar, injectBrnCalendarI18n, } from '@spartan-ng/brain/calendar';
import { injectDateAdapter } from '@spartan-ng/brain/date-time';
import { buttonVariants, HlmButtonImports } from '@spartan-ng/helm/button';
import { classes, hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/calendar";
import * as i2 from "@spartan-ng/helm/button";
function _forTrack0($index, $item) { /* @ts-ignore */
return this._dateAdapter.getYear($item); }
function _forTrack1($index, $item) { /* @ts-ignore */
return this._dateAdapter.getMonth($item); }
function HlmMonthYearCalendar_Case_8_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const year_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassMap(ctx_r1._btnClass);
    i0.ɵɵproperty("date", year_r1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1._i18n.config().formatYear(ctx_r1._dateAdapter.getYear(year_r1)), " ");
} }
function HlmMonthYearCalendar_Case_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵrepeaterCreate(1, HlmMonthYearCalendar_Case_8_For_2_Template, 2, 4, "button", 8, _forTrack0, true);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1._picker.years());
} }
function HlmMonthYearCalendar_Case_9_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const month_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassMap(ctx_r1._btnClass);
    i0.ɵɵproperty("date", month_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1._i18n.config().months()[ctx_r1._dateAdapter.getMonth(month_r3)], " ");
} }
function HlmMonthYearCalendar_Case_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵrepeaterCreate(1, HlmMonthYearCalendar_Case_9_For_2_Template, 2, 4, "button", 10, _forTrack1, true);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1._picker.months());
} }
export class HlmMonthYearCalendar {
    /** Access the calendar i18n */
    _i18n = injectBrnCalendarI18n();
    /** Access the date adapter */
    _dateAdapter = injectDateAdapter();
    /** Access the picker directive */
    _picker = inject((BrnMonthYearCalendar));
    /** The heading for the current view. */
    _heading = computed(() => {
        const config = this._i18n.config();
        if (this._picker.view() === 'month') {
            return config.formatYear(this._dateAdapter.getYear(this._picker.focusedDate()));
        }
        const { start, end } = this._picker.yearRange();
        return `${config.formatYear(start)} – ${config.formatYear(end)}`;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_heading" }] : /* istanbul ignore next */ []));
    _btnClass = hlm(buttonVariants({ variant: 'ghost' }), 'data-[today=true]:bg-muted', 'data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary data-[selected=true]:hover:text-primary-foreground', 'data-[focused=true]:border-ring data-[focused=true]:ring-ring/50 data-[focused=true]:ring-[3px]', 'aria-disabled:pointer-events-none aria-disabled:opacity-50', 'h-(--cell-size)');
    constructor() {
        classes(() => 'p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)] group/calendar bg-background block in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent');
    }
    static ɵfac = function HlmMonthYearCalendar_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmMonthYearCalendar)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmMonthYearCalendar, selectors: [["hlm-month-year-calendar"]], hostAttrs: ["data-slot", "month-year-calendar"], features: [i0.ɵɵProvidersFeature([], [provideIcons({ lucideChevronLeft, lucideChevronRight })]), i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnMonthYearCalendar, inputs: ["min", "min", "max", "max", "disabled", "disabled", "date", "date", "defaultFocusedDate", "defaultFocusedDate", "view", "view"], outputs: ["dateChange", "dateChange"] }])], decls: 10, vars: 2, consts: [[1, "flex", "flex-col", "gap-4"], [1, "flex", "w-full", "items-center", "justify-between", "gap-1.5"], ["brnMonthYearCalendarPreviousButton", "", "hlmBtn", "", "variant", "ghost", 1, "order-first", "size-(--cell-size)", "p-0", "select-none", "aria-disabled:opacity-50"], ["name", "lucideChevronLeft", 1, "rtl:rotate-180"], ["hlmBtn", "", "variant", "ghost", "brnMonthYearCalendarHeader", "", 1, "h-(--cell-size)", "py-0", "select-none", "aria-disabled:opacity-50"], ["brnMonthYearCalendarNextButton", "", "hlmBtn", "", "variant", "ghost", 1, "order-last", "size-(--cell-size)", "p-0", "select-none", "aria-disabled:opacity-50"], ["name", "lucideChevronRight", 1, "rtl:rotate-180"], ["brnMonthYearCalendarGrid", "", 1, "grid", "grid-cols-4", "gap-2"], ["brnMonthYearCalendarYearButton", "", 3, "date", "class"], ["brnMonthYearCalendarYearButton", "", 3, "date"], ["brnMonthYearCalendarMonthButton", "", 3, "date", "class"], ["brnMonthYearCalendarMonthButton", "", 3, "date"]], template: function HlmMonthYearCalendar_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "button", 2);
            i0.ɵɵelement(3, "ng-icon", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "button", 4);
            i0.ɵɵtext(5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "button", 5);
            i0.ɵɵelement(7, "ng-icon", 6);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(8, HlmMonthYearCalendar_Case_8_Template, 3, 0, "div", 7)(9, HlmMonthYearCalendar_Case_9_Template, 3, 0, "div", 7);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", ctx._heading(), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_1_0 = ctx._picker.view()) === "year" ? 8 : tmp_1_0 === "month" ? 9 : -1);
        } }, dependencies: [i1.BrnMonthYearCalendarGrid, i1.BrnMonthYearCalendarHeader, i1.BrnMonthYearCalendarMonthButton, i1.BrnMonthYearCalendarNextButton, i1.BrnMonthYearCalendarPreviousButton, i1.BrnMonthYearCalendarYearButton, NgIcon, i2.HlmButton], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmMonthYearCalendar, [{
        type: Component,
        args: [{
                selector: 'hlm-month-year-calendar',
                imports: [BrnCalendarImports, NgIcon, HlmButtonImports],
                viewProviders: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [
                    {
                        directive: BrnMonthYearCalendar,
                        inputs: ['min', 'max', 'disabled', 'date', 'defaultFocusedDate', 'view'],
                        outputs: ['dateChange'],
                    },
                ],
                host: { 'data-slot': 'month-year-calendar' },
                template: `
    <div class="flex flex-col gap-4">
      <!-- Header -->
      <div class="flex w-full items-center justify-between gap-1.5">
        <button
          brnMonthYearCalendarPreviousButton
          hlmBtn
          variant="ghost"
          class="order-first size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
        >
          <ng-icon name="lucideChevronLeft" class="rtl:rotate-180" />
        </button>

        <button
          hlmBtn
          variant="ghost"
          class="h-(--cell-size) py-0 select-none aria-disabled:opacity-50"
          brnMonthYearCalendarHeader
        >
          {{ _heading() }}
        </button>

        <button
          brnMonthYearCalendarNextButton
          hlmBtn
          variant="ghost"
          class="order-last size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
        >
          <ng-icon name="lucideChevronRight" class="rtl:rotate-180" />
        </button>
      </div>

      <!-- Grid -->
      @switch (_picker.view()) {
        @case ('year') {
          <div brnMonthYearCalendarGrid class="grid grid-cols-4 gap-2">
            @for (year of _picker.years(); track _dateAdapter.getYear(year)) {
              <button brnMonthYearCalendarYearButton [date]="year" [class]="_btnClass">
                {{ _i18n.config().formatYear(_dateAdapter.getYear(year)) }}
              </button>
            }
          </div>
        }
        @case ('month') {
          <div brnMonthYearCalendarGrid class="grid grid-cols-4 gap-2">
            @for (month of _picker.months(); track _dateAdapter.getMonth(month)) {
              <button brnMonthYearCalendarMonthButton [date]="month" [class]="_btnClass">
                {{ _i18n.config().months()[_dateAdapter.getMonth(month)] }}
              </button>
            }
          </div>
        }
      }
    </div>
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmMonthYearCalendar, { className: "HlmMonthYearCalendar", filePath: "libs/ui/calendar/src/lib/hlm-month-year-calendar.ts", lineNumber: 82 }); })();
