import type { ContentWithMeta } from "../../../../types";
import {
  excerptOf,
  formatDate,
  publicAttachmentUrl,
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
    <article class="sc-post">
      <div class="sc-post-left">
        <h2>
          <a class="sc-post-title" href={url}>
            {post.title || "未命名文章"}
          </a>
        </h2>
        <div class="sc-post-abstract">
          <p>{excerptOf(post.text)}</p>
        </div>
        <div class="sc-post-info">
          <time datetime={new Date(post.released * 1000).toISOString()}>
            {formatDate(post.released, false, timeZone)}
          </time>
          {post.categories?.map((category) => (
            <>
              <span> # </span>
              <a href={`/category/${encodeURIComponent(category.slug)}/`}>
                {category.name}
              </a>
            </>
          ))}
          {post.tags?.map((tag) => (
            <>
              <span> # </span>
              <a
                class="sc-post-tag"
                href={`/tag/${encodeURIComponent(tag.slug)}/`}
              >
                {tag.name}
              </a>
            </>
          ))}
        </div>
      </div>
      {cover ? (
        <a class="sc-post-feature" href={url} aria-label={post.title}>
          <img src={cover} alt="" loading="lazy" />
        </a>
      ) : null}
    </article>
  );
}
