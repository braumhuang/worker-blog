import type { BlogContent, ContentWithMeta, OptionMap } from "../../../types";
import {
  formatDate,
  publicAttachmentUrl,
  readingMinutes,
} from "../../../lib/utils";
export function Post({
  content,
  item,
  html,
  options,
}: {
  content: BlogContent;
  item: ContentWithMeta;
  html: string;
  options: OptionMap;
}) {
  return (
    <>
      <div
        data-reading-progress
        id="reading-progress"
        role="progressbar"
        aria-label="阅读进度"
      />
      <article class="printer-article">
        {item.categories?.length ? (
          <p class="post-meta post-meta-category">
            <span class="post-meta-label">分类</span>
            <span class="post-meta-value">
              {item.categories.map((c, i) => (
                <>
                  {i ? <span>, </span> : null}
                  <a href={`/category/${encodeURIComponent(c.slug)}/`}>
                    {c.name}
                  </a>
                </>
              ))}
            </span>
          </p>
        ) : null}
        <p class="post-date">
          {formatDate(content.released, false, options.site_timezone)} ·{" "}
          {readingMinutes(content.text)} 分钟阅读
        </p>
        <h1 class="paper-title">{content.title}</h1>
        {content.cover ? (
          <div class="post-cover">
            <img
              src={publicAttachmentUrl(content.cover, options.file_cdn_url)}
              alt={content.title}
            />
          </div>
        ) : null}
        <div class="post-content" dangerouslySetInnerHTML={{ __html: html }} />
        {item.tags?.length ? (
          <div class="printer-post-tags">
            {item.tags.map((tag) => (
              <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>#{tag.name}</a>
            ))}
          </div>
        ) : null}
      </article>
    </>
  );
}
