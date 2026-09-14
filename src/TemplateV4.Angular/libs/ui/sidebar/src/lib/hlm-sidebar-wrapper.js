import { computed, Directive, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmSidebarService } from './hlm-sidebar.service';
import { injectHlmSidebarConfig } from './hlm-sidebar.token';
import * as i0 from "@angular/core";
export class HlmSidebarWrapper {
    _config = injectHlmSidebarConfig();
    _sidebarService = inject(HlmSidebarService);
    sidebarWidth = input(this._config.sidebarWidth, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sidebarWidth" }] : /* istanbul ignore next */ []));
    sidebarWidthIcon = input(this._config.sidebarWidthIcon, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sidebarWidthIcon" }] : /* istanbul ignore next */ []));
    _sidebarWidth = computed(() => this._sidebarService.widthInitialized() ? this._sidebarService.widthCss() : this.sidebarWidth(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_sidebarWidth" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full');
    }
    static ɵfac = function HlmSidebarWrapper_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarWrapper)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarWrapper, selectors: [["", "hlmSidebarWrapper", ""], ["hlm-sidebar-wrapper"]], hostAttrs: ["data-slot", "sidebar-wrapper"], hostVars: 7, hostBindings: function HlmSidebarWrapper_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-resizing", ctx._sidebarService.resizing() ? "true" : null);
            i0.ɵɵstyleProp("--%NS%sidebar-width", ctx._sidebarWidth())("--%NS%sidebar-width-icon", ctx.sidebarWidthIcon())("--%NS%sidebar-panel-width", ctx._sidebarService.panelWidthCss());
        } }, inputs: { sidebarWidth: [1, "sidebarWidth"], sidebarWidthIcon: [1, "sidebarWidthIcon"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarWrapper, [{
        type: Directive,
        args: [{
                selector: '[hlmSidebarWrapper],hlm-sidebar-wrapper',
                host: {
                    'data-slot': 'sidebar-wrapper',
                    '[attr.data-resizing]': '_sidebarService.resizing() ? "true" : null',
                    '[style.--sidebar-width]': '_sidebarWidth()',
                    '[style.--sidebar-width-icon]': 'sidebarWidthIcon()',
                    '[style.--sidebar-panel-width]': '_sidebarService.panelWidthCss()',
                },
            }]
    }], () => [], { sidebarWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "sidebarWidth", required: false }] }], sidebarWidthIcon: [{ type: i0.Input, args: [{ isSignal: true, alias: "sidebarWidthIcon", required: false }] }] }); })();
