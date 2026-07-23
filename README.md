# worker-blog

`worker-blog` 是一个运行在 Cloudflare Workers 上的轻量博客系统，使用 Hono JSX 负责服务端渲染，D1 保存文章与站点数据，R2 保存上传附件，Workers Static Assets 提供前后台 CSS、JavaScript 和主题图片。

主要功能包括文章、独立页面、闪念、分类、标签、评论、友链、附件、附件模板、前台导航、后台管理、Atom 订阅、多主题切换，以及站点设置和后台会话缓存。

## 技术栈

- Cloudflare Workers
- Hono + Hono JSX
- Cloudflare D1
- Cloudflare R2
- Workers Static Assets
- Workers Cache API
- TypeScript

## 项目结构

```text
.github/workflows/
└── deploy.yml                 GitHub Actions 一键部署
src/
├── index.tsx                  Worker 入口
├── theme.ts                   主题名称映射、默认主题与资源路径
├── routes/
│   ├── admin.tsx              后台路由
│   └── public.tsx             前台路由
├── lib/                       数据库、缓存、认证、Markdown 等公共逻辑
└── views/
    ├── admin/                 后台 JSX 页面
    └── themes/
        ├── theme.ts           主题组件注册表
        ├── kehua/
        ├── writecho/
        └── printer/
static/
├── admin/
│   ├── admin.css
│   └── admin.js
├── kehua/
├── writecho/
└── printer/
schema.sql                     当前完整数据库结构
seed.sql                       本地模拟数据
wrangler.toml                  本地与手动部署配置
```

## 主题框架

主题文件夹名和后台显示名统一定义在 `src/theme.ts`：

```ts
export const THEME_NAMES = {
  kehua: "Kehua",
  writecho: "Writecho",
  printer: "Printer",
} as const;
```

数据库中的 `blog_options.site_theme` 保存主题文件夹名。设置缺失、设置无效或数据库读取失败时，使用 `kehua`。

每个主题由 JSX 组件和静态资源两部分组成。

### JSX 目录

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
└── images/                    可选
```

前台资源地址由 `themeAssetPath()` 根据当前主题生成，例如：

```text
/kehua/public.css
/writecho/public.js
/printer/images/default-cover.svg
```

### 新增主题

1. 复制一个现有主题目录到 `src/views/themes/<新主题名>/`。
2. 复制对应静态资源到 `static/<新主题名>/`。
3. 保持组件导出名称和现有主题一致。
4. 在 `src/theme.ts` 的 `THEME_NAMES` 中加入文件夹名与显示名。
5. 在 `src/views/themes/theme.ts` 中导入并注册全部组件。
6. 执行 `npm run typecheck`，再从后台“设置 → 站点主题”切换测试。

## GitHub Actions 一键部署

工作流文件为：

```text
.github/workflows/deploy.yml
```

它会执行以下步骤：

1. 安装依赖并进行 TypeScript 检查。
2. 根据 GitHub Variables 动态生成生产环境 `wrangler.toml`。
3. 对远程 D1 执行 `schema.sql`。
4. 写入后台账号 Secrets。
5. 部署 Worker、静态资源并绑定 D1 与 R2。

### 1. Fork 仓库

先在 GitHub 打开本项目仓库，点击右上角的 **Fork**，将仓库复制到自己的 GitHub 账号下。后续 Secrets、Variables 和 Actions 都应在自己 Fork 后的仓库中配置。

Fork 完成后，进入自己的仓库：

```text
GitHub 用户名/worker-blog
```

### 2. 预先创建 Cloudflare 资源

先在 Cloudflare 创建：

- 一个 D1 数据库；
- 一个 R2 Bucket；
- 一个用于 GitHub Actions 部署的 API Token。

记录 D1 的名称和 ID，以及 R2 Bucket 名称。

#### CF_TOKEN 权限

推荐创建自定义 API Token，并将资源范围限制到实际部署所使用的 Cloudflare 账户和域名。当前工作流需要以下权限：

**账户权限：**

| 权限               | 级别 | 用途                                       |
| ------------------ | ---- | ------------------------------------------ |
| Account Settings   | Read | 让 Wrangler 读取目标账户信息               |
| Workers Scripts    | Edit | 部署 Worker、静态资源并写入 Worker Secrets |
| D1                 | Edit | 对远程 D1 执行 `schema.sql`                |
| Workers R2 Storage | Edit | 读取并绑定现有 R2 Bucket                   |

**域名权限（仅配置 `WORKER_DOMAIN` 时需要）：**

| 权限           | 级别 | 用途                           |
| -------------- | ---- | ------------------------------ |
| Workers Routes | Edit | 为 Worker 创建或更新自定义域名 |

资源范围建议设置为：

- Account Resources：只包含部署 `worker-blog` 的账户；
- Zone Resources：只包含 `WORKER_DOMAIN` 所属域名；
- 未使用自定义域名时，可以不添加 Zone 权限。

也可以先使用 Cloudflare 的 **Edit Cloudflare Workers** Token 模板，再补充 `D1 Edit` 权限，并将账户、域名范围收紧到实际资源。

Cloudflare 官方参考：

- API Token 创建：<https://developers.cloudflare.com/fundamentals/api/get-started/create-token/>
- 权限列表：<https://developers.cloudflare.com/fundamentals/api/reference/permissions/>
- GitHub Actions 部署：<https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/>

### 3. 配置 GitHub Secrets

进入 Fork 后的仓库：

```text
Settings → Secrets and variables → Actions → Secrets
```

添加：

| 名称         | 说明                                |
| ------------ | ----------------------------------- |
| `CF_TOKEN`   | 具有上述权限的 Cloudflare API Token |
| `ADMIN_NAME` | 后台登录用户名                      |
| `ADMIN_PSWD` | 后台登录密码                        |

### 4. 配置 GitHub Variables

进入：

```text
Settings → Secrets and variables → Actions → Variables
```

添加：

| 名称            | 必填 | 示例                                   | 说明                                                 |
| --------------- | ---- | -------------------------------------- | ---------------------------------------------------- |
| `WORKER_NAME`   | 是   | `worker-blog`                          | Worker 名称                                          |
| `WORKER_DOMAIN` | 否   | `blog.example.com`                     | 自定义域名，不带协议和路径；留空时使用 `workers.dev` |
| `MAX_UPLOAD_MB` | 是   | `25`                                   | Worker 接口允许的单文件大小，单位 MB                 |
| `D1_NAME`       | 是   | `worker-blog`                          | D1 数据库名称                                        |
| `D1_ID`         | 是   | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | D1 数据库 ID                                         |
| `R2_NAME`       | 是   | `worker-blog-assets`                   | R2 Bucket 名称                                       |

配置 `WORKER_DOMAIN` 前，需要先将该域名托管到同一个 Cloudflare 账户中，并确保对应 Zone 处于有效状态。该值只填写主机名，例如：

```text
blog.example.com
```

不要填写：

```text
https://blog.example.com/
```

如果目标主机名已经存在 CNAME 记录，需要先处理冲突，否则 Cloudflare 无法为 Worker 创建 Custom Domain。

### 5. 后台设置推荐

首次部署并登录后台后，建议在“设置”中配置 **文件 CDN 域名**，例如绑定到 R2 Bucket 的自定义域名：

```text
https://static.example.com
```

数据库只保存 `/2026/07/文件名` 形式的相对路径。配置文件 CDN 域名后，前台附件会直接使用：

```text
https://static.example.com/2026/07/文件名
```

这样图片和附件由 R2 公共域名或其他兼容 CDN 直接返回，不需要每次经过博客 Worker 的 `/uploads/*` 代理，可减少 Worker 请求和运行开销，并且后续更换 R2、自建 CDN、七牛云等存储域名时无需批量修改数据库内容。

文件 CDN 域名应填写完整协议和域名，末尾是否带 `/` 均可，系统会统一处理。没有配置时，附件仍会通过：

```text
/uploads/2026/07/文件名
```

由 Worker 从私有 R2 读取并返回。

### 6. 运行部署

进入 Fork 后仓库的 Actions 页面：

```text
Actions → Deploy Worker → Run workflow
```

生产部署只执行 `schema.sql`，不会导入 `seed.sql` 模拟数据。首次部署后可直接登录后台创建正式内容；确实需要模拟数据时，再手动执行远程 Seed 命令。项目不使用 migrations，因此已经存在的生产数据库如遇不兼容结构变化，需要手动调整或重新创建 D1。

## 本地运行

### 1. 安装依赖

```bash
npm ci
```

### 2. 配置本地后台账号

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` 示例：

```text
ADMIN_NAME=admin
ADMIN_PSWD=12345678
MAX_UPLOAD_MB=25
```

`wrangler.toml` 中的 D1 ID 可以保留本地占位值；R2 `bucket_name` 需要与本地开发使用的绑定名称一致。

### 3. 初始化本地数据库

```bash
npm run db:schema:local
npm run db:seed:local
```

项目处于初始开发阶段，不使用 migrations。数据库结构变化后，可删除 `.wrangler/` 再重新执行以上命令。

### 4. 启动

```bash
npm run dev
```

默认访问地址通常为：

```text
http://localhost:8787
http://localhost:8787/admin/login
```

## 手动部署

### 1. 登录并创建资源

```bash
npx wrangler login
npx wrangler d1 create worker-blog
npx wrangler r2 bucket create worker-blog-assets
```

将创建结果写入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "BLOG_DB"
database_name = "worker-blog"
database_id = "你的 D1 ID"

[[r2_buckets]]
binding = "BLOG_R2"
bucket_name = "worker-blog-assets"
```

如需自定义域名，可加入：

```toml
workers_dev = false
preview_urls = false

[[routes]]
pattern = "blog.example.com"
custom_domain = true
```

### 2. 写入生产 Secrets

```bash
npx wrangler secret put ADMIN_NAME
npx wrangler secret put ADMIN_PSWD
```

### 3. 检查、初始化并部署

```bash
npm ci
npm run typecheck
npm run db:schema:remote
npm run deploy
```

可选的远程模拟数据：

```bash
npm run db:seed:remote
```

注意：`seed.sql` 会清理并重建模拟业务数据，不应对已有正式数据的生产数据库执行。

## 数据与缓存

- `blog_contents`：文章、页面、闪念和附件。
- `blog_metas`：分类与标签。
- `blog_relationships`：内容与分类、标签关系。
- `blog_comments`：评论。
- `blog_links`：友链。
- `blog_options`：站点、主题、导航、分页和附件模板设置。
- `blog_cookies`：后台会话。

站点设置使用 `options_cache`，后台会话使用 `sessions_cache`。缓存未命中或不可用时会回退到 D1；保存设置、登录、续期和退出时会同步更新或清理对应缓存。

## 静态资源

`static/` 由 Workers Static Assets 发布：

- 后台：`/admin/admin.css`、`/admin/admin.js`
- 前台：`/<主题文件夹>/public.css`、`/<主题文件夹>/public.js`
- 主题图片：`/<主题文件夹>/images/...`

R2 上传文件在数据库中保存相对路径。未配置“文件 CDN 域名”时通过 `/uploads/*` 由 Worker 读取 R2；配置后按 CDN 域名拼接文件路径。
