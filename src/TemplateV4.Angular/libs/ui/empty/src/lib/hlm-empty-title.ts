import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const emptyTitleVariants = cva('font-medium tracking-tight', {
  variants: {
    variant: {
      default: 'text-lg',
      compact: 'text-sm whitespace-nowrap',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type EmptyTitleVariants = VariantProps<typeof emptyTitleVariants>;

@Directive({
  selector: '[hlmEmptyTitle]',
  host: { 'data-slot': 'empty-title' },
})
export class HlmEmptyTitle {
  public readonly variant = input<EmptyTitleVariants['variant']>('default');

  constructor() {
    classes(() => emptyTitleVariants({ variant: this.variant() }));
  }
}
