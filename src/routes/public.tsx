import { Hono } from 'hono'
import type { Context } from 'hono'
import type { AppEnv, BlogContent, BlogLink, BlogMeta, ContentWithMeta } from '../types'
import { dbAll, dbFirst } from '../lib/db'
import { getOptions } from '../lib/options'
import { renderMarkdown } from '../lib/markdown'
import { excerptOf, formatDate, isoDate, positiveInt, readingMinutes, stripMarkdown } from '../lib/utils'
import { MetaPills, PageHeading, Pagination, PostMeta, PublicLayout } from '../components/public'

export const publicRoutes = new Hono<AppEnv>()

type MetaJoin = BlogMeta & { cid: number }

async function enrichContents(db: D1Database, contents: BlogContent[]): Promise<ContentWithMeta[]> {
  if (!contents.length) return []
  const ids = contents.map((item) => item.cid)
  const marks = ids.map(() => '?').join(',')
  const rows = await dbAll<MetaJoin>(db, `
    SELECT r.cid, m.mid, m.name, m.slug, m.type, m.description, m.count
    FROM blog_relationships r
    JOIN blog_metas m ON m.mid = r.mid
    WHERE r.cid IN (${marks})
    ORDER BY m.name COLLATE NOCASE
  `, ...ids)
  const grouped = new Map<number, BlogMeta[]>()
  for (const row of rows) {
    const list = grouped.get(row.cid) ?? []
    list.push(row)
    grouped.set(row.cid, list)
  }
  return contents.map((content) => {
    const metas = grouped.get(content.cid) ?? []
    return {
      ...content,
      categories: metas.filter((meta) => meta.type === 'category'),
      tags: metas.filter((meta) => meta.type === 'tag'),
    }
  })
}

function PostCards({ posts, timeZone }: { posts: ContentWithMeta[]; timeZone: string }) {
  if (!posts.length) return <div class="empty-state">暂无内容</div>
  return (
    <section class="post-list">
      {posts.map((post) => (
        <article class="post-card">
          <h2><a href={`/post/${encodeURIComponent(post.slug)}/`}>{post.title || '未命名文章'}</a></h2>
          <p class="post-excerpt">{excerptOf(post.text)}</p>
          <PostMeta created={post.created} categories={post.categories} reading={readingMinutes(post.text)} timeZone={timeZone} />
        </article>
      ))}
    </section>
  )
}

async function listByMeta(c: Context<AppEnv>, type: 'tag' | 'category', slug: string) {
  const options = await getOptions(c.env.BLOG_DB)
  const meta = await dbFirst<BlogMeta>(c.env.BLOG_DB, 'SELECT * FROM blog_metas WHERE type = ? AND slug = ? LIMIT 1', type, slug)
  if (!meta) return c.notFound()
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.posts_per_page, 10, 100)
  const countRow = await dbFirst<{ total: number }>(c.env.BLOG_DB, `
    SELECT COUNT(*) AS total
    FROM blog_contents c
    JOIN blog_relationships r ON r.cid = c.cid
    WHERE r.mid = ? AND c.type = 'post' AND c.status = 'publish'
  `, meta.mid)
  const total = countRow?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, `
    SELECT c.* FROM blog_contents c
    JOIN blog_relationships r ON r.cid = c.cid
    WHERE r.mid = ? AND c.type = 'post' AND c.status = 'publish'
    ORDER BY c.created DESC LIMIT ? OFFSET ?
  `, meta.mid, perPage, (page - 1) * perPage)
  const posts = await enrichContents(c.env.BLOG_DB, rows)
  const route = type === 'tag' ? `/tag/${encodeURIComponent(slug)}/` : `/category/${encodeURIComponent(slug)}/`
  return c.html(
    <PublicLayout options={options} title={meta.name} active={type === 'tag' ? 'tags' : undefined}>
      <PageHeading title={type === 'tag' ? `# ${meta.name}` : meta.name} subtitle={meta.description || `${total} 篇文章`} />
      <PostCards posts={posts} timeZone={options.site_timezone} />
      <Pagination page={page} totalPages={totalPages} path={route} />
    </PublicLayout>,
  )
}

publicRoutes.get('/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.posts_per_page, 10, 100)
  const count = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_contents WHERE type = 'post' AND status = 'publish'")
  const total = count?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, `
    SELECT * FROM blog_contents
    WHERE type = 'post' AND status = 'publish'
    ORDER BY created DESC LIMIT ? OFFSET ?
  `, perPage, (page - 1) * perPage)
  const posts = await enrichContents(c.env.BLOG_DB, rows)
  return c.html(
    <PublicLayout options={options} active="home">
      <PageHeading title={options.site_title} subtitle={options.site_description} />
      <PostCards posts={posts} timeZone={options.site_timezone} />
      <Pagination page={page} totalPages={totalPages} path="/" />
    </PublicLayout>,
  )
})

publicRoutes.get('/post/:slug/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const slug = c.req.param('slug')
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, `
    SELECT * FROM blog_contents
    WHERE slug = ? AND type IN ('post','page') AND status = 'publish'
    ORDER BY CASE type WHEN 'page' THEN 0 ELSE 1 END LIMIT 1
  `, slug)
  if (!content) return c.notFound()
  const [item] = await enrichContents(c.env.BLOG_DB, [content])
  const active = content.type === 'page' && content.slug === options.about_slug ? 'about' : undefined
  return c.html(
    <PublicLayout options={options} title={content.title} active={active} description={excerptOf(content.text, 150)}>
      <article>
        <header class="article-header">
          <h1>{content.title}</h1>
          <PostMeta created={content.created} categories={item.categories} reading={readingMinutes(content.text)} timeZone={options.site_timezone} />
        </header>
        <div class="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text) }} />
        <MetaPills tags={item.tags ?? []} />
      </article>
    </PublicLayout>,
  )
})

publicRoutes.get('/memos/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.memos_per_page, 20, 100)
  const countRow = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_contents WHERE type = 'memo' AND status = 'publish'")
  const total = countRow?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const memos = await dbAll<BlogContent>(c.env.BLOG_DB, `
    SELECT * FROM blog_contents WHERE type = 'memo' AND status = 'publish'
    ORDER BY created DESC LIMIT ? OFFSET ?
  `, perPage, (page - 1) * perPage)
  const since = Math.floor(Date.now() / 1000) - 370 * 86400
  const activityRows = await dbAll<{ created: number }>(c.env.BLOG_DB, `
    SELECT created FROM blog_contents
    WHERE type = 'memo' AND status = 'publish' AND created >= ?
  `, since)
  const activity = new Map<string, number>()
  for (const row of activityRows) {
    const day = isoDate(row.created, options.site_timezone)
    activity.set(day, (activity.get(day) ?? 0) + 1)
  }
  const days = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(Date.now() - (364 - index) * 86400000)
    const day = date.toISOString().slice(0, 10)
    const count = activity.get(day) ?? 0
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4
    return { day, count, level }
  })
  return c.html(
    <PublicLayout options={options} title="闪念" active="memos">
      <PageHeading title="闪念" subtitle="一些不成文章的碎片想法" />
      <div class="memo-summary"><span>{total} 条闪念</span><span>过去一年</span></div>
      <div class="heatmap-wrap" aria-label="闪念发布热力图">
        <div class="heatmap">{days.map((day) => <span class="heat-cell" data-level={day.level} title={`${day.day}：${day.count} 条`} />)}</div>
      </div>
      <section class="memo-list">
        {memos.length ? memos.map((memo) => (
          <article class="memo-card" id={`memo-${memo.cid}`}>
            <div class="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(memo.text) }} />
            <div class="memo-date">{formatDate(memo.created, true, options.site_timezone)}</div>
          </article>
        )) : <div class="empty-state">暂无闪念</div>}
      </section>
      <Pagination page={page} totalPages={totalPages} path="/memos/" />
    </PublicLayout>,
  )
})

publicRoutes.get('/archives/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const posts = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type = 'post' AND status = 'publish' ORDER BY created DESC")
  const tagCount = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_metas WHERE type = 'tag'")
  const enriched = await enrichContents(c.env.BLOG_DB, posts)
  const years = new Map<string, ContentWithMeta[]>()
  for (const post of enriched) {
    const year = isoDate(post.created, options.site_timezone).slice(0, 4)
    years.set(year, [...(years.get(year) ?? []), post])
  }
  return c.html(
    <PublicLayout options={options} title="归档" active="archives">
      <PageHeading title="归档" subtitle="站内全部文章，按时间倒序" />
      <div class="archive-stats"><span><strong>{posts.length}</strong>篇文章</span><span><strong>{tagCount?.total ?? 0}</strong>个标签</span></div>
      {[...years.entries()].map(([year, items]) => (
        <section class="archive-year"><h2>{year}</h2><ul class="archive-list">
          {items.map((post) => <li><time>{isoDate(post.created, options.site_timezone)}</time><a href={`/post/${encodeURIComponent(post.slug)}/`}>{post.title}</a><small>{post.categories?.[0]?.name ?? ''}</small></li>)}
        </ul></section>
      ))}
    </PublicLayout>,
  )
})

publicRoutes.get('/tags/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const tags = await dbAll<BlogMeta>(c.env.BLOG_DB, "SELECT * FROM blog_metas WHERE type = 'tag' ORDER BY count DESC, name COLLATE NOCASE")
  return c.html(
    <PublicLayout options={options} title="标签" active="tags">
      <PageHeading title="标签" subtitle={`${tags.length} 个标签`} />
      <div class="tag-cloud">{tags.map((tag) => <a class="tag-card" href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}<small>{tag.count}</small></a>)}</div>
    </PublicLayout>,
  )
})

publicRoutes.get('/tag/:slug/', (c) => listByMeta(c, 'tag', c.req.param('slug')))
publicRoutes.get('/category/:slug/', (c) => listByMeta(c, 'category', c.req.param('slug')))

publicRoutes.get('/links/', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const links = await dbAll<BlogLink>(c.env.BLOG_DB, 'SELECT id, name, url, icon, info, "order" AS "order" FROM blog_links ORDER BY "order" DESC, id DESC')
  return c.html(
    <PublicLayout options={options} title="导航" active="links">
      <PageHeading title="导航" subtitle="友链页面，也可以作为个人导航" />
      <div class="links-grid">{links.map((link) => (
        <a class="link-card" href={link.url} target="_blank" rel="noopener noreferrer">
          {link.icon ? <img src={link.icon} alt="" loading="lazy" /> : <span class="link-fallback">{link.name.slice(0, 1).toUpperCase()}</span>}
          <span><strong>{link.name}</strong><p>{link.info || link.url}</p></span>
        </a>
      ))}</div>
    </PublicLayout>,
  )
})

publicRoutes.get('/api/search', async (c) => {
  const q = c.req.query('q')?.trim()
  if (!q) return c.json({ items: [] })
  const like = `%${q.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, `
    SELECT DISTINCT c.* FROM blog_contents c
    LEFT JOIN blog_relationships r ON r.cid = c.cid
    LEFT JOIN blog_metas m ON m.mid = r.mid
    WHERE c.status = 'publish' AND c.type IN ('post','page','memo')
      AND (c.title LIKE ? ESCAPE '\\' OR c.text LIKE ? ESCAPE '\\' OR m.name LIKE ? ESCAPE '\\')
    ORDER BY c.created DESC LIMIT 12
  `, like, like, like)
  return c.json({
    items: rows.map((row) => ({
      title: row.type === 'memo' ? stripMarkdown(row.text).slice(0, 30) || '闪念' : row.title,
      excerpt: excerptOf(row.text, 90),
      url: row.type === 'memo' ? '/memos/' : `/post/${encodeURIComponent(row.slug)}/`,
    })),
  })
})
