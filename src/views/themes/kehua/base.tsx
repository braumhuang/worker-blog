import type { PropsWithChildren } from "hono/jsx";
import type { BlogMeta, OptionMap } from "../../../types";
import { themeAssetPath } from "../../../theme";
import { Header } from "./partials/header";
import { Footer } from "./partials/footer";

type BaseProps = PropsWithChildren<{
  options: OptionMap;
  title?: string;
  active?: string;
  canonical?: string;
  description?: string;
  categories?: BlogMeta[];
  tags?: BlogMeta[];
}>;

export function Base({
  options,
  title,
  active,
  canonical,
  description,
  categories = [],
  children,
}: BaseProps) {
  const fullTitle = title
    ? `${title} · ${options.site_title}`
    : options.site_title;
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="description"
          content={description || options.site_description}
        />
        <meta name="color-scheme" content="light dark" />
        <title>{fullTitle}</title>
        <link
          rel="icon"
          type="image/svg+xml"
          href={`/favicon.svg?v=${encodeURIComponent(`${options.favicon_text}-${options.favicon_color}`)}`}
        />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <link
          rel="alternate"
          type="application/atom+xml"
          title={`${options.site_title} Atom Feed`}
          href="/atom.xml"
        />
        <link rel="stylesheet" href={themeAssetPath("kehua", "public.css")} />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('blog-theme');if(t)document.documentElement.dataset.theme=t;else if(matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.dataset.theme='dark'}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Header options={options} active={active} categories={categories} />
        <main class="main">
          <div class="container">{children}</div>
        </main>
        <Footer options={options} />
        <button
          class="back-to-top"
          type="button"
          data-back-to-top
          aria-label="回到顶部"
        >
          <svg
            class="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
        <script src={themeAssetPath("kehua", "public.js")} defer></script>
      </body>
    </html>
  );
}

export function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header class="category-header">
      <h1 class="category-title">{title}</h1>
      {subtitle ? <p class="category-desc">{subtitle}</p> : null}
    </header>
  );
}
