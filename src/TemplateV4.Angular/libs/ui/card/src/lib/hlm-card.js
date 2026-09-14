import { booleanAttribute, Directive, input, model } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { injectHlmCardConfig } from './hlm-card.token';
import * as i0 from "@angular/core";
export class HlmCard {
    _defaultConfig = injectHlmCardConfig();
    size = input(this._defaultConfig.size, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    collapsible = input(false, { ...(ngDevMode ? { debugName: "collapsible" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    collapsibleHeader = input(true, { ...(ngDevMode ? { debugName: "collapsibleHeader" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    expanded = model(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "expanded" }] : /* istanbul ignore next */ []));
    toggle() {
        if (this.collapsible()) {
            this.expanded.update((expanded) => !expanded);
        }
    }
    constructor() {
        classes(() => 'group/card flex flex-col gap-0 overflow-hidden rounded-(--panel-radius) bg-muted/60 p-(--panel-inset) text-sm text-card-foreground [--card-spacing:var(--panel-content-spacing)] data-[size=sm]:[--card-spacing:--spacing(4)]');
    }
    static ɵfac = function HlmCard_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCard)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmCard, selectors: [["", "hlmCard", ""], ["hlm-card"]], hostAttrs: ["data-slot", "card"], hostVars: 3, hostBindings: function HlmCard_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-size", ctx.size())("data-collapsible", ctx.collapsible() ? "true" : null)("data-state", ctx.collapsible() ? ctx.expanded() ? "expanded" : "collapsed" : null);
        } }, inputs: { size: [1, "size"], collapsible: [1, "collapsible"], collapsibleHeader: [1, "collapsibleHeader"], expanded: [1, "expanded"] }, outputs: { expanded: "expandedChange" } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCard, [{
        type: Directive,
        args: [{
                selector: '[hlmCard],hlm-card',
                host: {
                    'data-slot': 'card',
                    '[attr.data-size]': 'size()',
                    '[attr.data-collapsible]': 'collapsible() ? "true" : null',
                    '[attr.data-state]': 'collapsible() ? (expanded() ? "expanded" : "collapsed") : null',
                },
            }]
    }], () => [], { size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], collapsible: [{ type: i0.Input, args: [{ isSignal: true, alias: "collapsible", required: false }] }], collapsibleHeader: [{ type: i0.Input, args: [{ isSignal: true, alias: "collapsibleHeader", required: false }] }], expanded: [{ type: i0.Input, args: [{ isSignal: true, alias: "expanded", required: false }] }, { type: i0.Output, args: ["expandedChange"] }] }); })();
