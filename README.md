# worker-blog

`worker-blog` 是一个运行在 Cloudflare Workers 上的轻量个人博客，使用 Hono、Hono JSX、D1 和 R2 构建。

系统提供文章、闪念、评论、分类、标签、附件、友链、搜索、响应式前台、可配置导航和内容管理后台。正文使用 Markdown，公开内容只有在 `status = publish` 且当前时间不早于 `released` 时才会显示。

详细的数据结构、路由和实现说明见 [PROJECT.md](./PROJECT.md)。

## 本地运行

环境要求：Node.js 22 或更高版本、npm、Cloudflare Wrangler。

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:schema:local
npm run db:seed:local
npm run dev
```

数据库结构变化时，手动删除项目中的 `.wrangler` 目录，再重新执行 `db:schema:local` 和 `db:seed:local`。项目不提供 `db:reset:local`。

访问地址：

- 前台：`http://localhost:8787/`
- 后台：`http://localhost:8787/admin`

管理员账号来自 `.dev.vars` 或 `wrangler.toml` 中的 `ADMIN_NAME` 和 `ADMIN_PSWD`。

## 部署

创建 D1 数据库并将数据库 ID 写入 `wrangler.toml`：

```bash
npx wrangler d1 create worker-blog
```

创建 R2 Bucket，并确认名称与 `wrangler.toml` 一致：

```bash
npx wrangler r2 bucket create worker-blog-assets
```

初始化全新远程数据库：

```bash
npm run db:schema:remote
```

演示数据会清空业务表，只在需要时执行：

```bash
npm run db:seed:remote
```

部署 Worker：

```bash
npm run deploy
```

## 前台 JSX 模块与静态资源

前台页面按职责拆分在 `src/views/public/`：

- `base.tsx`：HTML 基础结构和通用组件
- `header.tsx`：头部、桌面导航、移动导航和搜索框
- `posts.tsx`：文章列表，可供首页、标签和分类页面复用
- `post.tsx`：文章详情和评论
- `memos.tsx`、`archives.tsx`、`categories.tsx`、`tags.tsx`
- `tag.tsx`、`category.tsx`：嵌入 `Posts` 渲染文章列表
- `links.tsx`、`about.tsx`、`page.tsx`、`footer.tsx`

前台 CSS 和 JavaScript 是实际静态文件，位于 `static/public.css` 和 `static/public.js`。后台 CSS 和 JavaScript 继续保留为 Worker 内的 TypeScript 字符串资源。

## 内容和页面模板

`blog_contents.type` 只包含：

- `post`：文章，也作为自定义页面的数据来源
- `memo`：闪念
- `atta`：附件

不再使用 `type = page`。新增菜单指向 `/post/:slug`，并选择模板：

- `页面`：只渲染该 `post.text`
- `关于`：渲染关于页头像、社交资料和该 `post.text`

新增菜单只决定 `/post/:slug` 详情页使用的模板，不会把对应文章从首页、归档、分类或标签列表中排除。只要文章处于公开状态并到达发布时间，就会正常出现在前台列表。

## 导航

后台“导航”分成两组：

- 自带菜单：首页、闪念、归档、分类、标签、友链。可以修改菜单名、显示状态和整数次序，但不能删除；首页始终显示。
- 新增菜单：默认包含“关于”，可以新增、删除、修改页面 URL、显示状态、模板和整数次序；“关于”的默认 URL 为 `/post/about`，也可以修改。

每组按次序从小到大排列，次序相同时按菜单名排列；保存后刷新页面即可看到新顺序。前台始终按照“自带菜单 + 新增菜单”的顺序组合。可见菜单超过 8 个时，前 7 个直接显示，第 8 个到最后收进“更多”菜单；桌面端支持悬浮或点击展开，手机端点击展开或折叠。

分类菜单在桌面端悬浮显示分类列表，点击进入 `/categories/`；手机端点击展开子菜单。

## 附件地址

附件继续保存为 `blog_contents.type = atta`，通过 `parent` 记录所属文章。正文附件和封面上传都会保存当前文章 CID；独立附件、友链图标和后台设置中的头像上传使用 `parent = 0`。封面 URL、友链图标链接和头像 URL 的上传按钮都位于输入框内部右侧。

数据库只保存相对路径，例如：

```text
/2026/07/7cefc73f-599d-4d64-b95a-7fb453437d96.png
```

后台“文件 CDN 域名”留空时，页面输出：

```text
/uploads/2026/07/7cefc73f-599d-4d64-b95a-7fb453437d96.png
```

此时由 Worker 的 `/uploads/*` 路由读取 R2。配置 CDN 域名后，页面使用“CDN 域名 + 相对路径”。

## Seed 数据

`seed.sql` 会清空业务表并重新生成：

- 文章 300 条，其中 `/post/about` 使用关于模板
- 评论 600 条
- 分类 3 个
- 标签 10 个
- 演示友链和系统设置

所有文章正文均为 Markdown，不使用 HTML Seed 正文。
批量数据按多条较小的 `INSERT` 语句写入，兼容 Wrangler D1 本地导入。

## 数据导入与导出

后台“系统设置”可以将业务表导出为 JSON，也可以导入该 JSON。旧附件类型 `attachment` 会在导入时转换为 `atta`。`blog_cookies` 和 R2 文件本体不会导出。自增表保留主键直接 `INSERT`，非自增表按主键更新或插入。旧数据中的 `type = page` 在导入时会转换为 `post`。

## Atom 与页脚

`/atom.xml` 输出最近 20 篇已发布文章的 Atom 订阅。页脚始终显示根据当前年份和站点标题生成的版权信息；“页脚信息”支持 HTML，填写后以 `· Theme by` 拼接显示，留空时只显示版权。
