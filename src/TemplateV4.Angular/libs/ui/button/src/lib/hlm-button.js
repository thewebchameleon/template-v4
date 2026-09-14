import { Directive, input, signal } from '@angular/core';
import { BrnButton } from '@spartan-ng/brain/button';
import { classes } from '@spartan-ng/helm/utils';
import { cva } from 'class-variance-authority';
import { injectBrnButtonConfig } from './hlm-button.token';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/button";
export const buttonVariants = cva("focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px data-[matches-spartan-invalid=true]:ring-3 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(4)] group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/80',
            outline: 'border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground shadow-xs',
            secondary: 'bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
            warning: 'bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[color-mix(in_oklch,var(--warning),black_12%)] dark:hover:bg-[color-mix(in_oklch,var(--warning),white_12%)]',
            ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
            destructive: 'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
            link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
            default: 'h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
            xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(3)]",
            sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
            text: 'h-auto p-0 text-[0.8rem]',
            lg: 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
            icon: 'size-9',
            'icon-xs': "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_ng-icon:not([class*='text-'])]:text-[length:--spacing(3)]",
            'icon-sm': 'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
            'icon-lg': 'size-10',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
export class HlmButton {
    _config = injectBrnButtonConfig();
    _additionalClasses = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_additionalClasses" }] : /* istanbul ignore next */ []));
    variant = input(this._config.variant, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    size = input(this._config.size, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    constructor() {
        classes(() => [
            buttonVariants({ variant: this.variant(), size: this.size() }),
            this._additionalClasses(),
        ]);
    }
    setClass(classes) {
        this._additionalClasses.set(classes);
    }
    static ɵfac = function HlmButton_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmButton)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmButton, selectors: [["button", "hlmBtn", ""], ["a", "hlmBtn", ""]], hostAttrs: ["data-slot", "button"], inputs: { variant: [1, "variant"], size: [1, "size"] }, exportAs: ["hlmBtn"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnButton, inputs: ["disabled", "disabled"] }])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmButton, [{
        type: Directive,
        args: [{
                selector: 'button[hlmBtn], a[hlmBtn]',
                exportAs: 'hlmBtn',
                hostDirectives: [{ directive: BrnButton, inputs: ['disabled'] }],
                host: { 'data-slot': 'button' },
            }]
    }], () => [], { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] }); })();
