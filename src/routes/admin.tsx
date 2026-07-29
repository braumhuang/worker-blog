import { Hono } from "hono";
import type {
  AppEnv,
  AttachmentInfo,
  AttachmentTemplate,
  BlogContent,
  BlogLink,
  BlogMeta,
  ContentStatus,
  ContentType,
  MetaType,
  NavigationItem,
  OptionMap,
} from "../types";
import {
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
  sameOriginOnly,
  verifyCredentials,
} from "../lib/auth";
import { dbAll, dbFirst, dbRun } from "../lib/db";
import { normalizeFaviconColor, normalizeFaviconText } from "../lib/favicon";
import { renderMarkdown } from "../lib/markdown";
import {
  getOptions,
  normalizeFileCdnUrl,
  refreshOptionsCache,
  saveOptions,
  TIMEZONE_VALUES,
} from "../lib/options";
import {
  navigationItemRules,
  navigationSectionsFromOptions,
  normalizeNavigationItems,
  normalizeNavigationOrder,
  normalizeNavigationUrl,
  serializeNavigationItems,
} from "../lib/navigation";
import {
  normalizeAttachmentTemplates,
  normalizeAttachmentTemplateType,
  serializeAttachmentTemplates,
} from "../lib/attachment-templates";
import { parseEmojiItems, serializeEmojiItems } from "../lib/emojis";
import { normalizeNotificationEmail } from "../lib/comment-notification";
import {
  attachmentInfo,
  attachmentPath,
  draftSlug,
  formatDate,
  insertionForAttachment,
  intValue,
  normalizeImageCompressionQuality,
  nowSeconds,
  parseDatetimeLocal,
  positiveInt,
  publicAttachmentUrl,
  resolveUploadedUrls,
  safeReturnTo,
  slugify,
} from "../lib/utils";
import { LoginPage } from "../views/admin/login";
import { DashboardPage } from "../views/admin/dashboard";
import { NavigationPage } from "../views/admin/navigation";
import { ContentsPage } from "../views/admin/contents";
import { ContentEditPage } from "../views/admin/content";
import { MetasPage } from "../views/admin/metas";
import { AttachmentsPage } from "../views/admin/attachments";
import { AttachmentTemplatesPage } from "../views/admin/attachment-templates";
import { CommentsPage, type AdminCommentRow } from "../views/admin/comments";
import { CommentEditPage } from "../views/admin/comment";
import { LinksPage } from "../views/admin/links";
import { OptionsPage } from "../views/admin/options";
import { normalizeThemeName } from "../theme";

export const adminRoutes = new Hono<AppEnv>();

const DATA_EXPORT_VERSION = 1;

function validContentType(
  value: string | undefined,
  fallback: ContentType = "post",
): ContentType {
  return ["post", "page", "atta", "memo"].includes(value ?? "")
    ? (value as ContentType)
    : fallback;
}

function validMetaType(value: string | undefined): MetaType {
  return value === "category" ? "category" : "tag";
}

async function uniqueContentSlug(
  db: D1Database,
  type: ContentType,
  requested: string,
  cid: number,
): Promise<string> {
  const base = slugify(requested);
  let candidate = base;
  let index = 2;
  const publicContent = type === "post" || type === "page";
  const sql = publicContent
    ? "SELECT cid FROM blog_contents WHERE type IN ('post','page') AND slug = ? AND cid != ? LIMIT 1"
    : "SELECT cid FROM blog_contents WHERE type = ? AND slug = ? AND cid != ? LIMIT 1";
  const exists = (slug: string) =>
    publicContent
      ? dbFirst<{ cid: number }>(db, sql, slug, cid)
      : dbFirst<{ cid: number }>(db, sql, type, slug, cid);
  while (await exists(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

async function findOrCreateTag(db: D1Database, name: string): Promise<number> {
  const found = await dbFirst<{ mid: number }>(
    db,
    "SELECT mid FROM blog_metas WHERE type = 'tag' AND name = ? COLLATE NOCASE LIMIT 1",
    name,
  );
  if (found) return found.mid;
  const base = slugify(name);
  let slug = base;
  let index = 2;
  while (
    await dbFirst<{ mid: number }>(
      db,
      "SELECT mid FROM blog_metas WHERE type = 'tag' AND slug = ? LIMIT 1",
      slug,
    )
  ) {
    slug = `${base}-${index}`;
    index += 1;
  }
  const result = await dbRun(
    db,
    "INSERT INTO blog_metas(name, slug, type, description, count) VALUES(?, ?, 'tag', '', 0)",
    name,
    slug,
  );
  return Number(result.meta.last_row_id);
}

async function contentAttachments(
  db: D1Database,
  parent: number,
): Promise<Array<{ content: BlogContent; info: AttachmentInfo }>> {
  const rows = await dbAll<BlogContent>(
    db,
    "SELECT * FROM blog_contents WHERE type = 'atta' AND parent = ? ORDER BY created DESC",
    parent,
  );
  return rows.flatMap((content) => {
    const info = attachmentInfo(content);
    return info ? [{ content, info }] : [];
  });
}

adminRoutes.get("/admin/login", (c) =>
  c.html(<LoginPage returnTo={safeReturnTo(c.req.query("returnTo"))} />),
);

adminRoutes.post("/admin/login", async (c) => {
  const form = await c.req.formData();
  const name = String(form.get("name") ?? "");
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? "/admin"));
  if (!verifyCredentials(c, name, password))
    return c.html(
      <LoginPage error="用户名或密码错误" returnTo={returnTo} />,
      401,
    );
  await createAdminSession(c);
  c.executionCtx.waitUntil(
    dbRun(
      c.env.BLOG_DB,
      "DELETE FROM blog_sessions WHERE expired <= ?",
      nowSeconds(),
    ).then(() => undefined),
  );
  return c.redirect(returnTo);
});

adminRoutes.use("/admin/*", requireAdmin);
adminRoutes.use("/admin/*", sameOriginOnly);

adminRoutes.get("/admin/logout", async (c) => {
  await destroyAdminSession(c);
  return c.redirect("/admin/login");
});

adminRoutes.get("/admin", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const counts = await dbAll<{
    type: ContentType;
    status: ContentStatus;
    total: number;
  }>(
    c.env.BLOG_DB,
    "SELECT type, status, COUNT(*) AS total FROM blog_contents WHERE type != 'atta' GROUP BY type, status",
  );
  const recent = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE type IN ('post','page','memo') ORDER BY modified DESC LIMIT 8",
  );
  const links = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    "SELECT COUNT(*) AS total FROM blog_links",
  );
  const comments = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    "SELECT COUNT(*) AS total FROM blog_comments",
  );
  return c.html(
    <DashboardPage
      options={options}
      counts={counts}
      recent={recent}
      links={links?.total ?? 0}
      comments={comments?.total ?? 0}
    />,
  );
});

adminRoutes.get("/admin/navigation", async (c) => {
  const sections = navigationSectionsFromOptions(
    await getOptions(c.env.BLOG_DB),
  );
  return c.html(
    <NavigationPage
      fixed={sections.fixed}
      custom={sections.custom}
      saved={Boolean(c.req.query("saved"))}
    />,
  );
});

adminRoutes.post("/admin/navigation", async (c) => {
  const form = await c.req.formData();
  const ids = form
    .getAll("nav_id")
    .map((value: FormDataEntryValue) => String(value).trim())
    .filter(Boolean)
    .slice(0, 60);
  const submitted: NavigationItem[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const rules = navigationItemRules(id);
    const section =
      String(form.get(`nav_section:${id}`) ?? rules.section) === "fixed"
        ? "fixed"
        : "custom";
    submitted.push({
      id,
      name: String(form.get(`nav_name:${id}`) ?? "").trim(),
      url: normalizeNavigationUrl(
        form.get(`nav_url:${id}`),
        id === "about" ? "/post/about" : "/",
      ),
      visible: form.get(`nav_visible:${id}`) === "true" || id === "home",
      section,
      order: normalizeNavigationOrder(form.get(`nav_order:${id}`), 0),
      ...(section === "custom"
        ? {
            template:
              form.get(`nav_template:${id}`) === "about" ? "about" : "page",
          }
        : {}),
    });
  }
  await saveOptions(c.env.BLOG_DB, {
    navigation_menu: serializeNavigationItems(
      normalizeNavigationItems(JSON.stringify(submitted)),
    ),
  });
  return c.redirect("/admin/navigation?saved=1");
});

adminRoutes.get("/admin/contents", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const requestedType = validContentType(c.req.query("type"));
  const type: ContentType = requestedType === "page" ? "post" : requestedType;
  const pageOnly =
    type === "post" &&
    (requestedType === "page" || c.req.query("filter") === "page");
  const status = c.req.query("status") as ContentStatus | undefined;
  const page = positiveInt(c.req.query("page"), 1, 100000);
  const perPage = positiveInt(
    type === "memo"
      ? options.admin_memos_per_page
      : options.admin_contents_per_page,
    25,
    100,
  );
  const statusFilter = ["publish", "draft", "hidden"].includes(status ?? "")
    ? status
    : undefined;
  const clauses: string[] = [];
  const args: unknown[] = [];
  if (type === "memo") {
    clauses.push("type = ?");
    args.push("memo");
  } else if (pageOnly) {
    clauses.push("type = ?");
    args.push("page");
  } else {
    clauses.push("type IN ('post','page')");
  }
  if (statusFilter) {
    clauses.push("status = ?");
    args.push(statusFilter);
  }
  const where = `WHERE ${clauses.join(" AND ")}`;
  const countRow = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    `SELECT COUNT(*) AS total FROM blog_contents ${where}`,
    ...args,
  );
  const total = countRow?.total ?? 0;
  const rows = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    `SELECT * FROM blog_contents ${where} ORDER BY released DESC, cid DESC LIMIT ? OFFSET ?`,
    ...args,
    perPage,
    (page - 1) * perPage,
  );
  return c.html(
    <ContentsPage
      options={options}
      type={type}
      pageOnly={pageOnly}
      statusFilter={statusFilter}
      page={page}
      total={total}
      perPage={perPage}
      rows={rows}
      now={nowSeconds()}
    />,
  );
});

adminRoutes.get("/admin/content/new", async (c) => {
  const type = validContentType(c.req.query("type"));
  if (type === "atta") return c.redirect("/admin/attachments");
  const now = nowSeconds();
  const title =
    type === "memo"
      ? formatDate(now, true, (await getOptions(c.env.BLOG_DB)).site_timezone)
      : "";
  const result = await dbRun(
    c.env.BLOG_DB,
    "INSERT INTO blog_contents(parent, title, slug, created, modified, released, text, type, status) VALUES(0, ?, ?, ?, ?, ?, '', ?, 'draft')",
    title,
    draftSlug(type),
    now,
    now,
    now,
    type,
  );
  return c.redirect(`/admin/content/${Number(result.meta.last_row_id)}`);
});

adminRoutes.get("/admin/content/:cid", async (c) => {
  const cid = intValue(c.req.param("cid"));
  const content = await dbFirst<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE cid = ? LIMIT 1",
    cid,
  );
  if (!content || content.type === "atta") return c.notFound();
  const options = await getOptions(c.env.BLOG_DB);
  const categories =
    content.type === "memo"
      ? []
      : await dbAll<BlogMeta>(
          c.env.BLOG_DB,
          "SELECT * FROM blog_metas WHERE type = 'category' ORDER BY name COLLATE NOCASE",
        );
  const assigned = await dbAll<BlogMeta>(
    c.env.BLOG_DB,
    "SELECT m.* FROM blog_metas m JOIN blog_relationships r ON r.mid = m.mid WHERE r.cid = ? ORDER BY m.name COLLATE NOCASE",
    cid,
  );
  return c.html(
    <ContentEditPage
      content={content}
      options={options}
      categories={categories}
      assignedCategoryIds={
        new Set(
          assigned
            .filter((meta) => meta.type === "category")
            .map((meta) => meta.mid),
        )
      }
      assignedTags={assigned.filter((meta) => meta.type === "tag")}
      attachments={await contentAttachments(c.env.BLOG_DB, cid)}
      templates={normalizeAttachmentTemplates(options.attachment_templates)}
      saved={Boolean(c.req.query("saved"))}
    />,
  );
});

adminRoutes.post("/admin/content/:cid", async (c) => {
  const cid = intValue(c.req.param("cid"));
  const current = await dbFirst<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE cid = ? LIMIT 1",
    cid,
  );
  if (!current || current.type === "atta") return c.notFound();
  const options = await getOptions(c.env.BLOG_DB);
  const form = await c.req.formData();
  const text = String(form.get("text") ?? "");
  const released = parseDatetimeLocal(
    String(form.get("released") ?? ""),
    current.released,
    options.site_timezone,
  );
  const targetType: ContentType =
    current.type === "memo"
      ? "memo"
      : form.get("content_type") === "page"
        ? "page"
        : "post";
  let title = String(form.get("title") ?? "").trim();
  if (targetType === "memo")
    title = formatDate(released, true, options.site_timezone);
  if (!title) title = "未命名";
  const requestedSlug =
    targetType === "memo"
      ? current.slug.includes("-draft-")
        ? `memo-${released}`
        : current.slug
      : String(form.get("slug") ?? "").trim() || title;
  const slug = await uniqueContentSlug(
    c.env.BLOG_DB,
    targetType,
    requestedSlug,
    cid,
  );
  const cover =
    targetType === "memo" ? "" : String(form.get("cover") ?? "").trim();
  const requestedStatus =
    String(form.get("status") ?? "draft") === "publish" ? "publish" : "draft";
  const status: ContentStatus =
    form.get("hidden") === "1" ? "hidden" : requestedStatus;
  const categoryIds =
    targetType === "memo"
      ? []
      : [
          ...new Set(
            form
              .getAll("categories")
              .map((value: FormDataEntryValue) => intValue(value))
              .filter(Boolean),
          ),
        ];
  const tagNames = [
    ...new Set(
      String(form.get("tags") ?? "")
        .split(/[,，]/)
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
  const tagIds: number[] = [];
  for (const name of tagNames)
    tagIds.push(await findOrCreateTag(c.env.BLOG_DB, name));
  await c.env.BLOG_DB.batch([
    c.env.BLOG_DB.prepare(
      "UPDATE blog_contents SET title = ?, slug = ?, cover = ?, modified = ?, released = ?, text = ?, type = ?, status = ? WHERE cid = ?",
    ).bind(
      title,
      slug,
      cover,
      nowSeconds(),
      released,
      text,
      targetType,
      status,
      cid,
    ),
    c.env.BLOG_DB.prepare("DELETE FROM blog_relationships WHERE cid = ?").bind(
      cid,
    ),
    ...[...new Set([...categoryIds, ...tagIds])].map((mid) =>
      c.env.BLOG_DB.prepare(
        "INSERT OR IGNORE INTO blog_relationships(cid, mid) VALUES(?, ?)",
      ).bind(cid, mid),
    ),
  ]);
  return c.redirect(`/admin/content/${cid}?saved=1`);
});

adminRoutes.post("/admin/content/:cid/delete", async (c) => {
  const cid = intValue(c.req.param("cid"));
  const content = await dbFirst<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE cid = ? LIMIT 1",
    cid,
  );
  if (!content) return c.notFound();
  const children = await contentAttachments(c.env.BLOG_DB, cid);
  const keys = children.map(({ info }) => info.key);
  if (content.type === "atta") {
    const info = attachmentInfo(content);
    if (info) keys.push(info.key);
  }
  if (keys.length) await c.env.BLOG_R2.delete(keys);
  await c.env.BLOG_DB.batch([
    c.env.BLOG_DB.prepare("DELETE FROM blog_relationships WHERE cid = ?").bind(
      cid,
    ),
    ...children.map(({ content: child }) =>
      c.env.BLOG_DB.prepare("DELETE FROM blog_contents WHERE cid = ?").bind(
        child.cid,
      ),
    ),
    c.env.BLOG_DB.prepare("DELETE FROM blog_contents WHERE cid = ?").bind(cid),
  ]);
  return c.redirect(
    content.type === "memo"
      ? "/admin/contents?type=memo"
      : content.type === "page"
        ? "/admin/contents?type=post&filter=page"
        : "/admin/contents?type=post",
  );
});

adminRoutes.get("/admin/metas", async (c) => {
  const type = validMetaType(c.req.query("type"));
  const editId = intValue(c.req.query("edit"));
  const edit = editId
    ? await dbFirst<BlogMeta>(
        c.env.BLOG_DB,
        "SELECT * FROM blog_metas WHERE mid = ? AND type = ? LIMIT 1",
        editId,
        type,
      )
    : null;
  const rows = await dbAll<BlogMeta>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_metas WHERE type = ? ORDER BY name COLLATE NOCASE",
    type,
  );
  return c.html(<MetasPage type={type} rows={rows} edit={edit} />);
});

adminRoutes.post("/admin/metas", async (c) => {
  const form = await c.req.formData();
  const type = validMetaType(String(form.get("type") ?? "tag"));
  const mid = intValue(form.get("mid"));
  const name = String(form.get("name") ?? "").trim();
  if (!name) return c.text("名称不能为空", 400);
  const slug = slugify(String(form.get("slug") ?? "").trim() || name);
  const description = String(form.get("description") ?? "");
  try {
    if (mid)
      await dbRun(
        c.env.BLOG_DB,
        "UPDATE blog_metas SET name = ?, slug = ?, description = ? WHERE mid = ? AND type = ?",
        name,
        slug,
        description,
        mid,
        type,
      );
    else
      await dbRun(
        c.env.BLOG_DB,
        "INSERT INTO blog_metas(name, slug, type, description, count) VALUES(?, ?, ?, ?, 0)",
        name,
        slug,
        type,
        description,
      );
  } catch {
    return c.text("名称或别名已存在", 409);
  }
  return c.redirect(`/admin/metas?type=${type}`);
});

adminRoutes.post("/admin/metas/:mid/delete", async (c) => {
  const mid = intValue(c.req.param("mid"));
  const meta = await dbFirst<BlogMeta>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_metas WHERE mid = ? LIMIT 1",
    mid,
  );
  if (!meta) return c.notFound();
  await c.env.BLOG_DB.batch([
    c.env.BLOG_DB.prepare("DELETE FROM blog_relationships WHERE mid = ?").bind(
      mid,
    ),
    c.env.BLOG_DB.prepare("DELETE FROM blog_metas WHERE mid = ?").bind(mid),
  ]);
  return c.redirect(`/admin/metas?type=${meta.type}`);
});

adminRoutes.get("/admin/attachments", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const page = positiveInt(c.req.query("page"), 1, 100000);
  const perPage = positiveInt(options.admin_attachments_per_page, 30, 100);
  const count = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    "SELECT COUNT(*) AS total FROM blog_contents WHERE type = 'atta'",
  );
  const total = count?.total ?? 0;
  const contents = await dbAll<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE type = 'atta' ORDER BY created DESC LIMIT ? OFFSET ?",
    perPage,
    (page - 1) * perPage,
  );
  const rows = contents.flatMap((content) => {
    const info = attachmentInfo(content);
    return info ? [{ content, info }] : [];
  });
  return c.html(
    <AttachmentsPage
      rows={rows}
      fileCdnUrl={options.file_cdn_url}
      templates={normalizeAttachmentTemplates(options.attachment_templates)}
      page={page}
      total={total}
      perPage={perPage}
      imageCompressionQuality={options.image_compression_quality}
    />,
  );
});

adminRoutes.get("/admin/attachment-templates", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const rows = normalizeAttachmentTemplates(options.attachment_templates);
  const editId = String(c.req.query("edit") ?? "");
  return c.html(
    <AttachmentTemplatesPage
      rows={rows}
      edit={rows.find((item) => item.id === editId) ?? null}
      saved={Boolean(c.req.query("saved"))}
    />,
  );
});

adminRoutes.post("/admin/attachment-templates", async (c) => {
  const form = await c.req.formData();
  const options = await getOptions(c.env.BLOG_DB);
  const rows = normalizeAttachmentTemplates(options.attachment_templates);
  const submittedId = String(form.get("id") ?? "").trim();
  const id = submittedId || `custom-${crypto.randomUUID()}`;
  const item: AttachmentTemplate = {
    id,
    name: String(form.get("name") ?? "")
      .trim()
      .slice(0, 80),
    type: normalizeAttachmentTemplateType(form.get("type")),
    template: String(form.get("template") ?? "")
      .trim()
      .slice(0, 10000),
  };
  if (!item.name || !item.template) return c.text("名称和模板不能为空", 400);
  const index = rows.findIndex((row) => row.id === id);
  if (index >= 0) rows[index] = item;
  else rows.push(item);
  await saveOptions(c.env.BLOG_DB, {
    attachment_templates: serializeAttachmentTemplates(rows),
  });
  return c.redirect("/admin/attachment-templates?saved=1");
});

adminRoutes.post("/admin/attachment-templates/:id/delete", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  let id = "";
  try {
    id = decodeURIComponent(c.req.param("id"));
  } catch {
    return c.text("模板 ID 不正确", 400);
  }
  const rows = normalizeAttachmentTemplates(
    options.attachment_templates,
  ).filter((item) => item.id !== id);
  await saveOptions(c.env.BLOG_DB, {
    attachment_templates: serializeAttachmentTemplates(rows),
  });
  return c.redirect("/admin/attachment-templates");
});

adminRoutes.post("/admin/api/attachments", async (c) => {
  const form = await c.req.formData();
  const value = form.get("file");
  if (!(value instanceof File)) return c.json({ error: "没有收到文件" }, 400);
  const maxMb = positiveInt(c.env.MAX_UPLOAD_MB, 25, 100);
  if (value.size > maxMb * 1024 * 1024)
    return c.json({ error: `文件不能超过 ${maxMb} MB` }, 413);
  const parent = Math.max(0, intValue(form.get("cid")));
  if (
    parent > 0 &&
    !(await dbFirst<{ cid: number }>(
      c.env.BLOG_DB,
      "SELECT cid FROM blog_contents WHERE cid = ? AND type != 'atta'",
      parent,
    ))
  )
    return c.json({ error: "关联内容不存在" }, 404);
  const ext =
    value.name.match(/(\.[a-zA-Z0-9]{1,10})$/)?.[1]?.toLowerCase() ?? "";
  const date = new Date();
  const key = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}${ext}`;
  const mime = value.type || "application/octet-stream";
  await c.env.BLOG_R2.put(key, value.stream(), {
    httpMetadata: {
      contentType: mime,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  const options = await getOptions(c.env.BLOG_DB);
  const storedInfo: AttachmentInfo = {
    key,
    url: attachmentPath(key),
    mime,
    size: value.size,
    originalName: value.name,
  };
  const now = nowSeconds();
  const result = await dbRun(
    c.env.BLOG_DB,
    "INSERT INTO blog_contents(parent, title, slug, created, modified, released, text, type, status) VALUES(?, ?, ?, ?, ?, ?, ?, 'atta', 'publish')",
    parent,
    value.name,
    key,
    now,
    now,
    now,
    JSON.stringify(storedInfo),
  );
  const cid = Number(result.meta.last_row_id);
  const info = {
    ...storedInfo,
    url: publicAttachmentUrl(storedInfo.url, options.file_cdn_url),
  };
  return c.json({
    attachment: { cid, parent, ...info, path: storedInfo.url },
    insertion: insertionForAttachment(storedInfo),
  });
});

adminRoutes.delete("/admin/api/attachments/:cid", async (c) => {
  const cid = intValue(c.req.param("cid"));
  const content = await dbFirst<BlogContent>(
    c.env.BLOG_DB,
    "SELECT * FROM blog_contents WHERE cid = ? AND type = 'atta' LIMIT 1",
    cid,
  );
  if (!content) return c.json({ error: "附件不存在" }, 404);
  const info = attachmentInfo(content);
  if (info) await c.env.BLOG_R2.delete(info.key);
  await dbRun(c.env.BLOG_DB, "DELETE FROM blog_contents WHERE cid = ?", cid);
  return c.json({ ok: true });
});

adminRoutes.post("/admin/api/preview", async (c) => {
  const body: { text?: string } = await c.req
    .json<{ text?: string }>()
    .catch(() => ({}));
  const options = await getOptions(c.env.BLOG_DB);
  return c.json({
    html: resolveUploadedUrls(
      renderMarkdown(body.text ?? ""),
      options.file_cdn_url,
    ),
  });
});

adminRoutes.get("/admin/comments", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const page = positiveInt(c.req.query("page"), 1, 100000);
  const perPage = positiveInt(options.admin_comments_per_page, 20, 100);
  const cid = intValue(c.req.query("cid"));
  const where = cid ? "WHERE cm.cid = ?" : "";
  const args = cid ? [cid] : [];
  const count = await dbFirst<{ total: number }>(
    c.env.BLOG_DB,
    `SELECT COUNT(*) AS total FROM blog_comments cm ${where}`,
    ...args,
  );
  const total = count?.total ?? 0;
  const rows = await dbAll<AdminCommentRow>(
    c.env.BLOG_DB,
    `SELECT cm.*, c.title AS content_title, c.slug AS content_slug, c.type AS content_type FROM blog_comments cm JOIN blog_contents c ON c.cid = cm.cid ${where} ORDER BY cm.created DESC, cm.id DESC LIMIT ? OFFSET ?`,
    ...args,
    perPage,
    (page - 1) * perPage,
  );
  return c.html(
    <CommentsPage
      options={options}
      rows={rows}
      page={page}
      total={total}
      perPage={perPage}
      cid={cid}
    />,
  );
});

adminRoutes.get("/admin/comment/:id", async (c) => {
  const id = intValue(c.req.param("id"));
  const options = await getOptions(c.env.BLOG_DB);
  const comment = await dbFirst<AdminCommentRow>(
    c.env.BLOG_DB,
    "SELECT cm.*, c.title AS content_title, c.slug AS content_slug, c.type AS content_type FROM blog_comments cm JOIN blog_contents c ON c.cid = cm.cid WHERE cm.id = ? LIMIT 1",
    id,
  );
  if (!comment) return c.notFound();
  return c.html(
    <CommentEditPage
      comment={comment}
      options={options}
      saved={Boolean(c.req.query("saved"))}
    />,
  );
});

adminRoutes.post("/admin/comment/:id", async (c) => {
  const id = intValue(c.req.param("id"));
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
    return c.text("名字、邮箱和评论内容不能为空", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return c.text("邮箱格式不正确", 400);
  if (site) {
    if (!/^https?:\/\//i.test(site)) site = `https://${site}`;
    try {
      const parsed = new URL(site);
      if (!["http:", "https:"].includes(parsed.protocol))
        throw new Error("invalid protocol");
      site = parsed.toString();
    } catch {
      return c.text("网站地址格式不正确", 400);
    }
  }
  await dbRun(
    c.env.BLOG_DB,
    "UPDATE blog_comments SET name = ?, email = ?, site = ?, text = ? WHERE id = ?",
    name,
    email,
    site,
    text,
    id,
  );
  return c.redirect(`/admin/comment/${id}?saved=1`);
});

adminRoutes.post("/admin/comment/:id/delete", async (c) => {
  await dbRun(
    c.env.BLOG_DB,
    "DELETE FROM blog_comments WHERE id = ?",
    intValue(c.req.param("id")),
  );
  return c.redirect("/admin/comments");
});

adminRoutes.get("/admin/links", async (c) => {
  const options = await getOptions(c.env.BLOG_DB);
  const editId = intValue(c.req.query("edit"));
  const edit = editId
    ? await dbFirst<BlogLink>(
        c.env.BLOG_DB,
        'SELECT id, name, url, icon, info, "order" AS "order" FROM blog_links WHERE id = ?',
        editId,
      )
    : null;
  const rows = await dbAll<BlogLink>(
    c.env.BLOG_DB,
    'SELECT id, name, url, icon, info, "order" AS "order" FROM blog_links ORDER BY "order" DESC, id DESC',
  );
  return c.html(
    <LinksPage
      rows={rows}
      edit={edit}
      imageCompressionQuality={options.image_compression_quality}
    />,
  );
});

adminRoutes.post("/admin/links", async (c) => {
  const form = await c.req.formData();
  const id = intValue(form.get("id"));
  const name = String(form.get("name") ?? "").trim();
  const url = String(form.get("url") ?? "").trim();
  const icon = String(form.get("icon") ?? "").trim();
  const info = String(form.get("info") ?? "").trim();
  const order = intValue(form.get("order"));
  if (!name || !/^https?:\/\//i.test(url))
    return c.text("名字和有效网址不能为空", 400);
  if (id)
    await dbRun(
      c.env.BLOG_DB,
      'UPDATE blog_links SET name = ?, url = ?, icon = ?, info = ?, "order" = ? WHERE id = ?',
      name,
      url,
      icon,
      info,
      order,
      id,
    );
  else
    await dbRun(
      c.env.BLOG_DB,
      'INSERT INTO blog_links(name, url, icon, info, "order") VALUES(?, ?, ?, ?, ?)',
      name,
      url,
      icon,
      info,
      order,
    );
  return c.redirect("/admin/links");
});

adminRoutes.post("/admin/links/:id/delete", async (c) => {
  await dbRun(
    c.env.BLOG_DB,
    "DELETE FROM blog_links WHERE id = ?",
    intValue(c.req.param("id")),
  );
  return c.redirect("/admin/links");
});

adminRoutes.get("/admin/data/export", async (c) => {
  const tables = [
    "blog_contents",
    "blog_metas",
    "blog_relationships",
    "blog_options",
    "blog_links",
    "blog_comments",
  ] as const;
  const data: Record<string, unknown[]> = {};
  for (const table of tables)
    data[table] = await dbAll<Record<string, unknown>>(
      c.env.BLOG_DB,
      `SELECT * FROM ${table}`,
    );
  const filename = `worker-blog-${new Date().toISOString().slice(0, 10)}.json`;
  return c.body(
    JSON.stringify(
      {
        version: DATA_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        tables: data,
      },
      null,
      2,
    ),
    200,
    {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  );
});

adminRoutes.post("/admin/data/import", async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return c.text("请选择 JSON 文件", 400);
  if (file.size > 20 * 1024 * 1024)
    return c.text("导入文件不能超过 20 MB", 413);
  let payload: {
    version?: number;
    tables?: Record<string, Array<Record<string, unknown>>>;
  };
  try {
    payload = JSON.parse(await file.text()) as typeof payload;
  } catch {
    return c.text("JSON 文件格式不正确", 400);
  }
  if (
    !payload.tables ||
    typeof payload.tables !== "object" ||
    Array.isArray(payload.tables)
  )
    return c.text("导入文件缺少 tables 数据", 400);
  if (payload.version !== DATA_EXPORT_VERSION)
    return c.text("导入文件版本与当前项目不一致", 400);
  const specs: Array<{
    table: string;
    columns: string[];
    autoIncrement: boolean;
    keys: string[];
  }> = [
    {
      table: "blog_contents",
      columns: [
        "cid",
        "parent",
        "title",
        "slug",
        "created",
        "modified",
        "released",
        "text",
        "cover",
        "type",
        "status",
      ],
      autoIncrement: true,
      keys: ["cid"],
    },
    {
      table: "blog_metas",
      columns: ["mid", "name", "slug", "type", "description", "count"],
      autoIncrement: true,
      keys: ["mid"],
    },
    {
      table: "blog_links",
      columns: ["id", "name", "url", "icon", "info", "order"],
      autoIncrement: true,
      keys: ["id"],
    },
    {
      table: "blog_comments",
      columns: ["id", "name", "email", "site", "text", "created", "cid"],
      autoIncrement: true,
      keys: ["id"],
    },
    {
      table: "blog_relationships",
      columns: ["cid", "mid"],
      autoIncrement: false,
      keys: ["cid", "mid"],
    },
    {
      table: "blog_options",
      columns: ["key", "value"],
      autoIncrement: false,
      keys: ["key"],
    },
  ];
  let imported = 0;
  try {
    for (const spec of specs) {
      const rows = payload.tables[spec.table];
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        if (!row || typeof row !== "object" || Array.isArray(row)) continue;
        if (
          !spec.columns.every((column) =>
            Object.prototype.hasOwnProperty.call(row, column),
          )
        )
          return c.text(`${spec.table} 数据字段不完整`, 400);
        const columns = spec.columns;
        const quoted = columns.map((column) => `"${column}"`).join(", ");
        const placeholders = columns.map(() => "?").join(", ");
        const values = columns.map((column) => row[column]);
        if (spec.autoIncrement)
          await dbRun(
            c.env.BLOG_DB,
            `INSERT INTO ${spec.table}(${quoted}) VALUES(${placeholders})`,
            ...values,
          );
        else {
          const conflict = spec.keys.map((key) => `"${key}"`).join(", ");
          const updates = columns
            .filter((column) => !spec.keys.includes(column))
            .map((column) => `"${column}" = excluded."${column}"`)
            .join(", ");
          await dbRun(
            c.env.BLOG_DB,
            `INSERT INTO ${spec.table}(${quoted}) VALUES(${placeholders}) ON CONFLICT(${conflict}) DO ${updates ? `UPDATE SET ${updates}` : "NOTHING"}`,
            ...values,
          );
        }
        imported += 1;
      }
    }
    await dbRun(
      c.env.BLOG_DB,
      "UPDATE blog_metas SET count = (SELECT COUNT(*) FROM blog_relationships r WHERE r.mid = blog_metas.mid)",
    );
    await refreshOptionsCache(c.env.BLOG_DB);
  } catch (error) {
    console.error(error);
    return c.text(
      "导入失败：自增表会直接 INSERT，请确认目标库中没有相同主键或唯一字段。",
      409,
    );
  }
  return c.redirect(`/admin/options?imported=${imported}`);
});

adminRoutes.get("/admin/options", async (c) => {
  return c.html(
    <OptionsPage
      options={await getOptions(c.env.BLOG_DB)}
      saved={Boolean(c.req.query("saved"))}
      imported={c.req.query("imported")}
    />,
  );
});

adminRoutes.post("/admin/options", async (c) => {
  const form = await c.req.formData();
  const keys = [
    "site_theme",
    "site_title",
    "site_description",
    "posts_per_page",
    "memos_per_page",
    "archives_per_page",
    "comments_per_page",
    "admin_contents_per_page",
    "admin_memos_per_page",
    "admin_comments_per_page",
    "admin_attachments_per_page",
    "file_cdn_url",
    "image_compression_quality",
    "emoji_items",
    "comment_notification_from",
    "comment_notification_to",
    "about_avatar",
    "about_github",
    "about_x",
    "about_rss",
    "about_email",
    "site_timezone",
    "footer_info",
    "favicon_text",
    "favicon_color",
  ];
  const values: OptionMap = Object.fromEntries(
    keys.map((key) => [key, String(form.get(key) ?? "")]),
  );
  values.site_theme = normalizeThemeName(values.site_theme);
  values.comments_enabled =
    form.get("comments_enabled") === "true" ? "true" : "false";
  const notificationFromInput = values.comment_notification_from.trim();
  const notificationToInput = values.comment_notification_to.trim();
  values.comment_notification_from = normalizeNotificationEmail(
    notificationFromInput,
  );
  values.comment_notification_to =
    normalizeNotificationEmail(notificationToInput);
  if (notificationFromInput && !values.comment_notification_from)
    return c.text("评论提醒发件邮箱格式不正确。", 400);
  if (notificationToInput && !values.comment_notification_to)
    return c.text("评论提醒收件邮箱格式不正确。", 400);
  if (
    Boolean(values.comment_notification_from) !==
    Boolean(values.comment_notification_to)
  )
    return c.text("评论提醒发件邮箱和收件邮箱需要同时填写或同时留空。", 400);
  values.posts_per_page = String(positiveInt(values.posts_per_page, 10, 100));
  values.memos_per_page = String(positiveInt(values.memos_per_page, 20, 100));
  values.archives_per_page = String(
    positiveInt(values.archives_per_page, 50, 100),
  );
  values.comments_per_page = String(
    positiveInt(values.comments_per_page, 20, 100),
  );
  values.admin_contents_per_page = String(
    positiveInt(values.admin_contents_per_page, 25, 100),
  );
  values.admin_memos_per_page = String(
    positiveInt(values.admin_memos_per_page, 25, 100),
  );
  values.admin_comments_per_page = String(
    positiveInt(values.admin_comments_per_page, 20, 100),
  );
  values.admin_attachments_per_page = String(
    positiveInt(values.admin_attachments_per_page, 30, 100),
  );
  values.image_compression_quality = String(
    normalizeImageCompressionQuality(values.image_compression_quality),
  );
  try {
    values.emoji_items = serializeEmojiItems(
      parseEmojiItems(values.emoji_items),
    );
  } catch (error) {
    return c.text(
      `Emoji表情配置无效：${error instanceof Error ? error.message : "请检查 JSON 格式"}`,
      400,
    );
  }
  const fileCdnInput = values.file_cdn_url.trim();
  values.file_cdn_url = normalizeFileCdnUrl(fileCdnInput);
  if (fileCdnInput && !values.file_cdn_url)
    return c.text(
      "文件 CDN 域名必须是有效的 http:// 或 https:// 地址，且不能包含查询参数或锚点。",
      400,
    );
  values.favicon_text = normalizeFaviconText(
    values.favicon_text,
    Array.from(values.site_title.trim())[0] || "B",
  );
  values.favicon_color = normalizeFaviconColor(values.favicon_color);
  if (!TIMEZONE_VALUES.has(values.site_timezone))
    values.site_timezone = "Asia/Shanghai";
  await saveOptions(c.env.BLOG_DB, values);
  return c.redirect("/admin/options?saved=1");
});
