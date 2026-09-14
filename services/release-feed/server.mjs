import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import {
  boundedBody,
  sha256,
  validateRelease,
} from "../../tools/releases/contracts.mjs";

// Configuration is mounted read-only. Only hashes of high-entropy bearer credentials are stored.
export function createFeed({ dataDirectory, credentialsFile }) {
  return http.createServer(
    { requestTimeout: 30000, headersTimeout: 10000, maxHeaderSize: 8192 },
    async (req, res) => {
      const send = (status, data) => {
        res.writeHead(status, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(JSON.stringify(data));
      };
      try {
        if (req.method === "GET" && req.url === "/healthz")
          return send(200, { status: "ready" });
        const config = JSON.parse(await fs.readFile(credentialsFile, "utf8"));
        if (!Array.isArray(config.credentials))
          throw new Error("Invalid credential configuration.");
        const authorization = req.headers.authorization ?? "";
        const digest = Buffer.from(
          sha256(
            authorization.startsWith("Bearer ") ? authorization.slice(7) : "",
          ),
          "hex",
        );
        const identity = config.credentials.find(
          (c) =>
            /^[a-f0-9]{64}$/.test(c.sha256) &&
            crypto.timingSafeEqual(Buffer.from(c.sha256, "hex"), digest),
        );
        if (
          !authorization.startsWith("Bearer ") ||
          authorization.length < 39 ||
          !identity ||
          identity.disabled ||
          !Array.isArray(identity.modules) ||
          !["client", "publisher"].includes(identity.role)
        )
          return send(401, { error: "unauthorized" });
        if (req.method === "GET" && req.url === "/v1/releases") {
          const releases = [];
          for (const file of (await fs.readdir(dataDirectory)).sort()) {
            if (!file.endsWith(".json")) continue;
            const release = validateRelease(
              JSON.parse(
                await fs.readFile(path.join(dataDirectory, file), "utf8"),
              ),
            );
            if (identity.modules.includes(release.id)) releases.push(release);
          }
          if (releases.length > 1000)
            return send(503, { error: "catalog_limit" });
          return send(200, { schemaVersion: 1, releases });
        }
        if (
          req.method === "POST" &&
          req.url === "/v1/releases" &&
          identity.role === "publisher"
        ) {
          let release;
          try {
            release = validateRelease(
              JSON.parse((await boundedBody(req, 32768)).toString()),
            );
          } catch {
            return send(400, { error: "invalid_release" });
          }
          if (!identity.modules.includes(release.id))
            return send(403, { error: "forbidden" });
          const file = path.join(
            dataDirectory,
            `${release.id}-${release.version}.json`,
          );
          const content = JSON.stringify(release);
          // Atomic, create-only publication; a failed writer never leaves partial release metadata.
          const temporary = path.join(
            dataDirectory,
            `${crypto.randomUUID()}.tmp`,
          );
          await fs.writeFile(temporary, content, { flag: "wx", mode: 0o600 });
          try {
            await fs.link(temporary, file);
          } catch (error) {
            if (error.code !== "EEXIST") throw error;
            if ((await fs.readFile(file, "utf8")) !== content)
              return send(409, { error: "immutable_release" });
            return send(200, { status: "already_published" });
          } finally {
            await fs.unlink(temporary);
          }
          return send(201, { status: "published" });
        }
        return send(404, { error: "not_found" });
      } catch {
        if (!res.headersSent) send(503, { error: "temporarily_unavailable" });
        else res.destroy();
      }
    },
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const dataDirectory = process.env.RELEASE_DATA ?? "/data";
  const credentialsFile =
    process.env.RELEASE_CREDENTIALS ?? "/run/secrets/release-credentials.json";
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.access(credentialsFile);
  createFeed({ dataDirectory, credentialsFile }).listen(
    Number(process.env.PORT ?? 8080),
    "0.0.0.0",
  );
}
