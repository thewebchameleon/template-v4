export interface HsvColor {
  h: number;
  s: number;
  v: number;
}
export function hexToHsv(hex: string): HsvColor {
  const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? (delta / max) * 100 : 0, v: max * 100 };
}
export function hsvToHex({ h, s, v }: HsvColor): string {
  const saturation = Math.max(0, Math.min(100, s)) / 100;
  const value = Math.max(0, Math.min(100, v)) / 100;
  const hue = (((h % 360) + 360) % 360) / 60;
  const c = value * saturation,
    x = c * (1 - Math.abs((hue % 2) - 1)),
    m = value - c;
  const channels =
    hue < 1
      ? [c, x, 0]
      : hue < 2
        ? [x, c, 0]
        : hue < 3
          ? [0, c, x]
          : hue < 4
            ? [0, x, c]
            : hue < 5
              ? [x, 0, c]
              : [c, 0, x];
  return (
    '#' +
    channels
      .map((channel) =>
        Math.round((channel + m) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()
  );
}
