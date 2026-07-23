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
      <PageHeading title="闪念" subtitle="笔尖一闪而过的念头，记下来" />
      <section class="heatmap">
        <p class="heatmap-title">最近一年发布频率 · {total} 条</p>
        <div class="heatmap-grid">
          {days.map((d) => (
            <span
              class="heatmap-cell"
              data-level={d.level}
              title={`${d.day}：${d.count} 条`}
            />
          ))}
        </div>
        <div class="heatmap-legend">
          <span>少</span>
          {[0, 1, 2, 3, 4].map((n) => (
            <span class="heatmap-legend-cell" data-level={n} />
          ))}
          <span>多</span>
        </div>
      </section>
      <div class="memos">
        {memos.map((memo) => (
          <article class="memo" id={`memo-${memo.cid}`}>
            <p class="memo-meta">{formatDate(memo.released, true, timeZone)}</p>
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
                  <a
                    class="memo-tag"
                    href={`/tag/${encodeURIComponent(tag.slug)}/`}
                  >
                    #{tag.name}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} path="/memos/" />
    </>
  );
}
