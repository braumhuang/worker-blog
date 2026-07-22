# worker-blog 项目说明

## 1. 项目定位

`worker-blog` 是一个面向个人使用的无服务器博客系统。应用代码、前台页面、后台页面和静态资源均由同一个 Cloudflare Worker 提供，页面通过 Hono JSX 服务端渲染。

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
- 文章、独立页面详情
- 文章与页面评论表单、评论列表和分页
- 闪念时间轴、年度热力图和标签
- 归档、标签、分类、友链和关于页面
- 标题、正文和标签搜索
- 深浅模式与响应式导航
- 动态 SVG Favicon

公开内容必须同时满足：`status = publish` 且当前 Unix 时间不早于 `released`。文章、归档、分类、标签、搜索和闪念均按 `released` 倒序展示。

移动端文章卡片的封面位于标题上方；桌面端保持正文与封面并列。

### 3.2 后台

- 管理员登录和退出
- 文章、页面、闪念的新增、编辑、删除和状态管理
- 可编辑发布时间；创建时间只读；修改时间由保存操作自动更新
- Markdown 工具栏和预览
- 封面 URL 输入及 R2 上传按钮
- 分类与标签管理
- R2 附件上传、插入和删除
- 评论列表、分页、编辑和删除
- 友链管理，列表位于左侧，新增或编辑表单位于右侧
- 网站设置

闪念没有独立详情页。编辑闪念时不显示标题、URL 别名和分类；标题根据发布时间生成，格式为 `YYYY-MM-DD HH:mm`。闪念正文底部的 `#标签` 来自 `blog_metas` 与 `blog_relationships`。

后台设置包括：

- 站点标题与描述
- Favicon 文本和颜色
- 首页文章分页数
- 闪念分页数
- 评论分页数，默认 20
- 评论功能开关，默认关闭
- 关于页面别名、头像和社交链接
- 时区下拉选择，默认 `Asia/Shanghai`（UTC+08:00）
- 页脚文字

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
├── tsconfig.json
├── wrangler.toml
└── src/
    ├── assets/
    │   ├── admin.css.ts
    │   ├── admin.js.ts
    │   ├── public.css.ts
    │   └── public.js.ts
    ├── components/
    │   ├── admin.tsx
    │   └── public.tsx
    ├── lib/
    │   ├── auth.ts
    │   ├── db.ts
    │   ├── favicon.ts
    │   ├── markdown.ts
    │   ├── options.ts
    │   └── utils.ts
    ├── routes/
    │   ├── admin.tsx
    │   └── public.tsx
    ├── index.tsx
    └── types.ts
```

## 5. 数据模型

### 5.1 `blog_contents`

统一保存文章、页面、闪念和附件。

- `cid`：自增主键
- `title`：标题
- `slug`：公开路径别名
- `created`：创建时间，创建后不由编辑表单修改
- `modified`：最后修改时间，由代码在保存时更新
- `released`：发布时间，可在编辑页手动修改
- `text`：正文或附件信息
- `cover`：文章或页面封面 URL
- `type`：`post`、`page`、`memo`、`attachment`
- `status`：`publish`、`draft`、`hidden`

### 5.2 `blog_metas` 与 `blog_relationships`

保存分类、标签及其与内容的多对多关系。触发器负责维护 `blog_metas.count`。

### 5.3 `blog_comments`

- `id`：自增主键
- `name`：评论者名字，必填
- `email`：评论者邮箱，必填且前台不公开
- `site`：评论者网址，可选
- `text`：评论内容，必填
- `created`：创建时间
- `cid`：关联文章或页面的 `cid`

删除内容时，关联评论通过外键级联删除。

### 5.4 `blog_options`

使用 `key` 和 `value` 保存站点设置。普通设置扩展通常只需增加默认值、后台表单和保存逻辑。

### 5.5 其他表

- `blog_cookies`：后台登录会话
- `blog_links`：友链名称、网址、图标、说明和排序值

## 6. 主要路由

### 6.1 公开路由

| 路由 | 用途 |
| --- | --- |
| `/` | 首页 |
| `/post/:slug/` | 文章或页面详情 |
| `/post/:slug/comments` | 提交评论 |
| `/memos/` | 闪念 |
| `/archives/` | 归档 |
| `/tags/` | 标签总览 |
| `/tag/:slug/` | 标签文章列表 |
| `/category/:slug/` | 分类文章列表 |
| `/links/` | 友链 |
| `/api/search` | 搜索接口 |
| `/favicon.svg` | 动态 SVG Favicon |
| `/uploads/*` | R2 文件代理 |

### 6.2 后台路由

| 路由 | 用途 |
| --- | --- |
| `/admin/login` | 管理员登录 |
| `/admin` | 后台面板 |
| `/admin/contents` | 内容列表 |
| `/admin/content/new` | 新建内容 |
| `/admin/content/:cid` | 编辑内容 |
| `/admin/comments` | 评论列表 |
| `/admin/comment/:id` | 编辑评论 |
| `/admin/metas` | 分类或标签管理 |
| `/admin/attachments` | 附件管理 |
| `/admin/links` | 友链管理 |
| `/admin/options` | 网站设置 |

## 7. 附件与封面

附件上传到 R2，元数据作为 `attachment` 类型记录保存在 `blog_contents`。图片可插入 Markdown，视频可插入 `<video>`，其他文件生成下载链接。

文章和页面编辑页的封面字段支持直接填写 URL，也可点击右侧“上传”按钮。上传成功后，R2 公开链接会自动写入封面输入框，保存内容后生效。

## 8. 配置

`wrangler.toml` 中的主要变量和绑定：

```toml
[vars]
ADMIN_NAME = "admin"
ADMIN_PSWD = "12345678"
R2_PUBLIC_URL = ""
MAX_UPLOAD_MB = "25"

[[d1_databases]]
binding = "BLOG_DB"
database_name = "worker-blog"
database_id = "你的数据库 ID"

[[r2_buckets]]
binding = "BLOG_R2"
bucket_name = "worker-blog-assets"
```

生产环境应使用 Worker Secret 保存管理员密码。

## 9. 数据初始化

项目处于初版开发阶段，不使用 migrations。全新数据库直接执行 `schema.sql`，测试数据执行 `seed.sql`。

```bash
npm run db:schema:local
npm run db:seed:local
npm run db:reset:local
npm run db:schema:remote
npm run db:seed:remote
```

`seed.sql` 基于原有演示数据生成，包含 35 篇文章或页面、6 条闪念、16 个附件、11 个标签、5 条友链和 300 条模拟评论。它会先清空业务表，不适合用于需要保留数据的数据库。

## 10. 开发命令

```bash
npm run dev
npm run typecheck
npm run cf-typegen
npm run deploy
```
