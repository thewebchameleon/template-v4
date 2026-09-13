import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
const require = createRequire(
  new URL("../src/TemplateV4.Angular/package.json", import.meta.url),
);
const ts = require("typescript");
const rx = require("rxjs");

function load(relative, dependencies) {
  const source = readFileSync(
    new URL("../src/TemplateV4.Angular/src/app/" + relative, import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (id) => {
      if (!(id in dependencies)) throw new Error(id);
      return dependencies[id];
    },
    URL,
    location: { origin: "https://app.test" },
  });
  return exports;
}

for (const switched of [false, true])
  test(`401 mutation retry ${switched ? "rejects a different user" : "preserves the original user and payload"}`, async () => {
    let access = { userId: "A", accessToken: "old" };
    const auth = {
      access: () => access,
      refresh: async () => {
        access = { userId: switched ? "B" : "A", accessToken: "new" };
        return true;
      },
    };
    const Auth = Symbol(),
      Runtime = Symbol(),
      I18n = Symbol();
    const injection = new Map([
      [Auth, auth],
      [Runtime, { apiUrl: "" }],
      [I18n, { culture: () => "en-ZA" }],
    ]);
    const core = {
      Injectable: () => (value) => value,
      signal: () => {},
      inject: (token) => injection.get(token),
    };
    const { authInterceptor } = load("core/interceptors.ts", {
      "@angular/core": core,
      "@angular/common/http": {
        HttpContextToken: class {
          constructor(factory) {
            this.factory = factory;
          }
        },
      },
      rxjs: rx,
      "./auth": { Auth },
      "./runtime": { Runtime },
      "./i18n": { I18n },
      "./notifications": {},
    });
    const payload = new Uint8Array([1, 2, 3]);
    const request = {
      url: "/api/v1/auth/files/upload",
      body: payload,
      context: { get: () => "" },
      clone(options) {
        return { ...this, headers: options.setHeaders };
      },
    };
    const sent = [];
    const error = { status: 401, error: { code: "http.401" } };
    const result = rx.firstValueFrom(
      authInterceptor(request, (outgoing) => {
        sent.push(outgoing);
        return sent.length === 1 ? rx.throwError(() => error) : rx.of("saved");
      }),
    );
    if (switched) {
      await assert.rejects(result, (e) => e === error);
      assert.equal(sent.length, 1);
    } else {
      assert.equal(await result, "saved");
      assert.equal(sent.length, 2);
      assert.equal(sent[1].body, payload);
      assert.equal(sent[1].headers.Authorization, "Bearer new");
    }
  });

test("entity navigation replaces components while query-only navigation preserves them", () => {
  const { EntityRouteReuseStrategy } = load("core/entity-route-reuse.ts", {
    "@angular/core": { Injectable: () => (value) => value },
    "@angular/router": {
      BaseRouteReuseStrategy: class {
        shouldReuseRoute(a, b) {
          return a.routeConfig === b.routeConfig;
        }
      },
    },
  });
  const strategy = new EntityRouteReuseStrategy();
  const config = {};
  const route = (id, page) => ({
    routeConfig: config,
    paramMap: { keys: ["id"], get: () => id },
    queryParams: { page },
  });
  assert.equal(strategy.shouldReuseRoute(route("B", 1), route("A", 1)), false);
  assert.equal(strategy.shouldReuseRoute(route("A", 2), route("A", 1)), true);
});
