import { afterRenderEffect, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmCard } from './hlm-card';

@Directive({
  selector: '[hlmCardContent]',
  host: { 'data-slot': 'card-content' },
})
export class HlmCardContent {
  protected readonly _card = inject(HlmCard, { optional: true });
  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _destroyRef = inject(DestroyRef);
  private _animation?: Animation;
  private _wasCollapsible = false;
  private _wasExpanded = true;

  constructor() {
    classes(
      () =>
        'rounded-(--panel-content-radius) bg-card px-(--card-spacing) pt-[var(--panel-content-padding-top,var(--card-spacing))] pb-(--card-spacing) shadow-xs ring-1 ring-foreground/10 [&:has(+_[data-slot=card-footer])]:rounded-b-none',
    );

    afterRenderEffect(() => {
      const collapsible = this._card?.collapsible() ?? false;
      const expanded = !collapsible || (this._card?.expanded() ?? true);

      if (!collapsible) {
        this._animation?.cancel();
        this._resetAnimationStyles();
        this._element.hidden = false;
      } else if (this._wasCollapsible && expanded !== this._wasExpanded) {
        this._animate(expanded);
      } else {
        this._element.hidden = !expanded;
      }

      this._wasCollapsible = collapsible;
      this._wasExpanded = expanded;
    });
    this._destroyRef.onDestroy(() => this._animation?.cancel());
  }

  private _animate(expanded: boolean): void {
    const element = this._element;
    const view = element.ownerDocument.defaultView;
    const reducedMotion =
      element.ownerDocument.documentElement.dataset['motion'] === 'reduced' ||
      (view?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false);

    this._animation?.cancel();
    if (reducedMotion) {
      this._resetAnimationStyles();
      element.hidden = !expanded;
      return;
    }

    const startHeight = element.hidden ? 0 : element.getBoundingClientRect().height;
    const startOpacity = element.hidden
      ? 0
      : Number.parseFloat(view?.getComputedStyle(element).opacity ?? '1');
    element.hidden = false;
    const endHeight = expanded ? element.scrollHeight : 0;

    element.style.overflow = 'hidden';
    element.style.willChange = 'height, opacity';
    const animation = element.animate(
      [
        { height: `${startHeight}px`, opacity: Number.isNaN(startOpacity) ? 1 : startOpacity },
        { height: `${endHeight}px`, opacity: expanded ? 1 : 0 },
      ],
      {
        duration: 240,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        fill: 'both',
      },
    );
    this._animation = animation;

    void animation.finished
      .then(() => {
        if (this._animation !== animation) return;
        element.hidden = !expanded;
        animation.cancel();
        this._animation = undefined;
        this._resetAnimationStyles();
      })
      .catch(() => undefined);
  }

  private _resetAnimationStyles(): void {
    this._element.style.removeProperty('overflow');
    this._element.style.removeProperty('will-change');
  }
}
