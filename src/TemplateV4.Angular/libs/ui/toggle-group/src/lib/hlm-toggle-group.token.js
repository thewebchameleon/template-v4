import { InjectionToken, inject } from '@angular/core';
export const HlmToggleGroupToken = new InjectionToken('HlmToggleGroupToken');
export function injectHlmToggleGroup() {
    return inject(HlmToggleGroupToken);
}
export function provideHlmToggleGroup(toggleGroup) {
    return { provide: HlmToggleGroupToken, useExisting: toggleGroup };
}
