import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const emptyHeaderVariants = cva('flex flex-col items-center', {
  variants: {
    variant: {
      default: 'gap-2 max-w-sm',
      compact: 'gap-0 max-w-none',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type EmptyHeaderVariants = VariantProps<typeof emptyHeaderVariants>;

@Directive({
  selector: '[hlmEmptyHeader],hlm-empty-header',
  host: { 'data-slot': 'empty-header' },
})
export class HlmEmptyHeader {
  public readonly variant = input<EmptyHeaderVariants['variant']>('default');

  constructor() {
    classes(() => emptyHeaderVariants({ variant: this.variant() }));
  }
}
