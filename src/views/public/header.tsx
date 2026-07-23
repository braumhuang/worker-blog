import type { BlogMeta, NavigationItem, OptionMap } from "../../types";
import { navigationItemsFromOptions } from "../../lib/navigation";

function Icon({ name }: { name: "sun" | "moon" | "search" | "menu" }) {
  if (name === "sun")
    return (
      <svg
        class="icon icon-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  if (name === "moon")
    return (
      <svg
        class="icon icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
      </svg>
    );
  if (name === "search")
    return (
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.8-3.8" />
      </svg>
    );
  return (
    <svg
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function DesktopItem({
  item,
  active,
  categories,
}: {
  item: NavigationItem;
  active?: string;
  categories: BlogMeta[];
}) {
  const linkClass = `nav-link${active === item.id ? " active" : ""}`;
  if (item.id !== "categories")
    return (
      <a href={item.url} class={linkClass}>
        {item.name}
      </a>
    );
  return (
    <div
      class={`nav-dropdown${active === item.id ? " active" : ""}`}
      data-category-menu
    >
      <a href={item.url} class={linkClass} aria-expanded="false">
        {item.name}
        <span class="nav-dropdown-arrow" aria-hidden="true">
          ⌄
        </span>
      </a>
      <div class="nav-dropdown-menu">
        <a class="nav-dropdown-all" href={item.url}>
          全部分类
        </a>
        {categories.map((category) => (
          <a href={`/category/${encodeURIComponent(category.slug)}/`}>
            {category.name}
            <span>{category.count}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function MobileItem({
  item,
  active,
  categories,
  nested = false,
}: {
  item: NavigationItem;
  active?: string;
  categories: BlogMeta[];
  nested?: boolean;
}) {
  const linkClass = `mobile-nav-link${active === item.id ? " active" : ""}`;
  if (item.id !== "categories")
    return (
      <a
        href={item.url}
        class={
          nested && active === item.id
            ? "active"
            : nested
              ? undefined
              : linkClass
        }
      >
        {item.name}
      </a>
    );
  if (nested)
    return (
      <div
        class={`mobile-nav-group mobile-nav-nested-group${active === item.id ? " active" : ""}`}
        data-mobile-nav-group
      >
        <button
          type="button"
          class={`mobile-nav-submenu-toggle${active === item.id ? " active" : ""}`}
          data-mobile-nav-toggle
          aria-expanded="false"
        >
          {item.name}
          <span class="mobile-nav-arrow" aria-hidden="true">
            ⌄
          </span>
        </button>
        <div class="mobile-nav-submenu mobile-nav-submenu-nested">
          <a href={item.url}>全部分类</a>
          {categories.map((category) => (
            <a href={`/category/${encodeURIComponent(category.slug)}/`}>
              {category.name}
              <span>{category.count}</span>
            </a>
          ))}
        </div>
      </div>
    );
  return (
    <div
      class={`mobile-nav-group${active === item.id ? " active" : ""}`}
      data-mobile-nav-group
    >
      <a
        href={item.url}
        class={linkClass}
        data-mobile-nav-toggle
        aria-expanded="false"
      >
        {item.name}
        <span class="mobile-nav-arrow" aria-hidden="true">
          ⌄
        </span>
      </a>
      <div class="mobile-nav-submenu">
        <a href={item.url}>全部分类</a>
        {categories.map((category) => (
          <a href={`/category/${encodeURIComponent(category.slug)}/`}>
            {category.name}
            <span>{category.count}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function DesktopMoreItem({
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
      <a class={active === item.id ? "active" : undefined} href={item.url}>
        {item.name}
      </a>
    );
  return (
    <div class={`nav-more-category${active === item.id ? " active" : ""}`}>
      <a class={active === item.id ? "active" : undefined} href={item.url}>
        {item.name}
        <span class="nav-dropdown-arrow" aria-hidden="true">
          ⌄
        </span>
      </a>
      <div class="nav-more-category-list">
        <a class="nav-dropdown-all" href={item.url}>
          全部分类
        </a>
        {categories.map((category) => (
          <a href={`/category/${encodeURIComponent(category.slug)}/`}>
            {category.name}
            <span>{category.count}</span>
          </a>
        ))}
      </div>
    </div>
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
      <header class="header">
        <div class="header-inner">
          <a class="logo" href="/">
            {options.site_title}
          </a>
          <nav class="nav" aria-label="主导航">
            {primary.map((item) => (
              <DesktopItem
                item={item}
                active={active}
                categories={categories}
              />
            ))}
            {hasMore ? (
              <div
                class={`nav-dropdown nav-more${moreActive ? " active" : ""}`}
                data-nav-more
              >
                <button
                  type="button"
                  class={`nav-link${moreActive ? " active" : ""}`}
                  data-nav-more-toggle
                  aria-expanded="false"
                >
                  更多
                  <span class="nav-dropdown-arrow" aria-hidden="true">
                    ⌄
                  </span>
                </button>
                <div class="nav-dropdown-menu nav-more-menu">
                  {more.map((item) => (
                    <DesktopMoreItem
                      item={item}
                      active={active}
                      categories={categories}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </nav>
          <div class="header-actions">
            <button
              class="btn-icon"
              id="theme-toggle"
              type="button"
              data-theme-toggle
              title="切换主题"
              aria-label="切换深浅模式"
            >
              <Icon name="sun" />
              <Icon name="moon" />
            </button>
            <button
              class="btn-icon"
              type="button"
              data-search-open
              title="搜索"
              aria-label="搜索"
            >
              <Icon name="search" />
            </button>
            <button
              class="btn-icon mobile-menu-toggle"
              type="button"
              data-menu-toggle
              aria-label="打开移动端菜单"
              aria-controls="mobile-nav"
              aria-expanded="false"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>
      <nav class="mobile-nav" id="mobile-nav" aria-label="移动端导航">
        {primary.map((item) => (
          <MobileItem item={item} active={active} categories={categories} />
        ))}
        {hasMore ? (
          <div
            class={`mobile-nav-group${moreActive ? " active" : ""}`}
            data-mobile-nav-group
          >
            <button
              type="button"
              class={`mobile-nav-link${moreActive ? " active" : ""}`}
              data-mobile-nav-toggle
              aria-expanded="false"
            >
              更多
              <span class="mobile-nav-arrow" aria-hidden="true">
                ⌄
              </span>
            </button>
            <div class="mobile-nav-submenu">
              {more.map((item) => (
                <MobileItem
                  item={item}
                  active={active}
                  categories={categories}
                  nested
                />
              ))}
            </div>
          </div>
        ) : null}
      </nav>
      <div
        class="search-modal"
        data-search-modal
        role="dialog"
        aria-modal="true"
        aria-label="站内搜索"
      >
        <div class="search-modal-content">
          <div class="search-input-wrapper">
            <Icon name="search" />
            <input
              class="search-input"
              data-search-input
              type="search"
              placeholder="搜索标题、摘要、标签…"
              autocomplete="off"
            />
            <button
              class="search-close"
              type="button"
              data-search-close
              aria-label="关闭搜索"
            >
              ×
            </button>
          </div>
          <div class="search-results" data-search-results>
            <div class="search-empty">
              输入关键词开始搜索 · 支持标题 / 摘要 / 标签
            </div>
          </div>
          <div class="search-shortcuts">
            <span>
              <kbd>↵</kbd> 打开
            </span>
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> 切换
            </span>
            <span>
              <kbd>esc</kbd> 关闭
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
