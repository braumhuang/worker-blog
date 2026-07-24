import type { BlogContent, ContentWithMeta, OptionMap } from "../../../types";
import {
  formatDate,
  publicAttachmentUrl,
  readingMinutes,
  wordCount,
} from "../../../lib/utils";
import { Masthead } from "./partials/shared";

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
      <Masthead
        en="Article"
        zh="文 · 札"
        tagline="A single piece, by you, kept by paper."
        date={formatDate(
          content.released,
          false,
          options.site_timezone,
        ).replaceAll("-", " · ")}
        extra={`约 ${readingMinutes(content.text)} min · ${wordCount(content.text)} 字`}
      />
      <div class="reading-progress" data-reading-progress>
        <div class="reading-progress-bar" />
      </div>
      <article class="post-article">
        <div>
          {content.cover ? (
            <div class="post-feature-img">
              <img
                src={publicAttachmentUrl(content.cover, options.file_cdn_url)}
                alt={content.title}
              />
            </div>
          ) : null}
          <div class="post-meta-row">
            <span class="vermillion">
              {formatDate(content.released, false, options.site_timezone)}
            </span>
            {item.categories?.map((category) => (
              <>
                <span>·</span>
                <a href={`/category/${encodeURIComponent(category.slug)}/`}>
                  {category.name}
                </a>
              </>
            ))}
            <span>· 约 {readingMinutes(content.text)} 分钟</span>
            {content.modified > content.released ? (
              <span>
                · 修订{" "}
                {formatDate(content.modified, false, options.site_timezone)}
              </span>
            ) : null}
          </div>
          <h1 class="post-title-main">{content.title}</h1>
          {item.tags?.length ? (
            <div class="hero-tags" style="margin-top:0;margin-bottom:32px">
              {item.tags.map((tag) => (
                <a class="wtag" href={`/tag/${encodeURIComponent(tag.slug)}/`}>
                  {tag.name}
                </a>
              ))}
            </div>
          ) : null}
          <div
            class="prose post-content"
            data-toc
            data-code-copy
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        <aside class="post-toc" aria-label="目录">
          <div class="post-toc-title">目录 · Index</div>
          <div class="post-toc-list" />
        </aside>
      </article>
      <button
        class="back-to-top"
        type="button"
        data-back-to-top
        aria-label="回到顶部"
        title="回到顶部"
      >
        ▲
      </button>
    </>
  );
}
