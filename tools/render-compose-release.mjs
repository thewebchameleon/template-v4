import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function renderRelease(
  root,
  output,
  release,
  imageRoot,
  foundationCommit,
  businessCommit = "",
) {
  if (!/^run-\d+-\d+$/.test(release))
    throw new Error("Invalid release identifier.");
  if (!/^ghcr\.io\/[a-z0-9_.-]+\/[a-z0-9_./-]+$/.test(imageRoot))
    throw new Error("Invalid image repository.");
  for (const commit of [foundationCommit, businessCommit].filter(Boolean))
    if (!/^[a-f0-9]{40}$/.test(commit))
      throw new Error("Expected immutable source commits.");
  const images = {};
  for (const service of ["api", "worker", "migrator", "web"]) {
    const metadata = JSON.parse(
      fs.readFileSync(path.join(output, `${service}.metadata.json`), "utf8"),
    );
    const digest = metadata["containerimage.digest"];
    if (!/^sha256:[a-f0-9]{64}$/.test(digest))
      throw new Error(`Missing image digest for ${service}.`);
    images[service] = `${imageRoot}/${service}@${digest}`;
  }
  let compose = fs.readFileSync(
    path.join(root, "deploy/compose-platforms/compose.template.yaml"),
    "utf8",
  );
  for (const [service, image] of Object.entries(images))
    compose = compose.replaceAll(`__${service.toUpperCase()}_IMAGE__`, image);
  compose = compose.replaceAll("__RELEASE__", release);
  if (/__[A-Z_]+__/.test(compose))
    throw new Error("Unresolved Compose template marker.");
  fs.mkdirSync(path.join(output, "deploy"), { recursive: true });
  fs.writeFileSync(path.join(output, "compose.yaml"), compose);
  // Coolify consumes this extension before passing its processed file to Compose.
  const coolifyCompose = compose.replace(
    /^  migrator:$/gm,
    "$&\n    exclude_from_hc: true",
  );
  fs.writeFileSync(path.join(output, "compose.coolify.yaml"), coolifyCompose);
  fs.copyFileSync(
    path.join(root, "deploy/init-database.sh"),
    path.join(output, "deploy/init-database.sh"),
  );
  for (const name of [
    ".env.example",
    "upgrade.sh",
    "README.md",
    "COOLIFY.md",
    "updates.override.yaml",
  ])
    fs.copyFileSync(
      path.join(root, "deploy/compose-platforms", name),
      path.join(output, name),
    );
  fs.copyFileSync(
    path.join(root, "client-modules.json"),
    path.join(output, "client-modules.json"),
  );
  fs.writeFileSync(
    path.join(output, "release.json"),
    JSON.stringify(
      {
        release,
        foundationCommit,
        businessCommit: businessCommit || null,
        components: fs.existsSync(path.join(root, "client-template.json"))
          ? JSON.parse(
              fs.readFileSync(path.join(root, "client-template.json"), "utf8"),
            ).components
          : null,
        images,
        selection: JSON.parse(
          fs.readFileSync(path.join(root, "client-modules.json"), "utf8"),
        ),
      },
      null,
      2,
    ) + "\n",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  renderRelease(...process.argv.slice(2));
