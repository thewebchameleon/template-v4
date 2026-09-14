import { Directive } from '@angular/core';
import { BrnFieldControlDescribedBy } from '@spartan-ng/brain/field';
import { BrnInput } from '@spartan-ng/brain/input';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/input";
import * as i2 from "@spartan-ng/brain/field";
export class HlmInput {
    constructor() {
        classes(() => 'dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 h-9 rounded-[var(--input-radius,var(--radius-md))] border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] file:h-7 file:text-sm file:font-medium focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50');
    }
    static ɵfac = function HlmInput_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmInput)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmInput, selectors: [["", "hlmInput", ""]], hostAttrs: ["data-slot", "input"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnInput, inputs: ["id", "id", "forceInvalid", "forceInvalid"] }, i2.BrnFieldControlDescribedBy])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmInput, [{
        type: Directive,
        args: [{
                selector: '[hlmInput]',
                hostDirectives: [
                    { directive: BrnInput, inputs: ['id', 'forceInvalid'] },
                    BrnFieldControlDescribedBy,
                ],
                host: { 'data-slot': 'input' },
            }]
    }], () => [], null); })();
