import type { BlogMeta, ContentWithMeta } from "../../../../types";
import {
  excerptOf,
  formatDate,
  publicAttachmentUrl,
  readingMinutes,
} from "../../../../lib/utils";

export function PostMeta({
  created,
  categories = [],
  reading,
  words,
  timeZone = "Asia/Shanghai",
  article = false,
}: {
  created: number;
  categories?: BlogMeta[];
  reading?: number;
  words?: number;
  timeZone?: string;
  article?: boolean;
}) {
  const bits: any[] = [<span>{formatDate(created, false, timeZone)}</span>];
  if (categories.length)
    bits.push(
      <span class={article ? "article-category" : "post-category"}>
        {categories.map((category, index) => (
          <>
            {index ? "、" : ""}
            <a href={`/category/${encodeURIComponent(category.slug)}/`}>
              {category.name}
            </a>
          </>
        ))}
      </span>,
    );
  if (reading) bits.push(<span>{reading} 分钟阅读</span>);
  if (words) bits.push(<span>{words} 字</span>);
  return (
    <div class={article ? "article-meta" : "post-meta"}>
      {bits.map((bit, index) => (
        <>
          {index ? (
            <span class={article ? "article-meta-sep" : "post-meta-sep"}>
              ·
            </span>
          ) : null}
          {bit}
        </>
      ))}
    </div>
  );
}

export function MetaPills({ tags }: { tags: BlogMeta[] }) {
  if (!tags.length) return null;
  return (
    <div class="article-tags">
      <span class="tag-label">标签：</span>
      {tags.map((tag) => (
        <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}</a>
      ))}
    </div>
  );
}

export function PostCard({
  post,
  timeZone,
  fileCdnUrl,
}: {
  post: ContentWithMeta;
  timeZone: string;
  fileCdnUrl: string;
}) {
  const thumb = post.cover ? publicAttachmentUrl(post.cover, fileCdnUrl) : "";
  const url = `/post/${encodeURIComponent(post.slug)}/`;
  return (
    <article class={`post${thumb ? " post-with-thumb" : ""}`}>
      <div class="post-content">
        <h2 class="post-title">
          <a href={url}>{post.title || "未命名文章"}</a>
        </h2>
        <p class="post-excerpt">{excerptOf(post.text)}</p>
        <PostMeta
          created={post.released}
          categories={post.categories}
          reading={readingMinutes(post.text)}
          timeZone={timeZone}
        />
      </div>
      {thumb ? (
        <a class="post-thumb" href={url} aria-label={post.title}>
          <img src={thumb} alt="" loading="lazy" />
        </a>
      ) : null}
    </article>
  );
}
