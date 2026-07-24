export function Pagination({ page, totalPages, path }: { page: number; totalPages: number; path: string }) {
  if (totalPages <= 1) return null;
  const separator = path.includes("?") ? "&" : "?";
  const url = (target: number) => `${path}${separator}page=${target}`;
  return (
    <nav class="sc-pagination" aria-label="分页导航">
      {page > 1 ? <a href={url(page - 1)} rel="prev">← 上一页</a> : <span class="sc-pagination-disabled">← 上一页</span>}
      <span class="sc-pagination-meta">{page} / {totalPages}</span>
      {page < totalPages ? <a href={url(page + 1)} rel="next">下一页 →</a> : <span class="sc-pagination-disabled">下一页 →</span>}
    </nav>
  );
}
