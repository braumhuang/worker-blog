import type { ContentWithMeta } from "../../../types";
import { isoDate } from "../../../lib/utils";
import { PageHeading } from "./base";
import { Pagination } from "./partials/pagination";
export function Archives({
  years,
  total,
  tagTotal,
  page,
  totalPages,
  timeZone,
}: {
  years: Map<string, ContentWithMeta[]>;
  total: number;
  tagTotal: number;
  page: number;
  totalPages: number;
  timeZone: string;
}) {
  return (
    <>
      <PageHeading title="归档" subtitle="站内全部文章，按时间倒序" />
      <div class="archive-stats">
        <div>
          <div class="archive-stat-number">{total}</div>
          <div class="archive-stat-label">篇文章</div>
        </div>
        <div>
          <div class="archive-stat-number">{tagTotal}</div>
          <div class="archive-stat-label">个标签</div>
        </div>
      </div>
      {[...years.entries()].map(([year, items]) => (
        <section class="archive-year">
          <h3 class="archive-year-title">{year}</h3>
          <ul class="archive-list">
            {items.map((post) => (
              <li class="archive-item">
                <span class="archive-date">
                  {isoDate(post.released, timeZone)}
                </span>
                <span class="archive-item-title">
                  <a href={`/post/${encodeURIComponent(post.slug)}/`}>
                    {post.title}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Pagination page={page} totalPages={totalPages} path="/archives/" />
    </>
  );
}
