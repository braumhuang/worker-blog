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
      <section class="memo-heatmap-wrap">
        <div class="memo-heatmap-stats">
          <strong>{total}</strong>条闪念
        </div>
        <div class="memo-heatmap">
          {days.map((d) => (
            <span
              class="memo-heatmap-cell"
              data-level={d.level}
              title={`${d.day}：${d.count} 条`}
            />
          ))}
        </div>
        <div class="memo-heatmap-legend">
          <span class="memo-heatmap-legend-label">少</span>
          {[0, 1, 2, 3, 4].map((n) => (
            <span class="memo-heatmap-cell" data-level={n} />
          ))}
          <span class="memo-heatmap-legend-label">多</span>
        </div>
      </section>
      <div class="memo-timeline">
        {memos.map((memo) => (
          <article class="memo-item" id={`memo-${memo.cid}`}>
            <div class="memo-dot" />
            <div
              class="memo-content"
              dangerouslySetInnerHTML={{
                __html: resolveUploadedUrls(
                  renderMarkdown(memo.text),
                  fileCdnUrl,
                ),
              }}
            />
            <time class="memo-date">
              {formatDate(memo.released, true, timeZone)}
            </time>
          </article>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} path="/memos/" />
    </>
  );
}
