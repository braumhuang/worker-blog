export function LoginPage({
  error,
  returnTo,
}: {
  error?: string;
  returnTo: string;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>登录 · 博客后台</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="/admin/admin.css" />
      </head>
      <body class="login-page">
        <section class="login-box">
          <h1>登录到博客</h1>
          {error ? <div class="notice error">{error}</div> : null}
          <form method="post" action="/admin/login">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div class="field">
              <label for="name">用户名</label>
              <input
                class="input"
                id="name"
                name="name"
                autocomplete="username"
                required
                autofocus
              />
            </div>
            <div class="field">
              <label for="password">密码</label>
              <input
                class="input"
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
              />
            </div>
            <button class="button primary" type="submit">
              登录
            </button>
          </form>
        </section>
      </body>
    </html>
  );
}
