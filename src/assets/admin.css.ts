export const adminCss = String.raw`
:root { --blue:#467b96; --blue-dark:#345f75; --line:#d9d9d9; --bg:#f5f5f5; --text:#333; --muted:#888; --danger:#b94a48; }
* { box-sizing: border-box; }
body { margin:0; color:var(--text); background:var(--bg); font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; }
a { color:var(--blue); text-decoration:none; }
a:hover { color:var(--blue-dark); }
button,input,textarea,select { font:inherit; }
.admin-topbar { position:relative; height:48px; background:#20252a; color:#d8dde0; display:flex; align-items:center; padding:0 22px; gap:24px; }
.admin-desktop-nav { display:flex; gap:18px; }
.admin-desktop-nav a { color:#c7ced2; }
.admin-desktop-nav a:hover { color:#fff; }
.admin-topbar .admin-user { margin-left:auto; display:flex; gap:14px; }
.admin-mobile-menu { display:none; margin-left:auto; }
.admin-mobile-menu summary {
  list-style:none;
  min-height:32px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:3px 11px;
  border:1px solid #596168;
  border-radius:3px;
  color:#fff;
  cursor:pointer;
  user-select:none;
}
.admin-mobile-menu summary::-webkit-details-marker { display:none; }
.admin-mobile-menu summary::after { content:"⌄"; margin-left:6px; font-size:12px; }
.admin-mobile-menu[open] summary::after { transform:rotate(180deg); }
.admin-mobile-panel {
  position:absolute;
  top:48px;
  left:0;
  right:0;
  z-index:100;
  display:grid;
  gap:0;
  padding:8px 16px 14px;
  background:#20252a;
  border-top:1px solid #343b40;
  box-shadow:0 8px 20px rgba(0,0,0,.22);
}
.admin-mobile-panel nav { display:grid; grid-template-columns:1fr; gap:0; }
.admin-mobile-panel nav a,
.admin-mobile-user a { display:block; padding:9px 8px; color:#d8dde0; border-bottom:1px solid #343b40; }
.admin-mobile-panel nav a:hover,
.admin-mobile-user a:hover { color:#fff; background:#292f34; }
.admin-mobile-user { display:grid; grid-template-columns:1fr 1fr; }
.admin-mobile-user a:last-child { text-align:right; }
.admin-shell { width:min(1180px,calc(100% - 32px)); margin:28px auto 70px; }
.admin-heading { display:flex; align-items:end; justify-content:space-between; gap:16px; margin-bottom:18px; }
.admin-heading h1 { margin:0; font-size:24px; font-weight:500; }
.admin-heading p { margin:3px 0 0; color:var(--muted); }
.button { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid #bbb; border-radius:3px; background:#fff; color:#444; padding:6px 12px; cursor:pointer; min-height:34px; }
.button:hover { border-color:#999; color:#222; }
.button.primary { border-color:var(--blue-dark); background:var(--blue); color:#fff; }
.button.danger { border-color:#c66; color:var(--danger); }
.button.small { min-height:28px; padding:3px 8px; font-size:12px; }
.panel { background:#fff; border:1px solid var(--line); border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,.03); }
.panel-body { padding:18px; }
.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.stat { padding:20px; }
.stat strong { display:block; font-size:30px; font-weight:400; }
.stat span { color:var(--muted); }
.admin-table { width:100%; border-collapse:collapse; }
.admin-table th,.admin-table td { padding:10px 12px; border-bottom:1px solid #eee; text-align:left; vertical-align:top; }
.admin-table th { background:#fafafa; color:#666; font-weight:600; white-space:nowrap; }
.admin-table tr:last-child td { border-bottom:0; }
.admin-table .title-cell strong { display:block; }
.row-actions { visibility:hidden; display:flex; gap:8px; font-size:12px; margin-top:3px; }
tr:hover .row-actions { visibility:visible; }
.muted { color:var(--muted); }
.status { border-radius:999px; padding:2px 7px; font-size:11px; background:#eee; }
.status.publish { background:#e1f1e7; color:#397653; }
.status.hidden { background:#f8e7e7; color:#9a4545; }
.toolbar-line { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.filter-tabs { display:flex; gap:12px; align-items:center; }
.filter-tabs a.active { color:#222; font-weight:600; }
.form-grid { display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:18px; align-items:start; }
.main-form,.side-form { display:grid; gap:14px; }
.field label,.field > span { display:block; margin-bottom:5px; color:#555; font-weight:600; }
.input,.textarea,.select { width:100%; border:1px solid #c8c8c8; border-radius:3px; background:#fff; color:#333; padding:8px 10px; outline:none; }
.input:focus,.textarea:focus,.select:focus { border-color:var(--blue); box-shadow:0 0 0 2px rgba(70,123,150,.12); }
.textarea { resize:vertical; min-height:110px; }
.editor-panel { background:#fff; border:1px solid #c8c8c8; border-radius:3px; overflow:hidden; }
.md-toolbar { display:flex; flex-wrap:wrap; gap:2px; border-bottom:1px solid #ddd; background:#fafafa; padding:5px; }
.md-toolbar button { width:31px; height:29px; border:1px solid transparent; background:transparent; border-radius:2px; cursor:pointer; color:#555; }
.md-toolbar button:hover { border-color:#bbb; background:#fff; }
.editor-workspace { display:grid; grid-template-columns:1fr; min-height:520px; }
.editor-workspace.preview-visible { grid-template-columns:1fr 1fr; }
.editor-textarea { width:100%; min-height:520px; border:0; outline:0; resize:vertical; padding:16px; font:14px/1.7 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.editor-preview { display:none; border-left:1px solid #ddd; padding:18px; overflow:auto; background:#fff; }
.preview-visible .editor-preview { display:block; }
.editor-fullscreen { position:fixed; z-index:1000; inset:0; background:#fff; padding:12px; overflow:auto; }
.editor-fullscreen .editor-workspace,.editor-fullscreen .editor-textarea { min-height:calc(100vh - 62px); }
.side-box { background:#fff; border:1px solid var(--line); border-radius:3px; }
.side-box h3 { font-size:14px; margin:0; padding:9px 12px; background:#fafafa; border-bottom:1px solid var(--line); }
.side-box-body { padding:12px; }
.checkbox-list { display:grid; gap:7px; max-height:180px; overflow:auto; }
.tags-input { display:flex; flex-wrap:wrap; gap:5px; border:1px solid #c8c8c8; padding:6px; min-height:39px; background:#fff; }
.tag-chip { display:inline-flex; gap:5px; align-items:center; background:#eaf1f5; color:#376477; border-radius:2px; padding:2px 6px; }
.tag-chip button { border:0; background:transparent; cursor:pointer; color:inherit; padding:0; }
.tags-input input { flex:1; min-width:100px; border:0; outline:0; }
.attachment-list { display:grid; gap:8px; }
.attachment-item { border:1px solid #e3e3e3; padding:8px; display:grid; grid-template-columns:44px minmax(0,1fr) auto; gap:8px; align-items:center; }
.attachment-thumb { width:44px; height:44px; background:#eee; object-fit:cover; display:grid; place-items:center; overflow:hidden; }
.attachment-thumb img { width:100%; height:100%; object-fit:cover; }
.attachment-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.progress { display:none; color:var(--muted); margin-top:6px; }
.notice { border-left:4px solid var(--blue); background:#eef6fa; padding:9px 12px; margin-bottom:14px; }
.notice.error { border-color:var(--danger); background:#faeeee; }
.login-page { min-height:100vh; display:grid; place-items:center; padding:20px; background:#f0f2f3; }
.login-box { width:min(360px,100%); background:#fff; border:1px solid #d7d7d7; padding:28px; box-shadow:0 8px 30px rgba(0,0,0,.08); }
.login-box h1 { font-weight:400; text-align:center; margin:0 0 22px; }
.login-box form { display:grid; gap:14px; }
.login-box .button { width:100%; }
.inline-form { display:inline; }
.two-columns { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
.meta-columns { grid-template-columns:minmax(0,1.6fr) minmax(280px,.8fr); }
.meta-list-panel { min-width:0; }
.meta-form-panel { min-width:0; }
.pagination-admin { display:flex; gap:6px; margin-top:14px; }
.pagination-admin a,.pagination-admin span { min-width:32px; text-align:center; padding:5px 8px; border:1px solid #ccc; background:#fff; }
.pagination-admin span { background:#eee; }
.dashboard-columns { display:grid; grid-template-columns:1.4fr 1fr; gap:18px; margin-top:18px; }
.prose-preview img,.prose-preview video { max-width:100%; height:auto; }
.prose-preview pre { overflow:auto; background:#f5f5f5; padding:12px; }
@media (max-width:850px) {
  .admin-topbar { padding-inline:16px; gap:12px; }
  .admin-desktop-nav,.admin-user { display:none !important; }
  .admin-mobile-menu { display:block; }
  .admin-shell { width:min(1180px,calc(100% - 24px)); margin-top:20px; }
  .admin-heading { align-items:flex-start; flex-direction:column; }
  .form-grid,.two-columns,.dashboard-columns { grid-template-columns:1fr; }
  .stats-grid { grid-template-columns:1fr 1fr; }
  .editor-workspace.preview-visible { grid-template-columns:1fr; }
  .editor-preview { border-left:0; border-top:1px solid #ddd; }
}
@media (max-width:520px) {
  .stats-grid { grid-template-columns:1fr; }
  .admin-table { min-width:680px; }
  .panel:has(.admin-table) { overflow-x:auto; }
}
`
