import { Hono } from "hono";
import type { Context } from "hono";
import type {
  AppEnv,
  BlogComment,
  BlogContent,
  BlogLink,
  BlogMeta,
  ContentWithMeta,
  OptionMap,
} from "../types";
import { dbAll, dbFirst, dbRun } from "../lib/db";
import { getOptions } from "../lib/options";
import {
  customNavigationItemForSlug,
  navigationItemsFromOptions,
} from "../lib/navigation";
import { renderMarkdown } from "../lib/markdown";
import {
  excerptOf,
  isoDate,
  nowSeconds,
  positiveInt,
  resolveUploadedUrls,
} from "../lib/utils";
import { getThemeComponents } from "../views/themes/theme";

type CommentPageData = {
  comments: BlogComment[];
  page: number;
  total: number;
  totalPages: number;
};

type MemoActivityDay = {
  day: string;
  count: number;
  level: number;
};

export const publicRoutes = new Hono<AppEnv>();
type MetaJoin = BlogMeta & { cid: number };

async function navigationCategories(
  db: D1Database,
  options: OptionMap,
): Promise<BlogMeta[]> {
  const enabled = navigationItemsFromOptions(options).some(
    (item) => item.id === "categories" && item.visible,
  );
  if (!enabled) return [];
  return dbAll<BlogMeta>(
    db,
    "SELECT * FROM blog_metas WHERE type='category' ORDER BY count DESC,name COLLATE NOCASE",
  );
}

async function enrichContents(
  db: D1Database,
  contents: BlogContent[],
): Promise<ContentWithMeta[]> {
  if (!contents.length) return [];
  const ids = contents.map((item) => item.cid);
  const rows = await dbAll<MetaJoin>(
    db,
    `SELECT r.cid,m.mid,m.name,m.slug,m.type,m.description,m.count FROM blog_relationships r JOIN blog_metas m ON m.mid=r.mid WHERE r.cid IN (${ids.map(() => "?").join(",")}) ORDER BY m.name COLLATE NOCASE`,
    ...ids,
  );
  const grouped = new Map<number, BlogMeta[]>();
  for (const row of rows)
    grouped.set(row.cid, [...(grouped.get(row.cid) ?? []), row]);
  return contents.map((content) => {
    const metas = grouped.get(content.cid) ?? [];
    return {
      ...content,
      categories: metas.filter((meta) => meta.type === "category"),
      tags: metas.filter((meta) => meta.type === "tag"),
    };
  });
}

async function commentsForContent(
  c: Context<AppEnv>,
  content: BlogContent,
  options: OptionMap,
): Promise<CommentPageData> {
  const page = positiveInt(c.req.query("comment_page"), 1, 100000);
  const perPage = positiveInt(options.comments_per_page, 20, 100);
  const count = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    "SELECT COUNT(*) AS total FROM blog_comments WHERE cid = ?",
    content.cid,
  );
  const total = count?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const comments = await dbAll<BlogComment>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_comments WHERE cid = ? ORDER BY created DESC, id DESC LIMIT ? OFFSET ?",
    content.cid,
    perPage,
    (safePage - 1) * perPage,
  );
  return { comments, page: safePage, total, totalPages };
}

async function listByMeta(
  c: Context<AppEnv>,
  type: "tag" | "category",
  slug: string,
) {
  const options = await getOptions(c.env.BLOG_DB);
  const { Base, Tag, Category } = getThemeComponents(options.site_theme);
  const meta = await dbFirst<BlogMeta>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_metas WHERE type=? AND slug=? LIMIT 1",
    type,
    slug,
  );
  if (!meta) return c.notFound();
  const now = nowSeconds();
  const page = positiveInt(c.req.query("page"), 1, 100000);
  const perPage = positiveInt(options.posts_per_page, 10, 100);
  const countRow = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    `SELECT COUNT(*) AS total FROM blog_contents c JOIN blog_relationships r ON r.cid=c.cid WHERE r.mid=? AND c.type='post' AND c.status='publish' AND c.released<=?`,
    meta.mid,
    now,
  );
  const total = countRow?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const rows = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    `SELECT c.* FROM blog_contents c JOIN blog_relationships r ON r.cid=c.cid WHERE r.mid=? AND c.type='post' AND c.status='publish' AND c.released<=? ORDER BY c.released DESC LIMIT ? OFFSET ?`,
    meta.mid,
    now,
    perPage,
    (safePage - 1) * perPage,
  );
  const posts = await enrichContents(c.env.BLOG_DB, rows);
  const categories = await navigationCategories(c.env.BLOG_DB, options);
  return c.html(
    <Base
      options={options}
      title={meta.name}
      active={type === "tag" ? "tags" : "categories"}
      categories={categories}
    >
      {type === "tag" ? (
        <Tag
          meta={meta}
          posts={posts}
          total={total}
          page={safePage}
          totalPages={totalPages}
          timeZone={options.site_timezone}
          fileCdnUrl={options.file_cdn_url}
        />
      ) : (
        <Category
          meta={meta}
          posts={posts}
          total={total}
          page={safePage}
          totalPages={totalPages}
          timeZone={options.site_timezone}
          fileCdnUrl={options.file_cdn_url}
        />
      )}
    </Base>,
  );
}

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char] ?? char,
  );
}

function absoluteFeedHtml(html: string, origin: string): string {
  return html.replace(
    /(src|href|poster)=(['"])(\/(?!\/)[^'"<>]*)\2/g,
    (_match, attr, quote, path) => `${attr}=${quote}${origin}${path}${quote}`,
  );
}

publicRoutes.get("/atom.xml", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const now = nowSeconds();
  const posts = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE type='post' AND status='publish' AND released<=? ORDER BY released DESC, cid DESC LIMIT 20",
    now,
  );
  const origin = new URL(c.req.url).origin;
  const feedUrl = `${origin}/atom.xml`;
  const homeUrl = `${origin}/`;
  const updatedSeconds = posts.length
    ? Math.max(...posts.map((post) => Math.max(post.modified, post.released)))
    : now;
  const entries = posts
    .map((post) => {
      const url = `${origin}/post/${encodeURIComponent(post.slug)}/`;
      const html = absoluteFeedHtml(
        resolveUploadedUrls(renderMarkdown(post.text), options.file_cdn_url),
        origin,
      );
      return `<entry><title>${escapeXml(post.title || "未命名文章")}</title><id>${escapeXml(url)}</id><link href="${escapeXml(url)}"/><updated>${new Date(Math.max(post.modified, post.released) * 1000).toISOString()}</updated><published>${new Date(post.released * 1000).toISOString()}</published><summary>${escapeXml(excerptOf(post.text, 240))}</summary><content type="html">${escapeXml(html)}</content></entry>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeXml(options.site_title)}</title><subtitle>${escapeXml(options.site_description)}</subtitle><id>${escapeXml(homeUrl)}</id><link href="${escapeXml(homeUrl)}"/><link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml"/><updated>${new Date(updatedSeconds * 1000).toISOString()}</updated><author><name>${escapeXml(options.site_title)}</name></author>${entries}</feed>`;
  return c.body(xml, 200, {
    "Content-Type": "application/atom+xml; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
});

publicRoutes.get("/memos", (c) => c.redirect("/memos/", 308));
publicRoutes.get("/archives", (c) => c.redirect("/archives/", 308));
publicRoutes.get("/categories", (c) => c.redirect("/categories/", 308));
publicRoutes.get("/tags", (c) => c.redirect("/tags/", 308));
publicRoutes.get("/links", (c) => c.redirect("/links/", 308));
publicRoutes.get("/post/:slug", (c) =>
  c.redirect(`/post/${encodeURIComponent(c.req.param("slug"))}/`, 308),
);

publicRoutes.get("/", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { Base, Index: HomePage } = getThemeComponents(options.site_theme);
  const now = nowSeconds();
  const page = positiveInt(c.req.query("page"), 1, 100000);
  const perPage = positiveInt(options.posts_per_page, 10, 100);
  const count = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    `SELECT COUNT(*) AS total FROM blog_contents WHERE type='post' AND status='publish' AND released<=?`,
    now,
  );
  const totalPages = Math.max(1, Math.ceil((count?.total ?? 0) / perPage));
  const safePage = Math.min(page, totalPages);
  const rows = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    `SELECT * FROM blog_contents WHERE type='post' AND status='publish' AND released<=? ORDER BY released DESC LIMIT ? OFFSET ?`,
    now,
    perPage,
    (safePage - 1) * perPage,
  );
  const posts = await enrichContents(c.env.BLOG_DB, rows);
  return c.html(
    <Base
      options={options}
      active="home"
      categories={await navigationCategories(c.env.BLOG_DB, options)}
    >
      <HomePage
        posts={posts}
        timeZone={options.site_timezone}
        fileCdnUrl={options.file_cdn_url}
        page={safePage}
        totalPages={totalPages}
      />
    </Base>,
  );
});

publicRoutes.get("/post/:slug/", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { About, Base, Comments, Page, Post } = getThemeComponents(
    options.site_theme,
  );
  const content = await dbFirst<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE slug=? AND type IN ('post','page') AND status='publish' AND released<=? LIMIT 1",
    c.req.param("slug"),
    nowSeconds(),
  );
  if (!content) return c.notFound();
  const [item] = await enrichContents(c.env.BLOG_DB, [content]);
  const navigationItem = customNavigationItemForSlug(options, content.slug);
  const template =
    navigationItem?.template ?? (content.type === "page" ? "page" : undefined);
  const html = resolveUploadedUrls(
    renderMarkdown(content.text),
    options.file_cdn_url,
  );
  const commentsEnabled = options.comments_enabled === "true";
  const commentData = commentsEnabled
    ? await commentsForContent(c, content, options)
    : null;
  const saved = c.req.query("comment") === "saved";
  if (commentData && c.req.header("X-Requested-With") === "comments") {
    return c.html(
      <Comments
        content={content}
        {...commentData}
        timeZone={options.site_timezone}
        saved={saved}
      />,
    );
  }
  return c.html(
    <Base
      options={options}
      title={content.title}
      active={navigationItem?.id}
      description={excerptOf(content.text, 150)}
      categories={await navigationCategories(c.env.BLOG_DB, options)}
    >
      {template === "about" ? (
        <About options={options} html={html} />
      ) : template === "page" ? (
        <Page html={html} />
      ) : (
        <Post content={content} item={item} html={html} options={options} />
      )}
      {commentData ? (
        <Comments
          content={content}
          {...commentData}
          timeZone={options.site_timezone}
          saved={saved}
        />
      ) : null}
    </Base>,
  );
});

publicRoutes.post("/post/:slug/comments", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { Comments } = getThemeComponents(options.site_theme);
  if (options.comments_enabled !== "true") return c.notFound();
  const content = await dbFirst<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE slug=? AND type IN ('post','page') AND status='publish' AND released<=? LIMIT 1",
    c.req.param("slug"),
    nowSeconds(),
  );
  if (!content) return c.notFound();
  const form = await c.req.formData();
  const name = String(form.get("name") ?? "")
    .trim()
    .slice(0, 100);
  const email = String(form.get("email") ?? "")
    .trim()
    .slice(0, 200);
  const text = String(form.get("text") ?? "")
    .trim()
    .slice(0, 5000);
  let site = String(form.get("site") ?? "")
    .trim()
    .slice(0, 500);
  if (!name || !email || !text)
    return c.text("名字、邮箱和评论内容不能为空。", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return c.text("邮箱格式不正确。", 400);
  if (site) {
    if (!/^https?:\/\//i.test(site)) site = `https://${site}`;
    try {
      const parsed = new URL(site);
      if (!["http:", "https:"].includes(parsed.protocol))
        throw new Error("invalid protocol");
      site = parsed.toString();
    } catch {
      return c.text("网站地址格式不正确。", 400);
    }
  }
  await dbRun(
    c.env.BLOG_DB,
    "INSERT INTO blog_comments(name, email, site, text, created, cid) VALUES(?, ?, ?, ?, ?, ?)",
    name,
    email,
    site,
    text,
    nowSeconds(),
    content.cid,
  );
  if (c.req.header("X-Requested-With") === "comments") {
    const commentData = await commentsForContent(c, content, options);
    return c.html(
      <Comments
        content={content}
        {...commentData}
        timeZone={options.site_timezone}
        saved
      />,
    );
  }
  return c.redirect(
    `/post/${encodeURIComponent(content.slug)}/?comment=saved#comments`,
  );
});

publicRoutes.get("/memos/", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { Base, Memos } = getThemeComponents(options.site_theme);
  const now = nowSeconds();
  const page = positiveInt(c.req.query("page"), 1, 100000);
  const perPage = positiveInt(options.memos_per_page, 20, 100);
  const countRow = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    "SELECT COUNT(*) AS total FROM blog_contents WHERE type='memo' AND status='publish' AND released<=?",
    now,
  );
  const total = countRow?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const memoRows = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE type='memo' AND status='publish' AND released<=? ORDER BY released DESC LIMIT ? OFFSET ?",
    now,
    perPage,
    (safePage - 1) * perPage,
  );
  const memos = await enrichContents(c.env.BLOG_DB, memoRows);
  const activityRows = await dbAll<{ released: number }>(
    c.env.BLOG_DB,
    "SELECT released FROM blog_contents WHERE type='memo' AND status='publish' AND released<=? AND released>=?",
    now,
    now - 370 * 86400,
  );
  const activity = new Map<string, number>();
  for (const row of activityRows) {
    const day = isoDate(row.released, options.site_timezone);
    activity.set(day, (activity.get(day) ?? 0) + 1);
  }
  const today = isoDate(now, options.site_timezone);
  const [year, month, day] = today.split("-").map(Number);
  const days: MemoActivityDay[] = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (364 - index)));
    const dateKey = date.toISOString().slice(0, 10);
    const count = activity.get(dateKey) ?? 0;
    return {
      day: dateKey,
      count,
      level:
        count === 0
          ? 0
          : count === 1
            ? 1
            : count === 2
              ? 2
              : count <= 4
                ? 3
                : 4,
    };
  });
  return c.html(
    <Base
      options={options}
      title="闪念"
      active="memos"
      categories={await navigationCategories(c.env.BLOG_DB, options)}
    >
      <Memos
        memos={memos}
        days={days}
        total={total}
        page={safePage}
        totalPages={totalPages}
        timeZone={options.site_timezone}
        fileCdnUrl={options.file_cdn_url}
      />
    </Base>,
  );
});

publicRoutes.get("/archives/", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { Archives, Base } = getThemeComponents(options.site_theme);
  const now = nowSeconds();
  const page = positiveInt(c.req.query("page"), 1, 100000);
  const perPage = positiveInt(options.archives_per_page, 50, 100);
  const countRow = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    `SELECT COUNT(*) AS total FROM blog_contents WHERE type='post' AND status='publish' AND released<=?`,
    now,
  );
  const total = countRow?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const posts = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    `SELECT * FROM blog_contents WHERE type='post' AND status='publish' AND released<=? ORDER BY released DESC LIMIT ? OFFSET ?`,
    now,
    perPage,
    (safePage - 1) * perPage,
  );
  const tagCount = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    "SELECT COUNT(*) AS total FROM blog_metas WHERE type='tag'",
  );
  const years = new Map<string, ContentWithMeta[]>();
  for (const post of await enrichContents(c.env.BLOG_DB, posts)) {
    const year = isoDate(post.released, options.site_timezone).slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return c.html(
    <Base
      options={options}
      title="归档"
      active="archives"
      categories={await navigationCategories(c.env.BLOG_DB, options)}
    >
      <Archives
        years={years}
        total={total}
        tagTotal={tagCount?.total ?? 0}
        page={safePage}
        totalPages={totalPages}
        timeZone={options.site_timezone}
      />
    </Base>,
  );
});

publicRoutes.get("/categories/", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { Base, Categories } = getThemeComponents(options.site_theme);
  const categories = await dbAll<BlogMeta>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_metas WHERE type='category' ORDER BY count DESC,name COLLATE NOCASE",
  );
  return c.html(
    <Base
      options={options}
      title="分类"
      active="categories"
      categories={categories}
    >
      <Categories categories={categories} />
    </Base>,
  );
});

publicRoutes.get("/tags/", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { Base, Tags } = getThemeComponents(options.site_theme);
  const tags = await dbAll<BlogMeta>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_metas WHERE type='tag' ORDER BY count DESC,name COLLATE NOCASE",
  );
  return c.html(
    <Base
      options={options}
      title="标签"
      active="tags"
      categories={await navigationCategories(c.env.BLOG_DB, options)}
    >
      <Tags tags={tags} />
    </Base>,
  );
});

publicRoutes.get("/tag/:slug/", (c) =>
  listByMeta(c, "tag", c.req.param("slug")),
);
publicRoutes.get("/category/:slug/", (c) =>
  listByMeta(c, "category", c.req.param("slug")),
);

publicRoutes.get("/links/", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const { Base, Links } = getThemeComponents(options.site_theme);
  const links = await dbAll<BlogLink>(
    c.env.BLOG_DB,
    'SELECT id,name,url,icon,info,"order" AS "order" FROM blog_links ORDER BY "order" DESC,id DESC',
  );
  return c.html(
    <Base
      options={options}
      title="导航"
      active="links"
      categories={await navigationCategories(c.env.BLOG_DB, options)}
    >
      <Links links={links} fileCdnUrl={options.file_cdn_url} />
    </Base>,
  );
});

publicRoutes.get("/api/search", async (c) => {
  const q = c.req.query("q")?.trim();
  if (!q) return c.json({ items: [] });
  const like = `%${q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
  const rows = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    "SELECT DISTINCT c.* FROM blog_contents c LEFT JOIN blog_relationships r ON r.cid=c.cid LEFT JOIN blog_metas m ON m.mid=r.mid WHERE c.status='publish' AND c.released<=? AND c.type IN ('post','page','memo') AND (c.title LIKE ? ESCAPE '\\' OR c.text LIKE ? ESCAPE '\\' OR m.name LIKE ? ESCAPE '\\') ORDER BY c.released DESC LIMIT 12",
    nowSeconds(),
    like,
    like,
    like,
  );
  return c.json({
    items: rows.map((row) => ({
      title: row.title,
      excerpt: excerptOf(row.text, 90),
      url:
        row.type === "memo"
          ? `/memos/#memo-${row.cid}`
          : `/post/${encodeURIComponent(row.slug)}/`,
    })),
  });
});
