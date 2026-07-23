import type { BlogContent, ContentWithMeta, OptionMap } from "../../../types";
import {
  publicAttachmentUrl,
  readingMinutes,
  wordCount,
} from "../../../lib/utils";
import { MetaPills, PostMeta } from "./partials/post-card";

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
    <article class="article-detail">
      <header class="article-header">
        <h1 class="article-title">{content.title}</h1>
        <PostMeta
          article
          created={content.released}
          categories={item.categories}
          reading={readingMinutes(content.text)}
          words={wordCount(content.text)}
          timeZone={options.site_timezone}
        />
      </header>
      {content.cover ? (
        <figure class="article-cover">
          <img
            src={publicAttachmentUrl(content.cover, options.file_cdn_url)}
            alt={content.title}
            loading="eager"
          />
        </figure>
      ) : null}
      <div class="article-content" dangerouslySetInnerHTML={{ __html: html }} />
      <MetaPills tags={item.tags ?? []} />
    </article>
  );
}
