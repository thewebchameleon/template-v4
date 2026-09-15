import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from "@angular/ssr/node";
import express from "express";
import { join } from "node:path";
import { contactLimiter } from "./server/contact-limit.mjs";
import {
  createCmsCache,
  samplePosts,
  sampleArticle,
} from "./server/content.mjs";

const app = express();
const angular = new AngularNodeAppEngine();
const api = (process.env["WEBSITE_API_URL"] ?? "http://localhost:5101").replace(
  /\/$/,
  "",
);
const cache = createCmsCache();
const allowContact = contactLimiter();
if (process.env["WEBSITE_TRUSTED_PROXIES"])
  app.set(
    "trust proxy",
    process.env["WEBSITE_TRUSTED_PROXIES"]!.split(",").map((value) =>
      value.trim(),
    ),
  );
const get = (path: string) =>
  fetch(api + "/api/v1/website" + path, { signal: AbortSignal.timeout(4000) });
async function state() {
  const response = await get("");
  if (!response.ok) throw new Error("Website state unavailable");
  const site = await response.json();
  if (!site.enabled || !site.cmsEnabled) cache.clear();
  return site;
}
app.disable("x-powered-by");
app.get("/healthz", (_req, res) => res.type("text/plain").send("ok"));
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
async function pageData(path: string, pageValue = "1") {
  try {
    const site = await state();
    if (!site.enabled) return { site, kind: "coming-soon" };
    const pageNumber = Math.max(
      1,
      Math.min(10000, Math.floor(Number(pageValue)) || 1),
    );
    let kind = "not-found";
    let sections: unknown = [];
    let blog: unknown = null;
    let article: unknown = null;
    if (path === "/") {
      kind = "home";
      if (site.cmsEnabled)
        sections =
          (await cache.read("sections", [], () => get("/cms/sections"))) ?? [];
    } else if (path === "/contact") kind = "contact";
    else if (path === "/blog") {
      kind = "blog";
      const fallback = {
        items: pageNumber === 1 ? samplePosts : [],
        total: samplePosts.length,
        pageNumber,
        pageSize: 10,
      };
      blog = site.cmsEnabled
        ? await cache.read("blog:" + pageNumber, fallback, () =>
            get("/cms/blog?pageNumber=" + pageNumber),
          )
        : fallback;
    } else if (/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)) {
      const slug = path.substring(6);
      article = site.cmsEnabled
        ? await cache.read("article:" + slug, sampleArticle(slug), () =>
            get("/cms/blog/" + slug),
          )
        : sampleArticle(slug);
      if (article && typeof article === "object" && "article" in article)
        article = { ...article, summary: article.article };
      kind = article ? "article" : "not-found";
    }
    return { site, kind, sections, blog, article };
  } catch {
    return { site: { enabled: false }, kind: "unavailable" };
  }
}
app.get("/_site/page", async (req, res) => {
  const page = await pageData(
    typeof req.query["path"] === "string" ? req.query["path"] : "/",
    String(req.query["page"] ?? "1"),
  );
  res.status(page.kind === "unavailable" ? 503 : 200).json(page);
});
app.post(
  "/_site/contact",
  express.json({ limit: "12kb" }),
  async (req, res) => {
    if (!allowContact(req.ip ?? req.socket.remoteAddress ?? "unknown")) {
      res.setHeader("Retry-After", "600");
      res.sendStatus(429);
      return;
    }
    try {
      const site = await state();
      if (!site.enabled || !site.contactEnabled) {
        res.sendStatus(404);
        return;
      }
      // Public submissions carry no admin cookies or credentials. Validate browser origin when present.
      if (
        req.headers.origin &&
        req.headers.origin !== new URL(site.details.publicUrl).origin &&
        !(
          process.env["NODE_ENV"] !== "production" &&
          /^http:\/\/localhost:4300$/.test(req.headers.origin)
        )
      ) {
        res.sendStatus(403);
        return;
      }
      const response = await fetch(api + "/api/v1/website/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(10000),
      });
      res
        .status(response.status)
        .type("application/json")
        .send(await response.text());
    } catch {
      res.sendStatus(503);
    }
  },
);
app.get("/api/v1/website/images/:id", async (req, res) => {
  if (!/^[a-f0-9-]{36}$/i.test(req.params.id)) {
    res.sendStatus(404);
    return;
  }
  try {
    const response = await get("/images/" + req.params.id);
    res
      .status(response.status)
      .type(response.headers.get("content-type") ?? "application/octet-stream")
      .send(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.sendStatus(503);
  }
});
const xml = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
app.get("/robots.txt", async (_req, res) => {
  try {
    const site = await state();
    res
      .type("text/plain")
      .send(
        site.enabled
          ? `User-agent: *\nAllow: /\nDisallow: /_site/\nSitemap: ${site.details.publicUrl.replace(/\/$/, "")}/sitemap.xml\n`
          : "User-agent: *\nDisallow: /\n",
      );
  } catch {
    res.status(503).type("text/plain").send("User-agent: *\nDisallow: /\n");
  }
});
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const site = await state();
    if (!site.enabled) {
      res.status(404).end();
      return;
    }
    const paths = ["/", "/blog", "/contact"];
    if (!site.cmsEnabled)
      paths.push(...samplePosts.map((x) => "/blog/" + x.slug));
    else {
      // Do not index stale or unpublished articles using the outage cache.
      for (let page = 1; page <= 10000; page++) {
        const response = await get("/cms/blog?pageNumber=" + page);
        if (!response.ok) throw new Error("Blog unavailable");
        const blog = await response.json();
        paths.push(
          ...blog.items.map((x: { slug: string }) => "/blog/" + x.slug),
        );
        if (page * 10 >= blog.total) break;
      }
    }
    res
      .type("application/xml")
      .send(
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          paths
            .map(
              (path) =>
                "<url><loc>" +
                xml(site.details.publicUrl.replace(/\/$/, "") + path) +
                "</loc></url>",
            )
            .join("") +
          "</urlset>",
      );
  } catch {
    res.sendStatus(503);
  }
});
app.use(
  express.static(join(import.meta.dirname, "../browser"), {
    index: false,
    redirect: false,
    maxAge: "1y",
  }),
);
app.use(async (req, res, next) => {
  try {
    const page = await pageData(req.path, String(req.query["page"] ?? "1"));
    const response = await angular.handle(req, { page });
    if (response) await writeResponseToNodeResponse(response, res);
    else next();
  } catch (error) {
    next(error);
  }
});
if (isMainModule(import.meta.url)) app.listen(process.env["PORT"] ?? 4300);
export const reqHandler = createNodeRequestHandler(app);
