import { Directive, inject } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmCard } from './hlm-card';
import * as i0 from "@angular/core";
export class HlmCardHeader {
    _card = inject(HlmCard, { optional: true });
    constructor() {
        classes(() => "group/card-header @container/card-header grid auto-rows-min items-start gap-1 ps-(--panel-header-padding-inline) pe-[var(--panel-header-padding-end,var(--panel-header-padding-inline))] pt-[var(--panel-header-padding-top,var(--panel-header-padding-block))] pb-(--panel-header-padding-block) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] data-[collapsible=true]:grid-cols-[minmax(0,1fr)_auto] data-[collapsible=true]:cursor-pointer data-[collapsible=true]:rounded-(--panel-content-radius) data-[collapsible=true]:outline-none data-[collapsible=true]:after:col-start-2 data-[collapsible=true]:after:row-span-2 data-[collapsible=true]:after:row-start-1 data-[collapsible=true]:after:place-self-center data-[collapsible=true]:after:size-5 data-[collapsible=true]:after:rotate-45 data-[collapsible=true]:after:border-e-[3px] data-[collapsible=true]:after:border-b-[3px] data-[collapsible=true]:after:border-muted-foreground/60 data-[collapsible=true]:after:content-[''] data-[collapsible=true]:after:transition-transform data-[collapsible=true]:after:duration-200 data-[collapsible=true]:focus-visible:ring-2 data-[collapsible=true]:focus-visible:ring-ring data-[collapsible=true]:focus-visible:ring-offset-2 data-[collapsible=true]:focus-visible:ring-offset-muted data-[state=collapsed]:after:-rotate-45 motion-reduce:after:transition-none");
    }
    _toggle(event) {
        if (this._headerCollapsible() && !this._isNestedInteractive(event)) {
            this._card?.toggle();
        }
    }
    _handleKeydown(event) {
        if (!this._headerCollapsible() ||
            this._isNestedInteractive(event) ||
            (event.key !== 'Enter' && event.key !== ' ')) {
            return;
        }
        event.preventDefault();
        this._card?.toggle();
    }
    _headerCollapsible() {
        return (this._card?.collapsible() ?? false) && (this._card?.collapsibleHeader() ?? false);
    }
    _isNestedInteractive(event) {
        const target = event.target;
        const currentTarget = event.currentTarget;
        if (!(target instanceof Element) || !(currentTarget instanceof Element)) {
            return false;
        }
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], [contenteditable="true"]');
        return interactive !== null && interactive !== currentTarget;
    }
    static ɵfac = function HlmCardHeader_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCardHeader)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmCardHeader, selectors: [["", "hlmCardHeader", ""], ["hlm-card-header"]], hostAttrs: ["data-slot", "card-header"], hostVars: 5, hostBindings: function HlmCardHeader_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function HlmCardHeader_click_HostBindingHandler($event) { return ctx._toggle($event); })("keydown", function HlmCardHeader_keydown_HostBindingHandler($event) { return ctx._handleKeydown($event); });
        } if (rf & 2) {
            i0.ɵɵattribute("data-collapsible", ctx._headerCollapsible() ? "true" : null)("data-state", ctx._headerCollapsible() ? ctx._card?.expanded() ? "expanded" : "collapsed" : null)("role", ctx._headerCollapsible() ? "button" : null)("tabindex", ctx._headerCollapsible() ? 0 : null)("aria-expanded", ctx._headerCollapsible() ? ctx._card?.expanded() : null);
        } } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCardHeader, [{
        type: Directive,
        args: [{
                selector: '[hlmCardHeader],hlm-card-header',
                host: {
                    'data-slot': 'card-header',
                    '[attr.data-collapsible]': '_headerCollapsible() ? "true" : null',
                    '[attr.data-state]': '_headerCollapsible() ? (_card?.expanded() ? "expanded" : "collapsed") : null',
                    '[attr.role]': '_headerCollapsible() ? "button" : null',
                    '[attr.tabindex]': '_headerCollapsible() ? 0 : null',
                    '[attr.aria-expanded]': '_headerCollapsible() ? _card?.expanded() : null',
                    '(click)': '_toggle($event)',
                    '(keydown)': '_handleKeydown($event)',
                },
            }]
    }], () => [], null); })();
