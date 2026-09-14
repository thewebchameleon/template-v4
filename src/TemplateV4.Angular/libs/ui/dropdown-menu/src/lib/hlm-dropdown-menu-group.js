import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/menu";
export class HlmDropdownMenuGroup {
    constructor() {
        classes(() => 'block');
    }
    static ɵfac = function HlmDropdownMenuGroup_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmDropdownMenuGroup)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmDropdownMenuGroup, selectors: [["", "hlmDropdownMenuGroup", ""], ["hlm-dropdown-menu-group"]], hostAttrs: ["data-slot", "dropdown-menu-group"], features: [i0.ɵɵHostDirectivesFeature([i1.CdkMenuGroup])] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmDropdownMenuGroup, [{
        type: Directive,
        args: [{
                selector: '[hlmDropdownMenuGroup],hlm-dropdown-menu-group',
                hostDirectives: [CdkMenuGroup],
                host: { 'data-slot': 'dropdown-menu-group' },
            }]
    }], () => [], null); })();
