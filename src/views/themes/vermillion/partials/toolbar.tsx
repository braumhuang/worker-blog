import type { OptionMap } from "../../../../types";

export function Toolbar({ options }: { options: OptionMap }) {
  return (
    <>
      <div class="page-toolbar" role="toolbar" aria-label="工具栏">
        <button class="page-toolbar-btn" type="button" data-search-open title="搜索 (⌘K / Ctrl+K)" aria-label="搜索">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
        <button class="page-toolbar-btn" type="button" data-theme-toggle title="切换明暗" aria-label="切换明暗模式">
          <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" fill="none" stroke="currentColor" stroke-width="2" /></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.7 15.2A8 8 0 0 1 8.8 3.3 9 9 0 1 0 20.7 15.2Z" /></svg>
        </button>
      </div>
      <div class="search-overlay" aria-hidden="true" role="dialog" aria-label="全站搜索">
        <div class="search-modal" role="document">
          <input class="search-input" type="search" placeholder="此刻 · 此地 · 你在找什么字眼？" aria-label="搜索关键词" autocomplete="off" />
          <div class="search-meta">
            <span>Search · {options.site_title}</span>
            <span class="search-meta-count" />
          </div>
          <div class="search-results" aria-live="polite" />
        </div>
      </div>
    </>
  );
}
