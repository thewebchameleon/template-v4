import { computed, Directive, input } from '@angular/core';
import { BrnToggleGroupItem } from '@spartan-ng/brain/toggle-group';
import { toggleVariants } from '@spartan-ng/helm/toggle';
import { classes } from '@spartan-ng/helm/utils';
import { injectHlmToggleGroup } from './hlm-toggle-group.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/toggle-group";
export class HlmToggleGroupItem {
    _toggleGroup = injectHlmToggleGroup();
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    _variant = computed(() => this._toggleGroup.variant() || this.variant(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_variant" }] : /* istanbul ignore next */ []));
    _size = computed(() => this._toggleGroup.size() || this.size(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_size" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => [
            'data-[state=on]:bg-muted group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:shadow-none group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-md group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-s group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t group-data-[variant=inset]/toggle-group:rounded-md group-data-[variant=inset]/toggle-group:data-[state=on]:bg-primary group-data-[variant=inset]/toggle-group:data-[state=on]:text-primary-foreground group-data-[variant=inset]/toggle-group:data-[state=on]:shadow-sm group-data-[variant=inset]/toggle-group:data-[state=on]:hover:bg-primary',
            toggleVariants({
                variant: this._variant(),
                size: this._size(),
            }),
        ]);
    }
    static ɵfac = function HlmToggleGroupItem_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmToggleGroupItem)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmToggleGroupItem, selectors: [["button", "hlmToggleGroupItem", ""]], hostAttrs: ["data-slot", "toggle-group-item"], hostVars: 3, hostBindings: function HlmToggleGroupItem_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-variant", ctx._variant())("data-size", ctx._size())("data-spacing", ctx._toggleGroup.spacing());
        } }, inputs: { variant: [1, "variant"], size: [1, "size"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnToggleGroupItem, inputs: ["id", "id", "value", "value", "disabled", "disabled", "state", "state", "aria-label", "aria-label", "type", "type"], outputs: ["stateChange", "stateChange"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmToggleGroupItem, [{
        type: Directive,
        args: [{
                selector: 'button[hlmToggleGroupItem]',
                hostDirectives: [
                    {
                        directive: BrnToggleGroupItem,
                        inputs: ['id', 'value', 'disabled', 'state', 'aria-label', 'type'],
                        outputs: ['stateChange'],
                    },
                ],
                host: {
                    'data-slot': 'toggle-group-item',
                    '[attr.data-variant]': '_variant()',
                    '[attr.data-size]': '_size()',
                    '[attr.data-spacing]': '_toggleGroup.spacing()',
                },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] }); })();
