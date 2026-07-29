# worker-blog 项目说明

## 项目定位

`worker-blog` 是一个部署在 Cloudflare Workers 上的服务端渲染博客系统。前台主题和后台页面使用 Hono JSX；D1 保存内容与配置；R2 保存上传文件；Workers Static Assets 发布 CSS、JavaScript 和主题图片；Worker 实例内的模块级内存对象用于减少设置和会话读取。

项目当前处于初始开发阶段，数据库结构由完整的 `schema.sql` 管理，不维护 migrations。

## 运行时组成

```text
浏览器
├── 静态资源请求 ─────────────→ Workers Static Assets
├── 前台动态页面 ─────────────→ Hono → D1
├── 后台管理请求 ─────────────→ Hono → sessions_cache / D1
├── 评论提醒邮件 ─────────────→ BLOG_EMAIL → Cloudflare Destination Address
├── /uploads/* ───────────────→ Hono → R2
└── CDN 文件地址 ─────────────→ R2 公共域名或外部 CDN
```

## Cloudflare 绑定和环境变量

```text
BLOG_DB        D1Database，业务数据库
BLOG_R2        R2Bucket，上传文件存储
BLOG_EMAIL     send_email，默认部署的评论提醒邮件发送绑定
ADMIN_NAME     Worker Secret，后台用户名
ADMIN_PSWD     Worker Secret，后台密码
MAX_UPLOAD_MB  普通变量，后台单文件上传限制
```

`MAX_UPLOAD_MB` 默认按 25 MB 处理，代码将可配置值限制在 1–100 MB。

## 核心目录

```text
.github/workflows/deploy.yml   GitHub Actions 手动部署工作流
src/index.tsx                  Hono 应用入口、全局安全头、Favicon、R2 代理
src/routes/public.tsx          前台路由、公开内容查询、评论和 Atom
src/routes/admin.tsx           后台路由、CRUD、上传、导入导出
src/theme.ts                   主题名称、默认主题和静态资源路径
src/types.ts                   运行时绑定与业务类型
src/lib/                       数据库、认证、缓存、设置、导航、Emoji、评论提醒等公共逻辑
src/views/admin/               后台 JSX 页面
src/views/themes/theme.ts      前台主题组件注册表
src/views/themes/<theme>/      各主题 JSX 组件
static/admin/                  后台 CSS、JavaScript
static/<theme>/                主题 CSS、JavaScript、图片
schema.sql                     当前完整数据库结构
seed.sql                       开发模拟数据
wrangler.toml                  本地和手动部署配置
```

## 应用入口

`src/index.tsx` 完成以下工作：

1. 创建 `Hono<AppEnv>` 应用。
2. 为全部响应添加安全头。
3. 提供 `/favicon.svg` 动态 Favicon。
4. 提供 `/uploads/*` R2 文件代理，并处理 HTTP Range 请求。
5. 注册后台和前台路由。
6. 根据当前主题渲染前台 404 页面。
7. 区分前台和后台的错误响应。

`/uploads/*` 返回 R2 对象的 HTTP 元数据、ETag、Range 和长期缓存头。数据库中的相对路径不包含 `/uploads`。

## 前台路由

```text
GET  /                         文章首页
GET  /post/:slug/             文章或页面详情
POST /post/:slug/comments     提交评论
GET  /memos/                  闪念列表和年度热力图
GET  /archives/               归档
GET  /categories/             分类列表
GET  /category/:slug/         分类文章列表
GET  /tags/                   标签列表
GET  /tag/:slug/              标签文章列表
GET  /links/                  友链
GET  /api/search              搜索 API
GET  /atom.xml                Atom Feed
```

无末尾斜杠的主要前台路径使用 308 跳转到规范地址。

### 内容公开规则

文章、页面和闪念只有同时满足以下条件才可公开读取：

```text
status = publish
released <= 当前 Unix 时间
```

- 首页、归档、分类、标签和 Atom 只读取 `post`。
- `page` 通过 `/post/:slug/` 访问。
- `memo` 只进入闪念页和搜索。
- 文章和页面都可以显示评论。

列表默认按 `released DESC` 排序。`created` 是创建时间，编辑操作只更新 `modified`，`released` 由管理员控制。

### 文章和元数据

列表查询先取得当前页内容，再由 `enrichContents()` 一次查询当前页全部内容的分类和标签，避免逐篇查询。

分类、标签详情复用主题的文章列表组件，分页数使用 `posts_per_page`。

### 搜索

`/api/search?q=` 搜索：

- 标题；
- Markdown 正文；
- 分类和标签名称。

搜索范围包括已经公开的 `post`、`page`、`memo`，最多返回 12 条。

### Atom

`/atom.xml` 返回最新 20 篇公开文章。每个条目只输出与前台文章列表一致的纯文本摘要，存在 `<!-- more -->` 时完整使用标记前内容；不存在时截取前 200 个字符，不包含文章全文。

## 后台路由

后台登录地址：

```text
/admin/login
```

主要管理路由：

```text
/admin                         面板
/admin/navigation              前台导航
/admin/contents                文章、页面和闪念列表
/admin/content/new             新建文章或闪念草稿
/admin/content/:cid            内容编辑
/admin/comments                评论列表
/admin/comment/:id             评论编辑
/admin/metas                   分类和标签
/admin/attachments             附件列表
/admin/attachment-templates    附件模板
/admin/links                   友链
/admin/options                 设置和数据管理
```

写操作经过后台会话验证和同源校验。

## 后台内容编辑

### 文章和页面

文章编辑页支持：

- 类型：文章或页面；
- 状态：发布、草稿、隐藏；
- 标题；
- URL 别名；
- 封面；
- Markdown 正文；
- 分类；
- 标签；
- 发布时间；
- Markdown 预览；
- 可配置的文字与图片 Emoji 表情；
- 当前内容附件。

### 闪念

闪念使用 `type = memo`：

- 隐藏标题、Slug、分类和封面；
- 标题根据发布时间自动生成；
- 支持标签；
- 前台没有独立详情页。

### 草稿和附件关联

打开新建内容页时会先创建草稿并取得 CID。之后从编辑页上传的普通附件和封面均使用：

```text
blog_contents.parent = 当前内容 CID
```

独立附件、头像和友链图标等没有所属内容的文件使用 `parent = 0`。

删除文章、页面或闪念时，同时删除其子附件记录和 R2 对象。

## 数据模型

### blog_contents

统一保存内容和附件：

```text
post  文章
page  页面
memo  闪念
atta  附件
```

主要字段：

```text
cid       自增主键
parent    附件所属内容 CID，普通内容为 0
created   创建时间
modified  最后修改时间
released  发布时间
cover     封面相对路径或外部 URL
type      内容类型
status    publish / draft / hidden
```

约束和索引：

- 同一 `type` 下 `slug` 唯一；
- `post` 和 `page` 的公开 Slug 全局唯一；
- 按类型、状态、发布时间建立查询索引；
- 按类型、父 CID、创建时间建立附件索引。

### blog_metas

保存 `category` 和 `tag`。`count` 通过 `blog_relationships` 的插入、删除触发器维护。

### blog_relationships

内容和分类、标签的多对多关系，联合主键为 `(cid, mid)`，外键使用级联删除。

### blog_comments

评论字段：

```text
id
name
email
site
text
created
cid
```

`cid` 关联文章或页面，内容删除时评论级联删除。

### blog_links

保存名称、URL、图标、描述和次序。列表按 `order DESC, id DESC` 排序。

### blog_options

Key/Value 设置表，保存站点信息、主题、分页、导航、附件模板和关于页资料。

### blog_sessions

保存后台会话令牌及过期时间。

## 默认设置

`src/lib/options.ts` 中的默认值：

```text
site_theme                  kehua
site_title                  Worker Blog
site_description            Stay Young, Stay Simple.
posts_per_page              10
memos_per_page              20
archives_per_page           50
comments_per_page           20
admin_contents_per_page     25
admin_memos_per_page        25
admin_comments_per_page     20
admin_attachments_per_page  30
comments_enabled            false
comment_notification_from   空
comment_notification_to     空
file_cdn_url                空
image_compression_quality   80（1–100，100 表示不压缩）
emoji_items                 默认 Emoji 列表，图片表情“滑稽”位于首项
site_timezone               Asia/Shanghai
favicon_text                B
favicon_color               #999999
```

还包括：

```text
footer_info
about_avatar
about_github
about_x
about_rss
about_email
navigation_menu
attachment_templates
```

设置读取失败时使用规范化后的默认值。

### 图片上传压缩

后台的文章附件、封面、全局附件、头像和友链图标在上传前读取 `image_compression_quality`。值按 1–100 的整数规范化，默认 80，100 表示不压缩。实际浏览器压缩函数位于 `static/admin/image-compression.js`，由 `static/admin/admin.js` 的全部上传入口统一调用。

JPEG、WebP、AVIF 使用浏览器编码器的质量参数；PNG 先根据质量值进行颜色量化，再保持 `image/png` 重新编码。只有输出 MIME 与原文件一致且结果更小时才替换上传文件；动画图片、不支持的格式或编码失败时上传原文件。上传状态会显示压缩前后的体积。

### Emoji 表情

Emoji 配置以 JSON 保存在 `blog_options.emoji_items`。设置页支持完整 JSON 数组，或每行一个 JSON 对象：

```json
[
  {
    "type": "url",
    "name": "滑稽",
    "value": "https://tb3.bdstatic.com/emoji/image_emoticon25@2x.png"
  },
  { "type": "str", "name": "酷", "value": "😎" }
]
```

`url` 类型支持相对 URL 和 http/https 绝对 URL，插入编辑器时生成 `<img class="emoji" src="...">`；`str` 类型直接插入字符。

## 导航系统

导航配置以 JSON 保存在：

```text
blog_options.navigation_menu
```

### 自带菜单

```text
home
memos
archives
categories
tags
links
```

自带菜单：

- 不能删除；
- URL 固定；
- 菜单名和次序可修改；
- 首页不能隐藏；
- 其他菜单可以隐藏。

### 新增菜单

新增菜单支持：

- 菜单名；
- URL；
- 是否显示；
- 次序；
- `page` 或 `about` 模板；
- 删除。

默认新增菜单为“关于”，指向 `/post/about`，使用 `about` 模板。

两个分组分别按次序升序排序；次序相同时按菜单名排序。前台可见菜单超过 8 个时，第 8 个起进入“更多”菜单。

## 主题系统

主题文件夹名与显示名：

```text
kehua    Kehua
writecho Writecho
printer  Printer
vermillion Vermillion
chatgpt  ChatGPT
```

`vermillion` 使用独立的 `src/views/themes/vermillion/` 组件目录与 `static/vermillion/` 静态资源目录。其页面结构以宣纸期刊为核心，左侧 rail 同时承载导航、标签和社交入口；首页包含卷首、朱砂印章和分栏文章卡；文章页包含目录、阅读进度、代码复制与回到顶部；闪念页使用服务端生成的年度活动热力图。

`chatgpt` 使用 `src/views/themes/chatgpt/` 与 `static/chatgpt/`。主题将博客页面组织成用户提问与站长回答的消息流，左侧固定栏承载菜单、站内搜索、最近文章和站点资料；顶部支持侧栏收起与深浅模式，底部输入框调用 `/api/search` 进行对话式搜索。文章、归档、分类、标签、友链、闪念、关于、评论和 404 均使用同一套 ChatGPT 风格组件，移动端侧栏自动切换为抽屉。

主题选择过程：

1. `getOptions()` 从 `options_cache` 或 D1 取得设置。
2. `normalizeThemeName()` 校验 `site_theme`。
3. 缺失、无效或数据库读取失败时回退到 `kehua`。
4. `getThemeComponents()` 返回相应的组件集合。
5. 主题 `Base` 使用 `themeAssetPath()` 加载主题静态资源。

### 主题组件契约

每个主题必须提供：

```text
NotFound
About
Archives
Base
Categories
Category
Comments
Index
Links
Memos
Page
Post
Tag
Tags
```

主题目录还包含 `partials/header`、`footer`、`pagination`、`post-card`，供主题内部组合使用。

路由层只依赖统一的主题组件接口，不依赖具体主题实现。

## 静态资源

Workers Static Assets 根目录：

```text
static/
```

后台资源：

```text
static/admin/admin.css
static/admin/admin.js
```

主题资源：

```text
static/<theme>/public.css
static/<theme>/public.js
static/<theme>/images/*
```

页面 URL：

```text
/admin/admin.css
/admin/admin.js
/<theme>/public.css
/<theme>/public.js
```

## 附件与 R2

### 存储格式

R2 对象 Key：

```text
年/月/UUID.扩展名
```

附件 JSON 保存在 `blog_contents.text`：

```json
{
  "key": "2026/07/UUID.png",
  "url": "/2026/07/UUID.png",
  "mime": "image/png",
  "size": 12345,
  "originalName": "image.png"
}
```

数据库保存相对路径，不保存站点域名或 CDN 域名。

### 公开 URL

未配置文件 CDN：

```text
/uploads + 相对路径
```

配置文件 CDN：

```text
file_cdn_url + 相对路径
```

`resolveUploadedUrls()` 在渲染 Markdown、封面和附件内容时统一解析相对路径。

### 上传接口

```text
POST /admin/api/attachments
DELETE /admin/api/attachments/:cid
```

上传时：

1. 校验文件和大小；
2. 校验父内容是否存在；
3. 使用当前年月和 UUID 生成 Key；
4. 写入 R2；
5. 插入 `type = atta` 的内容记录；
6. 返回附件信息和默认插入文本。

### 附件模板

模板以 JSON 保存在：

```text
blog_options.attachment_templates
```

默认模板：

```text
图片  ![FILE_NAME](RELATIVE_PATH)
视频  <video controls preload="metadata" src="RELATIVE_PATH">FILE_NAME</video>
文件  [FILE_NAME](RELATIVE_PATH)
```

插入时替换：

```text
FILE_NAME
RELATIVE_PATH
```

## 评论

`comments_enabled = true` 时，文章和页面详情显示评论表单和列表。

评论分页使用 `comments_per_page`。提交成功或评论翻页时，前端 JavaScript 更新评论区域，避免跳回页面顶部。

后台支持评论列表、按内容筛选、编辑和删除。

### 评论邮件提醒

设置页在“开启评论功能”下方提供并排的：

```text
comment_notification_from   评论提醒发件邮箱
comment_notification_to     评论提醒收件邮箱
```

两个值必须同时填写或同时留空，并使用统一邮箱格式规范化。收件邮箱必须是 Cloudflare 账户内已经验证的 Destination Address，发件邮箱必须属于已启用 Email Routing / Email Service 的域名。

评论写入 `blog_comments` 成功后，仅当 `comment_notification_from` 与 `comment_notification_to` 同时存在时，`src/lib/comment-notification.ts` 才生成纯文本和 HTML 邮件，并通过默认部署的 `BLOG_EMAIL` binding 异步发送。邮件包含内容标题、评论者资料、评论正文和详情链接，`replyTo` 使用评论者邮箱。

邮件发送通过 `executionCtx.waitUntil()` 执行。发送失败只写 Worker 日志，不回滚评论，也不改变访客看到的评论提交结果。

## 认证与安全

- 后台账号从 Worker Secrets 读取。
- 凭据使用常量时间比较。
- 会话 Cookie 名为 `blog_session`。
- Cookie 使用 `HttpOnly`、`SameSite=Lax`，HTTPS 下启用 `Secure`。
- 后台写操作进行 Origin 或 Referer 同源校验。
- 会话默认有效 10 天，剩余 2 天时续期。
- 登录时异步清理过期会话。

## 缓存

### options_cache

- 定义在 `src/lib/cache.ts`，是模块级普通对象 `options_cache = { key: value }`；
- 不使用 Workers Cache API，也不设置缓存时间；
- 保存规范化后的全部站点设置；
- 对象为空或内容无效时查询 `blog_options` 并回填；
- 保存设置、导航和附件模板时，数据库成功后直接同步完整对象；
- 导入数据后从 `blog_options` 重新加载并覆盖对象。

### sessions_cache

- 定义在 `src/lib/cache.ts`，是模块级普通对象 `sessions_cache = { [cookie]: expired }`；
- 直接使用会话 Cookie 作为属性名，不使用 Workers Cache API；
- 不设置额外缓存时间，会话有效性只由值 `expired` 判断；
- 内存未命中时才查询 `blog_sessions`，有效记录会回填；
- 登录、续期、退出和过期时同步更新内存对象与数据库。

模块级对象只存在于当前 Worker 实例中。实例被回收、重新启动或请求落到其他实例时会从 D1 回填；同一实例内正常命中不访问 D1。

## 数据导入和导出

导出版本：

```text
1
```

导出表：

```text
blog_contents
blog_metas
blog_relationships
blog_options
blog_links
blog_comments
```

不导出：

```text
blog_sessions
R2 文件本体
```

导入只接受当前版本和当前字段集合：

- 自增表保留原主键直接 INSERT；
- 非自增表使用 `ON CONFLICT` 更新或插入；
- 导入冲突返回 409；
- 导入完成后从 `blog_options` 重新加载并覆盖设置缓存。

## Schema 与 Seed

### Schema

`schema.sql` 使用 `CREATE TABLE IF NOT EXISTS`、索引和触发器定义完整数据库结构。

项目不维护 migrations。现有数据库发生不兼容结构变化时，需要手动处理或重新创建。

### Seed

当前 `seed.sql` 包含：

```text
300 篇文章
1 个页面
90 条闪念
600 条评论
3 个分类
10 个标签
6 条友链
26 项设置
```

Seed 只用于开发和演示，会先清理业务数据。

## GitHub Actions 部署

`.github/workflows/deploy.yml` 使用 `workflow_dispatch` 手动触发。

### Secrets

```text
CF_TOKEN
ADMIN_NAME
ADMIN_PSWD
```

### Variables

工作流使用以下 Variables 生成 `wrangler.toml` 并初始化远程 D1：

```text
WORKER_NAME
WORKER_DOMAIN       可选
MAX_UPLOAD_MB
D1_NAME
D1_ID
R2_NAME
```

D1 绑定和远程 `schema.sql` 执行命令统一使用 `D1_NAME`。

### 当前工作流步骤

1. `actions/checkout@v4`；
2. `actions/setup-node@v4`，Node.js 26；
3. `npm install`；
4. 动态生成 `wrangler.toml`；
5. `wrangler-action@v3` 执行远程 `schema.sql`；
6. `wrangler-action@v3` 设置后台 Secrets，并绑定 D1、R2、`BLOG_EMAIL` 后部署。

工作流默认向生成的 `wrangler.toml` 加入：

```toml
[[send_email]]
name = "BLOG_EMAIL"
```

是否实际发送由后台两个邮箱设置控制：只有发件邮箱和收件邮箱同时配置时，评论提交链路才调用邮件 binding。

工作流当前不会自动执行：

```text
npm run typecheck
seed.sql
```

`WORKER_DOMAIN` 为空时开启 `workers.dev` 和 Preview URL；配置后关闭两者并创建 Custom Domain。

## 本地开发流程

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:schema:local
npm run db:seed:local
npm run typecheck
npm run dev
```

数据库结构变化后：

```bash
rm -rf .wrangler
npm run db:schema:local
npm run db:seed:local
```

## 发布检查

发布前至少检查：

1. `npm run typecheck`；
2. 前后台 JavaScript 语法；
3. Schema 和 Seed 可完整执行；
4. SQLite 完整性及外键；
5. 前台全部主题路由；
6. 后台登录、上传、评论和导入导出；
7. GitHub Actions Variables、Secrets 和 D1 名称一致性。

## 文档约定

README 和 PROJECT 描述当前项目结构、运行方式和实现约束，不记录历史变迁。
