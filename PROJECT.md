# worker-blog 项目说明

## 1. 项目定位

`worker-blog` 是一个面向个人使用的无服务器博客系统。应用代码、前台页面、后台页面和静态资源由同一个 Cloudflare Worker 提供，页面通过 Hono JSX 服务端渲染。

## 2. 技术栈

- Cloudflare Workers：运行 Hono 应用并提供 HTTP 路由
- Cloudflare D1：保存内容、评论、分类、标签、设置、会话和友链
- Cloudflare R2：保存后台上传的图片、视频和其他附件
- Hono / Hono JSX：路由、中间件与 HTML 渲染
- Marked：渲染 Markdown
- TypeScript：主要开发语言

## 3. 功能范围

### 3.1 前台

- 首页文章列表和分页
- 普通文章详情
- 自定义页面模板和关于模板
- 评论表单、评论列表和局部翻页
- 闪念时间轴、年度热力图和标签
- 归档分页、标签、分类总览和友链
- 标题、正文和标签搜索
- 深浅模式与响应式导航
- 动态 SVG Favicon
- `/atom.xml` Atom 订阅

公开内容必须同时满足：`status = publish` 且当前 Unix 时间不早于 `released`。文章、归档、分类、标签、搜索和闪念按 `released` 倒序展示。

移动端文章卡片的封面位于标题上方；桌面端保持正文与封面并列。

### 3.2 后台

- 管理员登录和退出
- 文章、闪念的新增、编辑、删除和状态管理
- 创建时间只读，发布时间可修改，修改时间由代码更新
- Markdown 工具栏和预览
- 封面 URL 输入及 R2 上传
- 系统设置头像 URL 输入及 R2 上传
- 分类与标签管理
- 附件上传、插入、复制、查询和删除
- 评论列表、分页、编辑和删除
- 友链管理
- 两组式前台导航管理
- 网站设置
- JSON 数据导出和导入

闪念没有独立详情页。编辑闪念时不显示标题、URL 别名和分类；标题根据发布时间生成，格式为 `YYYY-MM-DD HH:mm`。闪念底部标签来自 `blog_metas` 与 `blog_relationships`。

## 4. 项目结构

```text
worker-blog/
├── .dev.vars.example
├── LICENSE
├── README.md
├── PROJECT.md
├── package.json
├── package-lock.json
├── schema.sql
├── seed.sql
├── static/
│   ├── public.css
│   └── public.js
├── tsconfig.json
├── wrangler.toml
└── src/
    ├── assets/
    │   ├── admin.css.ts
    │   └── admin.js.ts
    ├── components/
    │   └── admin.tsx
    ├── lib/
    │   ├── auth.ts
    │   ├── db.ts
    │   ├── favicon.ts
    │   ├── markdown.ts
    │   ├── navigation.ts
    │   ├── options.ts
    │   └── utils.ts
    ├── routes/
    │   ├── admin.tsx
    │   └── public.tsx
    ├── views/
    │   └── public/
    │       ├── base.tsx
    │       ├── header.tsx
    │       ├── posts.tsx
    │       ├── post.tsx
    │       ├── memos.tsx
    │       ├── archives.tsx
    │       ├── categories.tsx
    │       ├── tags.tsx
    │       ├── tag.tsx
    │       ├── category.tsx
    │       ├── links.tsx
    │       ├── about.tsx
    │       ├── page.tsx
    │       └── footer.tsx
    ├── index.tsx
    └── types.ts
```

### 4.1 前台视图模块

公开路由只负责读取 D1、整理分页和元数据，再把结果传给 JSX 视图模块：

- `base` 组合 `header`、主体内容和 `footer`
- `posts` 是可复用文章列表
- `tag` 与 `category` 直接嵌入 `posts`
- `post` 负责普通文章详情和评论
- `about`、`page` 负责新增菜单选择的页面模板
- 其余模块分别负责闪念、归档、分类、标签和友链页面

前台样式和交互不再编译成 TypeScript 字符串。`static/public.css` 与 `static/public.js` 通过 `wrangler.toml` 的 `[assets]` 配置作为静态资源提供；后台资源仍由 `/assets/admin.css` 和 `/assets/admin.js` 路由输出。

## 5. 前台导航

导航配置保存在 `blog_options.navigation_menu`，值为 JSON 数组。每项包括：

```json
{
  "id": "about",
  "name": "关于",
  "url": "/post/about",
  "visible": true,
  "section": "custom",
  "template": "about",
  "order": 10
}
```

### 5.1 自带菜单组

自带菜单包括：

| ID | 默认名称 | URL | 默认显示 |
| --- | --- | --- | --- |
| `home` | 首页 | `/` | 是，不能隐藏 |
| `memos` | 闪念 | `/memos` | 是 |
| `archives` | 归档 | `/archives` | 是 |
| `categories` | 分类 | `/categories` | 否 |
| `tags` | 标签 | `/tags` | 是 |
| `links` | 友链 | `/links` | 是 |

自带菜单不能删除或修改 URL，但可以修改菜单名、显示状态和整数次序。后台该列显示“自带”。组内按次序升序排列，次序相同时按菜单名排列。

### 5.2 新增菜单组

默认新增菜单为“关于”，URL 是 `/post/about`，模板是 `about`。新增菜单可以：

- 新增或删除
- 修改菜单名和页面 URL
- 显示或隐藏
- 设置整数次序；组内按次序升序排列，次序相同时按菜单名排列
- 选择 `page` 或 `about` 模板

自带菜单和新增菜单分别保存 `order`。保存导航后页面重载并重新排序，前台按自带组在前、新增组在后的顺序组合。关于菜单的页面 URL 默认是 `/post/about`，但与其他新增菜单一样可以修改。

### 5.3 “更多”菜单

仅计算可见菜单。可见菜单数量大于 8 时：

- 第 1–7 个直接显示
- 第 8 个到最后放入“更多”菜单
- 桌面端支持悬浮和点击展开
- 手机端点击展开或折叠

分类菜单在桌面端悬浮时展示分类列表，点击菜单名进入 `/categories/`。手机端点击分类菜单展开或折叠，子菜单中的“全部分类”进入分类总览。

## 6. 页面模板

`blog_contents` 不再使用 `type = page`。页面内容仍保存为 `type = post`，模板由新增菜单决定。

新增菜单 URL 必须指向本地文章路径时才会应用模板，例如：

```text
/post/about
/post/contact
```

模板规则：

- `page`：只渲染对应文章的 `text`
- `about`：先渲染头像、站点信息和社交链接，再渲染对应文章的 `text`

新增菜单只为匹配的 `/post/:slug` 选择模板，不会改变文章的列表可见性。只要文章满足公开状态和发布时间条件，就会出现在首页、归档、分类和标签列表；点击后再按菜单所选的 `page` 或 `about` 模板渲染。`/post/about` 没有硬编码的特殊路由。

## 7. 数据模型

### 7.1 `blog_contents`

统一保存文章、闪念和附件。

- `cid`：自增主键
- `parent`：父内容 CID；普通内容和独立附件为 `0`，文章编辑页上传的正文附件和封面附件保存当前文章 CID
- `title`：标题
- `slug`：公开路径别名；附件使用 R2 对象 Key
- `created`：创建时间，创建后不由编辑表单修改
- `modified`：最后修改时间，由代码在保存时更新
- `released`：发布时间，可手动修改
- `text`：Markdown 正文或附件 JSON
- `cover`：封面相对路径或外部 URL
- `type`：`post`、`memo`、`atta`
- `status`：`publish`、`draft`、`hidden`

附件使用 `parent` 建立归属关系，并通过索引 `idx_contents_type_parent_created` 查询当前文章附件。

附件 JSON 示例：

```json
{
  "key": "2026/07/7cefc73f-599d-4d64-b95a-7fb453437d96.png",
  "url": "/2026/07/7cefc73f-599d-4d64-b95a-7fb453437d96.png",
  "mime": "image/png",
  "size": 12345,
  "originalName": "image.png"
}
```

### 7.2 `blog_metas` 与 `blog_relationships`

保存分类、标签及其与内容的多对多关系。触发器维护 `blog_metas.count`。

### 7.3 `blog_comments`

- `id`：自增主键
- `name`：评论者名字
- `email`：评论者邮箱，前台不公开
- `site`：评论者网址，可选
- `text`：评论内容
- `created`：创建时间
- `cid`：关联文章 CID

删除文章时，关联评论通过外键级联删除。

### 7.4 `blog_options`

使用 `key` 和 `value` 保存站点设置。

| key | 默认值 | 用途 |
| --- | --- | --- |
| `file_cdn_url` | 空 | 文件 CDN 域名 |
| `posts_per_page` | `10` | 前台文章分页数 |
| `memos_per_page` | `20` | 前台闪念分页数 |
| `archives_per_page` | `50` | 前台归档分页数 |
| `comments_per_page` | `20` | 前台评论分页数 |
| `admin_contents_per_page` | `25` | 后台文章分页数 |
| `admin_memos_per_page` | `25` | 后台闪念分页数 |
| `admin_comments_per_page` | `20` | 后台评论分页数 |
| `admin_attachments_per_page` | `30` | 后台附件分页数 |
| `navigation_menu` | JSON | 自带菜单与新增菜单配置 |
| `footer_info` | Kehua 链接 HTML | 页脚信息，留空时只显示版权 |

后台设置将四项前台分页配置放在一行，将四项后台分页配置放在下一行。FAVICON 文本预览位于文本输入框右侧，预览和颜色选择器均使用正方形控件。页脚版权年份运行时计算，站点名称读取 `site_title`；`footer_info` 非空时以 `· Theme by` 拼接其 HTML。

### 7.5 其他表

- `blog_cookies`：后台登录会话
- `blog_links`：友链名称、网址、图标、说明和排序值

## 8. 附件路径和访问逻辑

上传时按 UTC 年月生成 R2 对象 Key：

```text
YYYY/MM/UUID.扩展名
```

数据库保存带前导斜杠的相对路径：

```text
/YYYY/MM/UUID.扩展名
```

页面输出规则：

- `file_cdn_url` 为空：`/uploads` + 相对路径
- `file_cdn_url` 非空：CDN 域名 + 相对路径
- 已有完整 HTTP/HTTPS 地址保持不变

未配置 CDN 时，`/uploads/*` 路由从 `BLOG_R2` 读取对象并返回，支持 Range 请求。配置 CDN 后，浏览器直接访问 CDN。

## 8.1 附件后台交互

文章编辑页的封面上传按钮位于封面 URL 输入框内部右侧，按钮高度填满输入框且文字垂直、水平居中。封面上传成功后会立即把新附件插入右侧附件列表。文章编辑页和附件管理页的“插入”按钮都会复制对应 Markdown/HTML 到剪贴板；文章编辑页还会同步插入编辑器。友链图标和系统设置头像的上传按钮也位于对应输入框内部右侧；头像作为独立附件上传，使用 `parent = 0`。

## 9. 主要路由

### 9.1 公开路由

| 路由 | 用途 |
| --- | --- |
| `/` | 首页 |
| `/post/:slug/` | 普通文章或自定义模板页面 |
| `/post/:slug/comments` | 提交评论 |
| `/memos/` | 闪念 |
| `/archives/` | 归档分页 |
| `/categories/` | 分类总览 |
| `/tags/` | 标签总览 |
| `/tag/:slug/` | 标签文章列表 |
| `/category/:slug/` | 分类文章列表 |
| `/links/` | 友链 |
| `/api/search` | 搜索接口 |
| `/favicon.svg` | 动态 SVG Favicon |
| `/atom.xml` | 最近 20 篇文章的 Atom 订阅 |
| `/uploads/*` | Worker 代理读取 R2 |

### 9.2 后台路由

| 路由 | 用途 |
| --- | --- |
| `/admin/login` | 管理员登录 |
| `/admin` | 后台面板 |
| `/admin/navigation` | 自带菜单和新增菜单管理 |
| `/admin/contents?type=post` | 文章列表 |
| `/admin/contents?type=memo` | 闪念列表 |
| `/admin/content/new` | 新建内容 |
| `/admin/content/:cid` | 编辑内容 |
| `/admin/comments` | 评论管理 |
| `/admin/metas` | 分类或标签管理 |
| `/admin/attachments` | 附件管理 |
| `/admin/links` | 友链管理 |
| `/admin/options` | 网站设置与数据管理 |
| `/admin/data/export` | 导出 JSON |
| `/admin/data/import` | 导入 JSON |

## 10. 数据导出与导入

导出包含：

- `blog_contents`
- `blog_metas`
- `blog_relationships`
- `blog_options`
- `blog_links`
- `blog_comments`

`blog_cookies` 和 R2 文件本体不导出。

导入规则：

- 自增主键表保留主键并使用普通 `INSERT`
- 非自增表使用 `INSERT ... ON CONFLICT DO UPDATE`
- 旧附件类型 `attachment` 会转换为 `atta`
- 旧附件 JSON 中的 `parentCid` 会转换到 `blog_contents.parent`
- 旧内容中的 `type = page` 会转换为 `post`
- 导入后重新计算分类和标签计数
- 单个导入文件最大 20 MB

## 11. 配置

`wrangler.toml` 中的主要变量和绑定：

```toml
[vars]
ADMIN_NAME = "admin"
ADMIN_PSWD = "12345678"
MAX_UPLOAD_MB = "25"

[[d1_databases]]
binding = "BLOG_DB"
database_name = "worker-blog"
database_id = "你的数据库 ID"

[[r2_buckets]]
binding = "BLOG_R2"
bucket_name = "worker-blog-assets"

[assets]
directory = "./static"
```

文件 CDN 域名保存在 `blog_options.file_cdn_url`，不使用 Worker 环境变量。

## 12. 数据初始化

项目处于初版开发阶段，不使用 migrations，也不提供 `db:reset:local`。数据库结构变化时手动删除 `.wrangler`，然后重新执行：

```bash
npm run db:schema:local
npm run db:seed:local
```

远程数据库命令：

```bash
npm run db:schema:remote
npm run db:seed:remote
```

`seed.sql` 会先清空业务表，生成文章 300 条、评论 600 条、分类 3 个、标签 10 个。文章正文全部为 Markdown。
批量数据使用分段 `INSERT`，避免单条 SQL 过大。

## 13. 开发命令

```bash
npm run dev
npm run typecheck
npm run cf-typegen
npm run deploy
```
