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
    <nav class="pagination" aria-label="分页">
      {page > 1 ? (
        <a class="pagination-item" href={url(page - 1)}>
          ← 上一页
        </a>
      ) : (
        <span class="pagination-item pagination-disabled">← 上一页</span>
      )}
      <span class="pagination-info">
        第 {page} / {totalPages} 页
      </span>
      {page < totalPages ? (
        <a class="pagination-item" href={url(page + 1)}>
          下一页 →
        </a>
      ) : (
        <span class="pagination-item pagination-disabled">下一页 →</span>
      )}
    </nav>
  );
}
