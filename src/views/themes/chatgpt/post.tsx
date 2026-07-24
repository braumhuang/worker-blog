import type { BlogContent, ContentWithMeta, OptionMap } from "../../../types";
import {
  formatDate,
  publicAttachmentUrl,
  readingMinutes,
  wordCount,
} from "../../../lib/utils";
import { Answer, MessageActions, Question } from "./partials/shared";

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
  const cover = content.cover
    ? publicAttachmentUrl(content.cover, options.file_cdn_url)
    : "";
  return (
    <>
      <Question title>{content.title}</Question>
      <Answer
        options={options}
        intro={
          <span>
            这篇文章发布于{" "}
            {formatDate(content.released, false, options.site_timezone)}，共{" "}
            {wordCount(content.text)} 字，预计阅读{" "}
            {readingMinutes(content.text)} 分钟。
          </span>
        }
      >
        {cover ? (
          <figure class="post-feature">
            <img src={cover} alt={content.title} loading="eager" />
          </figure>
        ) : null}
        <div class="post-meta cg-post-meta-links">
          {item.categories?.map((category) => (
            <a
              class="chip"
              href={`/category/${encodeURIComponent(category.slug)}/`}
            >
              {category.name}
            </a>
          ))}
          {item.tags?.map((tag) => (
            <a class="chip" href={`/tag/${encodeURIComponent(tag.slug)}/`}>
              #{tag.name}
            </a>
          ))}
        </div>
        <article
          class="article-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <p class="post-byline">
          由{" "}
          <a class="post-byline__name" href="/">
            {options.site_title}
          </a>{" "}
          亲笔撰写。
        </p>
        {content.modified > content.released ? (
          <p class="post-updated">
            最后更新于{" "}
            {formatDate(content.modified, true, options.site_timezone)}
          </p>
        ) : null}
        <MessageActions />
      </Answer>
    </>
  );
}
