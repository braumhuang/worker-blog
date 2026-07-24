# worker-blog

`worker-blog` 是一个运行在 Cloudflare Workers 上的轻量博客系统。前台和后台均使用 Hono JSX 服务端渲染，D1 保存业务数据，R2 保存上传文件，Workers Static Assets 发布主题及后台静态资源，Worker 实例内的模块级内存对象缓存站点设置和后台会话。

项目适合个人博客、小型内容站点和 Cloudflare 全栈应用的学习与二次开发。

## 主要功能

- 文章、独立页面、闪念和定时发布
- Markdown 编辑、预览、快捷格式按钮和文章封面
- 分类、标签、归档、全文搜索和 Atom 订阅
- 文章及页面评论，前后台独立分页
- 前台导航管理，自带菜单与新增菜单分组
- 友链管理
- R2 附件上传、文章附件关联和附件模板
- JSON 数据导入、导出
- Kehua、Writecho、Printer、Vermillion、Simplecho、ChatGPT 六套前台主题
- 后台登录会话和站点设置缓存
- GitHub Actions 手动一键部署

## 技术栈

- Cloudflare Workers
- Hono + Hono JSX
- TypeScript
- Cloudflare D1
- Cloudflare R2
- Workers Static Assets
- Worker 实例内存缓存
- Marked

## 项目结构

```text
.github/
└── workflows/
    └── deploy.yml                 GitHub Actions 部署工作流
src/
├── index.tsx                      Worker 入口、Favicon、R2 文件代理
├── theme.ts                       主题名称映射、默认主题和资源路径
├── types.ts                       项目类型定义
├── lib/
│   ├── attachment-templates.ts    附件模板
│   ├── auth.ts                    后台认证与会话
│   ├── cache.ts                   options_cache、sessions_cache
│   ├── db.ts                      D1 查询封装
│   ├── favicon.ts                 动态 Favicon
│   ├── markdown.ts                Markdown 渲染
│   ├── navigation.ts              前台导航配置
│   ├── options.ts                 站点设置及默认值
│   └── utils.ts                   时间、附件、文本等工具
├── routes/
│   ├── admin.tsx                  后台路由和管理操作
│   └── public.tsx                 前台路由和数据查询
└── views/
    ├── admin/                     后台 JSX 页面
    └── themes/
        ├── theme.ts               主题组件注册表
        ├── kehua/
        ├── writecho/
        ├── printer/
        ├── vermillion/
        ├── simplecho/
        └── chatgpt/
static/
├── admin/
│   ├── admin.css
│   └── admin.js
├── kehua/
├── writecho/
├── printer/
├── vermillion/
├── simplecho/
└── chatgpt/
schema.sql                         当前完整数据库结构
seed.sql                           本地开发模拟数据
wrangler.toml                      本地运行和手动部署配置
package.json
```

## 前台主题框架

主题文件夹名和后台显示名定义在 `src/theme.ts`：

```ts
export const THEME_NAMES = {
  kehua: "Kehua",
  writecho: "Writecho",
  printer: "Printer",
  vermillion: "Vermillion",
  simplecho: "Simplecho",
  chatgpt: "ChatGPT",
} as const;
```

`blog_options.site_theme` 保存主题文件夹名。设置不存在、设置值无效或数据库读取失败时，默认使用 `kehua`。

内置主题定位：

- `kehua`：清爽的内容列表与阅读布局。
- `writecho`：文艺杂志式博客排版。
- `printer`：打字机与纸张风格。
- `vermillion`：朱砂宣纸期刊风格，包含罗马数字侧栏、标签墙、卷首、朱印、明暗模式、搜索、文章目录、阅读进度和闪念热力图。
- `simplecho`：极简卡片博客风格，使用 1000px 居中容器、左文右图文章卡、`# 分类 # 标签` 元信息、四套读者配色、自动深色、搜索、阅读进度和 `STAY VIBRANT` 页脚。
- `chatgpt`：ChatGPT 对话式界面，包含会话侧栏、最近文章、用户与 AI 消息流、深浅模式、弹窗搜索、底部对话搜索、文章操作按钮、闪念热力图和移动端抽屉布局。

### JSX 组件目录

每个主题应提供下面的结构：

```text
src/views/themes/<theme>/
├── 404.tsx
├── about.tsx
├── archives.tsx
├── base.tsx
├── categories.tsx
├── category.tsx
├── index.tsx
├── links.tsx
├── memos.tsx
├── page.tsx
├── post.tsx
├── tag.tsx
├── tags.tsx
└── partials/
    ├── comments.tsx
    ├── footer.tsx
    ├── header.tsx
    ├── pagination.tsx
    └── post-card.tsx
```

### 静态资源目录

```text
static/<theme>/
├── public.css
├── public.js
└── images/                        可选
```

资源路径由 `themeAssetPath()` 拼接，例如：

```text
/kehua/public.css
/writecho/public.js
/printer/images/default-cover.svg
/simplecho/public.css
/chatgpt/public.js
```

### 新增主题

1. 复制一个现有主题目录到 `src/views/themes/<新主题名>/`。
2. 复制对应静态资源到 `static/<新主题名>/`。
3. 保持各 JSX 组件的导出名称与现有主题一致。
4. 在 `src/theme.ts` 的 `THEME_NAMES` 中添加文件夹名和显示名。
5. 在 `src/views/themes/theme.ts` 中导入并注册全部组件。
6. 执行 `npm run typecheck`。
7. 在后台“设置 → 站点主题”中切换并检查全部前台页面。

## GitHub Actions 一键部署

工作流位于：

```text
.github/workflows/deploy.yml
```

工作流通过 `workflow_dispatch` 手动触发，当前执行过程为：

1. 检出仓库。
2. 使用 Node.js 26。
3. 执行 `npm install`。
4. 根据 GitHub Variables 生成临时 `wrangler.toml`。
5. 对远程 D1 执行 `schema.sql`。
6. 写入 `ADMIN_NAME`、`ADMIN_PSWD` Secrets。
7. 部署 Worker、Static Assets，并绑定 D1 和 R2。

生产工作流不会执行 `seed.sql`。

### 1. Fork 仓库

先在 GitHub 打开本项目仓库，点击右上角 **Fork**，将项目复制到自己的 GitHub 账号。

后续 Secrets、Variables 和 Actions 均在 Fork 后的仓库中配置：

```text
你的 GitHub 用户名/worker-blog
```

### 2. 创建 Cloudflare 资源

在同一个 Cloudflare 账户中创建：

- 一个 D1 数据库；
- 一个 R2 Bucket；
- 一个用于 GitHub Actions 的 API Token。

记录 D1 数据库名称、D1 ID 和 R2 Bucket 名称。

### 3. 配置 CF_TOKEN 权限

可以使用 Cloudflare 的 **Edit Cloudflare Workers** Token 模板作为基础，并把资源范围限制在实际使用的账户和域名。

本项目建议至少包含：

| 资源    | 权限                     | 用途                                   |
| ------- | ------------------------ | -------------------------------------- |
| Account | Account Settings: Read   | 读取目标账户信息                       |
| Account | Workers Scripts: Edit    | 部署 Worker、静态资源和 Worker Secrets |
| Account | D1: Edit                 | 对远程 D1 执行 `schema.sql`            |
| Account | Workers R2 Storage: Edit | 使用和绑定 R2 Bucket                   |
| Zone    | Workers Routes: Edit     | 仅配置 `WORKER_DOMAIN` 时需要          |

资源范围建议只包含部署本项目的 Cloudflare 账户；使用自定义域名时，Zone 范围只选择该域名。

官方文档：

- <https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/>
- <https://developers.cloudflare.com/fundamentals/api/reference/permissions/>
- <https://github.com/cloudflare/wrangler-action>

### 4. 配置 GitHub Secrets

进入：

```text
Settings → Secrets and variables → Actions → Secrets
```

添加：

| 名称         | 说明                 |
| ------------ | -------------------- |
| `CF_TOKEN`   | Cloudflare API Token |
| `ADMIN_NAME` | 后台登录用户名       |
| `ADMIN_PSWD` | 后台登录密码         |

### 5. 配置 GitHub Variables

进入：

```text
Settings → Secrets and variables → Actions → Variables
```

添加：

| 名称            | 必填 | 示例                                   | 说明                                    |
| --------------- | ---- | -------------------------------------- | --------------------------------------- |
| `WORKER_NAME`   | 是   | `worker-blog`                          | Worker 名称                             |
| `WORKER_DOMAIN` | 否   | `blog.example.com`                     | 自定义域名；留空使用 `workers.dev`      |
| `MAX_UPLOAD_MB` | 是   | `25`                                   | 后台单文件上传限制，代码最大接受 100 MB |
| `D1_NAME`       | 是   | `worker-blog`                          | 写入 `wrangler.toml` 的 D1 数据库名称   |
| `D1_ID`         | 是   | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | D1 数据库 ID                            |
| `R2_NAME`       | 是   | `worker-blog-assets`                   | R2 Bucket 名称                          |

工作流生成 `wrangler.toml` 和执行远程 `schema.sql` 时统一使用 `D1_NAME`，不需要额外配置其他数据库名称变量。

### 6. 配置 WORKER_DOMAIN

填写 `WORKER_DOMAIN` 前，域名必须位于同一个 Cloudflare 账户，且对应 Zone 处于 Active 状态。填写主机名，不要包含协议、路径或末尾斜杠：

```text
blog.example.com
```

不要填写：

```text
https://blog.example.com/
```

当前工作流使用 Workers Custom Domain。目标主机名不能存在冲突的 CNAME 记录。

留空 `WORKER_DOMAIN` 时，工作流会启用：

```toml
workers_dev = true
preview_urls = true
```

填写后则使用：

```toml
workers_dev = false
preview_urls = false

[[routes]]
pattern = "blog.example.com"
custom_domain = true
```

Cloudflare Custom Domains 文档：

- <https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>

### 7. 运行部署

进入 Fork 后仓库：

```text
Actions → Deploy Worker → Run workflow
```

项目使用完整 `schema.sql`，不使用 migrations。工作流每次都会执行 `CREATE TABLE IF NOT EXISTS` 和索引、触发器定义，但不会自动修改已经存在且结构不兼容的旧表。

### 8. 后台设置推荐

首次部署并登录后台后，建议配置 **文件 CDN 域名**，例如 R2 Bucket 的自定义公开域名：

```text
https://static.example.com
```

数据库中的附件路径只保存为：

```text
/2026/07/文件名.png
```

未配置文件 CDN 域名时，前台地址为：

```text
/uploads/2026/07/文件名.png
```

请求会进入 Worker，再由 `BLOG_R2` 读取文件。

配置后，前台地址为：

```text
https://static.example.com/2026/07/文件名.png
```

这样文件可以直接由 R2 公共域名、七牛云或其他 CDN 返回，减少博客 Worker 的代理请求和运行开销。以后更换 CDN 时只需修改后台设置，不需要批量更新数据库中的附件路径。

## 本地运行

### 1. 环境要求

- Node.js 26，或与当前依赖兼容的较新 Node.js 版本
- npm
- Cloudflare Wrangler

### 2. 安装依赖

```bash
npm install
```

也可以基于现有 `package-lock.json` 使用：

```bash
npm ci
```

### 3. 配置本地后台账号

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars.example` 内容：

```text
ADMIN_NAME=admin
ADMIN_PSWD=12345678
```

上传大小由 `wrangler.toml` 控制：

```toml
[vars]
MAX_UPLOAD_MB = "25"
```

### 4. 初始化本地 D1

```bash
npm run db:schema:local
npm run db:seed:local
```

当前 Seed 包含：

- 300 篇文章；
- 1 个页面；
- 90 条闪念；
- 600 条评论；
- 3 个分类；
- 10 个标签；
- 6 条友链。

项目处于初始开发阶段，不维护 migrations。修改数据库结构后，删除本地 `.wrangler/`，再重新执行 Schema 和 Seed 命令。

### 5. 启动开发服务

```bash
npm run dev
```

默认地址通常为：

```text
http://localhost:8787
http://localhost:8787/admin/login
```

### 6. 类型检查

```bash
npm run typecheck
```

## 手动部署

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

### 2. 创建 D1 和 R2

```bash
npx wrangler d1 create worker-blog
npx wrangler r2 bucket create worker-blog-assets
```

把实际资源写入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "BLOG_DB"
database_name = "worker-blog"
database_id = "你的 D1 ID"

[[r2_buckets]]
binding = "BLOG_R2"
bucket_name = "worker-blog-assets"
```

### 3. 可选：配置自定义域名

```toml
workers_dev = false
preview_urls = false

[[routes]]
pattern = "blog.example.com"
custom_domain = true
```

### 4. 写入生产 Secrets

```bash
npx wrangler secret put ADMIN_NAME
npx wrangler secret put ADMIN_PSWD
```

### 5. 初始化 D1 并部署

```bash
npm install
npm run typecheck
npm run db:schema:remote
npm run deploy
```

`seed.sql` 是开发模拟数据，并且会先清理业务表。不要对已有正式数据的生产数据库执行：

```bash
npm run db:seed:remote
```

## npm scripts

| 命令                       | 作用                           |
| -------------------------- | ------------------------------ |
| `npm run dev`              | 启动本地 Wrangler 开发服务     |
| `npm run deploy`           | 部署 Worker                    |
| `npm run typecheck`        | TypeScript 类型检查            |
| `npm run cf-typegen`       | 生成 Cloudflare 绑定类型       |
| `npm run db:schema:local`  | 初始化本地 D1 Schema           |
| `npm run db:schema:remote` | 初始化远程 D1 Schema           |
| `npm run db:seed:local`    | 导入本地模拟数据               |
| `npm run db:seed:remote`   | 导入远程模拟数据，生产环境慎用 |

## 前台路由

| 路径                   | 说明                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `/`                    | 文章首页                                                                                    |
| `/post/:slug/`         | 文章或页面详情                                                                              |
| `/memos/`              | 闪念                                                                                        |
| `/archives/`           | 归档                                                                                        |
| `/categories/`         | 分类列表                                                                                    |
| `/category/:slug/`     | 分类文章列表                                                                                |
| `/tags/`               | 标签列表                                                                                    |
| `/tag/:slug/`          | 标签文章列表                                                                                |
| `/links/`              | 友链                                                                                        |
| `/api/search?q=关键词` | 前台搜索 API                                                                                |
| `/atom.xml`            | Atom 订阅，只输出文章列表同款摘要；有 `<!-- more -->` 时显示标记前全部内容，否则截取 200 字 |
| `/favicon.svg`         | 动态 Favicon                                                                                |
| `/uploads/*`           | Worker 代理读取 R2 文件                                                                     |

只有满足以下条件的内容会在前台公开：

```text
status = publish
released <= 当前时间
```

首页、归档、分类和标签只显示 `post`；`page` 通过详情地址访问；`memo` 只显示在闪念页和搜索结果中。

## 数据模型

| 表                   | 用途                                   |
| -------------------- | -------------------------------------- |
| `blog_contents`      | 文章、页面、闪念、附件                 |
| `blog_metas`         | 分类、标签                             |
| `blog_relationships` | 内容与分类、标签的多对多关系           |
| `blog_comments`      | 文章和页面评论                         |
| `blog_links`         | 友链                                   |
| `blog_options`       | 站点、主题、导航、分页、附件模板等设置 |
| `blog_sessions`      | 后台登录会话                           |

`blog_contents.type` 支持：

```text
post
page
memo
atta
```

附件通过 `parent` 关联所属文章、页面或闪念，文件元数据保存在附件记录的 `text` JSON 中。

## 数据导入与导出

后台“设置 → 数据管理”可以导出和导入 JSON。

导出包含：

```text
blog_contents
blog_metas
blog_relationships
blog_options
blog_links
blog_comments
```

不包含：

- `blog_sessions`；
- R2 文件本体。

当前导出格式版本为 `1`，导入只接受相同版本和当前字段结构。自增主键表保留主键直接插入；非自增表按主键更新或插入。

## 缓存

### options_cache

`options_cache` 是 `src/lib/cache.ts` 中的模块级普通对象，结构为 `{ key: value }`，不使用 Workers Cache API，也不设置缓存时间。读取优先使用该对象；对象为空或内容无效时才读取 `blog_options`，并将规范化后的完整设置写回内存。

后台保存站点设置、导航和附件模板时，先写入 `blog_options`，数据库写入成功后立即把合并后的完整设置同步到 `options_cache`。导入数据后也会从 `blog_options` 重新加载并覆盖缓存。

### sessions_cache

`sessions_cache` 是 `src/lib/cache.ts` 中的模块级普通对象，结构为 `{ [cookie]: expired }`，直接以后台会话 Cookie 为键，不使用 Workers Cache API，也不设置额外缓存时间。后台请求优先读取该对象；缓存未命中时才查询 `blog_sessions`，有效会话会立即写回内存。

会话是否有效只由记录中的 `expired` 判断。后台会话默认有效期为 10 天，剩余 2 天时自动续期；登录、续期、退出和过期处理都会同步更新 `blog_sessions` 与 `sessions_cache`。

模块级内存对象只属于当前 Worker 实例。实例被回收、重新启动或请求落到其他实例时，内存缓存可能为空，此时会自动回退到 D1 并重新填充；同一实例内正常命中不会读取 D1。

## 静态资源与附件

`wrangler.toml` 的 `[assets]` 指向：

```text
./static
```

后台资源：

```text
/admin/admin.css
/admin/admin.js
```

主题资源：

```text
/<主题文件夹>/public.css
/<主题文件夹>/public.js
/<主题文件夹>/images/...
```

R2 上传对象 Key 格式为：

```text
年/月/UUID.扩展名
```

数据库保存的相对路径为：

```text
/年/月/UUID.扩展名
```

`/uploads/*` 支持普通读取和 HTTP Range 请求，适用于视频等需要分段加载的文件。

## 开发约定

- 数据库结构直接维护在 `schema.sql`。
- 项目不维护 migrations。
- 数据库结构变化后，本地删除 `.wrangler/` 并重新初始化。
- `seed.sql` 仅用于开发和演示。
- README 和 PROJECT 只描述当前项目实现，不记录历史变迁。
