import crypto from "node:crypto";

export const idPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const versionPattern =
  /^(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})$/;
export function compare(a, b) {
  if (!versionPattern.test(a) || !versionPattern.test(b))
    throw new Error("Expected stable semantic versions.");
  const x = a.split(".").map(Number),
    y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return Math.sign(x[i] - y[i]);
  return 0;
}
export function rangeValid(range) {
  return (
    range &&
    versionPattern.test(range.min) &&
    versionPattern.test(range.maxExclusive) &&
    compare(range.min, range.maxExclusive) < 0
  );
}
export function satisfies(version, range) {
  return (
    versionPattern.test(version) &&
    rangeValid(range) &&
    compare(version, range.min) >= 0 &&
    compare(version, range.maxExclusive) < 0
  );
}
export function httpsUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password && !u.hash;
  } catch {
    return false;
  }
}
export function validateRelease(r) {
  const fields = [
    "schemaVersion",
    "id",
    "version",
    "commit",
    "notesUrl",
    "migrationNotes",
    "breaking",
    "dependencies",
    "foundation",
    "artifact",
    "templateVersion",
    "scaffoldingVersion",
  ];
  if (
    !r ||
    Object.keys(r).some((key) => !fields.includes(key)) ||
    r.schemaVersion !== 1 ||
    !idPattern.test(r.id) ||
    r.id.length > 80 ||
    !versionPattern.test(r.version) ||
    !/^[a-f0-9]{40}$/.test(r.commit) ||
    !httpsUrl(r.notesUrl) ||
    r.notesUrl.length > 1500 ||
    typeof r.migrationNotes !== "string" ||
    r.migrationNotes.length > 8000 ||
    typeof r.breaking !== "boolean" ||
    !r.dependencies ||
    Array.isArray(r.dependencies) ||
    typeof r.dependencies !== "object" ||
    Object.entries(r.dependencies).some(
      ([id, range]) =>
        !idPattern.test(id) ||
        id === "foundation" ||
        id === r.id ||
        !rangeValid(range),
    )
  )
    throw new Error("Invalid release metadata.");
  if (
    r.id !== "foundation" &&
    (!rangeValid(r.foundation) ||
      !r.artifact ||
      !/^@[a-z0-9-]+\/[a-z0-9-]+$/.test(r.artifact.package) ||
      !/^[a-f0-9]{64}$/.test(r.artifact.sha256) ||
      !httpsUrl(r.artifact.downloadUrl))
  )
    throw new Error("Invalid module artifact or compatibility.");
  if (
    r.id === "foundation" &&
    (Object.keys(r.dependencies).length !== 0 ||
      !versionPattern.test(r.templateVersion) ||
      !versionPattern.test(r.scaffoldingVersion))
  )
    throw new Error("Missing template versions.");
  return r;
}
export function validateLock(lock) {
  if (
    lock?.schemaVersion !== 1 ||
    lock.channel !== "stable" ||
    !Array.isArray(lock.components) ||
    lock.components.length > 100 ||
    lock.components.filter((x) => x.id === "foundation").length !== 1 ||
    new Set(lock.components.map((x) => x.id)).size !== lock.components.length
  )
    throw new Error("Invalid client-template.json.");
  lock.components.forEach(validateRelease);
  if (compatibility(lock.components).length)
    throw new Error("Incompatible client component pins.");
  return lock;
}
export function compatibility(components) {
  const installed = new Map(components.map((x) => [x.id, x.version]));
  return components.flatMap((c) =>
    Object.entries({
      ...(c.id === "foundation" ? {} : { foundation: c.foundation }),
      ...c.dependencies,
    })
      .filter(([id, range]) => !satisfies(installed.get(id), range))
      .map(([id]) => `${c.id} requires compatible ${id}`),
  );
}
export function propose(lock, releases) {
  validateLock(lock);
  releases.forEach(validateRelease);
  const proposed = structuredClone(lock);
  // Try the newest versions as a coordinated combination, including reverse dependencies.
  for (let i = 0; i < proposed.components.length; i++) {
    const current = proposed.components[i];
    proposed.components[i] =
      releases
        .filter(
          (r) => r.id === current.id && compare(r.version, current.version) > 0,
        )
        .sort((a, b) => compare(b.version, a.version))[0] ?? current;
  }
  const blocked = compatibility(proposed.components);
  if (blocked.length) return { lock, blocked, changed: false };
  return {
    lock: proposed,
    blocked: [],
    changed: JSON.stringify(lock) !== JSON.stringify(proposed),
  };
}
export const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
export async function boundedBody(response, limit = 4 * 1024 * 1024) {
  const parts = [];
  let length = 0;
  for await (const part of response.body ?? response) {
    length += part.length;
    if (length > limit) throw new Error("Response exceeds release limit.");
    parts.push(Buffer.from(part));
  }
  return Buffer.concat(parts);
}
export async function readFeed(url, token) {
  if (!httpsUrl(url) || !token)
    throw new Error("An HTTPS release feed and credential are required.");
  const response = await fetch(
    new URL("v1/releases", url.endsWith("/") ? url : url + "/"),
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok)
    throw new Error(`Release feed returned ${response.status}.`);
  const feed = JSON.parse((await boundedBody(response)).toString());
  if (
    feed.schemaVersion !== 1 ||
    !Array.isArray(feed.releases) ||
    feed.releases.length > 1000
  )
    throw new Error("Invalid release feed.");
  feed.releases.forEach(validateRelease);
  return feed.releases;
}
