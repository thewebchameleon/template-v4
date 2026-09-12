export const DEFAULT_PRIMARY_COLOR = '#2563EB';
export const validPrimaryColor = (value: string): boolean => /^#[0-9a-f]{6}$/i.test(value);

type Rgb = [number, number, number];
export function luminance(hex: string): number {
  const channels = rgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function rgb(hex: string): Rgb {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as Rgb;
}
function mix(hex: string, target: number, amount: number): string {
  return (
    '#' +
    rgb(hex)
      .map((value) =>
        Math.round(value + (target - value) * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
function shade(hex: string, targetLuminance: number): string {
  const target = luminance(hex) < targetLuminance ? 255 : 0;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 20; step++) {
    const middle = (low + high) / 2;
    const value = luminance(mix(hex, target, middle));
    if (target === 255 ? value < targetLuminance : value > targetLuminance) low = middle;
    else high = middle;
  }
  return mix(hex, target, high);
}

// Keep hue where possible, with margin above WCAG text and control contrast minima.
// Even white, black and very pale custom colors produce usable semantic tokens.
export function brandPalette(hex: string): Record<number, string> {
  if (!validPrimaryColor(hex)) hex = DEFAULT_PRIMARY_COLOR;
  return Object.fromEntries(
    [
      [50, 0.96],
      [100, 0.88],
      [200, 0.75],
      [300, 0.62],
      // Dark-theme primary: a lower luminance target needs less white mixing,
      // which keeps configured hues richer while retaining accessible contrast.
      [400, 0.4],
      [500, 0.18],
      [600, Math.min(luminance(hex), 0.12)],
      [700, 0.09],
      [800, 0.055],
      [900, 0.025],
      [950, 0.008],
    ].map(([key, target]) => [key, shade(hex, target)]),
  );
}
