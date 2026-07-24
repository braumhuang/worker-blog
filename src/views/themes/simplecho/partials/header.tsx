import type { BlogMeta, OptionMap } from "../../../../types";
import { navigationItemsFromOptions } from "../../../../lib/navigation";
import { publicAttachmentUrl } from "../../../../lib/utils";
import { Icon } from "./icons";

export function Header({
  options,
  active,
}: {
  options: OptionMap;
  active?: string;
  categories?: BlogMeta[];
}) {
  const navigation = navigationItemsFromOptions(options).filter((item) => item.visible);
  const avatar = options.about_avatar
    ? publicAttachmentUrl(options.about_avatar, options.file_cdn_url)
    : "";
  const initial = Array.from(options.site_title.trim())[0]?.toUpperCase() || "S";
  return (
    <nav class="sc-navbar" role="navigation" aria-label="主导航">
      <a class="sc-navbar-brand" href="/" aria-label={`${options.site_title} 首页`}>
        {avatar ? (
          <img class="sc-avatar" src={avatar} alt={options.site_title} loading="eager" />
        ) : (
          <span class="sc-avatar sc-avatar-fallback" aria-hidden="true">{initial}</span>
        )}
        <div>
          <div class="sc-site-name">{options.site_title || "Simplecho"}</div>
          {options.site_description ? <div class="sc-site-sub">{options.site_description}</div> : null}
        </div>
      </a>

      <button class="sc-navbar-toggler" type="button" id="sc-navbar-toggler" aria-controls="sc-navbar-collapse" aria-expanded="false" aria-label="切换导航">
        <Icon name="menu" />
      </button>

      <div class="sc-navbar-collapse" id="sc-navbar-collapse">
        <ul class="sc-nav">
          {navigation.map((item) => (
            <li class={`sc-nav-item${active === item.id ? " is-active" : ""}`}>
              <a href={item.url}>{item.id === "home" ? "🏠 " : ""}{item.name}</a>
            </li>
          ))}
        </ul>

        <div class="sc-palette-switcher" role="group" aria-label="切换配色">
          <button type="button" class="sc-palette-dot is-gray" data-sc-set-palette="gray" aria-label="银光灰" title="银光灰" />
          <button type="button" class="sc-palette-dot is-white" data-sc-set-palette="white" aria-label="简约白" title="简约白" />
          <button type="button" class="sc-palette-dot is-green" data-sc-set-palette="green" aria-label="墨草绿" title="墨草绿" />
          <button type="button" class="sc-palette-dot is-black" data-sc-set-palette="black" aria-label="暗夜黑" title="暗夜黑" />
        </div>

        <form class="sc-search-form" id="sc-search-form" role="search" autocomplete="off">
          <Icon name="search" className="sc-search-icon" />
          <input type="search" id="sc-search-input" class="sc-search-input" name="q" autocomplete="off" placeholder="搜索文章" />
          <div class="sc-search-results" id="sc-search-results" role="listbox" />
        </form>
      </div>
    </nav>
  );
}
