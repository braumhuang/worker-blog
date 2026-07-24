import type { ContentWithMeta } from "../../../types";
import { formatDate } from "../../../lib/utils";
import { Divider, Masthead } from "./partials/shared";
import { Pagination } from "./partials/pagination";

export function Archives({ years, total, tagTotal, page, totalPages, timeZone }: { years: Map<string, ContentWithMeta[]>; total: number; tagTotal: number; page: number; totalPages: number; timeZone: string }) {
  return (
    <>
      <Masthead en="Archives" zh="归档" tagline="All entries, by year. A long quiet shelf." extra={`${total} 篇 · ${tagTotal} 标签`} />
      <Divider>逐年 · By year · 共 {total} 篇</Divider>
      {[...years.entries()].length ? [...years.entries()].map(([year, items], index) => (
        <section class="archive-year fade-in" style={`animation-delay:${0.25 + index * 0.08}s`}>
          <div class="archive-year-num">{year}<span class="count">{items.length} entries</span></div>
          <div class="archive-list">
            {items.map((post) => (
              <a class="archive-item" href={`/post/${encodeURIComponent(post.slug)}/`}>
                <time class="archive-item-date">{formatDate(post.released, false, timeZone)}</time>
                <span class="archive-item-title">{post.title}</span>
              </a>
            ))}
          </div>
        </section>
      )) : <div class="empty">— 纸面还很白净，尚未有归档。</div>}
      <Pagination page={page} totalPages={totalPages} path="/archives/" />
    </>
  );
}
