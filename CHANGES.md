# 定点修改说明

- 回退到响应式修复版本的前后台结构，没有采用后续大规模仿制重构。
- 移除后台导航左上角 `Blog Admin`。
- 后台首项和面板页标题由“控制台”改为“面板”。
- 分类与标签页面：列表在左，新增/编辑表单在右；窄屏仍自动变为单列。
- 项目名称统一为 `worker-blog`。
- 首页品牌文字采用 Winston 静态站的 `font-size: 1.125rem`、`font-weight: 600`。
- 日夜切换、搜索和菜单按钮使用 Winston 静态站原有 SVG 路径。
- 移动端导航从顶栏内部拆出，使用独立 fixed 抽屉和 `width: 100vw`。
- 新增 `schema.sql`、`seed.sql`，删除 migrations。
- `seed.sql` 由 Winston 静态资源生成，作为开发模拟数据。
