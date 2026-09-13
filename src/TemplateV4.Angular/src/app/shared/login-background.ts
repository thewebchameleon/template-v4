import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  NgZone,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Translate } from '../core/i18n';
import { loginBackground, recolorBackground } from '../core/login-backgrounds';
import { PlatformAppearanceTheme } from '../core/platform-appearance';
import type { GradientRenderer } from './gradient-renderer';
import { GradientQuality } from './gradient-quality';

@Component({
  selector: 'app-login-background',
  imports: [HlmButtonImports, Translate],
  host: {
    '[style.background]': 'fallback()',
    '[attr.data-preset]': 'preset().id',
  },
  styles: `
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .motion-control {
      position: absolute;
      right: 1rem;
      bottom: 1rem;
      background: var(--background);
      border-radius: var(--radius);
    }
  `,
  template: `
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
  `,
})
export class LoginBackgroundArtwork {
  readonly value = input<string>('blue-sky');
  readonly thumbnail = input(false);
  readonly paused = signal(false);
  private readonly appearance = inject(PlatformAppearanceTheme);
  readonly preset = computed(() =>
    recolorBackground(loginBackground(this.value()), this.appearance.primaryColor()),
  );
  readonly fallback = computed(() => `linear-gradient(180deg, ${this.preset().stops.join(', ')})`);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('surface');
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private clock = 20.75;
  private clockPreset = '';

  constructor() {
    effect((onCleanup) => {
      const canvas = this.canvas()?.nativeElement;
      const preset = this.preset();
      const thumbnail = this.thumbnail();
      const still = thumbnail || this.paused();
      if (!canvas) return;
      if (this.clockPreset !== preset.id) {
        this.clockPreset = preset.id;
        this.clock = 20.75;
      }
      let disposed = false;
      let teardown: (() => void) | undefined;
      onCleanup(() => {
        disposed = true;
        teardown?.();
      });
      this.zone.runOutsideAngular(() => {
        void import('./gradient-renderer')
          .then(({ GradientRenderer }) => {
            if (disposed) return;
            let renderer: GradientRenderer;
            try {
              renderer = new GradientRenderer(canvas);
            } catch {
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
              if (!visible || this.document.hidden || !width || !height || lost) return;
              try {
                const [renderWidth, renderHeight] = quality.dimensions(
                  width,
                  height,
                  devicePixelRatio,
                );
                const started = performance.now();
                renderer.render(preset, time, renderWidth, renderHeight);
                quality.record(performance.now() - started);
                canvas.dataset['renderer'] = 'canvas';
              } catch {
                lost = true;
                canvas.style.visibility = 'hidden';
                canvas.dataset['renderer'] = 'fallback';
                canvas.dataset['animating'] = 'false';
              }
            };
            const animate = (now: number) => {
              if (last && now - last < 1000 / 30) {
                frame = requestAnimationFrame(animate);
                return;
              }
              if (last) time += (preset.speed / 100) * 1.2 * Math.min(0.1, (now - last) / 1000);
              last = now;
              this.clock = time;
              render();
              if (!lost) frame = requestAnimationFrame(animate);
            };
            const sync = () => {
              cancelAnimationFrame(frame);
              frame = 0;
              last = 0;
              const running =
                !lost &&
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
              if (running && !lost) frame = requestAnimationFrame(animate);
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
            const contextLost = (event: Event) => {
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
              } catch {
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
            if (!disposed) canvas.dataset['renderer'] = 'fallback';
          });
      });
    });
  }
}
