import { isPlatformServer } from '@angular/common';
import { afterNextRender, computed, DestroyRef, DOCUMENT, inject, Injectable, PLATFORM_ID, REQUEST, signal, } from '@angular/core';
import { injectHlmSidebarConfig } from './hlm-sidebar.token';
import * as i0 from "@angular/core";
const panelWidthStorageKey = 'templatev4-sidebar-panel-width';
const panelOpenStorageKey = 'templatev4-sidebar-panel-open';
const fallbackRailWidthRem = 4;
const fallbackPanelWidthRem = 16;
const fallbackPanelMaxWidthRem = 32;
export class HlmSidebarService {
    _platformId = inject(PLATFORM_ID);
    _request = inject(REQUEST, { optional: true });
    _config = injectHlmSidebarConfig();
    _document = inject(DOCUMENT);
    _root = this._document.documentElement;
    _window = this._document.defaultView;
    _open = signal(this._config.defaultOpen, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_open" }] : /* istanbul ignore next */ []));
    _panelAvailable = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_panelAvailable" }] : /* istanbul ignore next */ []));
    _openMobile = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_openMobile" }] : /* istanbul ignore next */ []));
    _isMobile = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_isMobile" }] : /* istanbul ignore next */ []));
    _variant = signal('sidebar', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_variant" }] : /* istanbul ignore next */ []));
    _panelWidthRem = signal(fallbackPanelWidthRem, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_panelWidthRem" }] : /* istanbul ignore next */ []));
    _widthInitialized = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_widthInitialized" }] : /* istanbul ignore next */ []));
    _resizing = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_resizing" }] : /* istanbul ignore next */ []));
    _railWidthRem = signal(fallbackRailWidthRem, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_railWidthRem" }] : /* istanbul ignore next */ []));
    _panelMaxWidthRem = signal(fallbackPanelMaxWidthRem, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_panelMaxWidthRem" }] : /* istanbul ignore next */ []));
    _mediaQuery = null;
    _resizeOriginWidthRem = fallbackPanelWidthRem;
    _resizeOriginOpen = true;
    open = computed(() => this._panelAvailable() && this._open(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "open" }] : /* istanbul ignore next */ []));
    openMobile = this._openMobile.asReadonly();
    isMobile = this._isMobile.asReadonly();
    variant = this._variant.asReadonly();
    panelWidthRem = this._panelWidthRem.asReadonly();
    widthInitialized = this._widthInitialized.asReadonly();
    resizing = this._resizing.asReadonly();
    railWidthRem = this._railWidthRem.asReadonly();
    panelMaxWidthRem = this._panelMaxWidthRem.asReadonly();
    panelWidthCss = computed(() => this.open() ? `${this._panelWidthRem()}rem` : '0rem', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "panelWidthCss" }] : /* istanbul ignore next */ []));
    widthCss = computed(() => `${this._railWidthRem() + (this.open() ? this._panelWidthRem() : 0)}rem`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "widthCss" }] : /* istanbul ignore next */ []));
    state = computed(() => this.open() ? 'expanded' : 'collapsed', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    constructor() {
        const destroyRef = inject(DestroyRef);
        this.restoreStateFromCookie();
        afterNextRender(() => {
            if (!this._window || typeof this._window.matchMedia !== 'function')
                return;
            this.initializeState();
            this._mediaQuery = this._window.matchMedia(`(max-width: ${this._config.mobileBreakpoint})`);
            this._isMobile.set(this._mediaQuery.matches);
            const mediaQueryHandler = (event) => {
                this._isMobile.set(event.matches);
                if (!event.matches)
                    this._openMobile.set(false);
            };
            this._mediaQuery.addEventListener('change', mediaQueryHandler);
            const keydownHandler = (event) => {
                if (event.key === this._config.sidebarKeyboardShortcut &&
                    (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    this.toggleSidebar();
                }
            };
            this._window.addEventListener('keydown', keydownHandler);
            let resizeTimeout;
            const resizeHandler = () => {
                if (!this._window)
                    return;
                if (resizeTimeout)
                    this._window.clearTimeout(resizeTimeout);
                resizeTimeout = this._window.setTimeout(() => {
                    if (this._mediaQuery)
                        this._isMobile.set(this._mediaQuery.matches);
                }, 100);
            };
            this._window.addEventListener('resize', resizeHandler);
            const storageHandler = (event) => {
                if (event.storageArea !== this._window?.localStorage)
                    return;
                if (event.key === panelWidthStorageKey || event.key === null) {
                    this._panelWidthRem.set(this.parseStoredWidth(event.newValue));
                }
                if (event.key === panelOpenStorageKey || event.key === null) {
                    this._open.set(event.newValue === null ? this._config.defaultOpen : event.newValue === 'true');
                }
            };
            this._window.addEventListener('storage', storageHandler);
            destroyRef.onDestroy(() => {
                this._mediaQuery?.removeEventListener('change', mediaQueryHandler);
                this._window?.removeEventListener('keydown', keydownHandler);
                this._window?.removeEventListener('resize', resizeHandler);
                this._window?.removeEventListener('storage', storageHandler);
                if (resizeTimeout)
                    this._window?.clearTimeout(resizeTimeout);
            });
        });
    }
    setOpen(open) {
        if (open && this._panelWidthRem() <= 0) {
            this._panelWidthRem.set(this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem));
        }
        this._open.set(open);
        this._document.cookie = `${this._config.sidebarCookieName}=${open}; path=/; max-age=${this._config.sidebarCookieMaxAge}`;
        try {
            this._window?.localStorage.setItem(panelOpenStorageKey, String(open));
        }
        catch {
            // Keep the state active for this page when storage is unavailable.
        }
    }
    setOpenMobile(open) {
        if (this._isMobile())
            this._openMobile.set(open);
    }
    setPanelAvailable(available) {
        this._panelAvailable.set(available);
    }
    setVariant(variant) {
        this._variant.set(variant);
    }
    toggleSidebar() {
        if (this._isMobile())
            this._openMobile.update((value) => !value);
        else if (this._panelAvailable())
            this.setOpen(!this._open());
    }
    openPanel() {
        if (!this._isMobile())
            this.setOpen(true);
    }
    startResize(panelWidthRem = this._panelWidthRem()) {
        if (this._isMobile())
            return;
        this._resizeOriginWidthRem = this._panelWidthRem();
        this._resizeOriginOpen = this._open();
        this._resizing.set(true);
        this._panelWidthRem.set(this.clamp(panelWidthRem, 0, this._panelMaxWidthRem()));
        this._open.set(true);
    }
    previewResize(panelWidthRem) {
        if (!this._resizing())
            return;
        this._panelWidthRem.set(this.clamp(panelWidthRem, 0, this._panelMaxWidthRem()));
    }
    finishResize() {
        if (!this._resizing())
            return;
        this._resizing.set(false);
        if (this._panelWidthRem() === 0) {
            this._panelWidthRem.set(this._resizeOriginWidthRem);
            this.setOpen(false);
            return;
        }
        this.setPanelWidthRem(this._panelWidthRem());
    }
    cancelResize() {
        if (!this._resizing())
            return;
        this._resizing.set(false);
        this._panelWidthRem.set(this._resizeOriginWidthRem);
        this.setOpen(this._resizeOriginOpen);
    }
    setPanelWidthRem(panelWidthRem) {
        if (this._isMobile())
            return;
        const width = this.clamp(panelWidthRem, 0, this._panelMaxWidthRem());
        if (width === 0) {
            this.setOpen(false);
            return;
        }
        this._panelWidthRem.set(width);
        this.setOpen(true);
        this.persistWidth();
    }
    collapse() {
        if (!this._isMobile())
            this.setOpen(false);
    }
    reset() {
        this._resizing.set(false);
        this._panelWidthRem.set(this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem));
        this.setOpen(true);
        try {
            this._window?.localStorage.removeItem(panelWidthStorageKey);
            this._window?.localStorage.removeItem(panelOpenStorageKey);
        }
        catch {
            // Keep the defaults active for this page when storage is unavailable.
        }
    }
    pixelsToRem(pixels) {
        if (!this._window)
            return pixels / 16;
        const rootFontSize = Number.parseFloat(this._window.getComputedStyle(this._root).fontSize);
        return pixels / (Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize : 16);
    }
    restoreStateFromCookie() {
        const cookieString = isPlatformServer(this._platformId)
            ? this._request?.headers.get('cookie')
            : this._document.cookie;
        if (!cookieString)
            return;
        const prefix = `${this._config.sidebarCookieName}=`;
        const value = cookieString
            .split(';')
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith(prefix))
            ?.slice(prefix.length);
        if (value !== undefined)
            this._open.set(value === 'true');
    }
    initializeState() {
        this._railWidthRem.set(this.readCssRem('--app-sidebar-rail-width', fallbackRailWidthRem));
        this._panelMaxWidthRem.set(this.readCssRem('--app-sidebar-panel-max-width', fallbackPanelMaxWidthRem));
        const defaultWidth = this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem);
        try {
            const storedWidth = this._window?.localStorage.getItem(panelWidthStorageKey) ?? null;
            const storedOpen = this._window?.localStorage.getItem(panelOpenStorageKey) ?? null;
            this._panelWidthRem.set(storedWidth === null ? defaultWidth : this.parseStoredWidth(storedWidth));
            if (storedOpen !== null)
                this._open.set(storedOpen === 'true');
        }
        catch {
            this._panelWidthRem.set(defaultWidth);
        }
        this._widthInitialized.set(true);
    }
    parseStoredWidth(value) {
        if (value === null)
            return this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem);
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) && parsed > 0
            ? this.clamp(parsed, 0, this._panelMaxWidthRem())
            : this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem);
    }
    persistWidth() {
        try {
            this._window?.localStorage.setItem(panelWidthStorageKey, String(this._panelWidthRem()));
        }
        catch {
            // Keep the selected width for this page when storage is unavailable.
        }
    }
    readCssRem(property, fallback) {
        if (!this._window)
            return fallback;
        const value = this._window.getComputedStyle(this._root).getPropertyValue(property).trim();
        const parsed = Number.parseFloat(value);
        if (!Number.isFinite(parsed))
            return fallback;
        if (value.endsWith('px'))
            return this.pixelsToRem(parsed);
        return parsed;
    }
    clamp(value, min, max) {
        return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min;
    }
    static ɵfac = function HlmSidebarService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmSidebarService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: HlmSidebarService, factory: HlmSidebarService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmSidebarService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
