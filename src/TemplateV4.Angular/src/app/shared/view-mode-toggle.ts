import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLayoutGrid, lucideList } from '@ng-icons/lucide';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

export type ViewMode = 'list' | 'grid';

@Component({
  selector: 'app-view-mode-toggle',
  imports: [HlmToggleGroupImports, NgIcon],
  providers: [provideIcons({ lucideLayoutGrid, lucideList })],
  template: `
    <hlm-toggle-group
      type="single"
      variant="inset"
      [nullable]="false"
      [value]="value()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.data-view]="value()"
      (valueChange)="select($event)"
      class="view-mode-toggle"
    >
      <span class="view-mode-toggle-indicator" aria-hidden="true"></span>
      <button hlmToggleGroupItem type="button" value="list">
        <ng-icon name="lucideList" aria-hidden="true" />{{ listLabel() }}
      </button>
      <button hlmToggleGroupItem type="button" value="grid">
        <ng-icon name="lucideLayoutGrid" aria-hidden="true" />{{ gridLabel() }}
      </button>
    </hlm-toggle-group>
  `,
  styles: `
    .view-mode-toggle {
      position: relative;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .view-mode-toggle-indicator {
      pointer-events: none;
      position: absolute;
      inset-block: 3px;
      inset-inline-start: 3px;
      inline-size: calc((100% - 6px) / 2);
      border-radius: calc(var(--radius) - 2px);
      background: var(--primary);
      box-shadow: var(--shadow-sm);
      transform: translateX(0);
    }

    .view-mode-toggle[data-view='grid'] .view-mode-toggle-indicator {
      transform: translateX(100%);
    }

    .view-mode-toggle button {
      position: relative;
      z-index: 1;
    }

    .view-mode-toggle button[data-state='on'] {
      background: transparent;
      box-shadow: none;
    }

    @media (prefers-reduced-motion: no-preference) {
      .view-mode-toggle-indicator {
        transition: transform 200ms ease-out;
      }
    }

    :host-context([dir='rtl']) .view-mode-toggle[data-view='grid'] .view-mode-toggle-indicator {
      transform: translateX(-100%);
    }
  `,
})
export class ViewModeToggle {
  readonly value = input.required<ViewMode>();
  readonly ariaLabel = input.required<string>();
  readonly listLabel = input.required<string>();
  readonly gridLabel = input.required<string>();
  readonly disabled = input(false);
  readonly valueChange = output<ViewMode>();

  select(value: string | string[] | null | undefined) {
    if ((value === 'list' || value === 'grid') && value !== this.value()) {
      this.valueChange.emit(value);
    }
  }
}
