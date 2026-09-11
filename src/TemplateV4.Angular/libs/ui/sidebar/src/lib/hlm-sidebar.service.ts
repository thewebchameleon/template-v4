import { isPlatformServer } from '@angular/common';
import {
  afterNextRender,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  Injectable,
  PLATFORM_ID,
  REQUEST,
  type Signal,
  signal,
} from '@angular/core';
import { injectHlmSidebarConfig } from './hlm-sidebar.token';

export type SidebarVariant = 'sidebar' | 'floating' | 'inset';

const panelWidthStorageKey = 'templatev4-sidebar-panel-width';
const panelOpenStorageKey = 'templatev4-sidebar-panel-open';
const fallbackRailWidthRem = 4;
const fallbackPanelWidthRem = 12;
const fallbackPanelMaxWidthRem = 20;

@Injectable({ providedIn: 'root' })
export class HlmSidebarService {
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _request = inject(REQUEST, { optional: true });
  private readonly _config = injectHlmSidebarConfig();
  private readonly _document = inject(DOCUMENT);
  private readonly _root = this._document.documentElement;
  private readonly _window = this._document.defaultView;
  private readonly _open = signal<boolean>(this._config.defaultOpen);
  private readonly _openMobile = signal(false);
  private readonly _isMobile = signal(false);
  private readonly _variant = signal<SidebarVariant>('sidebar');
  private readonly _panelWidthRem = signal(fallbackPanelWidthRem);
  private readonly _widthInitialized = signal(false);
  private readonly _resizing = signal(false);
  private readonly _railWidthRem = signal(fallbackRailWidthRem);
  private readonly _panelMaxWidthRem = signal(fallbackPanelMaxWidthRem);
  private _mediaQuery: MediaQueryList | null = null;
  private _resizeOriginWidthRem = fallbackPanelWidthRem;
  private _resizeOriginOpen = true;

  public readonly open: Signal<boolean> = this._open.asReadonly();
  public readonly openMobile: Signal<boolean> = this._openMobile.asReadonly();
  public readonly isMobile: Signal<boolean> = this._isMobile.asReadonly();
  public readonly variant: Signal<SidebarVariant> = this._variant.asReadonly();
  public readonly panelWidthRem: Signal<number> = this._panelWidthRem.asReadonly();
  public readonly widthInitialized: Signal<boolean> = this._widthInitialized.asReadonly();
  public readonly resizing: Signal<boolean> = this._resizing.asReadonly();
  public readonly railWidthRem: Signal<number> = this._railWidthRem.asReadonly();
  public readonly panelMaxWidthRem: Signal<number> = this._panelMaxWidthRem.asReadonly();
  public readonly panelWidthCss = computed(() =>
    this._open() ? `${this._panelWidthRem()}rem` : '0rem',
  );
  public readonly widthCss = computed(
    () => `${this._railWidthRem() + (this._open() ? this._panelWidthRem() : 0)}rem`,
  );
  public readonly state = computed<'expanded' | 'collapsed'>(() =>
    this._open() ? 'expanded' : 'collapsed',
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.restoreStateFromCookie();

    afterNextRender(() => {
      if (!this._window || typeof this._window.matchMedia !== 'function') return;
      this.initializeState();
      this._mediaQuery = this._window.matchMedia(`(max-width: ${this._config.mobileBreakpoint})`);
      this._isMobile.set(this._mediaQuery.matches);

      const mediaQueryHandler = (event: MediaQueryListEvent) => {
        this._isMobile.set(event.matches);
        if (!event.matches) this._openMobile.set(false);
      };
      this._mediaQuery.addEventListener('change', mediaQueryHandler);

      const keydownHandler = (event: KeyboardEvent) => {
        if (
          event.key === this._config.sidebarKeyboardShortcut &&
          (event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          this.toggleSidebar();
        }
      };
      this._window.addEventListener('keydown', keydownHandler);

      let resizeTimeout: number;
      const resizeHandler = () => {
        if (!this._window) return;
        if (resizeTimeout) this._window.clearTimeout(resizeTimeout);
        resizeTimeout = this._window.setTimeout(() => {
          if (this._mediaQuery) this._isMobile.set(this._mediaQuery.matches);
        }, 100);
      };
      this._window.addEventListener('resize', resizeHandler);

      const storageHandler = (event: StorageEvent) => {
        if (event.storageArea !== this._window?.localStorage) return;
        if (event.key === panelWidthStorageKey || event.key === null) {
          this._panelWidthRem.set(this.parseStoredWidth(event.newValue));
        }
        if (event.key === panelOpenStorageKey || event.key === null) {
          this._open.set(
            event.newValue === null ? this._config.defaultOpen : event.newValue === 'true',
          );
        }
      };
      this._window.addEventListener('storage', storageHandler);

      destroyRef.onDestroy(() => {
        this._mediaQuery?.removeEventListener('change', mediaQueryHandler);
        this._window?.removeEventListener('keydown', keydownHandler);
        this._window?.removeEventListener('resize', resizeHandler);
        this._window?.removeEventListener('storage', storageHandler);
        if (resizeTimeout) this._window?.clearTimeout(resizeTimeout);
      });
    });
  }

  public setOpen(open: boolean): void {
    if (open && this._panelWidthRem() <= 0) {
      this._panelWidthRem.set(this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem));
    }
    this._open.set(open);
    this._document.cookie = `${this._config.sidebarCookieName}=${open}; path=/; max-age=${this._config.sidebarCookieMaxAge}`;
    try {
      this._window?.localStorage.setItem(panelOpenStorageKey, String(open));
    } catch {
      // Keep the state active for this page when storage is unavailable.
    }
  }

  public setOpenMobile(open: boolean): void {
    if (this._isMobile()) this._openMobile.set(open);
  }

  public setVariant(variant: SidebarVariant): void {
    this._variant.set(variant);
  }

  public toggleSidebar(): void {
    if (this._isMobile()) this._openMobile.update((value) => !value);
    else this.setOpen(!this._open());
  }

  public openPanel(): void {
    if (!this._isMobile()) this.setOpen(true);
  }

  public startResize(panelWidthRem = this._panelWidthRem()): void {
    if (this._isMobile()) return;
    this._resizeOriginWidthRem = this._panelWidthRem();
    this._resizeOriginOpen = this._open();
    this._resizing.set(true);
    this._panelWidthRem.set(this.clamp(panelWidthRem, 0, this._panelMaxWidthRem()));
    this._open.set(true);
  }

  public previewResize(panelWidthRem: number): void {
    if (!this._resizing()) return;
    this._panelWidthRem.set(this.clamp(panelWidthRem, 0, this._panelMaxWidthRem()));
  }

  public finishResize(): void {
    if (!this._resizing()) return;
    this._resizing.set(false);
    if (this._panelWidthRem() === 0) {
      this._panelWidthRem.set(this._resizeOriginWidthRem);
      this.setOpen(false);
      return;
    }
    this.setPanelWidthRem(this._panelWidthRem());
  }

  public cancelResize(): void {
    if (!this._resizing()) return;
    this._resizing.set(false);
    this._panelWidthRem.set(this._resizeOriginWidthRem);
    this.setOpen(this._resizeOriginOpen);
  }

  public setPanelWidthRem(panelWidthRem: number): void {
    if (this._isMobile()) return;
    const width = this.clamp(panelWidthRem, 0, this._panelMaxWidthRem());
    if (width === 0) {
      this.setOpen(false);
      return;
    }
    this._panelWidthRem.set(width);
    this.setOpen(true);
    this.persistWidth();
  }

  public collapse(): void {
    if (!this._isMobile()) this.setOpen(false);
  }

  public reset(): void {
    this._resizing.set(false);
    this._panelWidthRem.set(this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem));
    this.setOpen(true);
    try {
      this._window?.localStorage.removeItem(panelWidthStorageKey);
      this._window?.localStorage.removeItem(panelOpenStorageKey);
    } catch {
      // Keep the defaults active for this page when storage is unavailable.
    }
  }

  public pixelsToRem(pixels: number): number {
    if (!this._window) return pixels / 16;
    const rootFontSize = Number.parseFloat(this._window.getComputedStyle(this._root).fontSize);
    return pixels / (Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize : 16);
  }

  private restoreStateFromCookie(): void {
    const cookieString = isPlatformServer(this._platformId)
      ? this._request?.headers.get('cookie')
      : this._document.cookie;
    if (!cookieString) return;
    const prefix = `${this._config.sidebarCookieName}=`;
    const value = cookieString
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix))
      ?.slice(prefix.length);
    if (value !== undefined) this._open.set(value === 'true');
  }

  private initializeState(): void {
    this._railWidthRem.set(this.readCssRem('--app-sidebar-rail-width', fallbackRailWidthRem));
    this._panelMaxWidthRem.set(
      this.readCssRem('--app-sidebar-panel-max-width', fallbackPanelMaxWidthRem),
    );
    const defaultWidth = this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem);
    try {
      const storedWidth = this._window?.localStorage.getItem(panelWidthStorageKey) ?? null;
      const storedOpen = this._window?.localStorage.getItem(panelOpenStorageKey) ?? null;
      this._panelWidthRem.set(
        storedWidth === null ? defaultWidth : this.parseStoredWidth(storedWidth),
      );
      if (storedOpen !== null) this._open.set(storedOpen === 'true');
    } catch {
      this._panelWidthRem.set(defaultWidth);
    }
    this._widthInitialized.set(true);
  }

  private parseStoredWidth(value: string | null): number {
    if (value === null) return this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem);
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0
      ? this.clamp(parsed, 0, this._panelMaxWidthRem())
      : this.readCssRem('--app-sidebar-panel-width', fallbackPanelWidthRem);
  }

  private persistWidth(): void {
    try {
      this._window?.localStorage.setItem(panelWidthStorageKey, String(this._panelWidthRem()));
    } catch {
      // Keep the selected width for this page when storage is unavailable.
    }
  }

  private readCssRem(property: string, fallback: number): number {
    if (!this._window) return fallback;
    const value = this._window.getComputedStyle(this._root).getPropertyValue(property).trim();
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    if (value.endsWith('px')) return this.pixelsToRem(parsed);
    return parsed;
  }

  private clamp(value: number, min: number, max: number): number {
    return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min;
  }
}
