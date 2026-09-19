import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyLicense, validateCompose } from "./deployment-client.mjs";

test("signed license cannot be reused for another deployment or extended past 24 hours", () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const now = Date.now();
  const configuration = {
    DeploymentId: "deployment",
    OrganizationId: "organization",
    PublicKey: publicKey,
  };
  const payload = JSON.stringify({
    schemaVersion: 1,
    deploymentId: "deployment",
    organizationId: "organization",
    issuedAt: new Date(now).toISOString(),
    validUntil: new Date(now + 86400000).toISOString(),
  });
  const signed = {
    payload,
    signature: crypto
      .sign("sha256", Buffer.from(payload), {
        key: privateKey,
        dsaEncoding: "ieee-p1363",
      })
      .toString("base64"),
  };
  assert.equal(
    verifyLicense(signed, configuration, now).deploymentId,
    "deployment",
  );
  assert.throws(() =>
    verifyLicense(signed, { ...configuration, DeploymentId: "another" }, now),
  );
  assert.throws(() => verifyLicense(signed, configuration, now + 86400000));
  assert.throws(() =>
    verifyLicense({ ...signed, payload: payload + " " }, configuration, now),
  );
});
test("coordinated deployment requires immutable workload images", () => {
  const image = "registry.example/app@sha256:" + "a".repeat(64);
  const services = Object.fromEntries(
    ["api", "worker", "web", "migrator", "postgres"].map((name) => [
      name,
      { image },
    ]),
  );
  assert.deepEqual(validateCompose({ services }), [
    "api",
    "worker",
    "web",
  ]);
  services.worker.image = "registry.example/worker:latest";
  assert.throws(() => validateCompose({ services }));
});
