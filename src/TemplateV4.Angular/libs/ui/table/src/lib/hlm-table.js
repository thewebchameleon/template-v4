import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import * as i0 from "@angular/core";
export class HlmTableContainer {
    constructor() {
        classes(() => 'relative w-full overflow-x-auto');
    }
    static ɵfac = function HlmTableContainer_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTableContainer)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTableContainer, selectors: [["div", "hlmTableContainer", ""]], hostAttrs: ["data-slot", "table-container"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTableContainer, [{
        type: Directive,
        args: [{
                selector: 'div[hlmTableContainer]',
                host: { 'data-slot': 'table-container' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <table> element.
 */
export class HlmTable {
    constructor() {
        classes(() => 'w-full caption-bottom text-sm');
    }
    static ɵfac = function HlmTable_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTable)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTable, selectors: [["table", "hlmTable", ""]], hostAttrs: ["data-slot", "table"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTable, [{
        type: Directive,
        args: [{
                selector: 'table[hlmTable]',
                host: { 'data-slot': 'table' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <thead> element
 * within an HlmTable context.
 */
export class HlmTHead {
    constructor() {
        classes(() => 'bg-(--table-header) [&_tr]:border-b');
    }
    static ɵfac = function HlmTHead_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTHead)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTHead, selectors: [["thead", "hlmTHead", ""], ["thead", "hlmTableHeader", ""]], hostAttrs: ["data-slot", "table-header"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTHead, [{
        type: Directive,
        args: [{
                selector: 'thead[hlmTHead],thead[hlmTableHeader]',
                host: { 'data-slot': 'table-header' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <tbody> element
 * within an HlmTable context.
 */
export class HlmTBody {
    constructor() {
        classes(() => '[&_tr:last-child]:border-0');
    }
    static ɵfac = function HlmTBody_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTBody)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTBody, selectors: [["tbody", "hlmTBody", ""], ["tbody", "hlmTableBody", ""]], hostAttrs: ["data-slot", "table-body"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTBody, [{
        type: Directive,
        args: [{
                selector: 'tbody[hlmTBody],tbody[hlmTableBody]',
                host: { 'data-slot': 'table-body' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <tfoot> element
 * within an HlmTable context.
 */
export class HlmTFoot {
    constructor() {
        classes(() => 'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0');
    }
    static ɵfac = function HlmTFoot_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTFoot)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTFoot, selectors: [["tfoot", "hlmTFoot", ""], ["tfoot", "hlmTableFooter", ""]], hostAttrs: ["data-slot", "table-footer"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTFoot, [{
        type: Directive,
        args: [{
                selector: 'tfoot[hlmTFoot],tfoot[hlmTableFooter]',
                host: { 'data-slot': 'table-footer' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <tr> element
 * within an HlmTable context.
 */
export class HlmTr {
    constructor() {
        classes(() => 'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors has-aria-expanded:bg-muted/50');
    }
    static ɵfac = function HlmTr_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTr)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTr, selectors: [["tr", "hlmTr", ""], ["tr", "hlmTableRow", ""]], hostAttrs: ["data-slot", "table-row"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTr, [{
        type: Directive,
        args: [{
                selector: 'tr[hlmTr],tr[hlmTableRow]',
                host: { 'data-slot': 'table-row' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <th> element
 * within an HlmTable context.
 */
export class HlmTh {
    constructor() {
        classes(() => 'text-foreground h-10 px-2 text-start align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pe-0');
    }
    static ɵfac = function HlmTh_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTh)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTh, selectors: [["th", "hlmTh", ""], ["th", "hlmTableHead", ""]], hostAttrs: ["data-slot", "table-head"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTh, [{
        type: Directive,
        args: [{
                selector: 'th[hlmTh],th[hlmTableHead]',
                host: { 'data-slot': 'table-head' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <td> element
 * within an HlmTable context.
 */
export class HlmTd {
    constructor() {
        classes(() => 'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0');
    }
    static ɵfac = function HlmTd_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmTd)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmTd, selectors: [["td", "hlmTd", ""], ["td", "hlmTableCell", ""]], hostAttrs: ["data-slot", "table-cell"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmTd, [{
        type: Directive,
        args: [{
                selector: 'td[hlmTd],td[hlmTableCell]',
                host: { 'data-slot': 'table-cell' },
            }]
    }], () => [], null); })();
/**
 * Directive to apply Shadcn-like styling to a <caption> element
 * within an HlmTable context.
 */
export class HlmCaption {
    constructor() {
        classes(() => 'text-muted-foreground mt-4 text-sm');
    }
    static ɵfac = function HlmCaption_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HlmCaption)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HlmCaption, selectors: [["caption", "hlmCaption", ""], ["caption", "hlmTableCaption", ""]], hostAttrs: ["data-slot", "table-caption"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HlmCaption, [{
        type: Directive,
        args: [{
                selector: 'caption[hlmCaption],caption[hlmTableCaption]',
                host: { 'data-slot': 'table-caption' },
            }]
    }], () => [], null); })();
