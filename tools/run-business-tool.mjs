import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { discover } from "./discover-business-modules.mjs";

export function runBusinessTool(tool, args = []) {
  const root = path.resolve(import.meta.dirname, "..");
  for (const module of discover(root)) {
    const relative = module.tools?.[tool];
    if (!relative) continue;
    const folder = path.join(root, "modules/Private", module.id);
    const config = path.resolve(folder, relative);
    if (!config.startsWith(folder + path.sep) || !fs.existsSync(config))
      throw new Error(`Invalid ${tool} path in ${module.id}`);
    const dependencies = path.join(root, "src/TemplateV4.Angular/node_modules");
    const command =
      tool === "identifiers"
        ? [config, root, ...args]
        : tool === "clients"
          ? [
              path.join(dependencies, "ng-openapi-gen/lib/index.js"),
              "--config",
              config,
            ]
          : [
              path.join(dependencies, "ng-packagr/src/cli/main.js"),
              "-p",
              config,
              "-c",
              path.join(path.dirname(config), "tsconfig.lib.json"),
            ];
    const result = spawnSync(process.execPath, command, {
      cwd: folder,
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw new Error(`${module.id}: ${tool} failed (${result.status})`);
  }
}
