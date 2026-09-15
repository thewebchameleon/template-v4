import { test } from "node:test";
import assert from "node:assert/strict";
import { createCmsCache, sampleArticle } from "../src/server/content.mjs";
const success = (value) => async () => new Response(JSON.stringify(value));
const outage = async () => {
  throw new Error("offline");
};
test("an outage uses the last successful public response, or bundled content before first success", async () => {
  const cache = createCmsCache();
  assert.deepEqual(await cache.read("hero", ["sample"], outage), ["sample"]);
  await cache.read("hero", [], success(["published"]));
  assert.deepEqual(await cache.read("hero", [], outage), ["published"]);
});
test("confirmed unpublication evicts old content and returns not found", async () => {
  const cache = createCmsCache();
  await cache.read("article", null, success({ title: "published" }));
  assert.equal(
    await cache.read(
      "article",
      null,
      async () => new Response(null, { status: 404 }),
    ),
    null,
  );
  assert.equal(await cache.read("article", { title: "sample" }, outage), null);
});
test("module disable clears previous content; cache stays bounded", async () => {
  const cache = createCmsCache(1);
  await cache.read("a", null, success("a"));
  await cache.read("b", null, success("b"));
  assert.equal(await cache.read("a", null, outage), null);
  cache.clear();
  assert.equal(await cache.read("b", null, outage), null);
});
test("unknown sample slugs return not found", () => {
  assert.equal(sampleArticle("missing"), null);
  assert.ok(sampleArticle("a-clearer-plan").html.includes("<h2>"));
});
test("an in-flight response cannot repopulate a cache cleared by disablement", async () => {
  const cache = createCmsCache();
  let finish;
  const waiting = new Promise((resolve) => {
    finish = resolve;
  });
  const read = cache.read("article", null, () => waiting);
  cache.clear();
  finish(new Response(JSON.stringify({ title: "old publication" })));
  await read;
  assert.equal(await cache.read("article", null, outage), null);
});
