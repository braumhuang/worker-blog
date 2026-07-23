import type {
  BlogContent,
  ContentStatus,
  ContentType,
  OptionMap,
} from "../../types";
import { formatDate, stripMarkdown } from "../../lib/utils";
import { AdminLayout, AdminPagination } from "./base";

const typeLabels: Record<ContentType, string> = {
  post: "文章",
  page: "页面",
  atta: "附件",
  memo: "闪念",
};
const statusLabels: Record<ContentStatus, string> = {
  publish: "已发布",
  draft: "草稿",
  hidden: "隐藏",
};

function shortMemoText(text: string): string {
  const clean = stripMarkdown(text);
  const characters = Array.from(clean);
  return characters.length > 15
    ? `${characters.slice(0, 15).join("")}...`
    : clean;
}

export function ContentsPage({
  options,
  type,
  pageOnly,
  statusFilter,
  page,
  total,
  perPage,
  rows,
  now,
}: {
  options: OptionMap;
  type: ContentType;
  pageOnly?: boolean;
  statusFilter?: ContentStatus;
  page: number;
  total: number;
  perPage: number;
  rows: BlogContent[];
  now: number;
}) {
  const isMemo = type === "memo";
  const basePath = isMemo
    ? `/admin/contents?type=memo${statusFilter ? `&status=${statusFilter}` : ""}`
    : `/admin/contents?type=post${pageOnly ? "&filter=page" : statusFilter ? `&status=${statusFilter}` : ""}`;
  const title = isMemo ? "闪念管理" : "文章管理";
  const actions = (
    <a
      class="button primary"
      href={`/admin/content/new?type=${isMemo ? "memo" : "post"}`}
    >
      新增{isMemo ? "闪念" : "文章"}
    </a>
  );

  return (
    <AdminLayout title={title} subtitle={`共 ${total} 条`} actions={actions}>
      {isMemo ? (
        <div class="toolbar-line filter-tabs">
          <a
            class={!statusFilter ? "active" : undefined}
            href="/admin/contents?type=memo"
          >
            全部
          </a>
          <a
            class={statusFilter === "publish" ? "active" : undefined}
            href="/admin/contents?type=memo&status=publish"
          >
            已发布
          </a>
          <a
            class={statusFilter === "draft" ? "active" : undefined}
            href="/admin/contents?type=memo&status=draft"
          >
            草稿
          </a>
          <a
            class={statusFilter === "hidden" ? "active" : undefined}
            href="/admin/contents?type=memo&status=hidden"
          >
            隐藏
          </a>
        </div>
      ) : (
        <div class="toolbar-line filter-tabs">
          <a
            class={!pageOnly && !statusFilter ? "active" : undefined}
            href="/admin/contents?type=post"
          >
            全部
          </a>
          <a
            class={pageOnly ? "active" : undefined}
            href="/admin/contents?type=post&filter=page"
          >
            页面
          </a>
          <a
            class={statusFilter === "publish" ? "active" : undefined}
            href="/admin/contents?type=post&status=publish"
          >
            已发布
          </a>
          <a
            class={statusFilter === "draft" ? "active" : undefined}
            href="/admin/contents?type=post&status=draft"
          >
            草稿
          </a>
          <a
            class={statusFilter === "hidden" ? "active" : undefined}
            href="/admin/contents?type=post&status=hidden"
          >
            隐藏
          </a>
        </div>
      )}

      <section class="panel">
        <table class="admin-table">
          <thead>
            {isMemo ? (
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>内容</th>
                <th>创建时间</th>
                <th>发布时间</th>
              </tr>
            ) : (
              <tr>
                <th>标题</th>
                <th>类型</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>发布时间</th>
              </tr>
            )}
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((item) => (
                <tr>
                  <td class="title-cell">
                    <strong>
                      <a href={`/admin/content/${item.cid}`}>
                        {item.title ||
                          stripMarkdown(item.text).slice(0, 32) ||
                          "未命名"}
                      </a>
                    </strong>
                    <div class="row-actions">
                      <a href={`/admin/content/${item.cid}`}>编辑</a>
                      {item.status === "publish" &&
                      item.type !== "memo" &&
                      item.released <= now ? (
                        <a
                          href={`/post/${encodeURIComponent(item.slug)}/`}
                          target="_blank"
                        >
                          查看
                        </a>
                      ) : null}
                      <form
                        class="inline-form"
                        method="post"
                        action={`/admin/content/${item.cid}/delete`}
                      >
                        <button
                          class="button small danger"
                          type="submit"
                          data-confirm="确定删除这条内容吗？"
                        >
                          删除
                        </button>
                      </form>
                    </div>
                  </td>
                  {isMemo ? (
                    <>
                      <td>
                        <span class={`status ${item.status}`}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td
                        class="memo-text-cell"
                        title={stripMarkdown(item.text)}
                      >
                        {shortMemoText(item.text)}
                      </td>
                      <td>
                        {formatDate(item.created, true, options.site_timezone)}
                      </td>
                      <td>
                        {formatDate(item.released, true, options.site_timezone)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{typeLabels[item.type]}</td>
                      <td>
                        <span class={`status ${item.status}`}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td>
                        {formatDate(item.created, true, options.site_timezone)}
                      </td>
                      <td>
                        {formatDate(item.released, true, options.site_timezone)}
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colspan={5} class="empty-state">
                  暂无内容
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <AdminPagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / perPage))}
        path={basePath}
      />
    </AdminLayout>
  );
}
