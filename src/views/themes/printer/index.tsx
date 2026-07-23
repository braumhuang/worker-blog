import type { BlogMeta, ContentWithMeta } from "../../../types";
import { Pagination } from "./partials/pagination";
import { PostCard } from "./partials/post-card";
export function Posts({
  posts,
  timeZone,
  fileCdnUrl,
}: {
  posts: ContentWithMeta[];
  timeZone: string;
  fileCdnUrl: string;
}) {
  if (!posts.length)
    return <div class="no-results">暂无文章，先去写一篇吧。</div>;
  return (
    <ul class="post-list">
      {posts.map((post) => (
        <PostCard post={post} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      ))}
    </ul>
  );
}
export function Index({
  posts,
  timeZone,
  fileCdnUrl,
  page,
  totalPages,
  path = "/",
}: {
  posts: ContentWithMeta[];
  timeZone: string;
  fileCdnUrl: string;
  page: number;
  totalPages: number;
  path?: string;
  categories?: BlogMeta[];
}) {
  const map = new Map<number, BlogMeta>();
  for (const post of posts)
    for (const c of post.categories || []) map.set(c.mid, c);
  const cats = [...map.values()].slice(0, 10);
  return (
    <>
      <h2 class="paper-title">打印纸上的文字</h2>
      <p class="paper-subtitle">共 {posts.length} 篇当前页内容</p>
      <section class="paper-meta">
        <div class="meta-group">
          <p class="meta-label">活动</p>
          <div class="meta-tags">
            {posts[0] ? (
              <a href={`/post/${encodeURIComponent(posts[0].slug)}/`}>
                最新文章
              </a>
            ) : null}
            <a href="#" data-random-read>
              随机阅读
            </a>
            <a href="/archives/">归档</a>
          </div>
        </div>
        {cats.length ? (
          <div class="meta-group">
            <p class="meta-label">分类</p>
            <div class="meta-tags">
              {cats.map((c) => (
                <a href={`/category/${encodeURIComponent(c.slug)}/`}>
                  {c.name} ({c.count})
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination page={page} totalPages={totalPages} path={path} />
    </>
  );
}
