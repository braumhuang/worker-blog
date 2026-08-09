import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv, BlogMeta } from "./types";
import { getThemeComponents } from "./views/themes/theme";
import { renderFaviconSvg } from "./lib/favicon";
import { getOptions } from "./lib/options";
import { dbAll } from "./lib/db";
import { navigationItemsFromOptions } from "./lib/navigation";
import { adminRoutes } from "./routes/admin";
import { publicRoutes } from "./routes/public";

const app = new Hono<AppEnv>();

app.use(
  "*",
  secureHeaders({
    xFrameOptions: "SAMEORIGIN",
    referrerPolicy: "strict-origin-when-cross-origin",
  }),
);

app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (!url.hostname.startsWith("www.")) return next();
  const options = await getOptions(c.env.BLOG_DB);
  if (options.www_redirect !== "true") return next();
  url.hostname = url.hostname.replace(/^www\./, "");
  return c.redirect(url.toString(), 301);
});

app.get("/favicon.svg", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  return c.body(renderFaviconSvg(options), 200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
});

function parseByteRange(
  value: string,
  size: number,
): { offset: number; length: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match) return null;
  const startText = match[1];
  const endText = match[2];
  if (!startText && !endText) return null;
  if (!startText) {
    const suffix = Number.parseInt(endText, 10);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    const length = Math.min(suffix, size);
    return { offset: size - length, length };
  }
  const start = Number.parseInt(startText, 10);
  const end = endText ? Number.parseInt(endText, 10) : size - 1;
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    start >= size ||
    end < start
  )
    return null;
  return { offset: start, length: Math.min(end, size - 1) - start + 1 };
}

app.get("/uploads/*", async (c) => {
  let key = "";
  try {
    key = decodeURIComponent(c.req.path.slice("/uploads/".length));
  } catch {
    return c.text("Bad Request", 400);
  }
  if (!key) return c.notFound();
  const rangeHeader = c.req.header("Range");
  if (rangeHeader) {
    const head = await c.env.BLOG_R2.head(key);
    if (!head) return c.notFound();
    const range = parseByteRange(rangeHeader, head.size);
    if (!range)
      return c.body(null, 416, { "Content-Range": `bytes */${head.size}` });
    const object = await c.env.BLOG_R2.get(key, { range });
    if (!object || !("body" in object)) return c.notFound();
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Content-Range",
      `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`,
    );
    headers.set("Content-Length", String(range.length));
    if (!headers.has("Cache-Control"))
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(object.body, { status: 206, headers });
  }
  const object = await c.env.BLOG_R2.get(key);
  if (!object || !("body" in object)) return c.notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(object.size));
  if (!headers.has("Cache-Control"))
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});

app.route("/", adminRoutes);
app.route("/", publicRoutes);

app.notFound(async (c) => {
  if (c.req.path.startsWith("/admin")) return c.text("Not Found", 404);
  try {
    const options = await getOptions(c.env.BLOG_DB);
    const { Base, NotFound } = getThemeComponents(options.site_theme);
    const categories = navigationItemsFromOptions(options).some(
      (item) => item.id === "categories" && item.visible,
    )
      ? await dbAll<BlogMeta>(
          c.env.BLOG_DB,
          "SELECT * FROM blog_metas WHERE type='category' ORDER BY count DESC,name COLLATE NOCASE",
        )
      : [];
    const tags =
      options.site_theme === "vermillion"
        ? await dbAll<BlogMeta>(
            c.env.BLOG_DB,
            "SELECT * FROM blog_metas WHERE type='tag' ORDER BY count DESC,name COLLATE NOCASE LIMIT 60",
          )
        : [];
    return c.html(
      <Base
        options={options}
        title="页面不存在"
        categories={categories}
        tags={tags}
      >
        <NotFound />
      </Base>,
      404,
    );
  } catch {
    return c.text("404 Not Found", 404);
  }
});

app.onError((error, c) => {
  console.error(error);
  return c.req.path.startsWith("/admin")
    ? c.text("服务器内部错误，请检查 Worker 日志。", 500)
    : c.text("服务器内部错误", 500);
});

export default app;
