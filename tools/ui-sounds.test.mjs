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

function loginHarness(method, outcome) {
  const played = [];
  const navigated = [];
  const auth = {
    access: signal(null),
    challenge: signal(method.includes("mfa") ? "challenge" : null),
    preferredMfaMethod: () => "Email",
    emailResendAt: () => null,
    landing: () => "/dashboard",
  };
  const authenticate = async () => {
    if (outcome === "failed") throw Error("Sign-in failed or cancelled");
    if (outcome === "pending") auth.challenge.set("challenge");
    else {
      auth.challenge.set(null);
      auth.access.set({ setupRequired: false });
    }
  };
  auth.login = authenticate;
  auth.completeMfa = authenticate;
  const dependencies = Object.fromEntries(
    [
      "@angular/forms",
      "@ng-icons/lucide",
      "@spartan-ng/brain/input-otp",
      "@spartan-ng/helm/button",
      "@spartan-ng/helm/input",
      "@spartan-ng/helm/input-otp",
      "@spartan-ng/helm/field",
      "@spartan-ng/helm/checkbox",
      "@spartan-ng/helm/spinner",
      "@spartan-ng/helm/dialog",
      "./auth-layout",
      "../core/i18n",
    ].map((name) => [name, {}]),
  );
  const injection = {
    auth,
    passkeys: { login: authenticate, completeMfa: authenticate },
    sounds: { play: (cue) => played.push(cue) },
    notifications: {
      success: () => assert.fail("Sign-in must not add a duplicate toast"),
    },
    registration: { status: async () => ({ enabled: true }) },
    router: {
      navigateByUrl: async (url) => {
        navigated.push(url);
        return true;
      },
    },
    route: { snapshot: { queryParamMap: { get: () => null } } },
  };
  Object.assign(dependencies, {
    "@angular/core": {
      Component: () => (value) => value,
      signal,
      inject: (token) => injection[token],
    },
    "@ng-icons/core": { provideIcons: () => ({}) },
    "@angular/router": { Router: "router", ActivatedRoute: "route" },
    "../core/auth": { Auth: "auth" },
    "../core/passkeys": { Passkeys: "passkeys" },
    "../core/registration": { Registration: "registration" },
    "../core/notifications": { Notifications: "notifications" },
    "../core/ui-sounds": { UiSounds: "sounds" },
  });
  const { LoginPage } = load("../features/login", dependencies);
  return { page: new LoginPage(), auth, played, navigated };
}

for (const method of ["password", "mfa", "passkey", "passkey-mfa"]) {
  for (const outcome of ["success", "failed"]) {
    test(`${method} sign-in plays success only when authentication succeeds (${outcome})`, async () => {
      const h = loginHarness(method, outcome);
      if (method.startsWith("passkey")) await h.page.passkey();
      else await h.page.submit();
      assert.deepEqual(h.played, outcome === "success" ? ["success"] : []);
      assert.deepEqual(
        h.navigated,
        outcome === "success" ? ["/dashboard"] : [],
      );
      assert.equal(h.page.busy(), false);
    });
  }
}

test("pending MFA and rendering a restored session do not play login success", async () => {
  const h = loginHarness("password", "pending");
  await h.page.submit();
  assert.deepEqual(h.played, []);
  assert.deepEqual(h.navigated, []);
  h.auth.access.set({ setupRequired: false });
  await h.page.ngOnInit();
  assert.deepEqual(h.played, []);
});

for (const outcome of ["success", "failed"]) {
  test(`sign-out plays complete only when logout succeeds (${outcome})`, async () => {
    const played = [];
    const http = {
      get: () => rx.of({ token: "csrf" }),
      post: () =>
        outcome === "success"
          ? rx.of(undefined)
          : rx.throwError(() => Error("Sign-out failed")),
    };
    const injection = {
      http,
      router: {},
      runtime: { apiUrl: "" },
      i18n: {},
      sounds: { play: (cue) => played.push(cue) },
    };
    const { Auth } = load(
      "auth",
      {
        "@angular/core": {
          Injectable: () => (value) => value,
          inject: (token) => injection[token],
          signal,
        },
        "@angular/common/http": {
          HttpClient: "http",
          HttpErrorResponse: class {},
        },
        "@angular/router": { Router: "router" },
        rxjs: rx,
        "./runtime": { Runtime: "runtime" },
        "./i18n": { I18n: "i18n" },
        "./ui-sounds": { UiSounds: "sounds" },
      },
      { navigator: {}, location: { assign: () => {} } },
    );
    const auth = new Auth();
    auth.access.set({ userId: "user" });

    if (outcome === "success") await auth.logout();
    else await assert.rejects(auth.logout(), /Sign-out failed/);

    assert.deepEqual(played, outcome === "success" ? ["complete"] : []);
  });
}

const signal = (initial) => {
  let value = initial;
  const read = () => value;
  read.set = (next) => {
    value = next;
  };
  read.asReadonly = () => read;
  return read;
};
function load(name, dependencies, globals = {}) {
  const source = readFileSync(
    new URL(
      `../src/TemplateV4.Angular/src/app/core/${name}.ts`,
      import.meta.url,
    ),
    "utf8",
  );
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        experimentalDecorators: true,
      },
    }).outputText,
    {
      exports,
      require: (id) => {
        assert.ok(id in dependencies, id);
        return dependencies[id];
      },
      ...globals,
    },
  );
  return exports;
}
function soundHarness(saved = null, blocked = false) {
  const listeners = new Map();
  const destroyed = [];
  const played = [];
  const settings = {};
  let state;
  let failAudio = false;
  const storage = {
    getItem: () => {
      if (blocked) throw Error("blocked");
      return saved;
    },
    setItem: (_, value) => {
      if (blocked) throw Error("blocked");
      saved = value;
    },
    removeItem: () => {
      if (blocked) throw Error("blocked");
      saved = null;
    },
  };
  const surface = {
    visibilityState: "visible",
    localStorage: storage,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const { UiSounds } = load(
    "ui-sounds",
    {
      "@angular/common": { DOCUMENT: "document" },
      "@angular/core": {
        Injectable: () => (value) => value,
        signal,
        DestroyRef: "destroy",
        inject: (token) =>
          token === "document"
            ? surface
            : { onDestroy: (callback) => destroyed.push(callback) },
      },
      "@foleyjs/core": {
        set: (value) => Object.assign(settings, value),
        unlock: () => {
          if (failAudio) throw Error("unsupported");
          state = "running";
        },
        getAnalyser: () => (state ? { context: { state } } : null),
        play: (cue) => {
          if (failAudio) throw Error("failed");
          played.push(cue);
        },
      },
    },
    { window: surface, localStorage: storage },
  );
  const sounds = new UiSounds();
  return {
    sounds,
    played,
    settings,
    listeners,
    surface,
    storage,
    saved: () => saved,
    gesture: () => listeners.get("pointerdown")({ isTrusted: true }),
    suspend: () => {
      state = "suspended";
    },
    fail: () => {
      failAudio = true;
    },
    destroy: () => destroyed.forEach((callback) => callback()),
  };
}

test("default sounds wait for a gesture and discard hidden or suspended feedback", () => {
  const h = soundHarness();
  assert.equal(h.sounds.muted(), false);
  h.sounds.play("success");
  h.listeners.get("pointerdown")({ isTrusted: false });
  h.sounds.play("error");
  assert.deepEqual(h.played, []);
  h.gesture();
  h.sounds.play("success");
  h.surface.visibilityState = "hidden";
  h.sounds.play("ping");
  h.surface.visibilityState = "visible";
  h.suspend();
  h.sounds.play("error");
  h.gesture();
  assert.deepEqual(h.played, ["success"]);
  h.sounds.play("complete");
  assert.deepEqual(h.played, ["success", "complete"]);
  h.destroy();
  assert.equal(h.listeners.size, 0);
});

test("mute persists, synchronizes only local storage, and resets to enabled", () => {
  const h = soundHarness("true");
  h.gesture();
  h.sounds.play("success");
  assert.deepEqual(h.played, []);
  assert.equal(h.settings.muted, true);
  h.sounds.setMuted(false);
  assert.equal(h.saved(), "false");
  h.gesture();
  h.sounds.play("on");
  const sync = (storageArea, key, newValue) =>
    h.listeners.get("storage")({ storageArea, key, newValue });
  sync({}, "templatev4-sound-muted", "true");
  assert.equal(h.sounds.muted(), false);
  sync(h.storage, "unrelated", "true");
  assert.equal(h.sounds.muted(), false);
  sync(h.storage, "templatev4-sound-muted", "true");
  h.sounds.play("error");
  assert.deepEqual(h.played, ["on"]);
  sync(h.storage, null, null);
  assert.equal(h.sounds.muted(), false);
  h.sounds.setMuted(true);
  h.sounds.reset();
  assert.equal(h.sounds.muted(), false);
  assert.equal(h.settings.muted, false);
  assert.equal(h.saved(), null);
});

test("blocked storage and unavailable audio do not break actions or mute", () => {
  const h = soundHarness(null, true);
  h.sounds.setMuted(true);
  assert.equal(h.sounds.muted(), true);
  h.sounds.reset();
  h.gesture();
  h.fail();
  assert.doesNotThrow(() => h.gesture());
  assert.doesNotThrow(() => h.sounds.play("success"));
});

test("unread summary sounds only after a baseline and an accepted increase", async () => {
  const played = [];
  let actor = "A";
  let unread = 4;
  const effects = [];
  const summary = new rx.Subject();
  let delayed = false;
  const injection = {
    auth: { access: () => (actor ? { userId: actor } : null) },
    http: { get: () => (delayed ? summary : rx.of({ unread })) },
    runtime: { apiUrl: "" },
    sounds: { play: (cue) => played.push(cue) },
    destroy: { onDestroy: () => {} },
  };
  const { UnreadNotifications } = load(
    "unread-notifications",
    {
      "@angular/core": {
        Injectable: () => (value) => value,
        signal,
        computed: (fn) => fn,
        effect: (fn) => effects.push(fn),
        untracked: (fn) => fn(),
        inject: (token) => injection[token],
        DestroyRef: "destroy",
      },
      "@angular/common/http": {
        HttpClient: "http",
        HttpContext: class {
          set() {
            return this;
          }
        },
      },
      rxjs: rx,
      "./auth": { Auth: "auth" },
      "./runtime": { Runtime: "runtime" },
      "./ui-sounds": { UiSounds: "sounds" },
      "./interceptors": { QUIET_REQUEST: "quiet" },
    },
    {
      document: { visibilityState: "visible" },
      setInterval: () => 1,
      clearInterval: () => {},
      queueMicrotask,
    },
  );
  const notifications = new UnreadNotifications();
  await notifications.refresh(true);
  assert.deepEqual(played, []);
  await notifications.refresh(true);
  unread = 3;
  await notifications.refresh(true);
  assert.deepEqual(played, []);
  unread = 5;
  await notifications.refresh(true);
  assert.deepEqual(played, ["ping"]);
  delayed = true;
  const pending = notifications.refresh(true);
  notifications.set(0); // A drawer mutation invalidates the in-flight summary.
  summary.next({ unread: 8 });
  await pending;
  assert.equal(notifications.count(), 0);
  assert.deepEqual(played, ["ping"]);
  actor = null;
  effects[0]();
  actor = "B";
  delayed = false;
  unread = 10;
  await notifications.refresh(true);
  assert.equal(notifications.count(), 10);
  assert.deepEqual(played, ["ping"]);
});
