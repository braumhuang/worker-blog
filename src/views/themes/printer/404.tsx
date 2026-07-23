export function NotFound() {
  return (
    <article class="not-found">
      <h1 class="paper-title">404 - 页面找不到了</h1>
      <p class="paper-subtitle">
        抱歉，你访问的页面可能被删除了，或者链接地址有误。
      </p>
      <div class="not-found-hint">
        试试返回首页、浏览归档，或者搜索你想找的内容。
      </div>
      <a class="not-found-home" href="/">
        返回首页
      </a>
    </article>
  );
}
