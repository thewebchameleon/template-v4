import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createFeed } from "../../deploy/release-feed/server.mjs";
import {
  compare,
  compatibility,
  sha256,
  validateRelease,
  validateLock,
} from "./contracts.mjs";

const foundation = {
  schemaVersion: 1,
  id: "foundation",
  version: "0.2.0",
  templateVersion: "0.1.0",
  scaffoldingVersion: "0.1.0",
  commit: "a".repeat(40),
  notesUrl: "https://example.test/releases/1",
  migrationNotes: "Run migrator.",
  breaking: false,
  dependencies: {},
};
const moduleRelease = {
  ...foundation,
  id: "reports",
  version: "1.0.0",
  foundation: { min: "0.2.0", maxExclusive: "0.3.0" },
  artifact: { package: "@example/reports", sha256: "a".repeat(64), downloadUrl: "https://example.test/reports.tgz" },
};
test("stable ordering, bounds and compatibility reject invalid releases", () => {
  assert.equal(compare("1.10.0", "1.9.9"), 1);
  assert.throws(() => compare("01.0.0", "1.0.0"));
  assert.throws(() => compare("1.0.0-beta", "1.0.0"));
  const lock = {
    schemaVersion: 1,
    channel: "stable",
    components: [foundation, moduleRelease],
  };
  assert.equal(validateLock(lock), lock);
  assert.ok(
    compatibility([
      foundation,
      {
        ...moduleRelease,
        dependencies: { missing: { min: "1.0.0", maxExclusive: "2.0.0" } },
      },
    ]).length,
  );
  assert.throws(() =>
    validateRelease({ ...moduleRelease, notesUrl: "javascript:alert(1)" }),
  );
});
test("feed authenticates, isolates entitlements and publishes immutable releases atomically", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "release-feed-"));
  const dataDirectory = path.join(directory, "data");
  await fs.mkdir(dataDirectory);
  const credentialsFile = path.join(directory, "credentials.json");
  const publisher = "p".repeat(48),
    reader = "r".repeat(48);
  const config = {
    credentials: [
      {
        sha256: sha256(publisher),
        role: "publisher",
        modules: ["foundation", "reports"],
      },
      { sha256: sha256(reader), role: "client", modules: ["foundation"] },
    ],
  };
  await fs.writeFile(credentialsFile, JSON.stringify(config));
  const server = createFeed({ dataDirectory, credentialsFile });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/v1/releases`;
  const post = (release, token = publisher) =>
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(release),
    });
  try {
    assert.equal((await fetch(url)).status, 401);
    assert.equal((await post(foundation)).status, 201);
    assert.equal((await post(moduleRelease)).status, 201);
    assert.equal((await post(foundation)).status, 200);
    assert.equal((await post({ ...foundation, breaking: true })).status, 409);
    assert.equal(
      (await post({ ...moduleRelease, id: "not-entitled" })).status,
      403,
    );
    assert.equal(
      (await post({ ...moduleRelease, id: "../../outside" })).status,
      400,
    );
    assert.equal((await post(foundation, reader)).status, 404);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${reader}` },
    });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(
      (await response.json()).releases.map((x) => x.id),
      ["foundation"],
    );
    const races = await Promise.all(
      Array.from({ length: 5 }, () =>
        post({ ...moduleRelease, version: "1.2.0" }),
      ),
    );
    assert.equal(races.filter((r) => r.status === 201).length, 1);
    config.credentials[1].disabled = true;
    await fs.writeFile(credentialsFile, JSON.stringify(config));
    assert.equal(
      (await fetch(url, { headers: { Authorization: `Bearer ${reader}` } }))
        .status,
      401,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(directory, { recursive: true, force: true });
  }
});
