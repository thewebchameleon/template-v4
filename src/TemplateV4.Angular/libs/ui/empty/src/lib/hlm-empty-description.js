import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmEmptyDescription {
    constructor() {
        classes(() => 'text-sm/relaxed text-muted-foreground [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4');
    }
    static ɵfac = function HlmEmptyDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmEmptyDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmEmptyDescription, selectors: [["", "hlmEmptyDescription", ""]], hostAttrs: ["data-slot", "empty-description"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmEmptyDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmEmptyDescription]',
                host: { 'data-slot': 'empty-description' },
            }]
    }], () => [], null); })();
