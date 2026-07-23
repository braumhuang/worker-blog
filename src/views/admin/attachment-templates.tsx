import type { AttachmentTemplate } from '../../types'
import { AdminLayout } from './base'

const typeLabels = { image: '图片', video: '视频', file: '文件' } as const

export function AttachmentTemplatesPage({ rows, edit, saved }: { rows: AttachmentTemplate[]; edit: AttachmentTemplate | null; saved: boolean }) {
  return <AdminLayout title="附件模板" subtitle="上传或插入附件时，可按文件类型选择模板。">
    {saved ? <div class="notice">附件模板已保存。</div> : null}
    <div class="two-columns template-columns">
      <section class="panel template-list-panel"><table class="admin-table"><thead><tr><th>名称</th><th>类型</th><th>模板</th><th>操作</th></tr></thead><tbody>{rows.length ? rows.map((item) => <tr>
        <td>{item.name}</td><td>{typeLabels[item.type]}</td><td><code class="template-code">{item.template}</code></td><td><div class="row-actions always-visible"><a href={`/admin/attachment-templates?edit=${encodeURIComponent(item.id)}`}>编辑</a><form class="inline-form" method="post" action={`/admin/attachment-templates/${encodeURIComponent(item.id)}/delete`}><button class="button small danger" type="submit" data-confirm={`确定删除模板“${item.name}”吗？`}>删除</button></form></div></td>
      </tr>) : <tr><td colspan={4} class="empty-state">暂无模板；插入附件时会自动使用内置默认值。</td></tr>}</tbody></table></section>
      <section class="panel template-form-panel"><div class="panel-body"><h3>{edit ? '编辑模板' : '新增模板'}</h3><form method="post" action="/admin/attachment-templates" class="main-form">
        <input type="hidden" name="id" value={edit?.id ?? ''} />
        <div class="field"><label>名称</label><input class="input" name="name" value={edit?.name ?? ''} placeholder="例如：带标题图片" maxLength={80} required /></div>
        <div class="field"><label>类型</label><select class="select" name="type"><option value="image" selected={edit?.type === 'image'}>图片</option><option value="video" selected={edit?.type === 'video'}>视频</option><option value="file" selected={!edit || edit.type === 'file'}>文件</option></select></div>
        <div class="field"><label>模板</label><textarea class="textarea template-editor" name="template" rows={8} placeholder="使用 FILE_NAME 和 RELATIVE_PATH 作为占位符" required>{edit?.template ?? ''}</textarea><small class="muted">插入时会把 FILE_NAME 替换为原始文件名，把 RELATIVE_PATH 替换为数据库保存的相对路径。</small></div>
        <div><button class="button primary" type="submit">保存</button>{edit ? <a class="button" href="/admin/attachment-templates">取消</a> : null}</div>
      </form></div></section>
    </div>
  </AdminLayout>
}
