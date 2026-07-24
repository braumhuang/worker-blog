import type { ContentWithMeta, OptionMap } from "../../../../types";
import { excerptOf, formatDate, publicAttachmentUrl } from "../../../../lib/utils";
import { Icon } from "./icons";

export function Question({ children, variants, name, count, title = false }: { children: any; variants?: string; name?: string; count?: number; title?: boolean }) {
  return <div class="msg msg--user"><div class={`msg__bubble${title ? " msg__bubble--title" : ""}`} data-variants={variants} data-name={name} data-count={count === undefined ? undefined : String(count)}>{children}</div></div>;
}

export function Answer({ options, intro, introVariants, name, count, children }: { options?: OptionMap; intro?: any; introVariants?: string; name?: string; count?: number; children?: any }) {
  const avatar = options?.about_avatar ? publicAttachmentUrl(options.about_avatar, options.file_cdn_url) : "";
  return <div class="msg msg--assistant">
    {intro !== undefined ? <div class="msg__head">{avatar ? <img class="msg__avatar" src={avatar} alt={options?.site_title || ""} /> : null}<p class="msg__intro" data-variants={introVariants} data-name={name} data-count={count === undefined ? undefined : String(count)}>{intro}</p></div> : null}
    <div class="msg__body">{children}</div>
  </div>;
}

export function PostCard({ post, timeZone, fileCdnUrl }: { post: ContentWithMeta; timeZone: string; fileCdnUrl: string }) {
  const href = `/post/${encodeURIComponent(post.slug)}/`;
  const cover = post.cover ? publicAttachmentUrl(post.cover, fileCdnUrl) : "";
  return <article class="post-card"><a class="post-card__link" href={href}>
    <div class="post-card__body"><h3 class="post-card__title">{post.title || "未命名文章"}</h3><p class="post-card__excerpt">{excerptOf(post.text)}</p><div class="post-card__meta"><time datetime={new Date(post.released * 1000).toISOString()}>{formatDate(post.released, false, timeZone)}</time>{post.categories?.[0] ? <><span class="dot">·</span><span>{post.categories[0].name}</span></> : null}</div></div>
    {cover ? <div class="post-card__thumb"><img src={cover} alt={post.title} loading="lazy" /></div> : null}
  </a></article>;
}

export function PostCards({ posts, timeZone, fileCdnUrl }: { posts: ContentWithMeta[]; timeZone: string; fileCdnUrl: string }) {
  return posts.length ? <div class="post-cards">{posts.map((post) => <PostCard post={post} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />)}</div> : <div class="cg-empty">这里还没有内容。</div>;
}

export function Pagination({ page, totalPages, path }: { page: number; totalPages: number; path: string }) {
  if (totalPages <= 1) return null;
  const separator = path.includes("?") ? "&" : "?";
  const href = (target: number) => `${path}${separator}page=${target}`;
  return <nav class="pagination" aria-label="分页导航">
    {page > 1 ? <a class="pagination__btn" href={href(page - 1)} rel="prev">← 上一页</a> : <span class="pagination__btn pagination__btn--disabled">← 上一页</span>}
    <span class="pagination__info">第 {page} / {totalPages} 页</span>
    {page < totalPages ? <a class="pagination__btn" href={href(page + 1)} rel="next">下一页 →</a> : <span class="pagination__btn pagination__btn--disabled">下一页 →</span>}
  </nav>;
}

export function MessageActions() {
  return <div class="msg-actions"><button class="msg-action" id="copy-link" type="button" title="复制链接"><Icon name="copy" /> <span>链接</span></button><button class="msg-action" id="copy-text" type="button" title="复制全文"><Icon name="copy" /> <span>全文</span></button><button class="msg-action" id="go-top" type="button" title="返回顶部"><Icon name="up" /> <span>顶部</span></button></div>;
}
