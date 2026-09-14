import { InjectionToken, inject } from '@angular/core';
const defaultConfig = {
    align: 'start',
    side: 'bottom',
};
const HlmContextMenuConfigToken = new InjectionToken('HlmContextMenuConfig');
export function provideHlmContextMenuConfig(config) {
    return { provide: HlmContextMenuConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectHlmContextMenuConfig() {
    return inject(HlmContextMenuConfigToken, { optional: true }) ?? defaultConfig;
}
