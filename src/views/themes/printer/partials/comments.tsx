import type { BlogComment, BlogContent } from "../../../../types";
import { formatDate } from "../../../../lib/utils";
function Pagination({
  page,
  totalPages,
  slug,
}: {
  page: number;
  totalPages: number;
  slug: string;
}) {
  if (totalPages <= 1) return null;
  const u = (n: number) =>
    `/post/${encodeURIComponent(slug)}/?comment_page=${n}#comments`;
  return (
    <nav class="comment-pagination" data-comment-pagination>
      {page > 1 ? <a href={u(page - 1)}>← 较新评论</a> : <span />}
      <span>
        {page} / {totalPages}
      </span>
      {page < totalPages ? <a href={u(page + 1)}>较早评论 →</a> : <span />}
    </nav>
  );
}
export function Comments({
  content,
  comments,
  page,
  total,
  totalPages,
  timeZone,
  saved,
}: {
  content: BlogContent;
  comments: BlogComment[];
  page: number;
  total: number;
  totalPages: number;
  timeZone: string;
  saved: boolean;
}) {
  return (
    <section class="comments-section" id="comments">
      <h3 class="comments-title">
        评论 <span>{total}</span>
      </h3>
      {saved ? <div class="comment-notice">评论已提交。</div> : null}
      <form
        class="printer-comment-form"
        data-comment-form
        method="post"
        action={`/post/${encodeURIComponent(content.slug)}/comments`}
      >
        <div class="comment-fields">
          <input name="name" maxLength={100} placeholder="名字 *" required />
          <input
            name="email"
            type="email"
            maxLength={200}
            placeholder="邮箱 *"
            required
          />
          <input name="site" maxLength={500} placeholder="网站（选填）" />
        </div>
        <textarea
          name="text"
          maxLength={5000}
          placeholder="评论内容 *"
          required
        />
        <button type="submit">发表评论</button>
      </form>
      <div class="comment-list">
        {comments.length ? (
          comments.map((c) => (
            <article class="comment-item">
              <div class="comment-meta">
                <span class="comment-dot" />
                {c.site ? (
                  <a
                    href={c.site}
                    target="_blank"
                    rel="nofollow ugc noopener noreferrer"
                  >
                    {c.name}
                  </a>
                ) : (
                  <strong>{c.name}</strong>
                )}
                <time>{formatDate(c.created, true, timeZone)}</time>
              </div>
              <div class="comment-content">{c.text}</div>
            </article>
          ))
        ) : (
          <div class="comments-placeholder">还没有评论，来说两句吧。</div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} slug={content.slug} />
    </section>
  );
}
