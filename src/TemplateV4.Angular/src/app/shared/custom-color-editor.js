import { Component, computed, input, output, signal } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmSliderImports } from '@spartan-ng/helm/slider';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { NgScrollbar } from 'ngx-scrollbar';
import { WorkspaceUi } from './workspace';
import { DEFAULT_PRIMARY_COLOR, validPrimaryColor } from '../core/brand-palette';
import { hexToHsv, hsvToHex } from '../core/color-picker';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@ng-icons/core";
import * as i3 from "@spartan-ng/helm/button";
import * as i4 from "@spartan-ng/helm/field";
import * as i5 from "@spartan-ng/helm/input";
import * as i6 from "@spartan-ng/helm/drawer";
import * as i7 from "@spartan-ng/helm/slider";
import * as i8 from "@spartan-ng/helm/scroll-area";
import * as i9 from "../core/i18n";
const _c0 = () => ({ standalone: true });
const _c1 = a0 => [a0];
const _forTrack0 = ($index, $item) => $item.key;
function CustomColorEditor_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 1);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelement(3, "ng-icon", 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const color_r1 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.disabled())("title", i0.ɵɵpipeBind1(1, 3, "editCustomColor") + ": " + color_r1.name);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 5, "editCustomColor") + ": " + color_r1.name);
} }
function CustomColorEditor_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 2);
    i0.ɵɵpipe(1, "t");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.disabled());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "addCustomColor"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 5, "addCustomColor"), " ");
} }
function CustomColorEditor_hlm_drawer_content_3_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "customColorNameInvalid"));
} }
function CustomColorEditor_hlm_drawer_content_3_For_22_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 17)(1, "div", 22)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 23);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "hlm-slider", 24);
    i0.ɵɵlistener("valueChange", function CustomColorEditor_hlm_drawer_content_3_For_22_Template_hlm_slider_valueChange_7_listener($event) { const axis_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setAxis(axis_r5.key, $event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const axis_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.uid + "-" + axis_r5.key);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 9, axis_r5.label));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", ctx_r1.rounded(ctx_r1.hsv()[axis_r5.key]), "", axis_r5.key === "h" ? "\u00B0" : "%", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", i0.ɵɵpureFunction1(11, _c1, ctx_r1.hsv()[axis_r5.key]))("min", 0)("max", axis_r5.max)("step", 1);
    i0.ɵɵariaProperty("aria-labelledby", ctx_r1.uid + "-" + axis_r5.key);
} }
function CustomColorEditor_hlm_drawer_content_3_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "hlm-field-error", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "t");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "primaryColorInvalid"));
} }
function CustomColorEditor_hlm_drawer_content_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "hlm-drawer-content", 5)(1, "hlm-drawer-header")(2, "h2", 6);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 7);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "t");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "ng-scrollbar", 8);
    i0.ɵɵlistener("pointerdown", function CustomColorEditor_hlm_drawer_content_3_Template_ng_scrollbar_pointerdown_8_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(9, "div", 9)(10, "div", 10)(11, "label", 11);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "input", 12);
    i0.ɵɵlistener("ngModelChange", function CustomColorEditor_hlm_drawer_content_3_Template_input_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.name.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(15, "p", 13);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, CustomColorEditor_hlm_drawer_content_3_Conditional_18_Template, 3, 3, "hlm-field-error", 14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div", 15);
    i0.ɵɵlistener("pointerdown", function CustomColorEditor_hlm_drawer_content_3_Template_div_pointerdown_19_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.startDrag($event)); })("pointermove", function CustomColorEditor_hlm_drawer_content_3_Template_div_pointermove_19_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.drag($event)); })("pointerup", function CustomColorEditor_hlm_drawer_content_3_Template_div_pointerup_19_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.endDrag($event)); })("pointercancel", function CustomColorEditor_hlm_drawer_content_3_Template_div_pointercancel_19_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.endDrag($event)); });
    i0.ɵɵelement(20, "span", 16);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(21, CustomColorEditor_hlm_drawer_content_3_For_22_Template, 8, 13, "div", 17, _forTrack0);
    i0.ɵɵelementStart(23, "div", 10)(24, "label", 11);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "div", 18);
    i0.ɵɵelement(28, "span", 19);
    i0.ɵɵelementStart(29, "input", 20);
    i0.ɵɵlistener("ngModelChange", function CustomColorEditor_hlm_drawer_content_3_Template_input_ngModelChange_29_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setHex($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "p", 13);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "t");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(33, CustomColorEditor_hlm_drawer_content_3_Conditional_33_Template, 3, 3, "hlm-field-error", 14);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(34, "hlm-drawer-footer")(35, "button", 21);
    i0.ɵɵlistener("click", function CustomColorEditor_hlm_drawer_content_3_Template_button_click_35_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.apply()); });
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "t");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 32, ctx_r1.item() ? "editCustomColor" : "addCustomColor"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 34, "customPickerHelp"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("for", ctx_r1.uid + "-name");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 36, "customColorName"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.uid + "-name")("ngModel", ctx_r1.name())("ngModelOptions", i0.ɵɵpureFunction0(46, _c0));
    i0.ɵɵattribute("aria-invalid", !ctx_r1.validName())("aria-describedby", ctx_r1.uid + "-name-help");
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.uid + "-name-help");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 38, "customColorNameHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.name() && !ctx_r1.validName() ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("background-color", ctx_r1.hueColor());
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("left", ctx_r1.hsv().s, "%")("top", 100 - ctx_r1.hsv().v, "%");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.axes);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("for", ctx_r1.uid + "-hex");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 40, "customHexColor"));
    i0.ɵɵadvance(3);
    i0.ɵɵstyleProp("background-color", ctx_r1.displayColor());
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.uid + "-hex")("ngModel", ctx_r1.hex())("ngModelOptions", i0.ɵɵpureFunction0(47, _c0));
    i0.ɵɵattribute("aria-invalid", !ctx_r1.validHex())("aria-describedby", ctx_r1.uid + "-hex-help");
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.uid + "-hex-help");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 42, "primaryColorHelp"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.validHex() ? 33 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.validHex() || !ctx_r1.validName() || ctx_r1.disabled());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(37, 44, "useCustomColor"), " ");
} }
export class CustomColorEditor {
    item = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "item" }] : /* istanbul ignore next */ []));
    initialColor = input(DEFAULT_PRIMARY_COLOR, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "initialColor" }] : /* istanbul ignore next */ []));
    usedNames = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usedNames" }] : /* istanbul ignore next */ []));
    disabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    changed = output();
    preview = output();
    uid = 'color-editor-' + crypto.randomUUID();
    state = signal('closed', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    name = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    hex = signal(DEFAULT_PRIMARY_COLOR, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hex" }] : /* istanbul ignore next */ []));
    hsv = signal(hexToHsv(DEFAULT_PRIMARY_COLOR), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hsv" }] : /* istanbul ignore next */ []));
    validHex = computed(() => validPrimaryColor(this.hex()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "validHex" }] : /* istanbul ignore next */ []));
    validName = computed(() => {
        const name = this.name().trim();
        return (name.length > 0 &&
            name.length <= 40 &&
            !Array.from(name).some((character) => {
                const code = character.charCodeAt(0);
                return code < 32 || (code >= 127 && code <= 159);
            }) &&
            !this.usedNames().some((used) => used.toLowerCase() === name.toLowerCase()));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "validName" }] : /* istanbul ignore next */ []));
    displayColor = computed(() => hsvToHex(this.hsv()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "displayColor" }] : /* istanbul ignore next */ []));
    hueColor = computed(() => hsvToHex({ h: this.hsv().h, s: 100, v: 100 }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hueColor" }] : /* istanbul ignore next */ []));
    axes = [
        { key: 'h', label: 'colorHue', max: 360 },
        { key: 's', label: 'colorSaturation', max: 100 },
        { key: 'v', label: 'colorBrightness', max: 100 },
    ];
    rounded = Math.round;
    stateChanged(state) {
        this.state.set(state);
        if (state === 'open') {
            this.name.set(this.item()?.name ?? '');
            this.setHex(this.item()?.color ?? this.initialColor());
        }
        else
            this.preview.emit(null);
    }
    setHex(value) {
        this.hex.set(value);
        if (validPrimaryColor(value)) {
            const next = hexToHsv(value);
            // Hue remains useful when moving away from a gray or black color.
            if (!next.s)
                next.h = this.hsv().h;
            this.hsv.set(next);
            this.preview.emit(value.toUpperCase());
        }
    }
    setAxis(axis, values) {
        if (values[0] === undefined)
            return;
        this.update({ ...this.hsv(), [axis]: values[0] });
    }
    update(value) {
        this.hsv.set(value);
        this.hex.set(hsvToHex(value));
        this.preview.emit(this.hex());
    }
    startDrag(event) {
        if (event.button !== 0)
            return;
        const target = event.currentTarget;
        target.setPointerCapture(event.pointerId);
        this.drag(event);
    }
    drag(event) {
        const target = event.currentTarget;
        if (!target.hasPointerCapture(event.pointerId))
            return;
        const box = target.getBoundingClientRect();
        if (!box.width || !box.height)
            return;
        this.update({
            h: this.hsv().h,
            s: Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100)),
            v: Math.max(0, Math.min(100, 100 - ((event.clientY - box.top) / box.height) * 100)),
        });
    }
    endDrag(event) {
        const target = event.currentTarget;
        if (target.hasPointerCapture(event.pointerId))
            target.releasePointerCapture(event.pointerId);
    }
    apply() {
        if (!this.validName() || !this.validHex() || this.disabled())
            return;
        this.changed.emit({ name: this.name().trim(), color: this.hex().toUpperCase() });
        this.close();
    }
    close() {
        this.state.set('closed');
        this.preview.emit(null);
    }
    static ɵfac = function CustomColorEditor_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CustomColorEditor)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CustomColorEditor, selectors: [["app-custom-color-editor"]], inputs: { item: [1, "item"], initialColor: [1, "initialColor"], usedNames: [1, "usedNames"], disabled: [1, "disabled"] }, outputs: { changed: "changed", preview: "preview" }, decls: 4, vars: 2, consts: [["direction", "right", 3, "stateChanged", "state"], ["hlmBtn", "", "variant", "outline", "size", "icon-sm", "type", "button", "hlmDrawerTrigger", "", 3, "disabled", "title"], ["hlmBtn", "", "variant", "outline", "type", "button", "hlmDrawerTrigger", "", 3, "disabled"], ["class", "overflow-hidden sm:max-w-md", 4, "hlmDrawerPortal"], ["name", "lucidePencil", "aria-hidden", "true"], [1, "overflow-hidden", "sm:max-w-md"], ["hlmDrawerTitle", ""], ["hlmDrawerDescription", ""], ["hlm", "", "hlmDrawerBody", "", "orientation", "vertical", 1, "min-h-0", "flex-1", "[--drawer-body-padding-block-end:--spacing(1)]", 3, "pointerdown"], [1, "flex", "flex-col", "gap-6"], ["hlmField", ""], ["hlmFieldLabel", "", 3, "for"], ["hlmInput", "", "maxlength", "40", "autocomplete", "off", 3, "ngModelChange", "id", "ngModel", "ngModelOptions"], ["hlmFieldDescription", "", 3, "id"], ["forceShow", ""], ["aria-hidden", "true", 1, "color-plane", 3, "pointerdown", "pointermove", "pointerup", "pointercancel"], [1, "color-point"], [1, "grid", "gap-2", "rounded-lg", "border", "border-border/70", "bg-muted/30", "px-3", "py-3"], [1, "flex", "items-center", "gap-2"], ["aria-hidden", "true", 1, "size-8", "shrink-0", "rounded-md", "border", "border-border"], ["hlmInput", "", "maxlength", "7", "spellcheck", "false", "autocomplete", "off", 3, "ngModelChange", "id", "ngModel", "ngModelOptions"], ["hlmBtn", "", "type", "button", 3, "click", "disabled"], [1, "flex", "items-center", "justify-between", "gap-3", "text-sm", "font-medium", "leading-none", 3, "id"], ["aria-hidden", "true", 1, "text-muted-foreground", "tabular-nums"], [1, "py-1.5", 3, "valueChange", "value", "min", "max", "step", "aria-labelledby"]], template: function CustomColorEditor_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "hlm-drawer", 0);
            i0.ɵɵlistener("stateChanged", function CustomColorEditor_Template_hlm_drawer_stateChanged_0_listener($event) { return ctx.stateChanged($event); });
            i0.ɵɵconditionalCreate(1, CustomColorEditor_Conditional_1_Template, 4, 7, "button", 1)(2, CustomColorEditor_Conditional_2_Template, 4, 7, "button", 2);
            i0.ɵɵtemplate(3, CustomColorEditor_hlm_drawer_content_3_Template, 38, 48, "hlm-drawer-content", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵproperty("state", ctx.state());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_1_0 = ctx.item()) ? 1 : 2, tmp_1_0);
        } }, dependencies: [i1.FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.MaxLengthValidator, i1.NgModel, i2.NgIcon, i3.HlmButton, i4.HlmField, i4.HlmFieldDescription, i4.HlmFieldError, i4.HlmFieldLabel, i5.HlmInput, i6.HlmDrawer, i6.HlmDrawerBody, i6.HlmDrawerContent, i6.HlmDrawerDescription, i6.HlmDrawerFooter, i6.HlmDrawerHeader, i6.HlmDrawerPortal, i6.HlmDrawerTitle, i6.HlmDrawerTrigger, i7.HlmSlider, i8.HlmScrollArea, NgScrollbar, i9.Translate], styles: [".color-plane[_ngcontent-%COMP%] {\n      position: relative;\n      height: 8rem;\n      border-radius: var(--%NS%radius);\n      touch-action: none;\n      cursor: crosshair;\n      background-image:\n        linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent);\n    }\n    .color-point[_ngcontent-%COMP%] {\n      position: absolute;\n      width: 0.75rem;\n      height: 0.75rem;\n      border: 2px solid #fff;\n      border-radius: 50%;\n      box-shadow: 0 0 0 1px #000;\n      transform: translate(-50%, -50%);\n      pointer-events: none;\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CustomColorEditor, [{
        type: Component,
        args: [{ selector: 'app-custom-color-editor', imports: [WorkspaceUi, HlmDrawerImports, HlmSliderImports, HlmScrollAreaImports, NgScrollbar], template: ` <hlm-drawer direction="right" [state]="state()" (stateChanged)="stateChanged($event)">
    @if (item(); as color) {
      <button
        hlmBtn
        variant="outline"
        size="icon-sm"
        type="button"
        hlmDrawerTrigger
        [disabled]="disabled()"
        [attr.aria-label]="('editCustomColor' | t) + ': ' + color.name"
        [title]="('editCustomColor' | t) + ': ' + color.name"
      >
        <ng-icon name="lucidePencil" aria-hidden="true" />
      </button>
    } @else {
      <button
        hlmBtn
        variant="outline"
        type="button"
        hlmDrawerTrigger
        [disabled]="disabled()"
        [attr.aria-label]="'addCustomColor' | t"
      >
        {{ 'addCustomColor' | t }}
      </button>
    }
    <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
      <hlm-drawer-header>
        <h2 hlmDrawerTitle>{{ (item() ? 'editCustomColor' : 'addCustomColor') | t }}</h2>
        <p hlmDrawerDescription>{{ 'customPickerHelp' | t }}</p>
      </hlm-drawer-header>
      <ng-scrollbar
        hlm
        hlmDrawerBody
        orientation="vertical"
        class="min-h-0 flex-1 [--drawer-body-padding-block-end:--spacing(1)]"
        (pointerdown)="$event.stopPropagation()"
      >
        <div class="flex flex-col gap-6">
          <div hlmField>
            <label hlmFieldLabel [for]="uid + '-name'">{{ 'customColorName' | t }}</label>
            <input
              hlmInput
              [id]="uid + '-name'"
              [ngModel]="name()"
              (ngModelChange)="name.set($event)"
              [ngModelOptions]="{ standalone: true }"
              maxlength="40"
              autocomplete="off"
              [attr.aria-invalid]="!validName()"
              [attr.aria-describedby]="uid + '-name-help'"
            />
            <p hlmFieldDescription [id]="uid + '-name-help'">{{ 'customColorNameHelp' | t }}</p>
            @if (name() && !validName()) {
              <hlm-field-error forceShow>{{ 'customColorNameInvalid' | t }}</hlm-field-error>
            }
          </div>
          <div
            class="color-plane"
            [style.background-color]="hueColor()"
            aria-hidden="true"
            (pointerdown)="startDrag($event)"
            (pointermove)="drag($event)"
            (pointerup)="endDrag($event)"
            (pointercancel)="endDrag($event)"
          >
            <span class="color-point" [style.left.%]="hsv().s" [style.top.%]="100 - hsv().v"></span>
          </div>
          @for (axis of axes; track axis.key) {
            <div class="grid gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-3">
              <div
                class="flex items-center justify-between gap-3 text-sm font-medium leading-none"
                [id]="uid + '-' + axis.key"
              >
                <span>{{ axis.label | t }}</span>
                <span class="text-muted-foreground tabular-nums" aria-hidden="true">
                  {{ rounded(hsv()[axis.key]) }}{{ axis.key === 'h' ? '°' : '%' }}
                </span>
              </div>
              <hlm-slider
                class="py-1.5"
                [value]="[hsv()[axis.key]]"
                [min]="0"
                [max]="axis.max"
                [step]="1"
                [aria-labelledby]="uid + '-' + axis.key"
                (valueChange)="setAxis(axis.key, $event)"
              />
            </div>
          }
          <div hlmField>
            <label hlmFieldLabel [for]="uid + '-hex'">{{ 'customHexColor' | t }}</label>
            <div class="flex items-center gap-2">
              <span
                class="size-8 shrink-0 rounded-md border border-border"
                [style.background-color]="displayColor()"
                aria-hidden="true"
              ></span>
              <input
                hlmInput
                [id]="uid + '-hex'"
                [ngModel]="hex()"
                (ngModelChange)="setHex($event)"
                [ngModelOptions]="{ standalone: true }"
                maxlength="7"
                spellcheck="false"
                autocomplete="off"
                [attr.aria-invalid]="!validHex()"
                [attr.aria-describedby]="uid + '-hex-help'"
              />
            </div>
            <p hlmFieldDescription [id]="uid + '-hex-help'">{{ 'primaryColorHelp' | t }}</p>
            @if (!validHex()) {
              <hlm-field-error forceShow>{{ 'primaryColorInvalid' | t }}</hlm-field-error>
            }
          </div>
        </div>
      </ng-scrollbar>
      <hlm-drawer-footer>
        <button
          hlmBtn
          type="button"
          [disabled]="!validHex() || !validName() || disabled()"
          (click)="apply()"
        >
          {{ 'useCustomColor' | t }}
        </button>
      </hlm-drawer-footer>
    </hlm-drawer-content>
  </hlm-drawer>`, styles: ["\n    .color-plane {\n      position: relative;\n      height: 8rem;\n      border-radius: var(--radius);\n      touch-action: none;\n      cursor: crosshair;\n      background-image:\n        linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent);\n    }\n    .color-point {\n      position: absolute;\n      width: 0.75rem;\n      height: 0.75rem;\n      border: 2px solid #fff;\n      border-radius: 50%;\n      box-shadow: 0 0 0 1px #000;\n      transform: translate(-50%, -50%);\n      pointer-events: none;\n    }\n  "] }]
    }], null, { item: [{ type: i0.Input, args: [{ isSignal: true, alias: "item", required: false }] }], initialColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "initialColor", required: false }] }], usedNames: [{ type: i0.Input, args: [{ isSignal: true, alias: "usedNames", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], changed: [{ type: i0.Output, args: ["changed"] }], preview: [{ type: i0.Output, args: ["preview"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CustomColorEditor, { className: "CustomColorEditor", filePath: "src/app/shared/custom-color-editor.ts", lineNumber: 166 }); })();
