import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appDashboardMasonryItem]' })
export class DashboardMasonryItem {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private frame = 0;

  constructor() {
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.scheduleLayout());
      observer.observe(this.element);
      this.scheduleLayout();
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        cancelAnimationFrame(this.frame);
      });
    });
  }

  private scheduleLayout() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const grid = this.element.parentElement;
      if (!grid) return;
      const styles = getComputedStyle(grid);
      const rowHeight = Number.parseFloat(styles.gridAutoRows);
      const cardGap = Number.parseFloat(styles.columnGap);
      if (!rowHeight || Number.isNaN(cardGap)) return;
      const height = this.element.getBoundingClientRect().height;
      const span = Math.ceil((height + cardGap) / rowHeight);
      this.element.style.gridRowEnd = `span ${span}`;
    });
  }
}
