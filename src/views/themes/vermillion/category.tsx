import type { BlogMeta, ContentWithMeta } from "../../../types";
import { Divider, magazineDate, Masthead } from "./partials/shared";
import { Pagination } from "./partials/pagination";
import { Posts } from "./index";

export function Category({ meta, posts, total, page, totalPages, timeZone, fileCdnUrl }: { meta: BlogMeta; posts: ContentWithMeta[]; total: number; page: number; totalPages: number; timeZone: string; fileCdnUrl: string }) {
  return (
    <>
      <Masthead en="Category" zh={meta.name} tagline={meta.description || "All entries filed under this folder."} date={magazineDate(Math.floor(Date.now()/1000), timeZone)} />
      <Divider>此 · 分类 · {total} 篇</Divider>
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination page={page} totalPages={totalPages} path={`/category/${encodeURIComponent(meta.slug)}/`} />
    </>
  );
}
