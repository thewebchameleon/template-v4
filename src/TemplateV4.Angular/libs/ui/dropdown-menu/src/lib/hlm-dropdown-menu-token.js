import { InjectionToken, inject } from '@angular/core';
const defaultConfig = {
    align: 'start',
    side: 'bottom',
};
const HlmDropdownMenuConfigToken = new InjectionToken('HlmDropdownMenuConfig');
export function provideHlmDropdownMenuConfig(config) {
    return { provide: HlmDropdownMenuConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectHlmDropdownMenuConfig() {
    return inject(HlmDropdownMenuConfigToken, { optional: true }) ?? defaultConfig;
}
