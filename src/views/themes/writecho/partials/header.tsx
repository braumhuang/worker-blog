import type { BlogMeta, NavigationItem, OptionMap } from "../../../../types";
import { navigationItemsFromOptions } from "../../../../lib/navigation";

function CategoryItems({ categories }: { categories: BlogMeta[] }) {
  return (
    <>
      {categories.map((category) => (
        <a href={`/category/${encodeURIComponent(category.slug)}/`}>
          {category.name}
          <span>{category.count}</span>
        </a>
      ))}
    </>
  );
}

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
      <a class={active === item.id ? "is-active" : undefined} href={item.url}>
        {item.name}
      </a>
    );
  return (
    <span
      class={`writecho-nav-group${active === item.id ? " is-active" : ""}`}
      data-nav-group
    >
      <a href={item.url} data-nav-submenu-toggle aria-expanded="false">
        {item.name}
        <b>⌄</b>
      </a>
      <span class="writecho-nav-submenu">
        <a href={item.url}>全部分类</a>
        <CategoryItems categories={categories} />
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
    <header class="site-header">
      <div class="container site-header-inner">
        <a class="site-brand" href="/" rel="home">
          <h1 class="site-brand-text">{options.site_title}</h1>
        </a>
        {options.site_description ? (
          <p class="site-subtitle">{options.site_description}</p>
        ) : null}
        <nav class="site-nav" aria-label="主导航" data-site-nav>
          {primary.map((item) => (
            <NavItem item={item} active={active} categories={categories} />
          ))}
          {hasMore ? (
            <span
              class={`writecho-nav-group writecho-nav-more${moreActive ? " is-active" : ""}`}
              data-nav-group
            >
              <button
                type="button"
                data-nav-submenu-toggle
                aria-expanded="false"
              >
                更多<b>⌄</b>
              </button>
              <span class="writecho-nav-submenu writecho-nav-more-menu">
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
      </div>
      <div class="site-controls">
        <button class="ctrl" type="button" data-search-open aria-label="搜索">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <button
          class="ctrl"
          type="button"
          data-theme-toggle
          aria-label="切换深浅模式"
        >
          <svg class="icon-moon" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg class="icon-sun" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </button>
      </div>
      <div
        class="search-modal"
        data-search-modal
        role="dialog"
        aria-modal="true"
        aria-label="站内搜索"
      >
        <div class="search-modal-panel" role="document">
          <button
            class="writecho-search-close"
            type="button"
            data-search-close
            aria-label="关闭"
          >
            ×
          </button>
          <input
            class="search-modal-input"
            type="search"
            data-search-input
            placeholder="搜索文章 / 标签 / 内容…"
            autocomplete="off"
          />
          <p class="search-modal-tip">
            ↑ ↓ 选择 · Enter 进入 · Esc 关闭 · Cmd/Ctrl + K 唤起
          </p>
          <div class="search-modal-results" data-search-results>
            <div class="search-modal-empty">输入关键词开始搜索</div>
          </div>
        </div>
      </div>
    </header>
  );
}
