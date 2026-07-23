import type { BlogMeta, MetaType } from '../../types'
import { AdminLayout } from './base'

export function MetasPage({ type, rows, edit }: { type: MetaType; rows: BlogMeta[]; edit: BlogMeta | null }) {
  const label = type === 'category' ? '分类' : '标签'
  return <AdminLayout title={`${label}管理`} subtitle={`${rows.length} 个${label}`}>
    <div class="two-columns meta-columns">
      <section class="panel meta-list-panel"><table class="admin-table"><thead><tr><th>名称</th><th>别名</th><th>文章数</th></tr></thead><tbody>{rows.map((meta) => <tr><td>{meta.name}<div class="row-actions"><a href={`/admin/metas?type=${type}&edit=${meta.mid}`}>编辑</a><form class="inline-form" method="post" action={`/admin/metas/${meta.mid}/delete`}><button class="button small danger" type="submit" data-confirm={`确定删除${label}“${meta.name}”吗？`}>删除</button></form></div></td><td>{meta.slug}</td><td>{meta.count}</td></tr>)}</tbody></table></section>
      <section class="panel meta-form-panel"><div class="panel-body"><h3>{edit ? `编辑${label}` : `新增${label}`}</h3><form method="post" action="/admin/metas" class="main-form"><input type="hidden" name="type" value={type} /><input type="hidden" name="mid" value={edit?.mid ?? ''} /><div class="field"><label>名称</label><input class="input" name="name" value={edit?.name ?? ''} required /></div><div class="field"><label>别名</label><input class="input" name="slug" value={edit?.slug ?? ''} placeholder="留空自动生成" /></div><div class="field"><label>描述</label><textarea class="textarea" name="description">{edit?.description ?? ''}</textarea></div><button class="button primary" type="submit">保存</button>{edit ? <a class="button" href={`/admin/metas?type=${type}`}>取消</a> : null}</form></div></section>
    </div>
  </AdminLayout>
}
