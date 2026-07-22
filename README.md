# worker-blog

## 项目简介

`worker-blog` 是一个运行在 Cloudflare Workers 上的轻量个人博客，使用 Hono、Hono JSX、D1 和 R2 构建。

项目提供文章、页面、闪念、分类、标签、附件、友链、搜索、深浅模式和响应式前台，同时带有完整的内容管理后台。前台按照 Winston 使用的 Kehua“留白”主题重构，保持 720px 窄幅单栏、克制留白、文章卡片、封面图、时间轴、搜索弹窗和 About 资料头部的视觉风格；后台采用 Typecho 风格的导航、表单、表格和内容编辑布局。网站标题、描述、分页、时区、页脚、SVG Favicon，以及 About 页头像和社交链接都可以在后台“设置”中维护。

技术与功能细节、数据库结构、路由和设计说明见 [PROJECT.md](./PROJECT.md)。

## 本地运行

环境要求：

- Node.js 22 或更高版本
- npm
- Cloudflare Wrangler

安装依赖：

```bash
npm install
```

复制本地变量示例：

```bash
cp .dev.vars.example .dev.vars
```

初始化本地 D1 数据库：

```bash
npm run db:reset:local
```

该命令会依次执行 `schema.sql` 和 `seed.sql`。`seed.sql` 会清空已有内容并写入开发模拟数据，请勿用于需要保留数据的数据库。

从不含 `cover` 字段的旧版本数据库升级时，只执行一次：

```bash
npm run db:migrate:cover:local
```

启动本地开发服务：

```bash
npm run dev
```

访问地址：

- 前台：`http://localhost:8787/`
- 后台：`http://localhost:8787/admin`

管理员账号来自 `.dev.vars` 或 `wrangler.toml` 中的 `ADMIN_NAME` 和 `ADMIN_PSWD`。项目示例统一使用密码 `12345678`。

## 如何部署

创建 D1 数据库：

```bash
npx wrangler d1 create worker-blog
```

将返回的数据库 ID 写入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "BLOG_DB"
database_name = "worker-blog"
database_id = "你的 D1 数据库 ID"
```

创建 R2 Bucket：

```bash
npx wrangler r2 bucket create worker-blog-assets
```

确认 `wrangler.toml` 中的 Bucket 名称一致：

```toml
[[r2_buckets]]
binding = "BLOG_R2"
bucket_name = "worker-blog-assets"
```

生产环境使用 Secret 保存管理员密码时，值同样设为 `12345678`：

```bash
npx wrangler secret put ADMIN_PSWD
```

初始化全新远程数据库结构：

```bash
npm run db:schema:remote
```

已有数据库从旧版本升级时，不要重复初始化结构，只执行一次封面字段迁移：

```bash
npm run db:migrate:cover:remote
```

需要导入演示数据时再执行：

```bash
npm run db:seed:remote
```

`db:seed:remote` 会清空远程博客数据，正式站点通常不应执行。

部署 Worker：

```bash
npm run deploy
```
