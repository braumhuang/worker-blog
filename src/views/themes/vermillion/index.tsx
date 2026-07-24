import type { BlogMeta, ContentWithMeta, OptionMap } from "../../../types";
import { Pagination } from "./partials/pagination";
import { PostCard } from "./partials/post-card";
import {
  Divider,
  magazineDate,
  magazineTime,
  Masthead,
  Seal,
} from "./partials/shared";

export function Posts({
  posts,
  timeZone,
  fileCdnUrl,
}: {
  posts: ContentWithMeta[];
  timeZone: string;
  fileCdnUrl: string;
}) {
  if (!posts.length) return <div class="empty">— 这里还没有写下任何札记。</div>;
  return (
    <section class="grid-earlier" style="margin-top:36px">
      {posts.map((post, index) => (
        <PostCard
          post={post}
          timeZone={timeZone}
          fileCdnUrl={fileCdnUrl}
          index={index}
        />
      ))}
    </section>
  );
}

export function Index({
  posts,
  timeZone,
  fileCdnUrl,
  page,
  totalPages,
  path = "/",
  tags = [],
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
  const now = Math.floor(Date.now() / 1000);
  const featured = posts.slice(0, 5);
  const earlier = posts.slice(5);
  const title = options?.site_title || "Vermillion";
  const description = options?.site_description || "一册缓慢展开的纸面札记。";
  return (
    <>
      <Masthead
        en={title}
        zh="Vermillion"
        subtitle={description}
        tagline="A periodical of small presences — kept on paper, returned to slowly."
        date={magazineDate(now, timeZone)}
        time={magazineTime(now, timeZone)}
      />
      <article class="hero-bill fade-in" style="animation-delay:0.2s">
        <div>
          <div class="hero-eyebrow">
            <span>EDITORIAL · 卷首</span>
            <span class="sub">今日 · 综述</span>
          </div>
          <div class="hero-prose">
            笔耕不辍，纸自留香。把每一次小小的回响都写下来——多年后再翻，那一页都还在原处。或许慢就是最稳的姿态：
            <em>让事情自己长成它该有的样子</em>。
          </div>
          {tags.length ? (
            <div class="hero-tags">
              {tags.slice(0, 3).map((tag) => (
                <a class="wtag" href={`/tag/${encodeURIComponent(tag.slug)}/`}>
                  {tag.name}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <Seal />
          <div class="seal-cap">Editorial · 卷</div>
          <div class="margin-note">
            A periodical of small presences — kept on paper, returned to slowly.
            <span class="zh">所有小小的当下，都被纸记住。</span>
          </div>
        </div>
      </article>
      <Divider>今日 · Today</Divider>
      {featured.length ? (
        <section class="grid-today">
          {featured.map((post, index) => (
            <PostCard
              post={post}
              timeZone={timeZone}
              fileCdnUrl={fileCdnUrl}
              feature={index === 0}
              index={index}
              eye={index === 0 ? "Featured · 卷首" : "札 · Note"}
            />
          ))}
        </section>
      ) : (
        <div class="empty">— 这里还没有写下任何札记。从一条小回响开始吧。</div>
      )}
      {earlier.length ? (
        <>
          <Divider glyph="ii" delay="0.9s">
            更早 · Earlier selves
          </Divider>
          <section class="grid-earlier">
            {earlier.map((post, index) => (
              <PostCard
                post={post}
                timeZone={timeZone}
                fileCdnUrl={fileCdnUrl}
                index={index + 5}
                eye="Earlier · 更早"
              />
            ))}
          </section>
        </>
      ) : null}
      <Pagination page={page} totalPages={totalPages} path={path} />
    </>
  );
}
