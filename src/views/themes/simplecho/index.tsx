import type { BlogMeta, ContentWithMeta, OptionMap } from "../../../types";
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
    return (
      <div class="sc-empty">
        <p>笔尖还在等纸——尚无文章。</p>
      </div>
    );
  return (
    <div class="sc-post-inner">
      {posts.map((post) => (
        <PostCard post={post} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      ))}
    </div>
  );
}

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
  return (
    <div class="sc-post-list-container">
      {page === 1 && options?.site_description ? (
        <div class="sc-post-inner">
          <div class="sc-sticky-card">📌 {options.site_description}</div>
        </div>
      ) : null}
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination page={page} totalPages={totalPages} path={path} />
    </div>
  );
}
