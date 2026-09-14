import { Directive } from '@angular/core';
import { BrnFieldControlDescribedBy } from '@spartan-ng/brain/field';
import { BrnTextarea } from '@spartan-ng/brain/textarea';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/brain/textarea";
import * as i2 from "@spartan-ng/brain/field";
export class HlmTextarea {
    constructor() {
        classes(() => 'border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 data-[matches-spartan-invalid=true]:ring-destructive/20 dark:data-[matches-spartan-invalid=true]:ring-destructive/40 data-[matches-spartan-invalid=true]:border-destructive dark:data-[matches-spartan-invalid=true]:border-destructive/50 rounded-md border bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-3 data-[matches-spartan-invalid=true]:ring-3 md:text-sm placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50');
    }
    static ɵfac = function HlmTextarea_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTextarea)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTextarea, selectors: [["", "hlmTextarea", ""]], hostAttrs: ["data-slot", "textarea"], features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.BrnTextarea, inputs: ["id", "id", "forceInvalid", "forceInvalid"] }, i2.BrnFieldControlDescribedBy])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTextarea, [{
        type: Directive,
        args: [{
                selector: '[hlmTextarea]',
                hostDirectives: [
                    { directive: BrnTextarea, inputs: ['id', 'forceInvalid'] },
                    BrnFieldControlDescribedBy,
                ],
                host: { 'data-slot': 'textarea' },
            }]
    }], () => [], null); })();
