import { Hono } from 'hono'
import type { AppEnv, AttachmentInfo, BlogComment, BlogContent, BlogLink, BlogMeta, ContentStatus, ContentType, MetaType, NavigationItem, NavigationSection, OptionMap } from '../types'
import { AdminLayout, AdminPagination, LoginPage } from '../components/admin'
import { createAdminSession, destroyAdminSession, requireAdmin, sameOriginOnly, verifyCredentials } from '../lib/auth'
import { dbAll, dbFirst, dbRun } from '../lib/db'
import { normalizeFaviconColor, normalizeFaviconText } from '../lib/favicon'
import { renderMarkdown } from '../lib/markdown'
import { getOptions, normalizeFileCdnUrl, saveOptions, TIMEZONE_OPTIONS, TIMEZONE_VALUES } from '../lib/options'
import { navigationItemRules, navigationSectionsFromOptions, normalizeNavigationItems, normalizeNavigationOrder, normalizeNavigationUrl, serializeNavigationItems } from '../lib/navigation'
import {
  attachmentInfo,
  datetimeLocal,
  draftSlug,
  fileKind,
  formatDate,
  insertionForAttachment,
  intValue,
  nowSeconds,
  parseDatetimeLocal,
  positiveInt,
  attachmentPath,
  publicAttachmentUrl,
  resolveUploadedUrls,
  safeReturnTo,
  slugify,
  stripMarkdown,
} from '../lib/utils'

export const adminRoutes = new Hono<AppEnv>()

const typeLabels: Record<ContentType, string> = {
  post: '文章', atta: '附件', memo: '闪念',
}
const statusLabels: Record<ContentStatus, string> = {
  publish: '已发布', draft: '草稿', hidden: '隐藏',
}

type AdminCommentRow = BlogComment & {
  content_title: string
  content_slug: string
  content_type: ContentType
}

function validContentType(value: string | undefined, fallback: ContentType = 'post'): ContentType {
  return ['post', 'atta', 'memo'].includes(value ?? '') ? value as ContentType : fallback
}

function validMetaType(value: string | undefined): MetaType {
  return value === 'category' ? 'category' : 'tag'
}

async function uniqueContentSlug(db: D1Database, type: ContentType, requested: string, cid: number): Promise<string> {
  const base = slugify(requested)
  let candidate = base
  let index = 2
  const sql = 'SELECT cid FROM blog_contents WHERE type = ? AND slug = ? AND cid != ? LIMIT 1'
  const conflict = () => dbFirst<{ cid: number }>(db, sql, type, candidate, cid)
  while (await conflict()) {
    candidate = `${base}-${index}`
    index += 1
  }
  return candidate
}

async function findOrCreateTag(db: D1Database, name: string): Promise<number> {
  const found = await dbFirst<{ mid: number }>(db, "SELECT mid FROM blog_metas WHERE type = 'tag' AND name = ? COLLATE NOCASE LIMIT 1", name)
  if (found) return found.mid
  const base = slugify(name)
  let slug = base
  let index = 2
  while (await dbFirst<{ mid: number }>(db, "SELECT mid FROM blog_metas WHERE type = 'tag' AND slug = ? LIMIT 1", slug)) {
    slug = `${base}-${index}`
    index += 1
  }
  const result = await dbRun(db, "INSERT INTO blog_metas(name, slug, type, description, count) VALUES(?, ?, 'tag', '', 0)", name, slug)
  return Number(result.meta.last_row_id)
}

async function contentAttachments(db: D1Database, parent: number): Promise<Array<{ content: BlogContent; info: AttachmentInfo }>> {
  const rows = await dbAll<BlogContent>(db, "SELECT * FROM blog_contents WHERE type = 'atta' AND parent = ? ORDER BY created DESC", parent)
  return rows.flatMap((content) => {
    const info = attachmentInfo(content)
    return info ? [{ content, info }] : []
  })
}

function EditorToolbar() {
  const buttons = [
    ['bold', 'B', '粗体'], ['italic', 'I', '斜体'], ['heading', 'H', '标题'], ['quote', '❞', '引用'],
    ['ul', '•', '无序列表'], ['ol', '1.', '有序列表'], ['code', '</>', '代码'], ['link', '↗', '链接'],
    ['image', '▧', '图片'], ['more', '…', '摘要分隔'], ['hr', '—', '分割线'],
  ]
  return <div class="md-toolbar">{buttons.map(([action, label, title]) => <button type="button" data-md-action={action} title={title}>{label}</button>)}<button type="button" data-preview-toggle title="预览">◫</button><button type="button" data-fullscreen title="全屏">⛶</button></div>
}

function NavigationRows({ items, section }: { items: NavigationItem[]; section: NavigationSection }) {
  return <div class="navigation-list" data-navigation-list data-navigation-section={section}>{items.map((item) => {
    const rules = navigationItemRules(item.id)
    return <div class={`navigation-row navigation-row-${section}`} data-navigation-row data-navigation-id={item.id}>
      <input type="hidden" name="nav_id" value={item.id} />
      <input type="hidden" name={`nav_section:${item.id}`} value={section} />
      <div class="field navigation-order-field"><label>次序</label><input class="input" name={`nav_order:${item.id}`} type="number" step="1" value={item.order} required /></div>
      <div class="field navigation-name-field"><label>菜单名</label><input class="input" name={`nav_name:${item.id}`} value={item.name} maxLength={40} required /></div>
      <div class="field navigation-url-field"><label>页面 URL</label><input class="input" name={`nav_url:${item.id}`} value={item.url} maxLength={1000} readOnly={!rules.canEditUrl} required /></div>
      {section === 'custom' ? <div class="field navigation-template-field"><label>模板</label><select class="select" name={`nav_template:${item.id}`}><option value="page" selected={item.template !== 'about'}>页面</option><option value="about" selected={item.template === 'about'}>关于</option></select></div> : null}
      <div class="navigation-visible-field"><label><input type="checkbox" name={`nav_visible:${item.id}`} value="true" checked={item.visible} disabled={!rules.canHide} /> 显示</label>{!rules.canHide ? <small>始终显示</small> : null}</div>
      <div class="navigation-delete-field">{rules.canDelete ? <button class="button small danger" type="button" data-navigation-delete>删除</button> : <span class="muted">自带</span>}</div>
    </div>
  })}</div>
}

function AttachmentRows({ rows, fileCdnUrl }: { rows: Array<{ content: BlogContent; info: AttachmentInfo }>; fileCdnUrl: string }) {
  return <div class="attachment-list" data-attachment-list>{rows.map(({ content, info }) => {
    const kind = fileKind(info.mime)
    const displayUrl = publicAttachmentUrl(info.url, fileCdnUrl)
    return <div class="attachment-item">
      <div class="attachment-thumb">{kind === 'image' ? <img src={displayUrl} alt="" loading="lazy" /> : kind === 'video' ? 'VIDEO' : 'FILE'}</div>
      <div><div class="attachment-name" title={info.originalName}>{info.originalName}</div><small class="muted">{Math.ceil(info.size / 1024)} KB</small></div>
      <div><button type="button" class="button small" data-attachment-insert={insertionForAttachment(info)}>插入</button> <button type="button" class="button small danger" data-attachment-delete={content.cid}>删除</button></div>
    </div>
  })}</div>
}

adminRoutes.get('/admin/login', (c) => c.html(<LoginPage returnTo={safeReturnTo(c.req.query('returnTo'))} />))

adminRoutes.post('/admin/login', async (c) => {
  const form = await c.req.formData()
  const name = String(form.get('name') ?? '')
  const password = String(form.get('password') ?? '')
  const returnTo = safeReturnTo(String(form.get('returnTo') ?? '/admin'))
  if (!verifyCredentials(c, name, password)) {
    return c.html(<LoginPage error="用户名或密码错误" returnTo={returnTo} />, 401)
  }
  await createAdminSession(c)
  c.executionCtx.waitUntil(dbRun(c.env.BLOG_DB, 'DELETE FROM blog_cookies WHERE expired <= ?', nowSeconds()).then(() => undefined))
  return c.redirect(returnTo)
})

adminRoutes.use('/admin/*', requireAdmin)
adminRoutes.use('/admin/*', sameOriginOnly)

adminRoutes.get('/admin/logout', async (c) => {
  await destroyAdminSession(c)
  return c.redirect('/admin/login')
})

adminRoutes.get('/admin', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const counts = await dbAll<{ type: ContentType; status: ContentStatus; total: number }>(c.env.BLOG_DB, `
    SELECT type, status, COUNT(*) AS total FROM blog_contents
    WHERE type != 'atta' GROUP BY type, status
  `)
  const count = (type: ContentType, status?: ContentStatus) => counts.filter((row) => row.type === type && (!status || row.status === status)).reduce((sum, row) => sum + row.total, 0)
  const recent = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type IN ('post','memo') ORDER BY modified DESC LIMIT 8")
  const links = await dbFirst<{ total: number }>(c.env.BLOG_DB, 'SELECT COUNT(*) AS total FROM blog_links')
  const comments = await dbFirst<{ total: number }>(c.env.BLOG_DB, 'SELECT COUNT(*) AS total FROM blog_comments')
  return c.html(
    <AdminLayout title="面板" subtitle="欢迎回来，下面是站点概况。" actions={<a class="button primary" href="/admin/content/new?type=post">写文章</a>}>
      <section class="stats-grid">
        <div class="panel stat"><strong>{count('post')}</strong><span>文章</span></div>
        <div class="panel stat"><strong>{count('memo')}</strong><span>闪念</span></div>
        <div class="panel stat"><strong>{comments?.total ?? 0}</strong><span>评论</span></div>
        <div class="panel stat"><strong>{links?.total ?? 0}</strong><span>友链</span></div>
      </section>
      <div class="dashboard-columns">
        <section class="panel"><div class="panel-body"><h3>最近编辑</h3><table class="admin-table"><tbody>{recent.map((item) => <tr><td><a href={`/admin/content/${item.cid}`}>{item.title || stripMarkdown(item.text).slice(0, 24) || '未命名'}</a></td><td>{typeLabels[item.type]}</td><td class="muted">{formatDate(item.modified, true, options.site_timezone)}</td></tr>)}</tbody></table></div></section>
        <section class="panel"><div class="panel-body"><h3>快捷入口</h3><p><a href="/admin/content/new?type=post">撰写文章</a></p><p><a href="/admin/content/new?type=memo">发布闪念</a></p><p><a href="/admin/comments">管理评论</a></p><p><a href="/admin/attachments">上传附件</a></p><p><a href="/admin/options">站点设置</a></p></div></section>
      </div>
    </AdminLayout>,
  )
})

adminRoutes.get('/admin/navigation', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const sections = navigationSectionsFromOptions(options)
  return c.html(
    <AdminLayout title="导航管理" subtitle="自带菜单与新增菜单分别按次序升序排列；次序相同时按菜单名排列。" actions={<button class="button primary" type="button" data-navigation-add>新增菜单</button>}>
      {c.req.query('saved') ? <div class="notice">导航菜单已保存。</div> : null}
      <form method="post" action="/admin/navigation" class="main-form navigation-form" data-navigation-form>
        <section class="panel navigation-section"><div class="panel-body">
          <div class="navigation-list-head"><span>自带菜单</span><small class="muted">不能删除；可以修改菜单名、显示状态和次序。次序越小越靠前。</small></div>
          <NavigationRows items={sections.fixed} section="fixed" />
        </div></section>
        <section class="panel navigation-section"><div class="panel-body">
          <div class="navigation-list-head"><span>新增菜单</span><small class="muted">页面 URL 可以修改，也可以设置模板、显示状态和次序；保存刷新后按次序重新排列。</small></div>
          <NavigationRows items={sections.custom} section="custom" />
        </div></section>
        <div><button class="button primary" type="submit">保存导航</button></div>
      </form>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/navigation', async (c) => {
  const form = await c.req.formData()
  const ids = form.getAll('nav_id').map((value) => String(value).trim()).filter(Boolean).slice(0, 60)
  const submitted: NavigationItem[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    const rules = navigationItemRules(id)
    const section = String(form.get(`nav_section:${id}`) ?? rules.section) === 'fixed' ? 'fixed' : 'custom'
    submitted.push({
      id,
      name: String(form.get(`nav_name:${id}`) ?? '').trim(),
      url: normalizeNavigationUrl(form.get(`nav_url:${id}`), '/'),
      visible: form.get(`nav_visible:${id}`) === 'true' || id === 'home',
      section,
      order: normalizeNavigationOrder(form.get(`nav_order:${id}`), 0),
      ...(section === 'custom' ? { template: form.get(`nav_template:${id}`) === 'about' ? 'about' : 'page' } : {}),
    })
  }
  const items = normalizeNavigationItems(JSON.stringify(submitted))
  await saveOptions(c.env.BLOG_DB, { navigation_menu: serializeNavigationItems(items) })
  return c.redirect('/admin/navigation?saved=1')
})

adminRoutes.get('/admin/contents', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const type = validContentType(c.req.query('type'))
  const status = c.req.query('status') as ContentStatus | undefined
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(type === 'memo' ? options.admin_memos_per_page : options.admin_contents_per_page, 25, 100)
  const statusFilter = ['publish', 'draft', 'hidden'].includes(status ?? '') ? status : undefined
  const where = statusFilter ? 'WHERE type = ? AND status = ?' : 'WHERE type = ?'
  const args = statusFilter ? [type, statusFilter] : [type]
  const countRow = await dbFirst<{ total: number }>(c.env.BLOG_DB, `SELECT COUNT(*) AS total FROM blog_contents ${where}`, ...args)
  const total = countRow?.total ?? 0
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, `SELECT * FROM blog_contents ${where} ORDER BY released DESC, cid DESC LIMIT ? OFFSET ?`, ...args, perPage, (page - 1) * perPage)
  const basePath = `/admin/contents?type=${type}${statusFilter ? `&status=${statusFilter}` : ''}`
  const now = nowSeconds()
  return c.html(
    <AdminLayout title={`${typeLabels[type]}管理`} subtitle={`共 ${total} 条`} actions={<a class="button primary" href={`/admin/content/new?type=${type}`}>新增{typeLabels[type]}</a>}>
      <div class="toolbar-line filter-tabs">
        <a class={!statusFilter ? 'active' : undefined} href={`/admin/contents?type=${type}`}>全部</a>
        <a class={statusFilter === 'publish' ? 'active' : undefined} href={`/admin/contents?type=${type}&status=publish`}>已发布</a>
        <a class={statusFilter === 'draft' ? 'active' : undefined} href={`/admin/contents?type=${type}&status=draft`}>草稿</a>
        <a class={statusFilter === 'hidden' ? 'active' : undefined} href={`/admin/contents?type=${type}&status=hidden`}>隐藏</a>
      </div>
      <section class="panel"><table class="admin-table"><thead><tr><th>标题</th><th>状态</th><th>发布时间</th><th>创建时间</th><th>修改时间</th></tr></thead><tbody>
        {rows.length ? rows.map((item) => <tr>
          <td class="title-cell"><strong><a href={`/admin/content/${item.cid}`}>{item.title || stripMarkdown(item.text).slice(0, 32) || '未命名'}</a></strong><div class="row-actions"><a href={`/admin/content/${item.cid}`}>编辑</a>{item.status === 'publish' && item.type !== 'memo' && item.released <= now ? <a href={`/post/${encodeURIComponent(item.slug)}/`} target="_blank">查看</a> : null}<form class="inline-form" method="post" action={`/admin/content/${item.cid}/delete`}><button class="button small danger" type="submit" data-confirm="确定删除这条内容吗？">删除</button></form></div></td>
          <td><span class={`status ${item.status}`}>{statusLabels[item.status]}</span></td><td>{formatDate(item.released, true, options.site_timezone)}</td><td>{formatDate(item.created, true, options.site_timezone)}</td><td>{formatDate(item.modified, true, options.site_timezone)}</td>
        </tr>) : <tr><td colspan={5} class="empty-state">暂无内容</td></tr>}
      </tbody></table></section>
      <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / perPage))} path={basePath} />
    </AdminLayout>,
  )
})

adminRoutes.get('/admin/content/new', async (c) => {
  const type = validContentType(c.req.query('type'))
  if (type === 'atta') return c.redirect('/admin/attachments')
  const now = nowSeconds()
  const title = type === 'memo'
    ? formatDate(now, true, (await getOptions(c.env.BLOG_DB)).site_timezone)
    : ''
  const result = await dbRun(c.env.BLOG_DB, `INSERT INTO blog_contents(parent, title, slug, created, modified, released, text, type, status) VALUES(0, ?, ?, ?, ?, ?, '', ?, 'draft')`, title, draftSlug(type), now, now, now, type)
  return c.redirect(`/admin/content/${Number(result.meta.last_row_id)}`)
})

adminRoutes.get('/admin/content/:cid', async (c) => {
  const cid = intValue(c.req.param('cid'))
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, 'SELECT * FROM blog_contents WHERE cid = ? LIMIT 1', cid)
  if (!content || content.type === 'atta') return c.notFound()
  const options = await getOptions(c.env.BLOG_DB)
  const categories = content.type === 'memo' ? [] : await dbAll<BlogMeta>(c.env.BLOG_DB, "SELECT * FROM blog_metas WHERE type = 'category' ORDER BY name COLLATE NOCASE")
  const assigned = await dbAll<BlogMeta>(c.env.BLOG_DB, 'SELECT m.* FROM blog_metas m JOIN blog_relationships r ON r.mid = m.mid WHERE r.cid = ? ORDER BY m.name COLLATE NOCASE', cid)
  const assignedCategoryIds = new Set(assigned.filter((meta) => meta.type === 'category').map((meta) => meta.mid))
  const assignedTags = assigned.filter((meta) => meta.type === 'tag')
  const attachments = await contentAttachments(c.env.BLOG_DB, cid)
  return c.html(
    <AdminLayout title={`编辑${typeLabels[content.type]}`} subtitle={`CID ${content.cid}`} actions={<a class="button" href={`/admin/contents?type=${content.type}`}>返回列表</a>}>
      {c.req.query('saved') ? <div class="notice">保存成功。</div> : null}
      <form method="post" action={`/admin/content/${cid}`} class="form-grid">
        <div class="main-form">
          {content.type !== 'memo' ? <>
            <div class="field"><label for="title">标题</label><input class="input" id="title" name="title" value={content.title} placeholder="请输入标题" /></div>
            <div class="field"><label for="slug">URL 别名</label><input class="input" id="slug" name="slug" value={content.slug.includes('-draft-') ? '' : content.slug} placeholder="留空根据标题生成" /></div>
            <div class="field cover-url-field"><label for="cover">封面 URL</label><div class="input-inline-action"><input class="input" id="cover" name="cover" type="text" inputMode="url" value={content.cover || ''} placeholder="https://example.com/cover.jpg 或 /2026/07/cover.jpg" data-cover-url /><label class="input-inline-button" for="cover-upload">上传</label><input id="cover-upload" type="file" accept="image/*" data-cover-upload data-cid={cid} hidden /></div><small class="muted" data-cover-status></small></div>
          </> : <div class="memo-editor-note">闪念标题会根据发布时间自动生成，格式为“{formatDate(content.released, true, options.site_timezone)}”。</div>}
          <div class="editor-panel" data-editor-panel>
            <EditorToolbar />
            <div class="editor-workspace">
              <textarea class="editor-textarea" name="text" data-editor>{content.text}</textarea>
              <div class="editor-preview prose-preview" data-preview></div>
            </div>
          </div>
        </div>
        <aside class="side-form">
          <section class="side-box"><h3>发布</h3><div class="side-box-body">
            <div class="field"><span>状态</span><select class="select" name="status"><option value="draft" selected={content.status === 'draft'}>草稿</option><option value="publish" selected={content.status === 'publish'}>发布</option></select></div>
            <div class="field"><label><input type="checkbox" name="hidden" value="1" checked={content.status === 'hidden'} /> 隐藏内容</label></div>
            <div class="field"><span>创建时间</span><div class="readonly-value">{formatDate(content.created, true, options.site_timezone)}</div></div>
            <div class="field"><label for="released">发布时间</label><input class="input" id="released" name="released" type="datetime-local" value={datetimeLocal(content.released, options.site_timezone)} /></div>
            <button class="button primary" type="submit">保存</button>
          </div></section>
          {content.type !== 'memo' ? <section class="side-box"><h3>分类</h3><div class="side-box-body checkbox-list">{categories.length ? categories.map((category) => <label><input type="checkbox" name="categories" value={category.mid} checked={assignedCategoryIds.has(category.mid)} /> {category.name}</label>) : <span class="muted">请先创建分类</span>}</div></section> : null}
          <section class="side-box"><h3>标签</h3><div class="side-box-body"><div class="tags-input" data-tags>{assignedTags.map((tag) => <span class="tag-chip"><span>{tag.name}</span><button type="button">×</button></span>)}<input type="text" placeholder="输入后回车" /><input type="hidden" name="tags" data-tags-hidden /></div></div></section>
          <section class="side-box"><h3>附件</h3><div class="side-box-body"><label class="button" for="content-upload">上传到 R2</label><input id="content-upload" data-upload-input data-cid={cid} type="file" multiple hidden /><div class="progress" data-upload-status></div><hr /><AttachmentRows rows={attachments} fileCdnUrl={options.file_cdn_url} /></div></section>
        </aside>
      </form>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/content/:cid', async (c) => {
  const cid = intValue(c.req.param('cid'))
  const current = await dbFirst<BlogContent>(c.env.BLOG_DB, 'SELECT * FROM blog_contents WHERE cid = ? LIMIT 1', cid)
  if (!current || current.type === 'atta') return c.notFound()
  const options = await getOptions(c.env.BLOG_DB)
  const form = await c.req.formData()
  const text = String(form.get('text') ?? '')
  const released = parseDatetimeLocal(String(form.get('released') ?? ''), current.released, options.site_timezone)
  let title = String(form.get('title') ?? '').trim()
  if (current.type === 'memo') title = formatDate(released, true, options.site_timezone)
  if (!title) title = '未命名'
  const requestedSlug = current.type === 'memo'
    ? (current.slug.includes('-draft-') ? `memo-${released}` : current.slug)
    : String(form.get('slug') ?? '').trim() || title
  const slug = await uniqueContentSlug(c.env.BLOG_DB, current.type, requestedSlug, cid)
  const cover = current.type === 'memo' ? '' : String(form.get('cover') ?? '').trim()
  const requestedStatus = String(form.get('status') ?? 'draft') === 'publish' ? 'publish' : 'draft'
  const status: ContentStatus = form.get('hidden') === '1' ? 'hidden' : requestedStatus
  const categoryIds = current.type === 'memo' ? [] : [...new Set(form.getAll('categories').map((value) => intValue(value)).filter(Boolean))]
  const tagNames = [...new Set(String(form.get('tags') ?? '').split(/[,，]/).map((name) => name.trim()).filter(Boolean))]
  const tagIds: number[] = []
  for (const name of tagNames) tagIds.push(await findOrCreateTag(c.env.BLOG_DB, name))
  const relationIds = [...new Set([...categoryIds, ...tagIds])]
  const statements = [
    c.env.BLOG_DB.prepare('UPDATE blog_contents SET title = ?, slug = ?, cover = ?, modified = ?, released = ?, text = ?, status = ? WHERE cid = ?').bind(title, slug, cover, nowSeconds(), released, text, status, cid),
    c.env.BLOG_DB.prepare('DELETE FROM blog_relationships WHERE cid = ?').bind(cid),
    ...relationIds.map((mid) => c.env.BLOG_DB.prepare('INSERT OR IGNORE INTO blog_relationships(cid, mid) VALUES(?, ?)').bind(cid, mid)),
  ]
  await c.env.BLOG_DB.batch(statements)
  return c.redirect(`/admin/content/${cid}?saved=1`)
})

adminRoutes.post('/admin/content/:cid/delete', async (c) => {
  const cid = intValue(c.req.param('cid'))
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, 'SELECT * FROM blog_contents WHERE cid = ? LIMIT 1', cid)
  if (!content) return c.notFound()
  const children = await contentAttachments(c.env.BLOG_DB, cid)
  const keys = children.map(({ info }) => info.key)
  if (content.type === 'atta') {
    const info = attachmentInfo(content)
    if (info) keys.push(info.key)
  }
  if (keys.length) await c.env.BLOG_R2.delete(keys)
  const statements = [
    c.env.BLOG_DB.prepare('DELETE FROM blog_relationships WHERE cid = ?').bind(cid),
    ...children.map(({ content: child }) => c.env.BLOG_DB.prepare('DELETE FROM blog_contents WHERE cid = ?').bind(child.cid)),
    c.env.BLOG_DB.prepare('DELETE FROM blog_contents WHERE cid = ?').bind(cid),
  ]
  await c.env.BLOG_DB.batch(statements)
  return c.redirect(`/admin/contents?type=${content.type === 'atta' ? 'post' : content.type}`)
})

adminRoutes.get('/admin/metas', async (c) => {
  const type = validMetaType(c.req.query('type'))
  const editId = intValue(c.req.query('edit'))
  const edit = editId ? await dbFirst<BlogMeta>(c.env.BLOG_DB, 'SELECT * FROM blog_metas WHERE mid = ? AND type = ? LIMIT 1', editId, type) : null
  const rows = await dbAll<BlogMeta>(c.env.BLOG_DB, 'SELECT * FROM blog_metas WHERE type = ? ORDER BY name COLLATE NOCASE', type)
  const label = type === 'category' ? '分类' : '标签'
  return c.html(
    <AdminLayout title={`${label}管理`} subtitle={`${rows.length} 个${label}`}>
      <div class="two-columns meta-columns">
        <section class="panel meta-list-panel"><table class="admin-table"><thead><tr><th>名称</th><th>别名</th><th>文章数</th></tr></thead><tbody>{rows.map((meta) => <tr><td>{meta.name}<div class="row-actions"><a href={`/admin/metas?type=${type}&edit=${meta.mid}`}>编辑</a><form class="inline-form" method="post" action={`/admin/metas/${meta.mid}/delete`}><button class="button small danger" type="submit" data-confirm={`确定删除${label}“${meta.name}”吗？`}>删除</button></form></div></td><td>{meta.slug}</td><td>{meta.count}</td></tr>)}</tbody></table></section>
        <section class="panel meta-form-panel"><div class="panel-body"><h3>{edit ? `编辑${label}` : `新增${label}`}</h3><form method="post" action="/admin/metas" class="main-form"><input type="hidden" name="type" value={type} /><input type="hidden" name="mid" value={edit?.mid ?? ''} /><div class="field"><label>名称</label><input class="input" name="name" value={edit?.name ?? ''} required /></div><div class="field"><label>别名</label><input class="input" name="slug" value={edit?.slug ?? ''} placeholder="留空自动生成" /></div><div class="field"><label>描述</label><textarea class="textarea" name="description">{edit?.description ?? ''}</textarea></div><button class="button primary" type="submit">保存</button>{edit ? <a class="button" href={`/admin/metas?type=${type}`}>取消</a> : null}</form></div></section>
      </div>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/metas', async (c) => {
  const form = await c.req.formData()
  const type = validMetaType(String(form.get('type') ?? 'tag'))
  const mid = intValue(form.get('mid'))
  const name = String(form.get('name') ?? '').trim()
  if (!name) return c.text('名称不能为空', 400)
  const slug = slugify(String(form.get('slug') ?? '').trim() || name)
  const description = String(form.get('description') ?? '')
  try {
    if (mid) await dbRun(c.env.BLOG_DB, 'UPDATE blog_metas SET name = ?, slug = ?, description = ? WHERE mid = ? AND type = ?', name, slug, description, mid, type)
    else await dbRun(c.env.BLOG_DB, 'INSERT INTO blog_metas(name, slug, type, description, count) VALUES(?, ?, ?, ?, 0)', name, slug, type, description)
  } catch {
    return c.text('名称或别名已存在', 409)
  }
  return c.redirect(`/admin/metas?type=${type}`)
})

adminRoutes.post('/admin/metas/:mid/delete', async (c) => {
  const mid = intValue(c.req.param('mid'))
  const meta = await dbFirst<BlogMeta>(c.env.BLOG_DB, 'SELECT * FROM blog_metas WHERE mid = ? LIMIT 1', mid)
  if (!meta) return c.notFound()
  await c.env.BLOG_DB.batch([
    c.env.BLOG_DB.prepare('DELETE FROM blog_relationships WHERE mid = ?').bind(mid),
    c.env.BLOG_DB.prepare('DELETE FROM blog_metas WHERE mid = ?').bind(mid),
  ])
  return c.redirect(`/admin/metas?type=${meta.type}`)
})

adminRoutes.get('/admin/attachments', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.admin_attachments_per_page, 30, 100)
  const count = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_contents WHERE type = 'atta'")
  const total = count?.total ?? 0
  const contents = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type = 'atta' ORDER BY created DESC LIMIT ? OFFSET ?", perPage, (page - 1) * perPage)
  const rows = contents.flatMap((content) => {
    const info = attachmentInfo(content)
    return info ? [{ content, info }] : []
  })
  return c.html(
    <AdminLayout title="附件管理" subtitle={`共 ${total} 个附件`} actions={<><label class="button primary" for="global-upload">上传附件</label><input id="global-upload" data-upload-input type="file" multiple hidden /></>}>
      <div class="progress" data-upload-status></div>
      <section class="panel"><div class="panel-body"><AttachmentRows rows={rows} fileCdnUrl={options.file_cdn_url} /></div></section>
      <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / perPage))} path="/admin/attachments" />
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/api/attachments', async (c) => {
  const form = await c.req.formData()
  const value = form.get('file')
  if (!(value instanceof File)) return c.json({ error: '没有收到文件' }, 400)
  const maxMb = positiveInt(c.env.MAX_UPLOAD_MB, 25, 100)
  if (value.size > maxMb * 1024 * 1024) return c.json({ error: `文件不能超过 ${maxMb} MB` }, 413)
  const parent = Math.max(0, intValue(form.get('cid')))
  if (parent > 0) {
    const parentContent = await dbFirst<{ cid: number }>(c.env.BLOG_DB, "SELECT cid FROM blog_contents WHERE cid = ? AND type != 'atta'", parent)
    if (!parentContent) return c.json({ error: '关联内容不存在' }, 404)
  }
  const extMatch = value.name.match(/(\.[a-zA-Z0-9]{1,10})$/)
  const ext = extMatch?.[1]?.toLowerCase() ?? ''
  const date = new Date()
  const key = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}${ext}`
  const mime = value.type || 'application/octet-stream'
  await c.env.BLOG_R2.put(key, value.stream(), { httpMetadata: { contentType: mime, cacheControl: 'public, max-age=31536000, immutable' } })
  const options = await getOptions(c.env.BLOG_DB)
  const storedInfo: AttachmentInfo = {
    key,
    url: attachmentPath(key),
    mime,
    size: value.size,
    originalName: value.name,
  }
  const now = nowSeconds()
  const result = await dbRun(c.env.BLOG_DB, `
    INSERT INTO blog_contents(parent, title, slug, created, modified, released, text, type, status)
    VALUES(?, ?, ?, ?, ?, ?, ?, 'atta', 'publish')
  `, parent, value.name, key, now, now, now, JSON.stringify(storedInfo))
  const cid = Number(result.meta.last_row_id)
  const info = { ...storedInfo, url: publicAttachmentUrl(storedInfo.url, options.file_cdn_url) }
  return c.json({ attachment: { cid, parent, ...info, path: storedInfo.url }, insertion: insertionForAttachment({ ...storedInfo, url: storedInfo.url }) })
})

adminRoutes.delete('/admin/api/attachments/:cid', async (c) => {
  const cid = intValue(c.req.param('cid'))
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE cid = ? AND type = 'atta' LIMIT 1", cid)
  if (!content) return c.json({ error: '附件不存在' }, 404)
  const info = attachmentInfo(content)
  if (info) await c.env.BLOG_R2.delete(info.key)
  await dbRun(c.env.BLOG_DB, 'DELETE FROM blog_contents WHERE cid = ?', cid)
  return c.json({ ok: true })
})

adminRoutes.post('/admin/api/preview', async (c) => {
  const body: { text?: string } = await c.req.json<{ text?: string }>().catch(() => ({}))
  const options = await getOptions(c.env.BLOG_DB)
  return c.json({ html: resolveUploadedUrls(renderMarkdown(body.text ?? ''), options.file_cdn_url) })
})

adminRoutes.get('/admin/comments', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = positiveInt(options.admin_comments_per_page, 20, 100)
  const cid = intValue(c.req.query('cid'))
  const where = cid ? 'WHERE cm.cid = ?' : ''
  const args = cid ? [cid] : []
  const count = await dbFirst<{ total: number }>(c.env.BLOG_DB, `SELECT COUNT(*) AS total FROM blog_comments cm ${where}`, ...args)
  const total = count?.total ?? 0
  const rows = await dbAll<AdminCommentRow>(c.env.BLOG_DB, `
    SELECT cm.*, c.title AS content_title, c.slug AS content_slug, c.type AS content_type
    FROM blog_comments cm JOIN blog_contents c ON c.cid = cm.cid
    ${where}
    ORDER BY cm.created DESC, cm.id DESC LIMIT ? OFFSET ?
  `, ...args, perPage, (page - 1) * perPage)
  const path = cid ? `/admin/comments?cid=${cid}` : '/admin/comments'
  return c.html(
    <AdminLayout title="评论管理" subtitle={`共 ${total} 条评论`}>
      <section class="panel"><table class="admin-table comments-admin-table"><thead><tr><th>作者</th><th>评论</th><th>内容</th><th>时间</th></tr></thead><tbody>
        {rows.length ? rows.map((comment) => <tr>
          <td><strong>{comment.name}</strong><div class="muted">{comment.email}</div>{comment.site ? <a href={comment.site} target="_blank" rel="noopener noreferrer">{comment.site}</a> : null}<div class="row-actions"><a href={`/admin/comment/${comment.id}`}>编辑</a><form class="inline-form" method="post" action={`/admin/comment/${comment.id}/delete`}><button class="button small danger" type="submit" data-confirm="确定删除这条评论吗？">删除</button></form></div></td>
          <td class="comment-text-cell">{comment.text}</td>
          <td><a href={`/admin/content/${comment.cid}`}>{comment.content_title || `CID ${comment.cid}`}</a><div class="row-actions"><a href={`/admin/comments?cid=${comment.cid}`}>只看此内容</a>{comment.content_type !== 'memo' ? <a href={`/post/${encodeURIComponent(comment.content_slug)}/#comments`} target="_blank">查看页面</a> : null}</div></td>
          <td>{formatDate(comment.created, true, options.site_timezone)}</td>
        </tr>) : <tr><td colspan={4} class="empty-state">暂无评论</td></tr>}
      </tbody></table></section>
      <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / perPage))} path={path}/>
    </AdminLayout>,
  )
})

adminRoutes.get('/admin/comment/:id', async (c) => {
  const id = intValue(c.req.param('id'))
  const options = await getOptions(c.env.BLOG_DB)
  const comment = await dbFirst<AdminCommentRow>(c.env.BLOG_DB, `
    SELECT cm.*, c.title AS content_title, c.slug AS content_slug, c.type AS content_type
    FROM blog_comments cm JOIN blog_contents c ON c.cid = cm.cid WHERE cm.id = ? LIMIT 1
  `, id)
  if (!comment) return c.notFound()
  return c.html(
    <AdminLayout title="编辑评论" subtitle={`评论 #${comment.id}`} actions={<a class="button" href="/admin/comments">返回列表</a>}>
      {c.req.query('saved') ? <div class="notice">评论已保存。</div> : null}
      <section class="panel"><div class="panel-body"><form method="post" action={`/admin/comment/${comment.id}`} class="main-form comment-edit-form">
        <div class="settings-inline"><div class="field"><label>名字</label><input class="input" name="name" maxLength={100} value={comment.name} required /></div><div class="field"><label>邮箱</label><input class="input" name="email" type="email" maxLength={200} value={comment.email} required /></div></div>
        <div class="field"><label>网站</label><input class="input" name="site" maxLength={500} value={comment.site} /></div>
        <div class="field"><label>评论内容</label><textarea class="textarea comment-edit-text" name="text" maxLength={5000} required>{comment.text}</textarea></div>
        <div class="comment-context"><strong>评论对象：</strong><a href={`/admin/content/${comment.cid}`}>{comment.content_title || `CID ${comment.cid}`}</a><span> · {formatDate(comment.created, true, options.site_timezone)}</span></div>
        <div><button class="button primary" type="submit">保存评论</button> <button class="button danger" type="submit" formaction={`/admin/comment/${comment.id}/delete`} formmethod="post" data-confirm="确定删除这条评论吗？">删除</button></div>
      </form></div></section>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/comment/:id', async (c) => {
  const id = intValue(c.req.param('id'))
  const form = await c.req.formData()
  const name = String(form.get('name') ?? '').trim().slice(0, 100)
  const email = String(form.get('email') ?? '').trim().slice(0, 200)
  const text = String(form.get('text') ?? '').trim().slice(0, 5000)
  let site = String(form.get('site') ?? '').trim().slice(0, 500)
  if (!name || !email || !text) return c.text('名字、邮箱和评论内容不能为空', 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.text('邮箱格式不正确', 400)
  if (site) {
    if (!/^https?:\/\//i.test(site)) site = `https://${site}`
    try {
      const parsed = new URL(site)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid protocol')
      site = parsed.toString()
    } catch {
      return c.text('网站地址格式不正确', 400)
    }
  }
  await dbRun(c.env.BLOG_DB, 'UPDATE blog_comments SET name = ?, email = ?, site = ?, text = ? WHERE id = ?', name, email, site, text, id)
  return c.redirect(`/admin/comment/${id}?saved=1`)
})

adminRoutes.post('/admin/comment/:id/delete', async (c) => {
  await dbRun(c.env.BLOG_DB, 'DELETE FROM blog_comments WHERE id = ?', intValue(c.req.param('id')))
  return c.redirect('/admin/comments')
})

adminRoutes.get('/admin/links', async (c) => {
  const editId = intValue(c.req.query('edit'))
  const edit = editId ? await dbFirst<BlogLink>(c.env.BLOG_DB, 'SELECT id, name, url, icon, info, "order" AS "order" FROM blog_links WHERE id = ?', editId) : null
  const rows = await dbAll<BlogLink>(c.env.BLOG_DB, 'SELECT id, name, url, icon, info, "order" AS "order" FROM blog_links ORDER BY "order" DESC, id DESC')
  return c.html(
    <AdminLayout title="友链管理" subtitle={`${rows.length} 条友链`}>
      <div class="two-columns link-columns">
        <section class="panel link-list-panel"><table class="admin-table"><thead><tr><th>名字</th><th>网址</th><th>次序</th></tr></thead><tbody>{rows.map((link) => <tr><td>{link.name}<div class="row-actions"><a href={`/admin/links?edit=${link.id}`}>编辑</a><form class="inline-form" method="post" action={`/admin/links/${link.id}/delete`}><button class="button small danger" type="submit" data-confirm={`确定删除“${link.name}”吗？`}>删除</button></form></div></td><td><a href={link.url} target="_blank">{link.url}</a></td><td>{link.order}</td></tr>)}</tbody></table></section>
        <section class="panel link-form-panel"><div class="panel-body"><h3>{edit ? '编辑友链' : '新增友链'}</h3><form method="post" action="/admin/links" class="main-form"><input type="hidden" name="id" value={edit?.id ?? ''} /><div class="field"><label>名字</label><input class="input" name="name" value={edit?.name ?? ''} required /></div><div class="field"><label>网址</label><input class="input" name="url" type="url" value={edit?.url ?? ''} required /></div><div class="field"><label for="link-icon">图标链接</label><div class="input-inline-action"><input class="input" id="link-icon" name="icon" data-icon-url value={edit?.icon ?? ''} /><label class="input-inline-button" for="icon-upload">上传</label><input id="icon-upload" type="file" accept="image/*" data-icon-upload hidden /></div></div><div class="field"><label>描述</label><textarea class="textarea" name="info">{edit?.info ?? ''}</textarea></div><div class="field"><label>次序（越大越靠前）</label><input class="input" name="order" type="number" value={edit?.order ?? 0} /></div><div><button class="button primary" type="submit">保存</button>{edit ? <a class="button" href="/admin/links">取消</a> : null}</div></form></div></section>
      </div>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/links', async (c) => {
  const form = await c.req.formData()
  const id = intValue(form.get('id'))
  const name = String(form.get('name') ?? '').trim()
  const url = String(form.get('url') ?? '').trim()
  const icon = String(form.get('icon') ?? '').trim()
  const info = String(form.get('info') ?? '').trim()
  const order = intValue(form.get('order'))
  if (!name || !/^https?:\/\//i.test(url)) return c.text('名字和有效网址不能为空', 400)
  if (id) await dbRun(c.env.BLOG_DB, 'UPDATE blog_links SET name = ?, url = ?, icon = ?, info = ?, "order" = ? WHERE id = ?', name, url, icon, info, order, id)
  else await dbRun(c.env.BLOG_DB, 'INSERT INTO blog_links(name, url, icon, info, "order") VALUES(?, ?, ?, ?, ?)', name, url, icon, info, order)
  return c.redirect('/admin/links')
})

adminRoutes.post('/admin/links/:id/delete', async (c) => {
  await dbRun(c.env.BLOG_DB, 'DELETE FROM blog_links WHERE id = ?', intValue(c.req.param('id')))
  return c.redirect('/admin/links')
})

adminRoutes.get('/admin/data/export', async (c) => {
  const tables = ['blog_contents', 'blog_metas', 'blog_relationships', 'blog_options', 'blog_links', 'blog_comments'] as const
  const data: Record<string, unknown[]> = {}
  for (const table of tables) data[table] = await dbAll<Record<string, unknown>>(c.env.BLOG_DB, `SELECT * FROM ${table}`)
  const filename = `worker-blog-${new Date().toISOString().slice(0, 10)}.json`
  return c.body(JSON.stringify({ version: 4, exportedAt: new Date().toISOString(), tables: data }, null, 2), 200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  })
})

adminRoutes.post('/admin/data/import', async (c) => {
  const form = await c.req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return c.text('请选择 JSON 文件', 400)
  if (file.size > 20 * 1024 * 1024) return c.text('导入文件不能超过 20 MB', 413)

  let payload: { version?: number; tables?: Record<string, Array<Record<string, unknown>>> }
  try {
    payload = JSON.parse(await file.text()) as typeof payload
  } catch {
    return c.text('JSON 文件格式不正确', 400)
  }
  if (!payload.tables || typeof payload.tables !== 'object' || Array.isArray(payload.tables)) return c.text('导入文件缺少 tables 数据', 400)

  const specs: Array<{ table: string; columns: string[]; autoIncrement: boolean; keys: string[] }> = [
    { table: 'blog_contents', columns: ['cid', 'parent', 'title', 'slug', 'created', 'modified', 'released', 'text', 'cover', 'type', 'status'], autoIncrement: true, keys: ['cid'] },
    { table: 'blog_metas', columns: ['mid', 'name', 'slug', 'type', 'description', 'count'], autoIncrement: true, keys: ['mid'] },
    { table: 'blog_links', columns: ['id', 'name', 'url', 'icon', 'info', 'order'], autoIncrement: true, keys: ['id'] },
    { table: 'blog_comments', columns: ['id', 'name', 'email', 'site', 'text', 'created', 'cid'], autoIncrement: true, keys: ['id'] },
    { table: 'blog_relationships', columns: ['cid', 'mid'], autoIncrement: false, keys: ['cid', 'mid'] },
    { table: 'blog_options', columns: ['key', 'value'], autoIncrement: false, keys: ['key'] },
  ]

  let imported = 0
  try {
    for (const spec of specs) {
      const rows = payload.tables[spec.table]
      if (!Array.isArray(rows)) continue
      for (const row of rows) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) continue
        const normalizedRow: Record<string, unknown> = { ...row }
        if (spec.table === 'blog_contents' && normalizedRow.type === 'attachment') normalizedRow.type = 'atta'
        if (spec.table === 'blog_contents' && !Object.prototype.hasOwnProperty.call(normalizedRow, 'parent')) {
          let legacyParent = 0
          if (normalizedRow.type === 'atta' && typeof normalizedRow.text === 'string') {
            try {
              const parsedInfo = JSON.parse(normalizedRow.text) as unknown
              if (parsedInfo && typeof parsedInfo === 'object' && !Array.isArray(parsedInfo)) {
                const legacyInfo = parsedInfo as Record<string, unknown>
                legacyParent = Math.max(0, intValue(legacyInfo.parentCid))
                if (Object.prototype.hasOwnProperty.call(legacyInfo, 'parentCid')) {
                  delete legacyInfo.parentCid
                  normalizedRow.text = JSON.stringify(legacyInfo)
                }
              }
            } catch {
              legacyParent = 0
            }
          }
          normalizedRow.parent = legacyParent
        }
        if (spec.table === 'blog_contents' && normalizedRow.type === 'page') normalizedRow.type = 'post'
        const columns = spec.columns.filter((column) => Object.prototype.hasOwnProperty.call(normalizedRow, column))
        if (!spec.keys.every((key) => columns.includes(key))) continue
        const quoted = columns.map((column) => `"${column}"`).join(', ')
        const placeholders = columns.map(() => '?').join(', ')
        const values = columns.map((column) => normalizedRow[column])
        if (spec.autoIncrement) {
          await dbRun(c.env.BLOG_DB, `INSERT INTO ${spec.table}(${quoted}) VALUES(${placeholders})`, ...values)
        } else {
          const conflict = spec.keys.map((key) => `"${key}"`).join(', ')
          const updates = columns.filter((column) => !spec.keys.includes(column)).map((column) => `"${column}" = excluded."${column}"`).join(', ')
          await dbRun(c.env.BLOG_DB, `INSERT INTO ${spec.table}(${quoted}) VALUES(${placeholders}) ON CONFLICT(${conflict}) DO ${updates ? `UPDATE SET ${updates}` : 'NOTHING'}`, ...values)
        }
        imported += 1
      }
    }
    await dbRun(c.env.BLOG_DB, `
      UPDATE blog_metas
      SET count = (SELECT COUNT(*) FROM blog_relationships r WHERE r.mid = blog_metas.mid)
    `)
  } catch (error) {
    console.error(error)
    return c.text('导入失败：自增表会直接 INSERT，请确认目标库中没有相同主键或唯一字段。', 409)
  }
  return c.redirect(`/admin/options?imported=${imported}`)
})

adminRoutes.get('/admin/options', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  return c.html(
    <AdminLayout title="系统设置" subtitle="站点信息、评论、时区与分页配置">
      {c.req.query('saved') ? <div class="notice">设置已保存。</div> : null}{c.req.query('imported') ? <div class="notice">数据已导入，共处理 {c.req.query('imported')} 条记录。</div> : null}
      <section class="panel"><div class="panel-body"><form method="post" action="/admin/options" class="main-form">
        <div class="field"><label>站点标题</label><input class="input" name="site_title" value={options.site_title} /></div>
        <div class="settings-inline">
          <div class="field">
            <label for="favicon_text">FAVICON 文本</label>
            <div class="favicon-text-row">
              <input class="input" id="favicon_text" name="favicon_text" value={options.favicon_text} maxLength={2} data-favicon-text />
              <span class="favicon-preview" style={`--favicon-color:${options.favicon_color}`} data-favicon-preview>{options.favicon_text}</span>
            </div>
            <small class="muted">建议填写 1–2 个字符，例如 W、博。</small>
          </div>
          <div class="field">
            <label for="favicon_color">FAVICON 颜色</label>
            <div class="favicon-setting-row">
              <input class="input favicon-color-text" id="favicon_color" name="favicon_color" value={options.favicon_color} placeholder="#999999" pattern="#[0-9A-Fa-f]{6}" data-favicon-color-text />
              <input class="favicon-color-picker" type="color" value={options.favicon_color} aria-label="选择 FAVICON 颜色" data-favicon-color-picker />
            </div>
            <small class="muted">可输入六位十六进制颜色或使用颜色选择器，默认 #999999。</small>
          </div>
        </div>
        <div class="field"><label>站点描述</label><input class="input" name="site_description" value={options.site_description} /></div>
        <div class="field"><label>文件 CDN 域名</label><input class="input" name="file_cdn_url" value={options.file_cdn_url} placeholder="https://static.example.com" /><small class="muted">留空时通过 /uploads 由 Worker 读取 R2；填写后直接使用该域名或七牛云域名。</small></div>
        <div class="settings-inline settings-four-columns">
          <div class="field"><label>前台文章分页数</label><input class="input" name="posts_per_page" type="number" min="1" max="100" value={options.posts_per_page} /></div>
          <div class="field"><label>前台闪念分页数</label><input class="input" name="memos_per_page" type="number" min="1" max="100" value={options.memos_per_page} /></div>
          <div class="field"><label>前台归档分页数</label><input class="input" name="archives_per_page" type="number" min="1" max="100" value={options.archives_per_page} /></div>
          <div class="field"><label>前台评论分页数</label><input class="input" name="comments_per_page" type="number" min="1" max="100" value={options.comments_per_page} /></div>
        </div>
        <div class="settings-inline settings-four-columns">
          <div class="field"><label>后台文章分页数</label><input class="input" name="admin_contents_per_page" type="number" min="1" max="100" value={options.admin_contents_per_page} /></div>
          <div class="field"><label>后台闪念分页数</label><input class="input" name="admin_memos_per_page" type="number" min="1" max="100" value={options.admin_memos_per_page} /></div>
          <div class="field"><label>后台评论分页数</label><input class="input" name="admin_comments_per_page" type="number" min="1" max="100" value={options.admin_comments_per_page} /></div>
          <div class="field"><label>后台附件分页数</label><input class="input" name="admin_attachments_per_page" type="number" min="1" max="100" value={options.admin_attachments_per_page} /></div>
        </div>
        <div class="field option-check"><label><input type="checkbox" name="comments_enabled" value="true" checked={options.comments_enabled === 'true'} /> 开启评论功能</label><small class="muted">开启后，文章详情以及页面/关于模板内容会显示评论输入框与评论列表。</small></div>
        <div class="field"><label for="about-avatar">头像 URL</label><div class="input-inline-action"><input class="input" id="about-avatar" name="about_avatar" value={options.about_avatar} placeholder="https://example.com/avatar.png 或 /2026/07/avatar.png" data-avatar-url /><label class="input-inline-button" for="avatar-upload">上传</label><input id="avatar-upload" type="file" accept="image/*" data-avatar-upload hidden /></div><small class="muted" data-avatar-status></small></div>
        <div class="field"><label>GitHub</label><input class="input" name="about_github" value={options.about_github} placeholder="https://github.com/username" /></div>
        <div class="field"><label>X</label><input class="input" name="about_x" value={options.about_x} placeholder="https://x.com/username" /></div>
        <div class="field"><label>RSS</label><input class="input" name="about_rss" value={options.about_rss} placeholder="/atom.xml 或完整 URL" /></div>
        <div class="field"><label>邮箱</label><input class="input" name="about_email" value={options.about_email} placeholder="name@example.com" /></div>
        <div class="field"><label for="site_timezone">时区</label><select class="select" id="site_timezone" name="site_timezone">{TIMEZONE_OPTIONS.map(([value, label]) => <option value={value} selected={options.site_timezone === value}>{label}</option>)}</select><small class="muted">默认使用 UTC+08:00 东八区（北京 / 上海）。</small></div>
        <div class="field"><label>页脚信息</label><textarea class="textarea" name="footer_info" rows={3}>{options.footer_info}</textarea><small class="muted">支持 HTML；留空时只显示版权信息。</small></div>
        <button class="button primary" type="submit">保存设置</button>
      </form></div></section>
      <section class="panel"><div class="panel-body"><h3>数据管理</h3><p><a class="button" href="/admin/data/export">导出 JSON</a></p><form method="post" action="/admin/data/import" enctype="multipart/form-data" class="main-form"><div class="field"><label>导入 JSON</label><input class="input" type="file" name="file" accept="application/json,.json" required /></div><button class="button primary" type="submit" data-confirm="导入会写入或更新现有数据，确定继续吗？">导入数据</button><small class="muted">导出和导入不包含 blog_cookies，也不包含 R2 文件本体。自增表保留主键直接 INSERT；非自增表按主键更新或插入。</small></form></div></section>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/options', async (c) => {
  const form = await c.req.formData()
  const keys = ['site_title', 'site_description', 'posts_per_page', 'memos_per_page', 'archives_per_page', 'comments_per_page', 'admin_contents_per_page', 'admin_memos_per_page', 'admin_comments_per_page', 'admin_attachments_per_page', 'file_cdn_url', 'about_avatar', 'about_github', 'about_x', 'about_rss', 'about_email', 'site_timezone', 'footer_info', 'favicon_text', 'favicon_color']
  const values: OptionMap = Object.fromEntries(keys.map((key) => [key, String(form.get(key) ?? '')]))
  values.comments_enabled = form.get('comments_enabled') === 'true' ? 'true' : 'false'
  values.posts_per_page = String(positiveInt(values.posts_per_page, 10, 100))
  values.memos_per_page = String(positiveInt(values.memos_per_page, 20, 100))
  values.archives_per_page = String(positiveInt(values.archives_per_page, 50, 100))
  values.comments_per_page = String(positiveInt(values.comments_per_page, 20, 100))
  values.admin_contents_per_page = String(positiveInt(values.admin_contents_per_page, 25, 100))
  values.admin_memos_per_page = String(positiveInt(values.admin_memos_per_page, 25, 100))
  values.admin_comments_per_page = String(positiveInt(values.admin_comments_per_page, 20, 100))
  values.admin_attachments_per_page = String(positiveInt(values.admin_attachments_per_page, 30, 100))
  const fileCdnInput = values.file_cdn_url.trim()
  values.file_cdn_url = normalizeFileCdnUrl(fileCdnInput)
  if (fileCdnInput && !values.file_cdn_url) return c.text('文件 CDN 域名必须是有效的 http:// 或 https:// 地址，且不能包含查询参数或锚点。', 400)
  values.favicon_text = normalizeFaviconText(values.favicon_text, Array.from(values.site_title.trim())[0] || 'B')
  values.favicon_color = normalizeFaviconColor(values.favicon_color)
  if (!TIMEZONE_VALUES.has(values.site_timezone)) values.site_timezone = 'Asia/Shanghai'
  await saveOptions(c.env.BLOG_DB, values)
  return c.redirect('/admin/options?saved=1')
})
