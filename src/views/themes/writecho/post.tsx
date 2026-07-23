import type { BlogContent, ContentWithMeta, OptionMap } from "../../../types";
import {
  formatDate,
  publicAttachmentUrl,
  readingMinutes,
  wordCount,
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
    <article class="post-detail">
      <header class="post-header">
        <h1 class="post-title">{content.title}</h1>
        <div class="post-meta">
          <span class="meta-item">
            <time>
              {formatDate(content.released, false, options.site_timezone)}
            </time>
          </span>
          {item.categories?.map((cat) => (
            <span class="meta-item">
              <a href={`/category/${encodeURIComponent(cat.slug)}/`}>
                {cat.name}
              </a>
            </span>
          ))}
          <span class="meta-item">{wordCount(content.text)} 字</span>
          <span class="meta-item">{readingMinutes(content.text)} 分钟阅读</span>
        </div>
      </header>
      {content.cover ? (
        <figure class="post-feature">
          <img
            src={publicAttachmentUrl(content.cover, options.file_cdn_url)}
            alt={content.title}
          />
        </figure>
      ) : null}
      <div class="post-content" dangerouslySetInnerHTML={{ __html: html }} />
      {item.tags?.length ? (
        <footer class="post-footer">
          <div class="post-footer-tags">
            <span class="post-footer-tags-label">标签</span>
            {item.tags.map((tag) => (
              <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}</a>
            ))}
          </div>
        </footer>
      ) : null}
    </article>
  );
}
