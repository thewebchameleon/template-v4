import { GRADIENT_CATALOG } from './gradient-catalog';
import { hexToHsv, hsvToHex } from './color-picker';
import { DEFAULT_PRIMARY_COLOR, validPrimaryColor } from './brand-palette';
export const GRADIENT_TYPES = GRADIENT_CATALOG.types;
export const LOGIN_BACKGROUNDS = GRADIENT_CATALOG.presets;
export const DEFAULT_LOGIN_BACKGROUND = 'blue-sky';
/** Keep tonal structure and relative hues while anchoring the palette to the primary color. */
export function recolorBackground(preset, primaryColor) {
    const primary = hexToHsv(validPrimaryColor(primaryColor) ? primaryColor : DEFAULT_PRIMARY_COLOR);
    const colors = preset.stops.map(hexToHsv);
    const anchor = colors.reduce((best, color) => color.s * color.v > best.s * best.v ? color : best);
    return {
        ...preset,
        stops: colors.map((color) => hsvToHex({
            h: (color.h + primary.h - anchor.h + 360) % 360,
            s: anchor.s ? Math.min(100, (color.s * primary.s) / anchor.s) : primary.s,
            v: color.v,
        })),
    };
}
export function loginBackground(id) {
    return (LOGIN_BACKGROUNDS.find((preset) => preset.id === id) ??
        LOGIN_BACKGROUNDS.find((preset) => preset.id === DEFAULT_LOGIN_BACKGROUND));
}
