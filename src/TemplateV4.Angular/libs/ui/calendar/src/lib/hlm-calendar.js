import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { BrnCalendar, BrnCalendarImports, injectBrnCalendarI18n } from '@spartan-ng/brain/calendar';
import { injectDateAdapter } from '@spartan-ng/brain/date-time';
import { buttonVariants, HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { classes, hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/calendar";
import * as i2 from "@spartan-ng/helm/select";
import * as i3 from "@spartan-ng/helm/button";
function _forTrack0($index, $item) { /* @ts-ignore */
return this._dateAdapter.getTime($item); }
function HlmCalendar_ng_template_2_hlm_select_content_3_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const month_r1 = ctx.$implicit;
    i0.ɵɵproperty("value", month_r1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(month_r1);
} }
function HlmCalendar_ng_template_2_hlm_select_content_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 18)(1, "hlm-select-group");
    i0.ɵɵrepeaterCreate(2, HlmCalendar_ng_template_2_hlm_select_content_3_For_3_Template, 2, 2, "hlm-select-item", 19, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1._i18n.config().months());
} }
function HlmCalendar_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select", 15)(1, "hlm-select-trigger", 16);
    i0.ɵɵelement(2, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, HlmCalendar_ng_template_2_hlm_select_content_3_Template, 4, 0, "hlm-select-content", 17);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx_r1._selectClass);
} }
function HlmCalendar_ng_template_4_hlm_select_content_3_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-item", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const year_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", year_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(year_r3);
} }
function HlmCalendar_ng_template_4_hlm_select_content_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select-content", 18)(1, "hlm-select-group");
    i0.ɵɵrepeaterCreate(2, HlmCalendar_ng_template_4_hlm_select_content_3_For_3_Template, 2, 2, "hlm-select-item", 19, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1._i18n.config().years());
} }
function HlmCalendar_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-select", 20)(1, "hlm-select-trigger", 16);
    i0.ɵɵelement(2, "hlm-select-value");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, HlmCalendar_ng_template_4_hlm_select_content_3_Template, 4, 0, "hlm-select-content", 17);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx_r1._selectClass);
} }
function HlmCalendar_Case_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 21)(1, 21);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const month_r4 = i0.ɵɵreference(3);
    const year_r5 = i0.ɵɵreference(5);
    i0.ɵɵproperty("ngTemplateOutlet", month_r4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", year_r5);
} }
function HlmCalendar_Case_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 21);
    i0.ɵɵelementStart(1, "div", 22);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const month_r4 = i0.ɵɵreference(3);
    const heading_r6 = i0.ɵɵreadContextLet(6);
    i0.ɵɵproperty("ngTemplateOutlet", month_r4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(heading_r6.year);
} }
function HlmCalendar_Case_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 23);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainer(2, 21);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const year_r5 = i0.ɵɵreference(5);
    const heading_r6 = i0.ɵɵreadContextLet(6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(heading_r6.month);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", year_r5);
} }
function HlmCalendar_Case_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const heading_r6 = i0.ɵɵreadContextLet(6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(heading_r6.header);
} }
function HlmCalendar_th_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const weekday_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", ctx_r1._i18n.config().labelWeekday(weekday_r7));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1._i18n.config().formatWeekdayName(weekday_r7), " ");
} }
function HlmCalendar_tr_20_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 26)(1, "button", 27);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const date_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(ctx_r1._btnClass);
    i0.ɵɵproperty("date", date_r8);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1._dateAdapter.getDate(date_r8), " ");
} }
function HlmCalendar_tr_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr", 25);
    i0.ɵɵrepeaterCreate(1, HlmCalendar_tr_20_For_2_Template, 3, 4, "td", 26, _forTrack0, true);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const week_r9 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵrepeater(week_r9);
} }
export class HlmCalendar {
    /** Access the calendar i18n */
    _i18n = injectBrnCalendarI18n();
    /** Access the date time adapter */
    _dateAdapter = injectDateAdapter();
    /** Show dropdowns to navigate between months or years. */
    captionLayout = input('label', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "captionLayout" }] : /* istanbul ignore next */ []));
    /** Access the calendar directive */
    _calendar = inject(BrnCalendar);
    /** Get the heading for the current month and year */
    _heading = computed(() => {
        const config = this._i18n.config();
        const date = this._calendar.focusedDate();
        return {
            header: config.formatHeader(this._dateAdapter.getMonth(date), this._dateAdapter.getYear(date)),
            month: config.formatMonth(this._dateAdapter.getMonth(date)),
            year: config.formatYear(this._dateAdapter.getYear(date)),
        };
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_heading" }] : /* istanbul ignore next */ []));
    _btnClass = hlm(buttonVariants({ variant: 'ghost', size: 'icon' }), 'data-[today=true]:bg-muted group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:bg-muted/50 dark:hover:text-foreground relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-e-(--cell-radius) data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-s-(--cell-radius) [&>span]:text-xs [&>span]:opacity-70', 'data-[outside=true]:opacity-50', "data-[highlighted]:before:content-['']", 'data-[highlighted]:before:absolute', 'data-[highlighted]:before:bottom-1', 'data-[highlighted]:before:start-1/2', 'data-[highlighted]:before:h-1', 'data-[highlighted]:before:w-1', 'data-[highlighted]:before:-translate-x-1/2', 'data-[highlighted]:before:rounded-full', 'data-[highlighted]:before:bg-destructive');
    _selectClass = 'gap-0 px-1.5 py-2 [&>ng-icon]:ms-1';
    constructor() {
        classes(() => 'p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)] group/calendar bg-background block in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent');
    }
    static ɵfac = function HlmCalendar_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCalendar)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmCalendar, selectors: [["hlm-calendar"]], hostAttrs: ["data-slot", "calendar"], inputs: { captionLayout: [1, "captionLayout"] }, features: [i0.ɵɵProvidersFeature([], [provideIcons({ lucideChevronLeft, lucideChevronRight })]), i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnCalendar, inputs: ["min", "min", "max", "max", "disabled", "disabled", "date", "date", "dateDisabled", "dateDisabled", "weekStartsOn", "weekStartsOn", "highlightDays", "highlightDays", "defaultFocusedDate", "defaultFocusedDate"], outputs: ["dateChange", "dateChange"] }])], decls: 21, vars: 2, consts: [["month", ""], ["year", ""], [1, "inline-flex", "flex-col", "gap-4"], [1, "flex", "w-full", "items-center", "justify-between", "gap-1.5"], ["brnCalendarPreviousButton", "", "variant", "ghost", "hlmBtn", "", 1, "order-first", "size-(--cell-size)", "p-0", "select-none", "aria-disabled:opacity-50"], ["name", "lucideChevronLeft", 1, "rtl:rotate-180"], ["brnCalendarHeader", "", 1, "order-5", "text-sm", "font-medium"], ["brnCalendarNextButton", "", "hlmBtn", "", "variant", "ghost", 1, "order-last", "size-(--cell-size)", "p-0", "select-none", "aria-disabled:opacity-50"], ["name", "lucideChevronRight", 1, "rtl:rotate-180"], ["brnCalendarGrid", "", 1, "w-full", "border-collapse", "space-y-1"], ["aria-hidden", "true"], [1, "flex"], ["scope", "col", "class", "text-muted-foreground flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal select-none", 4, "brnCalendarWeekday"], ["role", "rowgroup"], ["class", "mt-2 flex w-full", 4, "brnCalendarWeek"], ["brnCalendarMonthSelect", "", 1, "order-1"], ["size", "sm"], ["class", "max-h-80", 4, "hlmSelectPortal"], [1, "max-h-80"], [3, "value"], ["brnCalendarYearSelect", "", 1, "order-3"], [3, "ngTemplateOutlet"], ["brnCalendarHeader", "", 1, "order-4", "text-sm", "font-medium"], ["brnCalendarHeader", "", 1, "order-2", "text-sm", "font-medium"], ["scope", "col", 1, "text-muted-foreground", "flex-1", "rounded-(--cell-radius)", "text-[0.8rem]", "font-normal", "select-none"], [1, "mt-2", "flex", "w-full"], ["brnCalendarCell", "", 1, "group/day", "relative", "aspect-square", "h-full", "w-full", "rounded-(--cell-radius)", "p-0", "text-center", "select-none", "[&:first-child[data-selected=true]_button]:rounded-s-(--cell-radius)", "[&:last-child[data-selected=true]_button]:rounded-e-(--cell-radius)"], ["brnCalendarCellButton", "", 3, "date"]], template: function HlmCalendar_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 2)(1, "div", 3);
            i0.ɵɵtemplate(2, HlmCalendar_ng_template_2_Template, 4, 2, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor)(4, HlmCalendar_ng_template_4_Template, 4, 2, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵdeclareLet(6);
            i0.ɵɵelementStart(7, "button", 4);
            i0.ɵɵelement(8, "ng-icon", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(9, HlmCalendar_Case_9_Template, 2, 2)(10, HlmCalendar_Case_10_Template, 3, 2)(11, HlmCalendar_Case_11_Template, 3, 2)(12, HlmCalendar_Case_12_Template, 2, 1, "div", 6);
            i0.ɵɵelementStart(13, "button", 7);
            i0.ɵɵelement(14, "ng-icon", 8);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(15, "table", 9)(16, "thead", 10)(17, "tr", 11);
            i0.ɵɵtemplate(18, HlmCalendar_th_18_Template, 2, 2, "th", 12);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(19, "tbody", 13);
            i0.ɵɵtemplate(20, HlmCalendar_tr_20_Template, 3, 0, "tr", 14);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            let tmp_3_0;
            i0.ɵɵadvance(6);
            i0.ɵɵstoreLet(ctx._heading());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_3_0 = ctx.captionLayout()) === "dropdown" ? 9 : tmp_3_0 === "dropdown-months" ? 10 : tmp_3_0 === "dropdown-years" ? 11 : tmp_3_0 === "label" ? 12 : -1);
        } }, dependencies: [i1.BrnCalendarCellButton, i1.BrnCalendarGrid, i1.BrnCalendarHeader, i1.BrnCalendarNextButton, i1.BrnCalendarPreviousButton, i1.BrnCalendarWeek, i1.BrnCalendarWeekday, i1.BrnCalendarCell, i1.BrnCalendarMonthSelect, i1.BrnCalendarYearSelect, NgIcon, i2.HlmSelect, i2.HlmSelectContent, i2.HlmSelectGroup, i2.HlmSelectItem, i2.HlmSelectPortal, i2.HlmSelectTrigger, i2.HlmSelectValue, NgTemplateOutlet, i3.HlmButton], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCalendar, [{
        type: Component,
        args: [{
                selector: 'hlm-calendar',
                imports: [BrnCalendarImports, NgIcon, HlmSelectImports, NgTemplateOutlet, HlmButtonImports],
                viewProviders: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [
                    {
                        directive: BrnCalendar,
                        inputs: [
                            'min',
                            'max',
                            'disabled',
                            'date',
                            'dateDisabled',
                            'weekStartsOn',
                            'highlightDays',
                            'defaultFocusedDate',
                        ],
                        outputs: ['dateChange'],
                    },
                ],
                host: { 'data-slot': 'calendar' },
                template: `
    <div class="inline-flex flex-col gap-4">
      <!-- Header -->
      <div class="flex w-full items-center justify-between gap-1.5">
        <ng-template #month>
          <hlm-select brnCalendarMonthSelect class="order-1">
            <hlm-select-trigger size="sm" [class]="_selectClass">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal class="max-h-80">
              <hlm-select-group>
                @for (month of _i18n.config().months(); track month) {
                  <hlm-select-item [value]="month">{{ month }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>
        </ng-template>
        <ng-template #year>
          <hlm-select brnCalendarYearSelect class="order-3">
            <hlm-select-trigger size="sm" [class]="_selectClass">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal class="max-h-80">
              <hlm-select-group>
                @for (year of _i18n.config().years(); track year) {
                  <hlm-select-item [value]="year">{{ year }}</hlm-select-item>
                }
              </hlm-select-group>
            </hlm-select-content>
          </hlm-select>
        </ng-template>
        @let heading = _heading();

        <button
          brnCalendarPreviousButton
          variant="ghost"
          hlmBtn
          class="order-first size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
        >
          <ng-icon name="lucideChevronLeft" class="rtl:rotate-180" />
        </button>

        @switch (captionLayout()) {
          @case ('dropdown') {
            <ng-container [ngTemplateOutlet]="month" />
            <ng-container [ngTemplateOutlet]="year" />
          }
          @case ('dropdown-months') {
            <ng-container [ngTemplateOutlet]="month" />
            <div brnCalendarHeader class="order-4 text-sm font-medium">{{ heading.year }}</div>
          }
          @case ('dropdown-years') {
            <div brnCalendarHeader class="order-2 text-sm font-medium">{{ heading.month }}</div>
            <ng-container [ngTemplateOutlet]="year" />
          }
          @case ('label') {
            <div brnCalendarHeader class="order-5 text-sm font-medium">{{ heading.header }}</div>
          }
        }

        <button
          brnCalendarNextButton
          hlmBtn
          variant="ghost"
          class="order-last size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
        >
          <ng-icon name="lucideChevronRight" class="rtl:rotate-180" />
        </button>
      </div>

      <table class="w-full border-collapse space-y-1" brnCalendarGrid>
        <thead aria-hidden="true">
          <tr class="flex">
            <th
              *brnCalendarWeekday="let weekday"
              scope="col"
              class="text-muted-foreground flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal select-none"
              [attr.aria-label]="_i18n.config().labelWeekday(weekday)"
            >
              {{ _i18n.config().formatWeekdayName(weekday) }}
            </th>
          </tr>
        </thead>

        <tbody role="rowgroup">
          <tr *brnCalendarWeek="let week" class="mt-2 flex w-full">
            @for (date of week; track _dateAdapter.getTime(date)) {
              <td
                brnCalendarCell
                class="group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-s-(--cell-radius) [&:last-child[data-selected=true]_button]:rounded-e-(--cell-radius)"
              >
                <button brnCalendarCellButton [date]="date" [class]="_btnClass">
                  {{ _dateAdapter.getDate(date) }}
                </button>
              </td>
            }
          </tr>
        </tbody>
      </table>
    </div>
  `,
            }]
    }], () => [], { captionLayout: [{ type: i0.Input, args: [{ isSignal: true, alias: "captionLayout", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmCalendar, { className: "HlmCalendar", filePath: "libs/ui/calendar/src/lib/hlm-calendar.ts", lineNumber: 136 }); })();
