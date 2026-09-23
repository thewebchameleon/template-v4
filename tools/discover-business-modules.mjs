import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveModules } from "./modules.mjs";
import { installedRelease } from "./releases/installed.mjs";
import { prepareModuleWorkspace } from "./prepare-module-workspace.mjs";
import {
  readClientModules,
  checkGeneratedSelection,
  selectionText,
} from "./client-modules.mjs";

const repository = path.resolve(import.meta.dirname, "..");
const symbol = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;
const literal = JSON.stringify;
const folderName = id => id.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');

export function selectedIds(root) {
  const resolved = path.join(root, ".private-modules/selection.json");
  const ids = fs.existsSync(resolved)
    ? JSON.parse(fs.readFileSync(resolved, "utf8"))
    : readClientModules(root).privateModules;
  if (
    ids.some((id) => !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)) ||
    new Set(ids).size !== ids.length
  )
    throw new Error(
      "business-modules.enabled must contain unique module IDs, one per line.",
    );
  return ids;
}

export function discover(root, selection = selectedIds(root)) {
  const compiled = path.join(root, ".private-modules/modules");
  const directory = fs.existsSync(compiled) ? compiled : path.join(root, "modules/Private");
  const modules = [];
  for (const entry of fs.existsSync(directory)
    ? fs
        .readdirSync(directory, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name, "en"))
    : []) {
    if (entry.isSymbolicLink())
      throw new Error(
        `Business module symlinks are unsupported: ${entry.name}`,
      );
    if (!entry.isDirectory()) continue;
    const folderId = entry.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    if (!selection.includes(folderId)) continue;
    const folder = path.join(directory, entry.name);
    if (!fs.existsSync(path.join(folder, "module.json"))) {
      if (
        ["Api", "Infrastructure"].some((layer) =>
          fs.existsSync(path.join(folder, layer)) && fs.readdirSync(path.join(folder, layer)).some(file => file.endsWith('.csproj')),
        )
      )
        throw new Error(`Missing descriptor: ${entry.name}/module.json`);
      continue;
    }
    const descriptor = JSON.parse(
      fs.readFileSync(path.join(folder, "module.json"), "utf8"),
    );
    if (
      descriptor.id !== folderId ||
      descriptor.category !== "private" ||
      (descriptor.licenseRequired !== undefined && typeof descriptor.licenseRequired !== "boolean") ||
      descriptor.required ||
      !descriptor.runtimeConfigurable ||
      descriptor.enabledByDefault !== false
    )
      throw new Error(
        `Business module ${entry.name} must match its folder and be optional, runtime configurable and initially disabled.`,
      );
    const host = descriptor.host;
    if (
      !host ||
      !["configure", "map", "services", "feature"].every(
        (key) => typeof host[key] === "string" && symbol.test(host[key]),
      )
    )
      throw new Error(
        `Missing or invalid host entry points in ${entry.name}/module.json`,
      );
    if (host.feature.includes("."))
      throw new Error("Frontend feature must be a named export.");
    for (const layer of descriptor.distribution ? [] : ["Api", "Infrastructure"]) {
      const files = fs
        .readdirSync(path.join(folder, layer))
        .filter((file) => file.endsWith(".csproj"));
      if (files.length !== 1)
        throw new Error(`${entry.name}/${layer} requires exactly one project.`);
    }
    if (!descriptor.distribution && (!fs.readdirSync(folder).includes("Frontend") ||
        !fs.existsSync(path.join(folder, "Frontend/public-api.ts"))))
      throw new Error(`Missing frontend entry point: ${entry.name}`);
    if (descriptor.distribution &&
        (!descriptor.distribution.frontendPackage || !descriptor.distribution.apiPackage || !descriptor.distribution.infrastructurePackage))
      throw new Error(`Missing compiled package coordinates: ${entry.name}`);
    Object.defineProperty(descriptor, 'sourceFolder', { value: entry.name });
    modules.push(descriptor);
  }
  for (const id of selection)
    if (!modules.some((module) => module.id === id))
      throw new Error(`Selected business module is missing: ${id}`);
  const config = readClientModules(root);
  resolveModules(
    [
      ...JSON.parse(
        fs.readFileSync(path.join(root, "modules/catalog.json"), "utf8"),
      ),
      ...modules.map((module) => ({ ...module, enabledByDefault: true })),
    ],
    config.foundation,
  );
  return modules;
}

export function backend(modules, host, foundation = {}, installed = null) {
  const api = host === "TemplateV4.ApiService";
  const builderType = api
    ? "Microsoft.AspNetCore.Builder.WebApplicationBuilder"
    : "Microsoft.Extensions.Hosting.IHostApplicationBuilder";
  const array = (values) => `[${values.map(literal).join(", ")}]`;
  const descriptors = modules.map(
    (d) =>
      `new(${literal(d.id)}, false, true, ${array(d.dependencies)}, true, ${literal(d.featureFlag ?? null)}, [${(d.capabilities ?? []).map((c) => `new(${literal(c.id)}, ${array(c.requires)}, ${literal(c.featureFlag ?? null)})`).join(", ")}], Category: "private", LicenseRequired: ${d.licenseRequired === true ? "true" : "false"})`,
  );
  return `// <auto-generated />\nnamespace TemplateV4.Host;\ninternal static class BusinessModules\n{\n    internal static TemplateV4.Application.Modules.ModuleDefinition[] Descriptors => [${descriptors.join(", ")}];\n    internal static void ConfigureClient(${builderType} builder)\n    {\n${Object.entries(
    foundation,
  )
    .map(
      ([id, enabled]) =>
        `        builder.Configuration[${literal("ClientModules:" + id)}] = ${literal(String(enabled))};`,
    )
    .join(
      "\n",
    )}\n${installed ? `        builder.Configuration["Updates:InstalledJson"] = ${literal(JSON.stringify(installed))};\n` : ""}    }\n    internal static void Configure(${builderType} builder)\n    {\n${modules.map((d) => `        ${api ? `${d.host.configure}(builder)` : `${d.host.services}(builder.Services, builder.Configuration)`};`).join("\n")}\n    }\n${api ? `    internal static void Map(Microsoft.AspNetCore.Builder.WebApplication app)\n    {\n${modules.map((d) => `        ${d.host.map}(app);`).join("\n")}\n    }\n` : ""}}\n`;
}

export function frontend(modules) {
  return `// Generated by tools/discover-business-modules.mjs. Do not edit.\nimport type { FoundationFeature } from './app/core/feature-extensions';\n${modules.map((d, i) => `import { ${d.host.feature} as feature${i} } from '${d.distribution?.frontendPackage ?? `../../../modules/Private/${d.sourceFolder ?? folderName(d.id)}/Frontend/public-api`}';`).join("\n")}\nexport const businessFeatures: FoundationFeature[] = [${modules.map((_, i) => `feature${i}`).join(", ")}];\n`;
}

export function frontendStyles(modules) {
  return `/* Generated by tools/discover-business-modules.mjs. */\n${modules.map((d) => d.distribution ? `@source '../../../node_modules/${d.distribution.frontendPackage}';` : `@source '../../../modules/Private/${d.sourceFolder ?? folderName(d.id)}/Frontend';`).join("\n")}\n`;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  prepareModuleWorkspace(repository);
  const modules = discover(repository);
  if (
    process.argv.includes("--validate") ||
    process.argv.includes("--host") ||
    process.argv.includes("--check")
  )
    checkGeneratedSelection(
      repository,
      selectedIds(repository),
    );
  if (process.argv.includes("--validate")) process.exit(0);
  const hostIndex = process.argv.indexOf("--host");
  const host = hostIndex < 0 ? null : process.argv[hostIndex + 1];
  if (
    host &&
    ![
      "TemplateV4.ApiService",
      "TemplateV4.BackgroundWorker",
      "TemplateV4.DatabaseMigrator",
    ].includes(host)
  )
    throw new Error("Unknown host.");
  const output = host
    ? process.argv[hostIndex + 2]
    : path.join(repository, "src/TemplateV4.Angular/src/business-modules.g.ts");
  const content = host
    ? backend(
        modules,
        host,
        readClientModules(repository).foundation,
        installedRelease(repository, modules),
      )
    : frontend(modules);
  if (!host && !process.argv.includes("--check"))
    fs.writeFileSync(
      path.join(repository, "business-modules.enabled"),
      selectionText(selectedIds(repository)),
    );
  if (!host) {
    const styles = path.join(
      repository,
      "src/TemplateV4.Angular/src/business-modules.g.css",
    );
    if (!process.argv.includes("--check"))
      fs.writeFileSync(styles, frontendStyles(modules));
    else if (
      !fs.existsSync(styles) ||
      fs.readFileSync(styles, "utf8").replaceAll("\r\n", "\n") !==
        frontendStyles(modules)
    )
      throw new Error(`Stale business styles: ${styles}`);
  }
  if (process.argv.includes("--check")) {
    if (
      !fs.existsSync(output) ||
      fs.readFileSync(output, "utf8").replaceAll("\r\n", "\n") !== content
    )
      throw new Error(`Stale business discovery output: ${output}`);
  } else if (
    !fs.existsSync(output) ||
    fs.readFileSync(output, "utf8") !== content
  ) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, content);
  }
}
