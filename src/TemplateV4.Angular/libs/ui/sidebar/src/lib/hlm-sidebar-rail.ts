import { DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmSidebarService } from './hlm-sidebar.service';

@Directive({
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
})
export class HlmSidebarRail {
  protected readonly _sidebarService = inject(HlmSidebarService);
  private readonly _element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  private pointerId: number | null = null;
  private startX = 0;
  private startWidthRem = 0;
  private dragged = false;

  public readonly ariaLabel = input<string>('Toggle Sidebar', { alias: 'aria-label' });

  constructor() {
    classes(() => 'sidebar-resize-separator');
    inject(DestroyRef).onDestroy(() => this._sidebarService.cancelResize());
  }

  protected onDoubleClick(event: MouseEvent): void {
    event.preventDefault();
    this._sidebarService.reset();
  }

  protected onKeydown(event: KeyboardEvent): void {
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
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const sideDirection = side === 'right' ? -direction : direction;
    const current = this._sidebarService.open() ? this._sidebarService.panelWidthRem() : 0;
    this._sidebarService.setPanelWidthRem(current + sideDirection * 0.5);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this._sidebarService.isMobile()) return;
    event.preventDefault();
    this._element.focus({ preventScroll: true });
    this.updateHandle(event);
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startWidthRem = this._sidebarService.open() ? this._sidebarService.panelWidthRem() : 0;
    this.dragged = false;
    this._element.setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    this.updateHandle(event);
    if (event.pointerId !== this.pointerId) return;
    const deltaPixels = event.clientX - this.startX;
    if (!this.dragged && Math.abs(deltaPixels) < 3) return;
    if (!this.dragged) {
      this.dragged = true;
      this._sidebarService.startResize(this.startWidthRem);
    }
    const direction = this.side() === 'right' ? -1 : 1;
    this._sidebarService.previewResize(
      this.startWidthRem + this._sidebarService.pixelsToRem(deltaPixels) * direction,
    );
  }

  protected onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    if (this._element.hasPointerCapture(event.pointerId)) {
      this._element.releasePointerCapture(event.pointerId);
    }
    if (!this.dragged) return;
    this._sidebarService.finishResize();
  }

  protected onPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this._sidebarService.cancelResize();
  }

  protected _currentWidth(): number {
    return this._sidebarService.open()
      ? Number(this._sidebarService.panelWidthRem().toFixed(1))
      : 0;
  }

  private side(): 'left' | 'right' {
    const rtl = getComputedStyle(this._element).direction === 'rtl';
    const right = !!this._element.closest('[data-side="right"]');
    return right !== rtl ? 'right' : 'left';
  }

  protected updateHandle(event: PointerEvent): void {
    const bounds = this._element.getBoundingClientRect();
    const halfGuide = 2.5 / this._sidebarService.pixelsToRem(1);
    const y = Math.max(halfGuide, Math.min(event.clientY - bounds.top, bounds.height - halfGuide));
    this._element.style.setProperty('--sidebar-handle-y', `${y}px`);
  }

  protected centerHandle(): void {
    this._element.style.setProperty('--sidebar-handle-y', '50%');
  }

  protected cancelPointerResize(): void {
    if (this.pointerId === null) return;
    const pointerId = this.pointerId;
    this.pointerId = null;
    this._sidebarService.cancelResize();
    if (this._element.hasPointerCapture(pointerId)) this._element.releasePointerCapture(pointerId);
  }
}
