import { inject, InjectionToken } from '@angular/core';
const mmYYYY = (date) => {
    if (!(date instanceof Date))
        return `${date}`;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
};
function getDefaultConfig() {
    return {
        formatDate: mmYYYY,
        formatInputDate: mmYYYY,
        transformDate: (date) => date,
        parseDate: (value) => {
            if (typeof value !== 'string')
                return null;
            const match = value.match(/^(\d{2})\/(\d{4})$/);
            if (!match)
                return null;
            const month = Number(match[1]);
            const year = Number(match[2]);
            if (month < 1 || month > 12)
                return null;
            const date = new Date(year, month - 1, 1);
            return date;
        },
        autoCloseOnSelect: false,
    };
}
const HlmMonthYearPickerConfigToken = new InjectionToken('HlmMonthYearPickerConfig');
export function provideHlmMonthYearPickerConfig(config) {
    return { provide: HlmMonthYearPickerConfigToken, useValue: { ...getDefaultConfig(), ...config } };
}
export function injectHlmMonthYearPickerConfig() {
    const injectedConfig = inject(HlmMonthYearPickerConfigToken, { optional: true });
    return injectedConfig ? injectedConfig : getDefaultConfig();
}
