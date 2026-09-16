import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { validateLock, httpsUrl } from "./releases/contracts.mjs";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
export function components(lock) {
  return validateLock(lock).components.map((c) => ({
    id: c.id,
    version: c.version,
    digest: c.artifact?.sha256 ?? c.commit,
  }));
}
export function verifyLicense(signed, configuration, now = Date.now()) {
  if (
    typeof signed?.payload !== "string" ||
    signed.payload.length > 131072 ||
    typeof signed.signature !== "string" ||
    !crypto.verify(
      "sha256",
      Buffer.from(signed.payload),
      { key: configuration.PublicKey, dsaEncoding: "ieee-p1363" },
      Buffer.from(signed.signature, "base64"),
    )
  )
    throw new Error("Invalid license signature.");
  const license = JSON.parse(signed.payload);
  const issued = Date.parse(license.issuedAt),
    expires = Date.parse(license.validUntil);
  if (
    license.schemaVersion !== 1 ||
    license.deploymentId !== configuration.DeploymentId ||
    license.organizationId !== configuration.OrganizationId ||
    !Number.isFinite(issued) ||
    !Number.isFinite(expires) ||
    issued > now ||
    expires <= now ||
    expires > issued + 86400000
  )
    throw new Error("Expired or mismatched deployment license.");
  return license;
}
async function request(
  configuration,
  route,
  body,
  token = configuration.Token,
) {
  if (!httpsUrl(configuration.Url))
    throw new Error("A credential-free HTTPS central URL is required.");
  const response = await fetch(
    configuration.Url.replace(/\/$/, "") + "/api/v1/client-management/" + route,
    {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(30000),
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok)
    throw new Error(`Central request rejected (${response.status}).`);
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 262144) throw new Error("Central response too large.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function validateCompose(compose) {
  const services = compose.services;
  if (
    !services?.api ||
    !services.worker ||
    !services.migrator ||
    !services.postgres
  )
    throw new Error(
      "Coordinated API, Worker, Migrator and PostgreSQL services are required.",
    );
  const workloads = Object.keys(services).filter((name) =>
    ["api", "worker", "web", "website"].includes(name),
  );
  for (const name of [...workloads, "migrator"]) {
    if (
      services[name].build ||
      !/^.+@sha256:[a-f0-9]{64}$/.test(services[name].image ?? "")
    )
      throw new Error(`Pin ${name} to an immutable published image digest.`);
  }
  return workloads;
}
async function main() {
  const [command, configurationFile, ...args] = process.argv.slice(2);
  if (command === "init-central") {
    const [publisherTokenFile] = args;
    if (
      !configurationFile ||
      !publisherTokenFile ||
      fs.existsSync(configurationFile) ||
      fs.existsSync(publisherTokenFile)
    )
      throw new Error(
        "Provide two new private output files for central settings and the publisher token.",
      );
    const { privateKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "prime256v1",
    });
    const token = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(
      configurationFile,
      JSON.stringify(
        {
          ClientManagement: {
            SigningKey: privateKey.export({ type: "pkcs8", format: "pem" }),
            PublisherTokenHash: crypto
              .createHash("sha256")
              .update(token)
              .digest("hex"),
            PublisherModules: ["foundation"],
          },
        },
        null,
        2,
      ) + "\n",
      { flag: "wx", mode: 0o600 },
    );
    fs.writeFileSync(publisherTokenFile, token, { flag: "wx", mode: 0o600 });
    console.log(
      "Central settings and publisher credential saved privately. Configure allowed publisher module IDs before publication.",
    );
    return;
  }
  if (command === "enroll") {
    const [url] = args;
    const token = process.env.DEPLOYMENT_ENROLLMENT_TOKEN;
    if (!token)
      throw new Error(
        "Set DEPLOYMENT_ENROLLMENT_TOKEN without putting it in command arguments.",
      );
    if (
      fs.existsSync(configurationFile) ||
      fs.existsSync(configurationFile + ".runner.json")
    )
      throw new Error("Refusing to overwrite enrollment configuration.");
    const result = await request({ Url: url }, "enroll", { token }, null);
    const configuration = {
      Licensing: {
        Url: url,
        DeploymentId: result.deploymentId,
        OrganizationId: result.organizationId,
        Token: result.token,
        PublicKey: result.publicKey,
      },
      Updates: {
        Enabled: true,
        FeedUrl: url.replace(/\/$/, "") + "/api/v1/client-management",
        Token: result.token,
      },
    };
    fs.writeFileSync(
      configurationFile,
      JSON.stringify(configuration, null, 2) + "\n",
      { flag: "wx", mode: 0o600 },
    );
    fs.writeFileSync(
      configurationFile + ".runner.json",
      JSON.stringify(
        {
          Licensing: { ...configuration.Licensing, Token: result.runnerToken },
        },
        null,
        2,
      ) + "\n",
      { flag: "wx", mode: 0o600 },
    );
    console.log(
      "Enrollment saved. The application configuration and separate .runner.json credential must be kept private and supplied only to their respective processes.",
    );
    return;
  }
  const configuration = read(configurationFile).Licensing;
  if (!configuration?.Token) throw new Error("Missing deployment credential.");
  if (command === "check") {
    const [installedFile] = args;
    const signed = await request(configuration, "heartbeat", {
      components: components(read(installedFile)),
      health: "running",
    });
    const license = verifyLicense(signed, configuration);
    console.log(
      JSON.stringify({
        deploymentId: license.deploymentId,
        validUntil: license.validUntil,
      }),
    );
    return;
  }
  if (command !== "deploy")
    throw new Error(
      "Usage: enroll <new-config> <central-url> | check <config> <installed-lock> | deploy <config> <release-directory> <current-lock> [ISO-execution-time]",
    );
  const [directory, currentFile, scheduled] = args;
  if (process.platform === "win32")
    throw new Error(
      "VPS deployment execution requires Linux. Enrollment and checks also work on Windows.",
    );
  const root = path.resolve(directory);
  const deploymentLockId = crypto
    .createHash("sha256")
    .update(String(configuration.DeploymentId).toLowerCase())
    .digest("hex");
  const lockFile = path.join(
    os.tmpdir(),
    `templatev4-deployment-${deploymentLockId}.lock`,
  );
  const installedRecord = read(currentFile);
  const current = validateLock({
    schemaVersion: 1,
    channel: "stable",
    components: installedRecord.components,
  });
  const candidateFile = path.join(root, "release.json");
  const candidateBytes = fs.readFileSync(candidateFile);
  const release = JSON.parse(candidateBytes);
  const candidate = validateLock({
    schemaVersion: 1,
    channel: "stable",
    components: release.components,
  });
  const composeFile = path.join(root, "compose.yaml");
  const composeBytes = fs.readFileSync(composeFile);
  if (scheduled) {
    const at = Date.parse(scheduled);
    if (!Number.isFinite(at) || !/(Z|[+-]\d\d:\d\d)$/.test(scheduled))
      throw new Error("Schedule must be an ISO timestamp with time zone.");
    console.log("Waiting for the client-selected maintenance time.");
    while (Date.now() < at)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(30000, at - Date.now())),
      );
  }
  const lock = fs.openSync(lockFile, "wx", 0o600);
  fs.writeSync(
    lock,
    JSON.stringify({ pid: process.pid, at: new Date().toISOString() }),
  );
  fs.closeSync(lock);
  let changed = false;
  const docker = (argv, options = {}) => {
    const result = spawnSync(
      "docker",
      [
        "--host",
        "unix:///var/run/docker.sock",
        "compose",
        "-f",
        composeFile,
        ...argv,
      ],
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        ...options,
      },
    );
    if (result.status !== 0)
      throw new Error(
        `Compose ${argv[0]} failed; inspect the local service status. Credentials and container output are not included.`,
      );
    return result.stdout;
  };
  const preflight = async () => {
    if (
      !fs.readFileSync(candidateFile).equals(candidateBytes) ||
      !fs.readFileSync(composeFile).equals(composeBytes)
    )
      throw new Error("Deployment files changed after selection.");
    await request(configuration, "preflight", {
      expected: components(current),
      candidate,
    });
  };
  try {
    const composed = JSON.parse(docker(["config", "--format", "json"]));
    const workloads = validateCompose(composed);
    for (const name of [...workloads, "migrator"])
      if (release.images?.[name] !== composed.services[name].image)
        throw new Error(
          "Compose images do not match the selected release record.",
        );
    await preflight();
    docker(["pull"]);
    await preflight();
    changed = true;
    docker(["stop", ...workloads]);
    const backup = path.join(root, `backup-${Date.now()}.dump`);
    const fd = fs.openSync(backup, "wx", 0o600);
    try {
      docker(
        [
          "exec",
          "-T",
          "postgres",
          "pg_dump",
          "-U",
          process.env.DEPLOYMENT_BACKUP_USER ?? "postgres",
          "-Fc",
          process.env.DEPLOYMENT_DATABASE ?? "templatev4",
        ],
        { stdio: ["ignore", fd, "pipe"] },
      );
    } finally {
      fs.closeSync(fd);
    }
    if (fs.statSync(backup).size === 0)
      throw new Error("Empty database backup.");
    // Validate the archive index before any migration; never restore automatically.
    const input = fs.openSync(backup, "r");
    try {
      docker(["exec", "-T", "postgres", "pg_restore", "--list"], {
        stdio: [input, "pipe", "pipe"],
      });
    } finally {
      fs.closeSync(input);
    }
    await preflight();
    docker(["run", "--rm", "--no-deps", "migrator"]);
    await preflight();
    docker(["up", "-d", "--no-deps", "--wait", ...workloads]);
    const signed = await request(configuration, "heartbeat", {
      components: components(candidate),
      health: "running",
    });
    verifyLicense(signed, configuration);
    fs.writeFileSync(
      path.join(root, "deployment-receipt.json"),
      JSON.stringify(
        {
          deploymentId: configuration.DeploymentId,
          completedAt: new Date().toISOString(),
          components: components(candidate),
          backup,
        },
        null,
        2,
      ),
      { mode: 0o600 },
    );
    fs.unlinkSync(lockFile);
    console.log(
      "Deployment completed. Database backup and receipt retained locally.",
    );
  } catch (error) {
    if (changed)
      console.error(
        "Deployment interrupted. Execution lock and backup retained; inspect actual application/schema state before recovery.",
      );
    else fs.unlinkSync(lockFile);
    throw error;
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch(() => {
    console.error(
      "Deployment operation failed. Check configuration, entitlement, compatibility and local service status.",
    );
    process.exitCode = 1;
  });
}
