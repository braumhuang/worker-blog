import type { PropsWithChildren } from "hono/jsx";

const adminNav = [
  ["/admin", "面板"],
  ["/admin/navigation", "导航"],
  ["/admin/contents?type=post", "文章"],
  ["/admin/contents?type=memo", "闪念"],
  ["/admin/comments", "评论"],
  ["/admin/metas?type=category", "分类"],
  ["/admin/metas?type=tag", "标签"],
  ["/admin/attachments", "附件"],
  ["/admin/attachment-templates", "模板"],
  ["/admin/links", "友链"],
  ["/admin/options", "设置"],
] as const;

type LayoutProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: unknown;
}>;

function activeNav(title: string, label: string): boolean {
  if (label === "面板") return title === "面板";
  if (label === "设置") return title.includes("设置");
  if (label === "模板") return title.includes("附件模板");
  if (label === "附件")
    return title.includes("附件") && !title.includes("附件模板");
  if (label === "文章") return title.includes("文章") || title.includes("页面");
  return title.includes(label);
}

export function AdminLayout({
  title,
  subtitle,
  actions,
  children,
}: LayoutProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title} · 博客后台</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="/admin/admin.css" />
      </head>
      <body>
        <header class="admin-topbar">
          <div class="admin-topbar-inner">
            <nav class="admin-desktop-nav" aria-label="后台主导航">
              {adminNav.map(([href, label]) => (
                <a
                  class={activeNav(title, label) ? "active" : undefined}
                  href={href}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div class="admin-user">
              <a href="/" target="_blank">
                查看站点
              </a>
              <a href="/admin/logout">退出</a>
            </div>
            <details class="admin-mobile-menu">
              <summary>菜单</summary>
              <div class="admin-mobile-panel">
                <nav aria-label="手机端后台主导航">
                  {adminNav.map(([href, label]) => (
                    <a
                      class={activeNav(title, label) ? "active" : undefined}
                      href={href}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
                <div class="admin-mobile-user">
                  <a href="/" target="_blank">
                    查看站点
                  </a>
                  <a href="/admin/logout">退出</a>
                </div>
              </div>
            </details>
          </div>
        </header>
        <main class="admin-shell">
          <header class="admin-heading">
            <div class="admin-heading-copy">
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
            {actions ? (
              <div class="admin-heading-actions">{actions}</div>
            ) : null}
          </header>
          {children}
        </main>
        <footer class="admin-footer">
          <p>Powered by Worker Blog</p>
        </footer>
        <script src="/admin/admin.js" defer></script>
      </body>
    </html>
  );
}

export function AdminPagination({
  page,
  totalPages,
  path,
}: {
  page: number;
  totalPages: number;
  path: string;
}) {
  if (totalPages <= 1) return null;
  const separator = path.includes("?") ? "&" : "?";
  const items = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2);
  let previous = 0;
  return (
    <nav class="pagination-admin">
      {items.map((n) => {
        const gap = previous && n - previous > 1;
        previous = n;
        return (
          <>
            {gap ? <span>…</span> : null}
            {n === page ? (
              <span>{n}</span>
            ) : (
              <a href={`${path}${separator}page=${n}`}>{n}</a>
            )}
          </>
        );
      })}
    </nav>
  );
}
