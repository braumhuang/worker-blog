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

前台和后台 CSS、JavaScript 都使用实际静态文件：`static/public.css`、`static/public.js`、`static/admin.css` 和 `static/admin.js`。后台页面 JSX 按页面拆分在 `src/views/admin/`，路由文件只负责数据读取、校验和写入。

## 后台 JSX 与附件模板

后台页面按职责拆分在 `src/views/admin/`，包括登录、面板、导航、内容列表、内容编辑、分类标签、附件、附件模板、评论、友链和系统设置。

后台主导航在“附件”后增加“模板”。附件模板保存在 `blog_options.attachment_templates`，默认提供：

- 图片：`![FILE_NAME](RELATIVE_PATH)`
- 视频：`<video controls preload="metadata" src="RELATIVE_PATH">FILE_NAME</video>`
- 文件：`[FILE_NAME](RELATIVE_PATH)`

模板支持新增、编辑和删除。文章或闪念编辑页上传附件、点击附件“插入”时，会按文件类型弹出模板选择框，再替换 `FILE_NAME` 和 `RELATIVE_PATH`；该类型没有配置模板时直接使用内置默认值。附件管理页选择模板后复制生成内容，内容编辑页还会同步插入编辑器。Markdown 工具栏在“链接”右侧增加“A标签”按钮，插入 `<a href="https://" target="_blank">链接名称</a>`。

## 内容和页面模板

`blog_contents.type` 包含：

- `post`：文章，出现在首页、归档、分类、标签和 Atom 订阅中
- `page`：页面，不进入文章列表，但可以通过 `/post/:slug` 独立访问
- `memo`：闪念
- `atta`：附件

文章编辑页的发布区可以在“文章”和“页面”之间切换类型。页面即使对应的新增菜单被隐藏，仍可通过自己的 `/post/:slug` 地址访问。

新增菜单可以为页面选择模板：

- `页面`：只渲染该内容的 `text`
- `关于`：渲染关于页头像、社交资料和该内容的 `text`

页面默认使用“页面”模板；与新增菜单 URL 匹配时使用菜单中选择的“页面”或“关于”模板。`/post/about` 没有单独硬编码。

## 导航

后台“导航”分成两组：

- 自带菜单：首页、闪念、归档、分类、标签、友链。可以修改菜单名、显示状态和整数次序，但不能删除；首页始终显示。
- 新增菜单：默认包含“关于”，可以新增、删除、修改页面 URL、显示状态、模板和整数次序；“关于”的默认 URL 为 `/post/about`，也可以修改。

每组按次序从小到大排列，次序相同时按菜单名排列；保存后刷新页面即可看到新顺序。前台始终按照“自带菜单 + 新增菜单”的顺序组合。可见菜单超过 8 个时，前 7 个直接显示，第 8 个到最后收进“更多”菜单；桌面端支持悬浮或点击展开，手机端点击展开或折叠。

分类菜单在桌面端悬浮显示分类列表，点击进入 `/categories/`；手机端点击展开子菜单。

友链卡片左侧显示图标，右侧显示名称和描述；描述为空时右侧只显示名称，不再回退显示网址。

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

- 文章 300 条
- 页面 1 条，`/post/about` 使用关于模板
- 评论 600 条
- 分类 3 个
- 标签 10 个
- 演示友链和系统设置

文章和页面正文均为 Markdown，不使用 HTML Seed 正文。
批量数据按多条较小的 `INSERT` 语句写入，兼容 Wrangler D1 本地导入。

## 数据导入与导出

后台“系统设置”可以将业务表导出为 JSON，也可以导入该 JSON。旧附件类型 `attachment` 会在导入时转换为 `atta`。`blog_cookies` 和 R2 文件本体不会导出。自增表保留主键直接 `INSERT`，非自增表按主键更新或插入；`post` 与 `page` 类型都会原样保留。

## Atom 与页脚

`/atom.xml` 输出最近 20 篇已发布文章的 Atom 订阅。页脚始终显示根据当前年份和站点标题生成的版权信息；“页脚信息”支持 HTML，填写后以 `· Theme by` 拼接显示，留空时只显示版权。
