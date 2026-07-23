import type { ContentWithMeta } from "../../../types";
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
      <div class="empty-state">
        <p>笔尖还在等纸——尚无文章。</p>
      </div>
    );
  return (
    <div class="post-list">
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
}: {
  posts: ContentWithMeta[];
  timeZone: string;
  fileCdnUrl: string;
  page: number;
  totalPages: number;
  path?: string;
  categories?: unknown;
}) {
  return (
    <>
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination page={page} totalPages={totalPages} path={path} />
    </>
  );
}
