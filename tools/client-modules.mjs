import fs from "node:fs";
import path from "node:path";

export function readClientModules(root) {
  const file = path.join(root, "modules/client/client-modules.json");
  const previousSelection = path.join(root, "modules/client/business-modules.enabled");
  if (
    !fs.existsSync(file) &&
    fs.existsSync(previousSelection) &&
    fs.readFileSync(previousSelection, "utf8").trim()
  )
    throw new Error(
      "Transfer existing modules/client/business-modules.enabled IDs into modules/client/client-modules.json privateModules before regenerating. Existing selection was preserved.",
    );
  const config = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, "utf8"))
    : { schemaVersion: 1, foundation: {}, privateModules: [] };
  if (
    !config ||
    config.schemaVersion !== 1 ||
    Object.keys(config).some(
      (key) => !["schemaVersion", "foundation", "privateModules"].includes(key),
    ) ||
    !config.foundation ||
    Array.isArray(config.foundation) ||
    typeof config.foundation !== "object" ||
    !Array.isArray(config.privateModules) ||
    config.privateModules.some(
      (id) =>
        typeof id !== "string" || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id),
    ) ||
    new Set(config.privateModules).size !== config.privateModules.length
  )
    throw new Error(
      "Invalid modules/client/client-modules.json: use schemaVersion 1, foundation booleans and unique privateModules IDs.",
    );
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, "modules/catalog.json"), "utf8"),
  );
  for (const [id, value] of Object.entries(config.foundation)) {
    if (
      typeof value !== "boolean" ||
      !catalog.some(
        (module) => module.id === id && module.category === "foundation",
      )
    )
      throw new Error(
        `Client foundation setting must name an optional foundation module: ${id}`,
      );
  }
  return config;
}

export function selectionText(ids) {
  return ids.length ? ids.join("\n") + "\n" : "";
}

export function checkGeneratedSelection(root, ids) {
  const file = path.join(root, "modules/client/business-modules.enabled");
  const actual = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n")
    : "";
  if (actual !== selectionText(ids))
    throw new Error(
      "Stale modules/client/business-modules.enabled. Run node tools/discover-business-modules.mjs before restore/build; edit modules/client/client-modules.json, not generated selection.",
    );
}
