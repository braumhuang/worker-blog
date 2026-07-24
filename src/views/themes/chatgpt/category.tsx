import type { BlogMeta, ContentWithMeta } from "../../../types";
import { Answer, Pagination, PostCards, Question } from "./partials/shared";
export function Category({
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
  const path = `/category/${encodeURIComponent(meta.slug)}/`;
  return (
    <>
      <Question
        name={meta.name}
        variants={
          "「{name}」这个抽屉里，收着什么？\n打开「{name}」，让我看看里面。"
        }
      >
        打开「{meta.name}」，让我看看里面。
      </Question>
      <Answer intro={`「${meta.name}」这个抽屉里收着 ${total} 篇文字：`}>
        {meta.description ? (
          <p class="cg-page-intro">{meta.description}</p>
        ) : null}
        <PostCards posts={posts} timeZone={timeZone} fileCdnUrl={fileCdnUrl} />
        <Pagination page={page} totalPages={totalPages} path={path} />
      </Answer>
    </>
  );
}
