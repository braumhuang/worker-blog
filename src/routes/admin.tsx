import { Hono } from 'hono'
import type { Context } from 'hono'
import type { AppEnv, AttachmentInfo, BlogContent, BlogLink, BlogMeta, ContentStatus, ContentType, MetaType, OptionMap } from '../types'
import { AdminLayout, AdminPagination, LoginPage } from '../components/admin'
import { createAdminSession, destroyAdminSession, requireAdmin, sameOriginOnly, verifyCredentials } from '../lib/auth'
import { dbAll, dbFirst, dbRun } from '../lib/db'
import { renderMarkdown } from '../lib/markdown'
import { getOptions, saveOptions } from '../lib/options'
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
  publicAttachmentUrl,
  safeReturnTo,
  slugify,
  stripMarkdown,
} from '../lib/utils'

export const adminRoutes = new Hono<AppEnv>()

const typeLabels: Record<ContentType, string> = {
  post: '文章', page: '页面', attachment: '附件', memo: '闪念',
}
const statusLabels: Record<ContentStatus, string> = {
  publish: '已发布', draft: '草稿', hidden: '隐藏',
}

function validContentType(value: string | undefined, fallback: ContentType = 'post'): ContentType {
  return ['post', 'page', 'attachment', 'memo'].includes(value ?? '') ? value as ContentType : fallback
}

function validMetaType(value: string | undefined): MetaType {
  return value === 'category' ? 'category' : 'tag'
}

async function uniqueContentSlug(db: D1Database, type: ContentType, requested: string, cid: number): Promise<string> {
  const base = slugify(requested)
  let candidate = base
  let index = 2
  const sql = type === 'post' || type === 'page'
    ? "SELECT cid FROM blog_contents WHERE type IN ('post','page') AND slug = ? AND cid != ? LIMIT 1"
    : 'SELECT cid FROM blog_contents WHERE type = ? AND slug = ? AND cid != ? LIMIT 1'
  const conflict = () => type === 'post' || type === 'page'
    ? dbFirst<{ cid: number }>(db, sql, candidate, cid)
    : dbFirst<{ cid: number }>(db, sql, type, candidate, cid)
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

async function contentAttachments(db: D1Database, parentCid: number): Promise<Array<{ content: BlogContent; info: AttachmentInfo }>> {
  const rows = await dbAll<BlogContent>(db, "SELECT * FROM blog_contents WHERE type = 'attachment' ORDER BY created DESC")
  return rows.flatMap((content) => {
    const info = attachmentInfo(content)
    return info?.parentCid === parentCid ? [{ content, info }] : []
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

function AttachmentRows({ rows }: { rows: Array<{ content: BlogContent; info: AttachmentInfo }> }) {
  return <div class="attachment-list" data-attachment-list>{rows.map(({ content, info }) => {
    const kind = fileKind(info.mime)
    return <div class="attachment-item">
      <div class="attachment-thumb">{kind === 'image' ? <img src={info.url} alt="" loading="lazy" /> : kind === 'video' ? 'VIDEO' : 'FILE'}</div>
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
  const counts = await dbAll<{ type: ContentType; status: ContentStatus; total: number }>(c.env.BLOG_DB, `
    SELECT type, status, COUNT(*) AS total FROM blog_contents
    WHERE type != 'attachment' GROUP BY type, status
  `)
  const count = (type: ContentType, status?: ContentStatus) => counts.filter((row) => row.type === type && (!status || row.status === status)).reduce((sum, row) => sum + row.total, 0)
  const recent = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type IN ('post','page','memo') ORDER BY modified DESC LIMIT 8")
  const links = await dbFirst<{ total: number }>(c.env.BLOG_DB, 'SELECT COUNT(*) AS total FROM blog_links')
  return c.html(
    <AdminLayout title="面板" subtitle="欢迎回来，下面是站点概况。" actions={<a class="button primary" href="/admin/content/new?type=post">写文章</a>}>
      <section class="stats-grid">
        <div class="panel stat"><strong>{count('post')}</strong><span>文章</span></div>
        <div class="panel stat"><strong>{count('page')}</strong><span>页面</span></div>
        <div class="panel stat"><strong>{count('memo')}</strong><span>闪念</span></div>
        <div class="panel stat"><strong>{links?.total ?? 0}</strong><span>友链</span></div>
      </section>
      <div class="dashboard-columns">
        <section class="panel"><div class="panel-body"><h3>最近编辑</h3><table class="admin-table"><tbody>{recent.map((item) => <tr><td><a href={`/admin/content/${item.cid}`}>{item.title || stripMarkdown(item.text).slice(0, 24) || '未命名'}</a></td><td>{typeLabels[item.type]}</td><td class="muted">{formatDate(item.modified, true)}</td></tr>)}</tbody></table></div></section>
        <section class="panel"><div class="panel-body"><h3>快捷入口</h3><p><a href="/admin/content/new?type=post">撰写文章</a></p><p><a href="/admin/content/new?type=memo">发布闪念</a></p><p><a href="/admin/attachments">上传附件</a></p><p><a href="/admin/options">站点设置</a></p></div></section>
      </div>
    </AdminLayout>,
  )
})

adminRoutes.get('/admin/contents', async (c) => {
  const type = validContentType(c.req.query('type'))
  const status = c.req.query('status') as ContentStatus | undefined
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = 25
  const statusFilter = ['publish', 'draft', 'hidden'].includes(status ?? '') ? status : undefined
  const where = statusFilter ? 'WHERE type = ? AND status = ?' : 'WHERE type = ?'
  const args = statusFilter ? [type, statusFilter] : [type]
  const countRow = await dbFirst<{ total: number }>(c.env.BLOG_DB, `SELECT COUNT(*) AS total FROM blog_contents ${where}`, ...args)
  const total = countRow?.total ?? 0
  const rows = await dbAll<BlogContent>(c.env.BLOG_DB, `SELECT * FROM blog_contents ${where} ORDER BY modified DESC LIMIT ? OFFSET ?`, ...args, perPage, (page - 1) * perPage)
  const basePath = `/admin/contents?type=${type}${statusFilter ? `&status=${statusFilter}` : ''}`
  return c.html(
    <AdminLayout title={`${typeLabels[type]}管理`} subtitle={`共 ${total} 条`} actions={<a class="button primary" href={`/admin/content/new?type=${type}`}>新增{typeLabels[type]}</a>}>
      <div class="toolbar-line filter-tabs">
        <a class={!statusFilter ? 'active' : undefined} href={`/admin/contents?type=${type}`}>全部</a>
        <a class={statusFilter === 'publish' ? 'active' : undefined} href={`/admin/contents?type=${type}&status=publish`}>已发布</a>
        <a class={statusFilter === 'draft' ? 'active' : undefined} href={`/admin/contents?type=${type}&status=draft`}>草稿</a>
        <a class={statusFilter === 'hidden' ? 'active' : undefined} href={`/admin/contents?type=${type}&status=hidden`}>隐藏</a>
      </div>
      <section class="panel"><table class="admin-table"><thead><tr><th>标题</th><th>状态</th><th>创建时间</th><th>修改时间</th></tr></thead><tbody>
        {rows.length ? rows.map((item) => <tr>
          <td class="title-cell"><strong><a href={`/admin/content/${item.cid}`}>{item.title || stripMarkdown(item.text).slice(0, 32) || '未命名'}</a></strong><div class="row-actions"><a href={`/admin/content/${item.cid}`}>编辑</a>{item.status === 'publish' && item.type !== 'memo' ? <a href={`/post/${encodeURIComponent(item.slug)}/`} target="_blank">查看</a> : null}<form class="inline-form" method="post" action={`/admin/content/${item.cid}/delete`}><button class="button small danger" type="submit" data-confirm="确定删除这条内容吗？">删除</button></form></div></td>
          <td><span class={`status ${item.status}`}>{statusLabels[item.status]}</span></td><td>{formatDate(item.created)}</td><td>{formatDate(item.modified, true)}</td>
        </tr>) : <tr><td colspan={4} class="empty-state">暂无内容</td></tr>}
      </tbody></table></section>
      <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / perPage))} path={basePath} />
    </AdminLayout>,
  )
})

adminRoutes.get('/admin/content/new', async (c) => {
  const type = validContentType(c.req.query('type'))
  if (type === 'attachment') return c.redirect('/admin/attachments')
  const now = nowSeconds()
  const result = await dbRun(c.env.BLOG_DB, `INSERT INTO blog_contents(title, slug, created, modified, text, type, status) VALUES('', ?, ?, ?, '', ?, 'draft')`, draftSlug(type), now, now, type)
  return c.redirect(`/admin/content/${Number(result.meta.last_row_id)}`)
})

adminRoutes.get('/admin/content/:cid', async (c) => {
  const cid = intValue(c.req.param('cid'))
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, 'SELECT * FROM blog_contents WHERE cid = ? LIMIT 1', cid)
  if (!content || content.type === 'attachment') return c.notFound()
  const categories = await dbAll<BlogMeta>(c.env.BLOG_DB, "SELECT * FROM blog_metas WHERE type = 'category' ORDER BY name COLLATE NOCASE")
  const assigned = await dbAll<BlogMeta>(c.env.BLOG_DB, 'SELECT m.* FROM blog_metas m JOIN blog_relationships r ON r.mid = m.mid WHERE r.cid = ? ORDER BY m.name COLLATE NOCASE', cid)
  const assignedCategoryIds = new Set(assigned.filter((meta) => meta.type === 'category').map((meta) => meta.mid))
  const assignedTags = assigned.filter((meta) => meta.type === 'tag')
  const attachments = await contentAttachments(c.env.BLOG_DB, cid)
  return c.html(
    <AdminLayout title={`编辑${typeLabels[content.type]}`} subtitle={`CID ${content.cid}`} actions={<a class="button" href={`/admin/contents?type=${content.type}`}>返回列表</a>}>
      {c.req.query('saved') ? <div class="notice">保存成功。</div> : null}
      <form method="post" action={`/admin/content/${cid}`} class="form-grid">
        <div class="main-form">
          <div class="field"><label for="title">标题</label><input class="input" id="title" name="title" value={content.title} placeholder={content.type === 'memo' ? '可选，留空自动生成' : '请输入标题'} /></div>
          <div class="field"><label for="slug">URL 别名</label><input class="input" id="slug" name="slug" value={content.slug.includes('-draft-') ? '' : content.slug} placeholder="留空根据标题生成" /></div>
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
            <div class="field"><label for="created">发布时间</label><input class="input" id="created" name="created" type="datetime-local" value={datetimeLocal(content.created)} /></div>
            <button class="button primary" type="submit">保存</button>
          </div></section>
          <section class="side-box"><h3>分类</h3><div class="side-box-body checkbox-list">{categories.length ? categories.map((category) => <label><input type="checkbox" name="categories" value={category.mid} checked={assignedCategoryIds.has(category.mid)} /> {category.name}</label>) : <span class="muted">请先创建分类</span>}</div></section>
          <section class="side-box"><h3>标签</h3><div class="side-box-body"><div class="tags-input" data-tags>{assignedTags.map((tag) => <span class="tag-chip"><span>{tag.name}</span><button type="button">×</button></span>)}<input type="text" placeholder="输入后回车" /><input type="hidden" name="tags" data-tags-hidden /></div></div></section>
          <section class="side-box"><h3>附件</h3><div class="side-box-body"><label class="button" for="content-upload">上传到 R2</label><input id="content-upload" data-upload-input data-cid={cid} type="file" multiple hidden /><div class="progress" data-upload-status></div><hr /><AttachmentRows rows={attachments} /></div></section>
        </aside>
      </form>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/content/:cid', async (c) => {
  const cid = intValue(c.req.param('cid'))
  const current = await dbFirst<BlogContent>(c.env.BLOG_DB, 'SELECT * FROM blog_contents WHERE cid = ? LIMIT 1', cid)
  if (!current || current.type === 'attachment') return c.notFound()
  const form = await c.req.formData()
  const text = String(form.get('text') ?? '')
  let title = String(form.get('title') ?? '').trim()
  if (!title && current.type === 'memo') title = stripMarkdown(text).slice(0, 40) || '闪念'
  if (!title) title = '未命名'
  const requestedSlug = String(form.get('slug') ?? '').trim() || title
  const slug = await uniqueContentSlug(c.env.BLOG_DB, current.type, requestedSlug, cid)
  const created = parseDatetimeLocal(String(form.get('created') ?? ''), current.created)
  const requestedStatus = String(form.get('status') ?? 'draft') === 'publish' ? 'publish' : 'draft'
  const status: ContentStatus = form.get('hidden') === '1' ? 'hidden' : requestedStatus
  const categoryIds = [...new Set(form.getAll('categories').map((value) => intValue(value)).filter(Boolean))]
  const tagNames = [...new Set(String(form.get('tags') ?? '').split(/[,，]/).map((name) => name.trim()).filter(Boolean))]
  const tagIds: number[] = []
  for (const name of tagNames) tagIds.push(await findOrCreateTag(c.env.BLOG_DB, name))
  const relationIds = [...new Set([...categoryIds, ...tagIds])]
  const statements = [
    c.env.BLOG_DB.prepare('UPDATE blog_contents SET title = ?, slug = ?, created = ?, modified = ?, text = ?, status = ? WHERE cid = ?').bind(title, slug, created, nowSeconds(), text, status, cid),
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
  if (content.type === 'attachment') {
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
  return c.redirect(`/admin/contents?type=${content.type === 'attachment' ? 'post' : content.type}`)
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
  const page = positiveInt(c.req.query('page'), 1, 100000)
  const perPage = 30
  const count = await dbFirst<{ total: number }>(c.env.BLOG_DB, "SELECT COUNT(*) AS total FROM blog_contents WHERE type = 'attachment'")
  const total = count?.total ?? 0
  const contents = await dbAll<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE type = 'attachment' ORDER BY created DESC LIMIT ? OFFSET ?", perPage, (page - 1) * perPage)
  const rows = contents.flatMap((content) => {
    const info = attachmentInfo(content)
    return info ? [{ content, info }] : []
  })
  return c.html(
    <AdminLayout title="附件管理" subtitle={`共 ${total} 个附件`} actions={<><label class="button primary" for="global-upload">上传附件</label><input id="global-upload" data-upload-input type="file" multiple hidden /></>}>
      <div class="progress" data-upload-status></div>
      <section class="panel"><div class="panel-body"><AttachmentRows rows={rows} /></div></section>
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
  const parentCid = intValue(form.get('cid')) || null
  if (parentCid) {
    const parent = await dbFirst<{ cid: number }>(c.env.BLOG_DB, "SELECT cid FROM blog_contents WHERE cid = ? AND type != 'attachment'", parentCid)
    if (!parent) return c.json({ error: '关联内容不存在' }, 404)
  }
  const extMatch = value.name.match(/(\.[a-zA-Z0-9]{1,10})$/)
  const ext = extMatch?.[1]?.toLowerCase() ?? ''
  const date = new Date()
  const key = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}${ext}`
  const mime = value.type || 'application/octet-stream'
  await c.env.BLOG_R2.put(key, value.stream(), { httpMetadata: { contentType: mime, cacheControl: 'public, max-age=31536000, immutable' } })
  const origin = new URL(c.req.url).origin
  const info: AttachmentInfo = {
    key,
    url: publicAttachmentUrl(origin, key, c.env.R2_PUBLIC_URL),
    mime,
    size: value.size,
    parentCid,
    originalName: value.name,
  }
  const now = nowSeconds()
  const result = await dbRun(c.env.BLOG_DB, `
    INSERT INTO blog_contents(title, slug, created, modified, text, type, status)
    VALUES(?, ?, ?, ?, ?, 'attachment', 'publish')
  `, value.name, key, now, now, JSON.stringify(info))
  const cid = Number(result.meta.last_row_id)
  return c.json({ attachment: { cid, ...info }, insertion: insertionForAttachment(info) })
})

adminRoutes.delete('/admin/api/attachments/:cid', async (c) => {
  const cid = intValue(c.req.param('cid'))
  const content = await dbFirst<BlogContent>(c.env.BLOG_DB, "SELECT * FROM blog_contents WHERE cid = ? AND type = 'attachment' LIMIT 1", cid)
  if (!content) return c.json({ error: '附件不存在' }, 404)
  const info = attachmentInfo(content)
  if (info) await c.env.BLOG_R2.delete(info.key)
  await dbRun(c.env.BLOG_DB, 'DELETE FROM blog_contents WHERE cid = ?', cid)
  return c.json({ ok: true })
})

adminRoutes.post('/admin/api/preview', async (c) => {
  const body: { text?: string } = await c.req.json<{ text?: string }>().catch(() => ({}))
  return c.json({ html: renderMarkdown(body.text ?? '') })
})

adminRoutes.get('/admin/links', async (c) => {
  const editId = intValue(c.req.query('edit'))
  const edit = editId ? await dbFirst<BlogLink>(c.env.BLOG_DB, 'SELECT id, name, url, icon, info, "order" AS "order" FROM blog_links WHERE id = ?', editId) : null
  const rows = await dbAll<BlogLink>(c.env.BLOG_DB, 'SELECT id, name, url, icon, info, "order" AS "order" FROM blog_links ORDER BY "order" DESC, id DESC')
  return c.html(
    <AdminLayout title="友链管理" subtitle={`${rows.length} 条友链`}>
      <div class="two-columns">
        <section class="panel"><div class="panel-body"><h3>{edit ? '编辑友链' : '新增友链'}</h3><form method="post" action="/admin/links" class="main-form"><input type="hidden" name="id" value={edit?.id ?? ''} /><div class="field"><label>名字</label><input class="input" name="name" value={edit?.name ?? ''} required /></div><div class="field"><label>网址</label><input class="input" name="url" type="url" value={edit?.url ?? ''} required /></div><div class="field"><label>图标链接</label><input class="input" name="icon" data-icon-url value={edit?.icon ?? ''} /><label class="button small" for="icon-upload">上传图标到 R2</label><input id="icon-upload" type="file" accept="image/*" data-icon-upload hidden /></div><div class="field"><label>描述</label><textarea class="textarea" name="info">{edit?.info ?? ''}</textarea></div><div class="field"><label>次序（越大越靠前）</label><input class="input" name="order" type="number" value={edit?.order ?? 0} /></div><button class="button primary" type="submit">保存</button>{edit ? <a class="button" href="/admin/links">取消</a> : null}</form></div></section>
        <section class="panel"><table class="admin-table"><thead><tr><th>名字</th><th>网址</th><th>次序</th></tr></thead><tbody>{rows.map((link) => <tr><td>{link.name}<div class="row-actions"><a href={`/admin/links?edit=${link.id}`}>编辑</a><form class="inline-form" method="post" action={`/admin/links/${link.id}/delete`}><button class="button small danger" type="submit" data-confirm={`确定删除“${link.name}”吗？`}>删除</button></form></div></td><td><a href={link.url} target="_blank">{link.url}</a></td><td>{link.order}</td></tr>)}</tbody></table></section>
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

adminRoutes.get('/admin/options', async (c) => {
  const options = await getOptions(c.env.BLOG_DB)
  return c.html(
    <AdminLayout title="系统设置" subtitle="站点信息与分页配置">
      {c.req.query('saved') ? <div class="notice">设置已保存。</div> : null}
      <section class="panel"><div class="panel-body"><form method="post" action="/admin/options" class="main-form">
        <div class="field"><label>站点标题</label><input class="input" name="site_title" value={options.site_title} /></div>
        <div class="field"><label>站点描述</label><input class="input" name="site_description" value={options.site_description} /></div>
        <div class="field"><label>首页每页文章数</label><input class="input" name="posts_per_page" type="number" min="1" max="100" value={options.posts_per_page} /></div>
        <div class="field"><label>闪念每页数量</label><input class="input" name="memos_per_page" type="number" min="1" max="100" value={options.memos_per_page} /></div>
        <div class="field"><label>关于页面别名</label><input class="input" name="about_slug" value={options.about_slug} /></div>
        <div class="field"><label>时区</label><input class="input" name="site_timezone" value={options.site_timezone} placeholder="Asia/Shanghai" /></div>
        <div class="field"><label>页脚文字</label><input class="input" name="footer_text" value={options.footer_text} /></div>
        <button class="button primary" type="submit">保存设置</button>
      </form></div></section>
    </AdminLayout>,
  )
})

adminRoutes.post('/admin/options', async (c) => {
  const form = await c.req.formData()
  const keys = ['site_title', 'site_description', 'posts_per_page', 'memos_per_page', 'about_slug', 'site_timezone', 'footer_text']
  const values: OptionMap = Object.fromEntries(keys.map((key) => [key, String(form.get(key) ?? '')]))
  values.posts_per_page = String(positiveInt(values.posts_per_page, 10, 100))
  values.memos_per_page = String(positiveInt(values.memos_per_page, 20, 100))
  values.about_slug = slugify(values.about_slug || 'about')
  try { new Intl.DateTimeFormat('zh-CN', { timeZone: values.site_timezone }).format() } catch { values.site_timezone = 'Asia/Shanghai' }
  await saveOptions(c.env.BLOG_DB, values)
  return c.redirect('/admin/options?saved=1')
})
