import type { BlogMeta, ContentWithMeta } from "../../../types";
import { Divider, magazineDate, Masthead } from "./partials/shared";
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
  return (
    <>
      <Masthead
        en="Theme"
        zh={meta.name}
        tagline={meta.description || "All your returns to this single thread."}
        date={magazineDate(Math.floor(Date.now() / 1000), timeZone)}
      />
      <Divider>归此主题 · Under this thread · {total} 篇</Divider>
      <Posts posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
      <Pagination
        page={page}
        totalPages={totalPages}
        path={`/tag/${encodeURIComponent(meta.slug)}/`}
      />
    </>
  );
}
