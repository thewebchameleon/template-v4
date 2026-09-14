import { InputModalityDetector } from '@angular/cdk/a11y';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Directive, inject } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @internal
 * Moves DOM focus to the hovered menu item. CDK menus only move focus with the keyboard, so on a pointer
 * the highlight would otherwise stay on the last keyboard-focused item (leaving two rows highlighted) and,
 * when a submenu closes, focus would fall to <body>, the menu stack would report no focus, and the whole
 * dropdown would collapse. Following the pointer with focus (Radix/shadcn behaviour) keeps a single
 * highlight and keeps focus inside the menu stack. setActiveMenuItem also syncs the key manager so keyboard
 * navigation continues from the hovered item.
 *
 * Applied as a host directive on every dropdown item type (item, checkbox, radio, sub-trigger).
 */
export class HlmDropdownMenuFocusOnHover {
    _cdkMenuItem = inject(CdkMenuItem, { self: true });
    _parentMenu = inject(CdkMenu, { optional: true });
    _inputModality = inject(InputModalityDetector);
    _focusOnHover() {
        // Only skip synthetic hovers from touch taps; every real hover (mouse, or keyboard-then-hover,
        // which leaves the modality as 'keyboard') should move focus to keep a single highlight.
        if (this._inputModality.mostRecentModality === 'touch' || this._cdkMenuItem.disabled) {
            return;
        }
        this._parentMenu?.setActiveMenuItem(this._cdkMenuItem);
    }
    static ɵfac = function HlmDropdownMenuFocusOnHover_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuFocusOnHover)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuFocusOnHover, selectors: [["", "hlmDropdownMenuFocusOnHover", ""]], hostBindings: function HlmDropdownMenuFocusOnHover_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("mouseenter", function HlmDropdownMenuFocusOnHover_mouseenter_HostBindingHandler() { return ctx._focusOnHover(); });
        } } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuFocusOnHover, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuFocusOnHover]',
                host: {
                    '(mouseenter)': '_focusOnHover()',
                },
            }]
    }], null, null); })();
