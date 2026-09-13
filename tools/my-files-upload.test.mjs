import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(new URL("../src/TemplateV4.Angular/package.json", import.meta.url));
const ts = require("typescript");
const source = readFileSync(new URL("../src/TemplateV4.Angular/src/app/features/my-files-upload.ts", import.meta.url), "utf8");

function harness(random) {
  let now = 0;
  let tick;
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, {
    exports, Math: Object.assign(Object.create(Math), { random: () => random }),
    performance: { now: () => now },
    setInterval: (callback) => { tick = callback; return 1; },
    clearInterval: () => { tick = undefined; },
  });
  return {
    run: exports.simulateSlowUpload,
    advance: (ms) => { now += ms; tick?.(); },
    active: () => !!tick,
  };
}

for (const [random, duration] of [[0, 4000], [0.5, 7000], [1, 10000]]) {
  test(`fast requests remain pending for the simulated ${duration}ms duration`, async () => {
    const h = harness(random), values = [];
    let complete = false;
    const run = h.run(async (report) => report(100), (value) => values.push(value))
      .then(() => { complete = true; });
    await Promise.resolve();
    h.advance(duration / 2);
    assert.equal(values.at(-1), 50);
    assert.equal(complete, false);
    h.advance(duration / 2);
    await run;
    assert.equal(values.at(-1), 100);
    assert.equal(h.active(), false);
  });
}

test("simulation never outruns transfer progress or reports success before the response", async () => {
  const h = harness(0), values = [];
  let finish;
  let complete = false;
  const run = h.run((report) => {
    report(20);
    return new Promise((resolve) => { finish = resolve; });
  }, (value) => values.push(value)).then(() => { complete = true; });
  h.advance(5000);
  await Promise.resolve();
  assert.equal(values.at(-1), 20);
  assert.equal(complete, false);
  finish();
  await run;
  assert.equal(values.at(-1), 100);
});

test("failed requests stop the timer immediately without reporting completion", async () => {
  const h = harness(0), values = [];
  await assert.rejects(h.run(async () => { throw new Error("upload failed"); },
    (value) => values.push(value)), /upload failed/);
  assert.equal(h.active(), false);
  assert.equal(values.includes(100), false);
});

test("cancelling during simulated progress clears the timer and prevents completion", async () => {
  const h = harness(0), values = [];
  const controller = new AbortController();
  const run = h.run(async (report) => report(100), (value) => values.push(value), controller.signal);
  await Promise.resolve();
  h.advance(1000);
  controller.abort();
  await assert.rejects(run, { name: "AbortError" });
  assert.equal(h.active(), false);
  assert.equal(values.includes(100), false);
});

test("an already cancelled batch starts neither a request nor a timer", async () => {
  const h = harness(0), controller = new AbortController();
  controller.abort();
  let requests = 0;
  await assert.rejects(h.run(async () => { requests++; }, () => {}, controller.signal), { name: "AbortError" });
  assert.equal(requests, 0);
  assert.equal(h.active(), false);
});
