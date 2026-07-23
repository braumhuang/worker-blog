import type { BlogComment, ContentType, OptionMap } from "../../types";
import { formatDate } from "../../lib/utils";
import { AdminLayout, AdminPagination } from "./base";

export type AdminCommentRow = BlogComment & {
  content_title: string;
  content_slug: string;
  content_type: ContentType;
};

export function CommentsPage({
  options,
  rows,
  page,
  total,
  perPage,
  cid,
}: {
  options: OptionMap;
  rows: AdminCommentRow[];
  page: number;
  total: number;
  perPage: number;
  cid: number;
}) {
  const path = cid ? `/admin/comments?cid=${cid}` : "/admin/comments";
  return (
    <AdminLayout title="评论管理" subtitle={`共 ${total} 条评论`}>
      <section class="panel">
        <table class="admin-table comments-admin-table">
          <thead>
            <tr>
              <th>作者</th>
              <th>评论</th>
              <th>内容</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((comment) => (
                <tr>
                  <td>
                    <strong>{comment.name}</strong>
                    <div class="muted">{comment.email}</div>
                    {comment.site ? (
                      <a
                        href={comment.site}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {comment.site}
                      </a>
                    ) : null}
                    <div class="row-actions">
                      <a href={`/admin/comment/${comment.id}`}>编辑</a>
                      <form
                        class="inline-form"
                        method="post"
                        action={`/admin/comment/${comment.id}/delete`}
                      >
                        <button
                          class="button small danger"
                          type="submit"
                          data-confirm="确定删除这条评论吗？"
                        >
                          删除
                        </button>
                      </form>
                    </div>
                  </td>
                  <td class="comment-text-cell">{comment.text}</td>
                  <td>
                    <a href={`/admin/content/${comment.cid}`}>
                      {comment.content_title || `CID ${comment.cid}`}
                    </a>
                    <div class="row-actions">
                      <a href={`/admin/comments?cid=${comment.cid}`}>
                        只看此内容
                      </a>
                      {comment.content_type !== "memo" ? (
                        <a
                          href={`/post/${encodeURIComponent(comment.content_slug)}/#comments`}
                          target="_blank"
                        >
                          查看页面
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {formatDate(comment.created, true, options.site_timezone)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colspan={4} class="empty-state">
                  暂无评论
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <AdminPagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / perPage))}
        path={path}
      />
    </AdminLayout>
  );
}
