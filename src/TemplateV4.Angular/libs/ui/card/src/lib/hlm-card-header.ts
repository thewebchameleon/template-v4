import { Directive, inject } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmCard } from './hlm-card';

@Directive({
  selector: '[hlmCardHeader],hlm-card-header',
  host: {
    'data-slot': 'card-header',
    '[attr.data-collapsible]': '_headerCollapsible() ? "true" : null',
    '[attr.data-state]':
      '_headerCollapsible() ? (_card?.expanded() ? "expanded" : "collapsed") : null',
    '[attr.role]': '_headerCollapsible() ? "button" : null',
    '[attr.tabindex]': '_headerCollapsible() ? 0 : null',
    '[attr.aria-expanded]': '_headerCollapsible() ? _card?.expanded() : null',
    '(click)': '_toggle($event)',
    '(keydown)': '_handleKeydown($event)',
  },
})
export class HlmCardHeader {
  protected readonly _card = inject(HlmCard, { optional: true });

  constructor() {
    classes(
      () =>
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 ps-(--panel-header-padding-inline) pe-[var(--panel-header-padding-end,var(--panel-header-padding-inline))] pt-[var(--panel-header-padding-top,var(--panel-header-padding-block))] pb-(--panel-header-padding-block) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] data-[collapsible=true]:grid-cols-[minmax(0,1fr)_auto] data-[collapsible=true]:cursor-pointer data-[collapsible=true]:rounded-(--panel-content-radius) data-[collapsible=true]:outline-none data-[collapsible=true]:after:col-start-2 data-[collapsible=true]:after:row-span-2 data-[collapsible=true]:after:row-start-1 data-[collapsible=true]:after:place-self-center data-[collapsible=true]:after:size-5 data-[collapsible=true]:after:rotate-45 data-[collapsible=true]:after:border-e-[3px] data-[collapsible=true]:after:border-b-[3px] data-[collapsible=true]:after:border-muted-foreground/60 data-[collapsible=true]:after:content-[''] data-[collapsible=true]:after:transition-transform data-[collapsible=true]:after:duration-200 data-[collapsible=true]:focus-visible:ring-2 data-[collapsible=true]:focus-visible:ring-ring data-[collapsible=true]:focus-visible:ring-offset-2 data-[collapsible=true]:focus-visible:ring-offset-muted data-[state=collapsed]:after:-rotate-45 motion-reduce:after:transition-none",
    );
  }

  protected _toggle(event: MouseEvent): void {
    if (this._headerCollapsible() && !this._isNestedInteractive(event)) {
      this._card?.toggle();
    }
  }

  protected _handleKeydown(event: KeyboardEvent): void {
    if (
      !this._headerCollapsible() ||
      this._isNestedInteractive(event) ||
      (event.key !== 'Enter' && event.key !== ' ')
    ) {
      return;
    }

    event.preventDefault();
    this._card?.toggle();
  }

  protected _headerCollapsible(): boolean {
    return (this._card?.collapsible() ?? false) && (this._card?.collapsibleHeader() ?? false);
  }

  private _isNestedInteractive(event: Event): boolean {
    const target = event.target;
    const currentTarget = event.currentTarget;
    if (!(target instanceof Element) || !(currentTarget instanceof Element)) {
      return false;
    }

    const interactive = target.closest(
      'button, a, input, select, textarea, [role="button"], [contenteditable="true"]',
    );
    return interactive !== null && interactive !== currentTarget;
  }
}
