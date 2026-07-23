import type { BlogMeta, NavigationItem, OptionMap } from "../../../../types";
import { navigationItemsFromOptions } from "../../../../lib/navigation";
function NavItem({
  item,
  active,
  categories,
}: {
  item: NavigationItem;
  active?: string;
  categories: BlogMeta[];
}) {
  if (item.id !== "categories")
    return (
      <a href={item.url} class={active === item.id ? "active" : undefined}>
        {item.name}
      </a>
    );
  return (
    <span
      class={`printer-menu-group${active === item.id ? " active" : ""}`}
      data-nav-group
    >
      <a href={item.url} data-nav-submenu-toggle aria-expanded="false">
        {item.name}
        <b>⌄</b>
      </a>
      <span class="printer-menu-sub">
        <a href={item.url}>全部分类</a>
        {categories.map((c) => (
          <a href={`/category/${encodeURIComponent(c.slug)}/`}>
            {c.name}
            <span>{c.count}</span>
          </a>
        ))}
      </span>
    </span>
  );
}
export function Header({
  options,
  active,
  categories = [],
}: {
  options: OptionMap;
  active?: string;
  categories?: BlogMeta[];
}) {
  const navigation = navigationItemsFromOptions(options).filter(
    (item) => item.visible,
  );
  const hasMore = navigation.length > 8;
  const primary = hasMore ? navigation.slice(0, 7) : navigation;
  const more = hasMore ? navigation.slice(7) : [];
  const moreActive = more.some((item) => item.id === active);
  return (
    <>
      <header class="printer-top">
        <div class="top-row">
          <a class="brand" href="/">
            <span class="brand-mark" />
            <span class="brand-text">
              <h1>{options.site_title}</h1>
              <p>{options.site_description}</p>
            </span>
          </a>
          <div class="power">
            <div class="power-dot" />
            <span class="power-text power-text-on">ON</span>
            <span class="power-text power-text-off">OFF</span>
          </div>
        </div>
        <div class="menu-row">
          <button
            class="printer-mobile-menu"
            type="button"
            data-menu-toggle
            aria-expanded="false"
          >
            MENU
          </button>
          <nav class="menu" aria-label="主导航" data-site-nav>
            {primary.map((item) => (
              <NavItem item={item} active={active} categories={categories} />
            ))}
            {hasMore ? (
              <span
                class={`printer-menu-group printer-menu-more${moreActive ? " active" : ""}`}
                data-nav-group
              >
                <button
                  type="button"
                  data-nav-submenu-toggle
                  aria-expanded="false"
                >
                  更多⌄
                </button>
                <span class="printer-menu-sub printer-menu-more-sub">
                  {more.map((item) => (
                    <NavItem
                      item={item}
                      active={active}
                      categories={categories}
                    />
                  ))}
                </span>
              </span>
            ) : null}
          </nav>
          <div class="ctrls">
            <form class="header-search" role="search">
              <label class="header-search-label" for="header-search-input">
                搜索
              </label>
              <input
                id="header-search-input"
                type="search"
                placeholder="搜索文章"
                autocomplete="off"
                data-header-search-input
              />
              <button
                type="button"
                class="header-search-btn"
                data-search-open
                aria-label="搜索"
              >
                <svg viewBox="0 0 16 16">
                  <path d="M6.5 2a4.5 4.5 0 1 1 0 9A4.5 4.5 0 0 1 6.5 2zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  <path d="M10.4 10.4a.75.75 0 0 1 1.06 0l2.3 2.3a.75.75 0 1 1-1.06 1.06l-2.3-2.3a.75.75 0 0 1 0-1.06z" />
                </svg>
              </button>
            </form>
            <button
              type="button"
              class="theme-toggle"
              data-theme-toggle
              aria-label="切换日夜模式"
            />
          </div>
        </div>
      </header>
      <div
        class="search-modal"
        data-search-modal
        role="dialog"
        aria-modal="true"
        aria-label="站内搜索"
      >
        <div class="search-modal-content">
          <div class="search-input-wrapper">
            <svg viewBox="0 0 16 16">
              <path d="M6.5 2a4.5 4.5 0 1 1 0 9A4.5 4.5 0 0 1 6.5 2zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
              <path d="M10.4 10.4a.75.75 0 0 1 1.06 0l2.3 2.3a.75.75 0 1 1-1.06 1.06l-2.3-2.3a.75.75 0 0 1 0-1.06z" />
            </svg>
            <input
              type="search"
              class="search-input"
              data-search-input
              placeholder="搜索文章 / 标签 / 闪念..."
              autocomplete="off"
            />
            <button
              type="button"
              class="search-close"
              data-search-close
              aria-label="关闭搜索"
            >
              ×
            </button>
          </div>
          <div class="search-results" data-search-results>
            <p class="search-empty">输入关键词开始搜索</p>
          </div>
          <div class="search-shortcuts">
            <span>
              <kbd>↵</kbd>打开
            </span>
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd>切换
            </span>
            <span>
              <kbd>esc</kbd>关闭
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
