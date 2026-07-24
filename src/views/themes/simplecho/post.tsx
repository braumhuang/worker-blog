import type { BlogContent, ContentWithMeta, OptionMap } from "../../../types";
import { formatDate, publicAttachmentUrl, readingMinutes, wordCount } from "../../../lib/utils";

export function Post({ content, item, html, options }: { content: BlogContent; item: ContentWithMeta; html: string; options: OptionMap }) {
  const cover = content.cover ? publicAttachmentUrl(content.cover, options.file_cdn_url) : "";
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail">
        <h1 class="sc-post-title-detail">{content.title}</h1>
        <div class="sc-post-info-detail">
          <time datetime={new Date(content.released * 1000).toISOString()}>发布于 · {formatDate(content.released, false, options.site_timezone)} ·</time>
          {item.categories?.map((category) => <><span> # </span><a href={`/category/${encodeURIComponent(category.slug)}/`}>{category.name}</a></>)}
          {item.tags?.map((tag) => <><span> # </span><a href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}</a></>)}
          <span> · {wordCount(content.text)} 字 · 约 {readingMinutes(content.text)} 分钟</span>
        </div>
        {cover ? <figure class="sc-post-feature-banner"><img src={cover} alt={content.title} loading="eager" /></figure> : null}
        <div class="sc-post-content" id="sc-post-content" dangerouslySetInnerHTML={{ __html: html }} />
        {item.tags?.length ? (
          <div class="sc-post-tags-line"><span>标签：</span>{item.tags.map((tag) => <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}</a>)}</div>
        ) : null}
      </article>
    </div>
  );
}
