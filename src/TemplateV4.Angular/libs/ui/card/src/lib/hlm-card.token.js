import { inject, InjectionToken } from '@angular/core';
const defaultConfig = {
    size: 'default',
};
const HlmCardConfigToken = new InjectionToken('HlmCardConfig');
export function provideHlmCardConfig(config) {
    return { provide: HlmCardConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectHlmCardConfig() {
    return inject(HlmCardConfigToken, { optional: true }) ?? defaultConfig;
}
