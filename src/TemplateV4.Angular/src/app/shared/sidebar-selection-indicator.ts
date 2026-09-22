import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appSidebarSelectionIndicator]' })
export class SidebarSelectionIndicator {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private frame = 0;

  constructor() {
    afterNextRender(() => {
      const mutations = new MutationObserver(() => this.schedulePosition());
      mutations.observe(this.element, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-active'],
      });

      const resize = new ResizeObserver(() => this.schedulePosition());
      resize.observe(this.element);
      this.schedulePosition();

      this.destroyRef.onDestroy(() => {
        mutations.disconnect();
        resize.disconnect();
        cancelAnimationFrame(this.frame);
      });
    });
  }

  private schedulePosition() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.position());
  }

  private position() {
    const active = this.element.querySelector<HTMLElement>(
      "[data-sidebar='menu-button'][data-active='true']",
    );
    if (!active) {
      this.element.style.setProperty('--sidebar-selection-opacity', '0');
      return;
    }

    const container = this.element.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    this.element.style.setProperty(
      '--sidebar-selection-x',
      `${item.left - container.left + this.element.scrollLeft}px`,
    );
    this.element.style.setProperty(
      '--sidebar-selection-y',
      `${item.top - container.top + this.element.scrollTop}px`,
    );
    this.element.style.setProperty('--sidebar-selection-width', `${item.width}px`);
    this.element.style.setProperty('--sidebar-selection-height', `${item.height}px`);
    this.element.style.setProperty('--sidebar-selection-opacity', '1');

    if (!this.element.hasAttribute('data-selection-indicator-ready')) {
      void this.element.offsetHeight;
      this.element.setAttribute('data-selection-indicator-ready', 'true');
    }
  }
}
