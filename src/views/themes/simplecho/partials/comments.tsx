import type { BlogComment, BlogContent } from "../../../../types";
import { formatDate } from "../../../../lib/utils";

function CommentPagination({
  page,
  totalPages,
  slug,
}: {
  page: number;
  totalPages: number;
  slug: string;
}) {
  if (totalPages <= 1) return null;
  const url = (target: number) =>
    `/post/${encodeURIComponent(slug)}/?comment_page=${target}#comments`;
  return (
    <nav class="sc-comment-pagination" aria-label="评论分页">
      {page > 1 ? <a href={url(page - 1)}>← 较新评论</a> : <span />}
      <span>
        {page} / {totalPages}
      </span>
      {page < totalPages ? <a href={url(page + 1)}>较早评论 →</a> : <span />}
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
    <section class="sc-comments" id="comments">
      <div class="sc-comments-card">
        <h2 class="sc-comments-title">
          评论 <span>{total}</span>
        </h2>
        {saved ? <div class="sc-comment-notice">评论已提交。</div> : null}
        <form
          class="sc-comment-form"
          method="post"
          action={`/post/${encodeURIComponent(content.slug)}/comments`}
        >
          <div class="sc-comment-fields">
            <input
              name="name"
              maxLength={100}
              placeholder="名字 *"
              autocomplete="name"
              required
            />
            <input
              name="email"
              type="email"
              maxLength={200}
              placeholder="邮箱 *（不会公开）"
              autocomplete="email"
              required
            />
            <input
              name="site"
              type="text"
              inputMode="url"
              maxLength={500}
              placeholder="网站（选填）"
              autocomplete="url"
            />
          </div>
          <textarea
            name="text"
            maxLength={5000}
            placeholder="评论内容 *"
            required
          />
          <div class="sc-comment-actions">
            <button type="submit">发表评论</button>
          </div>
        </form>
        <div class="sc-comments-list">
          {comments.length ? (
            comments.map((comment) => (
              <article class="sc-comment">
                <div class="sc-comment-avatar">
                  {Array.from(comment.name.trim())[0]?.toUpperCase() || "?"}
                </div>
                <div class="sc-comment-body">
                  <header>
                    {comment.site ? (
                      <a
                        href={comment.site}
                        target="_blank"
                        rel="nofollow ugc noopener noreferrer"
                      >
                        {comment.name}
                      </a>
                    ) : (
                      <strong>{comment.name}</strong>
                    )}
                    <time>{formatDate(comment.created, true, timeZone)}</time>
                  </header>
                  <p>{comment.text}</p>
                </div>
              </article>
            ))
          ) : (
            <div class="sc-empty sc-comments-empty">
              还没有评论，来说两句吧。
            </div>
          )}
        </div>
        <CommentPagination
          page={page}
          totalPages={totalPages}
          slug={content.slug}
        />
      </div>
    </section>
  );
}
