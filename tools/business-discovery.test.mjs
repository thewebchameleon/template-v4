import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { discover, backend, frontend } from "./discover-business-modules.mjs";
import { scaffoldBusiness } from "./scaffold-business.mjs";

const repository = path.resolve(import.meta.dirname, "..");
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
test("scaffold is discovered without host edits, and removal clears registration", (t) => {
  const root = fixture(t);
  assert.deepEqual(discover(root), []);
  scaffoldBusiness(root, "Reports");
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "reports\n");
  const modules = discover(root);
  assert.equal(modules[0].id, "reports");
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
  assert.match(frontend(modules), /reports\/frontend\/public-api/);
  fs.renameSync(
    path.join(root, "business-modules"),
    path.join(root, "removed-modules"),
  );
  assert.throws(() => discover(root), /missing/);
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "");
  assert.doesNotMatch(frontend(discover(root)), /reports/);
  assert.match(
    backend(discover(root), "TemplateV4.ApiService"),
    /Descriptors => \[\]/,
  );
});
test("rejects invalid entry points and dependency graphs before generating code", (t) => {
  const root = fixture(t);
  scaffoldBusiness(root, "Reports");
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "reports\n");
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
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "reports\n");
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
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "");
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
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "reports\r\n");
  assert.deepEqual(
    discover(root).map((module) => module.id),
    ["reports"],
  );
  assert.doesNotMatch(frontend(discover(root)), /excluded/);
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "../reports\n");
  assert.throws(() => discover(root), /unique module IDs/);
  fs.writeFileSync(
    path.join(root, "business-modules.enabled"),
    "reports\nreports\n",
  );
  assert.throws(() => discover(root), /unique module IDs/);
  const file = path.join(root, "business-modules/reports/module.json");
  const descriptor = JSON.parse(fs.readFileSync(file));
  fs.writeFileSync(
    file,
    JSON.stringify({ ...descriptor, dependencies: ["excluded"] }),
  );
  assert.throws(() => discover(root, ["reports"]), /Unknown dependency/);
  assert.equal(discover(root, ["reports", "excluded"]).length, 2);
});
