import type { BlogMeta, ContentWithMeta } from "../../../types";
import { PageHeading } from "./base";
import { Pagination } from "./partials/pagination";
import { Posts } from "./index";
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
    <>
      <PageHeading
        title={`标签：${meta.name}`}
        subtitle={meta.description || `共 ${total} 篇文章`}
      />
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination page={page} totalPages={totalPages} path={path} />
    </>
  );
}
