import type { BlogMeta, ContentWithMeta, OptionMap } from "../../../types";
import { navigationItemsFromOptions } from "../../../lib/navigation";
import { excerptOf, formatDate, publicAttachmentUrl } from "../../../lib/utils";
import { Answer, Pagination, PostCards, Question } from "./partials/shared";

export function Index({
  posts,
  timeZone,
  fileCdnUrl,
  page,
  totalPages,
  path = "/",
  options,
}: {
  posts: ContentWithMeta[];
  timeZone: string;
  fileCdnUrl: string;
  page: number;
  totalPages: number;
  path?: string;
  categories?: BlogMeta[];
  tags?: BlogMeta[];
  options?: OptionMap;
}) {
  const site = options?.site_title || "ChatGPT";
  const first = posts[0];
  const navigation = options
    ? navigationItemsFromOptions(options)
        .filter((item) => item.visible && item.id !== "home")
        .slice(0, 6)
    : [];
  if (page > 1)
    return (
      <>
        <Question>继续看看更早的文章？</Question>
        <Answer
          options={options}
          intro={`好的，第 ${page} 页，共 ${totalPages} 页：`}
        >
          <PostCards
            posts={posts}
            timeZone={timeZone}
            fileCdnUrl={fileCdnUrl}
          />
          <Pagination page={page} totalPages={totalPages} path={path} />
        </Answer>
      </>
    );
  return (
    <>
      <h1 class="sr-only">
        {site} - {options?.site_description}
      </h1>
      <Question
        variants={
          "推开这扇门，会遇见什么？\n在无边的互联网里，这里是谁的角落？\n你好呀，带我逛逛这里吧？"
        }
      >
        推开这扇门，会遇见什么？
      </Question>
      <Answer
        options={options}
        intro={
          <>
            <span>你好！这里是 </span>
            <strong>{site}</strong>
            <span>。{options?.site_description}</span>
          </>
        }
      >
        {navigation.length ? (
          <div class="suggestions suggestions--home">
            {navigation.map((item) => (
              <a class="suggestion-card" href={item.url}>
                <span class="suggestion-card__name">{item.name}</span>
                <span class="suggestion-card__hint">点击进入这段对话</span>
              </a>
            ))}
          </div>
        ) : null}
        {first ? (
          <>
            <div class="section-label" id="recent">
              最近更新
            </div>
            <a
              class="featured-card"
              href={`/post/${encodeURIComponent(first.slug)}/`}
            >
              {first.cover ? (
                <div class="featured-card__cover">
                  <img
                    src={publicAttachmentUrl(first.cover, fileCdnUrl)}
                    alt={first.title}
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div class="featured-card__body">
                <h3 class="featured-card__title">{first.title}</h3>
                <p class="featured-card__excerpt">{excerptOf(first.text)}</p>
                <time class="featured-card__time">
                  {formatDate(first.released, false, timeZone)}
                </time>
              </div>
            </a>
            <div class="post-list">
              {posts.slice(1).map((post) => (
                <a
                  class="post-item"
                  href={`/post/${encodeURIComponent(post.slug)}/`}
                >
                  <span class="post-item__main">
                    <span class="post-item__title">{post.title}</span>
                    <span class="post-item__excerpt">
                      {excerptOf(post.text)}
                    </span>
                  </span>
                  <time class="post-item__time">
                    {formatDate(post.released, false, timeZone)}
                  </time>
                </a>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} path={path} />
          </>
        ) : (
          <div class="cg-empty">这里还没有文章，第一轮对话正在酝酿。</div>
        )}
      </Answer>
    </>
  );
}
