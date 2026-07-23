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
  if (!posts.length) return <div class="no-results">暂无内容</div>;
  return (
    <section class="post-list">
      {posts.map((post) => (
        <PostCard post={post} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
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
}: {
  posts: ContentWithMeta[];
  timeZone: string;
  fileCdnUrl: string;
  page: number;
  totalPages: number;
  path?: string;
  categories?: BlogMeta[];
}) {
  return (
    <>
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination page={page} totalPages={totalPages} path={path} />
    </>
  );
}
