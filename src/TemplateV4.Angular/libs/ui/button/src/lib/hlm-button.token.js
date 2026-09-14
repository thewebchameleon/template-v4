import { InjectionToken, inject } from '@angular/core';
const defaultConfig = {
    variant: 'default',
    size: 'default',
};
const BrnButtonConfigToken = new InjectionToken('BrnButtonConfig');
export function provideBrnButtonConfig(config) {
    return { provide: BrnButtonConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectBrnButtonConfig() {
    return inject(BrnButtonConfigToken, { optional: true }) ?? defaultConfig;
}
