export const publicCss = String.raw`
:root {
  color-scheme: light;
  --bg: #fcfcfb;
  --panel: #ffffff;
  --text: #202124;
  --muted: #777b82;
  --line: #e9e7e2;
  --accent: #2f6f5e;
  --accent-soft: #e7f1ed;
  --shadow: 0 18px 50px rgba(30, 35, 33, .08);
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #171918;
  --panel: #1f2220;
  --text: #e9ecea;
  --muted: #a4aaa7;
  --line: #303532;
  --accent: #86c4af;
  --accent-soft: #243a32;
  --shadow: 0 18px 50px rgba(0, 0, 0, .28);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.75;
  transition: background .2s ease, color .2s ease;
}
a { color: inherit; text-decoration: none; }
a:hover { color: var(--accent); }
button, input { font: inherit; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 75%, transparent);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(16px);
}
.header-inner, .site-main, .footer-inner {
  width: min(920px, calc(100% - 36px));
  margin-inline: auto;
}
.header-inner {
  min-height: 72px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
}
.brand { justify-self: start; display: flex; align-items: center; font-weight: 600; font-size: 1.125rem; letter-spacing: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.site-nav {
  display: flex;
  justify-self: center;
  align-items: center;
  justify-content: center;
  gap: 22px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.site-nav::-webkit-scrollbar { display: none; }
.site-nav a { font-size: .92rem; color: var(--muted); white-space: nowrap; flex-shrink: 0; }
.site-nav a.active, .site-nav a:hover { color: var(--text); }
.header-actions { display: flex; justify-self: end; align-items: center; gap: 7px; flex-shrink: 0; }
.icon-button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: color .15s ease, background-color .15s ease;
}
.icon-button:hover { color: var(--text); background: color-mix(in srgb, var(--panel) 72%, var(--line)); }
.header-icon { width: 20px; height: 20px; }
.icon-moon { display: none; }
:root[data-theme="dark"] .icon-sun { display: none; }
:root[data-theme="dark"] .icon-moon { display: block; }
.mobile-nav { display: none; }
.site-main { min-height: calc(100vh - 170px); padding-block: 54px 80px; }
.page-heading { margin-bottom: 38px; }
.page-heading h1 { margin: 0 0 6px; font-size: clamp(1.7rem, 5vw, 2.25rem); letter-spacing: -.045em; }
.page-heading p { margin: 0; color: var(--muted); }
.post-list { display: grid; gap: 0; }
.post-card { padding: 28px 0 30px; border-bottom: 1px solid var(--line); }
.post-card:first-child { padding-top: 0; }
.post-card h2 { margin: 0 0 10px; font-size: 1.35rem; line-height: 1.35; letter-spacing: -.02em; }
.post-excerpt { color: color-mix(in srgb, var(--text) 82%, var(--muted)); margin: 0 0 14px; }
.post-meta { display: flex; flex-wrap: wrap; gap: 9px; color: var(--muted); font-size: .84rem; }
.post-meta span + span::before { content: "·"; margin-right: 9px; }
.pagination { display: flex; justify-content: space-between; gap: 12px; padding-top: 34px; }
.pagination a, .pagination span {
  border: 1px solid var(--line);
  background: var(--panel);
  border-radius: 10px;
  padding: 8px 13px;
  font-size: .9rem;
}
.pagination span { opacity: .45; }
.article-header { margin-bottom: 34px; }
.article-header h1 { font-size: clamp(2rem, 6vw, 3.2rem); line-height: 1.14; letter-spacing: -.055em; margin: 0 0 15px; }
.prose { font-size: 1.02rem; overflow-wrap: anywhere; }
.prose h1, .prose h2, .prose h3 { line-height: 1.35; letter-spacing: -.025em; margin: 2em 0 .7em; }
.prose p { margin: 1.1em 0; }
.prose img, .prose video { display: block; max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem auto; }
.prose pre { overflow: auto; padding: 18px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); }
.prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em; }
.prose :not(pre) > code { padding: .15em .4em; border-radius: 5px; background: var(--accent-soft); }
.prose blockquote { margin: 1.5rem 0; padding: .1rem 0 .1rem 1.1rem; border-left: 3px solid var(--accent); color: var(--muted); }
.prose table { width: 100%; border-collapse: collapse; display: block; overflow-x: auto; }
.prose th, .prose td { border: 1px solid var(--line); padding: .55rem .7rem; }
.article-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 44px; }
.tag-pill { background: var(--accent-soft); color: var(--accent); border-radius: 999px; padding: 4px 10px; font-size: .82rem; }
.archive-stats { display: flex; gap: 26px; margin: 20px 0 42px; color: var(--muted); }
.archive-stats strong { color: var(--text); font-size: 1.8rem; display: block; }
.archive-year { margin-top: 34px; }
.archive-year h2 { font-size: 1.4rem; margin-bottom: 8px; }
.archive-list { list-style: none; padding: 0; margin: 0; }
.archive-list li { display: grid; grid-template-columns: 96px 1fr auto; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--line); }
.archive-list time, .archive-list small { color: var(--muted); font-size: .84rem; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 12px; }
.tag-card { border: 1px solid var(--line); background: var(--panel); border-radius: 12px; padding: 10px 14px; }
.tag-card small { color: var(--muted); margin-left: 6px; }
.links-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.link-card { border: 1px solid var(--line); background: var(--panel); border-radius: 14px; padding: 18px; display: flex; gap: 13px; min-height: 105px; }
.link-card img, .link-fallback { width: 42px; height: 42px; border-radius: 10px; flex: none; object-fit: cover; }
.link-fallback { display: grid; place-items: center; background: var(--accent-soft); color: var(--accent); font-weight: 700; }
.link-card strong { display: block; }
.link-card p { color: var(--muted); font-size: .84rem; line-height: 1.5; margin: 4px 0 0; }
.memo-summary { display: flex; justify-content: space-between; align-items: end; margin-bottom: 18px; color: var(--muted); }
.heatmap-wrap { border: 1px solid var(--line); border-radius: 14px; background: var(--panel); padding: 15px; overflow-x: auto; margin-bottom: 40px; }
.heatmap { display: grid; grid-template-rows: repeat(7, 11px); grid-auto-flow: column; grid-auto-columns: 11px; gap: 3px; min-width: max-content; }
.heat-cell { width: 11px; height: 11px; border-radius: 2px; background: var(--line); }
.heat-cell[data-level="1"] { background: color-mix(in srgb, var(--accent) 30%, var(--line)); }
.heat-cell[data-level="2"] { background: color-mix(in srgb, var(--accent) 52%, var(--line)); }
.heat-cell[data-level="3"] { background: color-mix(in srgb, var(--accent) 76%, var(--line)); }
.heat-cell[data-level="4"] { background: var(--accent); }
.memo-list { display: grid; gap: 18px; }
.memo-card { border: 1px solid var(--line); border-radius: 14px; background: var(--panel); padding: 20px; }
.memo-card .prose { font-size: .96rem; }
.memo-card .prose > :first-child { margin-top: 0; }
.memo-card .prose > :last-child { margin-bottom: 0; }
.memo-date { color: var(--muted); font-size: .82rem; margin-top: 13px; }
.site-footer { border-top: 1px solid var(--line); color: var(--muted); }
.footer-inner { min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: .85rem; }
.search-modal { position: fixed; inset: 0; display: none; z-index: 100; background: rgba(0,0,0,.38); backdrop-filter: blur(7px); padding: 8vh 18px 18px; }
.search-modal.open { display: block; }
.search-box { width: min(680px, 100%); margin: 0 auto; background: var(--panel); border: 1px solid var(--line); border-radius: 16px; box-shadow: var(--shadow); overflow: hidden; }
.search-input-row { display: flex; border-bottom: 1px solid var(--line); }
.search-input-row input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--text); padding: 18px; }
.search-input-row button { border: 0; border-left: 1px solid var(--line); background: transparent; color: var(--muted); padding: 0 18px; cursor: pointer; }
.search-results { max-height: 55vh; overflow: auto; padding: 8px; }
.search-result { display: block; padding: 12px; border-radius: 10px; }
.search-result:hover { background: var(--accent-soft); }
.search-result strong { display: block; }
.search-result span { color: var(--muted); font-size: .84rem; }
.empty-state { padding: 38px 0; color: var(--muted); text-align: center; }
.error-page { text-align: center; padding: 12vh 0; }
.error-page strong { display: block; font-size: clamp(4rem, 14vw, 8rem); letter-spacing: -.08em; line-height: 1; }
.error-page p { color: var(--muted); }
@media (max-width: 760px) {
  .header-inner { min-height: 62px; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; }
  .brand { margin-right: 0; }
  .site-nav { display: none; }
  .mobile-nav {
    position: fixed;
    top: 62px;
    left: 0;
    right: auto;
    z-index: 29;
    display: none;
    width: 100vw;
    max-width: none;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    padding: 14px 18px 18px;
    margin: 0;
    overflow: visible;
    background: var(--panel);
    border-bottom: 1px solid var(--line);
    box-shadow: var(--shadow);
  }
  .mobile-nav.open { display: flex; }
  .mobile-nav a {
    display: block;
    width: 100%;
    padding: 9px 12px;
    border-radius: 8px;
  }
  .mobile-nav a.active, .mobile-nav a:hover { background: var(--accent-soft); }
  .menu-button { display: grid !important; order: 3; }
  .site-main { padding-top: 38px; }
  .links-grid { grid-template-columns: 1fr; }
  .archive-list li { grid-template-columns: 86px 1fr; }
  .archive-list small { display: none; }
  .footer-inner { padding-block: 22px; display: block; }
  body.mobile-nav-open { overflow: hidden; }
}
@media (min-width: 761px) { .menu-button { display: none; } }
`
