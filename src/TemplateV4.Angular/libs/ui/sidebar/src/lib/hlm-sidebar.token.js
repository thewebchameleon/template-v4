import { inject, InjectionToken } from '@angular/core';
const defaultConfig = {
    defaultOpen: true,
    sidebarWidth: '16rem',
    sidebarWidthMobile: '18rem',
    sidebarWidthIcon: '3rem',
    sidebarCookieName: 'sidebar_state',
    sidebarCookieMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    sidebarKeyboardShortcut: 'b',
    mobileBreakpoint: '768px',
    closeMobileSidebarOnMenuButtonClick: false,
};
const HlmSidebarConfigToken = new InjectionToken('HlmSidebarConfig');
export function provideHlmSidebarConfig(config) {
    return { provide: HlmSidebarConfigToken, useValue: { ...defaultConfig, ...config } };
}
export function injectHlmSidebarConfig() {
    return inject(HlmSidebarConfigToken, { optional: true }) ?? defaultConfig;
}
