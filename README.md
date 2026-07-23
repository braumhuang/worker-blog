# worker-blog

`worker-blog` 是一个运行在 Cloudflare Workers 上的轻量个人博客，使用 Hono、Hono JSX、D1、R2 和 Workers Cache API 构建。

系统提供文章、页面、闪念、评论、分类、标签、附件、附件模板、友链、搜索、Atom 订阅、响应式前台和内容管理后台。正文使用 Markdown。公开内容只有在 `status = publish` 且当前时间不早于 `released` 时才会显示。

详细的数据结构、缓存策略、路由和模块说明见 [PROJECT.md](./PROJECT.md)。

## 本地运行

环境要求：Node.js 22 或更高版本、npm、Cloudflare Wrangler。

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:schema:local
npm run db:seed:local
npm run dev
```

访问地址：

- 前台：`http://localhost:8787/`
- 后台：`http://localhost:8787/admin`

管理员账号来自 `.dev.vars` 或 `wrangler.toml` 中的 `ADMIN_NAME` 和 `ADMIN_PSWD`。

项目当前直接维护完整 `schema.sql`，不使用 migrations。数据库结构变化时，删除项目中的 `.wrangler` 目录，再重新执行数据库结构和 Seed 命令。

## 部署

创建 D1 数据库并将数据库 ID 写入 `wrangler.toml`：

```bash
npx wrangler d1 create worker-blog
```

创建 R2 Bucket：

```bash
npx wrangler r2 bucket create worker-blog-assets
```

初始化远程数据库并部署：

```bash
npm run db:schema:remote
npm run deploy
```

`seed.sql` 会清空业务表，只在需要演示数据时执行：

```bash
npm run db:seed:remote
```

## 缓存

项目使用两个 Workers Cache API 命名缓存，不需要在 `wrangler.toml` 中增加绑定：

- `options_cache`：缓存合并并规范化后的 `blog_options`，有效期最多 5 分钟。读取设置时优先命中缓存；后台保存设置或导入数据后立即删除当前节点的设置缓存。
- `sessions_cache`：缓存后台登录会话，有效期最多 5 分钟且不会超过会话本身的过期时间。缓存键使用会话令牌的 SHA-256 摘要，不把原始令牌写入缓存 URL。登录、续期、退出和过期处理会同步维护缓存。

D1 始终是设置和会话的最终数据来源。缓存未命中、不可用或内容无效时会自动读取 D1。

## JSX 与静态资源

前台页面拆分在 `src/views/public/`，包括基础布局、头部、文章列表、文章详情、闪念、归档、分类、标签、友链、关于、页面和页脚。

后台页面拆分在 `src/views/admin/`，包括登录、面板、导航、内容、分类标签、附件、附件模板、评论、友链和系统设置。

前后台 CSS、JavaScript 使用静态文件：

```text
static/public.css
static/public.js
static/admin.css
static/admin.js
```

## 内容类型

`blog_contents.type` 支持：

- `post`：文章，进入首页、归档、分类、标签、搜索和 Atom 订阅。
- `page`：页面，不进入文章列表，通过 `/post/:slug` 访问，并使用页面或关于模板。
- `memo`：闪念，没有独立详情页。
- `atta`：附件，通过 `parent` 关联文章、页面或闪念。

文章编辑页可以在“文章”和“页面”之间切换类型。创建时间只读，发布时间可修改，修改时间由代码更新。

## 导航和页面模板

后台导航分成“自带菜单”和“新增菜单”。自带菜单不能删除，可以修改名称、显示状态和次序；新增菜单可以修改名称、页面 URL、显示状态、次序和模板。

新增菜单模板包括：

- `page`：只渲染对应内容的 Markdown 正文。
- `about`：渲染头像、社交资料和正文。

可见菜单超过 8 个时，前 7 个直接显示，其余项目放入“更多”菜单。

## 附件和 CDN

上传文件按年月和 UUID 生成 R2 对象 Key：

```text
YYYY/MM/UUID.扩展名
```

数据库保存相对路径：

```text
/YYYY/MM/UUID.扩展名
```

“文件 CDN 域名”为空时，页面使用 `/uploads` 加相对路径，由 Worker 读取 R2；配置 CDN 域名后，页面使用 CDN 域名加相对路径。

附件模板保存在 `blog_options.attachment_templates`，默认提供图片、视频和文件模板。编辑器插入附件时替换 `FILE_NAME` 和 `RELATIVE_PATH`。

## 数据导入与导出

后台系统设置可以导出和导入当前数据格式的 JSON。导出包含：

- `blog_contents`
- `blog_metas`
- `blog_relationships`
- `blog_options`
- `blog_links`
- `blog_comments`

`blog_cookies` 和 R2 文件本体不导出。导入只接受当前导出版本和当前表字段；自增主键表使用普通 `INSERT`，非自增表使用 `INSERT ... ON CONFLICT DO UPDATE`。

## Seed 数据

`seed.sql` 会清空业务表并生成：

- 文章 300 条
- 页面 1 条
- 闪念 90 条
- 评论 600 条
- 分类 3 个
- 标签 10 个
- 演示友链、导航、附件模板和系统设置

文章和页面正文均为 Markdown。批量数据使用分段 `INSERT`，避免单条 SQL 过大。

## 常用命令

```bash
npm run dev
npm run typecheck
npm run cf-typegen
npm run db:schema:local
npm run db:seed:local
npm run db:schema:remote
npm run db:seed:remote
npm run deploy
```
