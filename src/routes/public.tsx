import { Hono } from 'hono'
import type { Context } from 'hono'
import type { AppEnv, BlogComment, BlogContent, BlogLink, BlogMeta, ContentWithMeta, OptionMap } from '../types'
import { dbAll, dbFirst, dbRun } from '../lib/db'
import { getOptions } from '../lib/options'
import { renderMarkdown } from '../lib/markdown'
import { excerptOf, formatDate, isoDate, nowSeconds, positiveInt, readingMinutes, stripMarkdown, wordCount } from '../lib/utils'
import { MetaPills, PageHeading, Pagination, PostMeta, PublicLayout } from '../components/public'

export const publicRoutes = new Hono<AppEnv>()
type MetaJoin = BlogMeta & { cid: number }

async function enrichContents(db: D1Database, contents: BlogContent[]): Promise<ContentWithMeta[]> {
  if (!contents.length) return []
  const ids = contents.map((item) => item.cid)
  const rows = await dbAll<MetaJoin>(db, `SELECT r.cid,m.mid,m.name,m.slug,m.type,m.description,m.count FROM blog_relationships r JOIN blog_metas m ON m.mid=r.mid WHERE r.cid IN (${ids.map(() => '?').join(',')}) ORDER BY m.name COLLATE NOCASE`, ...ids)
  const grouped = new Map<number, BlogMeta[]>()
  for (const row of rows) grouped.set(row.cid, [...(grouped.get(row.cid) ?? []), row])
  return contents.map((content) => {
    const metas = grouped.get(content.cid) ?? []
    return { ...content, categories: metas.filter((meta) => meta.type === 'category'), tags: metas.filter((meta) => meta.type === 'tag') }
  })
}

function PostCards({ posts, timeZone }: { posts: ContentWithMeta[]; timeZone: string }) {
  if (!posts.length) return <div class="no-results">暂无内容</div>
  return <section class="post-list">{posts.map((post) => {
    const thumb = post.cover
    const url = `/post/${encodeURIComponent(post.slug)}/`
    return <article class={`post${thumb ? ' post-with-thumb' : ''}`}>
      <div class="post-content">
        <h2 class="post-title"><a href={url}>{post.title || '未命名文章'}</a></h2>
        <p class="post-excerpt">{excerptOf(post.text)}</p>
        <PostMeta created={post.released} categories={post.categories} reading={readingMinutes(post.text)} timeZone={timeZone}/>
      </div>
      {thumb ? <a class="post-thumb" href={url} aria-label={post.title}><img src={thumb} alt="" loading="lazy"/></a> : null}
    </article>
  })}</section>
}

function SocialIcon({ name }: { name: 'github' | 'x' | 'rss' | 'email' }) {
  if (name === 'github') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 3 1.4 3.7 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6A4.7 4.7 0 0 1 5.4 8c-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.5 1.3a12 12 0 0 1 6.3 0c2.4-1.6 3.5-1.3 3.5-1.3.6 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .8Z"/></svg>
  if (name === 'x') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.3 22H3.2l7.2-8.3L.8 2h6.5l4.5 6 7.1-6Zm-1.1 17.8h1.7L6.4 4.1H4.6l13.2 15.7Z"/></svg>
  if (name === 'rss') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="19" r="2"/><path d="M3 10a11 11 0 0 1 11 11h3A14 14 0 0 0 3 7v3Zm0-6a17 17 0 0 1 17 17h3A20 20 0 0 0 3 1v3Z"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
}

function normalizedLink(value: string, kind: 'url' | 'email'): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (kind === 'email') return trimmed.startsWith('mailto:') ? trimmed : `mailto:${trimmed}`
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function AboutProfile({ options, html }: { options: OptionMap; html: string }) {
  const links = [
    ['github', 'GitHub', normalizedLink(options.about_github || '', 'url')],
    ['x', 'X', normalizedLink(options.about_x || '', 'url')],
    ['rss', 'RSS', normalizedLink(options.about_rss || '', 'url')],
    ['email', '邮箱', normalizedLink(options.about_email || '', 'email')],
  ] as const
  return <section class="about-page">
    <header class="about-header">
      {options.about_avatar ? <div class="about-avatar"><img src={options.about_avatar} alt={options.site_title} loading="eager"/></div> : null}
      <h1 class="about-name">{options.site_title}</h1>
      {options.site_description ? <p class="about-bio">{options.site_description}</p> : null}
      {links.some(([, , href]) => href) ? <div class="about-social">{links.map(([name, label, href]) => href ? <a class="social-link" href={href} aria-label={label} title={label} target={name === 'email' ? undefined : '_blank'} rel={name === 'email' ? undefined : 'noopener noreferrer'}><SocialIcon name={name}/></a> : null)}</div> : null}
    </header>
    <div class="article-content about-content" dangerouslySetInnerHTML={{ __html: html }}/>
  </section>
}

function CommentPagination({ page, totalPages, slug }: { page: number; totalPages: number; slug: string }) {
  if (totalPages <= 1) return null
  const url = (target: number) => `/post/${encodeURIComponent(slug)}/?comment_page=${target}#comments`
  return <nav class="comment-pagination" aria-label="评论分页">
    {page > 1 ? <a href={url(page - 1)}>← 较新评论</a> : <span/>}
    <span>第 {page} / {totalPages} 页</span>
    {page < totalPages ? <a href={url(page + 1)}>较早评论 →</a> : <span/>}
  </nav>
}

function CommentsSection({ content, comments, page, total, totalPages, timeZone, saved }: {
  content: BlogContent
  comments: BlogComment[]
  page: number
  total: number
  totalPages: number
  timeZone: string
  saved: boolean
}) {
  return <section class="comments-section" id="comments">
    <h2 class="comments-title">评论 <span>{total}</span></h2>
    {saved ? <div class="comment-notice">评论已提交。</div> : null}
    <form class="comment-form" method="post" action={`/post/${encodeURIComponent(content.slug)}/comments`}>
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

async function commentsForContent(c: Context<AppEnv>, content: BlogContent, options: OptionMap) {
  const page = positiveInt(c.req.query('comment_page'), 1, 100000)
  const perPage = positiveInt(options.comments_per_page, 20, 100)
  const count = await dbFirst<{ total: number }>(c.env.BLOG_DB, 'SELECT COUNT(*) AS total FROM blog_comments WHERE cid = ?', content.cid)
  const total = count?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const comments = await dbAll<BlogComment>(c.env.BLOG_DB, 'SELECT * FROM blog_comments WHERE cid = ? ORDER BY created DESC, id DESC LIMIT ? OFFSET ?', content.cid, perPage, (safePage - 1) * perPage)
  return { comments, page: safePage, total, totalPages }
}

async function listByMeta(c: Context<AppEnv>, type: 'tag' | 'category', slug: string) {
  const options = await getOptions(c.env.BLOG_DB)
  const meta = await dbFirst<BlogMeta>(c.env.BLOG_DB, 'SELECT * FROM blog_metas WHERE type=? AND slug=? LIMIT 1', type, slug)
  if (!meta) return c.notFound()
  const now = nowSeconds()
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.posts_per_page, 10, 100)
  const countRow = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_contents c JOIN blog_relationships r ON r.cid=c.cid WHERE r.mid=? AND c.type='post' AND c.status='publish' AND c.released<=?", meta.mid, now)
  const total = countRow?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT c.* FROM blog_contents c JOIN blog_relationships r ON r.cid=c.cid WHERE r.mid=? AND c.type='post' AND c.status='publish' AND c.released<=? ORDER BY c.released DESC LIMIT ? OFFSET ?", meta.mid, now, perPage, (page - 1) * perPage)
  const posts = await enrichContents(c.env.BLOG_DB, rows)
  const route = type === 'tag' ? `/tag/${encodeURIComponent(slug)}/` : `/category/${encodeURIComponent(slug)}/`
  return c.html(<PublicLayout options={options} title={meta.name} active={type === 'tag' ? 'tags' : undefined}><PageHeading title={meta.name} subtitle={meta.description || `共 ${total} 篇文章`}/><PostCards posts={posts} timeZone={options.site_timezone}/><Pagination page={page} totalPages={totalPages} path={route}/></PublicLayout>)
}

publicRoutes.get('/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const now = nowSeconds()
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.posts_per_page, 10, 100)
  const count = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_contents WHERE type='post' AND status='publish' AND released<=?", now)
  const totalPages = Math.max(1, Math.ceil((count?.total ?? 0) / perPage))
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type='post' AND status='publish' AND released<=? ORDER BY released DESC LIMIT ? OFFSET ?", now, perPage, (page - 1) * perPage)
  return c.html(<PublicLayout options={options} active="home"><PostCards posts={await enrichContents(c.env.BLOG_DB, rows)} timeZone={options.site_timezone}/><Pagination page={page} totalPages={totalPages} path="/"/></PublicLayout>)
})

publicRoutes.get('/post/:slug/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE slug=? AND type IN ('post','page') AND status='publish' AND released<=? ORDER BY CASE type WHEN 'page' THEN 0 ELSE 1 END LIMIT 1", c.req.param('slug'), nowSeconds())
  if (!content) return c.notFound()
  const [item] = await enrichContents(c.env.BLOG_DB, [content])
  const isAbout = content.type === 'page' && content.slug === options.about_slug
  const html = renderMarkdown(content.text)
  const commentsEnabled = options.comments_enabled === 'true'
  const commentData = commentsEnabled ? await commentsForContent(c, content, options) : null
  return c.html(<PublicLayout options={options} title={content.title} active={isAbout ? 'about' : undefined} description={excerptOf(content.text, 150)}>
    {isAbout ? <AboutProfile options={options} html={html}/> : <article class="article-detail"><header class="article-header"><h1 class="article-title">{content.title}</h1><PostMeta article created={content.released} categories={item.categories} reading={readingMinutes(content.text)} words={wordCount(content.text)} timeZone={options.site_timezone}/></header>{content.cover ? <figure class="article-cover"><img src={content.cover} alt={content.title} loading="eager" /></figure> : null}<div class="article-content" dangerouslySetInnerHTML={{ __html: html }}/><MetaPills tags={item.tags ?? []}/></article>}
    {commentData ? <CommentsSection content={content} {...commentData} timeZone={options.site_timezone} saved={c.req.query('comment') === 'saved'}/> : null}
  </PublicLayout>)
})

publicRoutes.post('/post/:slug/comments', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  if (options.comments_enabled !== 'true') return c.notFound()
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE slug=? AND type IN ('post','page') AND status='publish' AND released<=? ORDER BY CASE type WHEN 'page' THEN 0 ELSE 1 END LIMIT 1", c.req.param('slug'), nowSeconds())
  if (!content) return c.notFound()
  const form = await c.req.formData()
  const name = String(form.get('name') ?? '').trim().slice(0, 100)
  const email = String(form.get('email') ?? '').trim().slice(0, 200)
  const text = String(form.get('text') ?? '').trim().slice(0, 5000)
  let site = String(form.get('site') ?? '').trim().slice(0, 500)
  if (!name || !email || !text) return c.text('名字、邮箱和评论内容不能为空。', 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.text('邮箱格式不正确。', 400)
  if (site) {
    if (!/^https?:\/\//i.test(site)) site = `https://${site}`
    try {
      const parsed = new URL(site)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid protocol')
      site = parsed.toString()
    } catch {
      return c.text('网站地址格式不正确。', 400)
    }
  }
  await dbRun(c.env.BLOG_DB, 'INSERT INTO blog_comments(name, email, site, text, created, cid) VALUES(?, ?, ?, ?, ?, ?)', name, email, site, text, nowSeconds(), content.cid)
  return c.redirect(`/post/${encodeURIComponent(content.slug)}/?comment=saved#comments`)
})

publicRoutes.get('/memos/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const now = nowSeconds()
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.memos_per_page, 20, 100)
  const countRow = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_contents WHERE type='memo' AND status='publish' AND released<=?", now)
  const total = countRow?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const memoRows = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type='memo' AND status='publish' AND released<=? ORDER BY released DESC LIMIT ? OFFSET ?", now, perPage, (page - 1) * perPage)
  const memos = await enrichContents(c.env.BLOG_DB, memoRows)
  const activityRows = await dbAll<{ released: number }>(c.env.BLOG_DB, "SELECT released FROM blog_contents WHERE type='memo' AND status='publish' AND released<=? AND released>=?", now, now - 370 * 86400)
  const activity = new Map<string, number>()
  for (const row of activityRows) {
    const day = isoDate(row.released, options.site_timezone)
    activity.set(day, (activity.get(day) ?? 0) + 1)
  }
  const today = isoDate(now, options.site_timezone)
  const [year, month, day] = today.split('-').map(Number)
  const days = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (364 - index)))
    const dateKey = date.toISOString().slice(0, 10)
    const count = activity.get(dateKey) ?? 0
    return { day: dateKey, count, level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4 }
  })
  return c.html(<PublicLayout options={options} title="闪念" active="memos"><PageHeading title="闪念" subtitle="一些不成文章的碎片想法"/>
    <div class="memo-heatmap-wrap"><div class="memo-heatmap-stats"><strong>{total}</strong> 条闪念</div><div class="memo-heatmap-scroll"><div class="memo-heatmap">{days.map((item) => <span class="memo-heatmap-cell" data-level={item.level} title={`${item.day}：${item.count} 条`}/>)}</div></div><div class="memo-heatmap-legend"><span class="memo-heatmap-legend-label">少</span>{[0, 1, 2, 3, 4].map((level) => <span class="memo-heatmap-cell" data-level={level}/>)}<span class="memo-heatmap-legend-label">多</span></div></div>
    <section class="memo-timeline">{memos.length ? memos.map((memo) => <article class="memo-item" id={`memo-${memo.cid}`}><span class="memo-dot"/><div class="memo-body"><div class="memo-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(memo.text) }}/>{memo.tags?.length ? <div class="memo-tags">{memo.tags.map((tag) => <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>#{tag.name}</a>)}</div> : null}<time class="memo-date">{formatDate(memo.released, true, options.site_timezone)}</time></div></article>) : <div class="no-results">还没有任何闪念。</div>}</section><Pagination page={page} totalPages={totalPages} path="/memos/"/>
  </PublicLayout>)
})

publicRoutes.get('/archives/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const posts = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type='post' AND status='publish' AND released<=? ORDER BY released DESC", nowSeconds())
  const tagCount = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_metas WHERE type='tag'")
  const years = new Map<string, ContentWithMeta[]>()
  for (const post of await enrichContents(c.env.BLOG_DB, posts)) {
    const year = isoDate(post.released, options.site_timezone).slice(0, 4)
    years.set(year, [...(years.get(year) ?? []), post])
  }
  return c.html(<PublicLayout options={options} title="归档" active="archives"><PageHeading title="归档" subtitle="站内全部文章，按发布时间倒序"/><div class="archive-stats"><div class="archive-stat"><div class="archive-stat-number">{posts.length}</div><div class="archive-stat-label">篇文章</div></div><div class="archive-stat"><div class="archive-stat-number">{tagCount?.total ?? 0}</div><div class="archive-stat-label">个标签</div></div></div>{[...years.entries()].map(([archiveYear, items]) => <section class="archive-year"><h2 class="archive-year-title">{archiveYear}</h2><ul class="archive-list">{items.map((post) => <li class="archive-item"><time class="archive-date">{isoDate(post.released, options.site_timezone)}</time><div class="archive-title"><a href={`/post/${encodeURIComponent(post.slug)}/`}>{post.title}</a></div>{post.categories?.[0]?.name ? <span class="archive-category">{post.categories[0].name}</span> : null}</li>)}</ul></section>)}</PublicLayout>)
})

publicRoutes.get('/tags/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const tags = await dbAll<BlogMeta>(c.env.BLOG_DB, "SELECT * FROM blog_metas WHERE type='tag' ORDER BY count DESC,name COLLATE NOCASE")
  return c.html(<PublicLayout options={options} title="标签" active="tags"><PageHeading title="标签" subtitle={`共 ${tags.length} 个标签`}/><div class="tag-cloud">{tags.map((tag) => <a class="tag-cloud-item" href={`/tag/${encodeURIComponent(tag.slug)}/`}><span class="tag-cloud-name">{tag.name}</span><span class="tag-cloud-count">{tag.count}</span></a>)}</div></PublicLayout>)
})
publicRoutes.get('/tag/:slug/', (c) => listByMeta(c, 'tag', c.req.param('slug')))
publicRoutes.get('/category/:slug/', (c) => listByMeta(c, 'category', c.req.param('slug')))

publicRoutes.get('/links/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const links = await dbAll<BlogLink>(c.env.BLOG_DB, 'SELECT id,name,url,icon,info,"order" AS "order" FROM blog_links ORDER BY "order" DESC,id DESC')
  return c.html(<PublicLayout options={options} title="导航" active="links"><PageHeading title="导航" subtitle={`添加页面 ${links.length} 个链接`}/><div class="links-grid">{links.map((link) => <a class="link-card" href={link.url} target="_blank" rel="noopener noreferrer"><span class="link-card-avatar">{link.icon ? <img src={link.icon} alt="" loading="lazy"/> : <span class="link-card-initial">{link.name.slice(0, 1).toUpperCase()}</span>}</span><span class="link-card-body"><span class="link-card-name">{link.name}</span><span class="link-card-desc">{link.info || link.url}</span></span></a>)}</div></PublicLayout>)
})

publicRoutes.get('/api/search', async (c) => {
  const q = c.req.query('q')?.trim()
  if (!q) return c.json({ items: [] })
  const like = `%${q.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT DISTINCT c.* FROM blog_contents c LEFT JOIN blog_relationships r ON r.cid=c.cid LEFT JOIN blog_metas m ON m.mid=r.mid WHERE c.status='publish' AND c.released<=? AND c.type IN ('post','page','memo') AND (c.title LIKE ? ESCAPE '\\' OR c.text LIKE ? ESCAPE '\\' OR m.name LIKE ? ESCAPE '\\') ORDER BY c.released DESC LIMIT 12", nowSeconds(), like, like, like)
  return c.json({ items: rows.map((row) => ({ title: row.type === 'memo' ? row.title : row.title, excerpt: excerptOf(row.text, 90), url: row.type === 'memo' ? `/memos/#memo-${row.cid}` : `/post/${encodeURIComponent(row.slug)}/` })) })
})
