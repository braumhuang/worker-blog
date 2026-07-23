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
        <a href={url(page - 1)}>« 上一页</a>
      ) : (
        <span class="is-disabled">« 上一页</span>
      )}
      <span class="pagination-info">
        第 {page} / {totalPages} 页
      </span>
      {page < totalPages ? (
        <a href={url(page + 1)}>下一页 »</a>
      ) : (
        <span class="is-disabled">下一页 »</span>
      )}
    </nav>
  );
}
