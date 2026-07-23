import type { PropsWithChildren } from 'hono/jsx'
import type { BlogMeta, OptionMap } from '../../types'
import { formatDate } from '../../lib/utils'
import { Header } from './header'
import { Footer } from './footer'

type BaseProps = PropsWithChildren<{
  options: OptionMap
  title?: string
  active?: string
  canonical?: string
  description?: string
  categories?: BlogMeta[]
}>

export function Base({ options, title, active, canonical, description, categories = [], children }: BaseProps) {
  const fullTitle = title ? `${title} · ${options.site_title}` : options.site_title
  return <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="description" content={description || options.site_description} />
      <meta name="color-scheme" content="light dark" />
      <title>{fullTitle}</title>
      <link rel="icon" type="image/svg+xml" href={`/favicon.svg?v=${encodeURIComponent(`${options.favicon_text}-${options.favicon_color}`)}`} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <link rel="alternate" type="application/atom+xml" title={`${options.site_title} Atom Feed`} href="/atom.xml" />
      <link rel="stylesheet" href="/public.css" />
      <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('blog-theme');if(t)document.documentElement.dataset.theme=t;else if(matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.dataset.theme='dark'}catch(e){}` }} />
    </head>
    <body>
      <Header options={options} active={active} categories={categories}/>
      <main class="main"><div class="container">{children}</div></main>
      <Footer options={options}/>
      <button class="back-to-top" type="button" data-back-to-top aria-label="回到顶部"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m18 15-6-6-6 6"/></svg></button>
      <script src="/public.js" defer></script>
    </body>
  </html>
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
