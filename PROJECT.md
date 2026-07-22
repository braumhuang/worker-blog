# worker-blog 项目说明

## 1. 项目定位

`worker-blog` 是一个面向个人使用的无服务器博客系统。应用代码、前台页面、后台页面和静态资源都由同一个 Cloudflare Worker 提供，结构简单，适合低维护成本的个人博客或轻量内容站点。

项目没有单独的前端构建框架。页面由 Hono JSX 在服务端输出，CSS 和 JavaScript 作为 TypeScript 字符串资源由 Worker 直接响应。

## 2. 技术栈

- **Cloudflare Workers**：运行 Hono 应用并提供所有 HTTP 路由。
- **Cloudflare D1**：保存内容、分类、标签、设置、登录会话和友链。
- **Cloudflare R2**：保存后台上传的图片、视频和其他附件。
- **Hono**：路由、中间件、请求处理和 JSX 渲染。
- **Hono JSX**：渲染前台与后台 HTML。
- **Marked**：将后台编辑的 Markdown 转换为文章 HTML。
- **TypeScript**：项目主要开发语言。

## 3. 功能范围

### 3.1 前台

- 首页文章列表和分页
- 文章、独立页面详情
- 闪念列表
- 归档页
- 标签总览与标签文章列表
- 分类文章列表
- 友链/导航页
- 关于页面
- 标题、正文和标签搜索
- 深色、浅色主题切换
- 桌面端与移动端响应式导航
- 404 页面
- 动态 SVG Favicon

### 3.2 后台

- 管理员登录和退出
- 文章、页面、闪念的新增、编辑、删除和状态管理
- 文章与页面封面 URL；列表右侧缩略图和详情页头图共用
- Markdown 工具栏和实时预览
- 分类与标签管理
- R2 附件上传、插入和删除
- 友链管理
- 网站设置

后台设置目前包括：

- 站点标题
- FAVICON 文本
- FAVICON 颜色
- 站点描述
- 首页每页文章数
- 闪念每页数量
- 关于页面别名
- 头像 URL
- GitHub
- X
- RSS
- 邮箱
- 站点时区
- 页脚文字

## 4. Favicon 实现

Favicon 不依赖静态图片文件，而是由 Worker 根据 D1 中的设置动态生成。

后台设置提供两个字段：

- `favicon_text`：显示在图标中的 1–2 个字符。
- `favicon_color`：六位十六进制背景色，例如 `#999999`。

颜色可以直接输入，也可以通过浏览器颜色选择器设置。后台会实时显示预览。

浏览器访问 `/favicon.svg` 时，Worker 会读取 `blog_options`，生成一个 64×64、圆角背景、白色居中文字的 SVG。前台、后台和登录页都通过以下标签引用该资源：

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

服务端会校验并规范化颜色值；无效颜色回退为 `#999999`。文本为空时优先使用站点标题首字符，最终回退为 `B`。

## 5. About 资料头部

当访问后台设置中“关于页面别名”对应的页面时，前台会使用 Kehua 风格的 About 头部：

- `about_avatar`：圆形头像 URL。
- `about_github`：GitHub 主页。
- `about_x`：X 主页。
- `about_rss`：RSS/Atom 地址，可填写站内相对路径或完整 URL。
- `about_email`：邮箱地址，前台自动转换为 `mailto:` 链接。

字段为空时不会输出对应头像或图标；正文仍来自原 About 页面内容。

## 6. 前台主题实现

前台直接以 Kehua“留白”主题的公开样式为基础适配，并保留其 MIT 授权说明。主要视觉特征包括约 720px 的窄幅单栏内容区、60px 吸顶导航、克制留白、轻边框文章卡片、右侧 120×120 封面、红色强调色、居中页面标题、闪念时间轴、归档统计、圆角搜索弹窗和深浅模式。Worker 项目使用 Hono JSX 重写模板，数据仍由 D1 动态提供。

后台按照 Typecho 管理界面的结构与视觉语言重构：深色 36px 顶部导航、1160px 内容容器、灰白页面底色、蓝灰色主按钮、细边框表格和左右栏内容编辑器。它并未复制 Typecho 的 PHP 模板或业务代码，只在当前 Hono 后台组件上实现相近的排版和交互层级。

## 7. 项目结构

```text
worker-blog/
├── .dev.vars.example       # 本地开发变量示例
├── LICENSE
├── README.md               # 项目简介、运行和部署
├── PROJECT.md              # 项目详细说明
├── package.json
├── package-lock.json
├── schema.sql              # D1 表结构、索引和触发器
├── migrations/
│   └── 0001_add_content_cover.sql # 旧数据库增加封面字段
├── seed.sql                # 开发模拟数据
├── tsconfig.json
├── wrangler.toml           # Worker、D1、R2 和变量配置
└── src/
    ├── assets/
    │   ├── admin.css.ts    # 后台样式
    │   ├── admin.js.ts     # 后台交互
    │   ├── public.css.ts   # 前台样式
    │   └── public.js.ts    # 前台交互
    ├── components/
    │   ├── admin.tsx       # 后台布局和通用组件
    │   └── public.tsx      # 前台布局和通用组件
    ├── lib/
    │   ├── auth.ts         # 登录、Cookie 和权限校验
    │   ├── db.ts           # D1 查询辅助函数
    │   ├── favicon.ts      # Favicon 校验与 SVG 生成
    │   ├── markdown.ts     # Markdown 渲染
    │   ├── options.ts      # 默认设置、读取与保存
    │   └── utils.ts        # 日期、Slug、附件等工具
    ├── routes/
    │   ├── admin.tsx       # 后台路由
    │   └── public.tsx      # 前台路由
    ├── index.tsx           # 应用入口、资源和 R2 代理路由
    └── types.ts            # 公共类型
```

## 8. 数据模型

### 8.1 `blog_contents`

统一保存文章、页面、闪念和附件记录。

关键字段：

- `cid`：主键
- `title`：标题
- `slug`：公开路径别名
- `created`、`modified`：Unix 时间戳
- `text`：正文或附件信息
- `cover`：文章或页面封面 URL；同一字段用于列表右侧缩略图和详情页头图，为空时不显示封面
- `type`：`post`、`page`、`memo`、`attachment`
- `status`：`publish`、`draft`、`hidden`

### 8.2 `blog_metas`

保存分类和标签。`type` 为 `category` 或 `tag`。

### 8.3 `blog_relationships`

保存内容与分类、标签的多对多关系。数据库触发器会维护 `blog_metas.count`。

### 8.4 `blog_options`

键值形式保存网站设置。新增设置不需要修改表结构，只需增加默认值、后台字段和保存逻辑。

### 8.5 `blog_cookies`

保存后台登录会话和过期时间。

### 8.6 `blog_links`

保存友链或个人导航链接，包括名称、网址、图标、说明和排序值。

## 9. 主要路由

### 9.1 公开路由

| 路由 | 用途 |
| --- | --- |
| `/` | 首页 |
| `/post/:slug/` | 文章或页面详情 |
| `/memos/` | 闪念 |
| `/archives/` | 归档 |
| `/tags/` | 标签总览 |
| `/tag/:slug/` | 标签内容列表 |
| `/category/:slug/` | 分类内容列表 |
| `/links/` | 友链/导航 |
| `/api/search` | 搜索接口 |
| `/favicon.svg` | 动态 SVG Favicon |
| `/uploads/*` | R2 文件代理 |

### 9.2 后台路由

| 路由 | 用途 |
| --- | --- |
| `/admin/login` | 管理员登录 |
| `/admin` | 后台面板 |
| `/admin/contents` | 内容列表 |
| `/admin/content/new` | 新建内容 |
| `/admin/content/:cid` | 编辑内容 |
| `/admin/metas` | 分类或标签管理 |
| `/admin/attachments` | 附件管理 |
| `/admin/links` | 友链管理 |
| `/admin/options` | 网站设置 |

## 10. 配置说明

`wrangler.toml` 中的主要绑定和变量：

```toml
name = "worker-blog"
main = "src/index.tsx"

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

变量说明：

- `ADMIN_NAME`：后台管理员名称。
- `ADMIN_PSWD`：后台管理员密码；生产环境应改用 Worker Secret。
- `R2_PUBLIC_URL`：可选的 R2 公开域名。为空时通过 `/uploads/*` 代理访问。
- `MAX_UPLOAD_MB`：单文件最大上传体积，默认 25 MB。

## 11. 登录与安全

- 后台路由通过登录中间件保护。
- 登录 Cookie 的会话记录保存在 D1。
- 会话默认保存 10 天。
- 剩余有效期较短时自动续期。
- 后台写操作执行同源检查。
- 应用启用了安全响应头，并限制页面被第三方站点嵌入。
- 管理员密码不应以明文提交到公开仓库。

## 12. 附件行为

- 图片上传后可插入 Markdown 图片语法。
- 视频上传后可插入 `<video>` 标签。
- 其他文件上传后可插入下载链接。
- 附件对象保存在 R2，元数据记录保存在 `blog_contents`。
- `/uploads/*` 支持 HTTP Range 请求，可用于视频拖动和分段加载。
- 设置了 `R2_PUBLIC_URL` 时，可以直接生成公开域名地址。

## 13. 数据初始化

`schema.sql` 使用 `CREATE TABLE IF NOT EXISTS` 创建表、索引和触发器，可以用于初始化新数据库。当前新库会直接包含 `blog_contents.cover`。

已有数据库升级时执行 `migrations/0001_add_content_cover.sql`，且只执行一次：

```bash
npm run db:migrate:cover:local
npm run db:migrate:cover:remote
```

`seed.sql` 包含 Winston 示例站点的开发模拟数据，并会先清空业务表。它适合本地演示或全新测试环境，不适合直接用于已有正式内容的生产数据库。

常用命令：

```bash
npm run db:schema:local
npm run db:seed:local
npm run db:reset:local
npm run db:migrate:cover:local
npm run db:schema:remote
npm run db:migrate:cover:remote
npm run db:seed:remote
```

## 14. 开发命令

```bash
npm run dev          # 本地启动 Wrangler
npm run typecheck    # TypeScript 类型检查
npm run cf-typegen   # 生成 Cloudflare 绑定类型
npm run deploy       # 部署 Worker
```

## 15. 扩展设置的方法

新增普通站点设置通常按以下流程完成：

1. 在 `src/lib/options.ts` 的 `DEFAULT_OPTIONS` 中增加默认值。
2. 在 `/admin/options` 表单中增加字段。
3. 将字段加入后台保存白名单，并进行必要的校验和规范化。
4. 在前台组件或路由中读取并使用设置。
5. 需要演示默认值时，在 `seed.sql` 中增加对应选项。

由于 `blog_options` 是键值表，此类扩展通常不需要数据库迁移。
