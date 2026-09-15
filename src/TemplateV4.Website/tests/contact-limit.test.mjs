import { test } from "node:test";
import assert from "node:assert/strict";
import { contactLimiter } from "../src/server/contact-limit.mjs";
test("contact limits apply separately to visitors and expire after ten minutes", () => {
  let time = 0;
  const allow = contactLimiter(() => time);
  for (let i = 0; i < 5; i++) assert.equal(allow("visitor-a"), true);
  assert.equal(allow("visitor-a"), false);
  assert.equal(allow("visitor-b"), true);
  time = 600000;
  assert.equal(allow("visitor-a"), true);
});
