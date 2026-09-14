import { DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmSidebarService } from './hlm-sidebar.service';
import * as i0 from "@angular/core";
export class HlmSidebarRail {
    _sidebarService = inject(HlmSidebarService);
    _element = inject(ElementRef).nativeElement;
    pointerId = null;
    startX = 0;
    startWidthRem = 0;
    dragged = false;
    ariaLabel = input('Toggle Sidebar', { ...(ngDevMode ? { debugName: "ariaLabel" } : /* istanbul ignore next */ {}), alias: 'aria-label' });
    constructor() {
        classes(() => 'sidebar-resize-separator');
        inject(DestroyRef).onDestroy(() => this._sidebarService.cancelResize());
    }
    onDoubleClick(event) {
        event.preventDefault();
        this._sidebarService.reset();
    }
    onKeydown(event) {
        const side = this.side();
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this._sidebarService.toggleSidebar();
            return;
        }
        if (event.key === 'Home') {
            event.preventDefault();
            this._sidebarService.collapse();
            return;
        }
        if (event.key === 'End') {
            event.preventDefault();
            this._sidebarService.setPanelWidthRem(this._sidebarService.panelMaxWidthRem());
            return;
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
            return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const sideDirection = side === 'right' ? -direction : direction;
        const current = this._sidebarService.open() ? this._sidebarService.panelWidthRem() : 0;
        this._sidebarService.setPanelWidthRem(current + sideDirection * 0.5);
    }
    onPointerDown(event) {
        if (event.button !== 0 || this._sidebarService.isMobile())
            return;
        event.preventDefault();
        this._element.focus({ preventScroll: true });
        this.updateHandle(event);
        this.pointerId = event.pointerId;
        this.startX = event.clientX;
        this.startWidthRem = this._sidebarService.open() ? this._sidebarService.panelWidthRem() : 0;
        this.dragged = false;
        this._element.setPointerCapture(event.pointerId);
    }
    onPointerMove(event) {
        this.updateHandle(event);
        if (event.pointerId !== this.pointerId)
            return;
        const deltaPixels = event.clientX - this.startX;
        if (!this.dragged && Math.abs(deltaPixels) < 3)
            return;
        if (!this.dragged) {
            this.dragged = true;
            this._sidebarService.startResize(this.startWidthRem);
        }
        const direction = this.side() === 'right' ? -1 : 1;
        this._sidebarService.previewResize(this.startWidthRem + this._sidebarService.pixelsToRem(deltaPixels) * direction);
    }
    onPointerUp(event) {
        if (event.pointerId !== this.pointerId)
            return;
        this.pointerId = null;
        if (this._element.hasPointerCapture(event.pointerId)) {
            this._element.releasePointerCapture(event.pointerId);
        }
        if (!this.dragged)
            return;
        this._sidebarService.finishResize();
    }
    onPointerCancel(event) {
        if (event.pointerId !== this.pointerId)
            return;
        this.pointerId = null;
        this._sidebarService.cancelResize();
    }
    _currentWidth() {
        return this._sidebarService.open()
            ? Number(this._sidebarService.panelWidthRem().toFixed(1))
            : 0;
    }
    side() {
        const rtl = getComputedStyle(this._element).direction === 'rtl';
        const right = !!this._element.closest('[data-side="right"]');
        return right !== rtl ? 'right' : 'left';
    }
    updateHandle(event) {
        const bounds = this._element.getBoundingClientRect();
        const halfGuide = 2.5 / this._sidebarService.pixelsToRem(1);
        const y = Math.max(halfGuide, Math.min(event.clientY - bounds.top, bounds.height - halfGuide));
        this._element.style.setProperty('--sidebar-handle-y', `${y}px`);
    }
    centerHandle() {
        this._element.style.setProperty('--sidebar-handle-y', '50%');
    }
    cancelPointerResize() {
        if (this.pointerId === null)
            return;
        const pointerId = this.pointerId;
        this.pointerId = null;
        this._sidebarService.cancelResize();
        if (this._element.hasPointerCapture(pointerId))
            this._element.releasePointerCapture(pointerId);
    }
    static ɵfac = function HlmSidebarRail_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarRail)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmSidebarRail, selectors: [["button", "hlmSidebarRail", ""]], hostAttrs: ["data-sidebar", "rail", "data-slot", "sidebar-rail", "role", "separator", "aria-orientation", "vertical", "aria-valuemin", "0", "tabindex", "0"], hostVars: 4, hostBindings: function HlmSidebarRail_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("dblclick", function HlmSidebarRail_dblclick_HostBindingHandler($event) { return ctx.onDoubleClick($event); })("keydown", function HlmSidebarRail_keydown_HostBindingHandler($event) { return ctx.onKeydown($event); })("pointerdown", function HlmSidebarRail_pointerdown_HostBindingHandler($event) { return ctx.onPointerDown($event); })("pointermove", function HlmSidebarRail_pointermove_HostBindingHandler($event) { return ctx.onPointerMove($event); })("pointerup", function HlmSidebarRail_pointerup_HostBindingHandler($event) { return ctx.onPointerUp($event); })("pointercancel", function HlmSidebarRail_pointercancel_HostBindingHandler($event) { return ctx.onPointerCancel($event); })("lostpointercapture", function HlmSidebarRail_lostpointercapture_HostBindingHandler($event) { return ctx.onPointerCancel($event); })("pointerenter", function HlmSidebarRail_pointerenter_HostBindingHandler($event) { return ctx.updateHandle($event); })("focus", function HlmSidebarRail_focus_HostBindingHandler() { return ctx.centerHandle(); })("keydown.escape", function HlmSidebarRail_keydown_escape_HostBindingHandler() { return ctx.cancelPointerResize(); }, i0.ɵɵresolveDocument);
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.ariaLabel())("aria-valuemax", ctx._sidebarService.panelMaxWidthRem())("aria-valuenow", ctx._currentWidth())("data-resizing", ctx._sidebarService.resizing() ? "true" : null);
        } }, inputs: { ariaLabel: [1, "aria-label", "ariaLabel"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarRail, [{
        type: Directive,
        args: [{
                selector: 'button[hlmSidebarRail]',
                host: {
                    'data-sidebar': 'rail',
                    'data-slot': 'sidebar-rail',
                    role: 'separator',
                    'aria-orientation': 'vertical',
                    '[attr.aria-label]': 'ariaLabel()',
                    'aria-valuemin': '0',
                    '[attr.aria-valuemax]': '_sidebarService.panelMaxWidthRem()',
                    '[attr.aria-valuenow]': '_currentWidth()',
                    '[attr.data-resizing]': '_sidebarService.resizing() ? "true" : null',
                    tabindex: '0',
                    '(dblclick)': 'onDoubleClick($event)',
                    '(keydown)': 'onKeydown($event)',
                    '(pointerdown)': 'onPointerDown($event)',
                    '(pointermove)': 'onPointerMove($event)',
                    '(pointerup)': 'onPointerUp($event)',
                    '(pointercancel)': 'onPointerCancel($event)',
                    '(lostpointercapture)': 'onPointerCancel($event)',
                    '(pointerenter)': 'updateHandle($event)',
                    '(focus)': 'centerHandle()',
                    '(document:keydown.escape)': 'cancelPointerResize()',
                },
            }]
    }], () => [], { ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "aria-label", required: false }] }] }); })();
