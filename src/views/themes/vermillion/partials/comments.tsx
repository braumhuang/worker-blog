import type { BlogComment, BlogContent } from "../../../../types";
import { formatDate } from "../../../../lib/utils";

function CommentPagination({ page, totalPages, slug }: { page: number; totalPages: number; slug: string }) {
  if (totalPages <= 1) return null;
  const url = (target: number) => `/post/${encodeURIComponent(slug)}/?comment_page=${target}#comments`;
  return (
    <nav class="comment-pagination" aria-label="评论分页">
      {page > 1 ? <a href={url(page - 1)}>← 较新评论</a> : <span />}
      <span>P. {page} / {totalPages}</span>
      {page < totalPages ? <a href={url(page + 1)}>较早评论 →</a> : <span />}
    </nav>
  );
}

export function Comments({ content, comments, page, total, totalPages, timeZone, saved }: { content: BlogContent; comments: BlogComment[]; page: number; total: number; totalPages: number; timeZone: string; saved: boolean }) {
  return (
    <section class="comments" id="comments">
      <h3 class="comments-title">评 · Letters back <span class="comments-count">{total}</span></h3>
      {saved ? <div class="comment-notice">评论已写在纸上。</div> : null}
      <form class="comment-form" method="post" action={`/post/${encodeURIComponent(content.slug)}/comments`}>
        <div class="comment-form-info">
          <input name="name" maxLength={100} placeholder="名字 *" autocomplete="name" required />
          <input name="email" type="email" maxLength={200} placeholder="邮箱 *（不会公开）" autocomplete="email" required />
          <input name="site" type="text" inputMode="url" maxLength={500} placeholder="网站（选填）" autocomplete="url" />
        </div>
        <textarea name="text" maxLength={5000} placeholder="写下回信…" required />
        <div class="comment-form-actions"><button type="submit">寄出评论 →</button></div>
      </form>
      <div class="comments-list">
        {comments.length ? comments.map((comment) => (
          <article class="comment-letter">
            <div class="comment-letter-mark">{Array.from(comment.name.trim())[0]?.toUpperCase() || "?"}</div>
            <div class="comment-letter-body">
              <header>
                {comment.site ? <a href={comment.site} target="_blank" rel="nofollow ugc noopener noreferrer">{comment.name}</a> : <strong>{comment.name}</strong>}
                <time>{formatDate(comment.created, true, timeZone)}</time>
              </header>
              <p>{comment.text}</p>
            </div>
          </article>
        )) : <p class="comments-disabled">— 还没有回信。你可以留下第一笔。</p>}
      </div>
      <CommentPagination page={page} totalPages={totalPages} slug={content.slug} />
    </section>
  );
}
