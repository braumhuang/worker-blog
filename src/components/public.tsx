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

const Icon = ({ name }: { name: 'sun' | 'moon' | 'search' | 'menu' | 'arrow' }) => {
  if (name === 'sun') return <svg class="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41"/></svg>
  if (name === 'moon') return <svg class="icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>
  if (name === 'search') return <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>
  if (name === 'menu') return <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  return <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m12 5 7 7-7 7M19 12H5"/></svg>
}

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
        <link rel="icon" type="image/svg+xml" href={`/favicon.svg?v=${encodeURIComponent(`${options.favicon_text}-${options.favicon_color}`)}`} />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <link rel="stylesheet" href="/assets/public.css" />
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('blog-theme');if(t)document.documentElement.dataset.theme=t;else if(matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.dataset.theme='dark'}catch(e){}` }} />
      </head>
      <body>
        <header class="header">
          <div class="header-inner">
            <a class="logo" href="/">{siteTitle}</a>
            <nav class="nav" aria-label="主导航">
              {navItems.map(([href, label, key]) => <a href={href} class={`nav-link${active === key ? ' active' : ''}`}>{label}</a>)}
              <a href={`/post/${encodeURIComponent(aboutSlug)}/`} class={`nav-link${active === 'about' ? ' active' : ''}`}>关于</a>
            </nav>
            <div class="header-actions">
              <button class="btn-icon" id="theme-toggle" type="button" data-theme-toggle title="切换主题" aria-label="切换深浅模式"><Icon name="sun"/><Icon name="moon"/></button>
              <button class="btn-icon" type="button" data-search-open title="搜索" aria-label="搜索"><Icon name="search"/></button>
              <button class="btn-icon mobile-menu-toggle" type="button" data-menu-toggle aria-label="打开移动端菜单" aria-controls="mobile-nav" aria-expanded="false"><Icon name="menu"/></button>
            </div>
          </div>
        </header>
        <nav class="mobile-nav" id="mobile-nav" aria-label="移动端导航">
          {navItems.map(([href, label, key]) => <a href={href} class={`mobile-nav-link${active === key ? ' active' : ''}`}>{label}</a>)}
          <a href={`/post/${encodeURIComponent(aboutSlug)}/`} class={`mobile-nav-link${active === 'about' ? ' active' : ''}`}>关于</a>
        </nav>
        <main class="main"><div class="container">{children}</div></main>
        <footer class="footer">
          <div class="container">
            {options.footer_text ? <div class="footer-text">{options.footer_text}</div> : null}
            <div class="footer-copyright">© {new Date().getFullYear()} <a href="/">{siteTitle}</a> · <span class="footer-theme">Theme by <a href="https://github.com/Gridea-Pro/gridea-pro-themes/tree/main/themes/kehua" target="_blank" rel="noopener noreferrer">Kehua</a></span></div>
          </div>
        </footer>
        <button class="back-to-top" type="button" data-back-to-top aria-label="回到顶部"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m18 15-6-6-6 6"/></svg></button>
        <div class="search-modal" data-search-modal role="dialog" aria-modal="true" aria-label="站内搜索">
          <div class="search-modal-content">
            <div class="search-input-wrapper"><Icon name="search"/><input class="search-input" data-search-input type="search" placeholder="搜索标题、摘要、标签…" autocomplete="off"/><button class="search-close" type="button" data-search-close aria-label="关闭搜索">×</button></div>
            <div class="search-results" data-search-results><div class="search-empty">输入关键词开始搜索 · 支持标题 / 摘要 / 标签</div></div>
            <div class="search-shortcuts"><span><kbd>↵</kbd> 打开</span><span><kbd>↑</kbd><kbd>↓</kbd> 切换</span><span><kbd>esc</kbd> 关闭</span></div>
          </div>
        </div>
        <script src="/assets/public.js" defer></script>
      </body>
    </html>
  )
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header class="category-header"><h1 class="category-title">{title}</h1>{subtitle ? <p class="category-desc">{subtitle}</p> : null}</header>
}

export function PostMeta({ created, categories = [], reading, words, timeZone = 'Asia/Shanghai', article = false }: { created: number; categories?: BlogMeta[]; reading?: number; words?: number; timeZone?: string; article?: boolean }) {
  const bits: any[] = [<span>{formatDate(created, false, timeZone)}</span>]
  if (categories.length) bits.push(<span class={article ? 'article-category' : 'post-category'}>{categories.map((category, index) => <>{index ? '、' : ''}<a href={`/category/${encodeURIComponent(category.slug)}/`}>{category.name}</a></>)}</span>)
  if (reading) bits.push(<span>{reading} 分钟阅读</span>)
  if (words) bits.push(<span>{words} 字</span>)
  return <div class={article ? 'article-meta' : 'post-meta'}>{bits.map((bit, index) => <>{index ? <span class={article ? 'article-meta-sep' : 'post-meta-sep'}>·</span> : null}{bit}</>)}</div>
}

export function Pagination({ page, totalPages, path }: { page: number; totalPages: number; path: string }) {
  if (totalPages <= 1) return null
  const separator = path.includes('?') ? '&' : '?'
  const url = (target: number) => `${path}${separator}page=${target}`
  return <nav class="pagination" aria-label="分页">
    {page > 1 ? <a class="pagination-item" href={url(page - 1)}>← 上一页</a> : <span class="pagination-item pagination-disabled">← 上一页</span>}
    <span class="pagination-info">第 {page} / {totalPages} 页</span>
    {page < totalPages ? <a class="pagination-item" href={url(page + 1)}>下一页 →</a> : <span class="pagination-item pagination-disabled">下一页 →</span>}
  </nav>
}

export function MetaPills({ tags }: { tags: BlogMeta[] }) {
  if (!tags.length) return null
  return <div class="article-tags"><span class="tag-label">标签：</span>{tags.map((tag) => <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}</a>)}</div>
}
