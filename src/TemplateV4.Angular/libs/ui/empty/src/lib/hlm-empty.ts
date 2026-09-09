import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const emptyVariants = cva(
  'flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center',
  {
    variants: {
      variant: {
        default: 'gap-4 rounded-lg border-dashed p-12 text-balance',
        compact: 'gap-0 p-0 text-nowrap',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type EmptyVariants = VariantProps<typeof emptyVariants>;

@Directive({
  selector: '[hlmEmpty],hlm-empty',
  host: { 'data-slot': 'empty' },
})
export class HlmEmpty {
  public readonly variant = input<EmptyVariants['variant']>('default');

  constructor() {
    classes(() => emptyVariants({ variant: this.variant() }));
  }
}
