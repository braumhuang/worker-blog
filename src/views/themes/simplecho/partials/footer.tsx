import type { OptionMap } from "../../../../types";
import { Icon } from "./icons";

function normalized(value: string, email = false): string {
  const input = value.trim();
  if (!input) return "";
  if (email) return input.startsWith("mailto:") ? input : `mailto:${input}`;
  if (/^(https?:\/\/|\/)/i.test(input)) return input;
  return `https://${input}`;
}

export function Footer({ options }: { options: OptionMap }) {
  const social = [
    ["github", "GitHub", normalized(options.about_github || "")],
    ["x", "X", normalized(options.about_x || "")],
    ["rss", "RSS", normalized(options.about_rss || "/atom.xml")],
    ["mail", "邮箱", normalized(options.about_email || "", true)],
  ] as const;
  const footerInfo = options.footer_info.includes("/themes/kehua")
    ? "Simplecho · Simple + Echo"
    : options.footer_info;
  return (
    <footer class="sc-footer" role="contentinfo">
      <div class="sc-slogan">STAY VIBRANT</div>
      <div class="sc-social">
        <a href="/" aria-label="首页" title="首页"><Icon name="home" /></a>
        {social.map(([icon, label, href]) => href ? (
          <a href={href} target={icon === "mail" ? undefined : "_blank"} rel={icon === "mail" ? undefined : "noopener noreferrer"} aria-label={label} title={label}>
            <Icon name={icon} />
          </a>
        ) : null)}
      </div>
      <div class="sc-footer-info">
        © {new Date().getFullYear()} <a href="/">{options.site_title}</a>
        {footerInfo ? <><span> · </span><span dangerouslySetInnerHTML={{ __html: footerInfo }} /></> : null}
      </div>
      <div class="sc-footer-power">Simple + Echo = 💖</div>
    </footer>
  );
}
