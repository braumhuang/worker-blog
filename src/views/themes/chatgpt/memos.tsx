import type { ContentWithMeta } from "../../../types";
import { formatDate, resolveUploadedUrls } from "../../../lib/utils";
import { renderMarkdown } from "../../../lib/markdown";
import { Answer, Pagination, Question } from "./partials/shared";
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
  const visible = days.slice(-364);
  const weeks = Array.from(
    { length: Math.ceil(visible.length / 7) },
    (_, index) => visible.slice(index * 7, index * 7 + 7),
  );
  return (
    <>
      <Question
        variants={
          "那些一闪而过的念头，你都抓住了吗？\n夜深人静的时候，你在想些什么？\n灵感来敲门的时候，你在家吗？"
        }
      >
        那些一闪而过的念头，你都抓住了吗？
      </Question>
      <Answer intro={`抓住了一些，像把萤火虫装进玻璃瓶——${total} 个还亮着。`}>
        {days.length ? (
          <div class="heatmap-wrap">
            <div
              class="heatmap-grid"
              style={`grid-template-columns:repeat(${weeks.length},minmax(0,1fr))`}
            >
              {weeks.map((week) => (
                <span class="heatmap-week">
                  {week.map((item) => (
                    <i
                      class="heatmap-cell"
                      data-level={item.level}
                      title={`${item.day}：${item.count} 条`}
                    />
                  ))}
                </span>
              ))}
            </div>
            <div class="heatmap-footer">
              <span>过去一年</span>
              <span class="heatmap-legend">
                少 <i class="heatmap-legend-cell" data-level="1" />
                <i class="heatmap-legend-cell" data-level="2" />
                <i class="heatmap-legend-cell" data-level="3" />
                <i class="heatmap-legend-cell" data-level="4" /> 多
              </span>
            </div>
          </div>
        ) : null}
        <div class="memo-flow">
          {memos.length ? (
            memos.map((memo) => (
              <article class="memo-card" id={`memo-${memo.cid}`}>
                <div class="memo-card__spark">✦</div>
                <div
                  class="memo-card__content cg-memo-content"
                  dangerouslySetInnerHTML={{
                    __html: resolveUploadedUrls(
                      renderMarkdown(memo.text),
                      fileCdnUrl,
                    ),
                  }}
                />
                <footer class="memo-card__foot">
                  <time class="memo-card__time">
                    {formatDate(memo.released, true, timeZone)}
                  </time>
                  <span class="memo-card__tags">
                    {memo.tags?.map((tag) => (
                      <a
                        class="memo-card__tag"
                        href={`/tag/${encodeURIComponent(tag.slug)}/`}
                      >
                        #{tag.name}
                      </a>
                    ))}
                  </span>
                </footer>
              </article>
            ))
          ) : (
            <div class="cg-empty">还没有闪念。</div>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} path="/memos/" />
      </Answer>
    </>
  );
}
