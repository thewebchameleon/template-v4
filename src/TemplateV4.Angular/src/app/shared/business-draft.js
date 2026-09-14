import { Directive, HostListener } from '@angular/core';
import { protectUnload } from './confirmation';
import * as i0 from "@angular/core";
export class BusinessDraft {
    savedDraft = '';
    markSaved() {
        this.savedDraft = JSON.stringify(this.draftValue());
    }
    hasUnsavedChanges() {
        return this.savedDraft !== '' && this.savedDraft !== JSON.stringify(this.draftValue());
    }
    beforeUnload(event) {
        protectUnload(event, this.hasUnsavedChanges());
    }
    static ɵfac = function BusinessDraft_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BusinessDraft)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: BusinessDraft, hostBindings: function BusinessDraft_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("beforeunload", function BusinessDraft_beforeunload_HostBindingHandler($event) { return ctx.beforeUnload($event); }, i0.ɵɵresolveWindow);
        } } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BusinessDraft, [{
        type: Directive
    }], null, { beforeUnload: [{
            type: HostListener,
            args: ['window:beforeunload', ['$event']]
        }] }); })();
