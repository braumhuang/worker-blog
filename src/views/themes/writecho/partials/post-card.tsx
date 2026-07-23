import type { ContentWithMeta } from "../../../../types";
import {
  excerptOf,
  formatDate,
  publicAttachmentUrl,
  readingMinutes,
} from "../../../../lib/utils";
export function PostCard({
  post,
  timeZone,
  fileCdnUrl,
}: {
  post: ContentWithMeta;
  timeZone: string;
  fileCdnUrl: string;
}) {
  const url = `/post/${encodeURIComponent(post.slug)}/`;
  const cover = post.cover ? publicAttachmentUrl(post.cover, fileCdnUrl) : "";
  return (
    <article class="post-card">
      {cover ? (
        <a class="post-cover" href={url}>
          <img src={cover} alt={post.title} loading="lazy" />
        </a>
      ) : null}
      <div class="post-card-meta">
        <time>{formatDate(post.released, false, timeZone)}</time>
        {post.categories?.length ? (
          <>
            <span class="sep" />
            <span>
              {post.categories.map((cat, i) => (
                <>
                  {i ? " · " : ""}
                  <a href={`/category/${encodeURIComponent(cat.slug)}/`}>
                    {cat.name}
                  </a>
                </>
              ))}
            </span>
          </>
        ) : null}
        <span class="sep" />
        <span>{readingMinutes(post.text)} 分钟阅读</span>
      </div>
      <h2 class="post-card-title">
        <a href={url}>{post.title || "未命名文章"}</a>
      </h2>
      <p class="post-card-excerpt">{excerptOf(post.text, 200)}</p>
      <div class="post-card-footer">
        <div class="post-card-tags">
          {post.tags?.map((tag) => (
            <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}</a>
          ))}
        </div>
        <a class="post-card-more" href={url}>
          阅读全文
        </a>
      </div>
    </article>
  );
}
