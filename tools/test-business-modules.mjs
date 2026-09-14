import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { discover } from "./discover-business-modules.mjs";

const root = path.resolve(import.meta.dirname, "..");
for (const module of discover(root)) {
  const directory = path.join(root, "business-modules", module.id, "tests");
  if (!fs.existsSync(directory)) continue;
  for (const project of fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".csproj"))) {
    const result = spawnSync(
      "dotnet",
      ["test", path.join(directory, project), ...process.argv.slice(2)],
      { cwd: root, stdio: "inherit" },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
