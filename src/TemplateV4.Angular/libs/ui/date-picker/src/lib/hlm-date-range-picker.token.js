import { inject, InjectionToken } from '@angular/core';
function getDefaultConfig() {
    return {
        formatDates: (dates) => dates
            .filter(Boolean)
            .map((date) => (date instanceof Date ? date.toDateString() : `${date}`))
            .join(' - '),
        formatInputDates: (dates) => dates
            .filter(Boolean)
            .map((date) => (date instanceof Date ? date.toDateString() : `${date}`))
            .join(' - '),
        transformDates: (dates) => dates,
        autoCloseOnEndSelection: false,
        parseDate: (value) => {
            if (typeof value !== 'string')
                return null;
            const parts = value.split(' - ').map((part) => part.trim());
            if (parts.length === 0 || parts.length > 2)
                return null;
            const start = new Date(parts[0]);
            if (isNaN(start.getTime()))
                return null;
            const end = parts.length === 2 ? new Date(parts[1]) : start;
            return [start, isNaN(end.getTime()) ? start : end];
        },
    };
}
const HlmDateRangePickerConfigToken = new InjectionToken('HlmDateRangePickerConfig');
export function provideHlmDateRangePickerConfig(config) {
    return { provide: HlmDateRangePickerConfigToken, useValue: { ...getDefaultConfig(), ...config } };
}
export function injectHlmDateRangePickerConfig() {
    const injectedConfig = inject(HlmDateRangePickerConfigToken, { optional: true });
    return injectedConfig ? injectedConfig : getDefaultConfig();
}
