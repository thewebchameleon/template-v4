import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute, } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideCircleX, lucideInfo, lucideLoaderCircle, lucideTriangleAlert, } from '@ng-icons/lucide';
import { BrnSonnerImports } from '@spartan-ng/brain/sonner';
import { hlm } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/sonner";
function HlmToaster_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 6);
} }
function HlmToaster_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 7);
} }
function HlmToaster_ng_template_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 8);
} }
function HlmToaster_ng_template_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 9);
} }
function HlmToaster_ng_template_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ng-icon", 10);
} }
export class HlmToaster {
    invert = input(false, { ...(ngDevMode ? { debugName: "invert" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    theme = input('light', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "theme" }] : /* istanbul ignore next */ []));
    position = input('bottom-right', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "position" }] : /* istanbul ignore next */ []));
    hotKey = input(['altKey', 'KeyT'], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hotKey" }] : /* istanbul ignore next */ []));
    richColors = input(false, { ...(ngDevMode ? { debugName: "richColors" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    expand = input(false, { ...(ngDevMode ? { debugName: "expand" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    duration = input(4000, { ...(ngDevMode ? { debugName: "duration" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    visibleToasts = input(3, { ...(ngDevMode ? { debugName: "visibleToasts" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    closeButton = input(false, { ...(ngDevMode ? { debugName: "closeButton" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    toastOptions = input({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "toastOptions" }] : /* istanbul ignore next */ []));
    _computedToastOptions = computed(() => {
        const options = this.toastOptions();
        return {
            ...options,
            classes: {
                ...options?.classes,
                toast: hlm('items-start! gap-2.5! rounded-xl! border-0! px-4! py-3! shadow-none! [&_[data-content]]:gap-0.5! [&_[data-icon]]:m-0! [&_[data-icon]]:mt-0.5! [&_[data-icon]]:size-5! [&_[data-icon]]:items-center! [&_[data-icon]]:justify-center! [&_[data-icon]_ng-icon]:flex [&_[data-icon]_ng-icon]:items-center [&_[data-icon]_ng-icon]:justify-center [&_[data-icon]_svg]:m-0! [&_[data-icon]_svg]:[--ng-icon__stroke-width:2]', options?.classes?.toast),
                title: hlm('text-sm! leading-5! font-semibold!', options?.classes?.title),
                description: hlm('text-xs! leading-4! opacity-100!', options?.classes?.description),
            },
        };
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedToastOptions" }] : /* istanbul ignore next */ []));
    offset = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "offset" }] : /* istanbul ignore next */ []));
    userClass = input('', { ...(ngDevMode ? { debugName: "userClass" } : /* istanbul ignore next */ {}), alias: 'class' });
    userStyle = input({
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)',
        '--brn-sonner-toast-success-background': 'var(--toast-success-background)',
        '--brn-sonner-toast-success-border': 'var(--toast-success-background)',
        '--brn-sonner-toast-success-color': 'var(--toast-success-foreground)',
        '--brn-sonner-toast-info-background': 'var(--toast-info-background)',
        '--brn-sonner-toast-info-border': 'var(--toast-info-background)',
        '--brn-sonner-toast-info-color': 'var(--toast-info-foreground)',
        '--brn-sonner-toast-warning-background': 'var(--toast-warning-background)',
        '--brn-sonner-toast-warning-border': 'var(--toast-warning-background)',
        '--brn-sonner-toast-warning-color': 'var(--toast-warning-foreground)',
        '--brn-sonner-toast-error-background': 'var(--toast-error-background)',
        '--brn-sonner-toast-error-border': 'var(--toast-error-background)',
        '--brn-sonner-toast-error-color': 'var(--toast-error-foreground)',
        '--brn-sonner-toast-dark-success-background': 'var(--toast-success-background)',
        '--brn-sonner-toast-dark-success-border': 'var(--toast-success-background)',
        '--brn-sonner-toast-dark-success-color': 'var(--toast-success-foreground)',
        '--brn-sonner-toast-dark-info-background': 'var(--toast-info-background)',
        '--brn-sonner-toast-dark-info-border': 'var(--toast-info-background)',
        '--brn-sonner-toast-dark-info-color': 'var(--toast-info-foreground)',
        '--brn-sonner-toast-dark-warning-background': 'var(--toast-warning-background)',
        '--brn-sonner-toast-dark-warning-border': 'var(--toast-warning-background)',
        '--brn-sonner-toast-dark-warning-color': 'var(--toast-warning-foreground)',
        '--brn-sonner-toast-dark-error-background': 'var(--toast-error-background)',
        '--brn-sonner-toast-dark-error-border': 'var(--toast-error-background)',
        '--brn-sonner-toast-dark-error-color': 'var(--toast-error-foreground)',
    }, { ...(ngDevMode ? { debugName: "userStyle" } : /* istanbul ignore next */ {}), alias: 'style' });
    _computedClass = computed(() => hlm('toaster group', this.userClass()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_computedClass" }] : /* istanbul ignore next */ []));
    static ɵfac = function HlmToaster_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmToaster)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmToaster, selectors: [["hlm-toaster"]], inputs: { invert: [1, "invert"], theme: [1, "theme"], position: [1, "position"], hotKey: [1, "hotKey"], richColors: [1, "richColors"], expand: [1, "expand"], duration: [1, "duration"], visibleToasts: [1, "visibleToasts"], closeButton: [1, "closeButton"], toastOptions: [1, "toastOptions"], offset: [1, "offset"], userClass: [1, "class", "userClass"], userStyle: [1, "style", "userStyle"] }, features: [i0.ɵɵProvidersFeature([
                provideIcons({
                    lucideCircleCheck,
                    lucideCircleX,
                    lucideInfo,
                    lucideLoaderCircle,
                    lucideTriangleAlert,
                }),
            ])], decls: 11, vars: 15, consts: [["loadingIcon", ""], ["successIcon", ""], ["errorIcon", ""], ["infoIcon", ""], ["warningIcon", ""], [3, "invert", "theme", "position", "hotKey", "richColors", "expand", "duration", "visibleToasts", "closeButton", "toastOptions", "offset"], ["name", "lucideLoaderCircle", "size", "20", "aria-hidden", "true", 1, "motion-safe:animate-spin"], ["name", "lucideCircleCheck", "size", "20", "aria-hidden", "true"], ["name", "lucideCircleX", "size", "20", "aria-hidden", "true"], ["name", "lucideInfo", "size", "20", "aria-hidden", "true"], ["name", "lucideTriangleAlert", "size", "20", "aria-hidden", "true"]], template: function HlmToaster_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "brn-sonner-toaster", 5);
            i0.ɵɵtemplate(1, HlmToaster_ng_template_1_Template, 1, 0, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor)(3, HlmToaster_ng_template_3_Template, 1, 0, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor)(5, HlmToaster_ng_template_5_Template, 1, 0, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor)(7, HlmToaster_ng_template_7_Template, 1, 0, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor)(9, HlmToaster_ng_template_9_Template, 1, 0, "ng-template", null, 4, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵstyleMap(ctx.userStyle());
            i0.ɵɵclassMap(ctx._computedClass());
            i0.ɵɵproperty("invert", ctx.invert())("theme", ctx.theme())("position", ctx.position())("hotKey", ctx.hotKey())("richColors", ctx.richColors())("expand", ctx.expand())("duration", ctx.duration())("visibleToasts", ctx.visibleToasts())("closeButton", ctx.closeButton())("toastOptions", ctx._computedToastOptions())("offset", ctx.offset());
        } }, dependencies: [i1.BrnSonnerToaster, NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmToaster, [{
        type: Component,
        args: [{
                selector: 'hlm-toaster',
                imports: [BrnSonnerImports, NgIcon],
                providers: [
                    provideIcons({
                        lucideCircleCheck,
                        lucideCircleX,
                        lucideInfo,
                        lucideLoaderCircle,
                        lucideTriangleAlert,
                    }),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <brn-sonner-toaster
      [class]="_computedClass()"
      [invert]="invert()"
      [theme]="theme()"
      [position]="position()"
      [hotKey]="hotKey()"
      [richColors]="richColors()"
      [expand]="expand()"
      [duration]="duration()"
      [visibleToasts]="visibleToasts()"
      [closeButton]="closeButton()"
      [toastOptions]="_computedToastOptions()"
      [offset]="offset()"
      [style]="userStyle()"
    >
      <ng-template #loadingIcon>
        <ng-icon
          class="motion-safe:animate-spin"
          name="lucideLoaderCircle"
          size="20"
          aria-hidden="true"
        />
      </ng-template>
      <ng-template #successIcon>
        <ng-icon name="lucideCircleCheck" size="20" aria-hidden="true" />
      </ng-template>
      <ng-template #errorIcon>
        <ng-icon name="lucideCircleX" size="20" aria-hidden="true" />
      </ng-template>
      <ng-template #infoIcon>
        <ng-icon name="lucideInfo" size="20" aria-hidden="true" />
      </ng-template>
      <ng-template #warningIcon>
        <ng-icon name="lucideTriangleAlert" size="20" aria-hidden="true" />
      </ng-template>
    </brn-sonner-toaster>
  `,
            }]
    }], null, { invert: [{ type: i0.Input, args: [{ isSignal: true, alias: "invert", required: false }] }], theme: [{ type: i0.Input, args: [{ isSignal: true, alias: "theme", required: false }] }], position: [{ type: i0.Input, args: [{ isSignal: true, alias: "position", required: false }] }], hotKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "hotKey", required: false }] }], richColors: [{ type: i0.Input, args: [{ isSignal: true, alias: "richColors", required: false }] }], expand: [{ type: i0.Input, args: [{ isSignal: true, alias: "expand", required: false }] }], duration: [{ type: i0.Input, args: [{ isSignal: true, alias: "duration", required: false }] }], visibleToasts: [{ type: i0.Input, args: [{ isSignal: true, alias: "visibleToasts", required: false }] }], closeButton: [{ type: i0.Input, args: [{ isSignal: true, alias: "closeButton", required: false }] }], toastOptions: [{ type: i0.Input, args: [{ isSignal: true, alias: "toastOptions", required: false }] }], offset: [{ type: i0.Input, args: [{ isSignal: true, alias: "offset", required: false }] }], userClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }], userStyle: [{ type: i0.Input, args: [{ isSignal: true, alias: "style", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmToaster, { className: "HlmToaster", filePath: "libs/ui/sonner/src/lib/hlm-toaster.ts", lineNumber: 74 }); })();
