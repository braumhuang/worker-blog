# worker-blog 项目说明

## 1. 项目定位

`worker-blog` 是一个面向个人使用的无服务器博客系统。应用代码、前台页面、后台页面和静态资源由同一个 Cloudflare Worker 提供，页面通过 Hono JSX 服务端渲染。

## 2. 技术栈

- Cloudflare Workers：运行 Hono 应用并提供 HTTP 路由
- Cloudflare D1：保存内容、评论、分类、标签、设置、会话和友链
- Cloudflare R2：保存后台上传的图片、视频和其他附件
- Workers Cache API：缓存站点设置和后台会话，减少 D1 读取
- Hono / Hono JSX：路由、中间件与 HTML 渲染
- Marked：渲染 Markdown
- TypeScript：主要开发语言

## 3. 功能范围

### 3.1 前台

- 首页文章列表和分页
- 普通文章详情
- 页面模板和关于模板
- 评论表单、评论列表和局部翻页
- 闪念时间轴、年度热力图和标签
- 归档分页、标签、分类总览和友链
- 标题、正文和标签搜索
- 深浅模式与响应式导航
- 动态 SVG Favicon
- `/atom.xml` Atom 订阅
- Worker 代理读取 R2，支持 Range 请求

公开内容必须同时满足：

```text
status = publish
当前 Unix 时间 >= released
```

文章、归档、分类、标签、搜索和闪念按 `released` 倒序展示。

### 3.2 后台

- 管理员登录、会话续期和退出
- 文章、页面、闪念的新增、编辑、删除和状态管理
- Markdown 工具栏、预览、Markdown 链接和 HTML A 标签快捷按钮
- 封面 URL、头像 URL、友链图标输入及 R2 上传
- 分类与标签管理
- 附件上传、模板选择、插入、复制、查询和删除
- 附件模板新增、编辑和删除
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
│   ├── public.js
│   ├── admin.css
│   └── admin.js
├── tsconfig.json
├── wrangler.toml
└── src/
    ├── lib/
    │   ├── attachment-templates.ts
    │   ├── auth.ts
    │   ├── cache.ts
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
    │   ├── admin/
    │   │   ├── base.tsx
    │   │   ├── shared.tsx
    │   │   ├── login.tsx
    │   │   ├── dashboard.tsx
    │   │   ├── navigation.tsx
    │   │   ├── contents.tsx
    │   │   ├── content.tsx
    │   │   ├── metas.tsx
    │   │   ├── attachments.tsx
    │   │   ├── attachment-templates.tsx
    │   │   ├── comments.tsx
    │   │   ├── comment.tsx
    │   │   ├── links.tsx
    │   │   └── options.tsx
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

公开路由和后台路由负责读取数据、校验输入和写入数据；JSX 视图负责 HTML 结构。前后台 CSS 和 JavaScript 由 `static/` 提供。

## 5. 缓存设计

### 5.1 `options_cache`

`src/lib/options.ts` 读取设置时先查询 Workers Cache API 的命名缓存 `options_cache`。

处理流程：

```text
getOptions()
  → options_cache 命中：直接返回 OptionMap
  → 未命中：读取 blog_options
  → 合并 DEFAULT_OPTIONS
  → 规范化时区、评论开关、Favicon 和 CDN 地址
  → 写入 options_cache
```

缓存有效期最多 5 分钟。后台保存设置、保存导航、保存附件模板，以及数据导入完成后会删除当前节点的设置缓存。下一次请求会从 D1 重新加载并建立缓存。

### 5.2 `sessions_cache`

后台会话以 `blog_cookies` 为最终数据来源，并使用命名缓存 `sessions_cache` 减少每次后台请求对 D1 的查询。

缓存键不会直接使用会话令牌，而是使用：

```text
SHA-256(session token)
```

缓存内容只保存：

```json
{
  "expired": 1780000000
}
```

缓存有效期最多 5 分钟，同时不超过会话剩余有效期。

会话处理流程：

- 登录：写入 `blog_cookies`，同时写入 `sessions_cache`
- 后台请求：优先查询 `sessions_cache`，未命中时查询 D1 并回填缓存
- 续期：更新 D1 和缓存
- 退出：删除 D1 会话和缓存
- 过期：删除 D1 会话、缓存和浏览器 Cookie

Cache API 不可用、缓存未命中或缓存 JSON 无效时，代码自动回退到 D1。缓存不需要在 `wrangler.toml` 中配置绑定。

## 6. 数据模型

### 6.1 `blog_contents`

统一保存文章、页面、闪念和附件。

| 字段 | 说明 |
| --- | --- |
| `cid` | 自增主键 |
| `parent` | 父内容 CID；普通内容和独立附件为 `0` |
| `title` | 标题 |
| `slug` | URL 别名；附件使用 R2 对象 Key |
| `created` | 创建时间，创建后不由编辑表单修改 |
| `modified` | 最后修改时间，由代码更新 |
| `released` | 发布时间，可手动修改 |
| `text` | Markdown 正文或附件 JSON |
| `cover` | 封面相对路径或外部 URL |
| `type` | `post`、`page`、`memo`、`atta` |
| `status` | `publish`、`draft`、`hidden` |

类型用途：

- `post`：进入首页、归档、分类、标签、搜索和 Atom
- `page`：不进入文章列表，通过 `/post/:slug` 访问
- `memo`：进入闪念页面
- `atta`：附件，通过 `parent` 关联内容

附件查询使用索引 `idx_contents_type_parent_created`。

附件 JSON：

```json
{
  "key": "2026/07/7cefc73f-599d-4d64-b95a-7fb453437d96.png",
  "url": "/2026/07/7cefc73f-599d-4d64-b95a-7fb453437d96.png",
  "mime": "image/png",
  "size": 12345,
  "originalName": "image.png"
}
```

### 6.2 `blog_metas` 与 `blog_relationships`

`blog_metas` 保存分类和标签。`blog_relationships` 保存内容与分类、标签的多对多关系。触发器维护 `blog_metas.count`。

### 6.3 `blog_comments`

| 字段 | 说明 |
| --- | --- |
| `id` | 自增主键 |
| `name` | 评论者名字 |
| `email` | 评论者邮箱，前台不公开 |
| `site` | 评论者网址，可选 |
| `text` | 评论内容 |
| `created` | 创建时间 |
| `cid` | 关联文章或页面 CID |

删除内容时，关联评论通过外键级联删除。

### 6.4 `blog_options`

使用 `key` 和 `value` 保存站点设置。

| key | 默认值 | 用途 |
| --- | --- | --- |
| `site_title` | `My Hono Blog` | 站点标题 |
| `site_description` | `Stay Young, Stay Simple.` | 站点描述 |
| `file_cdn_url` | 空 | 文件 CDN 域名 |
| `posts_per_page` | `10` | 前台文章分页数 |
| `memos_per_page` | `20` | 前台闪念分页数 |
| `archives_per_page` | `50` | 前台归档分页数 |
| `comments_per_page` | `20` | 前台评论分页数 |
| `admin_contents_per_page` | `25` | 后台文章和页面分页数 |
| `admin_memos_per_page` | `25` | 后台闪念分页数 |
| `admin_comments_per_page` | `20` | 后台评论分页数 |
| `admin_attachments_per_page` | `30` | 后台附件分页数 |
| `navigation_menu` | JSON | 自带菜单与新增菜单配置 |
| `attachment_templates` | JSON | 附件插入模板 |
| `comments_enabled` | `false` | 前台评论功能开关 |
| `site_timezone` | `Asia/Shanghai` | 站点时区 |
| `footer_info` | Kehua 链接 HTML | 页脚信息 |

### 6.5 其他表

- `blog_cookies`：后台登录会话
- `blog_links`：友链名称、网址、图标、描述和排序值

## 7. 导航与页面模板

导航配置保存在 `blog_options.navigation_menu`，值为 JSON 数组。

### 7.1 自带菜单

自带菜单包括：首页、闪念、归档、分类、标签、友链。

- 不能删除
- 不能修改 URL
- 可以修改菜单名
- 可以设置显示状态，首页始终显示
- 可以设置整数次序
- 次序相同时按菜单名排序

### 7.2 新增菜单

新增菜单可以：

- 新增或删除
- 修改菜单名
- 修改页面 URL
- 显示或隐藏
- 设置整数次序
- 选择 `page` 或 `about` 模板

默认新增菜单“关于”指向 `/post/about`，模板为 `about`。

### 7.3 前台展示

前台按“自带菜单 + 新增菜单”组合。可见菜单超过 8 个时：

- 第 1–7 个直接显示
- 第 8 个到最后放入“更多”菜单
- 桌面端支持悬浮和点击
- 手机端点击展开或折叠

分类菜单在桌面端悬浮显示分类子菜单，在手机端点击展开。

### 7.4 页面模板

- `page`：只渲染内容的 `text`
- `about`：渲染头像、站点信息、社交链接和内容 `text`

页面即使没有显示在导航中，也可以通过 `/post/:slug` 直接访问。没有匹配新增菜单的页面使用 `page` 模板。

## 8. 附件与 R2

### 8.1 路径

上传时按 UTC 年月生成 R2 对象 Key：

```text
YYYY/MM/UUID.扩展名
```

数据库保存：

```text
/YYYY/MM/UUID.扩展名
```

输出规则：

- `file_cdn_url` 为空：`/uploads` + 相对路径
- `file_cdn_url` 非空：CDN 域名 + 相对路径
- HTTP、HTTPS、Data URL 和 Blob URL 保持原值

`/uploads/*` 从 `BLOG_R2` 读取对象，支持完整响应和 Range 响应。

### 8.2 附件归属

- 文章、页面或闪念编辑页上传：`parent = 当前内容 CID`
- 封面上传：`parent = 当前内容 CID`
- 附件管理、友链图标和头像上传：`parent = 0`

删除内容时，会删除其附件记录和对应 R2 对象。

### 8.3 附件模板

模板包含名称、类型和模板文本。类型为 `image`、`video` 或 `file`。

默认模板：

```text
图片  ![FILE_NAME](RELATIVE_PATH)
视频  <video controls preload="metadata" src="RELATIVE_PATH">FILE_NAME</video>
文件  [FILE_NAME](RELATIVE_PATH)
```

编辑内容时，上传或点击附件“插入”会选择模板并替换占位符。附件管理页将结果复制到剪贴板；内容编辑页还会插入编辑器。

## 9. 主要路由

### 9.1 公开路由

| 路由 | 用途 |
| --- | --- |
| `/` | 首页 |
| `/post/:slug/` | 文章或页面详情 |
| `/post/:slug/comments` | 评论提交和分页 |
| `/memos/` | 闪念 |
| `/archives/` | 归档 |
| `/categories/` | 分类总览 |
| `/tags/` | 标签总览 |
| `/tag/:slug/` | 标签文章列表 |
| `/category/:slug/` | 分类文章列表 |
| `/links/` | 友链 |
| `/api/search` | 搜索接口 |
| `/favicon.svg` | 动态 SVG Favicon |
| `/atom.xml` | Atom 订阅 |
| `/uploads/*` | Worker 代理读取 R2 |

### 9.2 后台路由

| 路由 | 用途 |
| --- | --- |
| `/admin/login` | 管理员登录 |
| `/admin` | 后台面板 |
| `/admin/navigation` | 前台导航管理 |
| `/admin/contents?type=post` | 文章与页面列表 |
| `/admin/contents?type=memo` | 闪念列表 |
| `/admin/content/new` | 新建内容 |
| `/admin/content/:cid` | 编辑内容 |
| `/admin/comments` | 评论管理 |
| `/admin/metas` | 分类和标签管理 |
| `/admin/attachments` | 附件管理 |
| `/admin/attachment-templates` | 附件模板管理 |
| `/admin/links` | 友链管理 |
| `/admin/options` | 网站设置与数据管理 |
| `/admin/data/export` | 导出 JSON |
| `/admin/data/import` | 导入 JSON |

## 10. 数据导出与导入

导出格式版本为 `1`，包含：

- `blog_contents`
- `blog_metas`
- `blog_relationships`
- `blog_options`
- `blog_links`
- `blog_comments`

`blog_cookies` 和 R2 文件本体不导出。

导入规则：

- 只接受版本 `1`
- 每行必须包含当前表定义要求的全部字段
- 自增主键表保留主键并使用普通 `INSERT`
- 非自增表使用 `INSERT ... ON CONFLICT DO UPDATE`
- 导入完成后重新计算分类和标签计数
- 导入完成后清除 `options_cache`
- 单个导入文件最大 20 MB

## 11. Wrangler 配置

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

`options_cache` 和 `sessions_cache` 使用 Workers Cache API，不需要新增绑定。文件 CDN 域名保存在 `blog_options.file_cdn_url`。

## 12. 数据初始化

项目直接维护完整 `schema.sql`，不使用 migrations，也不提供 `db:reset:local`。数据库结构变化时：

```bash
rm -rf .wrangler
npm run db:schema:local
npm run db:seed:local
```

`seed.sql` 生成：

- 文章 300 条
- 页面 1 条
- 闪念 90 条
- 评论 600 条
- 分类 3 个
- 标签 10 个
- 演示友链、导航、附件模板和系统设置

文章和页面正文全部为 Markdown。批量数据使用分段 `INSERT`。

## 13. 开发命令

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
