import type { ContentWithMeta } from "../../../types";
import { formatDate, resolveUploadedUrls } from "../../../lib/utils";
import { renderMarkdown } from "../../../lib/markdown";
import { Pagination } from "./partials/pagination";

export type MemoActivityDay = { day: string; count: number; level: number };

export function Memos({
  memos,
  days,
  total,
  page,
  totalPages,
  timeZone,
  fileCdnUrl,
}: {
  memos: ContentWithMeta[];
  days: MemoActivityDay[];
  total: number;
  page: number;
  totalPages: number;
  timeZone: string;
  fileCdnUrl: string;
}) {
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail">
        <h1 class="sc-post-title-detail">闪念</h1>
        <p class="sc-page-intro">一闪而过的念头，记下来 · 共 {total} 条</p>
        {days.length ? (
          <div class="sc-memo-heatmap-wrap">
            <div class="sc-memo-heatmap">
              {days.slice(-364).map((item) => (
                <span
                  class="sc-memo-heatmap-cell"
                  data-level={item.level}
                  title={`${item.day}：${item.count} 条`}
                />
              ))}
            </div>
            <div class="sc-memo-heatmap-caption">
              过去一年 · 少 <span data-level="1" />
              <span data-level="2" />
              <span data-level="3" />
              <span data-level="4" /> 多
            </div>
          </div>
        ) : null}
        <div class="sc-memos-list">
          {memos.length ? (
            memos.map((memo) => (
              <article class="sc-memo" id={`memo-${memo.cid}`}>
                <div
                  class="sc-memo-content"
                  dangerouslySetInnerHTML={{
                    __html: resolveUploadedUrls(
                      renderMarkdown(memo.text),
                      fileCdnUrl,
                    ),
                  }}
                />
                <div class="sc-memo-meta">
                  <time>{formatDate(memo.released, true, timeZone)}</time>
                  {memo.tags?.map((tag) => (
                    <a
                      class="sc-memo-tag"
                      href={`/tag/${encodeURIComponent(tag.slug)}/`}
                    >
                      # {tag.name}
                    </a>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div class="sc-empty">还没有闪念。</div>
          )}
        </div>
      </article>
      <Pagination page={page} totalPages={totalPages} path="/memos/" />
    </div>
  );
}
