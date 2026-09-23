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
const signal = (value) =>
  Object.assign(() => value, {
    set: (next) => {
      value = next;
    },
  });

function harness(file, setupRequired = true, returnUrl = "/me") {
  const navigated = [];
  const calls = [];
  const auth = {
    access: signal({ setupRequired }),
    landing: () =>
      auth.access()?.setupRequired ? "/login/setup" : "/dashboard",
    refresh: async () => {
      auth.access.set({ setupRequired: false });
      return true;
    },
    action: async (path, body) => {
      if (path === "mfa/enroll") assert.equal(body.password, "");
      calls.push(path);
      return path === "mfa/confirm"
        ? ["recovery-code"]
        : { key: "setup-key", uri: "otpauth://totp/example" };
    },
    logout: async () => {
      auth.access.set(null);
    },
  };
  const injection = {
    Auth: auth,
    HttpClient: { get: () => rx.of({ mfaEnabled: false }) },
    Runtime: { apiUrl: "" },
    Passkeys: {
      supported: true,
      register: async (proof, name) => {
        assert.equal(proof.password, "");
        assert.equal(name, undefined);
        calls.push("passkeys/register");
      },
    },
    Router: {
      createUrlTree: (paths, options) => ({
        path: paths[0],
        returnUrl: options?.queryParams?.returnUrl,
      }),
      navigateByUrl: async (url) => {
        navigated.push(url);
      },
      navigate: async (paths, options) => {
        navigated.push({
          path: paths[0],
          returnUrl: options?.queryParams?.returnUrl,
        });
      },
    },
    ActivatedRoute: { snapshot: { queryParamMap: { get: () => returnUrl } } },
    DomSanitizer: { bypassSecurityTrustHtml: (value) => value },
  };
  const exports = {};
  const source = readFileSync(
    new URL("../src/TemplateV4.Angular/src/app/" + file, import.meta.url),
    "utf8",
  );
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
        if (id === "@angular/core")
          return {
            signal,
            Component: () => (value) => value,
            Injectable: () => (value) => value,
            inject: (token) =>
              injection[typeof token === "function" ? token.name : token],
          };
        if (id === "rxjs") return rx;
        if (id === "qrcode")
          return { toString: async () => '<svg aria-hidden="true"></svg>' };
        if (id === "@angular/platform-browser")
          return { DomSanitizer: "DomSanitizer", SafeHtml: "SafeHtml" };
        if (id === "@angular/common/http")
          return {
            HttpClient: "HttpClient",
            HttpErrorResponse: class extends Error {},
          };
        return new Proxy({}, { get: (_, key) => key });
      },
    },
  );
  return { exports, auth, injection, navigated, calls };
}

test("setup presents two generated-name factor choices separated by OR", () => {
  const source = readFileSync(
    new URL(
      "../src/TemplateV4.Angular/src/app/features/identity/authentication/mfa-setup.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /'enrollAuthenticator' \| t/);
  assert.match(
    source,
    /<hlm-field-separator>\{\{ 'or' \| t \}\}<\/hlm-field-separator>/,
  );
  assert.match(source, /'setupPasskey' \| t/);
  assert.match(source, /<brn-input-otp/);
  assert.match(
    source,
    /<hlm-input-otp-slot class="size-12 text-xl font-semibold" \[index\]="slot"/,
  );
  assert.match(
    source,
    /@if \(!enrollment\(\) && !configured\(\)\) \{\s*<div class="auth-heading">/,
  );
  assert.match(source, /flex flex-col items-center gap-0 text-center/);
  assert.match(source, /auth-fields items-center text-center/);
  assert.match(source, /auth-setup-panel-qr/);
  assert.match(source, /auth-setup-panel-manual/);
  assert.match(source, /@if \(passkeyBusy\(\)\) \{\s*<hlm-spinner \/>/);
  assert.match(source, /@if \(backToSignInBusy\(\)\) \{\s*<hlm-spinner \/>/);
  assert.match(
    source,
    /@if \(busy\(\) && !passkeyBusy\(\) && !backToSignInBusy\(\)\)/,
  );
  assert.doesNotMatch(source, /setup-passkey-name|\[\(ngModel\)\]="keyName"/);
});

test("auth pages use shared stagger motion and password recovery is a page", async () => {
  const layout = readFileSync(
    new URL(
      "../src/TemplateV4.Angular/src/app/features/identity/authentication/auth-layout.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const login = readFileSync(
    new URL(
      "../src/TemplateV4.Angular/src/app/features/identity/authentication/login.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const styles = readFileSync(
    new URL("../src/TemplateV4.Angular/src/design-tokens.css", import.meta.url),
    "utf8",
  );
  assert.match(layout, /auth-form auth-stagger/);
  assert.match(styles, /@keyframes auth-section-enter/);
  assert.match(styles, /prefers-reduced-motion: no-preference/);
  assert.match(login, /routerLink="\/forgot-password"/);
  assert.doesNotMatch(login, /hlm-dialog|forgotDialogState/);

  const h = harness("features/identity/authentication/forgot-password.ts");
  const page = new h.exports.ForgotPasswordPage();
  page.email = "person@example.test";
  await page.submit();
  assert.equal(page.sent(), true);
  assert.equal(page.email, "");
  assert.ok(h.calls.includes("forgot-password"));
});

test("required setup guards redirect protected routes and restore setup-only sessions", async () => {
  const h = harness("core/auth.ts");
  assert.equal(h.exports.Auth.prototype.landing.call(h.auth), "/login/setup");
  const redirect = await h.exports.authGuard({}, { url: "/me?tab=profile" });
  assert.equal(redirect.path, "/login/setup");
  assert.equal(redirect.returnUrl, "/me?tab=profile");
  h.auth.access.set(null);
  h.auth.refresh = async () => {
    h.auth.access.set({ setupRequired: true });
    return true;
  };
  assert.equal(await h.exports.authGuard({}, { url: "/login/setup" }), true);
  assert.equal(h.exports.mfaSetupGuard(), true);
  h.auth.access.set({ setupRequired: false });
  assert.equal(h.exports.mfaSetupGuard().path, "/dashboard");
  assert.equal(await h.exports.authGuard({}, { url: "/me" }), true);
});

async function setupHarness(returnUrl) {
  const h = harness(
    "features/identity/authentication/mfa-setup.ts",
    true,
    returnUrl,
  );
  h.page = new h.exports.MfaSetupPage();
  await new Promise((resolve) => setImmediate(resolve));
  return h;
}

test("authenticator confirmation retains recovery codes until acknowledgement and then returns to the requested page", async () => {
  const h = await setupHarness("/me?tab=profile");
  await h.page.enroll();
  assert.equal(h.page.qrSvg(), '<svg aria-hidden="true"></svg>');
  assert.equal(h.page.manualSetup(), false);
  await h.page.confirm();
  assert.equal(h.page.codes()[0], "recovery-code");
  assert.equal(h.page.hasUnsavedChanges(), true);
  assert.deepEqual(h.navigated, []);
  await h.page.finish();
  assert.equal(h.page.codes().length, 0);
  assert.equal(h.page.hasUnsavedChanges(), false);
  assert.deepEqual(h.navigated, ["/me?tab=profile"]);
});

test("setup cannot continue before enrollment or while the server still requires setup", async () => {
  const h = await setupHarness();
  await h.page.finish();
  assert.deepEqual(h.navigated, []);
  await h.page.register();
  h.auth.refresh = async () => true;
  await h.page.finish();
  assert.equal(h.page.configured(), false);
  assert.deepEqual(h.navigated, []);
});

test("failed confirmation preserves enrollment for retry", async () => {
  const h = await setupHarness();
  await h.page.enroll();
  h.auth.action = async () => {
    throw Error("invalid code");
  };
  await h.page.confirm();
  assert.equal(h.page.enrollment().key, "setup-key");
  assert.equal(h.page.configured(), false);
  assert.equal(h.page.busy(), false);
});

test("passkey completion rejects external and login return destinations", async () => {
  for (const target of [
    "https://example.com",
    "//example.com",
    "/login/setup",
  ]) {
    const h = await setupHarness(target);
    await h.page.register();
    await h.page.finish();
    assert.deepEqual(h.navigated, ["/dashboard"]);
  }
});

test("back to sign in discards setup state without a confirmation", async () => {
  const h = await setupHarness();
  await h.page.confirm();
  await h.page.signInAgain();
  assert.equal(h.auth.access(), null);
  assert.equal(h.page.codes().length, 0);
  assert.deepEqual(h.navigated, [{ path: "/login", returnUrl: "/me" }]);
});
