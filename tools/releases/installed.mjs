import fs from "node:fs";
import path from "node:path";
import { validateLock } from "./contracts.mjs";

export function installedRelease(root, modules) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "framework.json"), "utf8"),
  );
  const file = path.join(root, "client-template.json");
  if (!fs.existsSync(file))
    return {
      schemaVersion: 1,
      channel: "stable",
      components: [
        {
          id: "foundation",
          version: manifest.frameworkVersion,
          dependencies: {},
          templateVersion: manifest.templateVersion,
          scaffoldingVersion: manifest.scaffoldingVersion,
        },
        ...modules.map((m) => ({
          id: m.id,
          version: m.version ?? "unreleased",
          foundation: m.foundationCompatibility,
          dependencies: m.dependencyVersions ?? {},
        })),
      ],
    };
  const lock = validateLock(JSON.parse(fs.readFileSync(file, "utf8")));
  const foundation = lock.components.find((c) => c.id === "foundation");
  if (
    foundation.version !== manifest.frameworkVersion ||
    foundation.templateVersion !== manifest.templateVersion ||
    foundation.scaffoldingVersion !== manifest.scaffoldingVersion ||
    JSON.stringify(modules.map((m) => m.id).sort()) !==
      JSON.stringify(
        lock.components
          .filter((c) => c.id !== "foundation")
          .map((c) => c.id)
          .sort(),
      )
  )
    throw new Error("Installed pins differ from build selection.");
  for (const module of modules) {
    const pin = lock.components.find((c) => c.id === module.id);
    if (
      pin.version !== module.version ||
      JSON.stringify(pin.foundation) !==
        JSON.stringify(module.foundationCompatibility) ||
      JSON.stringify(pin.dependencies) !==
        JSON.stringify(module.dependencyVersions ?? {})
    )
      throw new Error(`Installed pin differs from ${module.id}.`);
    for (const id of module.dependencies.filter((id) =>
      modules.some((m) => m.id === id),
    ))
      if (!pin.dependencies[id])
        throw new Error(
          `Missing version constraint for ${module.id} dependency ${id}.`,
        );
  }
  return lock;
}
