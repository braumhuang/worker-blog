# worker-blog

基于 Cloudflare Workers、D1、R2、Hono 和 Hono JSX 的个人博客项目。

前台包含首页、闪念、归档、标签、分类、友链导航、关于、文章详情、搜索、日夜模式和移动端全宽导航抽屉；后台包含文章、页面、闪念、分类、标签、附件、友链和系统配置管理。

## 本次版本基线

本项目以回退后的稳定界面版本为基础，仅进行了以下定点修改：

- 后台导航移除左上角 `Blog Admin`。
- 后台“控制台”改为“面板”。
- 分类、标签管理页面改为左侧列表、右侧新增或编辑表单。
- 项目、Worker、D1 和 R2 默认名称统一为 `worker-blog`。
- 首页左上角站点名称使用 Winston 静态站的字号与字重。
- 首页右侧日夜、搜索、菜单按钮使用 Winston 静态站中的 SVG 图标。
- 手机端导航使用独立抽屉，展开宽度固定为 `100vw`。
- 从 `winston.ink` 静态站生成 `seed.sql` 开发模拟数据。
- 开发阶段不使用 migrations，数据库由 `schema.sql` 和 `seed.sql` 初始化。

## 数据文件

### `schema.sql`

包含六张业务表、索引、外键和分类/标签计数触发器：

- `blog_contents`
- `blog_metas`
- `blog_relationships`
- `blog_options`
- `blog_cookies`
- `blog_links`

### `seed.sql`

由附件中的 Winston 静态站生成，包含：

- 34 篇文章和 1 个关于页面
- 6 条闪念
- 3 个分类
- 7 个标签及文章关联
- 5 条友链
- 16 条静态附件模拟记录
- Winston 站点名称、描述和分页配置

种子正文保留静态站中的 HTML 和 `<!-- more -->` 摘要标记。静态图片与附件 URL 指向原 Winston 站点，仅作为开发模拟数据；新上传的附件仍会进入项目配置的 R2 Bucket。

项目还保留了 `tools/generate_seed.py`，可以从解压后的 Winston 静态目录重新生成种子：

```bash
python tools/generate_seed.py /path/to/winston.ink -o seed.sql
```

生成脚本依赖 Python 与 BeautifulSoup 4；运行博客本身不需要 Python。

## 项目结构

```text
worker-blog/
├── schema.sql
├── seed.sql
├── tools/
│   └── generate_seed.py
├── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   ├── index.tsx
│   └── types.ts
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## 安装依赖

```bash
npm install
```

## 创建 Cloudflare 资源

创建 D1：

```bash
npx wrangler d1 create worker-blog
```

把返回的数据库 ID 写入 `wrangler.toml`：

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

## 配置管理员

开发阶段可以在 `wrangler.toml` 中配置：

```toml
[vars]
ADMIN_NAME = "admin"
ADMIN_PSWD = "请修改为强密码"
R2_PUBLIC_URL = ""
MAX_UPLOAD_MB = "25"
```

生产环境建议把密码改为 Worker Secret：

```bash
npx wrangler secret put ADMIN_PSWD
```

## 初始化开发数据库

创建结构并导入模拟数据：

```bash
npm run db:reset:local
```

也可以分开运行：

```bash
npm run db:schema:local
npm run db:seed:local
```

远程数据库：

```bash
npm run db:schema:remote
npm run db:seed:remote
```

`seed.sql` 会清空现有博客内容后重新导入模拟数据，不应在已有正式内容的生产数据库中运行。

## 本地运行

```bash
npm run dev
```

- 前台：`http://localhost:8787/`
- 后台：`http://localhost:8787/admin`
- 默认开发管理员：查看 `wrangler.toml` 中的 `ADMIN_NAME` 和 `ADMIN_PSWD`

## 部署

```bash
npm run deploy
```

## 常用命令

```bash
npm run typecheck
npm run cf-typegen
npm run db:reset:local
npm run db:schema:remote
npm run db:seed:remote
npm run deploy
```

## 登录与附件行为

- 登录 Cookie 在 D1 中保存 10 天。
- Cookie 剩余时间少于或等于 2 天时自动续期到 10 天。
- 图片上传后插入 Markdown 图片语法。
- 视频上传后插入 `<video>` 标签。
- 其他文件上传后插入下载链接。
- R2 文件代理支持视频 Range 请求。
