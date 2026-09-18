import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(
  new URL("../src/TemplateV4.Angular/package.json", import.meta.url),
);
const ts = require("typescript");

function destinations() {
  const dependencies = {
    "@angular/core": { inject: () => ({}) },
    "@angular/router": {},
    "./auth": {},
    "./features": {},
  };
  const exports = {};
  const source = readFileSync(
    new URL(
      "../src/TemplateV4.Angular/src/app/core/destinations.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, name);
      return dependencies[name];
    },
  });
  return exports;
}

test("disabled Support is hidden from Administration while its settings route stays accessible", () => {
  const {
    administrationDestinations,
    destinationAvailable,
    destinationVisibleInNavigation,
  } = destinations();
  const auth = {
    access: () => ({ isAdministrator: true }),
    has: (permission) => permission === "settings.manage",
  };
  const disabledFeatures = { enabled: () => false };
  const enabledFeatures = { enabled: (capability) => capability === "support" };

  assert.equal(
    destinationAvailable(
      administrationDestinations.supportSettings,
      auth,
      disabledFeatures,
    ),
    true,
  );
  assert.equal(
    destinationVisibleInNavigation(
      administrationDestinations.supportSettings,
      auth,
      disabledFeatures,
    ),
    false,
  );
  assert.equal(
    destinationVisibleInNavigation(
      administrationDestinations.supportSettings,
      auth,
      enabledFeatures,
    ),
    true,
  );
});
