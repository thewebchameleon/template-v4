import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".private-modules");
const idPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const versionPattern = /^(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})\.(0|[1-9][0-9]{0,8})$/;
const limit = 128 * 1024 * 1024;
function required(name) { const value = process.env[name]; if (!value) throw new Error(`${name} is required.`); return value; }
function safeName(value) { return typeof value === "string" && value.length < 180 && /^[A-Za-z0-9_.@-]+$/.test(value) && !value.includes(".."); }
function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
async function body(response, maximum = limit) {
  if (!response.ok) throw new Error(`Module service returned ${response.status}.`);
  const chunks = []; let length = 0;
  for await (const chunk of response.body) { length += chunk.length; if (length > maximum) throw new Error("Module response is too large."); chunks.push(chunk); }
  return Buffer.concat(chunks);
}
function foundation() {
  const framework = JSON.parse(fs.readFileSync(path.join(root, "framework.json"), "utf8"));
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  return { schemaVersion: 1, id: "foundation", version: framework.frameworkVersion, commit,
    notesUrl: "https://github.com/thewebchameleon/template-v4/releases", migrationNotes: "", breaking: false,
    dependencies: {}, templateVersion: framework.templateVersion, scaffoldingVersion: framework.scaffoldingVersion };
}
function unpack(archive, release) {
  if (!release.artifact || typeof release.artifact.package !== "string" || !/^[a-f0-9]{64}$/.test(release.artifact.sha256) ||
      sha256(archive) !== release.artifact.sha256) throw new Error(`Digest mismatch for ${release.id}.`);
  const tar = gunzipSync(archive, { maxOutputLength: limit }); let bundle, packageManifest;
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512); if (header.every((x) => x === 0)) break;
    const name = header.subarray(0, 100).toString().replace(/\0.*$/s, "");
    const sizeText = header.subarray(124, 136).toString().replace(/\0.*$/s, "").trim();
    if (!/^[0-7]+$/.test(sizeText)) throw new Error("Invalid compiled module archive.");
    const size = Number.parseInt(sizeText, 8); if (offset + 512 + size > tar.length) throw new Error("Truncated compiled module archive.");
    if (name === "package/compiled-module.json") bundle = JSON.parse(tar.subarray(offset + 512, offset + 512 + size).toString());
    if (name === "package/package.json") packageManifest = JSON.parse(tar.subarray(offset + 512, offset + 512 + size).toString());
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  if (packageManifest?.name !== release.artifact.package || packageManifest.version !== release.version ||
      bundle?.schemaVersion !== 1 || bundle.id !== release.id || bundle.version !== release.version || !Array.isArray(bundle.files))
    throw new Error(`Invalid compiled bundle for ${release.id}.`);
  return bundle;
}
function writeBundle(bundle) {
  if (!idPattern.test(bundle.id) || !versionPattern.test(bundle.version) || !bundle.descriptor || bundle.descriptor.id !== bundle.id)
    throw new Error("Invalid compiled module identity.");
  if (!bundle.distribution || ![bundle.distribution.apiPackage, bundle.distribution.infrastructurePackage].every((x) => typeof x === "string" && /^[A-Za-z0-9_.-]+$/.test(x)) ||
      !Array.isArray(bundle.distribution.dotnetPackages) || bundle.distribution.dotnetPackages.length !== 4 ||
      !bundle.distribution.dotnetPackages.every((x) => ["Domain", "Application", "Infrastructure", "Api"].includes(x?.layer) && typeof x.package === "string" && /^[A-Za-z0-9_.-]+$/.test(x.package)) ||
      new Set(bundle.distribution.dotnetPackages.map((x) => x.layer)).size !== 4 ||
      typeof bundle.distribution.frontendPackage !== "string" || !/^@[a-z0-9-]+\/[a-z0-9-]+$/.test(bundle.distribution.frontendPackage))
    throw new Error("Invalid compiled package coordinates.");
  const moduleRoot = path.join(output, "modules", bundle.id); fs.mkdirSync(moduleRoot, { recursive: true });
  const paths = new Set();
  for (const file of bundle.files) {
    if (!safeName(file.name) || paths.has(file.name.toLowerCase()) || !["nuget", "npm"].includes(file.kind) || typeof file.data !== "string")
      throw new Error("Unsafe compiled module member.");
    paths.add(file.name.toLowerCase()); const bytes = Buffer.from(file.data, "base64");
    if (bytes.toString("base64") !== file.data) throw new Error(`Invalid compiled member encoding: ${file.name}`);
    if (sha256(bytes) !== file.sha256) throw new Error(`Compiled member digest mismatch: ${file.name}`);
    const folder = path.join(output, file.kind); fs.mkdirSync(folder, { recursive: true }); fs.writeFileSync(path.join(folder, file.name), bytes, { flag: "wx" });
  }
  fs.writeFileSync(path.join(moduleRoot, "module.json"), JSON.stringify({ ...bundle.descriptor, distribution: bundle.distribution }, null, 2) + "\n", { flag: "wx" });
}
function writeBuildConfiguration() {
  const descriptors = fs.readdirSync(path.join(output, "modules")).map((id) =>
    JSON.parse(fs.readFileSync(path.join(output, "modules", id, "module.json"), "utf8")));
  const references = descriptors.flatMap((module) => module.distribution.dotnetPackages.map((entry) =>
    `    <PackageReference Include="${entry.package}" Version="${module.version}" Condition="'$(MSBuildProjectName)' == 'TemplateV4.ApiService' Or ('$(MSBuildProjectName)' != 'TemplateV4.ApiService' And '${entry.layer}' != 'Api')" />`,
  )).join("\n");
  fs.writeFileSync(path.join(output, "Directory.Build.private.props"), `<Project>\n  <ItemGroup Condition="'$(DiscoverBusinessModules)' == 'true'">\n${references}\n  </ItemGroup>\n</Project>\n`);
  fs.writeFileSync(path.join(output, "NuGet.Config"), `<?xml version="1.0" encoding="utf-8"?>\n<configuration><packageSources><clear/><add key="private-modules" value="./nuget"/><add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3"/></packageSources></configuration>\n`);
}
async function prepare() {
  const service = new URL(required("MODULE_DISTRIBUTION_URL"));
  if (service.protocol !== "https:" || service.username || service.password || service.search || service.hash || service.pathname !== "/")
    throw new Error("MODULE_DISTRIBUTION_URL must be an HTTPS origin.");
  const token = required("MODULE_BUILD_TOKEN"); const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const appId = required("MODULE_APP_ID"), environmentId = required("MODULE_ENVIRONMENT_ID");
  const installedFile = path.join(root, "client-template.json");
  const previous = fs.existsSync(installedFile) ? JSON.parse(fs.readFileSync(installedFile, "utf8")) : null;
  const currentFoundation = foundation();
  const previousFoundation = previous?.components?.find((x) => x.id === "foundation");
  if (previousFoundation) {
    try { execFileSync("git", ["merge-base", "--is-ancestor", previousFoundation.commit, currentFoundation.commit], { cwd: root, stdio: "ignore" }); }
    catch { throw new Error("The selected public revision is not a descendant of the deployed foundation release."); }
  }
  const installed = previous ? previous.components.filter((x) => x.id !== "foundation")
    .map((x) => ({ id: x.id, version: x.version, digest: x.artifact?.sha256 ?? x.commit })) : [];
  const response = await fetch(new URL("api/v1/client-management/v1/resolve", service), { method: "POST", headers, redirect: "error", signal: AbortSignal.timeout(30000), body: JSON.stringify({ appId, environmentId, foundation: currentFoundation, installed }) });
  const resolved = JSON.parse((await body(response, 4 * 1024 * 1024)).toString()); const releases = resolved.release?.components;
  if (!Array.isArray(releases) || releases.filter((x) => x.id === "foundation").length !== 1) throw new Error("Invalid resolved release.");
  if (fs.existsSync(output)) fs.rmSync(output, { recursive: true, force: true }); fs.mkdirSync(output, { recursive: true });
  for (const release of releases.filter((x) => x.id !== "foundation")) {
    if (!idPattern.test(release.id) || !versionPattern.test(release.version)) throw new Error("Invalid resolved module.");
    const artifact = await fetch(new URL(`api/v1/client-management/v1/artifacts/${encodeURIComponent(release.id)}/${encodeURIComponent(release.version)}`, service),
      { headers: { Authorization: `Bearer ${token}` }, redirect: "error", signal: AbortSignal.timeout(120000) });
    writeBundle(unpack(await body(artifact), release));
  }
  if (releases.some((x) => x.id !== "foundation")) writeBuildConfiguration();
  fs.writeFileSync(path.join(output, "selection.json"), JSON.stringify(releases.filter((x) => x.id !== "foundation").map((x) => x.id), null, 2) + "\n");
  fs.writeFileSync(path.join(output, "client-template.json"), JSON.stringify(resolved.release, null, 2) + "\n");
  execFileSync(process.execPath, [path.join(root, "tools/discover-business-modules.mjs")], { cwd: root, stdio: "inherit" });
}
if (process.argv[2] !== "prepare") throw new Error("Usage: node tools/private-modules.mjs prepare");
await prepare();
