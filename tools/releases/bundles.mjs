import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import {
  boundedBody,
  sha256,
  validateRelease,
  validateLock,
  idPattern,
} from "./contracts.mjs";

const limit = 64 * 1024 * 1024;
function safePath(name) {
  return (
    typeof name === "string" &&
    name.length < 240 &&
    name
      .split("/")
      .every(
        (p) =>
          /^[a-zA-Z0-9_@][a-zA-Z0-9_.@ -]*$/.test(p) &&
          !p.endsWith(".") &&
          !p.endsWith(" ") &&
          !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(p) &&
          !["node_modules", "bin", "obj"].includes(p),
      )
  );
}
export function buildBundle(moduleDirectory, release, output) {
  validateRelease(release);
  if (release.id === "foundation")
    throw new Error("Foundation uses its source commit.");
  const descriptor = JSON.parse(
    fs.readFileSync(path.join(moduleDirectory, "module.json"), "utf8"),
  );
  if (
    descriptor.id !== release.id ||
    descriptor.version !== release.version ||
    JSON.stringify(descriptor.foundationCompatibility) !==
      JSON.stringify(release.foundation) ||
    JSON.stringify(descriptor.dependencyVersions ?? {}) !==
      JSON.stringify(release.dependencies)
  )
    throw new Error("Descriptor and release metadata differ.");
  const commit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: moduleDirectory,
    encoding: "utf8",
  }).trim();
  if (
    commit !== release.commit ||
    execFileSync("git", ["status", "--porcelain", "--", "."], {
      cwd: moduleDirectory,
      encoding: "utf8",
    }).trim()
  )
    throw new Error("Publish from the clean declared commit.");
  const names = execFileSync("git", ["ls-files", "-z", "--", "."], {
    cwd: moduleDirectory,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const files = names.filter(safePath).map((name) => {
    const source = path.join(moduleDirectory, name);
    if (!fs.lstatSync(source).isFile())
      throw new Error("Module bundles cannot contain links.");
    return { path: name, data: fs.readFileSync(source).toString("base64") };
  });
  if (!files.some((f) => f.path === "module.json"))
    throw new Error("Missing module descriptor.");
  const bundle = JSON.stringify({
    schemaVersion: 1,
    id: release.id,
    version: release.version,
    files,
  });
  if (Buffer.byteLength(bundle) > limit / 2)
    throw new Error("Module source bundle is too large.");
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, "bundle.json"), bundle, { flag: "wx" });
  fs.writeFileSync(
    path.join(output, "package.json"),
    JSON.stringify({
      name: release.artifact.package,
      version: release.version,
      files: ["bundle.json"],
      description: `TemplateV4 ${release.id} source bundle`,
      license: "UNLICENSED",
    }),
    { flag: "wx" },
  );
}
export function unpackBundle(tgz, release) {
  if (sha256(tgz) !== release.artifact.sha256)
    throw new Error("Module artifact digest mismatch.");
  const tar = gunzipSync(tgz, { maxOutputLength: limit });
  let bundle;
  // Read only one regular JSON member. Never extract archive paths or execute package scripts.
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((b) => b === 0)) break;
    const name = header.subarray(0, 100).toString().replace(/\0.*$/s, "");
    const sizeText = header
      .subarray(124, 136)
      .toString()
      .replace(/\0.*$/s, "")
      .trim();
    if (!/^[0-7]+$/.test(sizeText)) throw new Error("Invalid package archive.");
    const size = parseInt(sizeText, 8);
    if (offset + 512 + size > tar.length)
      throw new Error("Truncated package archive.");
    if (name === "package/bundle.json") {
      if (bundle || ![0, 48].includes(header[156]))
        throw new Error("Invalid bundle archive member.");
      bundle = JSON.parse(
        tar.subarray(offset + 512, offset + 512 + size).toString(),
      );
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  if (
    !bundle ||
    bundle.schemaVersion !== 1 ||
    bundle.id !== release.id ||
    bundle.version !== release.version ||
    !Array.isArray(bundle.files) ||
    bundle.files.length > 10000
  )
    throw new Error("Invalid source bundle.");
  const paths = new Set();
  for (const f of bundle.files) {
    if (
      !safePath(f.path) ||
      paths.has(f.path.toLowerCase()) ||
      typeof f.data !== "string" ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        f.data,
      )
    )
      throw new Error("Unsafe or duplicate bundle path.");
    paths.add(f.path.toLowerCase());
  }
  const descriptorFile = bundle.files.find((f) => f.path === "module.json");
  const descriptor =
    descriptorFile &&
    JSON.parse(Buffer.from(descriptorFile.data, "base64").toString());
  if (
    descriptor?.id !== release.id ||
    descriptor.version !== release.version ||
    JSON.stringify(descriptor.foundationCompatibility) !==
      JSON.stringify(release.foundation) ||
    JSON.stringify(descriptor.dependencyVersions ?? {}) !==
      JSON.stringify(release.dependencies)
  )
    throw new Error("Bundle descriptor differs from release.");
  return bundle;
}
export async function downloadModule(release, token) {
  validateRelease(release);
  if (!token) throw new Error("GitHub Packages read credential is required.");
  const get = async (url) => {
    const parsed = new URL(url);
    if (
      parsed.origin !== "https://npm.pkg.github.com" ||
      parsed.username ||
      parsed.password
    )
      throw new Error("Unexpected package registry.");
    const response = await fetch(parsed, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "error",
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok)
      throw new Error(`Package registry returned ${response.status}.`);
    return boundedBody(response, limit);
  };
  const metadata = JSON.parse(
    (
      await get(
        `https://npm.pkg.github.com/${encodeURIComponent(release.artifact.package)}/${release.version}`,
      )
    ).toString(),
  );
  if (
    metadata.name !== release.artifact.package ||
    metadata.version !== release.version
  )
    throw new Error("Package identity mismatch.");
  return unpackBundle(await get(metadata.dist.tarball), release);
}
export async function composePinned(
  root,
  lock,
  token,
  download = downloadModule,
) {
  validateLock(lock);
  const foundation = lock.components.find((c) => c.id === "foundation");
  const actual = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "framework.json"), "utf8"),
  );
  if (
    actual !== foundation.commit ||
    manifest.frameworkVersion !== foundation.version ||
    manifest.templateVersion !== foundation.templateVersion ||
    manifest.scaffoldingVersion !== foundation.scaffoldingVersion
  )
    throw new Error("Foundation checkout differs from pins.");
  const selection = JSON.parse(
    fs.readFileSync(path.join(root, "client-modules.json"), "utf8"),
  );
  const modules = lock.components.filter((c) => c.id !== "foundation");
  if (
    JSON.stringify([...selection.privateModules].sort()) !==
    JSON.stringify(modules.map((c) => c.id).sort())
  )
    throw new Error("Module selection differs from pins.");
  const destination = path.join(root, "business-modules");
  if (fs.existsSync(destination))
    throw new Error(
      "Pinned composition requires a clean checkout without business-modules.",
    );
  const bundles = [];
  for (const release of modules) {
    if (!idPattern.test(release.id)) throw new Error("Invalid module ID.");
    bundles.push(await download(release, token));
  }
  for (const bundle of bundles)
    for (const file of bundle.files) {
      const target = path.join(destination, bundle.id, file.path);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, Buffer.from(file.data, "base64"), {
        flag: "wx",
      });
    }
  fs.writeFileSync(
    path.join(root, "client-template.json"),
    JSON.stringify(lock, null, 2) + "\n",
  );
}
