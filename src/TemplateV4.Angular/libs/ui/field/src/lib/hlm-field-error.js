import { booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, inject, input, } from '@angular/core';
import { BrnField, BrnFieldA11yService } from '@spartan-ng/brain/field';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
const _c0 = ["*"];
function HlmFieldError_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵprojection(0);
} }
export class HlmFieldError {
    static _id = 0;
    _field = inject(BrnField, { optional: true });
    _a11y = inject(BrnFieldA11yService, { optional: true, host: true });
    _registeredId;
    _hasParentField = !!this._field;
    /** The unique ID for the field error. If none is supplied, it will be auto-generated. */
    id = input(`hlm-field-error-${HlmFieldError._id++}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "id" }] : /* istanbul ignore next */ []));
    /**
     * The name of the specific validator error key to match (e.g. 'required').
     * When omitted, the error is shown if any validation error is present.
     */
    validator = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "validator" }] : /* istanbul ignore next */ []));
    /** Forces the error message to be visible regardless of the control's validation state. */
    forceShow = input(false, { ...(ngDevMode ? { debugName: "forceShow" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    _display = computed(() => !this._hasParentField || this.forceShow() || this._hasError(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_display" }] : /* istanbul ignore next */ []));
    _hasError = computed(() => {
        const errors = this._field?.errors();
        if (!errors)
            return false;
        const validator = this.validator();
        const spartanInvalid = this._field?.controlState()?.spartanInvalid;
        if (!spartanInvalid)
            return false;
        return validator ? validator in errors : Object.keys(errors).length > 0;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_hasError" }] : /* istanbul ignore next */ []));
    _cleanup = this._a11y
        ? effect(() => {
            const a11y = this._a11y;
            if (!a11y)
                return;
            const id = this.id();
            const hasError = this._hasError();
            if (this._registeredId && (this._registeredId !== id || !hasError)) {
                a11y.unregisterError(this._registeredId);
                this._registeredId = undefined;
            }
            if (hasError && this._registeredId !== id) {
                a11y.registerError(id);
                this._registeredId = id;
            }
        })
        : null;
    constructor() {
        classes(() => 'text-destructive text-sm font-normal');
    }
    ngOnDestroy() {
        this._cleanup?.destroy();
        if (this._registeredId) {
            this._a11y?.unregisterError(this._registeredId);
        }
    }
    static ɵfac = function HlmFieldError_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmFieldError)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HlmFieldError, selectors: [["hlm-field-error"]], hostAttrs: ["role", "alert", "data-slot", "field-error"], hostVars: 2, hostBindings: function HlmFieldError_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵdomProperty("hidden", !ctx._display());
            i0.ɵɵattribute("id", ctx.id());
        } }, inputs: { id: [1, "id"], validator: [1, "validator"], forceShow: [1, "forceShow"] }, ngContentSelectors: _c0, decls: 1, vars: 1, template: function HlmFieldError_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵconditionalCreate(0, HlmFieldError_Conditional_0_Template, 1, 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx._display() ? 0 : -1);
        } }, encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmFieldError, [{
        type: Component,
        args: [{
                selector: 'hlm-field-error',
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: {
                    role: 'alert',
                    'data-slot': 'field-error',
                    '[attr.id]': 'id()',
                    '[hidden]': '!_display()',
                },
                template: `
    @if (_display()) {
      <ng-content />
    }
  `,
            }]
    }], () => [], { id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: false }] }], validator: [{ type: i0.Input, args: [{ isSignal: true, alias: "validator", required: false }] }], forceShow: [{ type: i0.Input, args: [{ isSignal: true, alias: "forceShow", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HlmFieldError, { className: "HlmFieldError", filePath: "libs/ui/field/src/lib/hlm-field-error.ts", lineNumber: 31 }); })();
