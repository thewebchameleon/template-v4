import { Directive, input } from '@angular/core';
import { BrnTabsTrigger } from '@spartan-ng/brain/tabs';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/tabs";
export class HlmTabsTrigger {
    triggerFor = input.required({ ...(ngDevMode ? { debugName: "triggerFor" } : /* istanbul ignore next */ {}), alias: 'hlmTabsTrigger' });
    constructor() {
        classes(() => [
            `relative z-10 gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium group-data-[variant=line]/tabs-list:data-active:shadow-none [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-colors group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0`,
            'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
            'data-active:border-transparent data-active:bg-transparent data-active:text-primary-foreground data-active:hover:text-primary-foreground dark:data-active:text-primary-foreground dark:data-active:hover:text-primary-foreground',
            'after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        ]);
    }
    static ɵfac = function HlmTabsTrigger_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTabsTrigger)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTabsTrigger, selectors: [["", "hlmTabsTrigger", ""]], hostAttrs: ["data-slot", "tabs-trigger"], inputs: { triggerFor: [1, "hlmTabsTrigger", "triggerFor"] }, features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnTabsTrigger, inputs: ["brnTabsTrigger", "hlmTabsTrigger", "disabled", "disabled"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTabsTrigger, [{
        type: Directive,
        args: [{
                selector: '[hlmTabsTrigger]',
                hostDirectives: [
                    { directive: BrnTabsTrigger, inputs: ['brnTabsTrigger: hlmTabsTrigger', 'disabled'] },
                ],
                host: {
                    'data-slot': 'tabs-trigger',
                },
            }]
    }], () => [], { triggerFor: [{ type: i0.Input, args: [{ isSignal: true, alias: "hlmTabsTrigger", required: true }] }] }); })();
