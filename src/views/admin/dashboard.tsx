import type { BlogContent, ContentStatus, ContentType, OptionMap } from '../../types'
import { formatDate, stripMarkdown } from '../../lib/utils'
import { AdminLayout } from './base'

const typeLabels: Record<ContentType, string> = { post: '文章', page: '页面', atta: '附件', memo: '闪念' }

export function DashboardPage({ options, counts, recent, links, comments }: { options: OptionMap; counts: Array<{ type: ContentType; status: ContentStatus; total: number }>; recent: BlogContent[]; links: number; comments: number }) {
  const count = (type: ContentType, status?: ContentStatus) => counts.filter((row) => row.type === type && (!status || row.status === status)).reduce((sum, row) => sum + row.total, 0)
  return <AdminLayout title="面板" subtitle="欢迎回来，下面是站点概况。" actions={<a class="button primary" href="/admin/content/new?type=post">写文章</a>}>
    <section class="stats-grid"><div class="panel stat"><strong>{count('post') + count('page')}</strong><span>文章</span></div><div class="panel stat"><strong>{count('memo')}</strong><span>闪念</span></div><div class="panel stat"><strong>{comments}</strong><span>评论</span></div><div class="panel stat"><strong>{links}</strong><span>友链</span></div></section>
    <div class="dashboard-columns"><section class="panel"><div class="panel-body"><h3>最近编辑</h3><table class="admin-table"><tbody>{recent.map((item) => <tr><td><a href={`/admin/content/${item.cid}`}>{item.title || stripMarkdown(item.text).slice(0, 24) || '未命名'}</a></td><td>{typeLabels[item.type]}</td><td class="muted">{formatDate(item.modified, true, options.site_timezone)}</td></tr>)}</tbody></table></div></section>
    <section class="panel"><div class="panel-body"><h3>快捷入口</h3><p><a href="/admin/content/new?type=post">撰写文章</a></p><p><a href="/admin/content/new?type=memo">发布闪念</a></p><p><a href="/admin/comments">管理评论</a></p><p><a href="/admin/attachments">上传附件</a></p><p><a href="/admin/attachment-templates">附件模板</a></p><p><a href="/admin/options">站点设置</a></p></div></section></div>
  </AdminLayout>
}
