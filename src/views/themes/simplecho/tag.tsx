import type { BlogMeta, ContentWithMeta } from "../../../types";
import { Posts } from "./index";
import { Pagination } from "./partials/pagination";

export function Tag({
  meta,
  posts,
  total,
  page,
  totalPages,
  timeZone,
  fileCdnUrl,
}: {
  meta: BlogMeta;
  posts: ContentWithMeta[];
  total: number;
  page: number;
  totalPages: number;
  timeZone: string;
  fileCdnUrl: string;
}) {
  const path = `/tag/${encodeURIComponent(meta.slug)}/`;
  return (
    <div class="sc-post-list-container">
      <p class="sc-current-tag-title">
        # {meta.name}
        <span> · 共 {total} 篇</span>
      </p>
      {meta.description ? (
        <p class="sc-list-description">{meta.description}</p>
      ) : null}
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination page={page} totalPages={totalPages} path={path} />
    </div>
  );
}
