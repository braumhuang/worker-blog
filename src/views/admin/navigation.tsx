import type { NavigationItem } from '../../types'
import { AdminLayout } from './base'
import { NavigationRows } from './shared'

export function NavigationPage({ fixed, custom, saved }: { fixed: NavigationItem[]; custom: NavigationItem[]; saved: boolean }) {
  return <AdminLayout title="导航管理" subtitle="自带菜单与新增菜单分别按次序升序排列；次序相同时按菜单名排列。" actions={<button class="button primary" type="button" data-navigation-add>新增菜单</button>}>
    {saved ? <div class="notice">导航菜单已保存。</div> : null}
    <form method="post" action="/admin/navigation" class="main-form navigation-form" data-navigation-form>
      <section class="panel navigation-section"><div class="panel-body"><div class="navigation-list-head"><span>自带菜单</span><small class="muted">不能删除；可以修改菜单名、显示状态和次序。次序越小越靠前。</small></div><NavigationRows items={fixed} section="fixed" /></div></section>
      <section class="panel navigation-section"><div class="panel-body"><div class="navigation-list-head"><span>新增菜单</span><small class="muted">所有行都可以修改菜单名、页面 URL、模板、显示状态和次序。</small></div><NavigationRows items={custom} section="custom" /></div></section>
      <div><button class="button primary" type="submit">保存导航</button></div>
    </form>
  </AdminLayout>
}
