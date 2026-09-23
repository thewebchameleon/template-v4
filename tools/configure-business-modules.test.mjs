import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scaffoldBusiness } from "./scaffold-business.mjs";

const repository = path.resolve(import.meta.dirname, "..");
function fixture(t) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "templatev4-module-menu-"),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const folder of [
    "tools/releases",
    "modules",
    "src/TemplateV4.Angular/src",
  ])
    fs.mkdirSync(path.join(root, folder), { recursive: true });
  for (const file of [
    "tools/configure-business-modules.ps1",
    "tools/select-business-modules.mjs",
    "tools/discover-business-modules.mjs",
    "tools/modules.mjs",
    "tools/client-modules.mjs",
    "tools/releases/contracts.mjs",
    "tools/releases/installed.mjs",
    "modules/catalog.json",
    "framework.json",
  ])
    fs.copyFileSync(path.join(repository, file), path.join(root, file));
  scaffoldBusiness(root, "Reports");
  scaffoldBusiness(root, "Accounting");
  return root;
}
function run(root, answers, failBuild = false) {
  return spawnSync(
    "pwsh",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `
    $global:menuAnswers = [Collections.Generic.Queue[string]]::new()
    foreach ($answer in (ConvertFrom-Json $env:MENU_ANSWERS)) { $global:menuAnswers.Enqueue([string]$answer) }
    function global:Read-Host { param([string]$Prompt) if ($global:menuAnswers.Count -eq 0) { throw 'Unexpected prompt' }; return $global:menuAnswers.Dequeue() }
    function global:dotnet { Add-Content -LiteralPath $env:MENU_LOG -Value ('dotnet ' + ($args -join ' ')); $global:LASTEXITCODE = if ($env:MENU_FAIL -eq '1') { 7 } else { 0 } }
    function global:npm { Add-Content -LiteralPath $env:MENU_LOG -Value ('npm ' + ($args -join ' ')); $global:LASTEXITCODE = 0 }
    & (Join-Path $env:MENU_ROOT 'tools/configure-business-modules.ps1')
  `,
    ],
    {
      encoding: "utf8",
      timeout: 20000,
      env: {
        ...process.env,
        MENU_ROOT: root,
        MENU_ANSWERS: JSON.stringify(answers),
        MENU_LOG: path.join(root, "commands.log"),
        MENU_FAIL: failBuild ? "1" : "0",
      },
    },
  );
}
test("multi-select saves, offers build, and removal preserves module data and source", (t) => {
  const root = fixture(t);
  fs.writeFileSync(
    path.join(root, "client-modules.json"),
    JSON.stringify({
      schemaVersion: 1,
      foundation: { support: false },
      privateModules: [],
    }),
  );
  const data = path.join(root, "modules/Private/reports/retained-data.txt");
  fs.writeFileSync(data, "retained");
  let result = run(root, ["1,2", "y", "y"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(root, "client-modules.json")))
      .foundation,
    { support: false },
  );
  assert.equal(
    fs.readFileSync(path.join(root, "business-modules.enabled"), "utf8"),
    "accounting\nreports\n",
  );
  assert.deepEqual(
    fs
      .readFileSync(path.join(root, "commands.log"), "utf8")
      .trim()
      .split(/\r?\n/),
    [
      "dotnet restore src/TemplateV4.slnx",
      "npm ci --prefix src/TemplateV4.Angular",
      "npm ci --prefix documentation",
      "dotnet build src/TemplateV4.slnx -c Release --no-restore",
      "npm run build --prefix src/TemplateV4.Angular",
    ],
  );
  result = run(root, ["none", "y", "n"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(
    fs.readFileSync(path.join(root, "business-modules.enabled"), "utf8"),
    "",
  );
  assert.equal(fs.readFileSync(data, "utf8"), "retained");
  assert.ok(
    fs.existsSync(path.join(root, "modules/Private/reports/module.json")),
  );
  result = run(root, ["2", "y", "n"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(
    fs.readFileSync(path.join(root, "business-modules.enabled"), "utf8"),
    "reports\n",
  );
});
test("invalid choices and missing dependencies preserve selection; quit changes nothing", (t) => {
  const root = fixture(t);
  const descriptor = path.join(root, "modules/Private/reports/module.json");
  const module = JSON.parse(fs.readFileSync(descriptor));
  fs.writeFileSync(
    descriptor,
    JSON.stringify({ ...module, dependencies: ["accounting"] }),
  );
  fs.writeFileSync(
    path.join(root, "client-modules.json"),
    JSON.stringify({
      schemaVersion: 1,
      foundation: { support: false },
      privateModules: ["accounting"],
    }),
  );
  fs.writeFileSync(path.join(root, "business-modules.enabled"), "accounting\n");
  const result = run(root, ["99", "2", "y", "q"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Selection was not saved/);
  assert.equal(
    fs.readFileSync(path.join(root, "business-modules.enabled"), "utf8"),
    "accounting\n",
  );
  assert.ok(!fs.existsSync(path.join(root, "commands.log")));
});
test("restore failure stops remaining build commands and retains saved selection", (t) => {
  const root = fixture(t);
  const result = run(root, ["1", "y", "y"], true);
  assert.notEqual(result.status, 0);
  assert.equal(
    fs.readFileSync(path.join(root, "commands.log"), "utf8").trim(),
    "dotnet restore src/TemplateV4.slnx",
  );
  assert.equal(
    fs.readFileSync(path.join(root, "business-modules.enabled"), "utf8"),
    "accounting\n",
  );
});
