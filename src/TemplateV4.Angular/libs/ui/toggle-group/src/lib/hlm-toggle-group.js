import { Directive, input, numberAttribute } from '@angular/core';
import { BrnToggleGroup } from '@spartan-ng/brain/toggle-group';
import { classes } from '@spartan-ng/helm/utils';
import { provideHlmToggleGroup } from './hlm-toggle-group.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/toggle-group";
export class HlmToggleGroup {
    variant = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    size = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    spacing = input(0, { ...(ngDevMode ? { debugName: "spacing" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    orientation = input('horizontal', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "orientation" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => 'rounded-md data-[spacing=0]:data-[variant=outline]:shadow-xs data-[variant=inset]:bg-muted data-[variant=inset]:p-[3px] data-[variant=inset]:rounded-lg group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch');
    }
    static ɵfac = function HlmToggleGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmToggleGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmToggleGroup, selectors: [["", "hlmToggleGroup", ""], ["hlm-toggle-group"]], hostAttrs: ["data-slot", "toggle-group"], hostVars: 6, hostBindings: function HlmToggleGroup_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-variant", ctx.variant())("data-size", ctx.size())("data-spacing", ctx.spacing())("data-orientation", ctx.orientation());
            i0.ɵɵstyleProp("--%NS%gap", ctx.spacing());
        } }, inputs: { variant: [1, "variant"], size: [1, "size"], spacing: [1, "spacing"], orientation: [1, "orientation"] }, features: [i0.ɵɵProvidersFeature([provideHlmToggleGroup(HlmToggleGroup)]), i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnToggleGroup, inputs: ["type", "type", "value", "value", "nullable", "nullable", "disabled", "disabled"], outputs: ["valueChange", "valueChange"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmToggleGroup, [{
        type: Directive,
        args: [{
                selector: '[hlmToggleGroup],hlm-toggle-group',
                providers: [provideHlmToggleGroup(HlmToggleGroup)],
                hostDirectives: [
                    {
                        directive: BrnToggleGroup,
                        inputs: ['type', 'value', 'nullable', 'disabled'],
                        outputs: ['valueChange'],
                    },
                ],
                host: {
                    'data-slot': 'toggle-group',
                    '[attr.data-variant]': 'variant()',
                    '[attr.data-size]': 'size()',
                    '[attr.data-spacing]': 'spacing()',
                    '[attr.data-orientation]': 'orientation()',
                    '[style.--gap]': 'spacing()',
                },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], spacing: [{ type: i0.Input, args: [{ isSignal: true, alias: "spacing", required: false }] }], orientation: [{ type: i0.Input, args: [{ isSignal: true, alias: "orientation", required: false }] }] }); })();
