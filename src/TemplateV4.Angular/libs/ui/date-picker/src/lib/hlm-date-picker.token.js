import { inject, InjectionToken } from '@angular/core';
function getDefaultConfig() {
    return {
        formatDate: (date) => (date instanceof Date ? date.toDateString() : `${date}`),
        formatInputDate: (date) => (date instanceof Date ? date.toDateString() : `${date}`),
        transformDate: (date) => date,
        parseDate: (value) => {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
        },
        autoCloseOnSelect: false,
    };
}
const HlmDatePickerConfigToken = new InjectionToken('HlmDatePickerConfig');
export function provideHlmDatePickerConfig(config) {
    return { provide: HlmDatePickerConfigToken, useValue: { ...getDefaultConfig(), ...config } };
}
export function injectHlmDatePickerConfig() {
    const injectedConfig = inject(HlmDatePickerConfigToken, { optional: true });
    return injectedConfig ? injectedConfig : getDefaultConfig();
}
