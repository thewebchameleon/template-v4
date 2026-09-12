import test from "node:test";
import assert from "node:assert/strict";
import {
  hexToHsv,
  hsvToHex,
} from "../src/TemplateV4.Angular/src/app/core/color-picker.ts";
import {
  brandPalette,
  luminance,
  validPrimaryColor,
} from "../src/TemplateV4.Angular/src/app/core/brand-palette.ts";

const contrast = (a, b) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);

test("picker preserves exact hex colors through HSV conversion, including grays and hue boundaries", () => {
  for (let r = 0; r <= 255; r += 17)
    for (let g = 0; g <= 255; g += 17)
      for (let b = 0; b <= 255; b += 17) {
        const hex =
          "#" +
          [r, g, b]
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
        assert.equal(hsvToHex(hexToHsv(hex)), hex);
      }
  assert.equal(hsvToHex({ h: 360, s: 100, v: 100 }), "#FF0000");
  assert.equal(hsvToHex({ h: 120, s: 100, v: 100 }), "#00FF00");
  assert.equal(hsvToHex({ h: 240, s: 100, v: 100 }), "#0000FF");
});
const hover = (hex, background) =>
  "#" +
  [1, 3, 5]
    .map((offset) =>
      Math.round(
        parseInt(hex.slice(offset, offset + 2), 16) * 0.9 +
          parseInt(background.slice(offset, offset + 2), 16) * 0.1,
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

test("custom brand colors keep primary text, buttons, hover and accent pairs accessible", () => {
  const colors = [
    "#2563EB",
    "#7C3AED",
    "#C026D3",
    "#E11D48",
    "#EA580C",
    "#059669",
    "#4F46E5",
    "#0891B2",
    "#0D9488",
    "#65A30D",
    "#EAB308",
    "#D97706",
    "#DC2626",
    "#000000",
    "#FFFFFF",
    "#FFFF00",
    "#00FFFF",
    "#FF00FF",
    "#00FF00",
    "#FFFEEE",
  ];
  for (let red = 0; red <= 255; red += 51)
    for (let green = 0; green <= 255; green += 51)
      for (let blue = 0; blue <= 255; blue += 51)
        colors.push(
          "#" +
            [red, green, blue]
              .map((x) => x.toString(16).padStart(2, "0"))
              .join(""),
        );
  for (const color of colors) {
    const p = brandPalette(color);
    for (const [a, b] of [
      [p[600], "#FFFFFF"],
      [hover(p[600], "#FFFFFF"), "#FFFFFF"],
      [p[400], p[950]],
      [hover(p[400], "#18181B"), p[950]],
      [p[400], "#18181B"],
      [p[50], p[900]],
      [p[950], p[100]],
    ])
      assert.ok(
        contrast(a, b) >= 4.5,
        `${color}: ${a}/${b} contrast ${contrast(a, b)}`,
      );
    assert.ok(contrast(p[500], "#FFFFFF") >= 3, color);
    assert.ok(contrast(p[400], "#18181B") >= 3, color);
  }
});

test("hex validation rejects CSS expressions and invalid colors; fallback is deterministic", () => {
  for (const value of [
    "red",
    "#fff",
    "#GGGGGG",
    "#123456;",
    "var(--primary)",
    " #2563EB",
    "",
  ])
    assert.equal(validPrimaryColor(value), false);
  assert.equal(validPrimaryColor("#7c3aEd"), true);
  assert.deepEqual(brandPalette("invalid"), brandPalette("#2563EB"));
});
