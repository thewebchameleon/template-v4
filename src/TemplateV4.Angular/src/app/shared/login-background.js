import { DOCUMENT } from '@angular/common';
import { Component, NgZone, computed, effect, inject, input, signal, viewChild, } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Translate } from '../core/i18n';
import { loginBackground, recolorBackground } from '../core/login-backgrounds';
import { PlatformAppearanceTheme } from '../core/platform-appearance';
import { GradientQuality } from './gradient-quality';
import * as i0 from "@angular/core";
import * as i1 from "@spartan-ng/helm/button";
const _c0 = ["surface"];
function LoginBackgroundArtwork_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "button", 3);
    i0.ɵɵlistener("click", function LoginBackgroundArtwork_Conditional_2_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.paused.set(!ctx_r1.paused())); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "t");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-pressed", ctx_r1.paused());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, ctx_r1.paused() ? "resumeBackground" : "pauseBackground"), " ");
} }
export class LoginBackgroundArtwork {
    value = input('blue-sky', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    thumbnail = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "thumbnail" }] : /* istanbul ignore next */ []));
    paused = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paused" }] : /* istanbul ignore next */ []));
    appearance = inject(PlatformAppearanceTheme);
    preset = computed(() => recolorBackground(loginBackground(this.value()), this.appearance.primaryColor()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "preset" }] : /* istanbul ignore next */ []));
    fallback = computed(() => `linear-gradient(180deg, ${this.preset().stops.join(', ')})`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fallback" }] : /* istanbul ignore next */ []));
    canvas = viewChild('surface', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canvas" }] : /* istanbul ignore next */ []));
    document = inject(DOCUMENT);
    zone = inject(NgZone);
    clock = 20.75;
    clockPreset = '';
    constructor() {
        effect((onCleanup) => {
            const canvas = this.canvas()?.nativeElement;
            const preset = this.preset();
            const thumbnail = this.thumbnail();
            const still = thumbnail || this.paused();
            if (!canvas)
                return;
            if (this.clockPreset !== preset.id) {
                this.clockPreset = preset.id;
                this.clock = 20.75;
            }
            let disposed = false;
            let teardown;
            onCleanup(() => {
                disposed = true;
                teardown?.();
            });
            this.zone.runOutsideAngular(() => {
                void import('./gradient-renderer')
                    .then(({ GradientRenderer }) => {
                    if (disposed)
                        return;
                    let renderer;
                    try {
                        renderer = new GradientRenderer(canvas);
                    }
                    catch {
                        canvas.dataset['renderer'] = 'fallback';
                        return;
                    }
                    const root = this.document.documentElement;
                    const motion = matchMedia('(prefers-reduced-motion: reduce)');
                    let visible = false;
                    let frame = 0;
                    let last = 0;
                    let time = this.clock; // Preserve the current frame across pause/resume.
                    let width = 0;
                    let height = 0;
                    const quality = new GradientQuality(preset.type, thumbnail);
                    let lost = false;
                    const render = () => {
                        if (!visible || this.document.hidden || !width || !height || lost)
                            return;
                        try {
                            const [renderWidth, renderHeight] = quality.dimensions(width, height, devicePixelRatio);
                            const started = performance.now();
                            renderer.render(preset, time, renderWidth, renderHeight);
                            quality.record(performance.now() - started);
                            canvas.dataset['renderer'] = 'canvas';
                        }
                        catch {
                            lost = true;
                            canvas.style.visibility = 'hidden';
                            canvas.dataset['renderer'] = 'fallback';
                            canvas.dataset['animating'] = 'false';
                        }
                    };
                    const animate = (now) => {
                        if (last && now - last < 1000 / 30) {
                            frame = requestAnimationFrame(animate);
                            return;
                        }
                        if (last)
                            time += (preset.speed / 100) * 1.2 * Math.min(0.1, (now - last) / 1000);
                        last = now;
                        this.clock = time;
                        render();
                        if (!lost)
                            frame = requestAnimationFrame(animate);
                    };
                    const sync = () => {
                        cancelAnimationFrame(frame);
                        frame = 0;
                        last = 0;
                        const running = !lost &&
                            visible &&
                            width > 0 &&
                            height > 0 &&
                            !still &&
                            preset.speed > 0 &&
                            !motion.matches &&
                            root.dataset['motion'] !== 'reduced' &&
                            !this.document.hidden;
                        canvas.dataset['animating'] = String(running);
                        render();
                        if (running && !lost)
                            frame = requestAnimationFrame(animate);
                    };
                    const resize = new ResizeObserver(([entry]) => {
                        const rect = entry.contentRect;
                        width = rect.width;
                        height = rect.height;
                        sync();
                    });
                    const intersection = new IntersectionObserver(([entry]) => {
                        visible = entry.isIntersecting;
                        sync();
                    });
                    const preferences = new MutationObserver(sync);
                    const contextLost = (event) => {
                        event.preventDefault();
                        lost = true;
                        canvas.style.visibility = 'hidden';
                        sync();
                    };
                    const contextRestored = () => {
                        renderer.destroy();
                        try {
                            renderer = new GradientRenderer(canvas);
                            lost = false;
                            canvas.style.visibility = '';
                            sync();
                        }
                        catch {
                            canvas.dataset['renderer'] = 'fallback';
                        }
                    };
                    canvas.style.visibility = '';
                    resize.observe(canvas);
                    intersection.observe(canvas);
                    preferences.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
                    motion.addEventListener('change', sync);
                    this.document.addEventListener('visibilitychange', sync);
                    canvas.addEventListener('contextlost', contextLost);
                    canvas.addEventListener('contextrestored', contextRestored);
                    teardown = () => {
                        resize.disconnect();
                        intersection.disconnect();
                        preferences.disconnect();
                        motion.removeEventListener('change', sync);
                        this.document.removeEventListener('visibilitychange', sync);
                        canvas.removeEventListener('contextlost', contextLost);
                        canvas.removeEventListener('contextrestored', contextRestored);
                        cancelAnimationFrame(frame);
                        renderer.destroy();
                    };
                })
                    .catch(() => {
                    if (!disposed)
                        canvas.dataset['renderer'] = 'fallback';
                });
            });
        });
    }
    static ɵfac = function LoginBackgroundArtwork_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LoginBackgroundArtwork)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LoginBackgroundArtwork, selectors: [["app-login-background"]], viewQuery: function LoginBackgroundArtwork_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.canvas, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostVars: 3, hostBindings: function LoginBackgroundArtwork_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-preset", ctx.preset().id);
            i0.ɵɵstyleProp("background", ctx.fallback());
        } }, inputs: { value: [1, "value"], thumbnail: [1, "thumbnail"] }, decls: 3, vars: 1, consts: [["surface", ""], ["aria-hidden", "true"], [1, "motion-control"], ["hlmBtn", "", "variant", "outline", "size", "sm", "type", "button", 3, "click"]], template: function LoginBackgroundArtwork_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "canvas", 1, 0);
            i0.ɵɵconditionalCreate(2, LoginBackgroundArtwork_Conditional_2_Template, 4, 4, "div", 2);
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.thumbnail() && ctx.preset().speed > 0 ? 2 : -1);
        } }, dependencies: [i1.HlmButton, Translate], styles: ["[_nghost-%COMP%] {\n      display: block;\n      position: relative;\n      overflow: hidden;\n      width: 100%;\n      height: 100%;\n    }\n    canvas[_ngcontent-%COMP%] {\n      display: block;\n      width: 100%;\n      height: 100%;\n    }\n    .motion-control[_ngcontent-%COMP%] {\n      position: absolute;\n      right: 1rem;\n      bottom: 1rem;\n      background: var(--%NS%background);\n      border-radius: var(--%NS%radius);\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LoginBackgroundArtwork, [{
        type: Component,
        args: [{ selector: 'app-login-background', imports: [HlmButtonImports, Translate], host: {
                    '[style.background]': 'fallback()',
                    '[attr.data-preset]': 'preset().id',
                }, template: `
    <canvas #surface aria-hidden="true"></canvas>
    @if (!thumbnail() && preset().speed > 0) {
      <div class="motion-control">
        <button
          hlmBtn
          variant="outline"
          size="sm"
          type="button"
          [attr.aria-pressed]="paused()"
          (click)="paused.set(!paused())"
        >
          {{ (paused() ? 'resumeBackground' : 'pauseBackground') | t }}
        </button>
      </div>
    }
  `, styles: ["\n    :host {\n      display: block;\n      position: relative;\n      overflow: hidden;\n      width: 100%;\n      height: 100%;\n    }\n    canvas {\n      display: block;\n      width: 100%;\n      height: 100%;\n    }\n    .motion-control {\n      position: absolute;\n      right: 1rem;\n      bottom: 1rem;\n      background: var(--background);\n      border-radius: var(--radius);\n    }\n  "] }]
    }], () => [], { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], thumbnail: [{ type: i0.Input, args: [{ isSignal: true, alias: "thumbnail", required: false }] }], canvas: [{ type: i0.ViewChild, args: ['surface', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LoginBackgroundArtwork, { className: "LoginBackgroundArtwork", filePath: "src/app/shared/login-background.ts", lineNumber: 66 }); })();
