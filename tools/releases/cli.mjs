import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  httpsUrl,
  sha256,
  validateRelease,
} from "./contracts.mjs";

const [command, ...args] = process.argv.slice(2);
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) =>
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
if (command === "module") {
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
      artifact: { package: args[1], sha256: "0".repeat(64), downloadUrl: args[3] },
    }),
  );
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
} else
  throw new Error(
    "Expected module, digest, foundation or publish.",
  );
