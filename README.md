# worker-blog

`worker-blog` 是一个运行在 Cloudflare Workers 上的轻量个人博客，使用 Hono、Hono JSX、D1 和 R2 构建。

系统提供文章、页面、闪念、评论、分类、标签、附件、友链、搜索、深浅模式和响应式前台，并包含 Typecho 风格的内容管理后台。文章与页面支持定时发布、封面上传和评论；闪念使用独立时间轴、热力图与标签展示。

详细的数据结构、路由和实现说明见 [PROJECT.md](./PROJECT.md)。

## 本地运行

环境要求：Node.js 22 或更高版本、npm、Cloudflare Wrangler。

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:reset:local
npm run dev
```

访问地址：

- 前台：`http://localhost:8787/`
- 后台：`http://localhost:8787/admin`

管理员账号来自 `.dev.vars` 或 `wrangler.toml` 中的 `ADMIN_NAME` 和 `ADMIN_PSWD`。

`db:reset:local` 会执行 `schema.sql` 和 `seed.sql`。种子文件会清空博客业务数据并写入演示内容及 300 条模拟评论，只适合本地或全新测试数据库。

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

需要演示数据时再执行：

```bash
npm run db:seed:remote
```

`db:seed:remote` 会清空远程博客数据，正式站点通常不应执行。

部署 Worker：

```bash
npm run deploy
```
