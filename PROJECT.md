# worker-blog 项目说明

## 项目定位

`worker-blog` 是一个面向 Cloudflare 平台的服务端渲染博客系统。应用代码、前后台页面和主题组件使用 TypeScript 与 Hono JSX；D1 保存结构化数据；R2 保存上传文件；静态主题资源由 Workers Static Assets 发布。

项目当前采用完整 `schema.sql` 管理数据库结构，不维护 migrations。

## 运行时绑定

```text
BLOG_DB        Cloudflare D1
BLOG_R2        Cloudflare R2
ADMIN_NAME     Worker Secret
ADMIN_PSWD     Worker Secret
MAX_UPLOAD_MB  普通环境变量
```

## 核心目录

```text
.github/workflows/deploy.yml   手动触发的生产部署工作流
src/index.tsx                  Hono 应用入口、R2 文件读取、404 与错误处理
src/routes/public.tsx          前台路由和数据查询
src/routes/admin.tsx           后台路由、上传、导入导出和管理操作
src/theme.ts                   主题名称映射、默认主题、资源路径
src/lib/                       数据库、缓存、认证、设置、导航、Markdown 等
src/views/admin/               后台 JSX 页面
src/views/themes/theme.ts      主题组件注册表
src/views/themes/<theme>/      各主题 JSX 组件
static/admin/                  后台 CSS 与 JavaScript
static/<theme>/                主题 CSS、JavaScript 与图片
schema.sql                     当前数据库结构
seed.sql                       本地开发模拟数据
```

## 前台主题系统

### 主题选择

1. `getOptions()` 从 `options_cache` 或 D1 读取设置。
2. `site_theme` 交给 `normalizeThemeName()` 校验。
3. 缺失、无效或数据库读取失败时回退到 `kehua`。
4. `getThemeComponents()` 从 `src/views/themes/theme.ts` 取得对应 JSX 组件集合。
5. 主题 `Base` 通过 `themeAssetPath()` 加载 `static/<theme>/` 下的资源。

### 主题组件约定

每个主题必须提供：

```text
404
about
archives
base
categories
category
index
links
memos
page
post
tag
tags
partials/comments
partials/footer
partials/header
partials/pagination
partials/post-card
```

`theme.ts` 中的三个主题对象必须保持相同组件键，使路由层不依赖具体主题实现。

### 新主题注册

新增主题需要同时完成：

1. 创建 `src/views/themes/<theme>/`。
2. 创建 `static/<theme>/`。
3. 在 `src/theme.ts` 的 `THEME_NAMES` 注册文件夹名与显示名。
4. 在 `src/views/themes/theme.ts` 导入并注册组件。
5. 确认主题 `Base` 使用传入的当前主题名生成资源路径。
6. 通过 TypeScript 检查并测试所有前台路由。

## 后台资源

后台 JSX 位于 `src/views/admin/`，共享静态文件统一位于：

```text
static/admin/admin.css
static/admin/admin.js
```

页面引用路径为：

```text
/admin/admin.css
/admin/admin.js
```

静态文件命中时由 Workers Static Assets 直接返回；其他 `/admin/*` 请求进入 Worker 路由。

## 数据模型

- `blog_contents`：`post`、`page`、`memo`、`atta`。
- `blog_metas`：`category`、`tag`。
- `blog_relationships`：内容和分类、标签的多对多关系。
- `blog_comments`：文章和页面评论。
- `blog_links`：友链。
- `blog_options`：站点、主题、导航、分页、附件模板等设置。
- `blog_cookies`：后台登录会话。

附件使用 `blog_contents.parent` 关联所属文章、页面或闪念，文件元数据保存在附件记录的 `text` JSON 中。数据库只保存相对文件路径，公开地址在渲染时根据文件 CDN 设置生成。

## 缓存

### `options_cache`

缓存规范化后的站点设置，减少前后台公共页面重复读取 `blog_options`。保存设置、导航、附件模板或导入数据后清理缓存。

### `sessions_cache`

以登录令牌摘要为缓存键保存后台会话结果，减少每次后台请求对 `blog_cookies` 的读取。登录、续期、退出和过期时同步更新。

Cache API 不可用、缓存无效或缓存未命中时均回退到 D1。

## 静态资源与附件

`wrangler.toml` 的 `[assets]` 指向 `./static`。主题静态资源和后台资源不经过应用路由即可返回；动态页面在没有同名静态文件时进入 Worker。

R2 绑定名固定为 `BLOG_R2`。上传记录保存 `/年/月/UUID.扩展名` 形式的相对路径：

- 未配置文件 CDN：`/uploads` + 相对路径。
- 已配置文件 CDN：CDN 域名 + 相对路径。

## GitHub Actions 部署

`.github/workflows/deploy.yml` 使用 `workflow_dispatch` 手动触发。

### Secrets

```text
CF_TOKEN
ADMIN_NAME
ADMIN_PSWD
```

### Variables

```text
WORKER_NAME
WORKER_DOMAIN       可选
MAX_UPLOAD_MB
D1_NAME
D1_ID
R2_NAME
```

工作流流程：

1. `npm ci`。
2. `npm run typecheck`。
3. 校验必需的 Secrets 和 Variables。
4. 动态生成只用于当前 CI 任务的 `wrangler.toml`。
5. 使用 `schema.sql` 初始化或补全远程 D1。
6. 将 `ADMIN_NAME`、`ADMIN_PSWD` 写入 Worker Secrets。
7. 部署 Worker、Static Assets，并绑定 D1 与 R2。

`WORKER_DOMAIN` 为空时开启 `workers.dev` 和 Preview URL；配置后关闭二者并使用 Cloudflare Custom Domain。工作流不会自动执行 `seed.sql`。

## 开发与发布约束

- 数据库结构变化直接修改 `schema.sql`。
- 本地结构变化后删除 `.wrangler/` 并重新初始化。
- `seed.sql` 仅用于开发模拟数据。
- README 和 PROJECT 描述当前实现，不记录版本历史。
- 发布前至少执行 TypeScript 检查、JavaScript 语法检查、SQLite Schema/Seed 检查和压缩包完整性检查。
