import { Directive, effect, inject, input } from '@angular/core';
import { BrnFieldA11yService } from '@spartan-ng/brain/field';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmFieldDescription {
    static _id = 0;
    _a11y = inject(BrnFieldA11yService, { optional: true, host: true });
    id = input(`hlm-field-description-${HlmFieldDescription._id++}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "id" }] : /* istanbul ignore next */ []));
    _registeredId;
    _cleanup = this._a11y
        ? effect(() => {
            const a11y = this._a11y;
            if (!a11y)
                return;
            const id = this.id();
            if (this._registeredId && this._registeredId !== id) {
                a11y.unregisterDescription(this._registeredId);
            }
            if (this._registeredId !== id) {
                a11y.registerDescription(id);
                this._registeredId = id;
            }
        })
        : null;
    constructor() {
        classes(() => [
            'text-muted-foreground text-start text-sm [[data-variant=legend]+&]:-mt-1.5 leading-normal font-normal group-has-data-horizontal/field:text-balance',
            'last:mt-0 nth-last-2:-mt-1',
            '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        ]);
    }
    ngOnDestroy() {
        this._cleanup?.destroy();
        if (this._registeredId) {
            this._a11y?.unregisterDescription(this._registeredId);
        }
    }
    static ɵfac = function HlmFieldDescription_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldDescription)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmFieldDescription, selectors: [["", "hlmFieldDescription", ""], ["hlm-field-description"]], hostAttrs: ["data-slot", "field-description"], hostVars: 1, hostBindings: function HlmFieldDescription_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("id", ctx.id());
        } }, inputs: { id: [1, "id"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldDescription, [{
        type: Directive,
        args: [{
                selector: '[hlmFieldDescription],hlm-field-description',
                host: {
                    'data-slot': 'field-description',
                    '[attr.id]': 'id()',
                },
            }]
    }], () => [], { id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: false }] }] }); })();
