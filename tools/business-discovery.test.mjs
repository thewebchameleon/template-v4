import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { discover, backend, frontend } from "./discover-business-modules.mjs";
import { scaffoldBusiness } from "./scaffold-business.mjs";
import {
  readClientModules,
  checkGeneratedSelection,
} from "./client-modules.mjs";

const repository = path.resolve(import.meta.dirname, "..");
test("client settings reject core overrides, unavailable prerequisites and stale generated selection", (t) => {
  const root = fixture(t);
  scaffoldBusiness(root, "Reports");
  const file = path.join(root, "client-modules.json");
  const save = (foundation) =>
    fs.writeFileSync(
      file,
      JSON.stringify({
        schemaVersion: 1,
        foundation,
        privateModules: ["reports"],
      }),
    );
  save({ identity: false });
  assert.throws(() => readClientModules(root), /optional foundation/);
  save({ crm: false, invoicing: false });
  assert.throws(() => discover(root), /requires crm/);
  save({ support: false });
  const modules = discover(root);
  const generated = backend(
    modules,
    "TemplateV4.ApiService",
    readClientModules(root).foundation,
  );
  assert.match(generated, /ClientModules:support/);
  assert.match(generated, /Category: "private"/);
  assert.throws(() => checkGeneratedSelection(root, ["reports"]), /Stale/);
});
function select(root, ids) {
  fs.writeFileSync(
    path.join(root, "client-modules.json"),
    JSON.stringify({ schemaVersion: 1, foundation: {}, privateModules: ids }),
  );
  fs.writeFileSync(
    path.join(root, "business-modules.enabled"),
    ids.length ? ids.join("\n") + "\n" : "",
  );
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "templatev4-discovery-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "modules"));
  fs.copyFileSync(
    path.join(repository, "modules/catalog.json"),
    path.join(root, "modules/catalog.json"),
  );
  return root;
}

test("frontend directory casing is validated even on case-insensitive filesystems", (t) => {
  const root = fixture(t);
  scaffoldBusiness(root, "Reports");
  select(root, ["reports"]);
  const folder = path.join(root, "business-modules/reports");
  fs.renameSync(path.join(folder, "Frontend"), path.join(folder, "temporary-frontend"));
  fs.renameSync(path.join(folder, "temporary-frontend"), path.join(folder, "frontend"));
  assert.throws(() => discover(root), /Missing frontend entry point/);
});
test("scaffold is discovered without host edits, and removal clears registration", (t) => {
  const root = fixture(t);
  assert.deepEqual(discover(root), []);
  scaffoldBusiness(root, "Reports");
  select(root, ["reports"]);
  const modules = discover(root);
  assert.equal(modules[0].id, "reports");
  assert.ok(fs.existsSync(path.join(root, "business-modules/reports/Tests/README.md")));
  assert.ok(fs.existsSync(path.join(root, "business-modules/reports/Docs/README.md")));
  assert.equal(modules[0].enabledByDefault, false);
  assert.match(
    backend(modules, "TemplateV4.ApiService"),
    /new\("reports", false, true/,
  );
  assert.match(
    backend(modules, "TemplateV4.ApiService"),
    /Reports.Api.ModuleHost.Map\(app\)/,
  );
  assert.match(
    backend(modules, "TemplateV4.DatabaseMigrator"),
    /Reports.Infrastructure.ModuleServices.Register/,
  );
  assert.match(
    backend(modules, "TemplateV4.DatabaseMigrator"),
    /Microsoft.Extensions.Hosting.IHostApplicationBuilder/,
  );
  assert.match(frontend(modules), /reports\/Frontend\/public-api/);
  fs.renameSync(
    path.join(root, "business-modules"),
    path.join(root, "removed-modules"),
  );
  assert.throws(() => discover(root), /missing/);
  select(root, []);
  assert.doesNotMatch(frontend(discover(root)), /reports/);
  assert.match(
    backend(discover(root), "TemplateV4.ApiService"),
    /Descriptors => \[\]/,
  );
});
test("rejects invalid entry points and dependency graphs before generating code", (t) => {
  const root = fixture(t);
  scaffoldBusiness(root, "Reports");
  select(root, ["reports"]);
  const file = path.join(root, "business-modules/reports/module.json");
  const descriptor = JSON.parse(fs.readFileSync(file));
  fs.writeFileSync(
    file,
    JSON.stringify({
      ...descriptor,
      host: { ...descriptor.host, map: "Injected();" },
    }),
  );
  assert.throws(() => discover(root), /entry points/);
  fs.writeFileSync(
    file,
    JSON.stringify({ ...descriptor, dependencies: ["missing"] }),
  );
  assert.throws(() => discover(root), /Unknown dependency/);
  fs.writeFileSync(
    file,
    JSON.stringify({ ...descriptor, enabledByDefault: true }),
  );
  assert.throws(() => discover(root), /initially disabled/);
});
test("MSBuild discovers project references at evaluation, before restore", (t) => {
  const root = fixture(t);
  fs.copyFileSync(
    path.join(repository, "Directory.Build.targets"),
    path.join(root, "Directory.Build.targets"),
  );
  scaffoldBusiness(root, "Reports");
  scaffoldBusiness(root, "Excluded");
  select(root, ["reports"]);
  const project = path.join(root, "TemplateV4.ApiService.csproj");
  fs.writeFileSync(
    project,
    '<Project><Import Project="Directory.Build.targets"/></Project>',
  );
  const result = spawnSync(
    "dotnet",
    ["msbuild", project, "-getItem:ProjectReference"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const references = JSON.parse(result.stdout).Items.ProjectReference;
  assert.equal(references.length, 1);
  assert.match(references[0].Identity, /Reports.Api.csproj$/);
  select(root, []);
  const empty = spawnSync(
    "dotnet",
    ["msbuild", project, "-getItem:ProjectReference"],
    { encoding: "utf8" },
  );
  assert.equal(empty.status, 0, empty.stdout + empty.stderr);
  assert.deepEqual(JSON.parse(empty.stdout).Items.ProjectReference, []);
});

test("selection is explicit, bounded, and rejects missing dependencies", (t) => {
  const root = fixture(t);
  scaffoldBusiness(root, "Reports");
  scaffoldBusiness(root, "Excluded");
  assert.deepEqual(discover(root), []);
  select(root, ["reports"]);
  assert.deepEqual(
    discover(root).map((module) => module.id),
    ["reports"],
  );
  assert.doesNotMatch(frontend(discover(root)), /excluded/);
  select(root, ["../reports"]);
  assert.throws(() => discover(root), /unique privateModules IDs/);
  select(root, ["reports", "reports"]);
  assert.throws(() => discover(root), /unique privateModules IDs/);
  select(root, ["reports"]);
  const file = path.join(root, "business-modules/reports/module.json");
  const descriptor = JSON.parse(fs.readFileSync(file));
  fs.writeFileSync(
    file,
    JSON.stringify({ ...descriptor, dependencies: ["excluded"] }),
  );
  assert.throws(() => discover(root, ["reports"]), /Unknown dependency/);
  assert.equal(discover(root, ["reports", "excluded"]).length, 2);
});
