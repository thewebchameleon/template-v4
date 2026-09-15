import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { createFeed } from "../../services/release-feed/server.mjs";
import {
  compare,
  compatibility,
  propose,
  sha256,
  validateRelease,
  validateLock,
} from "./contracts.mjs";
import { buildBundle, composePinned, unpackBundle } from "./bundles.mjs";
import { installedRelease } from "./installed.mjs";
import { updateWorkflowPins } from "./client-workflows.mjs";

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
  artifact: { package: "@example/reports", sha256: "a".repeat(64) },
};
test("stable ordering, bounds and reverse compatibility prevent unsafe proposals", () => {
  assert.equal(compare("1.10.0", "1.9.9"), 1);
  assert.throws(() => compare("01.0.0", "1.0.0"));
  assert.throws(() => compare("1.0.0-beta", "1.0.0"));
  const lock = {
    schemaVersion: 1,
    channel: "stable",
    components: [foundation, moduleRelease],
  };
  assert.equal(validateLock(lock), lock);
  const blocked = propose(lock, [{ ...foundation, version: "0.3.0" }]);
  assert.equal(blocked.changed, false);
  assert.ok(blocked.blocked.length);
  const next = { ...moduleRelease, version: "1.1.0" };
  assert.equal(propose(lock, [next]).lock.components[1].version, "1.1.0");
  assert.equal(propose(lock, [{ ...next, id: "unselected" }]).changed, false);
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
function archive(files) {
  const bundle = Buffer.from(
    JSON.stringify({
      schemaVersion: 1,
      id: "reports",
      version: "1.0.0",
      files,
    }),
  );
  const header = Buffer.alloc(512);
  header.write("package/bundle.json");
  header.write(bundle.length.toString(8).padStart(11, "0"), 124);
  header[156] = 48;
  return gzipSync(
    Buffer.concat([
      header,
      bundle,
      Buffer.alloc((512 - (bundle.length % 512)) % 512),
      Buffer.alloc(1024),
    ]),
  );
}
test("a clean module packages with npm and composes only its pinned source", async (t) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "release-roundtrip-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, "source");
  await fs.mkdir(root);
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git("init");
  git("config", "user.name", "Release tests");
  git("config", "user.email", "release-tests@example.test");
  const moduleDirectory = path.join(root, "private", "reports");
  await fs.mkdir(moduleDirectory, { recursive: true });
  const descriptor = {
    id: "reports",
    version: "1.0.0",
    dependencies: [],
    foundationCompatibility: moduleRelease.foundation,
    dependencyVersions: {},
  };
  await fs.writeFile(
    path.join(moduleDirectory, "module.json"),
    JSON.stringify(descriptor),
  );
  await fs.writeFile(
    path.join(moduleDirectory, "Sample.cs"),
    "// retained module source\n",
  );
  await fs.writeFile(
    path.join(root, "framework.json"),
    JSON.stringify({
      frameworkVersion: "0.2.0",
      templateVersion: "0.1.0",
      scaffoldingVersion: "0.1.0",
    }),
  );
  await fs.writeFile(
    path.join(root, "client-modules.json"),
    JSON.stringify({
      schemaVersion: 1,
      foundation: {},
      privateModules: ["reports"],
    }),
  );
  git("add", ".");
  git(
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "Synthetic release fixture",
  );
  const commit = git("rev-parse", "HEAD");
  const release = { ...moduleRelease, commit };
  const output = path.join(directory, "package");
  buildBundle(moduleDirectory, release, output);
  const args = [
    "pack",
    output,
    "--ignore-scripts",
    "--json",
    "--offline",
    "--cache",
    path.join(directory, "cache"),
    "--pack-destination",
    directory,
  ];
  const packed =
    process.platform === "win32"
      ? execFileSync(
          process.execPath,
          [
            path.join(
              path.dirname(
                execFileSync("where.exe", ["npm.cmd"], { encoding: "utf8" })
                  .trim()
                  .split(/\r?\n/)[0],
              ),
              "node_modules/npm/bin/npm-cli.js",
            ),
            ...args,
          ],
          { encoding: "utf8" },
        )
      : execFileSync("npm", args, { encoding: "utf8" });
  const packOutput = JSON.parse(packed);
  const packEntry = Array.isArray(packOutput)
    ? packOutput[0]
    : packOutput[release.artifact.package] ?? Object.values(packOutput)[0];
  assert.ok(packEntry?.filename, "npm pack did not return a package filename");
  const tgz = await fs.readFile(path.join(directory, packEntry.filename));
  release.artifact = { ...release.artifact, sha256: sha256(tgz) };
  const bundle = unpackBundle(tgz, release);
  assert.deepEqual(bundle.files.map((f) => f.path).sort(), [
    "Sample.cs",
    "module.json",
  ]);
  const lock = {
    schemaVersion: 1,
    channel: "stable",
    components: [{ ...foundation, commit }, release],
  };
  await composePinned(root, lock, "unused", async () => bundle);
  assert.equal(
    await fs.readFile(
      path.join(root, "business-modules/reports/Sample.cs"),
      "utf8",
    ),
    "// retained module source\n",
  );
  assert.equal(
    installedRelease(root, [descriptor]).components[1].artifact.sha256,
    release.artifact.sha256,
  );
  assert.throws(() =>
    installedRelease(root, [{ ...descriptor, version: "9.0.0" }]),
  );
  await assert.rejects(
    () => composePinned(root, lock, "unused", async () => bundle),
    /clean checkout/,
  );
  const workflows = path.join(root, ".github/workflows");
  await fs.mkdir(workflows, { recursive: true });
  await fs.writeFile(
    path.join(workflows, "updates.yml"),
    `uses: thewebchameleon/template-v4/.github/workflows/compose-release.yml@${commit}\nrepository: thewebchameleon/template-v4\nref: ${commit}\n# keep custom content\n`,
  );
  updateWorkflowPins(root, commit, "f".repeat(40));
  const text = await fs.readFile(path.join(workflows, "updates.yml"), "utf8");
  assert.ok(!text.includes(commit));
  assert.ok(text.includes("# keep custom content"));
});
test("source bundles reject tampering, path escapes, aliases and descriptor mismatches", () => {
  const descriptor = {
    id: "reports",
    version: "1.0.0",
    foundationCompatibility: moduleRelease.foundation,
    dependencyVersions: {},
  };
  const base = {
    path: "module.json",
    data: Buffer.from(JSON.stringify(descriptor)).toString("base64"),
  };
  const tgz = archive([base]);
  const release = {
    ...moduleRelease,
    artifact: { ...moduleRelease.artifact, sha256: sha256(tgz) },
  };
  assert.equal(unpackBundle(tgz, release).id, "reports");
  assert.throws(() => unpackBundle(tgz, moduleRelease), /digest/);
  for (const unsafe of [
    "../outside",
    "/outside",
    "C:/outside",
    "a/../../outside",
    "a\\b",
    "con",
    "file.",
    "module.json",
    "MODULE.JSON",
  ]) {
    const bad = archive([base, { path: unsafe, data: "" }]);
    assert.throws(() =>
      unpackBundle(bad, {
        ...release,
        artifact: { ...release.artifact, sha256: sha256(bad) },
      }),
    );
  }
});
