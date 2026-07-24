export function Pagination({
  page,
  totalPages,
  path,
}: {
  page: number;
  totalPages: number;
  path: string;
}) {
  if (totalPages <= 1) return null;
  const separator = path.includes("?") ? "&" : "?";
  const url = (target: number) => `${path}${separator}page=${target}`;
  return (
    <nav class="pagination" aria-label="分页导航">
      {page > 1 ? (
        <a href={url(page - 1)} rel="prev">
          ← 前一页 · prev
        </a>
      ) : (
        <span class="pagination-disabled">← 前一页 · prev</span>
      )}
      <span class="pagination-info">
        P. {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <a href={url(page + 1)} rel="next">
          下一页 · next →
        </a>
      ) : (
        <span class="pagination-disabled">下一页 · next →</span>
      )}
    </nav>
  );
}
