import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePanelLeft } from '@ng-icons/lucide';
import { HlmButton, provideBrnButtonConfig } from '@spartan-ng/helm/button';
import { HlmSidebarService } from './hlm-sidebar.service';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
export class HlmSidebarTrigger {
    _sidebarService = inject(HlmSidebarService);
    srOnlyText = input('Toggle Sidebar', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "srOnlyText" }] : /* istanbul ignore next */ []));
    _onClick() {
        this._sidebarService.toggleSidebar();
    }
    static ɵfac = function HlmSidebarTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarTrigger)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmSidebarTrigger, selectors: [["button", "hlmSidebarTrigger", ""]], hostAttrs: ["data-slot", "sidebar-trigger", "data-sidebar", "trigger"], hostBindings: function HlmSidebarTrigger_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function HlmSidebarTrigger_click_HostBindingHandler() { return ctx._onClick(); });
        } }, inputs: { srOnlyText: [1, "srOnlyText"] }, features: [i0.ɵɵProvidersFeature([
                provideIcons({ lucidePanelLeft }),
                provideBrnButtonConfig({ variant: 'ghost', size: 'icon-sm' }),
            ]), i0.ɵɵHostDirectivesFeature([{ directive: i1.HlmButton, inputs: ["variant", "variant", "size", "size"] }])], decls: 3, vars: 1, consts: [["name", "lucidePanelLeft"], [1, "sr-only"]], template: function HlmSidebarTrigger_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "ng-icon", 0);
            i0.ɵɵelementStart(1, "span", 1);
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.srOnlyText());
        } }, dependencies: [NgIcon], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarTrigger, [{
        type: Component,
        args: [{
                // eslint-disable-next-line @angular-eslint/component-selector
                selector: 'button[hlmSidebarTrigger]',
                imports: [NgIcon],
                providers: [
                    provideIcons({ lucidePanelLeft }),
                    provideBrnButtonConfig({ variant: 'ghost', size: 'icon-sm' }),
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                hostDirectives: [{ directive: HlmButton, inputs: ['variant', 'size'] }],
                host: {
                    'data-slot': 'sidebar-trigger',
                    'data-sidebar': 'trigger',
                    '(click)': '_onClick()',
                },
                template: `
    <ng-icon name="lucidePanelLeft" />
    <span class="sr-only">{{ srOnlyText() }}</span>
  `,
            }]
    }], null, { srOnlyText: [{ type: i0.Input, args: [{ isSignal: true, alias: "srOnlyText", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmSidebarTrigger, { className: "HlmSidebarTrigger", filePath: "libs/ui/sidebar/src/lib/hlm-sidebar-trigger.ts", lineNumber: 27 }); })();
