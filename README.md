# worker-blog

`worker-blog` 是一个运行在 Cloudflare Workers 上的轻量博客系统。前台和后台均使用 Hono JSX 服务端渲染，D1 保存业务数据，R2 保存上传文件，Workers Static Assets 发布主题及后台静态资源，Worker 实例内的模块级内存对象缓存站点设置和后台会话。

项目适合个人博客、小型内容站点和 Cloudflare 全栈应用的学习与二次开发。

## 主要功能

- 文章、独立页面、闪念和定时发布
- Markdown 编辑、预览、快捷格式按钮和文章封面
- 分类、标签、归档、全文搜索和 Atom 订阅
- 文章及页面评论，前后台独立分页
- 可选 Cloudflare Turnstile 评论验证，点击发表评论时按需执行
- 基于 Cloudflare Destination Addresses 的新评论邮件提醒
- 前台导航管理，自带菜单与新增菜单分组
- 友链管理
- R2 附件上传、图片上传压缩、文章附件关联和附件模板
- 编辑器 Emoji 表情配置与图片表情插入
- JSON 数据导入、导出
- Kehua、Writecho、Printer、Vermillion、ChatGPT 五套前台主题
- 后台登录会话和站点设置缓存
- GitHub Actions 手动一键部署

## 技术栈

- Cloudflare Workers
- Hono + Hono JSX
- TypeScript
- Cloudflare D1
- Cloudflare R2
- Cloudflare Email Routing / Email Service
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
│   ├── comment-notification.ts    评论提醒邮箱校验与邮件内容
│   ├── db.ts                      D1 查询封装
│   ├── emojis.ts                  Emoji 默认值、校验和序列化
│   ├── favicon.ts                 动态 Favicon
│   ├── markdown.ts                Markdown 渲染
│   ├── navigation.ts              前台导航配置
│   ├── options.ts                 站点设置及默认值
│   ├── turnstile.ts               评论 Turnstile 服务端验证
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
        └── chatgpt/
static/
├── comments-turnstile.js          评论 Turnstile 按需加载与提交
├── admin/
│   ├── admin.css
│   ├── admin.js
│   └── image-compression.js       浏览器端图片压缩工具
├── kehua/
├── writecho/
├── printer/
├── vermillion/
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
  chatgpt: "ChatGPT",
} as const;
```

`blog_options.site_theme` 保存主题文件夹名。设置不存在、设置值无效或数据库读取失败时，默认使用 `kehua`。

内置主题定位：

- `kehua`：清爽的内容列表与阅读布局。
- `writecho`：文艺杂志式博客排版。
- `printer`：打字机与纸张风格。
- `vermillion`：朱砂宣纸期刊风格，包含罗马数字侧栏、标签墙、卷首、朱印、明暗模式、搜索、文章目录、阅读进度和闪念热力图。
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

## 图片上传压缩实现

后台图片上传在浏览器端、写入 R2 之前执行。`static/admin/image-compression.js` 提供实际压缩函数，`static/admin/admin.js` 在文章附件、封面、全局附件、头像和友链图标上传流程中统一调用。

- 设置值为 `1–100` 的整数，默认 `80`，`100` 直接上传原图；
- JPEG、WebP、AVIF 使用浏览器对应编码器的质量参数；
- PNG 因浏览器编码器通常忽略 `quality`，会先按质量值降低颜色精度，再重新编码为 PNG；
- 输出 MIME 类型与原文件不同、图片为动画、浏览器不支持重新编码或压缩后没有变小时，继续上传原文件；
- 上传状态会显示压缩前后的文件体积，便于确认压缩是否实际生效。

图片尺寸和文件扩展名保持不变；GIF 等无法在浏览器中可靠保持动画与原类型的格式不会强制转换。

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
7. 部署 Worker、Static Assets，并默认绑定 D1、R2 与 `BLOG_EMAIL` 发信服务。

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
- 一个用于 GitHub Actions 的 API Token；
- 启用评论提醒时，一个由 Cloudflare DNS 托管、用于发件地址的域名。

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

### 7. 配置 Turnstile 评论验证

评论功能可以选择接入 Cloudflare Turnstile。项目只把 Turnstile 用于评论提交，不影响文章浏览、评论列表读取或后台登录。只有后台的“Turnstile 站点密钥”和“Turnstile 私密密钥”同时存在时才启用验证；两项同时留空则保持原有评论流程。

当前实现采用按需执行模式：文章详情页不会立即请求 Cloudflare Turnstile API。用户点击评论表单的“发表评论”按钮后，浏览器才加载 Turnstile API，以显式渲染方式执行 `action=comment` 验证；得到 token 后再向 Worker 提交评论。Worker 必须通过 Siteverify 校验，并确认真实 Widget 返回的 `action` 为 `comment`，之后才会把评论写入 D1。使用 Cloudflare 官方始终成功测试私密密钥时，项目仅依据 Siteverify 的 `success=true` 放行该官方 dummy token，不额外要求 `action`；真实密钥仍严格要求 `action=comment`。

#### 7.1 创建 Turnstile Widget

1. 登录 Cloudflare Dashboard。
2. 进入 **Turnstile**，点击 **Add widget**。
3. Widget 名称可以填写 `worker-blog-comments`。
4. 在 Hostname Management 中加入博客实际使用的主机名，例如：

   ```text
   blog.example.com
   ```

   只填写主机名，不要包含 `https://`、端口、路径或通配符。使用 `workers.dev` 地址时，填写该 Worker 的实际主机名。

5. Widget mode 推荐选择 **Managed**，由 Cloudflare 根据访客风险决定是否需要交互。
6. 创建后复制 **Site Key** 和 **Secret Key**。Site Key 可以发送到浏览器；Secret Key 只能用于服务端 Siteverify。

Cloudflare 官方文档：

- <https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/>
- <https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/>

#### 7.2 在博客后台开启

先登录博客后台，进入：

```text
设置 → 开启评论功能
```

“开启评论功能”下方会显示一行两个等宽输入框：

| 后台设置           | 填写内容                     | 用途                              |
| ------------------ | ---------------------------- | --------------------------------- |
| Turnstile 站点密钥 | Cloudflare 提供的 Site Key   | 前端点击发表评论时创建验证组件    |
| Turnstile 私密密钥 | Cloudflare 提供的 Secret Key | Worker 调用 Siteverify 验证 token |

保存规则：

- 两项同时填写：开启评论 Turnstile；
- 两项同时留空：关闭评论 Turnstile；
- 只填写其中一项：后台拒绝保存并提示补全配置。

私密密钥保存在 D1 的 `blog_options` 中，不会传给前台，但会包含在后台导出的 JSON 数据中。请妥善保管导出文件，不要提交到公开仓库；在 Cloudflare 轮换 Secret Key 后，也需要立即更新后台设置。

#### 7.3 评论提交过程

启用后的请求顺序如下：

```text
用户填写评论
→ 点击“发表评论”
→ /comments-turnstile.js 拦截评论表单提交
→ 按需加载 challenges.cloudflare.com 上的 Turnstile API
→ 以 execution=execute、appearance=interaction-only 执行验证
→ 浏览器取得 action=comment 的一次性 token
→ POST /post/:slug/comments
→ Worker 调用 Siteverify
→ 验证 success=true 且 action=comment
→ 写入 blog_comments
→ 返回更新后的评论区
```

Siteverify 使用：

```text
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
```

请求包含私密密钥、浏览器生成的 token，并在可用时附带 `CF-Connecting-IP`。验证失败、token 缺失、token 过期或 token 被重复使用时，Worker 返回 `403`，评论不会写入数据库。

Turnstile token 只有五分钟有效期且只能验证一次。本项目在点击发表评论后才生成 token，并在当前提交中立即验证，避免访客长时间阅读文章导致提前生成的 token 过期。

Cloudflare 官方文档：

- <https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/>
- <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>

#### 7.4 测试与关闭

部署后建议分别完成下面的检查：

1. 打开一个已发布的文章详情页。
2. 填写名字、邮箱和评论内容。
3. 点击“发表评论”，确认按钮先显示“正在验证…”，随后显示“正在提交…”。
4. 确认评论成功写入，并在 Turnstile Analytics 中出现 Siteverify 数据。
5. 使用 `curl`、API 客户端或浏览器开发者工具重放评论 POST 请求，但不携带有效的 `cf-turnstile-response`，确认 Worker 返回 `403`。

需要临时关闭时，在后台同时清空两个 Turnstile 密钥并保存，不需要重新部署，也不需要修改 D1 表结构。

常见问题：

- **一直提示人机验证失败**：确认 Site Key 和 Secret Key 来自同一个 Widget。
- **组件报域名错误**：确认 Turnstile Widget 的 Hostname Management 已加入当前博客主机名。
- **本地开发失败**：使用 Cloudflare 官方测试密钥，或把本地主机名加入专门用于开发的 Widget；不要把生产 Secret Key 放入公开文件。
- **官方成功测试密钥仍返回 403**：确认私密密钥完整保存为 `1x0000000000000000000000000000000AA`，重新启动本地 Worker，并硬刷新文章页后再提交。项目只在精确识别到这一把官方测试私密密钥时跳过额外的 action 校验；真实密钥不会放行空 action。
- **日志出现 `timeout-or-duplicate`**：如果使用私密密钥 `3x0000000000000000000000000000000AA`，这是预期结果；这把密钥专门模拟 token 已使用，评论应返回 `403`。真实密钥下出现该错误，则表示 token 已过期或被重复验证。
- **浏览器无法加载验证**：确认网络、安全扩展或 CSP 没有阻止 `challenges.cloudflare.com`。
- **保存配置时报错**：两个密钥必须同时填写或同时清空。

本地成功测试组合：

```text
Turnstile 站点密钥：1x00000000000000000000AA
Turnstile 私密密钥：1x0000000000000000000000000000000AA
```

预期结果是评论成功写入。Cloudflare 文档示例中的测试响应包含 `action=test`，但某些本地执行环境可能返回空 action；项目仅在检测到上述官方测试私密密钥时跳过 action 校验，生产或自建 Widget 仍必须返回 `action=comment`。

模拟 token 已使用：

```text
Turnstile 站点密钥：1x00000000000000000000AA
Turnstile 私密密钥：3x0000000000000000000000000000000AA
```

预期结果是 Worker 返回 `403`，日志包含 `timeout-or-duplicate`。这是用于验证错误处理的失败用例，不是成功用例。

测试说明：

- <https://developers.cloudflare.com/turnstile/troubleshooting/testing/>

#### 7.5 多主题与新增主题

Kehua、Writecho、Printer、Vermillion 和 ChatGPT 五套内置主题的 `partials/comments.tsx` 均已接入相同流程。公共脚本 `/comments-turnstile.js` 负责按需加载 Turnstile、执行验证和提交评论，各主题原有的评论样式、评论分页和未启用 Turnstile 时的提交行为不变。

新增主题时，建议复制任一现有主题的评论组件，并保留下面的接口：

- `Comments` 组件接收 `turnstileSiteKey: string`；
- 评论表单包含 `data-comment-form`；
- 启用时给表单设置 `data-turnstile-sitekey`；
- 表单中包含名为 `cf-turnstile-response` 的隐藏输入框和 `data-turnstile-container` 容器；
- 评论区加载 `/comments-turnstile.js`。

关闭 JavaScript 的访客在启用 Turnstile 后无法提交评论，这是服务端强制验证的预期行为。

### 8. 配置评论邮件提醒

评论提醒使用 Cloudflare 的 `send_email` Worker Binding，并把后台配置的收件邮箱作为 Cloudflare **Destination Address** 使用。`wrangler.toml` 和 GitHub Actions 生成的部署配置默认包含 `BLOG_EMAIL` 绑定；只有后台同时填写“评论提醒发件邮箱”和“评论提醒收件邮箱”时，评论提交代码才会尝试发送邮件。

实际启用的绑定为：

```toml
[[send_email]]
name = "BLOG_EMAIL"
```

由于收件邮箱由后台设置决定，绑定没有写死 `destination_address`；Cloudflare 仍会校验目标邮箱必须是当前账户中已经验证的 Destination Address。两个后台邮箱任意一个留空时，评论只写入 D1，不调用 `BLOG_EMAIL.send()`。

#### 8.1 前置条件

- 发件域名必须使用 Cloudflare DNS；
- 发件域名需要启用 Email Routing 或完成 Email Service 域名接入；
- 收件邮箱必须在当前 Cloudflare 账户中添加为 Destination Address 并完成验证；
- 后台的“评论提醒发件邮箱”和“评论提醒收件邮箱”需要同时填写。

发送到已验证 Destination Address 的邮件不计入 Cloudflare Email Service 的月度和每日发送额度；仅启用 Email Routing 时也可以使用。

#### 8.2 在 Cloudflare 启用 Email Routing

1. 登录 Cloudflare Dashboard。
2. 进入：

   ```text
   Compute → Email Service → Email Routing
   ```

3. 点击 **Onboard Domain**，选择博客发件邮箱所属域名，例如 `example.com`。
4. 确认 Cloudflare 添加或提示添加的 MX、SPF 和 DKIM DNS 记录。
5. 等待域名状态变为可用。Cloudflare DNS 下通常几分钟完成，全球 DNS 传播最长可能需要 24 小时。

发件邮箱可以使用该域名下的地址，例如：

```text
notify@example.com
```

后台填写的发件邮箱必须属于已经接入的域名，不要填写 Gmail、QQ 邮箱等外部域名作为发件邮箱。

#### 8.3 添加并验证 Destination Address

1. 在 Cloudflare Dashboard 进入：

   ```text
   Compute → Email Service → Email Routing → Destination Addresses
   ```

2. 输入实际接收评论提醒的邮箱，例如 `owner@example.net`。
3. 打开 Cloudflare 发到该邮箱的验证邮件。
4. 点击验证链接，确认状态显示为 **Verified**。

Destination Addresses 在 Cloudflare 账户级别管理，同一账户中的多个域名和 Worker 可以复用。后台填写未验证的收件邮箱时，Cloudflare 会拒绝发送。

#### 8.4 部署 Email Binding

项目默认在 `wrangler.toml` 和 GitHub Actions 动态生成的配置中加入下面的绑定：

```toml
[[send_email]]
name = "BLOG_EMAIL"
```

GitHub Actions 用户直接重新运行部署工作流即可：

```text
Actions → Deploy Worker → Run workflow
```

手动部署用户确认 `wrangler.toml` 中存在该配置后执行 `npm run deploy`。不需要创建 API Key、SMTP 密码或新的 Worker Secret。若暂时不使用评论提醒，后台两个提醒邮箱保持为空即可，代码不会尝试发信。

#### 8.5 在博客后台填写邮箱

登录博客后台，进入：

```text
设置 → 开启评论功能
```

在其下方填写：

| 设置             | 示例                 | 要求                                                |
| ---------------- | -------------------- | --------------------------------------------------- |
| 评论提醒发件邮箱 | `notify@example.com` | 必须属于已启用 Email Routing / Email Service 的域名 |
| 评论提醒收件邮箱 | `owner@example.net`  | 必须是已验证的 Cloudflare Destination Address       |

保存后发布一条测试评论。提醒邮件包含文章标题、评论者姓名、邮箱、网站、评论正文和评论链接。评论会先写入 D1，邮件在后台异步发送；邮件发送失败不会导致访客评论提交失败，可在 Worker Logs 中查看 `发送评论提醒邮件失败` 日志。

#### 8.6 常见问题

- **评论保存但没有邮件**：检查两个邮箱是否都已填写、Worker 是否存在 `BLOG_EMAIL` 绑定，并查看 Worker Logs。
- **Destination address is not allowed / not verified**：到 Destination Addresses 页面完成收件邮箱验证。
- **Sender is not allowed**：发件邮箱不属于已接入 Cloudflare Email 的域名，或域名 DNS 配置尚未生效。
- **测试邮件进入垃圾箱**：检查垃圾邮件目录，并确认发件域名的 SPF、DKIM、DMARC 状态。
- **本地开发无法发送**：默认本地配置不会连接真实邮件服务；建议部署到 Cloudflare 后测试，避免开发时误发邮件。

Cloudflare 官方文档：

- <https://developers.cloudflare.com/email-service/get-started/route-emails/>
- <https://developers.cloudflare.com/email-service/configuration/send-bindings/>
- <https://developers.cloudflare.com/email-service/api/send-emails/workers-api/>
- <https://developers.cloudflare.com/email-service/platform/limits/>

### 9. 运行部署

进入 Fork 后仓库：

```text
Actions → Deploy Worker → Run workflow
```

项目使用完整 `schema.sql`，不使用 migrations。工作流每次都会执行 `CREATE TABLE IF NOT EXISTS` 和索引、触发器定义，但不会自动修改已经存在且结构不兼容的旧表。

### 10. 后台设置推荐

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

[[send_email]]
name = "BLOG_EMAIL"
```

项目默认保留 `send_email` 段。未在后台同时配置两个提醒邮箱时，评论流程不会调用邮件 binding。

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
