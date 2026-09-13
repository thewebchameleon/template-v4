import { booleanAttribute, Directive, input, model } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmCardConfig, injectHlmCardConfig } from './hlm-card.token';

@Directive({
  selector: '[hlmCard],hlm-card',
  host: {
    'data-slot': 'card',
    '[attr.data-size]': 'size()',
    '[attr.data-collapsible]': 'collapsible() ? "true" : null',
    '[attr.data-state]': 'collapsible() ? (expanded() ? "expanded" : "collapsed") : null',
  },
})
export class HlmCard {
  private readonly _defaultConfig = injectHlmCardConfig();
  public readonly size = input<HlmCardConfig['size']>(this._defaultConfig.size);
  public readonly collapsible = input(false, { transform: booleanAttribute });
  public readonly collapsibleHeader = input(true, { transform: booleanAttribute });
  public readonly expanded = model(true);

  public toggle(): void {
    if (this.collapsible()) {
      this.expanded.update((expanded) => !expanded);
    }
  }

  constructor() {
    classes(
      () =>
        'group/card flex flex-col gap-0 overflow-hidden rounded-(--panel-radius) bg-muted/60 p-(--panel-inset) text-sm text-card-foreground [--card-spacing:var(--panel-content-spacing)] data-[size=sm]:[--card-spacing:--spacing(4)]',
    );
  }
}
