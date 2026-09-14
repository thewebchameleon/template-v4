import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildBundle, composePinned } from "./bundles.mjs";
import { updateWorkflowPins } from "./client-workflows.mjs";
import {
  httpsUrl,
  propose,
  readFeed,
  sha256,
  validateRelease,
  validateLock,
} from "./contracts.mjs";

const [command, ...args] = process.argv.slice(2);
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) =>
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
if (command === "init-client") {
  const lock = validateLock(read(args[0]));
  const destination = path.resolve(args[1]);
  const commit = lock.components.find((c) => c.id === "foundation").commit;
  const names = ["release.yml", "updates.yml", "validate.yml"];
  const directory = path.join(destination, ".github/workflows");
  for (const name of names)
    if (fs.existsSync(path.join(directory, name)))
      throw new Error("Refusing to overwrite client workflows.");
  if (fs.existsSync(path.join(destination, "client-template.json")))
    throw new Error("Refusing to overwrite client pins.");
  fs.mkdirSync(directory, { recursive: true });
  write(path.join(destination, "client-template.json"), lock);
  for (const name of names)
    fs.writeFileSync(
      path.join(directory, name),
      fs
        .readFileSync(path.join(import.meta.dirname, "templates", name), "utf8")
        .replaceAll("__FOUNDATION_COMMIT__", commit),
      { flag: "wx" },
    );
} else if (command === "workflow-pins") {
  const before = validateLock(read(args[0])).components.find(
    (c) => c.id === "foundation",
  ).commit;
  const after = validateLock(read(args[1])).components.find(
    (c) => c.id === "foundation",
  ).commit;
  updateWorkflowPins(path.resolve(args[2]), before, after);
} else if (command === "module") {
  const directory = path.resolve(args[0]);
  const descriptor = read(path.join(directory, "module.json"));
  const notes = read(path.join(directory, "release.json"));
  write(
    args[2],
    validateRelease({
      schemaVersion: 1,
      id: descriptor.id,
      version: descriptor.version,
      commit: execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: directory,
        encoding: "utf8",
      }).trim(),
      notesUrl: notes.notesUrl,
      migrationNotes: notes.migrationNotes,
      breaking: notes.breaking,
      foundation: descriptor.foundationCompatibility,
      dependencies: descriptor.dependencyVersions ?? {},
      artifact: { package: args[1], sha256: "0".repeat(64) },
    }),
  );
} else if (command === "bundle") {
  buildBundle(path.resolve(args[0]), read(args[1]), path.resolve(args[2]));
} else if (command === "digest") {
  const release = read(args[0]);
  release.artifact.sha256 = sha256(fs.readFileSync(args[1]));
  write(args[0], validateRelease(release));
} else if (command === "foundation") {
  const manifest = read("framework.json");
  write(
    args[0],
    validateRelease({
      schemaVersion: 1,
      id: "foundation",
      version: manifest.frameworkVersion,
      templateVersion: manifest.templateVersion,
      scaffoldingVersion: manifest.scaffoldingVersion,
      commit: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      notesUrl: args[1],
      migrationNotes: fs.readFileSync(args[2], "utf8"),
      breaking: args[3] === "true",
      dependencies: {},
    }),
  );
} else if (command === "publish") {
  const release = validateRelease(read(args[0]));
  const url = process.env.RELEASE_FEED_URL;
  if (!httpsUrl(url) || !process.env.RELEASE_PUBLISH_TOKEN)
    throw new Error("Configure HTTPS feed and publisher credential.");
  const result = await fetch(
    new URL("v1/releases", url.endsWith("/") ? url : url + "/"),
    {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: `Bearer ${process.env.RELEASE_PUBLISH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(release),
    },
  );
  if (!result.ok)
    throw new Error(`Release publication returned ${result.status}.`);
} else if (command === "compose") {
  await composePinned(
    path.resolve(args[0]),
    read(args[1]),
    process.env.NODE_AUTH_TOKEN,
  );
} else if (command === "validate") {
  validateLock(read(args[0]));
} else if (command === "check") {
  const current = validateLock(read(args[0]));
  const result = propose(
    current,
    await readFeed(
      process.env.RELEASE_FEED_URL,
      process.env.RELEASE_FEED_TOKEN,
    ),
  );
  if (result.changed) write(args[0], result.lock);
  const notes = result.changed
    ? result.lock.components
        .filter(
          (c) =>
            current.components.find((x) => x.id === c.id).version !== c.version,
        )
        .map(
          (c) =>
            `- ${c.id}: ${c.version}${c.breaking ? " (breaking)" : ""}\n  Release notes: ${c.notesUrl}\n  Migration guidance: ${c.migrationNotes}`,
        )
        .join("\n")
    : result.blocked.join("\n");
  fs.writeFileSync(
    args[1],
    `Update the client's pinned foundation and module releases. Deployment remains manual.\n\n${notes}\n\nReview dependency lock changes and run the client validation workflow before merging.\n`,
  );
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `changed=${result.changed}\nblocked=${result.blocked.length > 0}\n`,
    );
  if (result.blocked.length) {
    console.error(
      "Available releases require incompatible component changes; pins were preserved.",
    );
    process.exitCode = 2;
  }
} else
  throw new Error(
    "Expected init-client, module, bundle, digest, foundation, publish, compose, validate or check.",
  );
