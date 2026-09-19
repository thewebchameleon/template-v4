import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../../core/auth';
import { WorkspaceUi } from '../../shared/workspace';
@Component({
  selector: 'app-unavailable',
  imports: [WorkspaceUi],
  template: ` @if (forbidden) {
      <app-page-header title="accessRestricted" description="accessRestrictedHelp" /><a
        hlmBtn
        [routerLink]="auth.access() ? auth.landing() : '/login'"
        >{{ (auth.access() ? 'backToWorkspace' : 'signIn') | t }}</a
      >
    } @else {
      <section class="not-found" aria-labelledby="not-found-title">
        <div class="not-found-panel">
          <p class="not-found-code" data-text="404" aria-hidden="true">404</p>
          <div class="not-found-copy">
            <p class="workspace-eyebrow">{{ 'lostYourWay' | t }}</p>
            <h1 id="not-found-title" class="page-title">{{ 'pageNotFound' | t }}</h1>
            <p class="workspace-description">{{ 'pageNotFoundHelp' | t }}</p>
          </div>
          <nav class="not-found-actions" [attr.aria-label]="'pageNotFoundActions' | t">
            <a hlmBtn [routerLink]="auth.access() ? auth.landing() : '/'">{{ 'backToHome' | t }}</a>
            <a hlmBtn variant="outline" routerLink="/login">{{ 'signIn' | t }}</a>
          </nav>
        </div>
      </section>
    }`,
  styles: `
    .not-found {
      min-height: min(40rem, calc(100svh - 12rem));
      display: grid;
      place-items: center;
      padding-block: 3rem;
    }

    .not-found-panel {
      width: min(100%, 44rem);
      display: grid;
      justify-items: center;
      gap: 2rem;
      padding: clamp(2rem, 7vw, 5rem);
      overflow: hidden;
      text-align: center;
      background: var(--card);
      color: var(--card-foreground);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
    }

    .not-found-code {
      position: relative;
      margin: 0;
      color: var(--foreground);
      font-family: var(--font-heading);
      font-size: clamp(6rem, 25vw, 13rem);
      font-weight: 700;
      line-height: 0.72;
      letter-spacing: -0.1em;
      font-variant-numeric: tabular-nums;
      isolation: isolate;
    }

    .not-found-code::before,
    .not-found-code::after {
      position: absolute;
      inset: 0;
      content: attr(data-text);
      pointer-events: none;
      opacity: 0.72;
    }

    .not-found-code::before {
      color: var(--primary);
      animation: chromatic-shift-start 2.8s steps(1, end) infinite;
    }

    .not-found-code::after {
      color: var(--destructive);
      animation: chromatic-shift-end 2.8s steps(1, end) infinite;
    }

    .not-found-copy {
      display: grid;
      justify-items: center;
      gap: 0.75rem;
    }

    .not-found-copy .workspace-eyebrow,
    .not-found-copy .workspace-description {
      margin: 0;
    }

    .not-found-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }

    @keyframes chromatic-shift-start {
      0%,
      86%,
      100% {
        transform: translate(-0.035em, 0);
        clip-path: inset(0 0 0 0);
      }
      88% {
        transform: translate(-0.07em, 0.018em);
        clip-path: inset(8% 0 58% 0);
      }
      91% {
        transform: translate(-0.025em, -0.012em);
        clip-path: inset(46% 0 24% 0);
      }
      94% {
        transform: translate(-0.06em, 0);
        clip-path: inset(72% 0 8% 0);
      }
    }

    @keyframes chromatic-shift-end {
      0%,
      86%,
      100% {
        transform: translate(0.035em, 0);
        clip-path: inset(0 0 0 0);
      }
      88% {
        transform: translate(0.055em, -0.014em);
        clip-path: inset(64% 0 10% 0);
      }
      91% {
        transform: translate(0.075em, 0.014em);
        clip-path: inset(18% 0 54% 0);
      }
      94% {
        transform: translate(0.025em, 0);
        clip-path: inset(38% 0 28% 0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .not-found-code::before,
      .not-found-code::after {
        display: none;
      }
    }

    :host-context(:root[data-motion='reduced']) .not-found-code::before,
    :host-context(:root[data-motion='reduced']) .not-found-code::after {
      display: none;
    }

    @media (max-width: 36rem) {
      .not-found {
        min-height: auto;
        padding-block: 1rem;
      }

      .not-found-panel {
        gap: 1.5rem;
      }

      .not-found-actions {
        width: 100%;
        flex-direction: column;
      }
    }
  `,
})
export class UnavailablePage {
  readonly auth = inject(Auth);
  readonly forbidden = inject(ActivatedRoute).snapshot.data['forbidden'] === true;
}
