import type { BlogComment, BlogContent, ContentWithMeta, OptionMap } from '../../types'
import { formatDate, publicAttachmentUrl, readingMinutes, wordCount } from '../../lib/utils'
import { MetaPills, PostMeta } from './base'

export type CommentPageData = {
  comments: BlogComment[]
  page: number
  total: number
  totalPages: number
}

function CommentPagination({ page, totalPages, slug }: { page: number; totalPages: number; slug: string }) {
  if (totalPages <= 1) return null
  const url = (target: number) => `/post/${encodeURIComponent(slug)}/?comment_page=${target}#comments`
  return <nav class="comment-pagination" aria-label="评论分页" data-comment-pagination>
    {page > 1 ? <a href={url(page - 1)}>← 较新评论</a> : <span/>}
    <span>第 {page} / {totalPages} 页</span>
    {page < totalPages ? <a href={url(page + 1)}>较早评论 →</a> : <span/>}
  </nav>
}

export function Comments({ content, comments, page, total, totalPages, timeZone, saved }: CommentPageData & {
  content: BlogContent
  timeZone: string
  saved: boolean
}) {
  return <section class="comments-section" id="comments">
    <h2 class="comments-title">评论 <span>{total}</span></h2>
    {saved ? <div class="comment-notice">评论已提交。</div> : null}
    <form class="comment-form" method="post" data-comment-form action={`/post/${encodeURIComponent(content.slug)}/comments`}>
      <div class="comment-form-info">
        <input class="comment-input" name="name" maxLength={100} placeholder="名字 *" autocomplete="name" required />
        <input class="comment-input" name="email" type="email" maxLength={200} placeholder="邮箱 *（不会公开）" autocomplete="email" required />
        <input class="comment-input" name="site" type="text" inputMode="url" maxLength={500} placeholder="网站（选填）" autocomplete="url" />
      </div>
      <textarea class="comment-textarea" name="text" maxLength={5000} placeholder="评论内容 *" required></textarea>
      <div class="comment-form-actions"><button class="comment-submit" type="submit">发表评论</button></div>
    </form>
    <div class="comments-list">
      {comments.length ? comments.map((comment) => <article class="comment">
        <div class="comment-avatar" aria-hidden="true">{Array.from(comment.name.trim())[0]?.toUpperCase() || '?'}</div>
        <div class="comment-body">
          <header class="comment-header">
            {comment.site ? <a class="comment-author" href={comment.site} target="_blank" rel="nofollow ugc noopener noreferrer">{comment.name}</a> : <span class="comment-author">{comment.name}</span>}
            <time class="comment-date">{formatDate(comment.created, true, timeZone)}</time>
          </header>
          <div class="comment-content">{comment.text}</div>
        </div>
      </article>) : <div class="comments-empty">还没有评论，来说两句吧。</div>}
    </div>
    <CommentPagination page={page} totalPages={totalPages} slug={content.slug}/>
  </section>
}

export function Post({ content, item, html, options }: { content: BlogContent; item: ContentWithMeta; html: string; options: OptionMap }) {
  return <article class="article-detail">
    <header class="article-header">
      <h1 class="article-title">{content.title}</h1>
      <PostMeta article created={content.released} categories={item.categories} reading={readingMinutes(content.text)} words={wordCount(content.text)} timeZone={options.site_timezone}/>
    </header>
    {content.cover ? <figure class="article-cover"><img src={publicAttachmentUrl(content.cover, options.file_cdn_url)} alt={content.title} loading="eager" /></figure> : null}
    <div class="article-content" dangerouslySetInnerHTML={{ __html: html }}/>
    <MetaPills tags={item.tags ?? []}/>
  </article>
}
