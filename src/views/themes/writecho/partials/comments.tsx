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
    <nav class="comment-pagination" data-comment-pagination>
      {page > 1 ? <a href={url(page - 1)}>← 较新评论</a> : <span />}
      <span>
        第 {page} / {totalPages} 页
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
  turnstileSiteKey,
}: {
  content: BlogContent;
  comments: BlogComment[];
  page: number;
  total: number;
  totalPages: number;
  timeZone: string;
  saved: boolean;
  turnstileSiteKey: string;
}) {
  return (
    <section class="post-comments" id="comments">
      <h3 class="post-comments-title">
        留下回声 <small>{total}</small>
      </h3>
      {saved ? <div class="comment-notice">评论已提交。</div> : null}
      <form
        class="comment-form"
        method="post"
        data-comment-form
        data-turnstile-sitekey={turnstileSiteKey || undefined}
        action={`/post/${encodeURIComponent(content.slug)}/comments`}
      >
        <div class="comment-form-info">
          <input name="name" maxLength={100} placeholder="名字 *" required />
          <input
            name="email"
            type="email"
            maxLength={200}
            placeholder="邮箱 *（不会公开）"
            required
          />
          <input name="site" maxLength={500} placeholder="网站（选填）" />
        </div>
        <textarea
          name="text"
          maxLength={5000}
          placeholder="写下你的回声…"
          required
        ></textarea>
        <button type="submit">发表评论</button>
        {turnstileSiteKey ? (
          <>
            <input
              type="hidden"
              name="cf-turnstile-response"
              data-turnstile-response
            />
            <div data-turnstile-container aria-live="polite" />
          </>
        ) : null}
      </form>
      {turnstileSiteKey ? (
        <script src="/comments-turnstile.js" defer></script>
      ) : null}
      <div class="comments-list">
        {comments.length ? (
          comments.map((comment) => (
            <article class="comment-item">
              <div class="comment-avatar">
                {Array.from(comment.name.trim())[0]?.toUpperCase() || "?"}
              </div>
              <div class="comment-main">
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
          <p class="comments-placeholder">还没有评论，来说两句吧。</p>
        )}
      </div>
      <CommentPagination
        page={page}
        totalPages={totalPages}
        slug={content.slug}
      />
    </section>
  );
}
