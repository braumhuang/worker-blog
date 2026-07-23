import type { ContentWithMeta } from "../../../types";
import { formatDate, resolveUploadedUrls } from "../../../lib/utils";
import { renderMarkdown } from "../../../lib/markdown";
import { PageHeading } from "./base";
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
    <>
      <PageHeading title="闪念" subtitle="一些不成文章的碎片想法" />
      <div class="memo-heatmap-wrap">
        <div class="memo-heatmap-stats">
          <strong>{total}</strong> 条闪念
        </div>
        <div class="memo-heatmap-scroll">
          <div class="memo-heatmap">
            {days.map((item) => (
              <span
                class="memo-heatmap-cell"
                data-level={item.level}
                title={`${item.day}：${item.count} 条`}
              />
            ))}
          </div>
        </div>
        <div class="memo-heatmap-legend">
          <span class="memo-heatmap-legend-label">少</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span class="memo-heatmap-cell" data-level={level} />
          ))}
          <span class="memo-heatmap-legend-label">多</span>
        </div>
      </div>
      <section class="memo-timeline">
        {memos.length ? (
          memos.map((memo) => (
            <article class="memo-item" id={`memo-${memo.cid}`}>
              <span class="memo-dot" />
              <div class="memo-body">
                <div
                  class="memo-content"
                  dangerouslySetInnerHTML={{
                    __html: resolveUploadedUrls(
                      renderMarkdown(memo.text),
                      fileCdnUrl,
                    ),
                  }}
                />
                {memo.tags?.length ? (
                  <div class="memo-tags">
                    {memo.tags.map((tag) => (
                      <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>
                        #{tag.name}
                      </a>
                    ))}
                  </div>
                ) : null}
                <time class="memo-date">
                  {formatDate(memo.released, true, timeZone)}
                </time>
              </div>
            </article>
          ))
        ) : (
          <div class="no-results">还没有任何闪念。</div>
        )}
      </section>
      <Pagination page={page} totalPages={totalPages} path="/memos/" />
    </>
  );
}
