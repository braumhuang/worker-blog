import type { PropsWithChildren } from 'hono/jsx'
import type { BlogMeta, OptionMap } from '../types'
import { formatDate } from '../lib/utils'

const navItems = [
  ['/', '首页', 'home'],
  ['/memos/', '闪念', 'memos'],
  ['/archives/', '归档', 'archives'],
  ['/tags/', '标签', 'tags'],
  ['/links/', '导航', 'links'],
] as const

type PublicLayoutProps = PropsWithChildren<{
  options: OptionMap
  title?: string
  active?: string
  canonical?: string
  description?: string
}>

export function PublicLayout({ options, title, active, canonical, description, children }: PublicLayoutProps) {
  const siteTitle = options.site_title
  const fullTitle = title ? `${title} · ${siteTitle}` : siteTitle
  const aboutSlug = options.about_slug || 'about'
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content={description || options.site_description} />
        <meta name="color-scheme" content="light dark" />
        <title>{fullTitle}</title>
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <link rel="stylesheet" href="/assets/public.css" />
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('blog-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body>
        <header class="site-header">
          <div class="header-inner">
            <a class="brand" href="/">{siteTitle}</a>
            <nav class="site-nav" aria-label="主导航">
              {navItems.map(([href, label, key]) => (
                <a href={href} class={active === key ? 'active' : undefined}>{label}</a>
              ))}
              <a href={`/post/${encodeURIComponent(aboutSlug)}/`} class={active === 'about' ? 'active' : undefined}>关于</a>
            </nav>
            <div class="header-actions">
              <button class="icon-button" type="button" data-theme-toggle title="切换主题" aria-label="切换深浅模式">
                <svg class="header-icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <svg class="header-icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </button>
              <button class="icon-button" type="button" data-search-open title="搜索" aria-label="搜索">
                <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
              <button class="icon-button menu-button" type="button" data-menu-toggle aria-label="打开移动端菜单" aria-controls="mobile-nav" aria-expanded="false">
                <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
            </div>
          </div>
        </header>
        <nav class="mobile-nav" id="mobile-nav" aria-label="移动端导航">
          {navItems.map(([href, label, key]) => (
            <a href={href} class={active === key ? 'active' : undefined}>{label}</a>
          ))}
          <a href={`/post/${encodeURIComponent(aboutSlug)}/`} class={active === 'about' ? 'active' : undefined}>关于</a>
        </nav>
        <main class="site-main">{children}</main>
        <footer class="site-footer">
          <div class="footer-inner">
            <span>{options.footer_text}</span>
            <span>© {new Date().getFullYear()} {siteTitle} · Powered by Hono</span>
          </div>
        </footer>
        <div class="search-modal" data-search-modal role="dialog" aria-modal="true" aria-label="站内搜索">
          <div class="search-box">
            <div class="search-input-row">
              <input data-search-input type="search" placeholder="输入关键词开始搜索" autocomplete="off" />
              <button type="button" data-search-close>关闭</button>
            </div>
            <div class="search-results" data-search-results>输入关键词开始搜索 · 支持标题、正文、标签</div>
          </div>
        </div>
        <script src="/assets/public.js" defer></script>
      </body>
    </html>
  )
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header class="page-heading"><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</header>
}

export function PostMeta({ created, categories = [], reading, timeZone = 'Asia/Shanghai' }: { created: number; categories?: BlogMeta[]; reading?: number; timeZone?: string }) {
  return (
    <div class="post-meta">
      <span>{formatDate(created, false, timeZone)}</span>
      {categories.length ? <span>{categories.map((category, index) => <>{index ? '、' : ''}<a href={`/category/${encodeURIComponent(category.slug)}/`}>{category.name}</a></>)}</span> : null}
      {reading ? <span>{reading} 分钟阅读</span> : null}
    </div>
  )
}

export function Pagination({ page, totalPages, path }: { page: number; totalPages: number; path: string }) {
  if (totalPages <= 1) return null
  const separator = path.includes('?') ? '&' : '?'
  const url = (target: number) => `${path}${separator}page=${target}`
  return (
    <nav class="pagination" aria-label="分页">
      {page > 1 ? <a href={url(page - 1)}>← 上一页</a> : <span>← 上一页</span>}
      <span>{page} / {totalPages}</span>
      {page < totalPages ? <a href={url(page + 1)}>下一页 →</a> : <span>下一页 →</span>}
    </nav>
  )
}

export function MetaPills({ tags }: { tags: BlogMeta[] }) {
  if (!tags.length) return null
  return <div class="article-tags">{tags.map((tag) => <a class="tag-pill" href={`/tag/${encodeURIComponent(tag.slug)}/`}>#{tag.name}</a>)}</div>
}
