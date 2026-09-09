import { DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { BrnTabsList } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
import { type VariantProps, cva } from 'class-variance-authority';

export const listVariants = cva(
  'relative rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
type ListVariants = VariantProps<typeof listVariants>;

@Directive({
  selector: '[hlmTabsList],hlm-tabs-list',
  hostDirectives: [BrnTabsList],
  host: {
    'data-slot': 'tabs-list',
    '[attr.data-variant]': 'variant()',
  },
})
export class HlmTabsList {
  public readonly variant = input<ListVariants['variant']>('default');

  constructor() {
    classes(() => listVariants({ variant: this.variant() }));

    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    const view = element.ownerDocument.defaultView;
    if (!view) return;

    const indicator = element.ownerDocument.createElement('span');
    indicator.dataset['slot'] = 'tabs-active-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.className =
      'pointer-events-none absolute top-0 left-0 rounded-md bg-primary shadow-sm motion-safe:transition-[transform,width,height] motion-safe:duration-200 motion-safe:ease-out';
    indicator.style.opacity = '0';
    indicator.style.transition = 'none';
    element.prepend(indicator);

    let transitionsEnabled = false;

    const positionIndicator = (target?: HTMLElement | null) => {
      if (this.variant() !== 'default') {
        indicator.style.opacity = '0';
        return;
      }

      const selected =
        target ??
        element.querySelector<HTMLElement>('[data-slot="tabs-trigger"][aria-selected="true"]');
      if (!selected) {
        indicator.style.opacity = '0';
        return;
      }

      const listRect = element.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      indicator.style.width = `${selectedRect.width}px`;
      indicator.style.height = `${selectedRect.height}px`;
      indicator.style.transform = `translate3d(${selectedRect.left - listRect.left}px, ${selectedRect.top - listRect.top}px, 0)`;
      indicator.style.opacity = '1';
      if (!transitionsEnabled) {
        indicator.getBoundingClientRect();
        indicator.style.removeProperty('transition');
        transitionsEnabled = true;
      }
    };

    const mutationObserver = new view.MutationObserver(() => positionIndicator());
    mutationObserver.observe(element, {
      attributeFilter: ['aria-selected'],
      attributes: true,
      childList: true,
      subtree: true,
    });
    const resizeObserver = new view.ResizeObserver(() => positionIndicator());
    resizeObserver.observe(element);
    view.queueMicrotask(() => positionIndicator());

    destroyRef.onDestroy(() => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      indicator.remove();
    });
  }
}
