import { computed, Directive, inject, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { HlmSidebarService } from './hlm-sidebar.service';
import { injectHlmSidebarConfig } from './hlm-sidebar.token';

@Directive({
  selector: '[hlmSidebarWrapper],hlm-sidebar-wrapper',
  host: {
    'data-slot': 'sidebar-wrapper',
    '[attr.data-resizing]': '_sidebarService.resizing() ? "true" : null',
    '[style.--sidebar-width]': '_sidebarWidth()',
    '[style.--sidebar-width-icon]': 'sidebarWidthIcon()',
    '[style.--sidebar-panel-width]': '_sidebarService.panelWidthCss()',
  },
})
export class HlmSidebarWrapper {
  private readonly _config = injectHlmSidebarConfig();
  protected readonly _sidebarService = inject(HlmSidebarService);

  public readonly sidebarWidth = input<string>(this._config.sidebarWidth);
  public readonly sidebarWidthIcon = input<string>(this._config.sidebarWidthIcon);
  protected readonly _sidebarWidth = computed(() =>
    this._sidebarService.widthInitialized() ? this._sidebarService.widthCss() : this.sidebarWidth(),
  );

  constructor() {
    classes(
      () => 'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
    );
  }
}
