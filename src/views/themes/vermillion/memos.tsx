import type { ContentWithMeta } from "../../../types";
import { formatDate, resolveUploadedUrls } from "../../../lib/utils";
import { renderMarkdown } from "../../../lib/markdown";
import { Divider, magazineDate, Masthead } from "./partials/shared";
import { Pagination } from "./partials/pagination";

export type MemoActivityDay = { day: string; count: number; level: number };

export function Memos({ memos, days, total, page, totalPages, timeZone, fileCdnUrl }: { memos: ContentWithMeta[]; days: MemoActivityDay[]; total: number; page: number; totalPages: number; timeZone: string; fileCdnUrl: string }) {
  const activeDays = days.filter((item) => item.count > 0).length;
  return (
    <>
      <Masthead en="Memos" zh="闪念" tagline="Tiny presences. Not articles, just shimmer." date={magazineDate(Math.floor(Date.now()/1000), timeZone)} extra={<><strong class="vermillion memo-count">{total}</strong> 条 · 活跃 {activeDays} 天</>} />
      {days.length ? (
        <div class="memo-heatmap fade-in" style="animation-delay:0.2s">
          <div class="memo-heatmap-grid">
            {days.slice(-364).map((item) => <div class="memo-heatmap-cell" data-level={item.level || undefined} title={`${item.day} · ${item.count} 条`} />)}
          </div>
          <div class="memo-heatmap-info"><span>过去一年 · A year in small marks</span><span>{activeDays} active days</span></div>
        </div>
      ) : null}
      <Divider delay="0.3s">近思 · Recent shimmer</Divider>
      {memos.length ? (
        <div class="memo-list">
          {memos.map((memo, index) => (
            <article class="memo-item fade-in" id={`memo-${memo.cid}`} style={`animation-delay:${0.3 + index * 0.05}s`}>
              <div class="memo-item-time">
                {formatDate(memo.released, true, timeZone)}
                {memo.tags?.map((tag) => <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>#{tag.name}</a>)}
              </div>
              <div class="memo-item-body" dangerouslySetInnerHTML={{ __html: resolveUploadedUrls(renderMarkdown(memo.text), fileCdnUrl) }} />
            </article>
          ))}
        </div>
      ) : <div class="empty">— 还没有闪念。</div>}
      <Pagination page={page} totalPages={totalPages} path="/memos/" />
    </>
  );
}
