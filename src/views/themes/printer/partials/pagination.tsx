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
  const s = path.includes("?") ? "&" : "?";
  const u = (n: number) => `${path}${s}page=${n}`;
  return (
    <nav class="page-nav" aria-label="分页">
      <div class="page-nav-row">
        {page > 1 ? (
          <a href={u(page - 1)} class="page-nav-prev">
            ← 上一页
          </a>
        ) : (
          <span class="page-nav-prev page-nav-disabled">← 上一页</span>
        )}
        <span class="page-nav-current">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <a href={u(page + 1)} class="page-nav-next">
            下一页 →
          </a>
        ) : (
          <span class="page-nav-next page-nav-disabled">下一页 →</span>
        )}
      </div>
    </nav>
  );
}
