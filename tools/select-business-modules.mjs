import fs from "node:fs";
import path from "node:path";
import {
  discover,
  frontend,
  frontendStyles,
} from "./discover-business-modules.mjs";

const root = path.resolve(import.meta.dirname, "..");
const selection = process.argv.slice(2);
if (
  new Set(selection).size !== selection.length ||
  selection.some((id) => !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id))
)
  throw new Error(
    "Pass unique module IDs. No arguments selects foundation only.",
  );
const modules = discover(root, selection);
fs.writeFileSync(
  path.join(root, "business-modules.enabled"),
  selection.length ? selection.join("\n") + "\n" : "",
);
fs.writeFileSync(
  path.join(root, "src/TemplateV4.Angular/src/business-modules.g.ts"),
  frontend(modules),
);
fs.writeFileSync(
  path.join(root, "src/TemplateV4.Angular/src/business-modules.g.css"),
  frontendStyles(modules),
);
console.log(
  `Selected ${selection.length} business modules. Restore and rebuild all hosts before deployment.`,
);
