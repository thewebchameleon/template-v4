import { Component, input } from '@angular/core';
import { WorkspaceUi } from '../shared/workspace';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@ng-icons/core";
import * as i3 from "@spartan-ng/helm/alert";
import * as i4 from "../core/i18n";
function MyFilesDemoBanner_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "t");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "myFilesDemoBannerHour"), " ");
} }
function MyFilesDemoBanner_Conditional_0_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate3(" ", i0.ɵɵpipeBind1(1, 3, "myFilesDemoBannerStart"), " ", ctx_r0.minutes(), " ", i0.ɵɵpipeBind1(2, 5, "myFilesDemoBannerEnd"), " ");
} }
function MyFilesDemoBanner_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 0);
    i0.ɵɵelement(1, "ng-icon", 1);
    i0.ɵɵelementStart(2, "p", 2);
    i0.ɵɵconditionalCreate(3, MyFilesDemoBanner_Conditional_0_Conditional_3_Template, 2, 3)(4, MyFilesDemoBanner_Conditional_0_Conditional_4_Template, 3, 7);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.minutes() === 60 ? 3 : 4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 2, "myFilesDemoFolderHelp"), " ");
} }
export class MyFilesDemoBanner {
    enabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enabled" }] : /* istanbul ignore next */ []));
    minutes = input(60, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "minutes" }] : /* istanbul ignore next */ []));
    static ɵfac = function MyFilesDemoBanner_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MyFilesDemoBanner)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyFilesDemoBanner, selectors: [["app-my-files-demo-banner"]], inputs: { enabled: [1, "enabled"], minutes: [1, "minutes"] }, decls: 1, vars: 1, consts: [["hlmAlert", "", "role", "status", 1, "mb-4", "border-[color-mix(in_oklch,var(--warning),transparent_65%)]", "bg-[color-mix(in_oklch,var(--toast-warning-background),transparent_25%)]", "text-[var(--toast-warning-foreground)]"], ["name", "lucideTriangleAlert", "size", "20", "aria-hidden", "true", 1, "text-[var(--warning)]"], ["hlmAlertDescription", "", 1, "text-current"]], template: function MyFilesDemoBanner_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, MyFilesDemoBanner_Conditional_0_Template, 7, 4, "div", 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.enabled() ? 0 : -1);
        } }, dependencies: [i1.FormsModule, i2.NgIcon, i3.HlmAlert, i3.HlmAlertDescription, i4.Translate], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyFilesDemoBanner, [{
        type: Component,
        args: [{
                selector: 'app-my-files-demo-banner',
                imports: [WorkspaceUi],
                template: `@if (enabled()) {
    <div
      hlmAlert
      class="mb-4 border-[color-mix(in_oklch,var(--warning),transparent_65%)] bg-[color-mix(in_oklch,var(--toast-warning-background),transparent_25%)] text-[var(--toast-warning-foreground)]"
      role="status"
    >
      <ng-icon
        name="lucideTriangleAlert"
        class="text-[var(--warning)]"
        size="20"
        aria-hidden="true"
      />
      <p hlmAlertDescription class="text-current">
        @if (minutes() === 60) {
          {{ 'myFilesDemoBannerHour' | t }}
        } @else {
          {{ 'myFilesDemoBannerStart' | t }} {{ minutes() }} {{ 'myFilesDemoBannerEnd' | t }}
        }
        {{ 'myFilesDemoFolderHelp' | t }}
      </p>
    </div>
  }`,
            }]
    }], null, { enabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "enabled", required: false }] }], minutes: [{ type: i0.Input, args: [{ isSignal: true, alias: "minutes", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MyFilesDemoBanner, { className: "MyFilesDemoBanner", filePath: "src/app/features/my-files-demo-banner.ts", lineNumber: 30 }); })();
