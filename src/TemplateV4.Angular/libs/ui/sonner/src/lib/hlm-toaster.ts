import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheck,
  lucideCircleX,
  lucideInfo,
  lucideLoaderCircle,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { BrnSonnerImports, type ToasterProps } from '@spartan-ng/brain/sonner';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'hlm-toaster',
  imports: [BrnSonnerImports, NgIcon],
  providers: [
    provideIcons({
      lucideCircleCheck,
      lucideCircleX,
      lucideInfo,
      lucideLoaderCircle,
      lucideTriangleAlert,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <brn-sonner-toaster
      [class]="_computedClass()"
      [invert]="invert()"
      [theme]="theme()"
      [position]="position()"
      [hotKey]="hotKey()"
      [richColors]="richColors()"
      [expand]="expand()"
      [duration]="duration()"
      [visibleToasts]="visibleToasts()"
      [closeButton]="closeButton()"
      [toastOptions]="_computedToastOptions()"
      [offset]="offset()"
      [style]="userStyle()"
    >
      <ng-template #loadingIcon>
        <ng-icon
          class="motion-safe:animate-spin"
          name="lucideLoaderCircle"
          size="20"
          aria-hidden="true"
        />
      </ng-template>
      <ng-template #successIcon>
        <ng-icon name="lucideCircleCheck" size="20" aria-hidden="true" />
      </ng-template>
      <ng-template #errorIcon>
        <ng-icon name="lucideCircleX" size="20" aria-hidden="true" />
      </ng-template>
      <ng-template #infoIcon>
        <ng-icon name="lucideInfo" size="20" aria-hidden="true" />
      </ng-template>
      <ng-template #warningIcon>
        <ng-icon name="lucideTriangleAlert" size="20" aria-hidden="true" />
      </ng-template>
    </brn-sonner-toaster>
  `,
})
export class HlmToaster {
  public readonly invert = input<ToasterProps['invert'], BooleanInput>(false, {
    transform: booleanAttribute,
  });
  public readonly theme = input<ToasterProps['theme']>('light');
  public readonly position = input<ToasterProps['position']>('bottom-right');
  public readonly hotKey = input<ToasterProps['hotkey']>(['altKey', 'KeyT']);
  public readonly richColors = input<ToasterProps['richColors'], BooleanInput>(false, {
    transform: booleanAttribute,
  });
  public readonly expand = input<ToasterProps['expand'], BooleanInput>(false, {
    transform: booleanAttribute,
  });
  public readonly duration = input<ToasterProps['duration'], NumberInput>(4000, {
    transform: numberAttribute,
  });
  public readonly visibleToasts = input<ToasterProps['visibleToasts'], NumberInput>(3, {
    transform: numberAttribute,
  });
  public readonly closeButton = input<ToasterProps['closeButton'], BooleanInput>(false, {
    transform: booleanAttribute,
  });
  public readonly toastOptions = input<ToasterProps['toastOptions']>({});

  protected readonly _computedToastOptions = computed(() => {
    const options = this.toastOptions();
    return {
      ...options,
      classes: {
        ...options?.classes,
        toast: hlm(
          'items-start! gap-2.5! rounded-xl! border-0! px-4! py-3! shadow-none! [&_[data-content]]:gap-0.5! [&_[data-icon]]:m-0! [&_[data-icon]]:mt-0.5! [&_[data-icon]]:size-5! [&_[data-icon]]:items-center! [&_[data-icon]]:justify-center! [&_[data-icon]_ng-icon]:flex [&_[data-icon]_ng-icon]:items-center [&_[data-icon]_ng-icon]:justify-center [&_[data-icon]_svg]:m-0! [&_[data-icon]_svg]:[--ng-icon__stroke-width:2]',
          options?.classes?.toast,
        ),
        title: hlm('text-sm! leading-5! font-semibold!', options?.classes?.title),
        description: hlm('text-xs! leading-4! opacity-100!', options?.classes?.description),
      },
    };
  });
  public readonly offset = input<ToasterProps['offset']>(null);
  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  public readonly userStyle = input<Record<string, string>>(
    {
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
      '--brn-sonner-toast-success-background': 'var(--toast-success-background)',
      '--brn-sonner-toast-success-border': 'var(--toast-success-background)',
      '--brn-sonner-toast-success-color': 'var(--toast-success-foreground)',
      '--brn-sonner-toast-info-background': 'var(--toast-info-background)',
      '--brn-sonner-toast-info-border': 'var(--toast-info-background)',
      '--brn-sonner-toast-info-color': 'var(--toast-info-foreground)',
      '--brn-sonner-toast-warning-background': 'var(--toast-warning-background)',
      '--brn-sonner-toast-warning-border': 'var(--toast-warning-background)',
      '--brn-sonner-toast-warning-color': 'var(--toast-warning-foreground)',
      '--brn-sonner-toast-error-background': 'var(--toast-error-background)',
      '--brn-sonner-toast-error-border': 'var(--toast-error-background)',
      '--brn-sonner-toast-error-color': 'var(--toast-error-foreground)',
      '--brn-sonner-toast-dark-success-background': 'var(--toast-success-background)',
      '--brn-sonner-toast-dark-success-border': 'var(--toast-success-background)',
      '--brn-sonner-toast-dark-success-color': 'var(--toast-success-foreground)',
      '--brn-sonner-toast-dark-info-background': 'var(--toast-info-background)',
      '--brn-sonner-toast-dark-info-border': 'var(--toast-info-background)',
      '--brn-sonner-toast-dark-info-color': 'var(--toast-info-foreground)',
      '--brn-sonner-toast-dark-warning-background': 'var(--toast-warning-background)',
      '--brn-sonner-toast-dark-warning-border': 'var(--toast-warning-background)',
      '--brn-sonner-toast-dark-warning-color': 'var(--toast-warning-foreground)',
      '--brn-sonner-toast-dark-error-background': 'var(--toast-error-background)',
      '--brn-sonner-toast-dark-error-border': 'var(--toast-error-background)',
      '--brn-sonner-toast-dark-error-color': 'var(--toast-error-foreground)',
    },
    { alias: 'style' },
  );

  protected readonly _computedClass = computed(() => hlm('toaster group', this.userClass()));
}
