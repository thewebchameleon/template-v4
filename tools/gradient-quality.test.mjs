import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "../src/TemplateV4.Angular/node_modules/typescript/lib/typescript.js";

const source = readFileSync(
  new URL(
    "../src/TemplateV4.Angular/src/app/shared/gradient-quality.ts",
    import.meta.url,
  ),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText;
const { GradientQuality } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);

test("Flow bounds CPU pixels on large, square and high-DPI displays", () => {
  for (const [width, height] of [
    [1920, 1080],
    [1080, 1920],
    [2000, 2000],
  ]) {
    const [w, h] = new GradientQuality("FLOW", false).dimensions(
      width,
      height,
      3,
    );
    assert.ok(w * h <= 32600);
    assert.ok(Math.max(w, h) <= 240);
    assert.ok(Math.abs(w / h - width / height) < 0.01);
  }
});

test("quality reacts to expensive frames and remains stable after recovery", () => {
  const quality = new GradientQuality("FLOW", false);
  const before = quality.dimensions(1920, 1080, 1)[0];
  quality.record(60);
  const reduced = quality.dimensions(1920, 1080, 1)[0];
  assert.ok(reduced < before);
  for (let i = 0; i < 80; i++) quality.record(2);
  assert.equal(quality.dimensions(1920, 1080, 1)[0], reduced);
  for (let i = 0; i < 80; i++) quality.record(100);
  assert.ok(quality.dimensions(1920, 1080, 1)[0] >= 96);
});

test("sustained moderate cost lowers quality without reacting to one small spike", () => {
  const quality = new GradientQuality("LINEAR", false);
  quality.record(20);
  assert.equal(quality.dimensions(1920, 1080, 1)[0], 960);
  for (let i = 0; i < 7; i++) quality.record(20);
  assert.ok(quality.dimensions(1920, 1080, 1)[0] < 960);
});

test("cheap artwork, thumbnails and small or empty hosts retain appropriate bounds", () => {
  assert.deepEqual(
    new GradientQuality("LINEAR", false).dimensions(1920, 1080, 2),
    [960, 540],
  );
  assert.deepEqual(
    new GradientQuality("LINEAR", true).dimensions(1920, 1080, 2),
    [240, 135],
  );
  assert.deepEqual(
    new GradientQuality("FLOW", false).dimensions(80, 40, 1),
    [80, 40],
  );
  assert.deepEqual(
    new GradientQuality("FLOW", false).dimensions(0, 100, 1),
    [0, 0],
  );
});

test("Sky and Aurora retain original large-screen detail even after slow frames", () => {
  for (const type of ["SKY", "AURORA"]) {
    const quality = new GradientQuality(type, false);
    for (let i = 0; i < 80; i++) quality.record(100);
    assert.deepEqual(quality.dimensions(3840, 2160, 2), [960, 540]);
    assert.deepEqual(quality.dimensions(2160, 3840, 2), [540, 960]);
    assert.deepEqual(
      new GradientQuality(type, true).dimensions(3840, 2160, 2),
      [240, 135],
    );
  }
});

test("unbenchmarked types start at original resolution and retain a detail floor", () => {
  for (const type of ["SMESH", "CNOISE", "SILK", "RETRO"]) {
    const quality = new GradientQuality(type, false);
    assert.deepEqual(quality.dimensions(3840, 2160, 2), [960, 540]);
    for (let i = 0; i < 80; i++) quality.record(100);
    assert.equal(quality.dimensions(3840, 2160, 2)[0], 720);
  }
});
