import type { ContentWithMeta } from '../../types'
import { excerptOf, publicAttachmentUrl, readingMinutes } from '../../lib/utils'
import { Pagination, PostMeta } from './base'

export function Posts({ posts, timeZone, fileCdnUrl }: { posts: ContentWithMeta[]; timeZone: string; fileCdnUrl: string }) {
  if (!posts.length) return <div class="no-results">暂无内容</div>
  return <section class="post-list">{posts.map((post) => {
    const thumb = post.cover ? publicAttachmentUrl(post.cover, fileCdnUrl) : ''
    const url = `/post/${encodeURIComponent(post.slug)}/`
    return <article class={`post${thumb ? ' post-with-thumb' : ''}`}>
      <div class="post-content">
        <h2 class="post-title"><a href={url}>{post.title || '未命名文章'}</a></h2>
        <p class="post-excerpt">{excerptOf(post.text)}</p>
        <PostMeta created={post.released} categories={post.categories} reading={readingMinutes(post.text)} timeZone={timeZone}/>
      </div>
      {thumb ? <a class="post-thumb" href={url} aria-label={post.title}><img src={thumb} alt="" loading="lazy"/></a> : null}
    </article>
  })}</section>
}

export function PostsPage({ posts, timeZone, fileCdnUrl, page, totalPages, path = '/' }: { posts: ContentWithMeta[]; timeZone: string; fileCdnUrl: string; page: number; totalPages: number; path?: string }) {
  return <><Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl}/><Pagination page={page} totalPages={totalPages} path={path}/></>
}
