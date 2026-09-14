import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function prepare(root, configuration, selectionFile, locksDirectory) {
  const source = path.resolve(configuration, selectionFile);
  const relative = path.relative(path.resolve(configuration), source);
  if (relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error(
      "Client selection must be inside the configuration repository.",
    );
  const selection = JSON.parse(fs.readFileSync(source, "utf8"));
  if (selection.schemaVersion !== 1 || !Array.isArray(selection.privateModules))
    throw new Error("Expected a version 1 client-modules.json.");
  // Clean CI checkouts only: never reuse another client's generated outputs.
  fs.copyFileSync(source, path.join(root, "client-modules.json"));
  if (selection.privateModules.length === 0) return;
  const lockSource = path.resolve(configuration, locksDirectory);
  const lockRelative = path.relative(path.resolve(configuration), lockSource);
  if (lockRelative.startsWith("..") || path.isAbsolute(lockRelative))
    throw new Error(
      "Client locks must be inside the configuration repository.",
    );
  const destination = path.join(root, ".local/client-locks");
  fs.mkdirSync(destination, { recursive: true });
  for (const host of [
    "ApiService",
    "BackgroundWorker",
    "DatabaseMigrator",
    "Application.Tests",
  ]) {
    const name = `TemplateV4.${host}.packages.lock.json`;
    fs.copyFileSync(path.join(lockSource, name), path.join(destination, name));
  }
  // Keep the repository-wide Docker exclusion for .local intact. Only this clean
  // CI context receives an exception for reviewed, non-secret dependency locks.
  fs.appendFileSync(
    path.join(root, ".dockerignore"),
    "\n!.local\n.local/*\n!.local/client-locks\n!.local/client-locks/*.packages.lock.json\n",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [root, configuration, selectionFile, locksDirectory = "client-locks"] =
    process.argv.slice(2);
  if (!root || !configuration || !selectionFile)
    throw new Error(
      "Expected foundation root, configuration root and selection path.",
    );
  prepare(
    path.resolve(root),
    path.resolve(configuration),
    selectionFile,
    locksDirectory,
  );
}
