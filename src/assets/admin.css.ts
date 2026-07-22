export const adminCss = String.raw`
:root {
  --admin-bg: #f6f6f3;
  --admin-surface: #ffffff;
  --admin-text: #444444;
  --admin-muted: #999999;
  --admin-link: #467b96;
  --admin-link-hover: #499bc3;
  --admin-primary: #467b96;
  --admin-primary-hover: #3c6a81;
  --admin-line: #d9d9d6;
  --admin-line-light: #f0f0ec;
  --admin-soft: #e9e9e6;
  --admin-danger: #b94a48;
  --admin-topbar: #292d33;
  --admin-topbar-hover: #202328;
  --admin-topbar-line: #383d45;
  --admin-width: 1160px;
}

* { box-sizing: border-box; }
html { min-height: 100%; }
body {
  min-height: 100vh;
  margin: 0;
  color: var(--admin-text);
  background: var(--admin-bg);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--admin-link); text-decoration: none; }
a:hover { color: var(--admin-link-hover); text-decoration: underline; }
button, input, textarea, select { font: inherit; }
button { color: inherit; }
hr { height: 1px; margin: 14px 0; border: 0; background: var(--admin-line-light); }

/* Typecho-style top navigation */
.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 200;
  min-height: 36px;
  padding: 0 10px;
  background: var(--admin-topbar);
}
.admin-topbar-inner {
  width: min(var(--admin-width), 100%);
  min-height: 36px;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
}
.admin-desktop-nav { display: flex; align-items: stretch; }
.admin-desktop-nav a,
.admin-user a {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 0 20px;
  color: #bbbbbb;
  border-right: 1px solid var(--admin-topbar-line);
  white-space: nowrap;
}
.admin-desktop-nav a:first-child { border-left: 1px solid var(--admin-topbar-line); }
.admin-desktop-nav a:hover,
.admin-desktop-nav a.active,
.admin-user a:hover {
  color: #ffffff;
  background: var(--admin-topbar-hover);
  text-decoration: none;
}
.admin-desktop-nav a.active { font-weight: 600; }
.admin-user { margin-left: auto; display: flex; }
.admin-user a { padding-inline: 14px; border: 0; }
.admin-mobile-menu { display: none; margin-left: auto; }
.admin-mobile-menu summary {
  list-style: none;
  min-height: 36px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: #bbbbbb;
  cursor: pointer;
  user-select: none;
}
.admin-mobile-menu summary::-webkit-details-marker { display: none; }
.admin-mobile-menu summary::after { content: "⌄"; margin-left: 7px; font-size: 11px; }
.admin-mobile-menu[open] summary { color: #fff; background: var(--admin-topbar-hover); }
.admin-mobile-menu[open] summary::after { transform: rotate(180deg); }
.admin-mobile-panel {
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  padding: 8px 10px 12px;
  background: var(--admin-topbar-hover);
  box-shadow: 0 6px 16px rgba(0,0,0,.24);
}
.admin-mobile-panel nav { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); }
.admin-mobile-panel nav a,
.admin-mobile-user a {
  display: block;
  padding: 9px 10px;
  color: #bbbbbb;
  border-bottom: 1px solid var(--admin-topbar-line);
}
.admin-mobile-panel nav a.active,
.admin-mobile-panel nav a:hover,
.admin-mobile-user a:hover { color: #fff; text-decoration: none; }
.admin-mobile-user { display: grid; grid-template-columns: 1fr 1fr; }
.admin-mobile-user a:last-child { text-align: right; }

.admin-shell {
  width: min(var(--admin-width), calc(100% - 40px));
  margin: 0 auto;
}
.admin-heading {
  width: 100%;
  min-height: 48px;
  margin: 25px 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.admin-heading-copy { min-width: 0; }
.admin-heading h1 {
  margin: 0;
  color: #333;
  font-size: 18px;
  line-height: 1.35;
  font-weight: 600;
}
.admin-heading p {
  margin: 4px 0 0;
  color: var(--admin-muted);
  font-size: 13px;
}
.admin-heading-actions { flex: 0 0 auto; }

/* controls */
.button {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 12px;
  border: 0;
  border-radius: 2px;
  color: #666;
  background: var(--admin-soft);
  cursor: pointer;
  vertical-align: middle;
  line-height: 32px;
}
a.button:hover,
.button:hover { color: #555; background: #dbdbd6; text-decoration: none; }
.button:active { background: #d6d6d0; }
.button.primary { color: #fff; background: var(--admin-primary); }
.button.primary:hover { color: #fff; background: var(--admin-primary-hover); }
.button.danger { color: var(--admin-danger); background: transparent; }
.button.danger:hover { color: #fff; background: var(--admin-danger); }
.button.small { min-height: 25px; height: 25px; padding: 0 9px; font-size: 12px; line-height: 25px; }

.field { min-width: 0; }
.field label,
.field > span {
  display: block;
  margin: 0 0 6px;
  color: #555;
  font-weight: 600;
}
.field label:has(input[type="checkbox"]) { display: inline-flex; align-items: center; gap: 4px; margin: 0; font-weight: 400; }
.input,
.textarea,
.select {
  width: 100%;
  min-height: 36px;
  padding: 7px 9px;
  color: var(--admin-text);
  background: #fff;
  border: 1px solid var(--admin-line);
  border-radius: 2px;
  outline: 0;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.input:focus,
.textarea:focus,
.select:focus {
  border-color: #a5cadc;
  box-shadow: 0 0 0 2px rgba(70,123,150,.11);
}
.input::placeholder,
.textarea::placeholder { color: #aaa; }
.textarea { min-height: 112px; resize: vertical; line-height: 1.6; }
.select { padding-right: 28px; }
input[type="checkbox"], input[type="radio"] { margin: 0 3px 0 0; vertical-align: middle; }
.muted { color: var(--admin-muted); }
.field small.muted { display: block; margin-top: 5px; line-height: 1.5; }

.notice {
  margin: 0 0 14px;
  padding: 8px 10px;
  color: #264409;
  background: #e6efc2;
  border: 0;
  border-radius: 2px;
}
.notice.error { color: #8a1f11; background: #fbe3e4; }

/* white content blocks */
.panel,
.side-box {
  color: var(--admin-text);
  background: var(--admin-surface);
  border: 0;
  border-radius: 2px;
  box-shadow: none;
}
.panel-body { padding: 20px; }
.panel-body > h3:first-child { margin-top: 0; }
.panel-body h3 { font-size: 15px; }

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 20px;
  align-items: start;
}
.main-form { min-width: 0; display: grid; gap: 12px; }
.side-form { min-width: 0; display: grid; gap: 14px; }
.side-box { border: 1px solid var(--admin-line); }
.side-box h3 {
  margin: 0;
  padding: 10px 14px;
  color: #444;
  background: #fafafa;
  border-bottom: 1px solid var(--admin-line);
  font-size: 14px;
  line-height: 1.3;
  font-weight: 600;
}
.side-box-body { padding: 13px 14px 14px; }
.side-box-body > .field + .field { margin-top: 11px; }
.side-box-body > .button.primary { margin-top: 1px; }
.cover-url-field { margin-bottom: 1px; }

/* Markdown editor */
.editor-panel {
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--admin-line);
  border-radius: 2px;
}
.md-toolbar {
  min-height: 43px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 7px 10px;
  background: #fff;
  border-bottom: 1px solid var(--admin-line-light);
}
.md-toolbar button {
  min-width: 29px;
  height: 28px;
  padding: 0 5px;
  color: #555;
  background: transparent;
  border: 0;
  border-radius: 2px;
  cursor: pointer;
}
.md-toolbar button:hover { background: var(--admin-soft); }
.editor-workspace { min-height: 520px; display: grid; grid-template-columns: 1fr; }
.editor-workspace.preview-visible { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
.editor-textarea {
  width: 100%;
  min-height: 520px;
  padding: 14px;
  color: #444;
  background: #fff;
  border: 0;
  outline: 0;
  resize: vertical;
  font: 14px/1.65 Menlo, Monaco, Consolas, "Courier New", monospace;
}
.editor-preview {
  display: none;
  min-width: 0;
  padding: 18px;
  overflow: auto;
  background: var(--admin-bg);
  border-left: 1px solid var(--admin-line-light);
}
.preview-visible .editor-preview { display: block; }
.editor-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 0;
  background: #fff;
}
.editor-fullscreen .md-toolbar { height: 53px; padding: 13px 20px; }
.editor-fullscreen .editor-workspace,
.editor-fullscreen .editor-textarea { min-height: calc(100vh - 53px); }
.editor-fullscreen .editor-textarea { padding: 20px; }
.editor-fullscreen .editor-preview { padding: 20px; }
.prose-preview img, .prose-preview video { max-width: 100%; height: auto; }
.prose-preview pre { overflow: auto; padding: 12px; background: #ddd; }
.prose-preview blockquote { margin: 1em 1.5em; padding-left: 1.5em; color: #777; border-left: 4px solid var(--admin-soft); }

/* taxonomy / attachments */
.checkbox-list { display: grid; gap: 8px; max-height: 190px; overflow: auto; }
.checkbox-list label { font-weight: 400; }
.tags-input {
  min-height: 36px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  padding: 4px;
  background: #fff;
  border: 1px solid var(--admin-line);
  border-radius: 2px;
}
.tag-chip {
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 7px;
  color: #555;
  background: #f3f3f0;
  font-size: 13px;
}
.tag-chip button { padding: 0; color: #aaa; background: transparent; border: 0; cursor: pointer; }
.tags-input input[type="text"] { min-width: 90px; flex: 1; padding: 4px; border: 0; outline: 0; }
.attachment-list { display: grid; gap: 7px; }
.attachment-item {
  min-width: 0;
  display: grid;
  grid-template-columns: 40px minmax(0,1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 7px;
  background: #fff;
  border: 1px solid var(--admin-line-light);
}
.attachment-thumb { width: 40px; height: 40px; display: grid; place-items: center; overflow: hidden; color: #999; background: var(--admin-bg); font-size: 10px; }
.attachment-thumb img { width: 100%; height: 100%; object-fit: cover; }
.attachment-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.progress { display: none; margin-top: 7px; color: var(--admin-muted); font-size: 13px; }

/* tables and indexes */
.admin-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border: 30px solid #fff;
}
.admin-table th {
  padding: 0 10px 10px;
  color: #666;
  border-bottom: 1px solid var(--admin-line-light);
  text-align: left;
  font-weight: 600;
}
.admin-table td {
  padding: 10px;
  border-top: 1px solid var(--admin-line-light);
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}
.admin-table tbody tr:first-child td { border-top: 0; }
.admin-table tbody tr:hover { background: var(--admin-bg); }
.admin-table .title-cell strong { display: block; }
.row-actions { min-height: 20px; display: flex; align-items: center; gap: 9px; margin-top: 3px; opacity: 0; font-size: 12px; }
tr:hover .row-actions { opacity: 1; }
.inline-form { display: inline; margin: 0; }
.inline-form .button { min-height: auto; height: auto; padding: 0; line-height: inherit; }
.inline-form .button.danger:hover { color: #9f3e3d; background: transparent; }
.status { margin-left: 2px; color: var(--admin-muted); font-size: 12px; font-style: normal; }
.status.publish { color: #397653; }
.status.hidden { color: var(--admin-danger); }
.toolbar-line { margin: 1em 0; }
.filter-tabs { display: flex; align-items: center; flex-wrap: wrap; gap: 0; font-size: 13px; }
.filter-tabs a {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: -1px;
  padding: 0 15px;
  color: #666;
  background: transparent;
  border: 1px solid var(--admin-line);
}
.filter-tabs a:first-child { border-radius: 2px 0 0 2px; }
.filter-tabs a:last-child { border-radius: 0 2px 2px 0; }
.filter-tabs a:hover,
.filter-tabs a.active { color: #555; background: var(--admin-soft); text-decoration: none; }
.pagination-admin { display: flex; align-items: center; justify-content: flex-end; gap: 5px; margin: 14px 0 0; }
.pagination-admin a,
.pagination-admin span { min-width: 30px; height: 28px; display: grid; place-items: center; padding: 0 9px; border-radius: 2px; }
.pagination-admin a:hover { color: #444; background: var(--admin-soft); text-decoration: none; }
.pagination-admin span { color: #444; background: var(--admin-soft); }

/* dashboard, settings and split views */
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
.stat { padding: 18px 20px; background: var(--admin-soft); }
.stat strong { display: block; color: #444; font: 30px/1.2 Georgia, serif; font-weight: 400; }
.stat span { color: var(--admin-muted); }
.dashboard-columns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-top: 20px; }
.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.meta-columns { grid-template-columns: minmax(0,1.55fr) minmax(280px,.75fr); }
.meta-list-panel, .meta-form-panel { min-width: 0; }
.settings-inline { display: grid; grid-template-columns: minmax(180px,.75fr) minmax(300px,1.25fr); gap: 16px; }
.favicon-setting-row { display: grid; grid-template-columns: minmax(150px,1fr) 42px 42px; gap: 8px; align-items: center; }
.favicon-color-text { min-width: 0; }
.favicon-color-picker { width: 42px; height: 36px; padding: 2px; background: #fff; border: 1px solid var(--admin-line); border-radius: 2px; cursor: pointer; }
.favicon-preview { --favicon-color: #999999; width: 42px; height: 42px; display: grid; place-items: center; overflow: hidden; color: #fff; background: var(--favicon-color); border-radius: 9px; font-size: 20px; line-height: 1; font-weight: 700; }
.empty-state { padding: 30px; color: var(--admin-muted); text-align: center; }

/* login */
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 30px 20px 100px;
  background: var(--admin-bg);
}
.login-box {
  width: min(280px, 100%);
  text-align: center;
}
.login-box h1 { margin: 0 0 1em; color: #444; font-size: 24px; font-weight: 400; }
.login-box form { display: grid; gap: 13px; text-align: left; }
.login-box .button { width: 100%; }
.login-box .notice { text-align: left; }

.admin-footer { padding: 4em 20px 3em; color: var(--admin-muted); text-align: center; line-height: 1.8; }
.admin-footer p { margin: 0; }

@media (max-width: 991px) {
  .admin-shell { width: min(952px, calc(100% - 28px)); }
  .admin-desktop-nav, .admin-user { display: none; }
  .admin-mobile-menu { display: block; }
  .form-grid { grid-template-columns: minmax(0,1fr) 250px; gap: 14px; }
  .two-columns, .dashboard-columns, .settings-inline { grid-template-columns: 1fr; }
  .meta-columns { grid-template-columns: 1fr; }
}

@media (max-width: 767px) {
  .admin-shell { width: calc(100% - 20px); }
  .admin-heading { align-items: flex-start; }
  .form-grid { grid-template-columns: 1fr; }
  .side-form { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .side-form .side-box:first-child { grid-column: 1 / -1; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .editor-workspace.preview-visible { grid-template-columns: 1fr; }
  .editor-preview { border-left: 0; border-top: 1px solid var(--admin-line-light); }
  .admin-table { border-width: 10px; }
  .admin-table th { padding: 0 5px 5px; }
  .admin-table td { padding: 7px 5px; }
}

@media (max-width: 575px) {
  .admin-topbar { padding: 0; }
  .admin-shell { width: calc(100% - 16px); }
  .admin-heading { min-height: 0; margin-top: 18px; flex-direction: column; gap: 10px; }
  .admin-heading-actions { width: 100%; }
  .admin-heading-actions .button { width: 100%; }
  .side-form { grid-template-columns: 1fr; }
  .side-form .side-box:first-child { grid-column: auto; }
  .stats-grid { grid-template-columns: 1fr; }
  .favicon-setting-row { grid-template-columns: minmax(0,1fr) 42px; }
  .favicon-preview { display: none; }
  .admin-mobile-panel nav { grid-template-columns: 1fr; }
  .panel:has(.admin-table) { overflow-x: auto; }
  .admin-table { min-width: 620px; }
  .row-actions { opacity: 1; }
}
`
