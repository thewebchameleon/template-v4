import fs from "node:fs";
import path from "node:path";

export function updateWorkflowPins(directory, previous, next) {
  if (!/^[a-f0-9]{40}$/.test(previous) || !/^[a-f0-9]{40}$/.test(next))
    throw new Error("Expected immutable workflow pins.");
  if (previous === next) return;
  for (const name of ["release.yml", "updates.yml", "validate.yml"]) {
    const file = path.join(directory, ".github/workflows", name);
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    fs.writeFileSync(
      file,
      content
        .replaceAll(
          `/.github/workflows/compose-release.yml@${previous}`,
          `/.github/workflows/compose-release.yml@${next}`,
        )
        .replace(
          new RegExp(
            `(repository: thewebchameleon/template-v4\\r?\\n\\s*ref: )${previous}\\b`,
            "g",
          ),
          `$1${next}`,
        ),
    );
  }
}
