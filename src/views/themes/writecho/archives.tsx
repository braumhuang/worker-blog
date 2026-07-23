import type { ContentWithMeta } from "../../../types";
import { isoDate } from "../../../lib/utils";
import { PageHeading } from "./base";
import { Pagination } from "./partials/pagination";
export function Archives({
  years,
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
      <PageHeading title="归档" subtitle="按年份串成时间轴，从最近到从前" />
      <div class="archives">
        {[...years.entries()].map(([year, items]) => (
          <section class="archive-year">
            <h2 class="archive-year-title">{year}</h2>
            <ul class="archive-list">
              {items.map((post) => (
                <li class="archive-item">
                  <span class="archive-item-date">
                    {isoDate(post.released, timeZone)}
                  </span>
                  <a
                    class="archive-item-title"
                    href={`/post/${encodeURIComponent(post.slug)}/`}
                  >
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} path="/archives/" />
    </>
  );
}
