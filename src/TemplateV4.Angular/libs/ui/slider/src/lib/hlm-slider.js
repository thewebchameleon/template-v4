import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrnSlider, BrnSliderImports, injectBrnSlider } from '@spartan-ng/brain/slider';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/slider";
function HlmSlider_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 3);
} }
function HlmSlider_Conditional_5_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵelement(1, "div", 7);
    i0.ɵɵelementStart(2, "div", 8);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const formattedTick_r1 = ctx.formattedTick;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(formattedTick_r1);
} }
function HlmSlider_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵtemplate(1, HlmSlider_Conditional_5_div_1_Template, 4, 1, "div", 5);
    i0.ɵɵelementEnd();
} }
export class HlmSlider {
    _slider = injectBrnSlider();
    constructor() {
        classes(() => [
            'group flex w-full touch-none flex-col select-none data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-row data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        ]);
    }
    static ɵfac = function HlmSlider_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSlider)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSlider, selectors: [["hlm-slider"], ["brn-slider", "hlm", ""]], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnSlider, inputs: ["id", "id", "value", "value", "disabled", "disabled", "min", "min", "max", "max", "step", "step", "minStepsBetweenThumbs", "minStepsBetweenThumbs", "maxStepsBetweenThumbs", "maxStepsBetweenThumbs", "preventStepOverThumb", "preventStepOverThumb", "inverted", "inverted", "orientation", "orientation", "showTicks", "showTicks", "maxTicks", "maxTicks", "tickLabelInterval", "tickLabelInterval", "formatTick", "formatTick", "draggableRange", "draggableRange", "draggableRangeOnly", "draggableRangeOnly", "aria-label", "aria-label", "aria-labelledby", "aria-labelledby"], outputs: ["valueChange", "valueChange"] }])], decls: 6, vars: 1, consts: [[1, "relative", "flex", "w-full", "items-center", "group-data-vertical:w-auto", "group-data-vertical:flex-col"], ["brnSliderTrack", "", 1, "bg-muted", "rounded-full", "data-horizontal:h-1.5", "data-horizontal:w-full", "data-vertical:h-full", "data-vertical:w-1.5", "relative", "grow", "overflow-hidden"], ["brnSliderRange", "", 1, "bg-primary", "absolute", "select-none", "data-draggable-range:cursor-move", "data-horizontal:h-full", "data-vertical:w-full"], ["brnSliderThumb", "", 1, "border-primary", "ring-ring/50", "size-4", "rounded-full", "border", "bg-white", "shadow-sm", "transition-[color,box-shadow]", "hover:ring-4", "focus-visible:ring-4", "focus-visible:outline-hidden", "absolute", "block", "shrink-0", "select-none", "after:absolute", "after:-inset-2"], [1, "px-2", "group-data-vertical:px-0", "group-data-vertical:py-2", "text-muted-foreground", "mt-3", "flex", "w-full", "items-start", "justify-between", "gap-1", "text-xs", "font-medium", "group-data-horizontal:group-data-inverted:flex-row-reverse", "group-data-vertical:ms-3", "group-data-vertical:mt-0", "group-data-vertical:w-auto", "group-data-vertical:flex-col-reverse", "group-data-vertical:group-data-inverted:flex-col"], ["class", "group flex w-0 flex-col items-center justify-center gap-2 group-data-vertical:h-0 group-data-vertical:w-auto group-data-vertical:flex-row", 4, "brnSliderTick"], [1, "group", "flex", "w-0", "flex-col", "items-center", "justify-center", "gap-2", "group-data-vertical:h-0", "group-data-vertical:w-auto", "group-data-vertical:flex-row"], [1, "bg-muted-foreground/70", "h-1", "w-px", "group-data-vertical:h-px", "group-data-vertical:w-1", "group-data-horizontal:group-data-[skip]:h-0.5", "group-data-vertical:group-data-[skip]:w-0.5"], [1, "text-center", "group-data-[skip]:opacity-0"]], template: function HlmSlider_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵelement(2, "div", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(3, HlmSlider_For_4_Template, 1, 0, "span", 3, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, HlmSlider_Conditional_5_Template, 2, 0, "div", 4);
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx._slider.thumbIndexes());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx._slider.showTicks() ? 5 : -1);
        } }, dependencies: [i1.BrnSliderTrack, i1.BrnSliderThumb, i1.BrnSliderRange, i1.BrnSliderTick], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSlider, [{
        type: Component,
        args: [{
                selector: 'hlm-slider, brn-slider [hlm]',
                imports: [BrnSliderImports],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [
                    {
                        directive: BrnSlider,
                        inputs: [
                            'id',
                            'value',
                            'disabled',
                            'min',
                            'max',
                            'step',
                            'minStepsBetweenThumbs',
                            'maxStepsBetweenThumbs',
                            'preventStepOverThumb',
                            'inverted',
                            'orientation',
                            'showTicks',
                            'maxTicks',
                            'tickLabelInterval',
                            'formatTick',
                            'draggableRange',
                            'draggableRangeOnly',
                            'aria-label',
                            'aria-labelledby',
                        ],
                        outputs: ['valueChange'],
                    },
                ],
                template: `
    <div
      class="relative flex w-full items-center group-data-vertical:w-auto group-data-vertical:flex-col"
    >
      <div
        brnSliderTrack
        class="bg-muted rounded-full data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5 relative grow overflow-hidden"
      >
        <div
          class="bg-primary absolute select-none data-draggable-range:cursor-move data-horizontal:h-full data-vertical:w-full"
          brnSliderRange
        ></div>
      </div>

      @for (i of _slider.thumbIndexes(); track i) {
        <span
          class="border-primary ring-ring/50 size-4 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden absolute block shrink-0 select-none after:absolute after:-inset-2"
          brnSliderThumb
        ></span>
      }
    </div>

    @if (_slider.showTicks()) {
      <div
        class="px-2 group-data-vertical:px-0 group-data-vertical:py-2 text-muted-foreground mt-3 flex w-full items-start justify-between gap-1 text-xs font-medium group-data-horizontal:group-data-inverted:flex-row-reverse group-data-vertical:ms-3 group-data-vertical:mt-0 group-data-vertical:w-auto group-data-vertical:flex-col-reverse group-data-vertical:group-data-inverted:flex-col"
      >
        <div
          *brnSliderTick="let tick; let formattedTick = formattedTick"
          class="group flex w-0 flex-col items-center justify-center gap-2 group-data-vertical:h-0 group-data-vertical:w-auto group-data-vertical:flex-row"
        >
          <div
            class="bg-muted-foreground/70 h-1 w-px group-data-vertical:h-px group-data-vertical:w-1 group-data-horizontal:group-data-[skip]:h-0.5 group-data-vertical:group-data-[skip]:w-0.5"
          ></div>
          <div class="text-center group-data-[skip]:opacity-0">{{ formattedTick }}</div>
        </div>
      </div>
    }
  `,
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSlider, { className: "HlmSlider", filePath: "libs/ui/slider/src/lib/hlm-slider.ts", lineNumber: 75 }); })();
