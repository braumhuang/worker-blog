import type { BlogMeta, OptionMap } from "../../../../types";
import { navigationItemsFromOptions } from "../../../../lib/navigation";
import { ThemeCloud, roman } from "./shared";

function SocialIcon({ name }: { name: "github" | "x" | "mail" | "rss" }) {
  if (name === "github")
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.6 11.6 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
      </svg>
    );
  if (name === "x")
    return (
      <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.2 2.3h3.3l-7.2 8.2 8.5 11.2h-6.6L11 14.9l-6 6.8H1.7l7.7-8.8L1.3 2.3h6.8l4.7 6.2 5.4-6.2Zm-1.1 17.5h1.8L7.1 4.1h-2l12 15.7Z" />
      </svg>
    );
  if (name === "mail")
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function normalizedUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function Rail({
  options,
  active,
  tags,
}: {
  options: OptionMap;
  active?: string;
  categories?: BlogMeta[];
  tags: BlogMeta[];
}) {
  const navigation = navigationItemsFromOptions(options).filter(
    (item) => item.visible,
  );
  const socials = [
    ["github", normalizedUrl(options.about_github || ""), "GitHub"],
    ["x", normalizedUrl(options.about_x || ""), "X"],
    [
      "mail",
      options.about_email ? `mailto:${options.about_email}` : "",
      "Email",
    ],
    ["rss", normalizedUrl(options.about_rss || "/atom.xml"), "RSS"],
  ] as const;
  return (
    <>
      <aside class="rail" id="vermillion-rail">
        <a href="/" class="brand" aria-label={options.site_title}>
          <div class="brand-mark">{options.site_title}</div>
        </a>
        <div class="brand-sub">纸面札记 · Paper Journal</div>
        <div class="rail-section">导览 / Index</div>
        {navigation.map((item, index) => (
          <a
            class={`nav-item${active === item.id ? " active" : ""}`}
            href={item.url}
            data-nav-link={item.url}
          >
            <span class="roman">{roman(index)}</span>
            {item.name}
          </a>
        ))}
        {tags.length ? (
          <>
            <div class="rail-section">标签 / Tags</div>
            <ThemeCloud tags={tags} />
          </>
        ) : null}
        {socials.some(([, href]) => href) ? (
          <>
            <div class="rail-section">联络 / Connect</div>
            <div class="rail-social">
              {socials.map(([name, href, title]) =>
                href ? (
                  <a
                    class="rail-social-link"
                    href={href}
                    target={name === "mail" ? undefined : "_blank"}
                    rel={name === "mail" ? undefined : "noopener noreferrer"}
                    title={title}
                    aria-label={title}
                  >
                    <SocialIcon name={name} />
                  </a>
                ) : null,
              )}
            </div>
          </>
        ) : null}
        <div class="rail-foot">
          Vermillion · 朱砂落纸
          <br />
          VOL. I · NO. 1<br />
          <span style="opacity:0.7">Powered by Worker Blog</span>
        </div>
      </aside>
      <button
        class="rail-toggle"
        type="button"
        aria-label="打开侧栏"
        title="导览"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div class="rail-backdrop" aria-hidden="true" />
    </>
  );
}
