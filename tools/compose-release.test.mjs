import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { prepare } from "./prepare-client-release.mjs";
import { renderRelease } from "./render-compose-release.mjs";

const root = path.resolve(import.meta.dirname, "..");
const shell =
  process.platform === "win32"
    ? "C:/Program Files/Git/bin/bash.exe"
    : "/bin/sh";
function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "compose-release-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("foundation demo has no client lock requirement", (t) => {
  const directory = temporary(t);
  prepare(
    directory,
    root,
    "deploy/compose-platforms/demo/client-modules.json",
    "missing",
  );
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(directory, "client-modules.json")))
      .privateModules,
    [],
  );
  assert.equal(fs.existsSync(path.join(directory, ".local")), false);
});

test("client build fails closed when reviewed host locks are missing", (t) => {
  const directory = temporary(t);
  assert.throws(
    () =>
      prepare(
        directory,
        root,
        "deploy/compose-platforms/client-example/client-modules.json",
        "missing",
      ),
    /ENOENT/,
  );
  assert.equal(fs.existsSync(path.join(directory, ".dockerignore")), false);
  assert.throws(
    () => prepare(directory, root, "../outside.json", "client-locks"),
    /inside/,
  );
});

test("private build copies only required locks and retains other Docker exclusions", (t) => {
  const directory = temporary(t);
  const configuration = path.join(directory, "configuration");
  const foundation = path.join(directory, "foundation");
  fs.mkdirSync(path.join(configuration, "client-locks"), { recursive: true });
  fs.mkdirSync(foundation);
  fs.writeFileSync(path.join(foundation, ".dockerignore"), ".local\n.env\n");
  fs.copyFileSync(
    path.join(
      root,
      "deploy/compose-platforms/client-example/client-modules.json",
    ),
    path.join(configuration, "client-modules.json"),
  );
  for (const host of [
    "ApiService",
    "BackgroundWorker",
    "DatabaseMigrator",
    "Application.Tests",
  ])
    fs.writeFileSync(
      path.join(
        configuration,
        "client-locks",
        `TemplateV4.${host}.packages.lock.json`,
      ),
      "{}\n",
    );
  fs.writeFileSync(
    path.join(configuration, "client-locks", "unrelated.txt"),
    "not a lock",
  );
  prepare(foundation, configuration, "client-modules.json", "client-locks");
  assert.equal(
    fs.readdirSync(path.join(foundation, ".local/client-locks")).length,
    4,
  );
  const ignore = fs.readFileSync(
    path.join(foundation, ".dockerignore"),
    "utf8",
  );
  assert.ok(ignore.startsWith(".local\n.env\n"));
  assert.ok(ignore.includes("!.local/client-locks/*.packages.lock.json"));
});

test("release rendering requires every image digest and retains one release's metadata", (t) => {
  const directory = temporary(t);
  const foundation = path.join(directory, "foundation");
  const output = path.join(directory, "output");
  fs.mkdirSync(foundation);
  fs.mkdirSync(output);
  fs.cpSync(path.join(root, "deploy"), path.join(foundation, "deploy"), {
    recursive: true,
  });
  fs.copyFileSync(
    path.join(root, "deploy/compose-platforms/demo/client-modules.json"),
    path.join(foundation, "client-modules.json"),
  );
  for (const service of ["api", "worker", "migrator"])
    fs.writeFileSync(
      path.join(output, `${service}.metadata.json`),
      JSON.stringify({ "containerimage.digest": `sha256:${"a".repeat(64)}` }),
    );
  const args = [
    foundation,
    output,
    "run-123-1",
    "ghcr.io/example/demo",
    "b".repeat(40),
  ];
  assert.throws(() => renderRelease(...args), /ENOENT/);
  assert.equal(fs.existsSync(path.join(output, "compose.yaml")), false);
  fs.writeFileSync(
    path.join(output, "web.metadata.json"),
    JSON.stringify({ "containerimage.digest": "latest" }),
  );
  assert.throws(() => renderRelease(...args), /digest/);
  fs.writeFileSync(
    path.join(output, "web.metadata.json"),
    JSON.stringify({ "containerimage.digest": `sha256:${"c".repeat(64)}` }),
  );
  renderRelease(...args);
  const compose = fs.readFileSync(path.join(output, "compose.yaml"), "utf8");
  assert.equal((compose.match(/@sha256:/g) || []).length, 4);
  assert.ok(!compose.includes("__RELEASE__"));
  assert.ok(!compose.includes("build:"));
  assert.ok(!compose.includes("key-permissions"));
  assert.ok(compose.includes("DataProtection__KeyPath: /keys/ring"));
  const coolifyCompose = fs.readFileSync(
    path.join(output, "compose.coolify.yaml"),
    "utf8",
  );
  assert.equal(
    (coolifyCompose.match(/exclude_from_hc: true/g) || []).length,
    1,
  );
  assert.equal(
    coolifyCompose.replaceAll("\n    exclude_from_hc: true", ""),
    compose,
  );
  assert.ok(fs.existsSync(path.join(output, "COOLIFY.md")));
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(output, "release.json")))
      .foundationCommit,
    "b".repeat(40),
  );
  assert.ok(fs.existsSync(path.join(output, "deploy/init-database.sh")));
  assert.equal(
    fs.existsSync(path.join(output, "deploy/nginx.production.conf")),
    false,
  );
});

for (const failure of ["pull", "migrator", ""]) {
  test(`upgrade ${failure ? `stops safely on ${failure} failure` : "starts workloads after migration success"}`, (t) => {
    const directory = temporary(t);
    fs.copyFileSync(
      path.join(root, "deploy/compose-platforms/upgrade.sh"),
      path.join(directory, "upgrade.sh"),
    );
    fs.writeFileSync(
      path.join(directory, "docker"),
      `#!/bin/sh\nprintf '%s\\n' "$*" >> "$CALL_LOG"\ncase "$*" in\n  *" pull") [ "$FAILURE" != pull ] || exit 31;;\n  *"run --rm --no-deps migrator") [ "$FAILURE" != migrator ] || exit 32;;\nesac\n`,
      { mode: 0o755 },
    );
    const posixDirectory = directory
      .replaceAll("\\", "/")
      .replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);
    const result = spawnSync(
      shell,
      ["-c", 'export PATH="$TEST_BIN:$PATH"; sh "$TEST_BIN/upgrade.sh"'],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          TEST_BIN: posixDirectory,
          CALL_LOG: `${posixDirectory}/calls`,
          FAILURE: failure,
        },
      },
    );
    assert.ifError(result.error);
    assert.equal(
      result.status,
      failure === "pull" ? 31 : failure === "migrator" ? 32 : 0,
      result.stderr,
    );
    const calls = fs.readFileSync(path.join(directory, "calls"), "utf8");
    if (failure === "pull") assert.ok(!calls.includes(" stop "));
    if (failure) assert.ok(!calls.includes("--no-deps --wait api worker web"));
    else
      assert.ok(
        calls.indexOf("run --rm --no-deps migrator") <
          calls.indexOf("--no-deps --wait api worker web"),
      );
  });
}
